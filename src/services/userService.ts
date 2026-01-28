/**
 * User Service
 * 
 * Service layer for user management operations.
 * All methods return Promises to mimic async API calls.
 */

import { mockStore } from "@/src/data/mockStore"
import type { User } from "@/src/domain/models"
import { asyncify, asyncifyWithError } from "./utils"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface UserService {
  getAll(): Promise<User[]>
  getById(id: string): Promise<User | undefined>
  getByRole(role: User["role"]): Promise<User[]>
  getByStatus(status: User["status"]): Promise<User[]>
  create(user: Omit<User, "id" | "joinDate">): Promise<User>
  update(id: string, updates: Partial<User>): Promise<User | undefined>
  delete(id: string): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const userService: UserService = {
  getAll: () => asyncify(() => mockStore.getUsers()),

  getById: (id: string) => asyncify(() => mockStore.getUserById(id)),

  getByRole: (role: User["role"]) => asyncify(() => mockStore.getUsersByRole(role)),

  getByStatus: (status: User["status"]) => asyncify(() => mockStore.getUsersByStatus(status)),

  create: (user) =>
    asyncifyWithError(() => {
      const newUser = mockStore.createUser(user)
      return newUser
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateUser(id, updates)
      if (!updated) {
        throw new Error(`User with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteUser(id)
      if (!deleted) {
        throw new Error(`User with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllUsers = () => userService.getAll()
export const getUserById = (id: string) => userService.getById(id)
export const getUsersByRole = (role: User["role"]) => userService.getByRole(role)
export const getUsersByStatus = (status: User["status"]) => userService.getByStatus(status)
export const createUser = (user: Omit<User, "id" | "joinDate">) => userService.create(user)
export const updateUser = (id: string, updates: Partial<User>) => userService.update(id, updates)
export const deleteUser = (id: string) => userService.delete(id)
