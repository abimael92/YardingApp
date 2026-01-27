/**
 * Employee Service
 *
 * Service layer for employee management operations.
 * Phase 1: Read-only access only.
 */

import { mockStore } from '@/src/data/mockStore';
import type { Worker } from '@/src/domain/models';

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface EmployeeService {
	getAll(): Worker[];
	getById(id: string): Worker | undefined;
	getByStatus(status: Worker['status']): Worker[];
}

// ============================================================================
// Service Implementation (Read-Only for Phase 1)
// ============================================================================

export const employeeService: EmployeeService = {
	getAll: () => mockStore.getEmployees(),

	getById: (id: string) => mockStore.getEmployeeById(id),

	getByStatus: (status: Worker['status']) =>
		mockStore.getEmployees().filter((e) => e.status === status),
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllEmployees = () => employeeService.getAll();
export const getEmployeeById = (id: string) => employeeService.getById(id);
export const getEmployeesByStatus = (status: Worker['status']) =>
	employeeService.getByStatus(status);

// Export as getEmployees for backward compatibility with workerService
export const getEmployees = () => employeeService.getAll();
