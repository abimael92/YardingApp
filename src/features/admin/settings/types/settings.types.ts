export interface Template {
	id: string;
	name: string;
	subject: string;
	content: string;
	signature: string;
	type: 'email' | 'sms' | 'both';
	variables: string[];
	lastEdited: string;
}

export interface CompanySettings {
	name: string;
	taxId: string;
	serviceCategories: string[];
	taxRate: number;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
	phone: string;
	email: string;
	logo?: string;
}

export interface NotificationSettings {
	email: boolean;
	sms: boolean;
	paymentReminders: boolean;
	jobCompletionAlerts: boolean;
	quoteRequests: boolean;
}

export type TabId =
	| 'company'
	| 'billing'
	| 'notifications'
	| 'integrations'
	| 'email';


// Add this export
export const VARIABLE_GROUPS = {
  client: ['client_name', 'client_email', 'client_phone', 'client_address'],
  company: ['company_name', 'owner_name', 'phone_number', 'company_email', 'company_address'],
  job: ['job_type', 'job_address', 'job_date', 'job_time', 'job_amount', 'job_description'],
  invoice: ['invoice_number', 'invoice_amount', 'due_date', 'invoice_link', 'invoice_status'],
  quote: ['quote_number', 'quote_amount', 'valid_until', 'quote_link', 'quote_status'],
  payment: ['payment_amount', 'payment_date', 'payment_method', 'payment_status', 'receipt_link'],
  schedule: ['appointment_date', 'appointment_time', 'service_duration', 'technician_name']
} as const;