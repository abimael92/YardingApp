/**
 * Schedule Service
 * 
 * Service layer for schedule management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Schedule, EntityId, ScheduleStatus } from "@/src/domain/entities"
import { ScheduleStatus as ScheduleStatusEnum } from "@/src/domain/entities"
import { getJobs } from "./jobService"
import { getEmployees } from "./employeeService"

// Initialize with seed data if empty (lazy initialization)
let schedulesInitialized = false
const initializeSchedules = () => {
  if (schedulesInitialized || mockStore.getSchedules().length > 0) {
    schedulesInitialized = true
    return
  }
  
  try {
    const jobs = getJobs()
    const employees = getEmployees()
    
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
  getAll(): Schedule[]
  getById(id: EntityId): Schedule | undefined
  getByJobId(jobId: EntityId): Schedule[]
  getByEmployeeId(employeeId: EntityId): Schedule[]
  getByStatus(status: ScheduleStatus): Schedule[]
  create(schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">): Schedule
  update(id: EntityId, updates: Partial<Schedule>): Schedule | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const scheduleService: ScheduleService = {
  getAll: () => {
    initializeSchedules()
    return mockStore.getSchedules()
  },

  getById: (id: EntityId) => {
    initializeSchedules()
    return mockStore.getScheduleById(id)
  },

  getByJobId: (jobId: EntityId) => {
    initializeSchedules()
    return mockStore.getSchedulesByJobId(jobId)
  },

  getByEmployeeId: (employeeId: EntityId) => {
    initializeSchedules()
    return mockStore.getSchedulesByEmployeeId(employeeId)
  },

  getByStatus: (status: ScheduleStatus) => {
    initializeSchedules()
    return mockStore.getSchedules().filter((schedule) => schedule.status === status)
  },

  create: (schedule) => mockStore.createSchedule(schedule),

  update: (id, updates) => mockStore.updateSchedule(id, updates),

  delete: (id) => mockStore.deleteSchedule(id),
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
