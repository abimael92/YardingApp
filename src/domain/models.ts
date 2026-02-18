export interface Service {
  id: string
  name: string
  description: string
  image: string
  category: string
  categoryColor: string
  duration: string
  price: string
  features: string[]
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  assignedTo?: string
  dueDate: string
  location: string
  estimatedDuration: string
}

export interface Worker {
  id: string
  name: string
  role: string
  avatar: string
  status: "available" | "busy" | "offline"
  rating: number
  completedTasks: number
}

export interface EmployeeStats {
	total: number;
	active: number;
	pending: number;
	inactive: number;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Client' | 'Supervisor' | 'Worker';
	status: 'Active' | 'Pending' | 'Inactive';
	joinDate: string;
	// New fields for boss management
	employeeNumber?: string;
	department?: string;
	position?: string;
	hourlyRate?: number;
	phone?: string;
	avatar?: string;
	assignedJobs?: JobAssignment[];
}

export interface JobAssignment {
	jobId: string;
	jobNumber: string;
	jobTitle: string;
	status: 'assigned' | 'in_progress' | 'completed';
	assignedAt: string;
	roleInJob: 'lead' | 'helper' | 'specialist' | 'supervisor';
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  serviceHistory: Service[]
  totalSpent: number
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}
