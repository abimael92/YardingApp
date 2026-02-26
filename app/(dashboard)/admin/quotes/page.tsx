"use client"

import { Suspense } from "react"
import QuotesPage from "@/src/features/admin/quotes/ui/QuotesPage"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

export default function Page() {
  return (
    <div className="p-4 sm:p-6">
      <Breadcrumbs />
      <Suspense fallback={<LoadingState message="Loading quotes..." />}>
        <QuotesPage />
      </Suspense>
    </div>
  )
}
