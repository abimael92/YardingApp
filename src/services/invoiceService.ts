/**
 * Invoice Service
 * 
 * Service layer for invoice management
 */

import { asyncify } from "./utils"

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

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2025-001",
    clientId: "client-1",
    clientName: "John Smith",
    jobId: "job-1",
    status: "paid",
    amount: 850.0,
    tax: 68.0,
    total: 918.0,
    dueDate: "2025-01-15T00:00:00Z",
    sentDate: "2025-01-01T10:00:00Z",
    paidDate: "2025-01-10T14:30:00Z",
    createdAt: "2025-01-01T10:00:00Z",
    lineItems: [
      { id: "li-1", description: "Weekly lawn maintenance (4 weeks)", quantity: 4, unitPrice: 75, total: 300 },
      { id: "li-2", description: "Fertilizer application", quantity: 1, unitPrice: 150, total: 150 },
      { id: "li-3", description: "Tree trimming", quantity: 1, unitPrice: 400, total: 400 },
    ],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2025-002",
    clientId: "client-2",
    clientName: "Sarah Johnson",
    jobId: "job-2",
    status: "sent",
    amount: 1200.0,
    tax: 96.0,
    total: 1296.0,
    dueDate: "2025-02-05T00:00:00Z",
    sentDate: "2025-01-20T09:00:00Z",
    createdAt: "2025-01-20T09:00:00Z",
    lineItems: [
      { id: "li-4", description: "Landscaping design", quantity: 1, unitPrice: 500, total: 500 },
      { id: "li-5", description: "Plant installation", quantity: 1, unitPrice: 700, total: 700 },
    ],
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2025-003",
    clientId: "client-3",
    clientName: "Mike Davis",
    status: "overdue",
    amount: 650.0,
    tax: 52.0,
    total: 702.0,
    dueDate: "2025-01-10T00:00:00Z",
    sentDate: "2025-12-28T11:00:00Z",
    createdAt: "2025-12-28T11:00:00Z",
    lineItems: [
      { id: "li-6", description: "Irrigation repair", quantity: 1, unitPrice: 650, total: 650 },
    ],
    notes: "Payment reminder sent",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2025-004",
    clientId: "client-4",
    clientName: "Emily Wilson",
    jobId: "job-4",
    status: "draft",
    amount: 950.0,
    tax: 76.0,
    total: 1026.0,
    dueDate: "2025-02-15T00:00:00Z",
    createdAt: "2025-01-25T15:00:00Z",
    lineItems: [
      { id: "li-7", description: "Hardscaping - Patio", quantity: 1, unitPrice: 950, total: 950 },
    ],
  },
]

export const invoiceService = {
  getAll: (): Promise<Invoice[]> => asyncify(() => mockInvoices),

  getById: (id: string): Promise<Invoice | undefined> =>
    asyncify(() => mockInvoices.find((inv) => inv.id === id)),

  getByStatus: (status: Invoice["status"]): Promise<Invoice[]> =>
    asyncify(() => mockInvoices.filter((inv) => inv.status === status)),

  getOverdue: (): Promise<Invoice[]> =>
    asyncify(() => mockInvoices.filter((inv) => inv.status === "overdue")),

  getPending: (): Promise<Invoice[]> =>
    asyncify(() => mockInvoices.filter((inv) => inv.status === "sent" || inv.status === "draft")),

  getTotalOutstanding: (): Promise<number> =>
    asyncify(() => {
      const outstanding = mockInvoices.filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
      return outstanding.reduce((sum, inv) => sum + inv.total, 0)
    }),

  getTotalPaid: (): Promise<number> =>
    asyncify(() => {
      const paid = mockInvoices.filter((inv) => inv.status === "paid")
      return paid.reduce((sum, inv) => sum + inv.total, 0)
    }),
}
