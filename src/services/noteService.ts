/**
 * Note Service
 *
 * Service layer for job notes used in client context. Reads from Neon DB `job_notes` table.
 * Notes are linked to jobs; client notes are all job_notes for jobs belonging to that client.
 * No database schema changes.
 */

import { neon } from "@neondatabase/serverless"
import type { EntityId } from "@/src/domain/entities"

export interface JobNoteRecord {
  id: string
  jobId: string
  noteType: string | null
  note: string
  createdBy: string | null
  isPrivate: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

/** Shape used by ClientNotes UI */
export interface NoteForUI {
  id: string
  content: string
  createdBy: string
  createdAt: Date
  updatedAt?: Date
  category: "general" | "issue" | "followup" | "feedback" | "internal"
  priority?: "low" | "medium" | "high"
  attachments?: Array<{ name: string; url: string }>
  isPrivate: boolean
  isArchived: boolean
}

const getSql = () => neon(process.env.DATABASE_URL!)

function mapCategory(noteType: string | null): NoteForUI["category"] {
  if (!noteType) return "general"
  const t = noteType.toLowerCase()
  if (["issue", "followup", "feedback", "internal"].includes(t))
    return t as NoteForUI["category"]
  return "general"
}

export const noteService = {
  /**
   * Get all job notes for jobs belonging to the given client.
   */
  async getByClientId(clientId: EntityId): Promise<NoteForUI[]> {
    try {
      const sql = getSql()
      const rows = await sql`
        SELECT 
          jn.id,
          jn.job_id as "jobId",
          jn.note_type as "noteType",
          jn.note,
          jn.created_by as "createdBy",
          COALESCE(jn.is_private, false) as "isPrivate",
          COALESCE(jn.is_archived, false) as "isArchived",
          jn.created_at as "createdAt",
          jn.updated_at as "updatedAt"
        FROM job_notes jn
        INNER JOIN jobs j ON j.id = jn.job_id
        WHERE j.client_id = ${clientId}
        ORDER BY jn.created_at DESC
      `
      return (rows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        content: String(row.note ?? ""),
        createdBy: row.createdBy != null ? String(row.createdBy) : "System",
        createdAt: new Date(String(row.createdAt)),
        updatedAt:
          row.updatedAt != null ? new Date(String(row.updatedAt)) : undefined,
        category: mapCategory(
          row.noteType != null ? String(row.noteType) : null
        ),
        isPrivate: Boolean(row.isPrivate),
        isArchived: Boolean(row.isArchived),
      }))
    } catch (error) {
      console.error("noteService.getByClientId error:", error)
      return []
    }
  },

  async getByJobId(jobId: EntityId): Promise<NoteForUI[]> {
    try {
      const sql = getSql()
      const rows = await sql`
        SELECT 
          id,
          job_id as "jobId",
          note_type as "noteType",
          note,
          created_by as "createdBy",
          COALESCE(is_private, false) as "isPrivate",
          COALESCE(is_archived, false) as "isArchived",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM job_notes
        WHERE job_id = ${jobId}
        ORDER BY created_at DESC
      `
      return (rows as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        content: String(row.note ?? ""),
        createdBy: row.createdBy != null ? String(row.createdBy) : "System",
        createdAt: new Date(String(row.createdAt)),
        updatedAt:
          row.updatedAt != null ? new Date(String(row.updatedAt)) : undefined,
        category: mapCategory(
          row.noteType != null ? String(row.noteType) : null
        ),
        isPrivate: Boolean(row.isPrivate),
        isArchived: Boolean(row.isArchived),
      }))
    } catch (error) {
      console.error("noteService.getByJobId error:", error)
      return []
    }
  },
}

export const getClientNotes = (clientId: EntityId) =>
  noteService.getByClientId(clientId)

export const getJobNotes = (jobId: EntityId) =>
  noteService.getByJobId(jobId)
