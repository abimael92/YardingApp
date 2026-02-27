"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import {
  XMarkIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { formatRelativeTime } from "@/src/features/admin/utils/formatters"
import { getRecentActivityForModal } from "@/app/actions/dashboard"
import type { ActivityLog } from "@/src/services/adminService"

const ACTIVITY_TYPE_TITLES: Record<ActivityLog["type"], string> = {
  user_created: "User Created",
  job_created: "Job Created",
  job_updated: "Job Updated",
  payment_received: "Payment Received",
  client_created: "Client Created",
  employee_created: "Employee Created",
}

function getActivityIcon(type: ActivityLog["type"]) {
  switch (type) {
    case "user_created":
    case "client_created":
    case "employee_created":
      return UserGroupIcon
    case "job_created":
    case "job_updated":
      return ClipboardDocumentListIcon
    case "payment_received":
      return CurrencyDollarIcon
    default:
      return ClockIcon
  }
}

function getActivityIconColor(type: ActivityLog["type"]) {
  switch (type) {
    case "payment_received":
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    case "user_created":
    case "client_created":
    case "employee_created":
      return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
    case "job_created":
    case "job_updated":
      return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30"
    default:
      return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
  }
}

function getActivityLink(activity: ActivityLog): string | undefined {
  const meta = activity.metadata as { jobId?: string; paymentId?: string } | undefined
  switch (activity.type) {
    case "user_created":
    case "employee_created":
      return "/admin/employees"
    case "client_created":
      return "/admin/clients"
    case "job_created":
    case "job_updated":
      return meta?.jobId ? `/admin/jobs/${meta.jobId}` : "/admin/jobs"
    case "payment_received":
      return meta?.paymentId ? "/admin/payments" : "/admin/payments"
    default:
      return undefined
  }
}

export interface ViewAllActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ViewAllActivityModal({ isOpen, onClose }: ViewAllActivityModalProps) {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRecentActivityForModal()
      setActivities(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) loadData()
  }, [isOpen, loadData])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, onClose])

  const handleNavigate = useCallback(
    (path: string | undefined) => {
      if (path) {
        onClose()
        router.push(path)
      }
    },
    [router, onClose]
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl outline-none flex flex-col overflow-hidden"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            closeButtonRef.current?.focus()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full h-full max-h-[85vh]"
          >
            <div className="flex items-center justify-between shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 min-h-0">
              {loading && (
                <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-8 h-8 animate-pulse mr-2" />
                  Loading…
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 py-4 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                  <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {!loading && !error && (
                <ul className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {activities.length === 0 ? (
                      <li className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 list-none">
                        No recent activity
                      </li>
                    ) : (
                      activities.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type)
                        const colorClass = getActivityIconColor(activity.type)
                        const title = ACTIVITY_TYPE_TITLES[activity.type]
                        const link = getActivityLink(activity)
                        const isClickable = !!link
                        return (
                          <motion.li
                            key={activity.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className="list-none"
                          >
                            <motion.div
                              role={isClickable ? "button" : "article"}
                              tabIndex={isClickable ? 0 : undefined}
                              onClick={() => isClickable && handleNavigate(link)}
                              onKeyDown={(e) => {
                                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                                  e.preventDefault()
                                  handleNavigate(link)
                                }
                              }}
                              className={`
                                flex items-start gap-3 p-3 rounded-lg border border-transparent
                                transition-colors outline-none
                                ${isClickable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" : ""}
                              `}
                              whileHover={isClickable ? { scale: 1.01 } : undefined}
                              whileTap={isClickable ? { scale: 0.99 } : undefined}
                            >
                              <div
                                className={`p-2 rounded-lg shrink-0 ${colorClass}`}
                                aria-hidden
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatRelativeTime(activity.timestamp)}
                                </p>
                                {isClickable && (
                                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                    View →
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          </motion.li>
                        )
                      })
                    )}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
