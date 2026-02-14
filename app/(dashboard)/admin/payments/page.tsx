"use client"

import PaymentsPage from "@/src/features/admin/payments/ui/PaymentsPage"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"

export default function Page() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <PaymentsPage />
        </div>
  )
}
