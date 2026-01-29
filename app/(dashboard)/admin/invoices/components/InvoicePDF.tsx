"use client"

/**
 * Invoice PDF export using html2pdf.js (client-side).
 * Depends on: html2pdf.js (see package.json).
 */

import { useRef, useCallback } from "react"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import type { Invoice } from "@/src/data/mockStore"
import { mockStore } from "@/src/data/mockStore"

// Phoenix, AZ sales tax rate (user-specified)
const PHOENIX_TAX_RATE = 0.086

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface InvoicePDFProps {
  invoice: Invoice
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function InvoicePDF({ invoice }: InvoicePDFProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const settings = mockStore.getInvoiceSettings()

  const subtotal = invoice.lineItems.reduce((sum, i) => sum + i.total, 0)
  const tax = Math.round(subtotal * PHOENIX_TAX_RATE * 100) / 100
  const total = subtotal + tax

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US")
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

  const handleDownload = useCallback(async () => {
    const el = containerRef.current
    if (!el) return

    console.log("[InvoicePDF] Generating PDF...", {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      total,
    })

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

      console.log("[InvoicePDF] PDF generated and download started")
    } catch (err) {
      console.error("[InvoicePDF] PDF generation failed", err)
    }
  }, [invoice, total])

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        Download PDF
      </button>

      {/* Hidden branded template for html2pdf */}
      <div ref={containerRef} className="absolute -left-[9999px] top-0 w-[210mm] bg-white p-8" aria-hidden>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#1f2937" }}>
          {/* Header */}
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

          {/* Invoice title */}
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

          {/* Bill to */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontWeight: 600, margin: "0 0 4px" }}>Bill to</p>
            <p style={{ margin: 0, color: "#374151" }}>{invoice.clientName}</p>
          </div>

          {/* Line items */}
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

          {/* Totals */}
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

          {/* Footer */}
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
    </>
  )
}
