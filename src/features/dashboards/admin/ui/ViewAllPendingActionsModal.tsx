"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import {
  XMarkIcon,
  CurrencyDollarIcon,
  ClockIcon,
  WrenchIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { getPendingActionsForModal } from "@/app/actions/dashboard"
import type { PendingAction } from "@/src/services/adminService"

function getPriorityBadgeClass(priority: PendingAction["priority"]) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
  }
}

function getPendingIcon(type: PendingAction["type"]) {
  switch (type) {
    case "pending_quote":
      return DocumentTextIcon
    case "overdue_payment":
      return CurrencyDollarIcon
    case "unassigned_job":
      return WrenchIcon
    case "pending_customer":
      return UserGroupIcon
    default:
      return ClockIcon
  }
}

/** Resolve link: job → jobs page, customer → clients page; others from API. */
function getPendingLink(action: PendingAction): string | undefined {
  if (action.link) return action.link
  switch (action.type) {
    case "unassigned_job":
      return "/admin/jobs"
    case "pending_customer":
    case "pending_approval":
      return "/admin/clients"
    case "overdue_payment":
      return "/admin/payments"
    case "pending_quote":
      return "/admin/quotes"
    default:
      return undefined
  }
}

export interface ViewAllPendingActionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ViewAllPendingActionsModal({
  isOpen,
  onClose,
}: ViewAllPendingActionsModalProps) {
  const router = useRouter()
  const [actions, setActions] = useState<PendingAction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPendingActionsForModal()
      setActions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pending actions")
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
                Pending Actions
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
                    {actions.length === 0 ? (
                      <li className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 list-none">
                        No pending actions
                      </li>
                    ) : (
                      actions.map((action, index) => {
                        const link = getPendingLink(action)
                        const isClickable = !!link
                        const badgeClass = getPriorityBadgeClass(action.priority)
                        const Icon = getPendingIcon(action.type)
                        return (
                          <motion.li
                            key={action.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className="list-none"
                          >
                            <motion.div
                              role={isClickable ? "button" : "article"}
                              tabIndex={isClickable ? 0 : undefined}
                              onClick={() => isClickable && link && handleNavigate(link)}
                              onKeyDown={(e) => {
                                if (
                                  isClickable &&
                                  link &&
                                  (e.key === "Enter" || e.key === " ")
                                ) {
                                  e.preventDefault()
                                  handleNavigate(link)
                                }
                              }}
                              className={`
                                flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600
                                transition-colors outline-none
                                ${isClickable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" : ""}
                              `}
                              whileHover={isClickable ? { scale: 1.01 } : undefined}
                              whileTap={isClickable ? { scale: 0.99 } : undefined}
                            >
                              <div
                                className="shrink-0 text-gray-500 dark:text-gray-400"
                                aria-hidden
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {action.title}
                                  </p>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                                  >
                                    {action.priority.charAt(0).toUpperCase() +
                                      action.priority.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                  {action.description}
                                </p>
                                {isClickable && link && (
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
