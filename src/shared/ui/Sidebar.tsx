"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
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
  DocumentDuplicateIcon,
  ChevronDownIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import React from "react"
import { getJobs } from "@/src/services/jobService"
import { JobStatus } from "@/src/domain/entities"
import { getMockUserEmail } from "@/src/features/auth/services/mockAuth"
import { getAllUsers } from "@/src/services/userService"
import { getUnreadQuoteNotificationCount } from "@/app/actions/notifications"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  userRole: "worker" | "supervisor" | "client" | "admin"
}

// Move components outside to prevent recreation
const NavLink = React.memo(({ href, icon: Icon, onClick, children, badge }: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  children: React.ReactNode
  badge?: number | null
}) => {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
        transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-green-600/85 to-emerald-500/85 text-white shadow-md border-l-4 border-green-700"
        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 hover:shadow-sm hover:border-l-4 hover:border-green-700/50"
        }
      `}
    >
      <div className={`p-1.5 rounded-lg ${isActive
        ? "bg-white/20"
        : "bg-gray-100 dark:bg-gray-800 group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
        }`}>
        <Icon className={`w-4 h-4 ${isActive
          ? "text-white"
          : "text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400"
          }`} />
      </div>
      <span className="flex-1">{children}</span>
      {badge ? (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${isActive
          ? "bg-white text-green-700"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-green-500 group-hover:text-white"
          }`}>
          {badge}
        </span>
      ) : null}
      {isActive ? (
        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
      ) : null}
    </Link>
  )
})

NavLink.displayName = "NavLink"

// Dropdown Section component
const DropdownSection = React.memo(({ title, icon: Icon, children, isOpen, onToggle }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  isOpen: boolean
  onToggle: (title: string) => void
}) => {
  const pathname = usePathname()

  const hasActiveChild = React.useMemo(() => {
    return React.Children.toArray(children).some((child) => {
      if (!React.isValidElement(child) || typeof (child.props as { href?: string }).href !== "string") return false
      const href = (child.props as { href: string }).href
      return pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
    })
  }, [children, pathname])

  return (
    <div className="mb-4">
      <button
        onClick={() => onToggle(title)}
        className={`
          w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold
          transition-all duration-200 group
          ${hasActiveChild || isOpen
            ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-md"
            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${hasActiveChild || isOpen
            ? "bg-white/20"
            : "bg-green-100 dark:bg-green-800/30 group-hover:bg-green-200 dark:group-hover:bg-green-700/30"
            }`}>
            <Icon className={`w-4 h-4 ${hasActiveChild || isOpen
              ? "text-white"
              : "text-green-700 dark:text-green-400"
              }`} />
          </div>
          <span>{title}</span>
        </div>
        <ChevronDownIcon className={`
          w-4 h-4 transition-transform duration-300
          ${isOpen ? "rotate-180" : ""}
          ${hasActiveChild || isOpen ? "text-white" : "text-green-700 dark:text-green-400"}
        `} />
      </button>

      {isOpen ? (
        <div className="ml-4 mt-3 space-y-2 pl-4 border-l-2 border-green-200 dark:border-green-800">
          {children}
        </div>
      ) : null}
    </div>
  )
})

DropdownSection.displayName = "DropdownSection"

const Sidebar = ({ isOpen, setIsOpen, userRole }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0)
  const [unreadQuoteCount, setUnreadQuoteCount] = useState<number>(0)
  const [quoteNotifications, setQuoteNotifications] = useState<Array<{ id: string; entity_id: string; created_at: Date }>>([])
  const [bellOpen, setBellOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>("")

  // Use refs to prevent unnecessary re-renders
  const userNameLoaded = useRef(false)

  // Check if desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  // Fetch current user name - only once
  useEffect(() => {
    if (userNameLoaded.current) return

    let mounted = true

    const loadCurrentUserName = async () => {
      // Set initial fallback immediately
      setCurrentUserName(userRole.charAt(0).toUpperCase() + userRole.slice(1))

      try {
        const userEmail = getMockUserEmail()
        if (userEmail && mounted) {
          const users = await getAllUsers()
          const currentUser = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase())
          if (currentUser && mounted) {
            setCurrentUserName(currentUser.name)
            userNameLoaded.current = true
          } else if (mounted) {
            const emailName = userEmail.split("@")[0].replace(/\./g, " ")
            setCurrentUserName(emailName.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "))
            userNameLoaded.current = true
          }
        }
      } catch (error) {
        console.error("Failed to load user name:", error)
      }
    }

    loadCurrentUserName()

    return () => {
      mounted = false
    }
  }, [userRole])

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

  // Fetch unread quote notifications for admin (badge + bell dropdown)
  useEffect(() => {
    if (userRole === "admin") {
      const load = async () => {
        try {
          const [count, list] = await Promise.all([
            getUnreadQuoteNotificationCount(),
            getUnreadQuoteNotifications(),
          ])
          setUnreadQuoteCount(count)
          setQuoteNotifications(list)
        } catch (error) {
          console.error("Failed to load quote notifications:", error)
        }
      }
      load()
    }
  }, [userRole])

  // Auto-open dropdown based on current page
  useEffect(() => {
    if (userRole === "admin") {
      let newDropdown = null

      if (pathname.startsWith("/admin/analytics") || pathname.startsWith("/admin/settings")) {
        newDropdown = "ADMINISTRATION"
      } else if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/clients") || pathname.startsWith("/admin/employees")) {
        newDropdown = "USER MANAGEMENT"
      } else if (pathname.startsWith("/admin/jobs") || pathname.startsWith("/admin/tasks") || pathname.startsWith("/admin/schedule") || pathname.startsWith("/admin/quotes")) {
        newDropdown = "OPERATIONS"
      } else if (pathname.startsWith("/admin/payments") || pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/reports")) {
        newDropdown = "FINANCIAL"
      } else if (pathname === "/admin") {
        newDropdown = "ADMINISTRATION"
      }

      setOpenDropdown(newDropdown)
    }
  }, [pathname, userRole])

  const toggleDropdown = useCallback((name: string) => {
    setOpenDropdown(prev => prev === name ? null : name)
  }, [])

  const handleItemClick = useCallback(() => {
    if (!isDesktop) {
      setIsOpen(false)
    }
  }, [isDesktop, setIsOpen])

  // Build navigation items - now without pathname dependencies
  const adminNavItems = useMemo(() => {
    if (userRole !== "admin") return null

    const sections = [
      {
        title: "ADMINISTRATION",
        icon: BuildingOffice2Icon,
        items: [
          { href: "/admin", label: "Dashboard", icon: HomeIcon },
          { href: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
          { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon }
        ]
      },
      {
        title: "USER MANAGEMENT",
        icon: UserGroupIcon,
        items: [
          { href: "/admin/users", label: "System Users", icon: UsersIcon },
          { href: "/admin/clients", label: "Clients", icon: UserGroupIcon },
          { href: "/admin/employees", label: "Employees", icon: BriefcaseIcon }
        ]
      },
      {
        title: "OPERATIONS",
        icon: ClipboardDocumentListIcon,
        items: [
          { href: "/admin/jobs", label: "Jobs", icon: ClipboardDocumentListIcon, badge: activeJobsCount },
          { href: "/admin/tasks", label: "Tasks", icon: ClockIcon },
          { href: "/admin/schedule", label: "Schedule", icon: CalendarIcon },
          { href: "/admin/quotes", label: "Quotes", icon: DocumentTextIcon, badge: unreadQuoteCount }
        ]
      },
      {
        title: "FINANCIAL",
        icon: CurrencyDollarIcon,
        items: [
          { href: "/admin/payments", label: "Payments", icon: BanknotesIcon },
          { href: "/admin/invoices", label: "Invoices", icon: DocumentDuplicateIcon },
          { href: "/admin/reports", label: "Reports", icon: DocumentChartBarIcon }
        ]
      }
    ]

    return sections.map((section) => (
      <DropdownSection
        key={section.title}
        title={section.title}
        icon={section.icon}
        isOpen={openDropdown === section.title}
        onToggle={toggleDropdown}
      >
        {section.items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            onClick={handleItemClick}
            badge={item.badge && item.badge > 0 ? item.badge : undefined}
          >
            {item.label}
          </NavLink>
        ))}
      </DropdownSection>
    ))
  }, [userRole, openDropdown, toggleDropdown, handleItemClick, activeJobsCount, unreadQuoteCount])

  // Non-admin navigation items
  const nonAdminNavItems = useMemo(() => {
    if (userRole === "admin") return null

    const baseItems = [
      { name: "Dashboard", href: `/${userRole}`, icon: HomeIcon },
    ]

    let roleItems: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }> = []

    if (userRole === "worker") {
      roleItems = [
        { name: "My Tasks", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
        { name: "Map View", href: `/${userRole}/map`, icon: MapIcon },
      ]
    } else if (userRole === "supervisor") {
      roleItems = [
        { name: "Team Overview", href: `/${userRole}/team`, icon: UserGroupIcon },
        { name: "Task Management", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon },
        { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
      ]
    } else if (userRole === "client") {
      roleItems = [
        { name: "My Services", href: `/${userRole}/services`, icon: ClipboardDocumentListIcon },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon },
        { name: "Billing", href: `/${userRole}/billing`, icon: ChartBarIcon },
      ]
    }

    return [...baseItems, ...roleItems].map((item) => (
      <NavLink
        key={item.href}
        href={item.href}
        icon={item.icon}
        onClick={handleItemClick}
      >
        {item.name}
      </NavLink>
    ))
  }, [userRole, handleItemClick])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen ? (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : -300,
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-green-50/30 via-[#f5f1e6] to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-green-200/50 dark:border-gray-700 shadow-xl z-50 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                {currentUserName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Desert Landscaping Co.
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => userRole === "admin" && setBellOpen((o) => !o)}
                className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <BellIcon className="w-5 h-5 text-green-700 dark:text-green-400" />
                {userRole === "admin" && unreadQuoteCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white rounded-full border-2 border-[#f5f1e6] dark:border-gray-800">
                    {unreadQuoteCount > 99 ? "99+" : unreadQuoteCount}
                  </span>
                )}
                {userRole !== "admin" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#f5f1e6] dark:border-gray-800" />
                )}
              </button>
              {userRole === "admin" && bellOpen && (
                <>
                  <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-[60]" role="menu">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                    </div>
                    {quoteNotifications.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No unread quote requests.</p>
                    ) : (
                      <ul className="max-h-64 overflow-y-auto">
                        {quoteNotifications.map((n) => (
                          <li key={n.id}>
                            <Link
                              href={`/admin/quotes?open=${n.entity_id}`}
                              onClick={() => { setBellOpen(false); handleItemClick(); }}
                              className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              New quote request
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div
                    className="fixed inset-0 z-[55]"
                    aria-hidden
                    onClick={() => setBellOpen(false)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto pb-6 pr-2">
            <div className="mb-8">
              <div className="px-4 mb-4">
                <p className="text-sm font-semibold text-[#8b4513]/70 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </p>
              </div>
              <div className="space-y-1">
                {userRole === "admin" ? adminNavItems : nonAdminNavItems}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-green-200/50 dark:border-gray-700">
            <button
              onClick={() => {
                clearMockRole()
                router.push("/login")
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/20 dark:hover:to-red-800/20 text-gray-700 dark:text-gray-300 border-2 hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-all duration-200 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              v2.1.4 • © 2026 Desert Landscaping
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar