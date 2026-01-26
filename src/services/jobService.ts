/**
 * Job Service
 * 
 * Service layer for job management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Job, EntityId, JobStatus, Priority } from "@/src/domain/entities"
import { JobStatus as JobStatusEnum, Priority as PriorityEnum } from "@/src/domain/entities"
import { getClients } from "./clientService"
import { getEmployees } from "./employeeService"

// Initialize with seed data if empty (lazy initialization)
let initialized = false
const initializeJobs = () => {
  if (initialized || mockStore.getJobs().length > 0) {
    initialized = true
    return
  }
  
  try {
    const clients = getClients()
    const employees = getEmployees()
    
    if (clients.length > 0 && employees.length > 0) {
      const client = clients[0]
      const employee = employees[0]

      mockStore.createJob({
        clientId: client.id,
        status: JobStatusEnum.IN_PROGRESS,
        title: "Weekly Lawn Maintenance - Johnson Residence",
        description: "Mow, edge, and trim lawn. Remove clippings.",
        priority: PriorityEnum.MEDIUM,
        address: client.primaryAddress,
        tasks: [
          {
            id: `task-${Date.now()}-1`,
            title: "Mow lawn",
            description: "Cut grass to 2 inches",
            status: "completed",
            priority: PriorityEnum.MEDIUM,
            estimatedDuration: 60,
            order: 1,
          },
          {
            id: `task-${Date.now()}-2`,
            title: "Edge and trim",
            description: "Edge along sidewalks and trim around trees",
            status: "in_progress",
            priority: PriorityEnum.MEDIUM,
            estimatedDuration: 30,
            order: 2,
          },
        ],
        estimatedDuration: 120,
        estimatedCost: { amount: 150.0, currency: "USD" },
        assignedEmployeeIds: [employee.id],
        quotedPrice: { amount: 150.0, currency: "USD" },
      })
    }
    initialized = true
  } catch (error) {
    // Silently fail if dependencies aren't ready yet
    console.warn("Failed to initialize jobs:", error)
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface JobService {
  getAll(): Job[]
  getById(id: EntityId): Job | undefined
  getByClientId(clientId: EntityId): Job[]
  getByEmployeeId(employeeId: EntityId): Job[]
  getByStatus(status: JobStatus): Job[]
  create(job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">): Job
  update(id: EntityId, updates: Partial<Job>): Job | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const jobService: JobService = {
  getAll: () => {
    initializeJobs()
    return mockStore.getJobs()
  },

  getById: (id: EntityId) => {
    initializeJobs()
    return mockStore.getJobById(id)
  },

  getByClientId: (clientId: EntityId) => {
    initializeJobs()
    return mockStore.getJobsByClientId(clientId)
  },

  getByEmployeeId: (employeeId: EntityId) => {
    initializeJobs()
    return mockStore.getJobsByEmployeeId(employeeId)
  },

  getByStatus: (status: JobStatus) => {
    initializeJobs()
    return mockStore.getJobs().filter((job) => job.status === status)
  },

  create: (job) => mockStore.createJob(job),

  update: (id, updates) => mockStore.updateJob(id, updates),

  delete: (id) => mockStore.deleteJob(id),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getJobs = () => jobService.getAll()
export const getJobById = (id: EntityId) => jobService.getById(id)
export const getJobsByClientId = (clientId: EntityId) => jobService.getByClientId(clientId)
export const getJobsByEmployeeId = (employeeId: EntityId) => jobService.getByEmployeeId(employeeId)
export const createJob = (job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">) =>
  jobService.create(job)
export const updateJob = (id: EntityId, updates: Partial<Job>) => jobService.update(id, updates)
export const deleteJob = (id: EntityId) => jobService.delete(id)
