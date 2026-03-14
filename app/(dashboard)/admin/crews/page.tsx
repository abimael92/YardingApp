"use client"

import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { CrewManagement } from "@/src/features/admin/crews/ui/CrewManagement"

export default function CrewsPage() {
  return (
    <div className="p-4 sm:p-6">
      <Breadcrumbs />
      <CrewManagement />
    </div>
  )
}
