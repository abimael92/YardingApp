/**
 * Client Services List Component
 * 
 * Displays services available to clients and their service history
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusIcon } from "@heroicons/react/24/outline"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getServices } from "@/src/services/serviceCatalog"
import { getJobs } from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import { getMockRole } from "@/src/features/auth/services/mockAuth"
import type { Service } from "@/src/domain/models"
import type { Job } from "@/src/domain/entities"
import { JobStatus } from "@/src/domain/entities"
import ServiceCard from "@/src/shared/ui/ServiceCard"

const ServicesList = () => {
  const [services, setServices] = useState<Service[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [servicesData, jobsData, clientsData] = await Promise.all([
          getServices(),
          getJobs(),
          getAllClients(),
        ])

        setServices(servicesData)

        // Get current user's client ID (simplified - in real app, get from auth)
        const currentRole = getMockRole()
        if (currentRole === "client") {
          // Find client by email or use first client for demo
          const client = clientsData[0]
          if (client) {
            const clientJobs = jobsData.filter((job) => job.clientId === client.id)
            setMyJobs(clientJobs)
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getStatusBadge = (status: JobStatus) => {
    const colors = {
      [JobStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [JobStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [JobStatus.SCHEDULED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [JobStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.replace("_", " ")}
      </span>
    )
  }

  if (isLoading) {
    return <LoadingState message="Loading services..." />
  }

  return (
    <div className="space-y-8">
      {/* Available Services */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Services</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and request our landscaping services
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Services / Service History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your service history and active jobs
            </p>
          </div>
        </div>

        {myJobs.length === 0 ? (
          <EmptyState
            title="No services yet"
            message="Request a service to get started with professional landscaping."
            actionLabel="Browse Services"
            onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Job
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Scheduled
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{job.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {job.jobNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {job.scheduledStart
                          ? new Date(job.scheduledStart).toLocaleDateString()
                          : "Not scheduled"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(job.quotedPrice.amount)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicesList
