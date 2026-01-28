/**
 * Client Profile Component
 * 
 * Comprehensive client profile with tabs: Basic Info, Service History, Properties, Financial
 */

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
} from "@heroicons/react/24/outline"
import FormModal from "@/src/shared/ui/FormModal"
import type { Client } from "@/src/domain/entities"
import { ClientStatus } from "@/src/domain/entities"
import { getJobs } from "@/src/services/jobService"
import { getPayments } from "@/src/services/paymentService"
import { invoiceService } from "@/src/services/invoiceService"
import { getAllEmployees } from "@/src/services/employeeService"
import { getCommunications } from "@/src/services/communicationService"
import type { Job } from "@/src/domain/entities"
import type { Payment } from "@/src/domain/entities"
import type { Invoice } from "@/src/services/invoiceService"
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
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.total, 0)
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
    <FormModal isOpen={isOpen} onClose={onClose} title={client.name} size="xl" footer={null}>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Contact Details
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
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Preferred Contact
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {client.contactInfo.preferredContactMethod}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Billing Address
              </h3>
              <div className="text-sm text-gray-900 dark:text-white">
                <p>{client.primaryAddress.street}</p>
                <p>
                  {client.primaryAddress.city}, {client.primaryAddress.state}{" "}
                  {client.primaryAddress.zipCode}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Service Preferences
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Segment</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {client.segment}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Next Scheduled Service
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Service History ({jobs.length})
            </h3>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No service history</div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const assignedCrew = employees.filter((e) => job.assignedEmployeeIds.includes(e.id))
                  const jobPhotos = job.photos || []
                  return (
                    <div
                      key={job.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">4.8</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {job.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(job.scheduledStart)}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {job.status.replace("_", " ")}
                            </div>
                            <div>
                              <span className="font-medium">Price:</span> {formatCurrency(job.quotedPrice)}
                            </div>
                            <div>
                              <span className="font-medium">Crew:</span> {assignedCrew.length > 0 ? assignedCrew.map(e => e.displayName).join(", ") : "Unassigned"}
                            </div>
                          </div>
                          {jobPhotos.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {jobPhotos.slice(0, 3).map((photo, idx) => (
                                <img
                                  key={idx}
                                  src={photo}
                                  alt={`Job photo ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.jpg"
                                  }}
                                />
                              ))}
                              {jobPhotos.length > 3 && (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Properties
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Primary Property</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>{client.primaryAddress.street}</p>
                  <p>
                    {client.primaryAddress.city}, {client.primaryAddress.state}{" "}
                    {client.primaryAddress.zipCode}
                  </p>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Service Frequency: Weekly
                </div>
              </div>
              {client.additionalAddresses && client.additionalAddresses.length > 0 && (
                <div className="space-y-3">
                  {client.additionalAddresses.map((address, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Additional Property {idx + 1}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.zipCode}
                        </p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Financial Overview
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Paid
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency({ amount: totalPaid, currency: "USD" })}
                  </dd>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Outstanding
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency({ amount: totalOutstanding, currency: "USD" })}
                  </dd>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Lifetime Value
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(client.lifetimeValue)}
                  </dd>
                </div>
              </dl>
              
              {/* Spending Patterns Chart */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Spending Patterns (Last 6 Months)
                </h4>
                <div className="space-y-2">
                  {spendingPatterns.map((pattern, idx) => {
                    const maxAmount = Math.max(...spendingPatterns.map(p => p.amount), 1)
                    const percentage = (pattern.amount / maxAmount) * 100
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-20 text-xs text-gray-600 dark:text-gray-400 text-right">
                          {pattern.month}
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency({ amount: pattern.amount, currency: "USD" })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Payment History
              </h3>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payment history</div>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 10).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {payment.paymentNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(payment.completedAt || payment.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {payment.method.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Outstanding Invoices
              </h3>
              {outstandingInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No outstanding invoices</div>
              ) : (
                <div className="space-y-2">
                  {outstandingInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600 dark:text-red-400">
                          {formatCurrency({ amount: invoice.total, currency: "USD" })}
                        </div>
                        <div className="text-xs text-red-500 dark:text-red-400 capitalize">
                          {invoice.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </FormModal>
    
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
