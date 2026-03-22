import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await getServerSession();
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const clientId = params.id;

		// Get client to get email for quote_requests
		const client = await prisma.clients.findUnique({
			where: { id: clientId },
			select: { email: true },
		});

		// Get latest job (completed or any)
		const latestJob = await prisma.jobs.findFirst({
			where: { client_id: clientId },
			orderBy: { created_at: 'desc' },
			take: 1,
			select: {
				id: true,
				job_number: true,
				title: true,
				description: true,
				status: true,
				quoted_price_cents: true,
				completed_at: true,
				created_at: true,
			},
		});

		// Get latest invoice
		const latestInvoice = await prisma.invoices.findFirst({
			where: { client_id: clientId },
			orderBy: { created_at: 'desc' },
			take: 1,
			select: {
				id: true,
				invoice_number: true,
				amount_cents: true,
				total_cents: true,
				due_date: true,
				status: true,
			},
		});

		// Get latest quote request using client email
		const latestQuoteRequest = client?.email
			? await prisma.quote_requests.findFirst({
					where: { client_email: client.email },
					orderBy: { created_at: 'desc' },
					take: 1,
					select: {
						id: true,
						min_cents: true,
						max_cents: true,
						created_at: true,
						status: true,
					},
				})
			: null;

		return NextResponse.json({
			latestJob: latestJob
				? {
						id: latestJob.id,
						job_number: latestJob.job_number,
						title: latestJob.title,
						description: latestJob.description,
						completed_date: latestJob.completed_at,
						created_date: latestJob.created_at,
						status: latestJob.status,
						total: latestJob.quoted_price_cents,
					}
				: null,
			latestInvoice: latestInvoice
				? {
						id: latestInvoice.id,
						invoice_number: latestInvoice.invoice_number,
						amount_cents: latestInvoice.amount_cents,
						due_date: latestInvoice.due_date,
						status: latestInvoice.status,
					}
				: null,
			latestQuote: latestQuoteRequest
				? {
						id: latestQuoteRequest.id,
						min_amount: latestQuoteRequest.min_cents,
						max_amount: latestQuoteRequest.max_cents,
						created_date: latestQuoteRequest.created_at,
						status: latestQuoteRequest.status,
					}
				: null,
			upcomingAppointment: null, // No schedule table in your schema
		});
	} catch (error) {
		console.error('Failed to fetch client data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch client data' },
			{ status: 500 },
		);
	}
}
