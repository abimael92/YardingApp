/**
 * Task Service (Legacy)
 * 
 * This service provides backward compatibility with the old Task model.
 * It converts Jobs to Tasks for components that haven't been migrated yet.
 */

import { getJobs } from "./jobService"
import type { Task } from "@/src/domain/models"
import { JobStatus, Priority } from "@/src/domain/entities"

// Convert Job to Task for backward compatibility
const jobToTask = (job: any): Task => {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    status: mapJobStatusToTaskStatus(job.status),
    priority: mapPriorityToTaskPriority(job.priority),
    assignedTo: job.assignedEmployeeIds?.[0] ? getEmployeeName(job.assignedEmployeeIds[0]) : undefined,
    dueDate: job.scheduledStart ? new Date(job.scheduledStart).toISOString().split("T")[0] : "",
    location: `${job.address.street}, ${job.address.city}, ${job.address.state} ${job.address.zipCode}`,
    estimatedDuration: `${Math.round(job.estimatedDuration / 60)} hours`,
  }
}

const mapJobStatusToTaskStatus = (status: string): "pending" | "in-progress" | "completed" | "cancelled" => {
  switch (status) {
    case JobStatus.DRAFT:
    case JobStatus.QUOTED:
    case JobStatus.SCHEDULED:
      return "pending"
    case JobStatus.IN_PROGRESS:
      return "in-progress"
    case JobStatus.COMPLETED:
      return "completed"
    case JobStatus.CANCELLED:
    case JobStatus.ON_HOLD:
      return "cancelled"
    default:
      return "pending"
  }
}

const mapPriorityToTaskPriority = (priority: string): "low" | "medium" | "high" => {
  switch (priority) {
    case Priority.LOW:
      return "low"
    case Priority.MEDIUM:
      return "medium"
    case Priority.HIGH:
    case Priority.URGENT:
      return "high"
    default:
      return "medium"
  }
}

const getEmployeeName = (employeeId: string): string => {
  try {
    const { getEmployeeById } = require("./employeeService")
    const employee = getEmployeeById(employeeId)
    return employee?.displayName || "Unknown"
  } catch {
    return "Unknown"
  }
}

export const getTasks = (): Task[] => {
  const jobs = getJobs()
  return jobs.map(jobToTask)
}
