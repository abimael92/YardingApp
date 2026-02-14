"use client"

import JobList from "@/src/features/admin/jobs/ui/JobList"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"

export default function JobsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <JobList />
        </div>
  )
}
