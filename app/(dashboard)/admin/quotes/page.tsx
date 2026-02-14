"use client"

import QuotesPage from "@/src/features/admin/quotes/ui/QuotesPage"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"

export default function Page() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <QuotesPage />
        </div>
  )
}
