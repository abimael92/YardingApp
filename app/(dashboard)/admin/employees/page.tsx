"use client"

import EmployeeList from "@/src/features/admin/employees/ui/EmployeeList"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"

export default function EmployeesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 min-w-0">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

      <div className="flex-1 min-w-0 w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  Employee Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all employees
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <EmployeeList />
        </div>
      </div>
    </div>
  )
}
