/**
 * Worker Service (Legacy Compatibility)
 * 
 * This service provides backward compatibility with the old Worker model.
 * It converts Employees to Workers for components that haven't been migrated yet.
 */

import { getEmployees } from "./employeeService"
import type { Worker } from "@/src/domain/models"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"

// Convert Employee to Worker for backward compatibility
const employeeToWorker = (employee: any): Worker => {
  return {
    id: employee.id,
    name: employee.displayName || employee.name,
    role: employee.department || employee.role || "Worker",
    avatar: employee.avatar || "/placeholder-user.jpg",
    status: mapEmployeeStatusToWorkerStatus(employee.status),
    rating: employee.rating || 0,
    completedTasks: employee.completedJobsCount || employee.completedTasks || 0,
  }
}

const mapEmployeeStatusToWorkerStatus = (
  status: string
): "available" | "busy" | "offline" => {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return "available"
    case EmployeeStatus.ON_LEAVE:
      return "offline"
    case EmployeeStatus.INACTIVE:
    case EmployeeStatus.TERMINATED:
      return "offline"
    default:
      // Handle legacy Worker status values
      if (status === "available" || status === "busy" || status === "offline") {
        return status as "available" | "busy" | "offline"
      }
      return "available"
  }
}

export const getWorkers = async (): Promise<Worker[]> => {
  const employees = await getEmployees()
  return employees.map(employeeToWorker)
}
