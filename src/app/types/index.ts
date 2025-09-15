// app/types/index.ts
export interface Worker {
	id: number;
	name: string;
	email: string;
	phone: string;
	role: 'worker' | 'supervisor' | 'admin';
	status: 'available' | 'busy' | 'offline';
	location: string;
	rating: number;
	tasksCompleted: number;
	image: string;
}

export interface Client {
	id: number;
	name: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	zipCode: string;
	properties: Property[];
}

export interface Property {
	id: number;
	clientId: number;
	address: string;
	size: string;
	type: 'residential' | 'commercial';
	services: ServiceType[];
}

export interface Task {
	id: number;
	title: string;
	description: string;
	status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	assignedTo: number;
	clientId: number;
	propertyId: number;
	scheduledDate: string;
	estimatedDuration: number;
	actualDuration?: number;
	cost: number;
	materials?: Material[];
	notes?: string;
}

export interface ServiceType {
	id: number;
	name: string;
	category: string;
	description: string;
	basePrice: number;
	estimatedDuration: number;
}

export interface Material {
	id: number;
	name: string;
	quantity: number;
	unit: string;
	cost: number;
}

export interface Location {
	id: number;
	name: string;
	address: string;
	coordinates: {
		lat: number;
		lng: number;
	};
}
