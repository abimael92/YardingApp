/**
 * Job List Component
 *
 * Full CRUD list of all jobs for admin view.
 * Card layout, filters, and consistent spacing.
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { Card } from "@/src/components/layout/Card"
import { Button } from "@/src/components/layout/Button"
import { getJobs, deleteJob } from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import { getAllEmployees } from "@/src/services/employeeService"
import type { Job, Client, Employee } from "@/src/domain/entities"
import { JobStatus, Priority } from "@/src/domain/entities"
import JobForm from "./JobForm"
import JobDetail from "./JobDetail"

type StatusFilter = "all" | JobStatus

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [jobsData, clientsData, employeesData] = await Promise.all([
        getJobs(),
        getAllClients(),
        getAllEmployees(),
      ])
      setJobs(jobsData)
      setClients(clientsData)
      setEmployees(employeesData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = () => {
    setEditingJob(null)
    setIsFormOpen(true)
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsFormOpen(true)
  }

  const handleView = (job: Job) => {
    setSelectedJob(job)
    setIsDetailOpen(true)
  }

  const handleDelete = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete ${job.title}?`)) {
      return
    }

    try {
      await deleteJob(job.id)
      await loadData()
    } catch (error) {
      console.error("Failed to delete job:", error)
      alert("Failed to delete job")
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingJob(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    await loadData()
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Unknown"
  }

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { bg: string; text: string }> = {
      [JobStatus.DRAFT]: { bg: "bg-gray-100 dark:bg-gray-700/50", text: "text-gray-700 dark:text-gray-300" },
      [JobStatus.QUOTED]: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300" },
      [JobStatus.SCHEDULED]: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-300" },
      [JobStatus.IN_PROGRESS]: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300" },
      [JobStatus.COMPLETED]: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300" },
      [JobStatus.CANCELLED]: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300" },
      [JobStatus.ON_HOLD]: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300" },
    }
    const { bg, text } = config[status] ?? config[JobStatus.DRAFT]
    const label = status.replace("_", " ")
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    )
  }

  const filteredJobs = useMemo(() => {
    if (statusFilter === "all") return jobs
    return jobs.filter((j) => j.status === statusFilter)
  }, [jobs, statusFilter])

  const getPriorityBadge = (priority: Priority) => {
    const colors = {
      [Priority.LOW]: "text-green-600 dark:text-green-400",
      [Priority.MEDIUM]: "text-yellow-600 dark:text-yellow-400",
      [Priority.HIGH]: "text-red-600 dark:text-red-400",
      [Priority.URGENT]: "text-red-700 dark:text-red-500 font-bold",
    }
    return (
      <span className={`font-medium capitalize ${colors[priority]}`}>
        {priority}
      </span>
    )
  }

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  const columns: Column<Job>[] = [
    {
      key: "title",
      header: "Job",
      render: (job) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{job.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{job.jobNumber}</div>
        </div>
      ),
    },
    {
      key: "clientId",
      header: "Client",
      render: (job) => (
        <div className="text-gray-600 dark:text-gray-300">{getClientName(job.clientId)}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (job) => getStatusBadge(job.status),
    },
    {
      key: "priority",
      header: "Priority",
      render: (job) => getPriorityBadge(job.priority),
    },
    {
      key: "quotedPrice",
      header: "Quoted Price",
      render: (job) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(job.quotedPrice)}
        </span>
      ),
    },
    {
      key: "scheduledStart",
      header: "Scheduled",
      render: (job) => (
        <div className="text-gray-600 dark:text-gray-300 text-xs">
          {job.scheduledStart
            ? new Date(job.scheduledStart).toLocaleDateString()
            : "Not scheduled"}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading jobs..." />
  }

  return (
    <>
      <Card className="overflow-hidden" padding="none">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Jobs</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                Create, assign, and manage work orders
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant="primary"
              className="inline-flex items-center shrink-0 w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Job
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" aria-hidden />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mr-2">Status</span>
          {(["all", JobStatus.IN_PROGRESS, JobStatus.SCHEDULED, JobStatus.COMPLETED, JobStatus.DRAFT, JobStatus.QUOTED, JobStatus.CANCELLED, JobStatus.ON_HOLD] as const).map((value) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? "bg-primary-600 text-white dark:bg-primary-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              }`}
            >
              {value === "all" ? "All jobs" : value.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="p-4 sm:p-6">
          <DataTable
            data={filteredJobs}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            keyExtractor={(job) => job.id}
            emptyMessage={statusFilter === "all" ? "No jobs found. Create your first job to get started." : `No jobs with status "${statusFilter.replace("_", " ")}".`}
          />
        </div>
      </Card>

      {/* Form Modal */}
      <JobForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        job={editingJob}
        clients={clients}
        employees={employees}
      />

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedJob(null)
          }}
          job={selectedJob}
          clients={clients}
          employees={employees}
          onInvoiceGenerated={() => {
            console.log("[JobList] Invoice generated from job, refetching data")
            loadData()
          }}
        />
      )}
    </>
  )
}

export default JobList
