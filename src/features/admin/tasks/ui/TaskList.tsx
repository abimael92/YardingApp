/**
 * Task List — admin earthy styling (legacy tasks view)
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getTasks } from "@/src/services/taskService"
import type { Task } from "@/src/domain/models"
import {
  AdminPageHeader,
  AdminStatsCard,
  adminStatusBadgeClass,
} from "@/src/features/admin/ui"

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === "completed").length
    const pending = tasks.filter((t) => t.status === "pending").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    return { total, completed, pending, inProgress }
  }, [tasks])

  const getStatusBadge = (status: Task["status"]) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${adminStatusBadgeClass(status)}`}>
      {status}
    </span>
  )

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400 font-medium"
      case "medium":
        return "text-[#b85e1a] dark:text-[#d88c4a] font-medium"
      case "low":
        return "text-[#2e8b57] dark:text-[#4a7c5c] font-medium"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Task",
      render: (task) => (
        <div>
          <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{task.title}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</div>
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (task) => (
        <div className="text-gray-700 dark:text-gray-300">{task.assignedTo || "Unassigned"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => getStatusBadge(task.status),
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => <span className={`capitalize ${getPriorityColor(task.priority)}`}>{task.priority}</span>,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (task) => (
        <div className="text-gray-600 dark:text-gray-300">{new Date(task.dueDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (task) => <div className="text-gray-600 dark:text-gray-300 text-xs max-w-[140px] truncate">{task.location}</div>,
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading tasks..." />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Tasks"
        subtitle="Legacy task view — Jobs are the primary work entity in the system."
        icon={<ClipboardDocumentListIcon className="w-7 h-7 text-white" />}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard label="Total tasks" value={stats.total} icon={<ClipboardDocumentListIcon />} variant="default" />
          <AdminStatsCard label="Completed" value={stats.completed} icon={<CheckCircleIcon />} variant="green" />
          <AdminStatsCard label="In progress" value={stats.inProgress} icon={<ClockIcon />} variant="orange" />
          <AdminStatsCard label="Pending" value={stats.pending} icon={<ExclamationTriangleIcon />} variant="brown" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">Task list</h2>
        <DataTable data={tasks} columns={columns} keyExtractor={(task) => task.id} emptyMessage="No tasks found." />
      </section>
    </div>
  )
}

export default TaskList
