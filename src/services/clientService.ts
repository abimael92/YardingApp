/**
 * Client Service
 * 
 * Service layer for client management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Client, EntityId } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"

// Initialize with seed data if empty
const initializeClients = () => {
  if (mockStore.getClients().length === 0) {
    const now = new Date().toISOString()
    mockStore.createClient({
      name: "Johnson Family",
      contactInfo: {
        email: "johnson@example.com",
        phone: "+1-555-0101",
        preferredContactMethod: "email",
      },
      primaryAddress: {
        street: "1234 Desert View Dr",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
      },
      status: ClientStatus.ACTIVE,
      segment: ClientSegment.REGULAR,
      totalSpent: { amount: 2450.0, currency: "USD" },
      lifetimeValue: { amount: 2450.0, currency: "USD" },
      serviceRequestIds: [],
      quoteIds: [],
      jobIds: [],
      paymentIds: [],
      communicationIds: [],
    })

    mockStore.createClient({
      name: "Smith Property Management",
      contactInfo: {
        email: "smith@example.com",
        phone: "+1-555-0102",
        preferredContactMethod: "phone",
      },
      primaryAddress: {
        street: "5678 Cactus Rd",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85002",
      },
      status: ClientStatus.ACTIVE,
      segment: ClientSegment.VIP,
      totalSpent: { amount: 12500.0, currency: "USD" },
      lifetimeValue: { amount: 12500.0, currency: "USD" },
      serviceRequestIds: [],
      quoteIds: [],
      jobIds: [],
      paymentIds: [],
      communicationIds: [],
    })
  }
}

// Initialize on import
initializeClients()

// ============================================================================
// Service Interface
// ============================================================================

export interface ClientService {
  getAll(): Client[]
  getById(id: EntityId): Client | undefined
  create(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Client
  update(id: EntityId, updates: Partial<Client>): Client | undefined
  delete(id: EntityId): boolean
  getByStatus(status: ClientStatus): Client[]
  getBySegment(segment: ClientSegment): Client[]
}

// ============================================================================
// Service Implementation
// ============================================================================

export const clientService: ClientService = {
  getAll: () => mockStore.getClients(),

  getById: (id: EntityId) => mockStore.getClientById(id),

  create: (client) => mockStore.createClient(client),

  update: (id, updates) => mockStore.updateClient(id, updates),

  delete: (id) => mockStore.deleteClient(id),

  getByStatus: (status) => mockStore.getClients().filter((c) => c.status === status),

  getBySegment: (segment) => mockStore.getClients().filter((c) => c.segment === segment),
}

// ============================================================================
// Convenience Functions (for backward compatibility)
// ============================================================================

export const getClients = () => clientService.getAll()
export const getClientById = (id: EntityId) => clientService.getById(id)
export const createClient = (client: Omit<Client, "id" | "createdAt" | "updatedAt">) =>
  clientService.create(client)
export const updateClient = (id: EntityId, updates: Partial<Client>) =>
  clientService.update(id, updates)
export const deleteClient = (id: EntityId) => clientService.delete(id)
