"use client"

import TaskList from "@/src/features/admin/tasks/ui/TaskList"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import { useState } from "react"

export default function TasksPage() {

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />
          <TaskList />
        </div>
  )
}
