/**
 * User Service
 * 
 * Service layer for user management operations.
 * Phase 1: Read-only access only.
 */

import { mockStore } from "@/src/data/mockStore"
import type { User } from "@/src/domain/models"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface UserService {
  getAll(): User[]
  getById(id: string): User | undefined
  getByRole(role: User["role"]): User[]
  getByStatus(status: User["status"]): User[]
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const userService: UserService = {
  getAll: () => mockStore.getUsers(),

  getById: (id: string) => mockStore.getUserById(id),

  getByRole: (role: User["role"]) => mockStore.getUsersByRole(role),

  getByStatus: (status: User["status"]) => mockStore.getUsersByStatus(status),
}

// ============================================================================
// Convenience Functions (for backward compatibility)
// ============================================================================

export const getAllUsers = () => userService.getAll()
export const getUserById = (id: string) => userService.getById(id)
export const getUsersByRole = (role: User["role"]) => userService.getByRole(role)
export const getUsersByStatus = (status: User["status"]) => userService.getByStatus(status)
