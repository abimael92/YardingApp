"use client"

import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"
import { Bars3Icon, CalendarDaysIcon } from "@heroicons/react/24/outline"

export default function SchedulePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 min-w-0">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

      <div className="flex-1 min-w-0 w-full overflow-x-hidden">
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
                  Schedule
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Team calendar and scheduling
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <Breadcrumbs />

          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-6 mb-6">
              <CalendarDaysIcon className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
              We&apos;re building a full schedule view so you can manage team calendars, assign jobs to dates, and see availability at a glance.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check back soon or use Jobs to view scheduled start dates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
