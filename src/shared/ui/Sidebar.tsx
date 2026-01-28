"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { clearMockRole } from "@/src/features/auth/services/mockAuth"
import {
  HomeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CalendarIcon,
  MapIcon,
  BellIcon,
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline"
import { getJobs } from "@/src/services/jobService"
import { JobStatus } from "@/src/domain/entities"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  userRole: "worker" | "supervisor" | "client" | "admin"
}

interface NavigationSection {
  title?: string
  items: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: number | string
  }>
}

const Sidebar = ({ isOpen, setIsOpen, userRole }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isDesktop, setIsDesktop] = useState(false)
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  // Fetch active jobs count for admin
  useEffect(() => {
    if (userRole === "admin") {
      const loadActiveJobsCount = async () => {
        try {
          const jobs = await getJobs()
          const activeCount = jobs.filter(
            (job) =>
              job.status === JobStatus.SCHEDULED ||
              job.status === JobStatus.IN_PROGRESS ||
              job.status === JobStatus.QUOTED
          ).length
          setActiveJobsCount(activeCount)
        } catch (error) {
          console.error("Failed to load active jobs count:", error)
        }
      }
      loadActiveJobsCount()
    }
  }, [userRole])

  const getNavigationSections = (): NavigationSection[] => {
    const baseItems = [{ name: "Dashboard", href: `/${userRole}`, icon: HomeIcon }]

    switch (userRole) {
      case "worker":
        return [
          {
            items: [
              ...baseItems,
              { name: "My Tasks", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
              { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
              { name: "Map View", href: `/${userRole}/map`, icon: MapIcon },
            ],
          },
        ]
      case "supervisor":
        return [
          {
            items: [
              ...baseItems,
              { name: "Team Overview", href: `/${userRole}/team`, icon: UserGroupIcon },
              { name: "Task Management", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
              { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon },
              { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
            ],
          },
        ]
      case "client":
        return [
          {
            items: [
              ...baseItems,
              { name: "My Services", href: `/${userRole}/services`, icon: ClipboardDocumentListIcon },
              { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
              { name: "Billing", href: `/${userRole}/billing`, icon: ChartBarIcon },
            ],
          },
        ]
      case "admin":
        return [
          {
            title: "ADMINISTRATION",
            items: [
              { name: "Dashboard", href: `/${userRole}`, icon: HomeIcon },
              { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon },
              { name: "Settings", href: `/${userRole}/settings`, icon: Cog6ToothIcon },
            ],
          },
          {
            title: "USER MANAGEMENT",
            items: [
              { name: "System Users", href: `/${userRole}/users`, icon: UsersIcon },
              { name: "Clients", href: `/${userRole}/clients`, icon: UserGroupIcon },
              { name: "Employees", href: `/${userRole}/employees`, icon: BriefcaseIcon },
            ],
          },
          {
            title: "OPERATIONS",
            items: [
              {
                name: "Jobs",
                href: `/${userRole}/jobs`,
                icon: ClipboardDocumentListIcon,
                badge: activeJobsCount > 0 ? activeJobsCount : undefined,
              },
              { name: "Tasks", href: `/${userRole}/tasks`, icon: ClockIcon },
              { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
              { name: "Quotes", href: `/${userRole}/quotes`, icon: DocumentTextIcon },
            ],
          },
          {
            title: "FINANCIAL",
            items: [
              { name: "Payments", href: `/${userRole}/payments`, icon: BanknotesIcon },
              { name: "Invoices", href: `/${userRole}/invoices`, icon: ReceiptRefundIcon },
              { name: "Reports", href: `/${userRole}/reports`, icon: DocumentChartBarIcon },
            ],
          },
        ]
      default:
        return [{ items: baseItems }]
    }
  }

  const navigationSections = getNavigationSections()
  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:relative lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {userRole} Portal
            </h2>
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </div>
          </div>

          <nav className="space-y-6 flex-1 overflow-y-auto pb-4">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                {section.title && (
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700/50">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        title={item.name}
                        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm border-l-2 border-primary-600 dark:border-primary-400"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 transition-colors ${
                              active
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 min-w-[1.5rem] text-center ${
                              active
                                ? "bg-primary-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              clearMockRole()
              router.push("/login")
            }}
            className="mt-6 w-full text-sm text-left px-3 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
