/**
 * Contract Service
 *
 * Service layer for contract management. Reads from Neon DB `contracts` table.
 * No database schema changes.
 */

import { neon } from "@neondatabase/serverless"
import type { EntityId } from "@/src/domain/entities"

export interface ContractRecord {
  id: string
  contractNumber: string
  clientId: string
  jobId: string | null
  title: string
  description: string | null
  status: string
  contractDate: string | null
  startDate: string | null
  endDate: string | null
  totalValueCents: number | null
  depositRequiredCents: number | null
  depositReceived: boolean | null
  paymentTerms: string | null
  signedByClient: boolean | null
  clientSignedAt: string | null
  companySignedAt: string | null
  documentUrl: string | null
  createdAt: string
  updatedAt: string
}

const getSql = () => neon(process.env.DATABASE_URL!)

function mapRow(row: Record<string, unknown>): ContractRecord {
  return {
    id: String(row.id),
    contractNumber: String(row.contract_number ?? row.contractNumber ?? ""),
    clientId: String(row.client_id ?? row.clientId ?? ""),
    jobId: row.job_id != null ? String(row.job_id) : null,
    title: String(row.title ?? ""),
    description: row.description != null ? String(row.description) : null,
    status: String(row.status ?? "draft"),
    contractDate: row.contract_date != null ? String(row.contract_date) : null,
    startDate: row.start_date != null ? String(row.start_date) : null,
    endDate: row.end_date != null ? String(row.end_date) : null,
    totalValueCents:
      row.total_value_cents != null
        ? Number(row.total_value_cents)
        : row.totalValueCents != null
          ? Number(row.totalValueCents)
          : null,
    depositRequiredCents:
      row.deposit_required_cents != null
        ? Number(row.deposit_required_cents)
        : null,
    depositReceived:
      row.deposit_received != null ? Boolean(row.deposit_received) : null,
    paymentTerms:
      row.payment_terms != null ? String(row.payment_terms) : null,
    signedByClient:
      row.signed_by_client != null ? Boolean(row.signed_by_client) : null,
    clientSignedAt:
      row.client_signed_at != null ? String(row.client_signed_at) : null,
    companySignedAt:
      row.company_signed_at != null ? String(row.company_signed_at) : null,
    documentUrl:
      row.document_url != null ? String(row.document_url) : null,
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  }
}

/** Shape used by ClientContracts UI */
export interface ContractForUI {
  id: string
  contractNumber: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  value: { amount: number; currency: string }
  status: "draft" | "sent" | "signed" | "active" | "expired" | "terminated"
  signedByClient?: Date
  signedByCompany?: Date
  documentUrl?: string
  terms?: string
  specialConditions?: string
  createdAt: Date
}

function toUI(c: ContractRecord): ContractForUI {
  const amount = c.totalValueCents != null ? c.totalValueCents / 100 : 0
  return {
    id: c.id,
    contractNumber: c.contractNumber,
    title: c.title,
    description: c.description ?? undefined,
    startDate: c.startDate ? new Date(c.startDate) : new Date(),
    endDate: c.endDate ? new Date(c.endDate) : undefined,
    value: { amount, currency: "USD" },
    status: mapContractStatus(c.status),
    signedByClient: c.clientSignedAt ? new Date(c.clientSignedAt) : undefined,
    signedByCompany: c.companySignedAt ? new Date(c.companySignedAt) : undefined,
    documentUrl: c.documentUrl ?? undefined,
    createdAt: new Date(c.createdAt),
  }
}

function mapContractStatus(
  s: string
): "draft" | "sent" | "signed" | "active" | "expired" | "terminated" {
  const v = (s || "draft").toLowerCase()
  if (["sent", "signed", "active", "expired", "terminated"].includes(v))
    return v as "sent" | "signed" | "active" | "expired" | "terminated"
  return "draft"
}

export const contractService = {
  async getByClientId(clientId: EntityId): Promise<ContractForUI[]> {
    try {
      const sql = getSql()
      const rows = await sql`
        SELECT 
          id,
          contract_number,
          client_id,
          job_id,
          title,
          description,
          status,
          contract_date,
          start_date,
          end_date,
          total_value_cents,
          deposit_required_cents,
          deposit_received,
          payment_terms,
          signed_by_client,
          client_signed_at,
          company_signed_at,
          document_url,
          created_at,
          updated_at
        FROM contracts
        WHERE client_id = ${clientId}
        ORDER BY created_at DESC
      `
      return (rows as Record<string, unknown>[]).map((r) => toUI(mapRow(r)))
    } catch (error) {
      console.error("contractService.getByClientId error:", error)
      return []
    }
  },

  async getById(id: EntityId): Promise<ContractRecord | null> {
    try {
      const sql = getSql()
      const rows = await sql`
        SELECT * FROM contracts WHERE id = ${id}
      `
      if (rows.length === 0) return null
      return mapRow(rows[0] as Record<string, unknown>)
    } catch (error) {
      console.error("contractService.getById error:", error)
      return null
    }
  },
}

export const getContractsByClient = (clientId: EntityId) =>
  contractService.getByClientId(clientId)
