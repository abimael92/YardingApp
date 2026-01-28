/**
 * Job Detail Component
 * 
 * Displays detailed view of a job
 */

"use client"

import FormModal from "@/src/shared/ui/FormModal"
import type { Job, Client, Employee } from "@/src/domain/entities"
import { JobStatus, Priority } from "@/src/domain/entities"

interface JobDetailProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  clients: Client[]
  employees: Employee[]
}

const JobDetail = ({ isOpen, onClose, job, clients, employees }: JobDetailProps) => {
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

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Unknown"
  }

  const getEmployeeNames = (employeeIds: string[]) => {
    return employeeIds
      .map((id) => {
        const employee = employees.find((e) => e.id === id)
        return employee?.displayName
      })
      .filter(Boolean)
      .join(", ") || "None"
  }

  const getStatusBadge = (status: JobStatus) => {
    const colors: Record<JobStatus, string> = {
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

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Job Details" size="xl" footer={null}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.jobNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">{getStatusBadge(job.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {getClientName(job.clientId)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                {job.priority}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {getEmployeeNames(job.assignedEmployeeIds)}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{job.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="text-sm text-gray-900 dark:text-white">
            <p>{job.address.street}</p>
            <p>
              {job.address.city}, {job.address.state} {job.address.zipCode}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Financial Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quoted Price</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(job.quotedPrice)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estimated Cost
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(job.estimatedCost)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Price</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {job.finalPrice ? formatCurrency(job.finalPrice) : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Scheduling</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Scheduled Start
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(job.scheduledStart)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Scheduled End
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(job.scheduledEnd)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Start</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(job.actualStart)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual End</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(job.actualEnd)}
              </dd>
            </div>
          </dl>
        </div>

        {job.tasks && job.tasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tasks</h3>
            <div className="space-y-2">
              {job.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormModal>
  )
}

export default JobDetail
