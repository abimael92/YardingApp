/**
 * Schedule Service
 * 
 * Service layer for schedule management operations.
 */

import { neon } from "@neondatabase/serverless"
import { mockStore } from "@/src/data/mockStore"
import type { Schedule, EntityId, ScheduleStatus } from "@/src/domain/entities"
import { ScheduleStatus as ScheduleStatusEnum } from "@/src/domain/entities"
import { asyncify, asyncifyWithError } from "./utils"

const canUseDb =
  typeof process !== "undefined" &&
  !!process.env.DATABASE_URL

// Initialize with seed data if empty (lazy initialization) - only used when DB is unavailable.
let schedulesInitialized = false
const initializeSchedules = async () => {
  if (schedulesInitialized || mockStore.getSchedules().length > 0) {
    schedulesInitialized = true
    return
  }

  const jobs = mockStore.getJobs()
  const employees = mockStore.getEmployees()

  if (jobs.length > 0 && employees.length > 0) {
    const job = jobs[0]
    const employee = employees[0]
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    const end = new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000).toISOString() // +2 hours

    mockStore.createSchedule({
      jobId: job.id,
      employeeIds: [employee.id],
      scheduledStart: start,
      scheduledEnd: end,
      timeRange: { start, end },
      status: ScheduleStatusEnum.SCHEDULED,
      address: job.address,
      isRecurring: false,
      reminderSent: false,
    })
  }

  schedulesInitialized = true
}

const mapScheduleStatusFromDb = (dbStatus?: string | null): ScheduleStatus => {
  switch ((dbStatus ?? "").toLowerCase()) {
    case "in_progress":
      return ScheduleStatusEnum.IN_PROGRESS
    case "completed":
      return ScheduleStatusEnum.COMPLETED
    case "cancelled":
      return ScheduleStatusEnum.CANCELLED
    case "rescheduled":
      return ScheduleStatusEnum.RESCHEDULED
    // schedule_jobs defaults to 'pending' which we treat as 'scheduled' for UI.
    case "pending":
    case "scheduled":
    default:
      return ScheduleStatusEnum.SCHEDULED
  }
}

const mapScheduleJobStatusFromUi = (status: ScheduleStatus): string => {
  switch (status) {
    case ScheduleStatusEnum.IN_PROGRESS:
      return "in_progress"
    case ScheduleStatusEnum.COMPLETED:
      return "completed"
    case ScheduleStatusEnum.CANCELLED:
      return "cancelled"
    case ScheduleStatusEnum.RESCHEDULED:
      return "rescheduled"
    case ScheduleStatusEnum.SCHEDULED:
    default:
      return "pending"
  }
}

const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  // dateStr is expected as 'YYYY-MM-DD'; timeStr as 'HH:MM:SS'
  // Construct as local-time Date to match the existing UI formatting behavior.
  return new Date(`${dateStr}T${timeStr}`).toISOString()
}

const getTimeComponents = (iso: string) => {
  const d = new Date(iso)
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
  return { date, time, ms: d.getTime() }
}

const mapScheduleRowToEntity = (row: any): Schedule => {
  const employeeIds: string[] = (row.employeeIds ?? []).filter(Boolean)

  const scheduledStart = (() => {
    if (row.actualStartTime) return new Date(row.actualStartTime).toISOString()
    if (row.estimatedStartTime && row.scheduleDate)
      return combineDateAndTime(String(row.scheduleDate), String(row.estimatedStartTime))
    if (row.scheduleDate) return new Date(`${row.scheduleDate}T00:00:00`).toISOString()
    return new Date().toISOString()
  })()

  const scheduledEnd = (() => {
    if (row.actualEndTime) return new Date(row.actualEndTime).toISOString()
    if (row.estimatedDurationMinutes != null) {
      const startMs = new Date(scheduledStart).getTime()
      return new Date(startMs + Number(row.estimatedDurationMinutes) * 60 * 1000).toISOString()
    }
    if (row.scheduleDate) return new Date(`${row.scheduleDate}T02:00:00`).toISOString()
    return new Date(new Date(scheduledStart).getTime() + 60 * 60 * 1000).toISOString()
  })()

  const status = mapScheduleStatusFromDb(row.jobScheduleStatus)

  return {
    id: row.scheduleJobId,
    jobId: row.jobId,
    employeeIds,
    scheduledStart,
    scheduledEnd,
    timeRange: { start: scheduledStart, end: scheduledEnd },
    status,
    address: {
      street: row.street,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      country: row.country ?? "US",
    },
    travelTime: row.travelTimeMinutes ?? undefined,
    notes: row.notes ?? undefined,
    reminderSent: false,
    isRecurring: false,
    createdAt: row.createdAt ?? scheduledStart,
    updatedAt: row.updatedAt ?? scheduledEnd,
    cancelledAt: undefined,
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
    if (!canUseDb) {
      await initializeSchedules()
      return asyncify(() => mockStore.getSchedules())
    }

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT
        sj.id as "scheduleJobId",
        sj.job_id as "jobId",
        sj.route_order as "routeOrder",
        sj.estimated_start_time as "estimatedStartTime",
        sj.estimated_duration_minutes as "estimatedDurationMinutes",
        sj.actual_start_time as "actualStartTime",
        sj.actual_end_time as "actualEndTime",
        sj.status as "jobScheduleStatus",
        sj.notes as "notes",
        sj.travel_time_minutes as "travelTimeMinutes",
        s.date as "scheduleDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        j.street as "street",
        j.city as "city",
        j.state as "state",
        j.zip_code as "zipCode",
        j.country as "country",
        COALESCE(array_agg(DISTINCT cm.employee_id) FILTER (WHERE cm.employee_id IS NOT NULL), ARRAY[]::uuid[]) as "employeeIds"
      FROM schedule_jobs sj
      JOIN schedules s ON sj.schedule_id = s.id
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN crew_members cm ON cm.crew_id = s.crew_id AND (cm.is_active IS NULL OR cm.is_active = true)
      GROUP BY
        sj.id, s.date, j.street, j.city, j.state, j.zip_code, j.country,
        sj.job_id, sj.route_order, sj.estimated_start_time, sj.estimated_duration_minutes,
        sj.actual_start_time, sj.actual_end_time, sj.status, sj.notes, sj.travel_time_minutes
        , s.created_at, s.updated_at
      ORDER BY s.date ASC, sj.route_order ASC
    `

    return rows.map(mapScheduleRowToEntity)
  },

  getById: async (id: EntityId) => {
    if (!canUseDb) {
      await initializeSchedules()
      return asyncify(() => mockStore.getScheduleById(id))
    }

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT
        sj.id as "scheduleJobId",
        sj.job_id as "jobId",
        sj.route_order as "routeOrder",
        sj.estimated_start_time as "estimatedStartTime",
        sj.estimated_duration_minutes as "estimatedDurationMinutes",
        sj.actual_start_time as "actualStartTime",
        sj.actual_end_time as "actualEndTime",
        sj.status as "jobScheduleStatus",
        sj.notes as "notes",
        sj.travel_time_minutes as "travelTimeMinutes",
        s.date as "scheduleDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        j.street as "street",
        j.city as "city",
        j.state as "state",
        j.zip_code as "zipCode",
        j.country as "country",
        COALESCE(array_agg(DISTINCT cm.employee_id) FILTER (WHERE cm.employee_id IS NOT NULL), ARRAY[]::uuid[]) as "employeeIds"
      FROM schedule_jobs sj
      JOIN schedules s ON sj.schedule_id = s.id
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN crew_members cm ON cm.crew_id = s.crew_id AND (cm.is_active IS NULL OR cm.is_active = true)
      WHERE sj.id = ${id}
      GROUP BY
        sj.id, s.date, j.street, j.city, j.state, j.zip_code, j.country,
        sj.job_id, sj.route_order, sj.estimated_start_time, sj.estimated_duration_minutes,
        sj.actual_start_time, sj.actual_end_time, sj.status, sj.notes, sj.travel_time_minutes
        , s.created_at, s.updated_at
    `

    if (rows.length === 0) return undefined
    return mapScheduleRowToEntity(rows[0])
  },

  getByJobId: async (jobId: EntityId) => {
    if (!canUseDb) {
      await initializeSchedules()
      return asyncify(() => mockStore.getSchedulesByJobId(jobId))
    }

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT
        sj.id as "scheduleJobId",
        sj.job_id as "jobId",
        sj.route_order as "routeOrder",
        sj.estimated_start_time as "estimatedStartTime",
        sj.estimated_duration_minutes as "estimatedDurationMinutes",
        sj.actual_start_time as "actualStartTime",
        sj.actual_end_time as "actualEndTime",
        sj.status as "jobScheduleStatus",
        sj.notes as "notes",
        sj.travel_time_minutes as "travelTimeMinutes",
        s.date as "scheduleDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        j.street as "street",
        j.city as "city",
        j.state as "state",
        j.zip_code as "zipCode",
        j.country as "country",
        COALESCE(array_agg(DISTINCT cm.employee_id) FILTER (WHERE cm.employee_id IS NOT NULL), ARRAY[]::uuid[]) as "employeeIds"
      FROM schedule_jobs sj
      JOIN schedules s ON sj.schedule_id = s.id
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN crew_members cm ON cm.crew_id = s.crew_id AND (cm.is_active IS NULL OR cm.is_active = true)
      WHERE sj.job_id = ${jobId}
      GROUP BY
        sj.id, s.date, j.street, j.city, j.state, j.zip_code, j.country,
        sj.job_id, sj.route_order, sj.estimated_start_time, sj.estimated_duration_minutes,
        sj.actual_start_time, sj.actual_end_time, sj.status, sj.notes, sj.travel_time_minutes
        , s.created_at, s.updated_at
      ORDER BY s.date ASC, sj.route_order ASC
    `

    return rows.map(mapScheduleRowToEntity)
  },

  getByEmployeeId: async (employeeId: EntityId) => {
    if (!canUseDb) {
      await initializeSchedules()
      return asyncify(() => mockStore.getSchedulesByEmployeeId(employeeId))
    }

    const sql = neon(process.env.DATABASE_URL!)
    const rows = await sql`
      SELECT
        sj.id as "scheduleJobId",
        sj.job_id as "jobId",
        sj.route_order as "routeOrder",
        sj.estimated_start_time as "estimatedStartTime",
        sj.estimated_duration_minutes as "estimatedDurationMinutes",
        sj.actual_start_time as "actualStartTime",
        sj.actual_end_time as "actualEndTime",
        sj.status as "jobScheduleStatus",
        sj.notes as "notes",
        sj.travel_time_minutes as "travelTimeMinutes",
        s.date as "scheduleDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        j.street as "street",
        j.city as "city",
        j.state as "state",
        j.zip_code as "zipCode",
        j.country as "country",
        COALESCE(array_agg(DISTINCT cm.employee_id) FILTER (WHERE cm.employee_id IS NOT NULL), ARRAY[]::uuid[]) as "employeeIds"
      FROM schedule_jobs sj
      JOIN schedules s ON sj.schedule_id = s.id
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN crew_members cm ON cm.crew_id = s.crew_id AND (cm.is_active IS NULL OR cm.is_active = true)
      WHERE cm.employee_id = ${employeeId}
      GROUP BY
        sj.id, s.date, j.street, j.city, j.state, j.zip_code, j.country,
        sj.job_id, sj.route_order, sj.estimated_start_time, sj.estimated_duration_minutes,
        sj.actual_start_time, sj.actual_end_time, sj.status, sj.notes, sj.travel_time_minutes
        , s.created_at, s.updated_at
      ORDER BY s.date ASC, sj.route_order ASC
    `

    return rows.map(mapScheduleRowToEntity)
  },

  getByStatus: async (status: ScheduleStatus) => {
    if (!canUseDb) {
      await initializeSchedules()
      return asyncify(() =>
        mockStore.getSchedules().filter((schedule) => schedule.status === status),
      )
    }

    const sql = neon(process.env.DATABASE_URL!)
    const dbStatuses = (() => {
      switch (status) {
        case ScheduleStatusEnum.IN_PROGRESS:
          return ["in_progress"]
        case ScheduleStatusEnum.COMPLETED:
          return ["completed"]
        case ScheduleStatusEnum.CANCELLED:
          return ["cancelled"]
        case ScheduleStatusEnum.RESCHEDULED:
          return ["rescheduled"]
        case ScheduleStatusEnum.SCHEDULED:
        default:
          return ["pending", "scheduled"]
      }
    })()

    const rows = await sql`
      SELECT
        sj.id as "scheduleJobId",
        sj.job_id as "jobId",
        sj.route_order as "routeOrder",
        sj.estimated_start_time as "estimatedStartTime",
        sj.estimated_duration_minutes as "estimatedDurationMinutes",
        sj.actual_start_time as "actualStartTime",
        sj.actual_end_time as "actualEndTime",
        sj.status as "jobScheduleStatus",
        sj.notes as "notes",
        sj.travel_time_minutes as "travelTimeMinutes",
        s.date as "scheduleDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        j.street as "street",
        j.city as "city",
        j.state as "state",
        j.zip_code as "zipCode",
        j.country as "country",
        COALESCE(array_agg(DISTINCT cm.employee_id) FILTER (WHERE cm.employee_id IS NOT NULL), ARRAY[]::uuid[]) as "employeeIds"
      FROM schedule_jobs sj
      JOIN schedules s ON sj.schedule_id = s.id
      JOIN jobs j ON sj.job_id = j.id
      LEFT JOIN crew_members cm ON cm.crew_id = s.crew_id AND (cm.is_active IS NULL OR cm.is_active = true)
      WHERE sj.status = ANY(${dbStatuses}::character varying[])
      GROUP BY
        sj.id, s.date, j.street, j.city, j.state, j.zip_code, j.country,
        sj.job_id, sj.route_order, sj.estimated_start_time, sj.estimated_duration_minutes,
        sj.actual_start_time, sj.actual_end_time, sj.status, sj.notes, sj.travel_time_minutes
        , s.created_at, s.updated_at
      ORDER BY s.date ASC, sj.route_order ASC
    `

    return rows.map(mapScheduleRowToEntity)
  },

  create: async (schedule) => {
    // For now, only the admin "Setup Day" flow will reliably use schedules + schedule_jobs.
    // If a caller uses this generic create API, we attempt to derive a crew_id from employeeIds.
    if (!canUseDb) {
      return asyncifyWithError(() => {
        const newSchedule = mockStore.createSchedule(schedule)
        return newSchedule
      })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const start = new Date(schedule.scheduledStart)
    const end = new Date(schedule.scheduledEnd)
    const { date: dateStr, time: startTimeStr, ms: startMs } = getTimeComponents(
      schedule.scheduledStart,
    )
    const durationMinutes = Math.max(0, Math.round((end.getTime() - startMs) / 60000))

    let crewId: string | null = null
    if (schedule.employeeIds?.length) {
      const matches = await sql`
        SELECT cm.crew_id
        FROM crew_members cm
        WHERE cm.employee_id = ANY(${schedule.employeeIds}::uuid[])
          AND (cm.is_active IS NULL OR cm.is_active = true)
        GROUP BY cm.crew_id
        HAVING COUNT(DISTINCT cm.employee_id) = ${schedule.employeeIds.length}
        ORDER BY cm.crew_id ASC
        LIMIT 1
      `
      crewId = matches[0]?.crew_id ?? null
    }

    const scheduleStatus = schedule.status

    const scheduleInsert = await sql`
      INSERT INTO schedules (crew_id, date, status, notes, created_by, created_at, updated_at)
      VALUES (${crewId}, ${dateStr}, ${scheduleStatus}::character varying, ${schedule.notes ?? null}, null, NOW(), NOW())
      RETURNING id
    `

    const scheduleId = scheduleInsert[0]?.id
    if (!scheduleId) throw new Error("Failed to create schedule row")

    const scheduleJobStatus = mapScheduleJobStatusFromUi(scheduleStatus)
    const inserted = await sql`
      INSERT INTO schedule_jobs (
        schedule_id,
        job_id,
        route_order,
        estimated_start_time,
        estimated_duration_minutes,
        status,
        notes
      )
      VALUES (
        ${scheduleId},
        ${schedule.jobId},
        1,
        ${startTimeStr}::time,
        ${durationMinutes || null},
        ${scheduleJobStatus}::character varying,
        ${schedule.notes ?? null}
      )
      RETURNING id
    `

    const scheduleJobId = inserted[0]?.id
    if (!scheduleJobId) throw new Error("Failed to create schedule_jobs row")

    const created = await scheduleService.getById(scheduleJobId)
    if (!created) throw new Error("Failed to map created schedule")
    return created
  },

  update: async (id, updates) => {
    if (!canUseDb) {
      return asyncifyWithError(() => {
        const updated = mockStore.updateSchedule(id, updates)
        if (!updated) {
          throw new Error(`Schedule with id ${id} not found`)
        }
        return updated
      })
    }

    const sql = neon(process.env.DATABASE_URL!)

    const status =
      updates.status != null ? mapScheduleJobStatusFromUi(updates.status) : undefined

    // Use explicit SQL to keep types predictable.
    const startEndProvided = updates.scheduledStart && updates.scheduledEnd
    const hasNotes = updates.notes !== undefined

    const base = sql`
      UPDATE schedule_jobs
      SET
        job_id = COALESCE(${updates.jobId ?? null}, job_id),
        notes = COALESCE(${hasNotes ? updates.notes ?? null : null}, notes),
        status = COALESCE(${status ?? null}::character varying, status)
    `

    let startTimeStr: string | null = null
    let durationMinutes: number | null = null
    if (startEndProvided) {
      const startComp = getTimeComponents(updates.scheduledStart!)
      const endDate = new Date(updates.scheduledEnd!)
      startTimeStr = startComp.time
      durationMinutes = Math.max(
        0,
        Math.round((endDate.getTime() - startComp.ms) / 60000),
      )
    }

    const updateSql =
      startTimeStr != null
        ? sql`
            ${base}
            , estimated_start_time = ${startTimeStr}::time
            , estimated_duration_minutes = ${durationMinutes || null}
          `
        : base

    // Run and then fetch.
    await updateSql
    return scheduleService.getById(id)
  },

  delete: async (id) => {
    if (!canUseDb) {
      return asyncifyWithError(() => {
        const deleted = mockStore.deleteSchedule(id)
        if (!deleted) {
          throw new Error(`Schedule with id ${id} not found`)
        }
        return deleted
      })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      DELETE FROM schedule_jobs
      WHERE id = ${id}
      RETURNING id
    `

    return result.length > 0
  },
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
