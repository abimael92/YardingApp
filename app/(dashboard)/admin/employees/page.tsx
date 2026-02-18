"use client"

import { EmployeeList } from "@/src/features/admin/employees/ui/EmployeeList"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"


export default function EmployeesPage() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <EmployeeList />
        </div>
  )
}
