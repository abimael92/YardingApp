"use client"

import ClientDirectory from "@/src/features/admin/clients/ui/ClientDirectory"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"


export default function ClientsPage() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <ClientDirectory />
        </div>
  )
}
