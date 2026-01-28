"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { getJobs } from "@/src/services/jobService"
import { JobStatus } from "@/src/domain/entities"
import { getMockUserEmail } from "@/src/features/auth/services/mockAuth"
import { getAllUsers } from "@/src/services/userService"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  userRole: "worker" | "supervisor" | "client" | "admin"
}

const Sidebar = ({ isOpen, setIsOpen, userRole }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>("")

  // Check if desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setIsDesktop(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  // Fetch current user name
  useEffect(() => {
    const loadCurrentUserName = async () => {
      try {
        const userEmail = getMockUserEmail()
        if (userEmail) {
          const users = await getAllUsers()
          const currentUser = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase())
          if (currentUser) {
            setCurrentUserName(currentUser.name)
          } else {
            // Fallback: extract name from email
            const emailName = userEmail.split("@")[0].replace(/\./g, " ")
            setCurrentUserName(emailName.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "))
          }
        } else {
          // Fallback to role-based name
          setCurrentUserName(userRole.charAt(0).toUpperCase() + userRole.slice(1))
        }
      } catch (error) {
        console.error("Failed to load user name:", error)
        setCurrentUserName(userRole.charAt(0).toUpperCase() + userRole.slice(1))
      }
    }
    loadCurrentUserName()
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

  // Auto-open dropdown based on current page - FIXED: Check specific paths first
  useEffect(() => {
    if (userRole === "admin") {
      // Check specific paths first (most specific to least specific)
      // This ensures we don't always match /admin for all routes
      if (pathname.startsWith("/admin/analytics") || pathname.startsWith("/admin/settings")) {
        setOpenDropdown("ADMINISTRATION")
      } else if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/clients") || pathname.startsWith("/admin/employees")) {
        setOpenDropdown("USER MANAGEMENT")
      } else if (pathname.startsWith("/admin/jobs") || pathname.startsWith("/admin/tasks") || pathname.startsWith("/admin/schedule") || pathname.startsWith("/admin/quotes")) {
        setOpenDropdown("OPERATIONS")
      } else if (pathname.startsWith("/admin/payments") || pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/reports")) {
        setOpenDropdown("FINANCIAL")
      } else if (pathname === "/admin") {
        // Only set ADMINISTRATION if it's exactly /admin (not a sub-path)
        setOpenDropdown("ADMINISTRATION")
      }
    }
  }, [pathname, userRole])
  
  console.log({ currentUserName });
  

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleItemClick = () => {
    if (!isDesktop) {
      setIsOpen(false)
    }
  }

  // NavLink component with desert theme colors
  const NavLink = ({ href, icon: Icon, onClick, children, badge }: any) => {
    // Fix active detection: exact match or path starts with href + "/" (to avoid /admin matching /admin/users)
    const isActive = pathname === href || (pathname.startsWith(href + "/"))

    return (
      <Link
        href={href}
        onClick={onClick}
        className={`
          group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
          transition-all duration-200
          ${isActive
            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 border-l-4 border-green-500 shadow-sm"
            : "text-gray-700 dark:text-gray-300 hover:bg-green-50/50 dark:hover:bg-green-900/10 hover:text-green-700 dark:hover:text-green-400"
          }
        `}
      >
        <div className={`p-1.5 rounded-lg ${isActive
          ? "bg-green-100 dark:bg-green-800/30"
          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-green-100 dark:group-hover:bg-green-900/20"
          }`}>
          <Icon className={`w-4 h-4 ${isActive
            ? "text-green-700 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-400"
            }`} />
        </div>
        <span className="flex-1">{children}</span>
        {badge && (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${isActive
              ? "bg-green-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-green-500 group-hover:text-white"
            }`}>
            {badge}
          </span>
        )}
        {isActive && (
          <div className="absolute right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </Link>
    )
  }

  // Dropdown Section with desert theme
  const DropdownSection = ({ title, icon: Icon, children, isOpen, onToggle }: any) => {
    const hasActiveChild = React.Children.toArray(children).some((child: any) => {
      if (!child.props.href) return false
      const href = child.props.href
      return pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
    })

    return (
      <div className="mb-4">
        <button
          onClick={() => onToggle(title)}
          className={`
            w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold
            transition-all duration-200 group
            ${hasActiveChild || isOpen
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
              : "bg-green-50/50 dark:bg-green-900/30 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${hasActiveChild || isOpen
              ? "bg-white/20"
              : "bg-white dark:bg-green-100 group-hover:bg-green-100 dark:group-hover:bg-green-900/30"
              }`}>
              <Icon className={`w-4 h-4 ${hasActiveChild || isOpen
                ? "text-white"
                : "text-gray-500 dark:text-green-800 group-hover:text-green-700 dark:group-hover:text-green-400"
                }`} />
            </div>
            <span>{title}</span>
          </div>
          <ChevronDownIcon className={`
            w-4 h-4 transition-transform duration-300
            ${isOpen ? "rotate-180" : ""}
            ${hasActiveChild || isOpen ? "text-white" : "text-gray-400"}
          `} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 mt-3 space-y-2 pl-4 border-l-2 border-green-200 dark:border-green-800"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Admin navigation
  const getAdminNav = () => (
    <div className="space-y-1">
      <DropdownSection
        title="ADMINISTRATION"
        icon={BuildingOffice2Icon}
        isOpen={openDropdown === "ADMINISTRATION"}
        onToggle={toggleDropdown}
      >
        <NavLink href="/admin" icon={HomeIcon} onClick={handleItemClick}>
          Dashboard
        </NavLink>
        <NavLink href="/admin/analytics" icon={ChartBarIcon} onClick={handleItemClick}>
          Analytics
        </NavLink>
        <NavLink href="/admin/settings" icon={Cog6ToothIcon} onClick={handleItemClick}>
          Settings
        </NavLink>
      </DropdownSection>

      <DropdownSection
        title="USER MANAGEMENT"
        icon={UserGroupIcon}
        isOpen={openDropdown === "USER MANAGEMENT"}
        onToggle={toggleDropdown}
      >
        <NavLink href="/admin/users" icon={UsersIcon} onClick={handleItemClick}>
          System Users
        </NavLink>
        <NavLink href="/admin/clients" icon={UserGroupIcon} onClick={handleItemClick}>
          Clients
        </NavLink>
        <NavLink href="/admin/employees" icon={BriefcaseIcon} onClick={handleItemClick}>
          Employees
        </NavLink>
      </DropdownSection>

      <DropdownSection
        title="OPERATIONS"
        icon={ClipboardDocumentListIcon}
        isOpen={openDropdown === "OPERATIONS"}
        onToggle={toggleDropdown}
      >
        <NavLink 
          href="/admin/jobs" 
          icon={ClipboardDocumentListIcon} 
          onClick={handleItemClick} 
          badge={activeJobsCount > 0 ? activeJobsCount : undefined}
        >
          Jobs
        </NavLink>
        <NavLink href="/admin/tasks" icon={ClockIcon} onClick={handleItemClick}>
          Tasks
        </NavLink>
        <NavLink href="/admin/schedule" icon={CalendarIcon} onClick={handleItemClick}>
          Schedule
        </NavLink>
        <NavLink href="/admin/quotes" icon={DocumentTextIcon} onClick={handleItemClick}>
          Quotes
        </NavLink>
      </DropdownSection>

      <DropdownSection
        title="FINANCIAL"
        icon={CurrencyDollarIcon}
        isOpen={openDropdown === "FINANCIAL"}
        onToggle={toggleDropdown}
      >
        <NavLink href="/admin/payments" icon={BanknotesIcon} onClick={handleItemClick}>
          Payments
        </NavLink>
        <NavLink href="/admin/invoices" icon={DocumentDuplicateIcon} onClick={handleItemClick}>
          Invoices
        </NavLink>
        <NavLink href="/admin/reports" icon={DocumentChartBarIcon} onClick={handleItemClick}>
          Reports
        </NavLink>
      </DropdownSection>
    </div>
  )

  // Get non-admin navigation
  const getNonAdminNav = () => {
    const baseItems = [
      { name: "Dashboard", href: `/${userRole}`, icon: HomeIcon, badge: null },
    ]

    let roleItems: any[] = []

    if (userRole === "worker") {
      roleItems = [
        { name: "My Tasks", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon, badge: null },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon, badge: null },
        { name: "Map View", href: `/${userRole}/map`, icon: MapIcon, badge: null },
      ]
    } else if (userRole === "supervisor") {
      roleItems = [
        { name: "Team Overview", href: `/${userRole}/team`, icon: UserGroupIcon, badge: null },
        { name: "Task Management", href: `/${userRole}/tasks`, icon: ClipboardDocumentListIcon, badge: null },
        { name: "Analytics", href: `/${userRole}/analytics`, icon: ChartBarIcon, badge: null },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon, badge: null },
      ]
    } else if (userRole === "client") {
      roleItems = [
        { name: "My Services", href: `/${userRole}/services`, icon: ClipboardDocumentListIcon, badge: null },
        { name: "Schedule", href: `/${userRole}/schedule`, icon: CalendarIcon, badge: null },
        { name: "Billing", href: `/${userRole}/billing`, icon: ChartBarIcon, badge: null },
      ]
    }

    return (
      <div className="space-y-2">
        {[...baseItems, ...roleItems].map((item) => (
          <NavLink
            key={item.name}
            href={item.href}
            icon={item.icon}
            onClick={handleItemClick}
            badge={item.badge}
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : -300,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-green-50/30 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-green-200/50 dark:border-gray-700 shadow-xl z-50 lg:static lg:z-auto"
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                {currentUserName || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Desert Landscaping Co.
              </p>
            </div>
            <div className="relative">
              <button className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                <BellIcon className="w-5 h-5 text-green-700 dark:text-green-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto pb-6 pr-2">
            <div className="mb-8">
              <div className="px-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Navigation
                </p>
              </div>
              {userRole === "admin" ? getAdminNav() : getNonAdminNav()}
            </div>
          </nav>

          {/* Footer / Logout */}
          <div className="pt-6 border-t border-green-200/50 dark:border-gray-700">
            <button
              onClick={() => {
                clearMockRole()
                router.push("/login")
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-all duration-200 group"
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
