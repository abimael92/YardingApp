/**
 * Employee Service
 * 
 * Service layer for employee management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Employee, EntityId } from "@/src/domain/entities"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"

// Initialize with seed data if empty
const initializeEmployees = () => {
  if (mockStore.getEmployees().length === 0) {
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

    mockStore.createEmployee({
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

    mockStore.createEmployee({
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

    mockStore.createEmployee({
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
  getAll: () => mockStore.getEmployees(),

  getById: (id: EntityId) => mockStore.getEmployeeById(id),

  getByRole: (role: EmployeeRole) =>
    mockStore.getEmployees().filter((emp) => emp.role === role),

  getByStatus: (status: EmployeeStatus) =>
    mockStore.getEmployees().filter((emp) => emp.status === status),

  create: (employee) => mockStore.createEmployee(employee),

  update: (id, updates) => mockStore.updateEmployee(id, updates),

  delete: (id) => mockStore.deleteEmployee(id),
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
