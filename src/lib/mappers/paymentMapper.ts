import { Payment } from '@/src/domain/entities';

export function mapPaymentRow(p: any): Payment {
	return {
		id: p.id,
		paymentNumber: p.payment_number,

		clientId: p.client_id,
		invoiceId: p.invoice_id ?? undefined,
		jobId: p.job_id ?? undefined,
		contractId: p.contract_id ?? undefined,

		status: p.status,
		method: p.method,

		amount: {
			amount: Number(p.amount_cents) / 100,
			currency: p.currency || 'USD',
		},

		transactionId: p.transaction_id ?? undefined,
		processor: p.processor ?? undefined,
		processorResponse: p.processor_response ?? undefined,
		paymentMethodId: p.payment_method_id ?? undefined,

		notes: p.notes ?? undefined,
		receiptUrl: p.receipt_url ?? undefined,

		refundAmount: p.refund_amount_cents
			? {
					amount: Number(p.refund_amount_cents) / 100,
					currency: p.currency || 'USD',
				}
			: undefined,

		refundReason: p.refund_reason ?? undefined,

		createdAt: p.created_at,
		updatedAt: p.updated_at,
		processedAt: p.processed_at ?? undefined,
		completedAt: p.completed_at ?? undefined,
		failedAt: p.failed_at ?? undefined,
		failureReason: p.failure_reason ?? undefined,
		refundedAt: p.refunded_at ?? undefined,

		activityLogIds: [],
	};
}
