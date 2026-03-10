import {
	BuildingOfficeIcon,
	CreditCardIcon,
	BellIcon,
	KeyIcon,
	EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { Template } from '../types/settings.types';

export const TABS = [
	{ id: 'company', label: 'Company', icon: BuildingOfficeIcon },
	{ id: 'billing', label: 'Billing', icon: CreditCardIcon },
	{ id: 'notifications', label: 'Notifications', icon: BellIcon },
	{ id: 'integrations', label: 'Integrations', icon: KeyIcon },
	{ id: 'email', label: 'Email Templates', icon: EnvelopeIcon },
] as const;

export const DEFAULT_TEMPLATES: Template[] = [
	{
		id: '1',
		name: 'Invoice Email',
		subject: 'Your Invoice from {{company_name}}',
		content: 'Dear {{client_name}},\n\nThank you for your business...',
		signature: 'Best regards,\n{{owner_name}}\n{{company_name}}',
		type: 'email',
		variables: [
			'client_name',
			'company_name',
			'invoice_number',
			'invoice_amount',
		],
		lastEdited: new Date().toISOString(),
	},
	// ... other templates
];

export const VARIABLE_GROUPS = {
	client: ['client_name', 'client_email', 'client_phone'],
	company: ['company_name', 'owner_name', 'phone_number', 'company_email'],
	job: ['job_type', 'job_address', 'job_date', 'job_time', 'job_amount'],
	invoice: ['invoice_number', 'invoice_amount', 'due_date', 'invoice_link'],
	quote: ['quote_number', 'quote_amount', 'valid_until', 'quote_link'],
} as const;
