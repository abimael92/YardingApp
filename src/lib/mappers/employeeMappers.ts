// src/lib/mappers/employeeMappers.ts
import type { User } from '@/src/domain/models';
import type { Employee } from '@/src/domain/entities';
import { EmployeeRole, EmployeeStatus } from '@/src/domain/entities';

export const mapUserToEmployee = (user: User): Employee => {
	return {
		id: user.id,
		firstName: user.name.split(' ')[0] || '',
		lastName: user.name.split(' ').slice(1).join(' ') || '',
		displayName: user.name,
		email: user.email,
		phone: user.phone || '',
		role:
			user.role === 'Supervisor'
				? EmployeeRole.SUPERVISOR
				: EmployeeRole.WORKER,
		status:
			user.status === 'Active'
				? EmployeeStatus.ACTIVE
				: user.status === 'Pending'
					? EmployeeStatus.PENDING
					: EmployeeStatus.INACTIVE,
		hireDate: user.joinDate || new Date().toISOString(),
		employeeNumber: user.employeeNumber,
		department: user.department,
		hourlyRate: user.hourlyRate,
		availability: {
			monday: [],
			tuesday: [],
			wednesday: [],
			thursday: [],
			friday: [],
			saturday: [],
			sunday: [],
		},
		completedJobsCount: 0,
		totalHoursWorked: 0,
		assignedJobIds: [],
		supervisedJobIds: [],
		noteIds: [],
		activityLogIds: [],
		reminderIds: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: user.id,
		updatedBy: user.id,
	};
};
