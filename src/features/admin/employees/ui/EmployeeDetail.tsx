/**
 * Employee Detail Component
 *
 * Displays detailed view of an employee with crew membership, assigned jobs,
 * and improved layout. Accepts domain Employee or User-like shape plus optional
 * crewName and assignedJobs for integration with EmployeeList.
 */

"use client"

import Link from "next/link"
import FormModal from "@/src/shared/ui/Modal"
import type { Employee } from "@/src/domain/entities"
import { EmployeeStatus } from "@/src/domain/entities"
import type { JobAssignment } from "@/src/domain/models"
import { EyeIcon } from "@heroicons/react/24/outline"

interface EmployeeDetailProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee & { name?: string }
  crewName?: string | null
  assignedJobs?: JobAssignment[]
  /** Builds URL for viewing job details (e.g. (id) => `/admin/jobs/${id}`). When provided, assigned jobs show a "View Job" link. */
  jobDetailUrl?: (jobId: string) => string
}

const EmployeeDetail = ({
  isOpen,
  onClose,
  employee,
  crewName,
  assignedJobs = [],
  jobDetailUrl,
}: EmployeeDetailProps) => {
  const displayName = (employee as any).displayName ?? (employee as any).name ?? "—"
  const hireDate = (employee as any).hireDate ?? (employee as any).joinDate
  const statusStr = String((employee as any).status ?? "").toLowerCase()

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      on_leave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      terminated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800"}`}>
        {status || "—"}
      </span>
    )
  }

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Employee Details" size="lg" footer={null}>
      <div className="space-y-8">
        {/* Basic Information — improved spacing and hierarchy */}
        <section>
          <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
            Basic Information
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Name</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Email</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{(employee as any).email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Phone</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{(employee as any).phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Role</dt>
              <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white capitalize">{(employee as any).role ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Status</dt>
              <dd className="mt-0.5">{getStatusBadge(statusStr)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Department</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{(employee as any).department ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Hire / Join Date</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                {hireDate ? new Date(hireDate).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400 uppercase tracking-wide">Rating</dt>
              <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">
                {(employee as any).rating ? `${Number((employee as any).rating).toFixed(1)} ★` : "—"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Crew membership */}
        <section>
          <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
            Crew membership
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {crewName ?? "Not assigned to a crew"}
          </p>
        </section>

        {/* Assigned jobs */}
        <section>
          <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
            Assigned jobs
          </h3>
          {assignedJobs.length === 0 ? (
            <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">No jobs assigned. Assign jobs from the Jobs page.</p>
          ) : (
            <ul className="space-y-2">
              {assignedJobs.map((a) => (
                <li
                  key={a.jobId}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574]/20"
                >
                  <div>
                    <span className="font-mono text-sm text-[#b85e1a]">{a.jobNumber}</span>
                    <span className="ml-2 text-sm text-[#8b4513] dark:text-[#d4a574]">{a.jobTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#2e8b57]/10 text-[#2e8b57] dark:text-[#4a7c5c]">
                      {a.status}
                    </span>
                    {jobDetailUrl && (
                      <Link
                        href={jobDetailUrl(a.jobId)}
                        className="inline-flex items-center gap-1 text-sm text-[#2e8b57] hover:underline"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Job
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Performance (if available) */}
        {((employee as any).completedJobsCount != null) || ((employee as any).totalHoursWorked != null) ? (
          <section>
            <h3 className="text-base font-semibold text-[#8b4513] dark:text-[#d4a574] mb-3 pb-2 border-b border-[#d4a574]/30">
              Performance
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400">Completed jobs</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{(employee as any).completedJobsCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#b85e1a]/80 dark:text-gray-400">Total hours worked</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{(employee as any).totalHoursWorked ?? "—"}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </FormModal>
  )
}

export default EmployeeDetail
