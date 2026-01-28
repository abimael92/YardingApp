/**
 * Client Schedule View Component
 * 
 * Displays client's scheduled services
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/outline"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getSchedules } from "@/src/services/scheduleService"
import { getJobs } from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import { getMockRole } from "@/src/features/auth/services/mockAuth"
import type { Schedule, Job } from "@/src/domain/entities"
import { ScheduleStatus } from "@/src/domain/entities"

const ScheduleView = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [schedulesData, jobsData, clientsData] = await Promise.all([
          getSchedules(),
          getJobs(),
          getAllClients(),
        ])

        setJobs(jobsData)

        // Get current user's client ID (simplified - in real app, get from auth)
        const currentRole = getMockRole()
        if (currentRole === "client") {
          const client = clientsData[0]
          if (client) {
            // Get schedules for client's jobs
            const clientJobIds = jobsData
              .filter((job) => job.clientId === client.id)
              .map((job) => job.id)
            const clientSchedules = schedulesData.filter((schedule) =>
              clientJobIds.includes(schedule.jobId)
            )
            setSchedules(clientSchedules)
          }
        }
      } catch (error) {
        console.error("Failed to load schedule:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getJobForSchedule = (jobId: string) => {
    return jobs.find((job) => job.id === jobId)
  }

  const getStatusBadge = (status: ScheduleStatus) => {
    const colors = {
      [ScheduleStatus.SCHEDULED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [ScheduleStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      [ScheduleStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [ScheduleStatus.CANCELLED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [ScheduleStatus.RESCHEDULED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.replace("_", " ")}
      </span>
    )
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return <LoadingState message="Loading schedule..." />
  }

  // Sort schedules by date
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your upcoming and past service appointments
        </p>
      </div>

      {sortedSchedules.length === 0 ? (
        <EmptyState
          title="No scheduled services"
          message="You don't have any scheduled services yet. Request a service to get started."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchedules.map((schedule, index) => {
            const job = getJobForSchedule(schedule.jobId)
            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {job?.title || "Service"}
                    </h3>
                  </div>
                  {getStatusBadge(schedule.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDateTime(schedule.scheduledStart)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="w-4 h-4" />
                    <span>
                      {schedule.address.street}, {schedule.address.city}
                    </span>
                  </div>

                  {schedule.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
                      <p>{schedule.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ScheduleView
