"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  UserIcon,
  ClockIcon,
  HomeIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  StarIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import { Modal } from "@/src/shared/ui/Modal" // Updated import
import type { Client } from "@/src/domain/entities"
import { ClientStatus } from "@/src/domain/entities"
import { getJobs } from "@/src/services/jobService"
import { getPayments } from "@/src/services/paymentService"
import { invoiceService } from "@/src/services/invoiceService"
import { getAllEmployees } from "@/src/services/employeeService"
import { getCommunications } from "@/src/services/communicationService"
import type { Job } from "@/src/domain/entities"
import type { Payment } from "@/src/domain/entities"
import type { Invoice } from "@/src/domain/entities"
import type { Employee } from "@/src/domain/entities"
import type { Communication } from "@/src/domain/entities"
import { PaymentStatus } from "@/src/domain/entities"
import ClientCommunication from "./ClientCommunication"

interface ClientProfileProps {
  isOpen: boolean
  onClose: () => void
  client: Client
}

const ClientProfile = ({ isOpen, onClose, client }: ClientProfileProps) => {
  const [activeTab, setActiveTab] = useState<"basic" | "services" | "properties" | "financial">("basic")
  const [jobs, setJobs] = useState<Job[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadClientData()
    }
  }, [isOpen, client.id])

  const loadClientData = async () => {
    setIsLoading(true)
    try {
      const [jobsData, paymentsData, invoicesData, employeesData, communicationsData] = await Promise.all([
        getJobs(),
        getPayments(),
        invoiceService.getAll(),
        getAllEmployees(),
        getCommunications(),
      ])

      setJobs(jobsData.filter((j) => j.clientId === client.id))
      setPayments(paymentsData.filter((p) => p.clientId === client.id))
      setInvoices(invoicesData.filter((inv) => inv.clientId === client.id))
      setEmployees(employeesData)
      setCommunications(communicationsData.filter((c) => c.clientId === client.id))
    } catch (error) {
      console.error("Failed to load client data:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
    const colors: Record<ClientStatus, string> = {
      [ClientStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [ClientStatus.INACTIVE]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [ClientStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [ClientStatus.SUSPENDED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: UserIcon },
    { id: "services", label: "Service History", icon: ClockIcon },
    { id: "properties", label: "Properties", icon: HomeIcon },
    { id: "financial", label: "Financial", icon: CurrencyDollarIcon },
  ]

  const outstandingInvoices = invoices.filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + inv.total.amount,
    0
  )
  const totalPaid = payments.filter((p) => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount.amount, 0)

  // Calculate spending patterns (last 6 months)
  const spendingPatterns = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }).reverse()

    return months.map((monthLabel, idx) => {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - (5 - idx))
      monthStart.setDate(1)
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const monthPayments = payments.filter((p) => {
        if (p.status !== PaymentStatus.COMPLETED) return false
        const paymentDate = p.completedAt ? new Date(p.completedAt) : new Date(p.createdAt)
        return paymentDate >= monthStart && paymentDate < monthEnd
      })

      return {
        month: monthLabel,
        amount: monthPayments.reduce((sum, p) => sum + p.amount.amount, 0),
      }
    })
  }, [payments])

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <Modal.Header
          title={client.name}
          subtitle="Client Profile Overview"
          icon={<UserIcon className="w-6 h-6" />}
        />

        <Modal.Body>
          {/* Tabs */}
          <div className="border-b border-[#d4a574]/30 mb-6 overflow-x-auto sticky top-0 bg-[#fdfbf7] dark:bg-gray-950/20 z-10 pt-2">
            <nav className="flex space-x-2 min-w-max pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "basic" | "services" | "properties" | "financial")}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? "bg-[#2e8b57] text-white"
                        : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                    Contact Details
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Name</dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{client.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Status</dt>
                      <dd className="mt-1">{getStatusBadge(client.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.contactInfo.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {client.contactInfo.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">
                        Preferred Contact
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                        {client.contactInfo.preferredContactMethod}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                    Billing Address
                  </h3>
                  <div className="text-sm text-gray-900 dark:text-white bg-[#f5f1e6] dark:bg-gray-800 p-4 rounded-lg border border-[#d4a574]/20">
                    <p>{client.primaryAddress.street}</p>
                    <p>
                      {client.primaryAddress.city}, {client.primaryAddress.state}{" "}
                      {client.primaryAddress.zipCode}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                    Service Preferences
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f5f1e6] dark:bg-gray-800 p-4 rounded-lg border border-[#d4a574]/20">
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Segment</dt>
                      <dd className="mt-1 text-sm font-bold text-[#2e8b57] capitalize">
                        {client.segment}
                      </dd>
                    </div>
                    <div className="bg-[#f5f1e6] dark:bg-gray-800 p-4 rounded-lg border border-[#d4a574]/20">
                      <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">
                        Next Scheduled Service
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(client.nextScheduledService)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </motion.div>
            )}

            {activeTab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                  Service History ({jobs.length})
                </h3>
                {isLoading ? (
                  <div className="text-center py-8 text-[#b85e1a]/60">Loading history...</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 text-[#b85e1a]/60">No service history found</div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const assignedCrew = employees.filter((e) => job.assignedEmployeeIds.includes(e.id))
                      const jobPhotos = job.photos || []
                      return (
                        <div
                          key={job.id}
                          className="p-4 bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574]/30 rounded-lg hover:border-[#2e8b57]/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-[#8b4513] dark:text-[#d4a574]">{job.title}</h4>
                                <div className="flex items-center space-x-1 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-[#d4a574]/20">
                                  <StarIcon className="w-3 h-3 text-[#d88c4a]" />
                                  <span className="text-xs font-bold text-[#8b4513] dark:text-gray-400">4.8</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                {job.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                                <div className="bg-white dark:bg-gray-900 p-2 rounded border border-[#d4a574]/10">
                                  <span className="block text-[#b85e1a]/70 uppercase text-[10px] mb-0.5">Date</span>
                                  <span className="font-medium">{formatDate(job.scheduledStart)}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-2 rounded border border-[#d4a574]/10">
                                  <span className="block text-[#b85e1a]/70 uppercase text-[10px] mb-0.5">Status</span>
                                  <span className="font-medium capitalize">{job.status.replace("_", " ")}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-2 rounded border border-[#d4a574]/10">
                                  <span className="block text-[#b85e1a]/70 uppercase text-[10px] mb-0.5">Price</span>
                                  <span className="font-medium text-[#2e8b57]">{formatCurrency(job.quotedPrice)}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-2 rounded border border-[#d4a574]/10">
                                  <span className="block text-[#b85e1a]/70 uppercase text-[10px] mb-0.5">Crew</span>
                                  <span className="font-medium truncate block">{assignedCrew.length > 0 ? assignedCrew.map(e => e.displayName).join(", ") : "Unassigned"}</span>
                                </div>
                              </div>
                              {jobPhotos.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {jobPhotos.slice(0, 3).map((photo, idx) => (
                                    <img
                                      key={idx}
                                      src={photo}
                                      alt={`Job photo ${idx + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.jpg"
                                      }}
                                    />
                                  ))}
                                  {jobPhotos.length > 3 && (
                                    <div className="w-16 h-16 flex items-center justify-center bg-[#d4a574]/20 rounded-lg border-2 border-white shadow-sm text-xs font-bold text-[#8b4513]">
                                      +{jobPhotos.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "properties" && (
              <motion.div
                key="properties"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                  Managed Properties
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#f5f1e6] dark:bg-gray-800 border border-[#2e8b57]/30 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#2e8b57] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">PRIMARY</div>
                    <div className="flex items-start gap-3">
                      <HomeIcon className="w-5 h-5 text-[#2e8b57] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-[#8b4513] dark:text-[#d4a574] mb-1">Main Property</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <p>{client.primaryAddress.street}</p>
                          <p>
                            {client.primaryAddress.city}, {client.primaryAddress.state}{" "}
                            {client.primaryAddress.zipCode}
                          </p>
                        </div>
                        <div className="mt-3 text-xs font-medium text-[#b85e1a]/80 bg-white dark:bg-gray-900 inline-block px-2 py-1 rounded border border-[#d4a574]/20">
                          Service Frequency: Weekly
                        </div>
                      </div>
                    </div>
                  </div>
                  {client.additionalAddresses && client.additionalAddresses.length > 0 && (
                    <div className="space-y-3">
                      {client.additionalAddresses.map((address, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-gray-900 border border-[#d4a574]/30 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="w-5 h-5 text-[#b85e1a] shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-[#8b4513] dark:text-[#d4a574] mb-1">
                                Additional Property {idx + 1}
                              </h4>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>{address.street}</p>
                                <p>
                                  {address.city}, {address.state} {address.zipCode}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "financial" && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                    Financial Overview
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-[#f0f9f4] dark:bg-green-900/20 border border-[#2e8b57]/20 rounded-lg text-center">
                      <dt className="text-xs font-bold text-[#2e8b57]/70 uppercase tracking-widest mb-1">
                        Total Paid
                      </dt>
                      <dd className="text-2xl font-black text-[#2e8b57]">
                        {formatCurrency({ amount: totalPaid, currency: "USD" })}
                      </dd>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-center">
                      <dt className="text-xs font-bold text-yellow-700/70 uppercase tracking-widest mb-1">
                        Outstanding
                      </dt>
                      <dd className="text-2xl font-black text-yellow-600">
                        {formatCurrency({ amount: totalOutstanding, currency: "USD" })}
                      </dd>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-500/20 rounded-lg text-center">
                      <dt className="text-xs font-bold text-blue-700/70 uppercase tracking-widest mb-1">
                        Lifetime Value
                      </dt>
                      <dd className="text-2xl font-black text-blue-600">
                        {formatCurrency(client.lifetimeValue)}
                      </dd>
                    </div>
                  </dl>

                  {/* Spending Patterns Chart */}
                  <div className="mt-6 p-4 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574]/20">
                    <h4 className="text-sm font-bold text-[#8b4513] dark:text-[#d4a574] mb-4">
                      Spending Patterns (Last 6 Months)
                    </h4>
                    <div className="space-y-3">
                      {spendingPatterns.map((pattern, idx) => {
                        const maxAmount = Math.max(...spendingPatterns.map(p => p.amount), 1)
                        const percentage = (pattern.amount / maxAmount) * 100
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-16 text-xs font-medium text-[#b85e1a] dark:text-gray-400 text-right">
                              {pattern.month}
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-900 rounded-full h-5 relative overflow-hidden border border-[#d4a574]/20">
                              <div
                                className="bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                              <div className="absolute inset-0 flex items-center px-3 text-[10px] font-bold text-[#8b4513] dark:text-[#d4a574] mix-blend-difference">
                                {formatCurrency({ amount: pattern.amount, currency: "USD" })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                      Payment History
                    </h3>
                    {payments.length === 0 ? (
                      <div className="text-center py-8 text-[#b85e1a]/60 text-sm">No payment history</div>
                    ) : (
                      <div className="space-y-2">
                        {payments.slice(0, 10).map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-[#d4a574]/20 rounded-lg shadow-sm"
                          >
                            <div>
                              <div className="font-bold text-[#8b4513] dark:text-[#d4a574] text-sm">
                                {payment.paymentNumber}
                              </div>
                              <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
                                {formatDate(payment.completedAt || payment.createdAt)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#2e8b57]">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-[10px] uppercase font-bold text-[#b85e1a]/60">
                                {payment.method.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
                      Outstanding Invoices
                    </h3>
                    {outstandingInvoices.length === 0 ? (
                      <div className="text-center py-8 text-[#2e8b57] text-sm font-medium">No outstanding invoices. Client is all paid up!</div>
                    ) : (
                      <div className="space-y-2">
                        {outstandingInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                          >
                            <div>
                              <div className="font-bold text-red-900 dark:text-red-100 text-sm">
                                {invoice.invoiceNumber}
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-300">
                                Due: {formatDate(invoice.dueDate)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(invoice.total)}
                              </div>
                              <div className="text-[10px] font-bold uppercase text-red-500 dark:text-red-400">
                                {invoice.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-[#8b4513]/60 hover:text-[#8b4513] transition-colors"
          >
            Close Profile
          </button>
          <button
            onClick={() => setIsCommunicationOpen(true)}
            className="px-6 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Message Client
          </button>
        </Modal.Footer>
      </Modal>

      {/* Communication Modal */}
      <ClientCommunication
        client={client}
        isOpen={isCommunicationOpen}
        onClose={() => setIsCommunicationOpen(false)}
      />
    </>
  )
}

export default ClientProfile