import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getDailyPlannerData,
  previewCrewDayCollisions,
  submitCreateWorkDay,
} from "@/app/actions/schedulePlanner"
import type { Crew } from "@/src/services/crewService"
import type { CrewDayCollision, PlannerJobOption } from "@/src/services/schedulePlannerService"

export type DailyPlannerState = {
  dateYmd: string
  crewId: string
  jobIds: string[]
}

const todayYmd = () => new Date().toISOString().slice(0, 10)

export function useDailyPlanner() {
  const [crews, setCrews] = useState<Crew[]>([])
  const [jobs, setJobs] = useState<PlannerJobOption[]>([])
  const [warnings, setWarnings] = useState<CrewDayCollision[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [state, setState] = useState<DailyPlannerState>({
    dateYmd: todayYmd(),
    crewId: "",
    jobIds: [],
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDailyPlannerData()
      setCrews(data.crews)
      setJobs(data.jobs)
      setState((s) => ({
        ...s,
        crewId: s.crewId || data.crews[0]?.id || "",
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load planner data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedCrew = useMemo(
    () => crews.find((c) => c.id === state.crewId) ?? null,
    [crews, state.crewId],
  )

  const refreshWarnings = useCallback(async () => {
    if (!state.crewId || !state.dateYmd) {
      setWarnings([])
      return
    }
    const r = await previewCrewDayCollisions(state.crewId, state.dateYmd)
    setWarnings(r.warnings)
  }, [state.crewId, state.dateYmd])

  useEffect(() => {
    refreshWarnings().catch(() => {
      // best-effort
    })
  }, [refreshWarnings])

  const toggleJob = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      jobIds: s.jobIds.includes(jobId)
        ? s.jobIds.filter((id) => id !== jobId)
        : [...s.jobIds, jobId],
    }))
  }, [])

  const submit = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await submitCreateWorkDay(state.dateYmd, state.crewId, state.jobIds)
      if (!res.success) {
        setError(res.error)
        return { ok: false as const, error: res.error }
      }
      setWarnings(res.warnings)
      return { ok: true as const, scheduleId: res.scheduleId, warnings: res.warnings }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create work day"
      setError(msg)
      return { ok: false as const, error: msg }
    } finally {
      setSubmitting(false)
    }
  }, [state.dateYmd, state.crewId, state.jobIds])

  return {
    crews,
    jobs,
    warnings,
    loading,
    submitting,
    error,
    state,
    selectedCrew,
    setState,
    toggleJob,
    submit,
    reload: load,
  }
}

