/**
 * Job Form Component
 * 
 * Form for creating and editing jobs
 */

"use client"

import { useState, useEffect } from "react"
import FormModal from "@/src/shared/ui/FormModal"
import { createJob, updateJob } from "@/src/services/jobService"
import type { Job, Client, Employee } from "@/src/domain/entities"
import { JobStatus, Priority } from "@/src/domain/entities"

interface JobFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  job?: Job | null
  clients: Client[]
  employees: Employee[]
}

const JobForm = ({ isOpen, onClose, onSuccess, job, clients, employees }: JobFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    status: JobStatus.DRAFT,
    priority: Priority.MEDIUM,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    estimatedDuration: "",
    estimatedCost: "",
    assignedEmployeeIds: [] as string[],
    quotedPrice: "",
  })

  useEffect(() => {
    if (job) {
      setFormData({
        clientId: job.clientId,
        title: job.title,
        description: job.description,
        status: job.status,
        priority: job.priority,
        street: job.address.street,
        city: job.address.city,
        state: job.address.state,
        zipCode: job.address.zipCode,
        estimatedDuration: job.estimatedDuration.toString(),
        estimatedCost: job.estimatedCost.amount.toString(),
        assignedEmployeeIds: job.assignedEmployeeIds,
        quotedPrice: job.quotedPrice.amount.toString(),
      })
    } else {
      setFormData({
        clientId: clients[0]?.id || "",
        title: "",
        description: "",
        status: JobStatus.DRAFT,
        priority: Priority.MEDIUM,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        estimatedDuration: "",
        estimatedCost: "",
        assignedEmployeeIds: [],
        quotedPrice: "",
      })
    }
  }, [job, isOpen, clients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const jobData: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt"> = {
        clientId: formData.clientId,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        tasks: [],
        estimatedDuration: parseInt(formData.estimatedDuration) || 0,
        estimatedCost: {
          amount: parseFloat(formData.estimatedCost) || 0,
          currency: "USD",
        },
        assignedEmployeeIds: formData.assignedEmployeeIds,
        quotedPrice: {
          amount: parseFloat(formData.quotedPrice) || 0,
          currency: "USD",
        },
      }

      if (job) {
        await updateJob(job.id, jobData)
      } else {
        await createJob(jobData)
      }

      onSuccess()
    } catch (error) {
      console.error("Failed to save job:", error)
      alert("Failed to save job. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleEmployee = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployeeIds: prev.assignedEmployeeIds.includes(employeeId)
        ? prev.assignedEmployeeIds.filter((id) => id !== employeeId)
        : [...prev.assignedEmployeeIds, employeeId],
    }))
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? "Edit Job" : "Create New Job"}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="job-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : job ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Client *
          </label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.values(JobStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.values(Priority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street *
              </label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quoted Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.quotedPrice}
              onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assign Employees
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
            {employees.map((employee) => (
              <label
                key={employee.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={formData.assignedEmployeeIds.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-900 dark:text-white">{employee.displayName}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </FormModal>
  )
}

export default JobForm
