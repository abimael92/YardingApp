/**
 * Admin Service
 * 
 * Service layer for admin-specific aggregations and summaries.
 * Phase 1: Read-only aggregations only.
 */

import { getAllUsers } from "./userService"
import { getAllClients } from "./clientService"
import { getAllEmployees } from "./employeeService"
import { getTasks } from "./taskService"
import { mockStore } from "@/src/data/mockStore"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface AdminService {
  getStats(): {
    totalUsers: number
    activeUsers: number
    totalClients: number
    activeClients: number
    totalEmployees: number
    activeEmployees: number
    totalTasks: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    totalRevenue: number
    pendingRevenue: number
  }
  getRecentUsers(limit?: number): ReturnType<typeof getAllUsers>
  getSystemHealth(): {
    status: "healthy" | "warning" | "critical"
    uptime: number
    activeConnections: number
  }
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const adminService: AdminService = {
  getStats: () => {
    const users = getAllUsers()
    const clients = getAllClients()
    const employees = getAllEmployees()
    const tasks = getTasks()
    const payments = mockStore.getPayments()

    const completedPayments = payments.filter((p) => p.status === "completed")
    const pendingPayments = payments.filter((p) => p.status === "pending")

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "Active").length,
      totalClients: clients.length,
      activeClients: clients.length, // All clients are considered active in mock
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "available" || e.status === "busy")
        .length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalRevenue: completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingRevenue: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    }
  },

  getRecentUsers: (limit = 10) => {
    const users = getAllUsers()
    // Sort by joinDate descending and limit
    return users
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, limit)
  },

  getSystemHealth: () => {
    // Mock system health data
    return {
      status: "healthy" as const,
      uptime: 99.2,
      activeConnections: 156,
    }
  },
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAdminStats = () => adminService.getStats()
export const getRecentUsers = (limit?: number) => adminService.getRecentUsers(limit)
export const getSystemHealth = () => adminService.getSystemHealth()
