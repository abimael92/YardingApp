/**
 * Employee Service
 *
 * Service layer for employee management operations.
 * All methods return Promises to mimic async API calls.
 */

import { mockStore } from '@/src/data/mockStore';
import type { Employee, EntityId, EmployeeStatus } from '@/src/domain/entities';
import { asyncify, asyncifyWithError } from './utils';

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface EmployeeService {
	getAll(): Promise<Employee[]>;
	getById(id: EntityId): Promise<Employee | undefined>;
	getByStatus(status: EmployeeStatus): Promise<Employee[]>;
	create(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<Employee>;
	update(id: EntityId, updates: Partial<Employee>): Promise<Employee | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const employeeService: EmployeeService = {
	getAll: () => asyncify(() => mockStore.getEmployees()),

	getById: (id: EntityId) => asyncify(() => mockStore.getEmployeeById(id)),

	getByStatus: (status: EmployeeStatus) =>
		asyncify(() => mockStore.getEmployees().filter((e) => e.status === status)),

	create: (employee) =>
		asyncifyWithError(() => {
			const newEmployee = mockStore.createEmployee(employee);
			return newEmployee;
		}),

	update: (id, updates) =>
		asyncifyWithError(() => {
			const updated = mockStore.updateEmployee(id, updates);
			if (!updated) {
				throw new Error(`Employee with id ${id} not found`);
			}
			return updated;
		}),

	delete: (id) =>
		asyncifyWithError(() => {
			const deleted = mockStore.deleteEmployee(id);
			if (!deleted) {
				throw new Error(`Employee with id ${id} not found`);
			}
			return deleted;
		}),
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllEmployees = () => employeeService.getAll();
export const getEmployeeById = (id: EntityId) => employeeService.getById(id);
export const getEmployeesByStatus = (status: EmployeeStatus) =>
	employeeService.getByStatus(status);
export const createEmployee = (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) =>
	employeeService.create(employee);
export const updateEmployee = (id: EntityId, updates: Partial<Employee>) =>
	employeeService.update(id, updates);
export const deleteEmployee = (id: EntityId) => employeeService.delete(id);

// Export as getEmployees for backward compatibility with workerService
export const getEmployees = () => employeeService.getAll();
