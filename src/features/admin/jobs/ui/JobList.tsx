/**
 * Job List Component
 * 
 * Full CRUD list of all jobs for admin view.
 */

"use client"

import { useState, useEffect } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getJobs, deleteJob } from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import { getAllEmployees } from "@/src/services/employeeService"
import type { Job } from "@/src/domain/entities"
import { JobStatus, Priority } from "@/src/domain/entities"
import JobForm from "./JobForm"
import JobDetail from "./JobDetail"

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

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
    const colors = {
      [JobStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [JobStatus.QUOTED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [JobStatus.SCHEDULED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [JobStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      [JobStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [JobStatus.CANCELLED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [JobStatus.ON_HOLD]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace("_", " ")}
      </span>
    )
  }

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all jobs and work orders
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Job
          </button>
        </div>

        {/* Table */}
        <DataTable
          data={jobs}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          keyExtractor={(job) => job.id}
          emptyMessage="No jobs found. Create your first job to get started."
        />
      </div>

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
        />
      )}
    </>
  )
}

export default JobList
