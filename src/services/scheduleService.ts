/**
 * Schedule Service
 * 
 * Service layer for schedule management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Schedule, EntityId, ScheduleStatus } from "@/src/domain/entities"
import { ScheduleStatus as ScheduleStatusEnum } from "@/src/domain/entities"
import { getJobs } from "./jobService"
import { getAllEmployees } from "./employeeService"
import { asyncify, asyncifyWithError } from "./utils"

// Initialize with seed data if empty (lazy initialization)
let schedulesInitialized = false
const initializeSchedules = async () => {
  if (schedulesInitialized || mockStore.getSchedules().length > 0) {
    schedulesInitialized = true
    return
  }
  
  try {
    const jobs = await getJobs()
    const employees = await getAllEmployees()
    
    if (jobs.length > 0 && employees.length > 0) {
      const job = jobs[0]
      const employee = employees[0]
      const now = new Date()
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      const end = new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString() // 2 hours later

      mockStore.createSchedule({
        jobId: job.id,
        employeeIds: [employee.id],
        scheduledStart: start,
        scheduledEnd: end,
        timeRange: {
          start,
          end,
        },
        status: ScheduleStatusEnum.SCHEDULED,
        address: job.address,
        isRecurring: false,
        reminderSent: false,
      })
    }
    schedulesInitialized = true
  } catch (error) {
    console.warn("Failed to initialize schedules:", error)
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface ScheduleService {
  getAll(): Promise<Schedule[]>
  getById(id: EntityId): Promise<Schedule | undefined>
  getByJobId(jobId: EntityId): Promise<Schedule[]>
  getByEmployeeId(employeeId: EntityId): Promise<Schedule[]>
  getByStatus(status: ScheduleStatus): Promise<Schedule[]>
  create(schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">): Promise<Schedule>
  update(id: EntityId, updates: Partial<Schedule>): Promise<Schedule | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const scheduleService: ScheduleService = {
  getAll: async () => {
    await initializeSchedules()
    return asyncify(() => mockStore.getSchedules())
  },

  getById: async (id: EntityId) => {
    await initializeSchedules()
    return asyncify(() => mockStore.getScheduleById(id))
  },

  getByJobId: async (jobId: EntityId) => {
    await initializeSchedules()
    return asyncify(() => mockStore.getSchedulesByJobId(jobId))
  },

  getByEmployeeId: async (employeeId: EntityId) => {
    await initializeSchedules()
    return asyncify(() => mockStore.getSchedulesByEmployeeId(employeeId))
  },

  getByStatus: async (status: ScheduleStatus) => {
    await initializeSchedules()
    return asyncify(() => mockStore.getSchedules().filter((schedule) => schedule.status === status))
  },

  create: (schedule) =>
    asyncifyWithError(() => {
      const newSchedule = mockStore.createSchedule(schedule)
      return newSchedule
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateSchedule(id, updates)
      if (!updated) {
        throw new Error(`Schedule with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteSchedule(id)
      if (!deleted) {
        throw new Error(`Schedule with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getSchedules = () => scheduleService.getAll()
export const getScheduleById = (id: EntityId) => scheduleService.getById(id)
export const getSchedulesByJobId = (jobId: EntityId) => scheduleService.getByJobId(jobId)
export const getSchedulesByEmployeeId = (employeeId: EntityId) =>
  scheduleService.getByEmployeeId(employeeId)
export const createSchedule = (
  schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">
) => scheduleService.create(schedule)
export const updateSchedule = (id: EntityId, updates: Partial<Schedule>) =>
  scheduleService.update(id, updates)
export const deleteSchedule = (id: EntityId) => scheduleService.delete(id)
