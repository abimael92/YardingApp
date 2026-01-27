/**
 * Client Service
 * 
 * Service layer for client management operations.
 * Phase 1: Read-only access only.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Client } from "@/src/domain/entities"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface ClientService {
  getAll(): Client[]
  getById(id: string): Client | undefined
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const clientService: ClientService = {
  getAll: () => mockStore.getClients(),

  getById: (id: string) => mockStore.getClientById(id),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllClients = () => clientService.getAll()
export const getClientById = (id: string) => clientService.getById(id)
