/**
 * Client Service
 * 
 * Service layer for client management operations.
 * All methods return Promises to mimic async API calls.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Client, EntityId } from "@/src/domain/entities"
import { asyncify, asyncifyWithError } from "./utils"

// Re-export Client type for convenience
export type { Client } from "@/src/domain/entities"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface ClientService {
  getAll(): Promise<Client[]>
  getById(id: EntityId): Promise<Client | undefined>
  create(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client>
  update(id: EntityId, updates: Partial<Client>): Promise<Client | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const clientService: ClientService = {
  getAll: () => asyncify(() => mockStore.getClients()),

  getById: (id: EntityId) => asyncify(() => mockStore.getClientById(id)),

  create: (client) =>
    asyncifyWithError(() => {
      const newClient = mockStore.createClient(client)
      return newClient
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateClient(id, updates)
      if (!updated) {
        throw new Error(`Client with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteClient(id)
      if (!deleted) {
        throw new Error(`Client with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions (API-ready)
// ============================================================================

export const getAllClients = () => clientService.getAll()
export const getClientById = (id: EntityId) => clientService.getById(id)
export const createClient = (client: Omit<Client, "id" | "createdAt" | "updatedAt">) =>
  clientService.create(client)
export const updateClient = (id: EntityId, updates: Partial<Client>) =>
  clientService.update(id, updates)
export const deleteClient = (id: EntityId) => clientService.delete(id)
