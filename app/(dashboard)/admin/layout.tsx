"use client"

import RoleGate from "@/src/features/auth/ui/RoleGate"
import Sidebar from "@/src/shared/ui/Sidebar"
import { useState, useMemo } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Get the current page info based on pathname
  const pageInfo = useMemo(() => {
    const sections = [
      {
        match: ["/admin", "/admin/analytics", "/admin/settings"],
        section: "ADMINISTRATION",
        sectionDescription: "System configuration and overview",
      },
      {
        match: ["/admin/users", "/admin/clients", "/admin/employees"],
        section: "USER MANAGEMENT",
        sectionDescription: "Manage users, clients, and employees",
      },
      {
        match: ["/admin/jobs", "/admin/tasks", "/admin/schedule", "/admin/quotes"],
        section: "OPERATIONS",
        sectionDescription: "Manage jobs, tasks, and schedules",
      },
      {
        match: ["/admin/payments", "/admin/invoices", "/admin/reports"],
        section: "FINANCIAL",
        sectionDescription: "Manage payments, invoices, and reports",
      },
    ]

    const foundSection = sections.find(({ match }) =>
      match.some(route =>
        route === "/admin"
          ? pathname === route
          : pathname.startsWith(route)
      )
    )

    return (
      foundSection || {
        section: "ADMINISTRATION",
        sectionDescription: "System configuration and overview",
      }
    )
  }, [pathname])

  return (
    <RoleGate role="admin">
      <div className="flex min-h-screen bg-gradient-to-br from-[#f5f1e6] to-[#f0e9d8] dark:bg-gray-900 min-w-0">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

        <div className="flex-1 min-w-0 w-full overflow-x-hidden lg:ml-0">
          {/* Header with section name and section description */}
          <div className="bg-gradient-to-r from-[#ffedc4] to-[#f9dcaf] dark:from-gray-800 dark:to-gray-800 border-b border-[#e6d7c0] dark:border-gray-700 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center gap-2 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-[#e6d7c0] dark:bg-gray-700 text-[#8b4513] dark:text-gray-300 shrink-0 hover:bg-[#d8b380] dark:hover:bg-gray-600 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                </div>
                <h1 className="text-xl font-bold text-[#8b4513] dark:text-white sm:text-2xl">
                  {pageInfo.section}
                </h1>
                <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
                  {pageInfo.sectionDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[#faf7f0]/50 dark:bg-transparent">
            {children}
          </div>
        </div>
      </div>
    </RoleGate>
  )
}