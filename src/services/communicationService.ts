/**
 * Communication Service
 * 
 * Service layer for communication management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Communication, EntityId } from "@/src/domain/entities"
import { CommunicationType, CommunicationDirection, Priority } from "@/src/domain/entities"
import { getAllClients } from "./clientService"
import { getAllEmployees } from "./employeeService"
import { getJobs } from "./jobService"
import { asyncify, asyncifyWithError } from "./utils"

// Initialize with seed data if empty (lazy initialization)
let communicationsInitialized = false
const initializeCommunications = async () => {
  if (communicationsInitialized || mockStore.getCommunications().length > 0) {
    communicationsInitialized = true
    return
  }
  
  try {
    const clients = await getAllClients()
    const employees = await getAllEmployees()
    const jobs = await getJobs()
    
    if (clients.length > 0 && employees.length > 0 && jobs.length > 0) {
      const client = clients[0]
      const employee = employees[0]
      const job = jobs[0]

      mockStore.createCommunication({
        clientId: client.id,
        employeeId: employee.id,
        jobId: job.id,
        type: CommunicationType.EMAIL,
        direction: CommunicationDirection.OUTBOUND,
        subject: "Job Scheduled",
        content: "Your job has been scheduled for tomorrow at 9:00 AM.",
        status: "sent",
        priority: Priority.MEDIUM,
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      })
    }
    communicationsInitialized = true
  } catch (error) {
    console.warn("Failed to initialize communications:", error)
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface CommunicationService {
  getAll(): Promise<Communication[]>
  getById(id: EntityId): Promise<Communication | undefined>
  getByClientId(clientId: EntityId): Promise<Communication[]>
  getByJobId(jobId: EntityId): Promise<Communication[]>
  getByEmployeeId(employeeId: EntityId): Promise<Communication[]>
  create(
    communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
  ): Promise<Communication>
  update(id: EntityId, updates: Partial<Communication>): Promise<Communication | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const communicationService: CommunicationService = {
  getAll: async () => {
    await initializeCommunications()
    return asyncify(() => mockStore.getCommunications())
  },

  getById: async (id: EntityId) => {
    await initializeCommunications()
    return asyncify(() => mockStore.getCommunicationById(id))
  },

  getByClientId: async (clientId: EntityId) => {
    await initializeCommunications()
    return asyncify(() => mockStore.getCommunicationsByClientId(clientId))
  },

  getByJobId: async (jobId: EntityId) => {
    await initializeCommunications()
    return asyncify(() => mockStore.getCommunicationsByJobId(jobId))
  },

  getByEmployeeId: async (employeeId: EntityId) => {
    await initializeCommunications()
    return asyncify(() =>
      mockStore.getCommunications().filter((comm) => comm.employeeId === employeeId)
    )
  },

  create: (communication) =>
    asyncifyWithError(() => {
      const newComm = mockStore.createCommunication(communication)
      return newComm
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateCommunication(id, updates)
      if (!updated) {
        throw new Error(`Communication with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteCommunication(id)
      if (!deleted) {
        throw new Error(`Communication with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getCommunications = () => communicationService.getAll()
export const getCommunicationById = (id: EntityId) => communicationService.getById(id)
export const getCommunicationsByClientId = (clientId: EntityId) =>
  communicationService.getByClientId(clientId)
export const getCommunicationsByJobId = (jobId: EntityId) =>
  communicationService.getByJobId(jobId)
export const createCommunication = (
  communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
) => communicationService.create(communication)
export const updateCommunication = (id: EntityId, updates: Partial<Communication>) =>
  communicationService.update(id, updates)
export const deleteCommunication = (id: EntityId) => communicationService.delete(id)
