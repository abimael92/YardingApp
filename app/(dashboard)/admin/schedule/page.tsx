"use client"

import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import {  CalendarDaysIcon } from "@heroicons/react/24/outline"

export default function SchedulePage() {

  return (

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
   
  )
}
