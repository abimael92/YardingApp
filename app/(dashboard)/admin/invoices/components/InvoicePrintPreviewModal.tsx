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
        <Dialog.Content className="fixed left-0 right-0 top-0 bottom-0 z-50 sm:left-1/2 sm:top-1/2 sm:w-[95vw] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[90vh] sm:rounded-xl border-0 sm:border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex flex-col overflow-hidden">
          {/* Header - Fixed at top for mobile */}
          <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 px-4 py-3 sm:px-4 sm:py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Title and close button - better spacing on mobile */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate pr-2">
                  Print Preview — {invoice.invoiceNumber}
                </h2>
               
              </div>

              {/* Action buttons - stacked on mobile, side-by-side on desktop */}
              <div className="flex items-center gap-2 sm:gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 sm:px-4 sm:py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 touch-manipulation min-h-[44px]"
                >
                  <PrinterIcon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-amber-100 px-3 py-2.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 touch-manipulation min-h-[44px]"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  <span className="sm:inline">PDF</span>
                </button>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-2 -mr-2 text-gray-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-400 touch-manipulation"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Scrollable invoice content - optimized for mobile */}
          <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-6 bg-gray-100 dark:bg-gray-900" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="mx-auto w-full min-w-0 max-w-full rounded-lg shadow-lg overflow-hidden bg-white">
              <div
                ref={containerRef}
                className="invoice-print-body bg-white p-7 sm:p-6"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "14px",
                  color: "#1f2937",
                  boxSizing: "border-box",
                  maxWidth: "100%",
                  minWidth: "0",
                }}
              >
                {/* Company header */}
                <div style={{ borderBottom: "2px solid #059669", paddingBottom: "12px", marginBottom: "16px" }}>
                  <img
                    src="/brand-logo.png"
                    alt="J&J Desert Landscaping LLC logo"
                    width={160}
                    height={80}
                    className="h-20 w-40 object-contain bg-black rounded-lg"
                  />
                  <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#065f46", margin: 0, lineHeight: 1.25 }}>
                    J&J Desert Landscaping LLC
                  </h1>
                  <div style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.4 }}>
                    {settings.companyAddress ?? "Phoenix, AZ"}
                    {settings.companyEmail && <><br />{settings.companyEmail}</>}
                    {settings.companyPhone && <><br />{settings.companyPhone}</>}
                  </div>
                </div>

                {/* Invoice title + dates - better stacking on mobile */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", margin: "0 0 4px", color: "#6b7280", textTransform: "uppercase" }}>Invoice</div>
                    <div style={{ margin: 0, fontWeight: 600, fontSize: "1.125rem" }}>#{invoice.invoiceNumber}</div>
                  </div>
                  <div style={{ flex: "1 1 150px", textAlign: "right" }}>
                    <div style={{ margin: "0 0 2px", fontSize: "0.875rem" }}>
                      <strong>Date:</strong> {formatDate(invoice.createdAt)}
                    </div>
                    <div style={{ margin: 0, fontSize: "0.875rem" }}>
                      <strong>Due:</strong> {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Bill to */}
                <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                  <div style={{ fontWeight: 600, margin: "0 0 6px", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bill to</div>
                  <div style={{ margin: 0, color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>{invoice.clientName}</div>
                </div>

                {/* Line items - responsive table for mobile */}
                <div style={{ overflowX: "auto", marginBottom: "16px", WebkitOverflowScrolling: "touch" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: "500px", // Ensures table doesn't get too narrow
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "40%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "25%" }} />
                    </colgroup>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>Description</th>
                        <th style={{ textAlign: "right", padding: "8px", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>Qty</th>
                        <th style={{ textAlign: "right", padding: "8px", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>Unit Price</th>
                        <th style={{ textAlign: "right", padding: "8px", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "8px", wordBreak: "break-word", fontSize: "0.875rem" }}>{item.description}</td>
                          <td style={{ textAlign: "right", padding: "8px", fontSize: "0.875rem" }}>{item.quantity}</td>
                          <td style={{ textAlign: "right", padding: "8px", fontSize: "0.875rem" }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ textAlign: "right", padding: "8px", fontSize: "0.875rem", fontWeight: 500 }}>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals - responsive width */}
                <div style={{ marginLeft: "auto", width: "100%", maxWidth: "280px", marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280" }}>Subtotal</span>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280" }}>Tax (8.6% Phoenix)</span>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(tax)}</span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderTop: "2px solid #059669",
                    marginTop: "8px",
                    fontWeight: 700,
                    fontSize: "1.125rem"
                  }}>
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: "32px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7eb",
                  color: "#9ca3af",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  lineHeight: 1.5
                }}>
                  Thank you for your business.<br />
                  J&J Desert Landscaping LLC · Phoenix, AZ
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}