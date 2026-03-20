"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"
import { Card } from "@/src/shared/ui/Card"
import { Button } from "@/src/shared/ui/Button"
import { Modal } from "@/src/shared/ui/Modal"
import { EmptyState } from "@/src/shared/ui/EmptyState"
import type { Crew, CrewMember, CrewJob } from "@/src/services/crewService"

const TABS = [
  { id: "crews", label: "Crews", icon: UserGroupIcon },
  { id: "employees", label: "Employees", icon: UserIcon },
  { id: "assignments", label: "Assignments", icon: ClipboardDocumentListIcon },
] as const

type TabId = (typeof TABS)[number]["id"]

interface Employee {
  id: string
  fullName: string
  email: string
  status: string
  role?: string
  employeeNumber?: string
  department?: string
  position?: string
}

interface JobOption {
  id: string
  jobNumber: string
  title: string
  status: string
  clientId: string
  quotedPriceCents: string | number
  createdAt: string
}

export function CrewManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("crews")
  const [crews, setCrews] = useState<Crew[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [jobs, setJobs] = useState<JobOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCrewForm, setShowCrewForm] = useState(false)
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null)
  const [selectedCrew, setSelectedCrew] = useState<{ crew: Crew; members: CrewMember[]; jobs: CrewJob[] } | null>(null)
  const [assigningTo, setAssigningTo] = useState<"crew" | "employee" | null>(null)
  const [assignTargetId, setAssignTargetId] = useState<string | null>(null)
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set())

  const fetchCrews = useCallback(async () => {
    try {
      const res = await fetch("/api/crews")
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setCrews(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load crews")
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees")
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setEmployees(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load employees")
    }
  }, [])

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs/available?limit=200")
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setJobs(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load jobs")
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchCrews(), fetchEmployees(), fetchJobs()]).finally(() => setLoading(false))
  }, [fetchCrews, fetchEmployees, fetchJobs])

  const loadCrewDetail = useCallback(async (crewId: string) => {
    try {
      const [crewRes, membersRes, jobsRes] = await Promise.all([
        fetch(`/api/crews/${crewId}`),
        fetch(`/api/crews/${crewId}/members`),
        fetch(`/api/crews/${crewId}/jobs`),
      ])
      if (!crewRes.ok) throw new Error("Crew not found")
      const crew = await crewRes.json()
      const members = membersRes.ok ? await membersRes.json() : []
      const jobs = jobsRes.ok ? await jobsRes.json() : []
      setSelectedCrew({ crew, members, jobs })
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load crew")
    }
  }, [])

  const handleCreateCrew = async (name: string, description?: string) => {
    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Create failed")
      await fetchCrews()
      setShowCrewForm(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create crew")
    }
  }

  const handleUpdateCrew = async (id: string, data: { name?: string; description?: string | null }) => {
    try {
      const res = await fetch(`/api/crews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Update failed")
      await fetchCrews()
      if (selectedCrew?.crew.id === id) {
        const updated = await fetch(`/api/crews/${id}`).then((r) => r.json())
        setSelectedCrew((prev) => (prev ? { ...prev, crew: updated } : null))
      }
      setEditingCrew(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update crew")
    }
  }

  const handleDeleteCrew = async (id: string) => {
    if (!confirm("Delete this crew? Members and job assignments will be removed.")) return
    try {
      const res = await fetch(`/api/crews/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
      await fetchCrews()
      if (selectedCrew?.crew.id === id) setSelectedCrew(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete crew")
    }
  }

  const handleAddMember = async (crewId: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Add failed")
      if (selectedCrew?.crew.id === crewId) await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add member")
    }
  }

  const handleRemoveMember = async (crewId: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/members?employeeId=${encodeURIComponent(employeeId)}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Remove failed")
      if (selectedCrew?.crew.id === crewId) await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove member")
    }
  }

  const handleAssignJobsToCrew = async (crewId: string, jobIds: string[]) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Assign failed")
      if (selectedCrew?.crew.id === crewId) await loadCrewDetail(crewId)
      setAssigningTo(null)
      setAssignTargetId(null)
      setSelectedJobIds(new Set())
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to assign jobs")
    }
  }

  const handleAssignJobToEmployee = async (employeeId: string, jobId: string) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Assign failed")
      setAssigningTo(null)
      setAssignTargetId(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to assign job")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">Crew Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage crews, assign employees, and assign jobs to crews or individuals.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#d4a574]/30 dark:border-[#8b4513]/50">
        <nav className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#2e8b57] text-[#2e8b57] dark:text-[#4a7c5c]"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-[#8b4513] dark:hover:text-[#d4a574]"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "crews" && (
          <motion.div
            key="crews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingCrew(null)
                  setShowCrewForm(true)
                }}
                className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Crew
              </Button>
            </div>
            {crews.length === 0 ? (
              <EmptyState
                title="No crews yet"
                description="Create a crew to assign employees and jobs."
                action={<Button onClick={() => setShowCrewForm(true)} className="bg-[#2e8b57] text-white">Add Crew</Button>}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {crews.map((crew) => (
                  <Card key={crew.id} className="p-4 border border-[#d4a574]/30 dark:border-[#8b4513]/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#8b4513] dark:text-[#d4a574]">{crew.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {crew.memberCount ?? 0} members · Supervisor: {crew.supervisorName || "—"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadCrewDetail(crew.id)}
                          className="p-2 rounded-lg hover:bg-[#2e8b57]/10 text-[#2e8b57]"
                          title="View / Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCrew(crew.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadCrewDetail(crew.id)}
                        className="w-full border-[#d4a574] text-[#8b4513] dark:text-[#d4a574]"
                      >
                        Manage crew
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "employees" && (
          <motion.div
            key="employees"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto"
          >
            {employees.length === 0 ? (
              <EmptyState title="No employees" description="Employees will appear here from your system." />
            ) : (
              <table className="w-full text-sm border border-[#d4a574]/30 dark:border-[#8b4513]/50 rounded-lg overflow-hidden">
                <thead className="bg-[#f5f1e6] dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Name</th>
                    <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Email</th>
                    <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Role</th>
                    <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Status</th>
                    <th className="text-right p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/30">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50">
                      <td className="p-3">{emp.fullName}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{emp.email}</td>
                      <td className="p-3">{emp.role ?? "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${emp.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssigningTo("employee")
                            setAssignTargetId(emp.id)
                          }}
                          className="border-[#2e8b57] text-[#2e8b57] hover:bg-[#2e8b57]/10"
                        >
                          Assign job
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}

        {activeTab === "assignments" && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto"
          >
            {jobs.length === 0 ? (
              <EmptyState title="No jobs" description="Jobs will appear here. Create jobs first." />
            ) : (
              <>
                <table className="w-full text-sm border border-[#d4a574]/30 dark:border-[#8b4513]/50 rounded-lg overflow-hidden">
                  <thead className="bg-[#f5f1e6] dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Job #</th>
                      <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Title</th>
                      <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Status</th>
                      <th className="text-left p-3 font-medium text-[#8b4513] dark:text-[#d4a574]">Quote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/30">
                    {jobs.slice(0, 50).map((job) => (
                      <tr key={job.id} className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-mono">{job.jobNumber}</td>
                        <td className="p-3">{job.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3">
                          ${Number(job.quotedPriceCents || 0) / 100}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jobs.length > 50 && <p className="text-sm text-gray-500 mt-2">Showing first 50 of {jobs.length} jobs.</p>}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Crew Modal */}
      {showCrewForm && (
        <CrewFormModal
          crew={editingCrew}
          onClose={() => {
            setShowCrewForm(false)
            setEditingCrew(null)
          }}
          onSave={editingCrew ? (data) => handleUpdateCrew(editingCrew.id, data) : (data) => handleCreateCrew(data.name, data.description)}
        />
      )}

      {/* Crew Detail Modal (members + jobs) */}
      {selectedCrew && (
        <CrewDetailModal
          crew={selectedCrew.crew}
          members={selectedCrew.members}
          crewJobs={selectedCrew.jobs}
          employees={employees}
          jobs={jobs}
          onClose={() => setSelectedCrew(null)}
          onAddMember={(empId) => handleAddMember(selectedCrew.crew.id, empId)}
          onRemoveMember={(empId) => handleRemoveMember(selectedCrew.crew.id, empId)}
          onAssignJobs={(jobIds) => handleAssignJobsToCrew(selectedCrew.crew.id, jobIds)}
          onRefresh={() => loadCrewDetail(selectedCrew.crew.id)}
        />
      )}

      {/* Assign job to employee modal */}
      {assigningTo === "employee" && assignTargetId && (
        <AssignJobModal
          title="Assign job to employee"
          jobs={jobs}
          onSelect={(jobId) => {
            handleAssignJobToEmployee(assignTargetId, jobId)
          }}
          onClose={() => {
            setAssigningTo(null)
            setAssignTargetId(null)
          }}
        />
      )}
    </div>
  )
}

function CrewFormModal({
  crew,
  onClose,
  onSave,
}: {
  crew: Crew | null
  onClose: () => void
  onSave: (data: { name: string; description?: string }) => void
}) {
  const [name, setName] = useState(crew?.name ?? "")
  const [description, setDescription] = useState(crew?.description ?? "")

  return (
    <Modal isOpen={true} title={crew ? "Edit crew" : "New crew"} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            placeholder="Crew name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            rows={2}
            placeholder="Optional"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ name, description: description || undefined })} className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white">
            {crew ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function CrewDetailModal({
  crew,
  members,
  crewJobs,
  employees,
  jobs,
  onClose,
  onAddMember,
  onRemoveMember,
  onAssignJobs,
  onRefresh,
}: {
  crew: Crew
  members: CrewMember[]
  crewJobs: CrewJob[]
  employees: Employee[]
  jobs: JobOption[]
  onClose: () => void
  onAddMember: (employeeId: string) => void
  onRemoveMember: (employeeId: string) => void
  onAssignJobs: (jobIds: string[]) => void
  onRefresh: () => void
}) {
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [assignJobsOpen, setAssignJobsOpen] = useState(false)
  const memberIds = new Set(members.map((m) => m.employeeId))
  const availableEmployees = employees.filter((e) => !memberIds.has(e.id))

  return (
    <Modal isOpen={true} title={crew.name} onClose={onClose} size="lg">
      <div className="space-y-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor: {crew.supervisorName || "—"} · Region: {crew.region || "—"}</p>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574]">Members ({members.length})</h4>
            <Button size="sm" onClick={() => setAddMemberOpen(true)} disabled={availableEmployees.length === 0} className="bg-[#2e8b57] text-white">
              <PlusIcon className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-800">
                <span>{m.employeeName}</span>
                <button onClick={() => onRemoveMember(m.employeeId)} className="text-red-600 hover:underline text-sm">Remove</button>
              </li>
            ))}
            {members.length === 0 && <li className="text-sm text-gray-500">No members. Add employees to this crew.</li>}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574]">Assigned jobs ({crewJobs.length})</h4>
            <Button size="sm" onClick={() => setAssignJobsOpen(true)} className="bg-[#2e8b57] text-white">
              <PlusIcon className="w-4 h-4 mr-1" /> Assign jobs
            </Button>
          </div>
          <ul className="space-y-1">
            {crewJobs.map((j) => (
              <li key={j.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-800 text-sm">
                <span>{j.jobNumber} – {j.jobTitle}</span>
                <span className="text-gray-500">{j.status}</span>
              </li>
            ))}
            {crewJobs.length === 0 && <li className="text-sm text-gray-500">No jobs assigned. Assign jobs to this crew.</li>}
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>

      {addMemberOpen && (
        <Modal isOpen={true} title="Add member" onClose={() => setAddMemberOpen(false)} size="sm">
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {availableEmployees.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => { onAddMember(e.id); setAddMemberOpen(false); onRefresh(); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-[#2e8b57]/10"
                >
                  {e.fullName} · {e.email}
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {assignJobsOpen && (
        <AssignJobsBulkModal
          jobs={jobs}
          onSelect={(jobIds) => { onAssignJobs(jobIds); setAssignJobsOpen(false); onRefresh(); }}
          onClose={() => setAssignJobsOpen(false)}
        />
      )}
    </Modal>
  )
}

function AssignJobModal({
  title,
  jobs,
  onSelect,
  onClose,
}: {
  title: string
  jobs: JobOption[]
  onSelect: (jobId: string) => void
  onClose: () => void
}) {
  return (
    <Modal isOpen={true} title={title} onClose={onClose} size="md">
      <ul className="space-y-1 max-h-72 overflow-y-auto">
        {jobs.slice(0, 100).map((j) => (
          <li key={j.id}>
            <button
              onClick={() => { onSelect(j.id); onClose(); }}
              className="w-full text-left px-3 py-2 rounded hover:bg-[#2e8b57]/10 flex justify-between"
            >
              <span>{j.jobNumber} – {j.title}</span>
              <span className="text-gray-500">{j.status}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

function AssignJobsBulkModal({
  jobs,
  onSelect,
  onClose,
}: {
  jobs: JobOption[]
  onSelect: (jobIds: string[]) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Modal isOpen={true} title="Assign jobs to crew" onClose={onClose} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Select jobs to assign to this crew.</p>
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {jobs.slice(0, 100).map((j) => (
            <li key={j.id}>
              <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input type="checkbox" checked={selected.has(j.id)} onChange={() => toggle(j.id)} className="rounded text-[#2e8b57]" />
                <span>{j.jobNumber} – {j.title}</span>
                <span className="text-gray-500 text-sm">{j.status}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSelect(Array.from(selected)); onClose(); }} disabled={selected.size === 0} className="bg-[#2e8b57] text-white">
            Assign {selected.size} job(s)
          </Button>
        </div>
      </div>
    </Modal>
  )
}
