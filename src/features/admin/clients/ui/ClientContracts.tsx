/**
 * Client Contracts Component
 * 
 * Manages client contracts, agreements, and amendments
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/src/features/admin/utils/formatters"
import type { Client } from "@/src/domain/entities"

export interface Contract {
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

interface ClientContractsProps {
  client: Client
  contracts: Contract[]
  onBack: () => void
}

const ClientContracts = ({ client, contracts: initialContracts, onBack }: ClientContractsProps) => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts)
  const [showForm, setShowForm] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "expired">("all")

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    draft: contracts.filter(c => c.status === "draft").length,
    signed: contracts.filter(c => c.status === "signed").length,
    totalValue: contracts.reduce((sum, c) => sum + c.value.amount, 0),
    activeValue: contracts
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + c.value.amount, 0),
  }

  const filteredContracts = contracts
    .filter(c => filter === "all" || c.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
      sent: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      signed: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      active: "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c]",
      expired: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      terminated: "bg-red-500/20 text-red-600 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const ContractCard = ({ contract }: { contract: Contract }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#f5f1e6] dark:bg-gray-800 p-6 rounded-lg border border-[#d4a574]/30 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-8 h-8 text-[#2e8b57]" />
          <div>
            <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
              {contract.title}
            </h3>
            <p className="text-sm text-[#b85e1a]/70">Contract #{contract.contractNumber}</p>
          </div>
        </div>
        {getStatusBadge(contract.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-[#b85e1a]/70">Start Date</p>
          <p className="text-[#8b4513] dark:text-[#d4a574]">
            {formatDate(contract.startDate.toISOString())}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">End Date</p>
          <p className="text-[#8b4513] dark:text-[#d4a574]">
            {contract.endDate ? formatDate(contract.endDate.toISOString()) : "Ongoing"}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Value</p>
          <p className="text-lg font-bold text-[#2e8b57]">
            {formatCurrency(contract.value.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Signed</p>
          {contract.signedByClient ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm">Yes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-600">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">Pending</span>
            </div>
          )}
        </div>
      </div>

      {contract.description && (
        <p className="text-sm text-[#8b4513] dark:text-[#d4a574] mb-4 border-l-2 border-[#2e8b57] pl-3">
          {contract.description}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#d4a574]/30">
        <button
          onClick={() => setSelectedContract(contract)}
          className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
          title="View Details"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
        {contract.documentUrl && (
          <a
            href={contract.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </a>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#d4a574]/20 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#8b4513] dark:text-[#d4a574]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            Contracts - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Manage contracts and agreements
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#2e8b57]/10 p-4 rounded-lg border border-[#2e8b57]/30">
          <div className="text-sm text-[#2e8b57] mb-1">Total Contracts</div>
          <div className="text-2xl font-bold text-[#2e8b57]">{stats.total}</div>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <div className="text-sm text-green-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <div className="text-sm text-blue-600 mb-1">Draft/Sent</div>
          <div className="text-2xl font-bold text-blue-600">{stats.draft + stats.signed}</div>
        </div>
        <div className="bg-[#2e8b57]/10 p-4 rounded-lg border border-[#2e8b57]/30 col-span-2">
          <div className="text-sm text-[#2e8b57] mb-1">Active Contract Value</div>
          <div className="text-2xl font-bold text-[#2e8b57]">
            {formatCurrency(stats.activeValue)}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Contract
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513]"
          >
            <option value="all">All Contracts</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574]/30">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-[#b85e1a]/40 mb-3" />
          <h3 className="text-lg font-medium text-[#8b4513] dark:text-[#d4a574]">
            No contracts yet
          </h3>
          <p className="text-sm text-[#b85e1a]/70 mt-1">
            Create your first contract for {client.name}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41]"
          >
            Create Contract
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContracts.map(contract => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}

      {/* Contract Details Modal */}
      {selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  )
}

// Contract Details Modal
const ContractDetailsModal = ({ contract, onClose }: { contract: Contract; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      className="bg-[#f5f1e6] dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-8 h-8 text-[#2e8b57]" />
          <h2 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            {contract.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#d4a574]/20 rounded-lg"
        >
          <XCircleIcon className="w-6 h-6 text-[#8b4513]" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-[#b85e1a]/70">Contract Number</p>
          <p className="text-[#8b4513] font-medium">{contract.contractNumber}</p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Status</p>
          <div className="mt-1">{getStatusBadge(contract.status)}</div>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Start Date</p>
          <p className="text-[#8b4513]">{formatDate(contract.startDate.toISOString())}</p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">End Date</p>
          <p className="text-[#8b4513]">
            {contract.endDate ? formatDate(contract.endDate.toISOString()) : "Ongoing"}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Contract Value</p>
          <p className="text-2xl font-bold text-[#2e8b57]">
            {formatCurrency(contract.value.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#b85e1a]/70">Created</p>
          <p className="text-[#8b4513]">{formatDate(contract.createdAt.toISOString())}</p>
        </div>
      </div>

      {contract.description && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#8b4513] mb-2">Description</h3>
          <p className="text-[#8b4513] dark:text-[#d4a574] bg-white dark:bg-gray-700 p-4 rounded-lg">
            {contract.description}
          </p>
        </div>
      )}

      {contract.terms && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#8b4513] mb-2">Terms & Conditions</h3>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-[#8b4513] dark:text-[#d4a574] whitespace-pre-wrap">
              {contract.terms}
            </p>
          </div>
        </div>
      )}

      {contract.specialConditions && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#8b4513] mb-2">Special Conditions</h3>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-[#8b4513] dark:text-[#d4a574] whitespace-pre-wrap">
              {contract.specialConditions}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#d4a574]/30">
        {contract.documentUrl && (
          <a
            href={contract.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41] flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download PDF
          </a>
        )}
      </div>
    </motion.div>
  </div>
)

export default ClientContracts

function getStatusBadge(status: string): import("react").ReactNode {
  throw new Error('Function not implemented.')
}
