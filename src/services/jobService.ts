/**
 * Job Service
 * 
 * Service layer for job management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Job, EntityId, JobStatus, Priority } from "@/src/domain/entities"
import { JobStatus as JobStatusEnum, Priority as PriorityEnum } from "@/src/domain/entities"
import { getAllClients } from "./clientService"
import { getAllEmployees } from "./employeeService"
import { asyncify, asyncifyWithError } from "./utils"

// Initialize with seed data if empty (lazy initialization)
let initialized = false
const initializeJobs = async () => {
  if (initialized || mockStore.getJobs().length > 0) {
    initialized = true
    return
  }
  
  try {
    const clients = await getAllClients()
    const employees = await getAllEmployees()
    
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
  getAll(): Promise<Job[]>
  getById(id: EntityId): Promise<Job | undefined>
  getByClientId(clientId: EntityId): Promise<Job[]>
  getByEmployeeId(employeeId: EntityId): Promise<Job[]>
  getByStatus(status: JobStatus): Promise<Job[]>
  create(job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">): Promise<Job>
  update(id: EntityId, updates: Partial<Job>): Promise<Job | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const jobService: JobService = {
  getAll: async () => {
    await initializeJobs()
    return asyncify(() => mockStore.getJobs())
  },

  getById: async (id: EntityId) => {
    await initializeJobs()
    return asyncify(() => mockStore.getJobById(id))
  },

  getByClientId: async (clientId: EntityId) => {
    await initializeJobs()
    return asyncify(() => mockStore.getJobsByClientId(clientId))
  },

  getByEmployeeId: async (employeeId: EntityId) => {
    await initializeJobs()
    return asyncify(() => mockStore.getJobsByEmployeeId(employeeId))
  },

  getByStatus: async (status: JobStatus) => {
    await initializeJobs()
    return asyncify(() => mockStore.getJobs().filter((job) => job.status === status))
  },

  create: (job) =>
    asyncifyWithError(() => {
      const newJob = mockStore.createJob(job)
      return newJob
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateJob(id, updates)
      if (!updated) {
        throw new Error(`Job with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteJob(id)
      if (!deleted) {
        throw new Error(`Job with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getJobs = () => jobService.getAll()
export const getJobById = (id: EntityId) => jobService.getById(id)
export const getJobsByClientId = (clientId: EntityId) => jobService.getByClientId(clientId)
export const getJobsByEmployeeId = (employeeId: EntityId) => jobService.getByEmployeeId(employeeId)
export const getJobsByStatus = (status: JobStatus) => jobService.getByStatus(status)
export const createJob = (job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">) =>
  jobService.create(job)
export const updateJob = (id: EntityId, updates: Partial<Job>) => jobService.update(id, updates)
export const deleteJob = (id: EntityId) => jobService.delete(id)
