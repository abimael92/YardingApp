/**
 * Task List Component
 * 
 * Full CRUD list of all tasks for admin view.
 * Note: Tasks are legacy - Jobs are the new entity. This converts Jobs to Tasks for display.
 */

"use client"

import { useState, useEffect } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getTasks } from "@/src/services/taskService"
import type { Task } from "@/src/domain/models"

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

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
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
          <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</div>
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (task) => (
        <div className="text-gray-600 dark:text-gray-300">{task.assignedTo || "Unassigned"}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => (
        <span className={`font-medium capitalize ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (task) => (
        <div className="text-gray-600 dark:text-gray-300">
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (task) => (
        <div className="text-gray-600 dark:text-gray-300 text-xs">{task.location}</div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading tasks..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Tasks</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
          View all tasks (legacy view - Jobs are the primary entity)
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={tasks}
        columns={columns}
        keyExtractor={(task) => task.id}
        emptyMessage="No tasks found."
      />
    </div>
  )
}

export default TaskList
