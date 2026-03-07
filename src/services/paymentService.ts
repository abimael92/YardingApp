/**
 * Payment Service
 * Clean implementation using shared DB client and mapper
 */

import { sql } from '@/src/lib/db';
import { mapPaymentRow } from '@/src/lib/mappers/paymentMapper';

import type {
	Payment,
	EntityId,
	PaymentStatus,
	PaymentMethod,
	PaymentWithRelations,
} from '@/src/domain/entities';

export interface PaymentService {
	getAll(): Promise<Payment[]>;
	getById(id: EntityId): Promise<Payment | undefined>;
	getByClientId(clientId: EntityId): Promise<Payment[]>;
	getByJobId(jobId: EntityId): Promise<Payment[]>;
	getByStatus(status: PaymentStatus): Promise<Payment[]>;

	getWithRelations(id: EntityId): Promise<PaymentWithRelations | undefined>;

	getByDateRange(start: Date, end: Date): Promise<Payment[]>;
	getByMethod(method: PaymentMethod): Promise<Payment[]>;
	getRecent(limit?: number): Promise<Payment[]>;

	processPayment(id: EntityId): Promise<Payment | undefined>;
	refundPayment(
		id: EntityId,
		amount?: number,
		reason?: string,
	): Promise<Payment | undefined>;

	getTotalRevenue(start?: Date, end?: Date): Promise<number>;
	getRevenueByMonth(year: number): Promise<{ month: number; amount: number }[]>;

	getPaymentStats(): Promise<{
		total: number;
		completed: number;
		pending: number;
		failed: number;
		refunded: number;
		totalAmount: number;
		byMethod: Record<string, number>;
	}>;

	create(
		payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'updatedAt'>,
	): Promise<Payment>;

	update(id: EntityId, updates: Partial<Payment>): Promise<Payment | undefined>;

	delete(id: EntityId): Promise<boolean>;
}

export const paymentService: PaymentService = {
	async getAll() {
		const rows = await sql`
      SELECT * FROM payments
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getById(id) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE id = ${id}
    `;
		if (!rows.length) return undefined;
		return mapPaymentRow(rows[0]);
	},

	async getByClientId(clientId) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE client_id=${clientId}
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getByJobId(jobId) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE job_id=${jobId}
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getByStatus(status) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE status=${status}::payment_status
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getWithRelations(id) {
		const rows = await sql`
      SELECT
        p.*,
        json_build_object(
          'id',c.id,
          'name',c.name,
          'email',c.contact_info->>'email'
        ) AS client,
        json_build_object(
          'id',j.id,
          'jobNumber',j.job_number,
          'title',j.title,
          'status',j.status
        ) AS job,
        json_build_object(
          'id',i.id,
          'invoiceNumber',i.invoice_number,
          'total',i.total_cents,
          'status',i.status
        ) AS invoice
      FROM payments p
      LEFT JOIN clients c ON p.client_id=c.id
      LEFT JOIN jobs j ON p.job_id=j.id
      LEFT JOIN invoices i ON p.invoice_id=i.id
      WHERE p.id=${id}
    `;

		if (!rows.length) return undefined;

		return {
			payment: mapPaymentRow(rows[0]),
			client: rows[0].client,
			job: rows[0].job,
			invoice: rows[0].invoice,
		};
	},

	async getByDateRange(start, end) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE created_at BETWEEN ${start} AND ${end}
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getByMethod(method) {
		const rows = await sql`
      SELECT * FROM payments
      WHERE method=${method}::payment_method
      ORDER BY created_at DESC
    `;
		return rows.map(mapPaymentRow);
	},

	async getRecent(limit = 10) {
		const rows = await sql`
      SELECT * FROM payments
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
		return rows.map(mapPaymentRow);
	},

	async processPayment(id) {
		const updated = await sql`
      UPDATE payments
      SET
        status='processing',
        processed_at=NOW(),
        updated_at=NOW()
      WHERE id=${id}
      AND status='pending'
      RETURNING id
    `;

		if (!updated.length) return undefined;

		await sql`
      UPDATE payments
      SET
        status='completed',
        completed_at=NOW(),
        updated_at=NOW()
      WHERE id=${id}
    `;

		return this.getById(id);
	},

	async refundPayment(id, amount, reason) {
		const payment = await this.getById(id);
		if (!payment) return undefined;

		const refundAmount = amount ?? payment.amount.amount;
		const refundCents = refundAmount * 100;

		const status =
			refundAmount < payment.amount.amount ? 'partially_refunded' : 'refunded';

		await sql`
      UPDATE payments
      SET
        status=${status}::payment_status,
        refund_amount_cents=${refundCents},
        refund_reason=${reason ?? null},
        refunded_at=NOW(),
        updated_at=NOW()
      WHERE id=${id}
    `;

		return this.getById(id);
	},

	async getTotalRevenue(start?, end?) {
		if (!start && !end) {
			const r = await sql`
        SELECT COALESCE(SUM(amount_cents),0) total
        FROM payments
        WHERE status='completed'
      `;
			return Number(r[0].total) / 100;
		}

		const r = await sql`
      SELECT COALESCE(SUM(amount_cents),0) total
      FROM payments
      WHERE status='completed'
      AND completed_at BETWEEN
        ${start ?? new Date(0)}
        AND
        ${end ?? new Date()}
    `;
		return Number(r[0].total) / 100;
	},

	async getRevenueByMonth(year) {
		const rows = await sql`
      SELECT
        EXTRACT(MONTH FROM completed_at) m,
        SUM(amount_cents) total
      FROM payments
      WHERE status='completed'
      AND EXTRACT(YEAR FROM completed_at)=${year}
      GROUP BY m
      ORDER BY m
    `;

		const months = Array.from({ length: 12 }, (_, i) => ({
			month: i + 1,
			amount: 0,
		}));

		rows.forEach((r) => {
			months[Number(r.m) - 1].amount = Number(r.total) / 100;
		});

		return months;
	},

	async getPaymentStats() {
		const stats = await sql`
      SELECT
        COUNT(*) total,
        COUNT(*) FILTER (WHERE status='completed') completed,
        COUNT(*) FILTER (WHERE status='pending') pending,
        COUNT(*) FILTER (WHERE status='failed') failed,
        COUNT(*) FILTER (WHERE status='refunded') refunded,
        COALESCE(SUM(amount_cents) FILTER (WHERE status='completed'),0) total_amount
      FROM payments
    `;

		const methods = await sql`
      SELECT method,COUNT(*) count
      FROM payments
      GROUP BY method
    `;

		const byMethod: Record<string, number> = {};

		methods.forEach((m) => {
			byMethod[m.method] = Number(m.count);
		});

		return {
			total: Number(stats[0].total),
			completed: Number(stats[0].completed),
			pending: Number(stats[0].pending),
			failed: Number(stats[0].failed),
			refunded: Number(stats[0].refunded),
			totalAmount: Number(stats[0].total_amount) / 100,
			byMethod,
		};
	},

	async create(payment) {
		const seq = await sql`
      SELECT nextval('payment_number_seq') num
    `;

		const number = `PAY-${seq[0].num}`;

		const inserted = await sql`
      INSERT INTO payments(
        id,
        payment_number,
        client_id,
        invoice_id,
        job_id,
        contract_id,
        status,
        method,
        amount_cents,
        currency,
        notes,
        created_at,
        updated_at
      )
      VALUES(
        gen_random_uuid(),
        ${number},
        ${payment.clientId},
        ${payment.invoiceId ?? null},
        ${payment.jobId ?? null},
        ${payment.contractId ?? null},
        ${payment.status}::payment_status,
        ${payment.method}::payment_method,
        ${payment.amount.amount * 100},
        ${payment.amount.currency},
        ${payment.notes ?? null},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

		return this.getById(inserted[0].id) as Promise<Payment>;
	},

	async update(id, updates) {
		await sql`
      UPDATE payments
      SET
        status=COALESCE(${updates.status}::payment_status,status),
        method=COALESCE(${updates.method}::payment_method,method),
        notes=COALESCE(${updates.notes},notes),
        receipt_url=COALESCE(${updates.receiptUrl},receipt_url),
        updated_at=NOW()
      WHERE id=${id}
    `;

		return this.getById(id);
	},

	async delete(id) {
		const row = await sql`
      SELECT status FROM payments
      WHERE id=${id}
    `;

		if (!row.length) return false;

		if (!['pending', 'failed'].includes(row[0].status))
			throw new Error('Cannot delete completed payments');

		const r = await sql`
      DELETE FROM payments
      WHERE id=${id}
      RETURNING id
    `;

		return r.length > 0;
	},
};

export const getPayments = () => paymentService.getAll();

export const getPaymentById = (id: EntityId) => paymentService.getById(id);

export const getPaymentsByClientId = (clientId: EntityId) =>
	paymentService.getByClientId(clientId);

export const getPaymentsByClient = getPaymentsByClientId;

export const getPaymentsByJobId = (jobId: EntityId) =>
	paymentService.getByJobId(jobId);

export const createPayment = (
	payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'updatedAt'>,
) => paymentService.create(payment);

export const updatePayment = (id: EntityId, updates: Partial<Payment>) =>
	paymentService.update(id, updates);

export const deletePayment = (id: EntityId) => paymentService.delete(id);