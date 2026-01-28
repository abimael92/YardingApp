"use client"

import QuotesPage from "@/src/features/admin/quotes/ui/QuotesPage"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quotes
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage estimates and proposals
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Breadcrumbs />
          <QuotesPage />
        </div>
      </div>
    </div>
  )
}
