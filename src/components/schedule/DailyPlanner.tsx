"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import { useDailyPlanner } from "@/src/hooks/useDailyPlanner"
import { Card } from "@/src/shared/ui/Card"
import { Button } from "@/src/shared/ui/Button"
import { Input } from "@/src/shared/ui/Input"
import LoadingState from "@/src/shared/ui/LoadingState"

export default function DailyPlanner() {
  const {
    crews,
    jobs,
    warnings,
    loading,
    submitting,
    error,
    state,
    setState,
    toggleJob,
    submit,
  } = useDailyPlanner()

  const jobsById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs])

  if (loading) {
    return <LoadingState message="Loading planner..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">Daily Planner</h1>
        <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
          Create a workday (schedule + route order) and assign crew members to jobs.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100">
          <div className="font-semibold mb-1">Collision check warning</div>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((w) => (
              <li key={`${w.employeeId}-${w.otherCrewId}`}>
                {w.employeeName} is already scheduled with crew <span className="font-medium">{w.otherCrewName}</span>{" "}
                on this date.
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
            <Input
              type="date"
              value={state.dateYmd}
              onChange={(e) => setState((s) => ({ ...s, dateYmd: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Crew</label>
            <select
              value={state.crewId}
              onChange={(e) => setState((s) => ({ ...s, crewId: e.target.value }))}
              className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#2e8b57]"
            >
              <option value="" disabled>
                Select crew...
              </option>
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              disabled={submitting || !state.crewId || state.jobIds.length === 0}
              onClick={async () => {
                const res = await submit()
                if (!res.ok) {
                  toast.error(res.error)
                  return
                }
                toast.success("Work day created.")
              }}
              className="w-full bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
            >
              {submitting ? "Creating..." : "Create Work Day"}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574]">
              Jobs (route order = selection order)
            </div>
            <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
              Selected: {state.jobIds.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {jobs.map((j) => {
              const checked = state.jobIds.includes(j.id)
              return (
                <label
                  key={j.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    checked
                      ? "border-[#2e8b57] bg-[#2e8b57]/10"
                      : "border-[#d4a574]/30 hover:bg-[#f5f1e6]/60 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleJob(j.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] truncate">
                      {j.title}
                    </div>
                    <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
                      {j.jobNumber} • {j.status}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {state.jobIds.length > 0 && (
          <div className="pt-3 border-t border-[#d4a574]/30">
            <div className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] mb-2">
              Planned route order
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-[#8b4513] dark:text-[#d4a574]">
              {state.jobIds.map((id) => {
                const j = jobsById.get(id)
                return (
                  <li key={id}>
                    {j ? `${j.jobNumber} — ${j.title}` : id}
                  </li>
                )
              })}
            </ol>
            <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-2">
              Start times will be auto-staggered from 7:00 AM in 2-hour blocks (can be refined in Phase 3 timeline UI).
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

