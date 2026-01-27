/**
 * Client Detail Component
 * 
 * Displays detailed view of a client
 */

"use client"

import FormModal from "@/src/shared/ui/FormModal"
import type { Client } from "@/src/domain/entities"
import { ClientStatus } from "@/src/domain/entities"

interface ClientDetailProps {
  isOpen: boolean
  onClose: () => void
  client: Client
}

const ClientDetail = ({ isOpen, onClose, client }: ClientDetailProps) => {
  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  const getStatusBadge = (status: ClientStatus) => {
    const colors = {
      [ClientStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [ClientStatus.INACTIVE]:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [ClientStatus.PENDING]:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [ClientStatus.SUSPENDED]:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Client Details" size="lg" footer={null}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">{getStatusBadge(client.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {client.contactInfo.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {client.contactInfo.phone}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="text-sm text-gray-900 dark:text-white">
            <p>{client.primaryAddress.street}</p>
            <p>
              {client.primaryAddress.city}, {client.primaryAddress.state}{" "}
              {client.primaryAddress.zipCode}
            </p>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Financial Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(client.totalSpent)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Lifetime Value
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(client.lifetimeValue)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                First Service Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(client.firstServiceDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Service Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(client.lastServiceDate)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Relationships */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relationships</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Jobs</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {client.jobIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quotes</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {client.quoteIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payments</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {client.paymentIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Communications
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {client.communicationIds.length}
              </dd>
            </div>
          </dl>
        </div>

        {/* Notes */}
        {client.notes && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{client.notes}</p>
          </div>
        )}
      </div>
    </FormModal>
  )
}

export default ClientDetail
