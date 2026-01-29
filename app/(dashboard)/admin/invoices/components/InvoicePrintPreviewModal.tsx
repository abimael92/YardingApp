"use client"

/**
 * Print preview modal: shows invoice layout with Print and Download PDF.
 */

import { useRef, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon, PrinterIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import type { Invoice } from "@/src/data/mockStore"
import { mockStore } from "@/src/data/mockStore"

const PHOENIX_TAX_RATE = 0.086

interface InvoicePrintPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US")
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export default function InvoicePrintPreviewModal({
  isOpen,
  onClose,
  invoice,
}: InvoicePrintPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const settings = mockStore.getInvoiceSettings()

  const handlePrint = useCallback(() => {
    if (!invoice) return
    const el = containerRef.current
    if (!el) return
    const printContent = el.innerHTML
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Invoice ${invoice.invoiceNumber}</title></head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }, [invoice])

  const handleDownloadPDF = useCallback(async () => {
    if (!invoice) return
    const el = containerRef.current
    if (!el) return
    try {
      const { default: html2pdf } = await import("html2pdf.js")
      await html2pdf()
        .set({
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          margin: [0.5, 0.5],
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(el)
        .save()
    } catch (err) {
      console.error("[InvoicePrintPreview] PDF failed", err)
    }
  }, [invoice])

  if (!invoice) return null

  const subtotal = invoice.lineItems.reduce((sum, i) => sum + i.total, 0)
  const tax = Math.round(subtotal * PHOENIX_TAX_RATE * 100) / 100
  const total = subtotal + tax

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-3xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Print Preview — {invoice.invoiceNumber}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <PrinterIcon className="h-5 w-5" />
                Print
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download PDF
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 bg-gray-100 dark:bg-gray-900">
            <div
              ref={containerRef}
              className="mx-auto w-full min-w-0 max-w-full bg-white p-6 sm:p-8 shadow-lg print:shadow-none"
              style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#1f2937" }}
            >
              <div style={{ borderBottom: "2px solid #059669", paddingBottom: "16px", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#065f46", margin: 0 }}>
                  J&J Desert Landscaping LLC
                </h1>
                <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
                  {settings.companyAddress ?? "Phoenix, AZ"}
                  {settings.companyEmail && ` • ${settings.companyEmail}`}
                  {settings.companyPhone && ` • ${settings.companyPhone}`}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>INVOICE</h2>
                  <p style={{ margin: 0, color: "#6b7280" }}>#{invoice.invoiceNumber}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 4px" }}>Date: {formatDate(invoice.createdAt)}</p>
                  <p style={{ margin: 0 }}>Due: {formatDate(invoice.dueDate)}</p>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontWeight: 600, margin: "0 0 4px" }}>Bill to</p>
                <p style={{ margin: 0, color: "#374151" }}>{invoice.clientName}</p>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>Description</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>Unit price</th>
                    <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "10px 12px" }}>{item.description}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px" }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 500 }}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginLeft: "auto", width: "240px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ color: "#6b7280" }}>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ color: "#6b7280" }}>Tax (8.6% Phoenix)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderTop: "2px solid #059669",
                    marginTop: "4px",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                  color: "#9ca3af",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Thank you for your business. • J&J Desert Landscaping LLC • Phoenix, AZ
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
