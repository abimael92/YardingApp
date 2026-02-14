"use client"

import UserManagement from "@/src/features/admin/users/ui/UserManagement"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"
import { Bars3Icon } from "@heroicons/react/24/outline"

export default function UsersPage() {

  return (
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6">
          <UserManagement />
        </div>
      </div>
  )
}
