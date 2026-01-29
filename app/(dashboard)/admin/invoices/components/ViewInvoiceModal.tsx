"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline"
import type { Invoice } from "@/src/data/mockStore"

interface ViewInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
  onPrintPreview: (invoice: Invoice) => void
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US")
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export default function ViewInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onPrintPreview,
}: ViewInvoiceModalProps) {
  if (!invoice) return null

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Invoice {invoice.invoiceNumber}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPrintPreview(invoice)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <PrinterIcon className="h-5 w-5" />
                Print Preview
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

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Client</p>
                <p className="font-medium text-gray-900 dark:text-white">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{invoice.status}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Created</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.total)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line items</p>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Description</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Qty</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Unit price</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{item.description}</td>
                        <td className="py-2 px-3 text-right text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {invoice.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
