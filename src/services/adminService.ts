/**
 * Admin Service
 * 
 * Service layer for admin-specific aggregations and summaries.
 * Phase 1: Read-only aggregations only.
 */

import { getAllUsers } from "./userService"
import type { User } from "@/src/domain/models"
import { getAllClients } from "./clientService"
import { getAllEmployees } from "./employeeService"
import { getTasks } from "./taskService"
import { getJobs } from "./jobService"
import { getPayments } from "./paymentService"
import { mockStore } from "@/src/data/mockStore"
import { PaymentStatus, JobStatus, EmployeeStatus, Priority } from "@/src/domain/entities"

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface ActivityLog {
  id: string
  type: "user_created" | "job_created" | "job_updated" | "payment_received" | "client_created" | "employee_created"
  description: string
  user?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface PendingAction {
  id: string
  type: "unassigned_job" | "pending_approval" | "overdue_payment" | "pending_quote"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  link?: string
}

export type HealthStatus = "healthy" | "warning" | "critical"

export interface SystemHealthService {
  name: string
  status: HealthStatus
  lastCheck: string
}

export interface SystemHealth {
  status: HealthStatus
  uptime: number
  activeConnections: number
  services: SystemHealthService[]
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  totalEmployees: number
  activeEmployees: number
  availableEmployees: number
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  totalRevenue: number
  revenueChangePercent: number
  pendingRevenue: number
  activeJobs: number
  pendingJobs: number
  completedJobs: number
}

export interface AdminService {
  getStats(): Promise<AdminStats>
  getRevenueHistory(months?: number): Promise<Array<{ month: string; revenue: number }>>
  getRecentActivity(limit?: number): Promise<ActivityLog[]>
  getPendingActions(): Promise<PendingAction[]>
  getRecentUsers(limit?: number): Promise<User[]>
  getSystemHealth(): SystemHealth
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const adminService: AdminService = {
  getStats: async () => {
    const [users, clients, employees, tasks, jobs, payments] = await Promise.all([
      getAllUsers(),
      getAllClients(),
      getAllEmployees(),
      getTasks(),
      getJobs(),
      getPayments(),
    ])

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Calculate new clients this month
    const newClientsThisMonth = clients.filter((c) => {
      const createdAt = new Date(c.createdAt)
      return createdAt >= thisMonth
    }).length

    // Calculate revenue change
    const thisMonthPayments = payments.filter((p) => {
      if (p.completedAt) {
        const completed = new Date(p.completedAt)
        return completed >= thisMonth && p.status === PaymentStatus.COMPLETED
      }
      return false
    })
    const lastMonthPayments = payments.filter((p) => {
      if (p.completedAt) {
        const completed = new Date(p.completedAt)
        return completed >= lastMonth && completed <= lastMonthEnd && p.status === PaymentStatus.COMPLETED
      }
      return false
    })

    const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount?.amount || 0), 0)
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount?.amount || 0), 0)
    const revenueChangePercent =
      lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED)
    const pendingPayments = payments.filter((p) => p.status === PaymentStatus.PENDING)

    const activeJobs = jobs.filter(
      (j) => j.status === JobStatus.SCHEDULED || j.status === JobStatus.IN_PROGRESS
    ).length
    const pendingJobs = jobs.filter((j) => j.status === JobStatus.DRAFT || j.status === JobStatus.QUOTED).length
    const completedJobs = jobs.filter((j) => j.status === JobStatus.COMPLETED).length

    const availableEmployees = employees.filter((e) => e.status === EmployeeStatus.ACTIVE).length

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "Active").length,
      totalClients: clients.length,
      activeClients: clients.length,
      newClientsThisMonth,
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === EmployeeStatus.ACTIVE).length,
      availableEmployees,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === "pending").length,
      inProgressTasks: tasks.filter((t) => t.status === "in-progress").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalRevenue: completedPayments.reduce((sum, p) => sum + (p.amount?.amount || 0), 0),
      revenueChangePercent: Math.round(revenueChangePercent * 10) / 10,
      pendingRevenue: pendingPayments.reduce((sum, p) => sum + (p.amount?.amount || 0), 0),
      activeJobs,
      pendingJobs,
      completedJobs,
    }
  },

  getRevenueHistory: async (months = 6) => {
    const payments = await getPayments()
    const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED)

    const history: Array<{ month: string; revenue: number }> = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const monthPayments = completedPayments.filter((p) => {
        if (p.completedAt) {
          const completed = new Date(p.completedAt)
          return completed >= date && completed < nextDate
        }
        return false
      })

      const revenue = monthPayments.reduce((sum, p) => sum + (p.amount?.amount || 0), 0)

      history.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue,
      })
    }

    return history
  },

  getRecentActivity: async (limit = 10) => {
    const [users, clients, jobs, payments] = await Promise.all([
      getAllUsers(),
      getAllClients(),
      getJobs(),
      getPayments(),
    ])

    const activities: ActivityLog[] = []

    // Recent users
    users
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 3)
      .forEach((user) => {
        activities.push({
          id: `activity-user-${user.id}`,
          type: "user_created",
          description: `New user ${user.name} (${user.role}) joined`,
          user: user.name,
          timestamp: user.joinDate,
        })
      })

    // Recent clients
    clients
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
      .forEach((client) => {
        activities.push({
          id: `activity-client-${client.id}`,
          type: "client_created",
          description: `New client ${client.name} added`,
          user: client.name,
          timestamp: client.createdAt,
        })
      })

    // Recent jobs
    jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach((job) => {
        activities.push({
          id: `activity-job-${job.id}`,
          type: "job_created",
          description: `Job "${job.title}" created`,
          timestamp: job.createdAt,
          metadata: { jobId: job.id },
        })
      })

    // Recent payments
    payments
      .filter((p) => p.status === PaymentStatus.COMPLETED && p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 2)
      .forEach((payment) => {
        activities.push({
          id: `activity-payment-${payment.id}`,
          type: "payment_received",
          description: `Payment of $${payment.amount.amount} received`,
          timestamp: payment.completedAt!,
          metadata: { paymentId: payment.id },
        })
      })

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  },

  getPendingActions: async () => {
    const [jobs, payments] = await Promise.all([getJobs(), getPayments()])

    const actions: PendingAction[] = []

    // Unassigned jobs
    const unassignedJobs = jobs.filter(
      (j) => (!j.assignedEmployeeIds || j.assignedEmployeeIds.length === 0) && j.status !== JobStatus.COMPLETED
    )
    unassignedJobs.slice(0, 3).forEach((job) => {
      actions.push({
        id: `action-unassigned-${job.id}`,
        type: "unassigned_job",
        title: `Unassigned Job: ${job.title}`,
        description: `Job needs to be assigned to an employee`,
        priority: job.priority === Priority.URGENT || job.priority === Priority.HIGH ? "high" : "medium",
        link: `/admin/jobs`,
      })
    })

    // Overdue payments - check pending payments that are older than 30 days
    const overduePayments = payments.filter((p) => {
      if (p.status === PaymentStatus.PENDING) {
        const paymentDate = new Date(p.createdAt)
        const daysSinceCreated = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceCreated > 30
      }
      return false
    })
    overduePayments.slice(0, 2).forEach((payment) => {
      actions.push({
        id: `action-overdue-${payment.id}`,
        type: "overdue_payment",
        title: `Overdue Payment: $${payment.amount.amount}`,
        description: `Payment is past due date`,
        priority: "high",
        link: `/admin/payments`,
      })
    })

    // Pending quotes
    const pendingQuotes = jobs.filter((j) => j.status === JobStatus.QUOTED)
    if (pendingQuotes.length > 0) {
      actions.push({
        id: `action-quotes-${pendingQuotes.length}`,
        type: "pending_quote",
        title: `${pendingQuotes.length} Pending Quote(s)`,
        description: `Quotes awaiting client approval`,
        priority: "medium",
        link: `/admin/quotes`,
      })
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  },

  getRecentUsers: async (limit = 10) => {
    const users = await getAllUsers()
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
      services: [
        { name: "API Server", status: "healthy" as const, lastCheck: new Date().toISOString() },
        { name: "Database", status: "healthy" as const, lastCheck: new Date().toISOString() },
        { name: "Payment Gateway", status: "healthy" as const, lastCheck: new Date().toISOString() },
        { name: "Email Service", status: "warning" as const, lastCheck: new Date(Date.now() - 300000).toISOString() },
      ],
    }
  },
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAdminStats = () => adminService.getStats()
export const getRevenueHistory = (months?: number) => adminService.getRevenueHistory(months)
export const getRecentActivity = (limit?: number) => adminService.getRecentActivity(limit)
export const getPendingActions = () => adminService.getPendingActions()
export const getRecentUsers = (limit?: number) => adminService.getRecentUsers(limit)
export const getSystemHealth = () => adminService.getSystemHealth()
