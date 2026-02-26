"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/app/lib/prisma"
import { sendSms } from "@/src/lib/sms"

export type QuoteRequestStatus = "pending" | "reviewed" | "sent"

export interface CreateQuoteRequestInput {
  client_name: string
  client_email: string
  client_phone?: string
  service_name: string
  project_type: string
  zone: string
  hours: number
  sqft: number
  visits: number
  extras?: string
  min_cents: number
  max_cents: number
  breakdown_metadata: Record<string, unknown>
}

export async function createQuoteRequest(input: CreateQuoteRequestInput): Promise<
  { success: true; id: string } | { success: false; error: string }
> {
  try {
    const row = await prisma.quote_requests.create({
      data: {
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone ?? null,
        service_name: input.service_name,
        project_type: input.project_type,
        zone: input.zone,
        hours: input.hours,
        sqft: input.sqft,
        visits: input.visits,
        extras: input.extras ?? null,
        min_cents: BigInt(Math.round(input.min_cents)),
        max_cents: BigInt(Math.round(input.max_cents)),
        breakdown_metadata: input.breakdown_metadata ?? {},
        status: "pending",
      },
    })

    await prisma.admin_notifications.create({
      data: {
        type: "quote_request",
        entity_id: row.id,
        read: false,
        quote_request_id: row.id,
      },
    })

    const adminPhone = process.env.ADMIN_PHONE_FOR_SMS || process.env.TWILIO_ADMIN_PHONE
    if (adminPhone) {
      await sendSms({
        to: adminPhone,
        body: `New quote request: ${input.service_name} from ${input.client_name}. Estimate: $${(input.min_cents / 100).toFixed(0)}–$${(input.max_cents / 100).toFixed(0)}. Check admin quotes.`,
      })
    } else {
      await sendSms({
        to: "+15550000000",
        body: `[Dev] New quote request: ${input.service_name} from ${input.client_name}.`,
      })
    }

    revalidatePath("/admin/quotes")
    return { success: true, id: row.id }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create quote request"
    console.error("[createQuoteRequest]", e)
    return { success: false, error: message }
  }
}

export async function getQuoteRequests(): Promise<
  Array<{
    id: string
    client_name: string
    client_email: string
    client_phone: string | null
    service_name: string
    project_type: string
    zone: string
    hours: number
    sqft: number
    visits: number
    extras: string | null
    min_cents: bigint
    max_cents: bigint
    breakdown_metadata: unknown
    status: string
    message_to_client: string | null
    approved_min_cents: bigint | null
    approved_max_cents: bigint | null
    created_at: Date
    updated_at: Date
    sent_at: Date | null
  }>
> {
  const list = await prisma.quote_requests.findMany({
    orderBy: { created_at: "desc" },
  })
  return list.map((r) => ({
    id: r.id,
    client_name: r.client_name,
    client_email: r.client_email,
    client_phone: r.client_phone,
    service_name: r.service_name,
    project_type: r.project_type,
    zone: r.zone,
    hours: r.hours,
    sqft: r.sqft,
    visits: r.visits,
    extras: r.extras,
    min_cents: r.min_cents,
    max_cents: r.max_cents,
    breakdown_metadata: r.breakdown_metadata,
    status: r.status,
    message_to_client: r.message_to_client,
    approved_min_cents: r.approved_min_cents,
    approved_max_cents: r.approved_max_cents,
    created_at: r.created_at,
    updated_at: r.updated_at,
    sent_at: r.sent_at,
  }))
}

export async function getQuoteRequestById(
  id: string
): Promise<{
  id: string
  client_name: string
  client_email: string
  client_phone: string | null
  service_name: string
  project_type: string
  zone: string
  hours: number
  sqft: number
  visits: number
  extras: string | null
  min_cents: bigint
  max_cents: bigint
  breakdown_metadata: unknown
  status: string
  message_to_client: string | null
  approved_min_cents: bigint | null
  approved_max_cents: bigint | null
  created_at: Date
  updated_at: Date
  sent_at: Date | null
} | null> {
  const r = await prisma.quote_requests.findUnique({ where: { id } })
  if (!r) return null
  return {
    id: r.id,
    client_name: r.client_name,
    client_email: r.client_email,
    client_phone: r.client_phone,
    service_name: r.service_name,
    project_type: r.project_type,
    zone: r.zone,
    hours: r.hours,
    sqft: r.sqft,
    visits: r.visits,
    extras: r.extras,
    min_cents: r.min_cents,
    max_cents: r.max_cents,
    breakdown_metadata: r.breakdown_metadata,
    status: r.status,
    message_to_client: r.message_to_client,
    approved_min_cents: r.approved_min_cents,
    approved_max_cents: r.approved_max_cents,
    created_at: r.created_at,
    updated_at: r.updated_at,
    sent_at: r.sent_at,
  }
}

export async function updateQuoteRequest(
  id: string,
  updates: {
    status?: QuoteRequestStatus
    message_to_client?: string | null
    approved_min_cents?: number | null
    approved_max_cents?: number | null
  }
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const data: Record<string, unknown> = { updated_at: new Date() }
    if (updates.status !== undefined) data.status = updates.status
    if (updates.message_to_client !== undefined) data.message_to_client = updates.message_to_client
    if (updates.approved_min_cents !== undefined) data.approved_min_cents = updates.approved_min_cents == null ? null : BigInt(Math.round(updates.approved_min_cents))
    if (updates.approved_max_cents !== undefined) data.approved_max_cents = updates.approved_max_cents == null ? null : BigInt(Math.round(updates.approved_max_cents))
    await prisma.quote_requests.update({
      where: { id },
      data: data as Parameters<typeof prisma.quote_requests.update>[0]["data"],
    })
    revalidatePath("/admin/quotes")
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed"
    console.error("[updateQuoteRequest]", e)
    return { success: false, error: message }
  }
}

export async function sendQuoteToClient(id: string): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const row = await prisma.quote_requests.findUnique({ where: { id } })
    if (!row) return { success: false, error: "Quote request not found" }
    const minCents = Number(row.approved_min_cents ?? row.min_cents)
    const maxCents = Number(row.approved_max_cents ?? row.max_cents)
    await prisma.quote_requests.update({
      where: { id },
      data: {
        status: "sent",
        sent_at: new Date(),
        approved_min_cents: BigInt(minCents),
        approved_max_cents: BigInt(maxCents),
        updated_at: new Date(),
      },
    })
    const msg = row.message_to_client || `Your estimate: $${(minCents / 100).toFixed(0)} – $${(maxCents / 100).toFixed(0)} for ${row.service_name}.`
    if (row.client_phone) {
      await sendSms({ to: row.client_phone, body: msg })
    }
    revalidatePath("/admin/quotes")
    return { success: true }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed"
    console.error("[sendQuoteToClient]", e)
    return { success: false, error: message }
  }
}
