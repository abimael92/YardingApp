/**
 * Employee Service
 *
 * Service layer for employee management operations.
 */

import {
  getEmployees as getEmployeesFromStore,
  createEmployee as createEmployeeInStore,
  getEmployeeById as getEmployeeByIdFromStore,
  updateEmployee as updateEmployeeInStore,
  deleteEmployee as deleteEmployeeFromStore,
} from "@/src/data/mockStore"
import type { Employee, EntityId } from "@/src/domain/entities"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"

// Initialize with seed data if empty
const initializeEmployees = () => {
  if (getEmployeesFromStore().length === 0) {
    const now = new Date().toISOString()
    const defaultAvailability = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }

    createEmployeeInStore({
      firstName: "Mike",
      lastName: "Rodriguez",
      displayName: "Mike Rodriguez",
      email: "mike.rodriguez@company.com",
      phone: "+1-555-0201",
      role: EmployeeRole.WORKER,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
      availability: defaultAvailability,
      completedJobsCount: 156,
      totalHoursWorked: 3120,
      rating: 4.8,
      assignedJobIds: [],
      supervisedJobIds: [],
      avatar: "/professional-lawn-worker.jpg",
    })

    createEmployeeInStore({
      firstName: "Sarah",
      lastName: "Chen",
      displayName: "Sarah Chen",
      email: "sarah.chen@company.com",
      phone: "+1-555-0202",
      role: EmployeeRole.WORKER,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
      availability: defaultAvailability,
      completedJobsCount: 89,
      totalHoursWorked: 1780,
      rating: 4.9,
      assignedJobIds: [],
      supervisedJobIds: [],
      avatar: "/female-landscape-designer.jpg",
    })

    createEmployeeInStore({
      firstName: "David",
      lastName: "Wilson",
      displayName: "David Wilson",
      email: "david.wilson@company.com",
      phone: "+1-555-0203",
      role: EmployeeRole.SUPERVISOR,
      status: EmployeeStatus.ACTIVE,
      hireDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years ago
      availability: defaultAvailability,
      completedJobsCount: 203,
      totalHoursWorked: 4060,
      rating: 4.7,
      assignedJobIds: [],
      supervisedJobIds: [],
      avatar: "/tree-specialist-worker.jpg",
    })
  }
}

// Initialize on import
initializeEmployees()

// ============================================================================
// Service Interface
// ============================================================================

export interface EmployeeService {
  getAll(): Employee[]
  getById(id: EntityId): Employee | undefined
  getByRole(role: EmployeeRole): Employee[]
  getByStatus(status: EmployeeStatus): Employee[]
  create(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee
  update(id: EntityId, updates: Partial<Employee>): Employee | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const employeeService: EmployeeService = {
  getAll: (): Employee[] => getEmployeesFromStore(),

  getById: (id: EntityId): Employee | undefined => getEmployeeByIdFromStore(id),

  getByRole: (role: EmployeeRole): Employee[] =>
    getEmployeesFromStore().filter((emp: Employee) => emp.role === role),

  getByStatus: (status: EmployeeStatus): Employee[] =>
    getEmployeesFromStore().filter((emp: Employee) => emp.status === status),

  create: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee => createEmployeeInStore(employee),

  update: (id: EntityId, updates: Partial<Employee>): Employee | undefined => updateEmployeeInStore(id, updates),

  delete: (id: EntityId): boolean => deleteEmployeeFromStore(id),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getEmployees = () => employeeService.getAll()
export const getEmployeeById = (id: EntityId) => employeeService.getById(id)
export const getWorkers = () => employeeService.getByRole(EmployeeRole.WORKER)
export const getSupervisors = () => employeeService.getByRole(EmployeeRole.SUPERVISOR)
export const createEmployee = (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) =>
  employeeService.create(employee)
export const updateEmployee = (id: EntityId, updates: Partial<Employee>) =>
  employeeService.update(id, updates)
export const deleteEmployee = (id: EntityId) => employeeService.delete(id)
