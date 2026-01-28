/**
 * Invoice Service
 *
 * J&J Desert Landscaping Invoice System.
 * Uses mockStore for data; console.log added for all data-fetch operations (MVP).
 */

import { mockStore } from "@/src/data/mockStore"
import { asyncify } from "./utils"

// -----------------------------------------------------------------------------
// Types (exported for UI – InvoicesPage, ClientProfile)
// -----------------------------------------------------------------------------

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  jobId?: string
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  amount: number
  tax: number
  total: number
  dueDate: string
  sentDate?: string
  paidDate?: string
  createdAt: string
  lineItems: InvoiceLineItem[]
  notes?: string
}

// -----------------------------------------------------------------------------
// Data fetching helpers (mockStore returns same shape as Invoice)
// -----------------------------------------------------------------------------

export const invoiceService = {
  getAll: (): Promise<Invoice[]> => {
    console.log("[InvoiceService] Fetching all invoices")
    return asyncify(() => mockStore.getInvoices() as Invoice[])
  },

  getById: (id: string): Promise<Invoice | undefined> => {
    console.log("[InvoiceService] Fetching invoice by id:", id)
    return asyncify(() => mockStore.getInvoiceById(id) as Invoice | undefined)
  },

  getByStatus: (status: Invoice["status"]): Promise<Invoice[]> => {
    console.log("[InvoiceService] Fetching invoices by status:", status)
    return asyncify(() =>
      (mockStore.getInvoices() as Invoice[]).filter((inv) => inv.status === status)
    )
  },

  getOverdue: (): Promise<Invoice[]> => {
    console.log("[InvoiceService] Fetching overdue invoices")
    return asyncify(() =>
      (mockStore.getInvoices() as Invoice[]).filter((inv) => inv.status === "overdue")
    )
  },

  getPending: (): Promise<Invoice[]> => {
    console.log("[InvoiceService] Fetching pending invoices (sent + draft)")
    return asyncify(() =>
      (mockStore.getInvoices() as Invoice[]).filter(
        (inv) => inv.status === "sent" || inv.status === "draft"
      )
    )
  },

  getTotalOutstanding: (): Promise<number> => {
    console.log("[InvoiceService] Fetching total outstanding amount")
    return asyncify(() => {
      const invs = (mockStore.getInvoices() as Invoice[]).filter(
        (inv) => inv.status !== "paid" && inv.status !== "cancelled"
      )
      return invs.reduce((sum, inv) => sum + inv.total, 0)
    })
  },

  getTotalPaid: (): Promise<number> => {
    console.log("[InvoiceService] Fetching total paid amount")
    return asyncify(() => {
      const invs = (mockStore.getInvoices() as Invoice[]).filter((inv) => inv.status === "paid")
      return invs.reduce((sum, inv) => sum + inv.total, 0)
    })
  },
}
