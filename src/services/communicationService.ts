/**
 * Communication Service
 * 
 * Service layer for communication management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Communication, EntityId } from "@/src/domain/entities"
import { CommunicationType, CommunicationDirection, Priority } from "@/src/domain/entities"
import { getClients } from "./clientService"
import { getEmployees } from "./employeeService"
import { getJobs } from "./jobService"

// Initialize with seed data if empty (lazy initialization)
let communicationsInitialized = false
const initializeCommunications = () => {
  if (communicationsInitialized || mockStore.getCommunications().length > 0) {
    communicationsInitialized = true
    return
  }
  
  try {
    const clients = getClients()
    const employees = getEmployees()
    const jobs = getJobs()
    
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
  getAll(): Communication[]
  getById(id: EntityId): Communication | undefined
  getByClientId(clientId: EntityId): Communication[]
  getByJobId(jobId: EntityId): Communication[]
  getByEmployeeId(employeeId: EntityId): Communication[]
  create(
    communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
  ): Communication
  update(id: EntityId, updates: Partial<Communication>): Communication | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const communicationService: CommunicationService = {
  getAll: () => {
    initializeCommunications()
    return mockStore.getCommunications()
  },

  getById: (id: EntityId) => {
    initializeCommunications()
    return mockStore.getCommunicationById(id)
  },

  getByClientId: (clientId: EntityId) => {
    initializeCommunications()
    return mockStore.getCommunicationsByClientId(clientId)
  },

  getByJobId: (jobId: EntityId) => {
    initializeCommunications()
    return mockStore.getCommunicationsByJobId(jobId)
  },

  getByEmployeeId: (employeeId: EntityId) => {
    initializeCommunications()
    return mockStore
      .getCommunications()
      .filter((comm) => comm.employeeId === employeeId)
  },

  create: (communication) => mockStore.createCommunication(communication),

  update: (id, updates) => mockStore.updateCommunication(id, updates),

  delete: (id) => mockStore.deleteCommunication(id),
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
