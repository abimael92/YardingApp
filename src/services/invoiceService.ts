/**
 * Invoice Service
 *
 * Service layer for invoice management operations using real database.
 */

import { neon } from '@neondatabase/serverless';
import type {
	EntityId,
	Invoice,
	InvoiceLineItem,
	InvoiceStatus,
	InvoiceWithRelations,
	Money,
} from '@/src/domain/entities';

// ============================================================================
// Service Interface
// ============================================================================

export interface InvoiceService {
	// Basic CRUD
	getAll(): Promise<Invoice[]>;
	getById(id: EntityId): Promise<Invoice | undefined>;
	getByClientId(clientId: EntityId): Promise<Invoice[]>;
	getByJobId(jobId: EntityId): Promise<Invoice[]>;
	getByStatus(status: InvoiceStatus): Promise<Invoice[]>;

	// Advanced Queries
	getWithRelations(id: EntityId): Promise<InvoiceWithRelations | undefined>;
	getByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]>;
	getDueInDays(days: number): Promise<Invoice[]>;
	getOverdue(): Promise<Invoice[]>;
	getRecent(limit?: number): Promise<Invoice[]>;

	// Status Management
	markAsSent(id: EntityId): Promise<Invoice | undefined>;
	markAsPaid(id: EntityId, paymentId?: EntityId): Promise<Invoice | undefined>;
	markAsOverdue(id: EntityId): Promise<Invoice | undefined>;
	markAsCancelled(id: EntityId, reason?: string): Promise<Invoice | undefined>;

	// Statistics
	getTotalOutstanding(): Promise<number>;
	getTotalPaid(): Promise<number>;
	getInvoiceStats(): Promise<{
		total: number;
		draft: number;
		sent: number;
		paid: number;
		overdue: number;
		cancelled: number;
		totalOutstanding: number;
		totalPaid: number;
	}>;

	// CRUD Operations
	create(
		invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>,
	): Promise<Invoice>;
	update(id: EntityId, updates: Partial<Invoice>): Promise<Invoice | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const invoiceService: InvoiceService = {
	getAll: async () => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT 
        i.id,
        i.invoice_number as "invoiceNumber",
        i.client_id as "clientId",
        i.job_id as "jobId",
        i.quote_id as "quoteId",
        i.contract_id as "contractId",
        i.status,
        i.subtotal_cents as "subtotalCents",
        i.tax_cents as "taxCents",
        i.discount_cents as "discountCents",
        i.total_cents as "totalCents",
        i.balance_cents as "balanceCents",
        i.currency,
        i.issue_date as "issueDate",
        i.due_date as "dueDate",
        i.paid_at as "paidAt",
        i.last_reminder_sent as "lastReminderSent",
        i.payment_terms as "paymentTerms",
        i.payment_instructions as "paymentInstructions",
        i.late_fee_cents as "lateFeeCents",
        i.pdf_url as "pdfUrl",
        i.notes,
        i.created_at as "createdAt",
        i.updated_at as "updatedAt",
        i.sent_at as "sentAt",
        json_agg(
          json_build_object(
            'id', il.id,
            'description', il.description,
            'quantity', il.quantity,
            'unitPriceCents', il.unit_price_cents,
            'totalCents', il.total_cents,
            'type', il.type,
            'referenceId', il.reference_id
          )
        ) FILTER (WHERE il.id IS NOT NULL) as line_items,
        array_agg(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL) as payment_ids
      FROM invoices i
      LEFT JOIN invoice_line_items il ON i.id = il.invoice_id
      LEFT JOIN payments p ON i.id = p.invoice_id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `;

		return invoices.map((inv) => ({
			id: inv.id,
			invoiceNumber: inv.invoiceNumber,
			clientId: inv.clientId,
			jobId: inv.jobId,
			quoteId: inv.quoteId,
			contractId: inv.contractId,
			status: inv.status,
			lineItems: (inv.line_items || []).map((item: any) => ({
				id: item.id,
				description: item.description,
				quantity: Number(item.quantity),
				unitPrice: {
					amount: Number(item.unitPriceCents || 0) / 100,
					currency: inv.currency || 'USD',
				},
				total: {
					amount: Number(item.totalCents || 0) / 100,
					currency: inv.currency || 'USD',
				},
				type: item.type,
				referenceId: item.referenceId,
			})),
			subtotal: {
				amount: Number(inv.subtotalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			tax: {
				amount: Number(inv.taxCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			discount: inv.discountCents
				? {
						amount: Number(inv.discountCents) / 100,
						currency: inv.currency || 'USD',
					}
				: undefined,
			total: {
				amount: Number(inv.totalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			balance: {
				amount: Number(inv.balanceCents || inv.totalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			issueDate: inv.issueDate,
			dueDate: inv.dueDate,
			paidAt: inv.paidAt,
			lastReminderSent: inv.lastReminderSent,
			paymentTerms: inv.paymentTerms,
			paymentInstructions: inv.paymentInstructions,
			lateFee: inv.lateFeeCents
				? {
						amount: Number(inv.lateFeeCents) / 100,
						currency: inv.currency || 'USD',
					}
				: undefined,
			paymentIds: inv.payment_ids || [],
			pdfUrl: inv.pdfUrl,
			notes: inv.notes,
			createdAt: inv.createdAt,
			updatedAt: inv.updatedAt,
			sentAt: inv.sentAt,
		})) as Invoice[];
	},

	getById: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT 
        i.id,
        i.invoice_number as "invoiceNumber",
        i.client_id as "clientId",
        i.job_id as "jobId",
        i.quote_id as "quoteId",
        i.contract_id as "contractId",
        i.status,
        i.subtotal_cents as "subtotalCents",
        i.tax_cents as "taxCents",
        i.discount_cents as "discountCents",
        i.total_cents as "totalCents",
        i.balance_cents as "balanceCents",
        i.currency,
        i.issue_date as "issueDate",
        i.due_date as "dueDate",
        i.paid_at as "paidAt",
        i.last_reminder_sent as "lastReminderSent",
        i.payment_terms as "paymentTerms",
        i.payment_instructions as "paymentInstructions",
        i.late_fee_cents as "lateFeeCents",
        i.pdf_url as "pdfUrl",
        i.notes,
        i.created_at as "createdAt",
        i.updated_at as "updatedAt",
        i.sent_at as "sentAt",
        json_agg(
          json_build_object(
            'id', il.id,
            'description', il.description,
            'quantity', il.quantity,
            'unitPriceCents', il.unit_price_cents,
            'totalCents', il.total_cents,
            'type', il.type,
            'referenceId', il.reference_id
          )
        ) FILTER (WHERE il.id IS NOT NULL) as line_items,
        array_agg(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL) as payment_ids
      FROM invoices i
      LEFT JOIN invoice_line_items il ON i.id = il.invoice_id
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.id = ${id}
      GROUP BY i.id
    `;

		if (invoices.length === 0) return undefined;

		const inv = invoices[0];
		return {
			id: inv.id,
			invoiceNumber: inv.invoiceNumber,
			clientId: inv.clientId,
			jobId: inv.jobId,
			quoteId: inv.quoteId,
			contractId: inv.contractId,
			status: inv.status,
			lineItems: (inv.line_items || []).map((item: any) => ({
				id: item.id,
				description: item.description,
				quantity: Number(item.quantity),
				unitPrice: {
					amount: Number(item.unitPriceCents || 0) / 100,
					currency: inv.currency || 'USD',
				},
				total: {
					amount: Number(item.totalCents || 0) / 100,
					currency: inv.currency || 'USD',
				},
				type: item.type,
				referenceId: item.referenceId,
			})),
			subtotal: {
				amount: Number(inv.subtotalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			tax: {
				amount: Number(inv.taxCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			discount: inv.discountCents
				? {
						amount: Number(inv.discountCents) / 100,
						currency: inv.currency || 'USD',
					}
				: undefined,
			total: {
				amount: Number(inv.totalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			balance: {
				amount: Number(inv.balanceCents || inv.totalCents || 0) / 100,
				currency: inv.currency || 'USD',
			},
			issueDate: inv.issueDate,
			dueDate: inv.dueDate,
			paidAt: inv.paidAt,
			lastReminderSent: inv.lastReminderSent,
			paymentTerms: inv.paymentTerms,
			paymentInstructions: inv.paymentInstructions,
			lateFee: inv.lateFeeCents
				? {
						amount: Number(inv.lateFeeCents) / 100,
						currency: inv.currency || 'USD',
					}
				: undefined,
			paymentIds: inv.payment_ids || [],
			pdfUrl: inv.pdfUrl,
			notes: inv.notes,
			createdAt: inv.createdAt,
			updatedAt: inv.updatedAt,
			sentAt: inv.sentAt,
		} as Invoice;
	},

	getByClientId: async (clientId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => i.clientId === clientId);
	},

	getByJobId: async (jobId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE job_id = ${jobId}
      ORDER BY created_at DESC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => i.jobId === jobId);
	},

	getByStatus: async (status: InvoiceStatus) => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE status = ${status}::invoice_status
      ORDER BY created_at DESC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => i.status === status);
	},

	getWithRelations: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const invoices = await sql`
      SELECT 
        i.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.contact_info->>'email',
          'phone', c.contact_info->>'phone'
        ) as client,
        json_build_object(
          'id', j.id,
          'jobNumber', j.job_number,
          'title', j.title,
          'status', j.status
        ) as job,
        json_build_object(
          'id', ct.id,
          'contractNumber', ct.contract_number,
          'title', ct.title,
          'status', ct.status
        ) as contract,
        json_agg(
          json_build_object(
            'id', p.id,
            'paymentNumber', p.payment_number,
            'amount', p.amount_cents,
            'status', p.status
          )
        ) FILTER (WHERE p.id IS NOT NULL) as payments
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      LEFT JOIN contracts ct ON i.contract_id = ct.id
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.id = ${id}
      GROUP BY i.id, c.id, j.id, ct.id
    `;

		if (invoices.length === 0) return undefined;

		const invoice = invoices[0];
		return {
			invoice: (await invoiceService.getById(id)) as Invoice,
			client: invoice.client,
			job: invoice.job,
			contract: invoice.contract,
			payments: invoice.payments?.filter(Boolean) || [],
		} as InvoiceWithRelations;
	},

	getByDateRange: async (startDate: Date, endDate: Date) => {
		const sql = neon(process.env.DATABASE_URL!);
		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE issue_date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      ORDER BY issue_date DESC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => {
			const issueDate = new Date(i.issueDate);
			return issueDate >= startDate && issueDate <= endDate;
		});
	},

	getDueInDays: async (days: number) => {
		const sql = neon(process.env.DATABASE_URL!);
		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() + days);

		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE due_date <= ${targetDate.toISOString()}
        AND status NOT IN ('paid', 'cancelled')
      ORDER BY due_date ASC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => {
			const dueDate = new Date(i.dueDate);
			return (
				dueDate <= targetDate && i.status !== 'paid' && i.status !== 'cancelled'
			);
		});
	},

	getOverdue: async () => {
		const sql = neon(process.env.DATABASE_URL!);
		const now = new Date().toISOString();

		const invoices = await sql`
      SELECT * FROM invoices 
      WHERE due_date < ${now}
        AND status NOT IN ('paid', 'cancelled')
      ORDER BY due_date ASC
    `;

		const allInvoices = await invoiceService.getAll();
		return allInvoices.filter((i) => {
			const dueDate = new Date(i.dueDate);
			return (
				dueDate < new Date() && i.status !== 'paid' && i.status !== 'cancelled'
			);
		});
	},

	getRecent: async (limit = 10) => {
		const allInvoices = await invoiceService.getAll();
		return allInvoices.slice(0, limit);
	},

	markAsSent: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE invoices 
      SET 
        status = 'sent'::invoice_status,
        sent_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		return invoiceService.getById(id);
	},

	markAsPaid: async (id: EntityId, paymentId?: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const invoice = await invoiceService.getById(id);
		if (!invoice) return undefined;

		const updated = await sql`
      UPDATE invoices 
      SET 
        status = 'paid'::invoice_status,
        paid_at = NOW(),
        balance_cents = 0,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		// Link payment if provided
		if (paymentId) {
			await sql`
        UPDATE payments 
        SET invoice_id = ${id}
        WHERE id = ${paymentId}
      `;
		}

		return invoiceService.getById(id);
	},

	markAsOverdue: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE invoices 
      SET 
        status = 'overdue'::invoice_status,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		return invoiceService.getById(id);
	},

	markAsCancelled: async (id: EntityId, reason?: string) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE invoices 
      SET 
        status = 'cancelled'::invoice_status,
        notes = CASE 
          WHEN notes IS NULL THEN ${reason}
          ELSE notes || E'\n\nCancelled: ' || ${reason || 'No reason provided'}
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		return invoiceService.getById(id);
	},

	getTotalOutstanding: async () => {
		const sql = neon(process.env.DATABASE_URL!);

		const result = await sql`
      SELECT COALESCE(SUM(total_cents), 0) as total
      FROM invoices
      WHERE status NOT IN ('paid', 'cancelled')
    `;

		return Number(result[0]?.total || 0) / 100;
	},

	getTotalPaid: async () => {
		const sql = neon(process.env.DATABASE_URL!);

		const result = await sql`
      SELECT COALESCE(SUM(total_cents), 0) as total
      FROM invoices
      WHERE status = 'paid'
    `;

		return Number(result[0]?.total || 0) / 100;
	},

	getInvoiceStats: async () => {
		const sql = neon(process.env.DATABASE_URL!);

		const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'paid') as paid,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COALESCE(SUM(CASE WHEN status NOT IN ('paid', 'cancelled') THEN total_cents ELSE 0 END), 0) as total_outstanding,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_cents ELSE 0 END), 0) as total_paid
      FROM invoices
    `;

		const result = stats[0] || {};
		return {
			total: Number(result.total) || 0,
			draft: Number(result.draft) || 0,
			sent: Number(result.sent) || 0,
			paid: Number(result.paid) || 0,
			overdue: Number(result.overdue) || 0,
			cancelled: Number(result.cancelled) || 0,
			totalOutstanding: Number(result.total_outstanding || 0) / 100,
			totalPaid: Number(result.total_paid || 0) / 100,
		};
	},

	create: async (invoice) => {
		const sql = neon(process.env.DATABASE_URL!);

		// Generate invoice number
		const nextNum = await sql`SELECT nextval('invoice_number_seq') as num`;
		const invoiceNumber = `INV-${nextNum[0].num}`;

		// Start transaction
		const client = await (async () => {
			// Insert invoice
			const newInvoice = await sql`
        INSERT INTO invoices (
          id, invoice_number, client_id, job_id, quote_id, contract_id,
          status, subtotal_cents, tax_cents, discount_cents, total_cents,
          balance_cents, currency, issue_date, due_date, payment_terms,
          payment_instructions, late_fee_cents, pdf_url, notes,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${invoiceNumber},
          ${invoice.clientId},
          ${invoice.jobId || null},
          ${invoice.quoteId || null},
          ${invoice.contractId || null},
          ${invoice.status}::invoice_status,
          ${invoice.subtotal.amount * 100},
          ${invoice.tax.amount * 100},
          ${invoice.discount ? invoice.discount.amount * 100 : null},
          ${invoice.total.amount * 100},
          ${invoice.total.amount * 100},
          ${invoice.total.currency || 'USD'},
          ${invoice.issueDate},
          ${invoice.dueDate},
          ${invoice.paymentTerms || null},
          ${invoice.paymentInstructions || null},
          ${invoice.lateFee ? invoice.lateFee.amount * 100 : null},
          ${invoice.pdfUrl || null},
          ${invoice.notes || null},
          NOW(),
          NOW()
        )
        RETURNING id
      `;

			const invoiceId = newInvoice[0].id;

			// Insert line items
			for (const item of invoice.lineItems) {
				await sql`
          INSERT INTO invoice_line_items (
            id, invoice_id, description, quantity,
            unit_price_cents, total_cents, type, reference_id
          ) VALUES (
            gen_random_uuid(),
            ${invoiceId},
            ${item.description},
            ${item.quantity},
            ${item.unitPrice.amount * 100},
            ${item.total.amount * 100},
            ${item.type}::line_item_type,
            ${item.referenceId || null}
          )
        `;
			}

			return invoiceId;
		})();

		return invoiceService.getById(client) as Promise<Invoice>;
	},

	update: async (id, updates) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE invoices 
      SET 
        status = COALESCE(${updates.status}::invoice_status, status),
        due_date = COALESCE(${updates.dueDate}, due_date),
        payment_terms = COALESCE(${updates.paymentTerms}, payment_terms),
        payment_instructions = COALESCE(${updates.paymentInstructions}, payment_instructions),
        pdf_url = COALESCE(${updates.pdfUrl}, pdf_url),
        notes = COALESCE(${updates.notes}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		return invoiceService.getById(id);
	},

	delete: async (id) => {
		const sql = neon(process.env.DATABASE_URL!);

		// Check if invoice can be deleted (only draft)
		const check = await sql`
      SELECT status FROM invoices WHERE id = ${id}
    `;

		if (check.length === 0) return false;

		const status = check[0].status;
		if (status !== 'draft') {
			throw new Error('Only draft invoices can be deleted');
		}

		// Delete line items first
		await sql`DELETE FROM invoice_line_items WHERE invoice_id = ${id}`;

		// Then delete invoice
		const result =
			await sql`DELETE FROM invoices WHERE id = ${id} RETURNING id`;

		return result.length > 0;
	},
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getInvoices = () => invoiceService.getAll();
export const getInvoiceById = (id: EntityId) => invoiceService.getById(id);
export const getInvoicesByClientId = (clientId: EntityId) =>
	invoiceService.getByClientId(clientId);
export const getInvoicesByJobId = (jobId: EntityId) =>
	invoiceService.getByJobId(jobId);
export const getInvoicesByStatus = (status: InvoiceStatus) =>
	invoiceService.getByStatus(status);
export const getInvoiceWithRelations = (id: EntityId) =>
	invoiceService.getWithRelations(id);
export const getInvoicesByDateRange = (startDate: Date, endDate: Date) =>
	invoiceService.getByDateRange(startDate, endDate);
export const getInvoicesDueInDays = (days: number) =>
	invoiceService.getDueInDays(days);
export const getOverdueInvoices = () => invoiceService.getOverdue();
export const getRecentInvoices = (limit?: number) =>
	invoiceService.getRecent(limit);
export const markInvoiceAsSent = (id: EntityId) =>
	invoiceService.markAsSent(id);
export const markInvoiceAsPaid = (id: EntityId, paymentId?: EntityId) =>
	invoiceService.markAsPaid(id, paymentId);
export const markInvoiceAsOverdue = (id: EntityId) =>
	invoiceService.markAsOverdue(id);
export const markInvoiceAsCancelled = (id: EntityId, reason?: string) =>
	invoiceService.markAsCancelled(id, reason);
export const getTotalOutstanding = () => invoiceService.getTotalOutstanding();
export const getTotalPaid = () => invoiceService.getTotalPaid();
export const getInvoiceStats = () => invoiceService.getInvoiceStats();
export const createInvoice = (
	invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>,
) => invoiceService.create(invoice);
export const updateInvoice = (id: EntityId, updates: Partial<Invoice>) =>
	invoiceService.update(id, updates);
export const deleteInvoice = (id: EntityId) => invoiceService.delete(id);
