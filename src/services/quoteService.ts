/**
 * Quote → Job conversion (server-only).
 * Import only from Server Actions or RSC — never from client components.
 */

import { prisma } from "@/app/lib/prisma"

export type JobSiteAddress = {
	street: string
	city: string
	state: string
	zip_code: string
}

function buildJobDescription(q: {
	service_name: string
	project_type: string
	zone: string
	hours: number
	sqft: number
	visits: number
	extras: string | null
}): string {
	const parts = [
		`Service: ${q.service_name}`,
		`Project type: ${q.project_type}`,
		`Zone: ${q.zone}`,
		`Hours: ${q.hours}, Sq ft: ${q.sqft}, Visits: ${q.visits}`,
	]
	if (q.extras) parts.push(`Extras: ${q.extras}`)
	return parts.join("\n")
}

/**
 * 1. Sets quote_requests.status to `reviewed`.
 * 2. Creates or reuses client by email.
 * 3. Inserts jobs row linked via quote_request_id (status `quoted`).
 */
export async function convertToJob(
	quoteId: string,
	address: JobSiteAddress,
): Promise<
	| { success: true; jobId: string; alreadyExisted: boolean }
	| { success: false; error: string }
> {
	const street = address.street.trim()
	const city = address.city.trim()
	const state = address.state.trim()
	const zip = address.zip_code.trim()
	if (!street || !city || !state || !zip) {
		return { success: false, error: "Job site address is required (street, city, state, ZIP)." }
	}

	const quote = await prisma.quote_requests.findUnique({ where: { id: quoteId } })
	if (!quote) return { success: false, error: "Quote request not found." }

	if (quote.status !== "pending" && quote.status !== "reviewed") {
		return {
			success: false,
			error: "Only pending or reviewed quotes can be converted to a job.",
		}
	}

	const existing = await prisma.jobs.findFirst({
		where: { quote_request_id: quoteId, deleted_at: null },
		select: { id: true },
	})
	if (existing) {
		await prisma.quote_requests.update({
			where: { id: quoteId },
			data: { status: "reviewed", updated_at: new Date() },
		})
		return { success: true, jobId: existing.id, alreadyExisted: true }
	}

	await prisma.quote_requests.update({
		where: { id: quoteId },
		data: { status: "reviewed", updated_at: new Date() },
	})

	let client = await prisma.clients.findFirst({
		where: {
			email: { equals: quote.client_email.trim(), mode: "insensitive" },
			deleted_at: null,
		},
	})

	if (!client) {
		try {
			client = await prisma.clients.create({
				data: {
					name: quote.client_name.trim().slice(0, 255),
					email: quote.client_email.trim().slice(0, 255),
					phone: (quote.client_phone ?? "").slice(0, 64) || "—",
					street: street.slice(0, 255),
					city: city.slice(0, 128),
					state: state.slice(0, 64),
					zip_code: zip.slice(0, 20),
					country: "US",
				},
			})
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Failed to create client."
			return { success: false, error: msg }
		}
	}

	const priceCents = quote.approved_max_cents ?? quote.max_cents

	let jobNumber: string
	try {
		const rows = await prisma.$queryRaw<{ n: bigint }[]>`
      SELECT nextval('job_number_seq') AS n
    `
		jobNumber = `JOB-${rows[0]?.n ?? Date.now()}`
	} catch {
		jobNumber = `JOB-${Date.now()}`
	}

	const title = quote.service_name.trim().slice(0, 255) || "Landscaping job"

	try {
		const job = await prisma.jobs.create({
			data: {
				job_number: jobNumber,
				client_id: client.id,
				status: "quoted",
				title,
				description: buildJobDescription(quote),
				street: street.slice(0, 255),
				city: city.slice(0, 128),
				state: state.slice(0, 64),
				zip_code: zip.slice(0, 20),
				country: "US",
				quoted_price_cents: priceCents,
				currency: "USD",
				quote_request_id: quoteId,
			},
		})
		return { success: true, jobId: job.id, alreadyExisted: false }
	} catch (e) {
		const raw = e instanceof Error ? e.message : String(e)
		if (
			raw.includes("quote_request_id") ||
			raw.includes("column") ||
			raw.includes("does not exist")
		) {
			return {
				success: false,
				error:
					"Database is missing jobs.quote_request_id. Run scripts/add-jobs-quote-request-id.sql (or prisma db push), then retry.",
			}
		}
		return { success: false, error: raw }
	}
}
