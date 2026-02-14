"use client"

import ReportsPage from "@/src/features/admin/reports/ui/ReportsPage"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"


export default function Page() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <ReportsPage />
        </div>
  )
}
