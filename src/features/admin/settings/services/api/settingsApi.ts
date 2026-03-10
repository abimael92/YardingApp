// src/features/settings/services/api/settingsApi.ts
import { Template } from '../../types/settings.types';

// Simulated API delay for development
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to handle localStorage with error handling
const getStorageItem = <T>(key: string, defaultValue: T): T => {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch {
		return defaultValue;
	}
};

const setStorageItem = <T>(key: string, value: T): void => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error saving to localStorage: ${key}`, error);
	}
};

export const settingsApi = {
	// ==================== COMPANY SETTINGS ====================
	async getCompanySettings() {
		await delay(300);
		const defaultSettings = {
			company_name: 'Desert Landscaping Co.',
			legal_name: 'Desert Landscaping LLC',
			tax_id: '12-3456789',
			business_license: 'LIC-2024-001',
			insurance_info: {
				provider: 'General Liability Ins.',
				policy_number: 'GL-987654',
				expiration: '2025-12-31',
			},
			address: {
				street: '123 Business Park Dr',
				city: 'Phoenix',
				state: 'AZ',
				zip_code: '85001',
				country: 'US',
			},
			phone: '(602) 555-0123',
			email: 'info@desertlandscaping.com',
			website: 'www.desertlandscaping.com',
			logo_url: null,
			service_categories: [
				'Lawn Care',
				'Tree Service',
				'Irrigation',
				'Landscaping',
				'Hardscaping',
				'Design',
			],
			tax_rate: 8.0,
			currency: 'USD',
			timezone: 'America/Phoenix',
			business_hours: {
				monday: '8:00-17:00',
				tuesday: '8:00-17:00',
				wednesday: '8:00-17:00',
				thursday: '8:00-17:00',
				friday: '8:00-17:00',
				saturday: '9:00-14:00',
				sunday: 'closed',
			},
		};

		const saved = getStorageItem('company_settings', defaultSettings);
		return saved;
	},

	async updateCompanySettings(settings: any) {
		await delay(300);
		setStorageItem('company_settings', settings);
		return settings;
	},

	// ==================== BILLING & PAYMENT SETTINGS ====================
	async getBillingSettings() {
		await delay(300);
		const defaultSettings = {
			payment_terms: {
				default_due_days: 30,
				deposit_percentage: 50,
				enable_deposits: true,
				late_fee_percentage: 1.5,
				late_fee_days: 15,
			},
			invoice_settings: {
				invoice_prefix: 'INV',
				next_invoice_number: 1001,
				invoice_notes: 'Thank you for your business!',
				invoice_footer: 'Please make checks payable to Desert Landscaping LLC',
				show_tax: true,
				tax_label: 'Sales Tax',
				default_currency: 'USD',
				accepted_currencies: ['USD'],
				invoice_due_days: 30,
				auto_send_invoices: true,
				reminder_days: [7, 3, 1],
			},
			payment_methods: {
				cash: { enabled: true },
				check: { enabled: true },
				credit_card: {
					enabled: true,
					processor: 'stripe',
					fee_percentage: 2.9,
					fee_fixed: 0.3,
				},
				ach: {
					enabled: false,
					processor: 'stripe',
				},
				bank_transfer: {
					enabled: true,
					bank_name: 'Chase',
					account_name: 'Desert Landscaping LLC',
					account_number: '****1234',
					routing_number: '****5678',
				},
			},
			receipt_settings: {
				receipt_prefix: 'RCPT',
				next_receipt_number: 1001,
				email_receipts: true,
				print_receipts: true,
				sms_receipts: false,
				receipt_footer: 'Thank you for choosing Desert Landscaping!',
				include_logo: true,
				include_terms: true,
			},
		};

		const saved = getStorageItem('billing_settings', defaultSettings);
		return saved;
	},

	async updateBillingSettings(settings: any) {
		await delay(300);
		setStorageItem('billing_settings', settings);
		return settings;
	},

	// ==================== NOTIFICATION SETTINGS ====================
	async getNotificationSettings() {
		await delay(300);
		const defaultSettings = {
			email_notifications: {
				new_quote_request: true,
				new_job_assigned: true,
				payment_received: true,
				invoice_overdue: true,
				job_completed: true,
				client_message: true,
				low_inventory: true,
				equipment_maintenance_due: true,
				employee_time_off_request: true,
				daily_summary: true,
				weekly_summary: false,
			},
			sms_notifications: {
				new_job_assigned: true,
				job_start_reminder: true,
				job_completed: false,
				payment_received: true,
				invoice_overdue: true,
				emergency_alerts: true,
			},
			push_notifications: {
				enabled: true,
				new_quote_request: true,
				job_status_change: true,
				payment_received: true,
				low_inventory: true,
			},
			reminder_settings: {
				send_payment_reminders: true,
				reminder_days_before_due: [7, 3, 1],
				send_job_reminders: true,
				reminder_hours_before_job: [24, 2],
				send_maintenance_reminders: true,
				reminder_days_before_maintenance: [7, 1],
				max_reminders_per_item: 3,
			},
			admin_notifications: {
				new_quote_request: { email: true, sms: true, push: true },
				new_client_registration: { email: true, sms: false, push: true },
				payment_failed: { email: true, sms: true, push: true },
				low_inventory_alert: { email: true, sms: false, push: true },
				system_error: { email: true, sms: true, push: true },
			},
			notification_frequency: {
				batch_emails: false,
				batch_time: '17:00',
				quiet_hours_enabled: true,
				quiet_hours_start: '22:00',
				quiet_hours_end: '07:00',
				timezone: 'America/Phoenix',
			},
		};

		const saved = getStorageItem('notification_settings', defaultSettings);
		return saved;
	},

	async updateNotificationSettings(settings: any) {
		await delay(300);
		setStorageItem('notification_settings', settings);
		return settings;
	},

	// ==================== INTEGRATION SETTINGS ====================
	async getIntegrationSettings() {
		await delay(300);
		const defaultSettings = {
			stripe: {
				enabled: false,
				mode: 'test',
				publishable_key: '',
				secret_key: '',
				webhook_secret: '',
				connected: false,
			},
			quickbooks: {
				enabled: false,
				mode: 'test',
				client_id: '',
				client_secret: '',
				company_id: '',
				access_token: '',
				refresh_token: '',
				connected: false,
				last_sync: null,
			},
			google_calendar: {
				enabled: false,
				client_id: '',
				client_secret: '',
				calendar_id: 'primary',
				connected: false,
				sync_jobs: true,
				sync_employee_schedules: true,
			},
			google_maps: {
				enabled: true,
				api_key: '',
				enabled_features: ['geocoding', 'directions', 'distance_matrix'],
			},
			twilio: {
				enabled: false,
				account_sid: '',
				auth_token: '',
				phone_number: '',
				messaging_service_sid: '',
				connected: false,
			},
			sendgrid: {
				enabled: false,
				api_key: '',
				from_email: 'notifications@desertlandscaping.com',
				from_name: 'Desert Landscaping',
				connected: false,
			},
			mailchimp: {
				enabled: false,
				api_key: '',
				list_id: '',
				connected: false,
				sync_contacts: true,
			},
			dropbox: {
				enabled: false,
				access_token: '',
				folder_path: '/landscaping',
				connected: false,
				auto_backup: true,
				backup_frequency: 'daily',
			},
		};

		const saved = getStorageItem('integration_settings', defaultSettings);
		return saved;
	},

	async updateIntegrationSettings(settings: any) {
		await delay(300);
		setStorageItem('integration_settings', settings);
		return settings;
	},

	// ==================== EMAIL & SMS TEMPLATES ====================
	async getTemplates(): Promise<Template[]> {
		await delay(300);
		const saved = getStorageItem('email_templates', []);

		if (saved.length === 0) {
			const defaultTemplates: Template[] = [
				{
					id: '1',
					name: 'Quote Request Confirmation',
					subject: 'We received your quote request - {{company_name}}',
					content:
						"<p>Dear {{client_name}},</p>\n<p>Thank you for requesting a quote from {{company_name}}. We have received your request for {{service_type}} services and will review it shortly.</p>\n<p><strong>Request Details:</strong></p>\n<ul>\n<li>Service: {{service_type}}</li>\n<li>Project Type: {{project_type}}</li>\n<li>Estimated Hours: {{hours}}</li>\n<li>Square Footage: {{sqft}}</li>\n<li>Estimated Range: ${{min_amount}} - ${{max_amount}}</li>\n</ul>\n<p>Our team will review your request and get back to you within 24-48 hours with a detailed quote.</p>\n<p>If you have any questions in the meantime, please don't hesitate to contact us.</p>",
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'company_name',
						'service_type',
						'project_type',
						'hours',
						'sqft',
						'min_amount',
						'max_amount',
						'owner_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '2',
					name: 'Quote Ready',
					subject: 'Your quote is ready - {{company_name}}',
					content:
						'<p>Dear {{client_name}},</p>\n<p>Great news! Your quote is ready for review.</p>\n<p><strong>Quote #{{quote_number}}</strong></p>\n<ul>\n<li>Total Amount: ${{quote_amount}}</li>\n<li>Valid Until: {{valid_until}}</li>\n<li>Deposit Required: ${{deposit_amount}}</li>\n</ul>\n<p>You can view and accept your quote online here:</p>\n<p><a href="{{quote_link}}">View Your Quote</a></p>\n<p>Once accepted, we\'ll schedule your service at your earliest convenience.</p>',
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'quote_number',
						'quote_amount',
						'valid_until',
						'deposit_amount',
						'quote_link',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '3',
					name: 'Job Scheduled Confirmation',
					subject: 'Your service has been scheduled - {{company_name}}',
					content:
						"<p>Dear {{client_name}},</p>\n<p>Your {{service_type}} service has been scheduled!</p>\n<p><strong>Schedule Details:</strong></p>\n<ul>\n<li>Date: {{job_date}}</li>\n<li>Time: {{job_time}}</li>\n<li>Location: {{job_address}}</li>\n<li>Estimated Duration: {{job_duration}}</li>\n<li>Crew Lead: {{crew_lead}}</li>\n</ul>\n<p><strong>Job Description:</strong></p>\n<p>{{job_description}}</p>\n<p>Our crew will arrive during the scheduled time window. You'll receive a text message 2 hours before arrival.</p>",
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'both',
					variables: [
						'client_name',
						'service_type',
						'job_date',
						'job_time',
						'job_address',
						'job_duration',
						'crew_lead',
						'job_description',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '4',
					name: 'Job Started SMS',
					subject: 'Job Started',
					content:
						'Hi {{client_name}}, your {{service_type}} service at {{job_address}} has started. Our crew will complete the work today. Track progress: {{tracking_link}}',
					signature: '- {{company_name}}',
					type: 'sms',
					variables: [
						'client_name',
						'service_type',
						'job_address',
						'tracking_link',
						'company_name',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '5',
					name: 'Job Completed',
					subject: 'Your service is complete! - {{company_name}}',
					content:
						'<p>Dear {{client_name}},</p>\n<p>Great news! Your {{service_type}} service has been completed.</p>\n<p><strong>Completion Summary:</strong></p>\n<ul>\n<li>Completed on: {{completion_date}}</li>\n<li>Work performed: {{work_description}}</li>\n<li>Final amount: ${{final_amount}}</li>\n</ul>\n<p><strong>Before & After Photos:</strong></p>\n<p><a href="{{photos_link}}">View Photos</a></p>\n<p>An invoice has been sent to your email. You can pay online here:</p>\n<p><a href="{{invoice_link}}">Pay Invoice</a></p>\n<p>We\'d love to hear your feedback! Please take a moment to review our service:</p>\n<p><a href="{{review_link}}">Leave a Review</a></p>',
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'service_type',
						'completion_date',
						'work_description',
						'final_amount',
						'photos_link',
						'invoice_link',
						'review_link',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '6',
					name: 'Invoice Ready',
					subject: 'Invoice #{{invoice_number}} is ready - {{company_name}}',
					content:
						'<p>Dear {{client_name}},</p>\n<p>Your invoice is now available.</p>\n<p><strong>Invoice #{{invoice_number}}</strong></p>\n<ul>\n<li>Amount Due: ${{invoice_amount}}</li>\n<li>Due Date: {{due_date}}</li>\n</ul>\n<p><strong>Services Provided:</strong></p>\n<p>{{invoice_details}}</p>\n<p>You can view and pay your invoice online:</p>\n<p><a href="{{invoice_link}}">Pay Invoice Now</a></p>\n<p>If you have any questions about this invoice, please contact us.</p>',
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'invoice_number',
						'invoice_amount',
						'due_date',
						'invoice_details',
						'invoice_link',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '7',
					name: 'Payment Received',
					subject: 'Payment received - Thank you!',
					content:
						'<p>Dear {{client_name}},</p>\n<p>Thank you for your payment!</p>\n<p><strong>Payment Details:</strong></p>\n<ul>\n<li>Invoice #{{invoice_number}}</li>\n<li>Amount Paid: ${{payment_amount}}</li>\n<li>Payment Date: {{payment_date}}</li>\n<li>Payment Method: {{payment_method}}</li>\n<li>Transaction ID: {{transaction_id}}</li>\n</ul>\n<p>Your receipt is attached to this email or available in your client portal.</p>\n<p><a href="{{receipt_link}}">View Receipt</a></p>\n<p>Thank you for choosing {{company_name}}!</p>',
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'invoice_number',
						'payment_amount',
						'payment_date',
						'payment_method',
						'transaction_id',
						'receipt_link',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '8',
					name: 'Payment Reminder',
					subject: 'Reminder: Payment due for Invoice #{{invoice_number}}',
					content:
						'<p>Dear {{client_name}},</p>\n<p>This is a friendly reminder that payment for Invoice #{{invoice_number}} is due soon.</p>\n<p><strong>Invoice Summary:</strong></p>\n<ul>\n<li>Amount Due: ${{invoice_amount}}</li>\n<li>Due Date: {{due_date}}</li>\n<li>Days Remaining: {{days_remaining}}</li>\n</ul>\n<p>If payment has already been made, please disregard this reminder.</p>\n<p><a href="{{invoice_link}}">Pay Online Now</a></p>\n<p>Thank you for your prompt attention to this matter.</p>',
					signature:
						'<p>Best regards,<br>{{owner_name}}<br>{{company_name}}<br>{{phone_number}}</p>',
					type: 'both',
					variables: [
						'client_name',
						'invoice_number',
						'invoice_amount',
						'due_date',
						'days_remaining',
						'invoice_link',
						'owner_name',
						'company_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '9',
					name: 'Welcome Email',
					subject: 'Welcome to {{company_name}}!',
					content:
						'<p>Dear {{client_name}},</p>\n<p>Welcome to {{company_name}}! We\'re thrilled to have you as a client.</p>\n<p><strong>Your Client Portal:</strong></p>\n<p>You can log in to your client portal at any time to:</p>\n<ul>\n<li>Request new quotes</li>\n<li>View job history</li>\n<li>Pay invoices</li>\n<li>Schedule appointments</li>\n<li>Update your preferences</li>\n</ul>\n<p><a href="{{portal_link}}">Access Your Portal</a></p>\n<p><strong>Your Account Details:</strong></p>\n<ul>\n<li>Email: {{client_email}}</li>\n<li>Phone: {{client_phone}}</li>\n<li>Address: {{client_address}}</li>\n</ul>\n<p>If you have any questions, our team is always here to help. Simply reply to this email or call us at {{phone_number}}.</p>',
					signature:
						'<p>Warm regards,<br>The {{company_name}} Team<br>{{owner_name}}<br>{{phone_number}}</p>',
					type: 'email',
					variables: [
						'client_name',
						'company_name',
						'portal_link',
						'client_email',
						'client_phone',
						'client_address',
						'owner_name',
						'phone_number',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '10',
					name: 'Appointment Reminder SMS',
					subject: 'Appointment Reminder',
					content:
						'Reminder: Your {{service_type}} appointment is tomorrow, {{appointment_date}} at {{appointment_time}}. Location: {{job_address}}. Reply CONFIRM to confirm.',
					signature: '- {{company_name}}',
					type: 'sms',
					variables: [
						'service_type',
						'appointment_date',
						'appointment_time',
						'job_address',
						'company_name',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '11',
					name: 'Employee Job Assignment',
					subject: 'New job assigned - Job #{{job_number}}',
					content:
						'<p>Hi {{employee_name}},</p>\n<p>A new job has been assigned to you.</p>\n<p><strong>Job Details:</strong></p>\n<ul>\n<li>Job #{{job_number}}</li>\n<li>Client: {{client_name}}</li>\n<li>Address: {{job_address}}</li>\n<li>Date: {{job_date}}</li>\n<li>Time: {{job_time}}</li>\n<li>Service Type: {{service_type}}</li>\n<li>Estimated Duration: {{job_duration}}</li>\n</ul>\n<p><strong>Special Instructions:</strong></p>\n<p>{{job_instructions}}</p>\n<p>Please confirm receipt and review the job details in your employee portal.</p>\n<p><a href="{{job_link}}">View Job Details</a></p>',
					signature: '<p>Thanks,<br>{{manager_name}}<br>{{company_name}}</p>',
					type: 'email',
					variables: [
						'employee_name',
						'job_number',
						'client_name',
						'job_address',
						'job_date',
						'job_time',
						'service_type',
						'job_duration',
						'job_instructions',
						'job_link',
						'manager_name',
						'company_name',
					],
					lastEdited: new Date().toISOString(),
				},
				{
					id: '12',
					name: 'Low Inventory Alert',
					subject: 'Low Inventory Alert - {{company_name}}',
					content:
						'<p>Hi {{manager_name}},</p>\n<p>The following materials are below reorder level:</p>\n<ul>\n{{#each low_stock_items}}\n<li>{{this.name}} - Current Stock: {{this.current_stock}} {{this.unit}} (Reorder at {{this.reorder_level}})</li>\n{{/each}}\n</ul>\n<p><a href="{{inventory_link}}">View Inventory</a></p>\n<p>Please reorder soon to avoid service disruptions.</p>',
					signature: '<p>Best regards,<br>{{company_name}} System</p>',
					type: 'email',
					variables: ['manager_name', 'company_name', 'inventory_link'],
					lastEdited: new Date().toISOString(),
				},
			];

			setStorageItem('email_templates', defaultTemplates);
			return defaultTemplates;
		}

		return saved;
	},

	async updateTemplate(template: Template): Promise<Template> {
		await delay(300);
		const templates = await this.getTemplates();
		const updated = templates.map((t) => (t.id === template.id ? template : t));
		setStorageItem('email_templates', updated);
		return template;
	},

	async createTemplate(
		template: Omit<Template, 'id' | 'lastEdited'>,
	): Promise<Template> {
		await delay(300);
		const newTemplate: Template = {
			...template,
			id: Date.now().toString(),
			lastEdited: new Date().toISOString(),
		};

		const templates = await this.getTemplates();
		setStorageItem('email_templates', [...templates, newTemplate]);
		return newTemplate;
	},

	async deleteTemplate(id: string): Promise<void> {
		await delay(300);
		const templates = await this.getTemplates();
		setStorageItem(
			'email_templates',
			templates.filter((t) => t.id !== id),
		);
	},

	async duplicateTemplate(id: string): Promise<Template> {
		await delay(300);
		const templates = await this.getTemplates();
		const original = templates.find((t) => t.id === id);
		if (!original) throw new Error('Template not found');

		const duplicate: Template = {
			...original,
			id: Date.now().toString(),
			name: `${original.name} (Copy)`,
			lastEdited: new Date().toISOString(),
		};

		setStorageItem('email_templates', [...templates, duplicate]);
		return duplicate;
	},

	async getTemplateVariables(): Promise<Record<string, string[]>> {
		await delay(150);
		return {
			client: ['client_name', 'client_email', 'client_phone', 'client_address'],
			company: [
				'company_name',
				'owner_name',
				'phone_number',
				'company_email',
				'company_address',
			],
			job: [
				'job_number',
				'job_type',
				'job_address',
				'job_date',
				'job_time',
				'job_duration',
				'job_description',
				'job_instructions',
			],
			invoice: [
				'invoice_number',
				'invoice_amount',
				'due_date',
				'invoice_link',
				'invoice_details',
			],
			quote: [
				'quote_number',
				'quote_amount',
				'valid_until',
				'quote_link',
				'deposit_amount',
			],
			payment: [
				'payment_amount',
				'payment_date',
				'payment_method',
				'transaction_id',
				'receipt_link',
			],
			schedule: [
				'appointment_date',
				'appointment_time',
				'service_type',
				'crew_lead',
				'tracking_link',
			],
			employee: ['employee_name', 'manager_name', 'job_link', 'inventory_link'],
			misc: ['review_link', 'portal_link', 'photos_link'],
		};
	},

	// ==================== USER & ROLE SETTINGS ====================
	async getUserSettings() {
		await delay(300);
		const defaultSettings = {
			default_user_role: 'worker',
			allowed_roles: [
				'admin',
				'director',
				'teacher',
				'student',
				'nurse',
				'secretary',
				'worker',
			],
			registration_settings: {
				allow_public_registration: false,
				require_email_verification: true,
				default_role_for_public: 'worker',
				allowed_domains: [],
				blocked_domains: [],
			},
			session_settings: {
				session_timeout_minutes: 120,
				max_concurrent_sessions: 3,
				require_mfa_for_roles: ['admin', 'director'],
			},
			password_policy: {
				min_length: 8,
				require_uppercase: true,
				require_lowercase: true,
				require_numbers: true,
				require_special: true,
				expiration_days: 90,
			},
		};

		const saved = getStorageItem('user_settings', defaultSettings);
		return saved;
	},

	async updateUserSettings(settings: any) {
		await delay(300);
		setStorageItem('user_settings', settings);
		return settings;
	},

	// ==================== WORKFLOW & JOB SETTINGS ====================
	async getWorkflowSettings() {
		await delay(300);
		const defaultSettings = {
			job_statuses: [
				'draft',
				'quoted',
				'scheduled',
				'in_progress',
				'completed',
				'cancelled',
				'on_hold',
			],
			default_job_status: 'draft',
			auto_assign_crews: true,
			require_job_approval: true,
			job_approvers: ['admin', 'director'],
			completion_requirements: {
				require_photos: true,
				require_client_signature: true,
				require_material_tracking: true,
				require_time_tracking: true,
			},
			job_number_format: {
				prefix: 'JOB',
				next_number: 1000,
				include_year: true,
				separator: '-',
			},
		};

		const saved = getStorageItem('workflow_settings', defaultSettings);
		return saved;
	},

	async updateWorkflowSettings(settings: any) {
		await delay(300);
		setStorageItem('workflow_settings', settings);
		return settings;
	},

	// ==================== EQUIPMENT SETTINGS ====================
	async getEquipmentSettings() {
		await delay(300);
		const defaultSettings = {
			equipment_statuses: [
				'available',
				'in_use',
				'maintenance',
				'out_of_service',
			],
			maintenance_reminder_days: 7,
			fuel_tracking_enabled: true,
			hourly_rate_default: 5000,
			auto_assign_equipment: true,
			equipment_number_format: {
				prefix: 'EQ',
				next_number: 100,
			},
		};

		const saved = getStorageItem('equipment_settings', defaultSettings);
		return saved;
	},

	async updateEquipmentSettings(settings: any) {
		await delay(300);
		setStorageItem('equipment_settings', settings);
		return settings;
	},

	// ==================== MATERIAL & INVENTORY SETTINGS ====================
	async getInventorySettings() {
		await delay(300);
		const defaultSettings = {
			low_stock_threshold: 10,
			critical_stock_threshold: 3,
			auto_reorder: false,
			reorder_reminder_days: 2,
			default_supplier: null,
			inventory_tracking_method: 'fifo',
			enable_barcode: true,
			enable_lot_tracking: false,
			enable_expiry_tracking: true,
		};

		const saved = getStorageItem('inventory_settings', defaultSettings);
		return saved;
	},

	async updateInventorySettings(settings: any) {
		await delay(300);
		setStorageItem('inventory_settings', settings);
		return settings;
	},

	// ==================== CLIENT & COMMUNICATION SETTINGS ====================
	async getClientSettings() {
		await delay(300);
		const defaultSettings = {
			client_number_format: {
				prefix: 'CL',
				next_number: 1000,
			},
			default_contact_method: 'email',
			auto_send_welcome_email: true,
			allow_client_portal: true,
			client_portal_features: {
				view_jobs: true,
				request_quotes: true,
				pay_invoices: true,
				schedule_appointments: true,
				update_profile: true,
				view_history: true,
			},
			communication_logging: {
				log_emails: true,
				log_sms: true,
				log_calls: true,
				log_meetings: true,
			},
		};

		const saved = getStorageItem('client_settings', defaultSettings);
		return saved;
	},

	async updateClientSettings(settings: any) {
		await delay(300);
		setStorageItem('client_settings', settings);
		return settings;
	},

	// ==================== REPORT & DASHBOARD SETTINGS ====================
	async getReportSettings() {
		await delay(300);
		const defaultSettings = {
			default_report_period: 'current_month',
			auto_generate_reports: ['daily_sales', 'weekly_summary'],
			report_formats: ['pdf', 'csv', 'excel'],
			dashboard_refresh_interval: 5,
			default_dashboard_layout: 'grid',
			widgets_available: [
				'sales_chart',
				'upcoming_jobs',
				'low_inventory',
				'recent_payments',
			],
		};

		const saved = getStorageItem('report_settings', defaultSettings);
		return saved;
	},

	async updateReportSettings(settings: any) {
		await delay(300);
		setStorageItem('report_settings', settings);
		return settings;
	},

	// ==================== SYSTEM & BACKUP SETTINGS ====================
	async getSystemSettings() {
		await delay(300);
		const defaultSettings = {
			app_name: 'Desert Landscaping Management',
			app_version: '1.0.0',
			environment: 'production',
			debug_mode: false,
			maintenance_mode: false,
			backup_settings: {
				auto_backup: true,
				backup_frequency: 'daily',
				backup_time: '02:00',
				backup_retention_days: 30,
				backup_location: 's3',
			},
			logging: {
				log_level: 'info',
				log_retention_days: 30,
				log_audit_trail: true,
			},
			api_settings: {
				rate_limiting: true,
				max_requests_per_minute: 60,
				enable_cors: true,
				allowed_origins: ['http://localhost:3000'],
			},
		};

		const saved = getStorageItem('system_settings', defaultSettings);
		return saved;
	},

	async updateSystemSettings(settings: any) {
		await delay(300);
		setStorageItem('system_settings', settings);
		return settings;
	},
};
