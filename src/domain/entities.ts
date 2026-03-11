/**
 * Domain Entities
 *
 * Core business entities following Domain-Driven Design principles.
 * These represent the main aggregates in the system.
 */

// ============================================================================
// Value Objects & Enums
// ============================================================================

export type EntityId = string;
export type Timestamp = string; // ISO 8601 format

export enum ClientStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	PENDING = 'pending',
	SUSPENDED = 'suspended',
}

export enum ClientSegment {
	VIP = 'vip',
	REGULAR = 'regular',
	NEW = 'new',
	AT_RISK = 'at_risk',
}

export enum JobStatus {
	DRAFT = 'draft',
	QUOTED = 'quoted',
	SCHEDULED = 'scheduled',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
	ON_HOLD = 'on_hold',
}

export enum QuoteStatus {
	DRAFT = 'draft',
	SENT = 'sent',
	VIEWED = 'viewed',
	ACCEPTED = 'accepted',
	REJECTED = 'rejected',
	EXPIRED = 'expired',
	REVISED = 'revised',
}

export enum EmployeeRole {
	ADMIN = 'admin',
	SUPERVISOR = 'supervisor',
	WORKER = 'worker',
}

export enum EmployeeStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	ON_LEAVE = 'on_leave',
	TERMINATED = 'terminated',
	PENDING = 'pending',
}

export enum ScheduleStatus {
	SCHEDULED = 'scheduled',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
	RESCHEDULED = 'rescheduled',
}

export enum PaymentStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	REFUNDED = 'refunded',
	PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
	CREDIT_CARD = 'credit_card',
	DEBIT_CARD = 'debit_card',
	ACH = 'ach',
	CHECK = 'check',
	CASH = 'cash',
	OTHER = 'other',
}

export interface PaymentWithRelations {
	payment: Payment;
	client?: {
		id: EntityId;
		name: string;
		email?: string;
		phone?: string;
	};
	job?: {
		id: EntityId;
		jobNumber: string;
		title: string;
		status: JobStatus;
	};
	invoice?: {
		id: EntityId;
		invoiceNumber: string;
		total: number;
		status: InvoiceStatus;
	};
}

export enum CommunicationType {
	EMAIL = 'email',
	SMS = 'sms',
	IN_APP = 'in_app',
	PUSH = 'push',
	PHONE = 'phone',
}

export enum CommunicationDirection {
	INBOUND = 'inbound',
	OUTBOUND = 'outbound',
}

export enum Priority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	URGENT = 'urgent',
}

// ============================================================================
// Contract Status Enum (New)
// ============================================================================

export enum ContractStatus {
	DRAFT = 'draft',
	SENT = 'sent',
	NEGOTIATING = 'negotiating',
	SIGNED = 'signed',
	ACTIVE = 'active',
	EXPIRED = 'expired',
	TERMINATED = 'terminated',
	CANCELLED = 'cancelled',
}

// ============================================================================
// Invoice Status Enum (Enhanced)
// ============================================================================

export enum InvoiceStatus {
	DRAFT = 'draft',
	SENT = 'sent',
	VIEWED = 'viewed',
	PARTIALLY_PAID = 'partially_paid',
	PAID = 'paid',
	OVERDUE = 'overdue',
	CANCELLED = 'cancelled',
	REFUNDED = 'refunded',
}

// ============================================================================
// Note Category Enum (New)
// ============================================================================

export enum NoteCategory {
	GENERAL = 'general',
	ISSUE = 'issue',
	FOLLOWUP = 'followup',
	FEEDBACK = 'feedback',
	INTERNAL = 'internal',
	CONTRACT = 'contract',
	JOB = 'job',
	CLIENT = 'client',
}

// ============================================================================
// Property Type Enum (New)
// ============================================================================

export enum PropertyType {
	PRIMARY = 'primary',
	BILLING = 'billing',
	SERVICE = 'service',
	OTHER = 'other',
}

// ============================================================================
// Value Objects
// ============================================================================

export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country?: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
}

export interface ContactInfo {
	email: string;
	phone: string;
	phoneSecondary?: string;
	preferredContactMethod: 'email' | 'phone' | 'sms';
}

export interface Money {
	amount: number;
	currency: string; // ISO 4217 code, e.g., "USD"
}

export interface TimeRange {
	start: Timestamp;
	end: Timestamp;
}

// ============================================================================
// Client Entity (Updated with missing fields)
// ============================================================================

export interface Client {
	id: EntityId;
	// Identity
	name: string;
	type?: 'individual' | 'company';
	contactInfo: ContactInfo;

	// Location
	primaryAddress: Address;
	additionalAddresses?: Address[];

	// Status & Classification
	status: ClientStatus;
	segment: ClientSegment;
	tags?: string[];

	// Business Data
	totalSpent: Money;
	lifetimeValue: Money;
	firstServiceDate?: Timestamp;
	lastServiceDate?: Timestamp;
	nextScheduledService?: Timestamp;

	// Relationships (IDs only - loaded separately)
	serviceRequestIds: EntityId[];
	quoteIds: EntityId[];
	jobIds: EntityId[];
	paymentIds: EntityId[];
	invoiceIds: EntityId[];
	communicationIds: EntityId[];
	contractIds: EntityId[]; // NEW
	propertyIds: EntityId[]; // NEW
	noteIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW

	// Company Details (if type = "company")
	companyDetails?: {
		companyName: string;
		taxId?: string;
		website?: string;
	};

	// Preferences (embedded or reference)
	preferences?: ClientPreferences;

	// Metadata
	notes?: string;
	internalNotes?: string; // Admin/Supervisor only
	createdAt: Timestamp;
	updatedAt: Timestamp;
	createdBy?: EntityId; // Employee ID
}

// ============================================================================
// Client Preferences Entity (New)
// ============================================================================

export interface ClientPreferences {
	id: EntityId;
	clientId: EntityId;

	// Contact Preferences
	preferredContactMethod: 'email' | 'phone' | 'sms';
	doNotCall: boolean;
	doNotEmail: boolean;
	doNotSms: boolean;

	// Marketing Preferences
	marketingConsent: boolean;
	newsletterSubscribed: boolean;
	specialOffers: boolean;

	// Notification Preferences
	emailNotifications: boolean;
	smsNotifications: boolean;
	callReminders: boolean;

	// Notification Types
	notificationTypes: {
		jobUpdates: boolean;
		invoiceAlerts: boolean;
		paymentConfirmations: boolean;
		scheduleChanges: boolean;
		promotionalEmails: boolean;
	};

	// Language & Region
	preferredLanguage: string; // ISO 639-1 code
	timezone: string; // IANA timezone

	// Do Not Disturb
	doNotDisturb?: {
		enabled: boolean;
		startTime: string; // HH:MM format
		endTime: string; // HH:MM format
	};

	// Metadata
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// ============================================================================
// Property Entity (New)
// ============================================================================

export interface Property {
	id: EntityId;

	// Relationship
	clientId: EntityId;

	// Property Details
	name?: string;
	type: PropertyType;
	isPrimary: boolean;

	// Address
	address: Address;

	// Access Information
	gateCode?: string;
	accessInstructions?: string;

	// Property Features
	propertySize?: number; // square feet
	propertySizeUnit?: 'sqft' | 'acres';
	hasPets?: boolean;
	petNotes?: string;

	// Notes
	notes?: string;

	// Metadata
	createdBy: EntityId;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// ============================================================================
// Quote Entity
// ============================================================================

export interface QuoteLineItem {
	id: EntityId;
	serviceId: EntityId;
	serviceName: string;
	description: string;
	quantity: number;
	unitPrice: Money;
	totalPrice: Money;
	notes?: string;
}

export interface Quote {
	id: EntityId;
	quoteNumber: string; // Human-readable, e.g., "Q-2025-001"

	// Relationships
	clientId: EntityId;
	requestedBy?: EntityId; // Employee ID who created the quote
	jobId?: EntityId; // If converted to job
	contractId?: EntityId; // NEW - If converted to contract

	// Quote Details
	status: QuoteStatus;
	lineItems: QuoteLineItem[];
	subtotal: Money;
	tax: Money;
	discount?: Money;
	total: Money;

	// Validity
	validUntil: Timestamp;
	expiresAt: Timestamp;

	// Metadata
	notes?: string;
	terms?: string;
	revisionNumber: number;
	parentQuoteId?: EntityId; // If this is a revision

	// Relationships
	noteIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW
	communicationIds: EntityId[];

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	sentAt?: Timestamp;
	viewedAt?: Timestamp;
	acceptedAt?: Timestamp;
	rejectedAt?: Timestamp;
	rejectionReason?: string;
}

// ============================================================================
// Job Entity (Updated)
// ============================================================================

export interface JobTask {
	id: EntityId;
	title: string;
	description: string;
	status: 'pending' | 'in_progress' | 'completed' | 'skipped';
	priority: Priority;
	estimatedDuration: number; // minutes
	actualDuration?: number; // minutes
	order: number; // Sequence in job
}

export interface JobMaterial {
	id: EntityId;
	name: string;
	quantity: number;
	unit: string;
	cost: Money;
	supplier?: string;
}

export interface Job {
	id: EntityId;
	jobNumber: string; // Human-readable, e.g., "J-2025-001"

	// Relationships
	clientId: EntityId;
	quoteId?: EntityId; // If created from quote
	serviceRequestId?: EntityId; // If created from request
	contractId?: EntityId; // NEW - If part of contract

	// Job Details
	status: JobStatus;
	title: string;
	description: string;
	priority: Priority;

	// Location
	address: Address;

	// Work Details
	tasks: JobTask[];
	materials?: JobMaterial[];
	estimatedDuration: number; // minutes
	actualDuration?: number; // minutes
	estimatedCost: Money;
	actualCost?: Money;

	// Scheduling
	scheduledStart?: Timestamp;
	scheduledEnd?: Timestamp;
	actualStart?: Timestamp;
	actualEnd?: Timestamp;

	// Assignment
	assignedEmployeeIds: EntityId[];
	supervisorId?: EntityId;

	// Financial
	quotedPrice: Money;
	finalPrice?: Money;
	invoiceId?: EntityId;

	// Relationships
	noteIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW
	communicationIds: EntityId[];
	paymentIds: EntityId[];
	scheduleIds: EntityId[];

	// Metadata
	notes?: string;
	internalNotes?: string;
	photos?: string[]; // URLs
	completionNotes?: string;

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	completedAt?: Timestamp;
	cancelledAt?: Timestamp;
	cancellationReason?: string;
}

// ============================================================================
// Employee Entity (Updated)
// ============================================================================

export interface Employee {
	id: EntityId;
	// Identity
	firstName: string;
	lastName: string;
	displayName: string;
	email: string;
	phone: string;
	phoneEmergency?: string;

	// Role & Status
	role: EmployeeRole;
	status: EmployeeStatus;
	employeeNumber?: string;

	// Work Details
	department?: string;
	hireDate: Timestamp;
	terminationDate?: Timestamp;

	// Availability
	availability: {
		monday: TimeRange[];
		tuesday: TimeRange[];
		wednesday: TimeRange[];
		thursday: TimeRange[];
		friday: TimeRange[];
		saturday: TimeRange[];
		sunday: TimeRange[];
	};

	// Compensation
	hourlyRate?: number;
	salary?: Money;
	paySchedule?: 'weekly' | 'biweekly' | 'monthly';

	// Performance
	rating?: number;
	completedJobsCount: number;
	totalHoursWorked: number;

	// Relationships
	assignedJobIds: EntityId[];
	supervisedJobIds: EntityId[]; // If supervisor
	noteIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW
	reminderIds: EntityId[]; // NEW

	// Metadata
	avatar?: string;
	notes?: string;
	certifications?: string[];

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	createdBy?: EntityId;
	updatedBy?: EntityId;
}

// ============================================================================
// Schedule Entity
// ============================================================================

export interface Schedule {
	id: EntityId;

	// Relationships
	jobId: EntityId;
	employeeIds: EntityId[]; // Multiple employees can be scheduled

	// Timing
	scheduledStart: Timestamp;
	scheduledEnd: Timestamp;
	timeRange: TimeRange;

	// Status
	status: ScheduleStatus;

	// Location
	address: Address;
	travelTime?: number; // minutes

	// Metadata
	notes?: string;
	reminderSent?: boolean;
	reminderSentAt?: Timestamp;

	// Recurring
	isRecurring: boolean;
	recurringPattern?: {
		frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
		interval: number;
		endDate?: Timestamp;
		occurrences?: number;
	};
	parentScheduleId?: EntityId; // If this is a recurring instance

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	cancelledAt?: Timestamp;
	cancellationReason?: string;
}

// ============================================================================
// Payment Entity (Updated)
// ============================================================================

export interface Payment {
	id: EntityId;
	paymentNumber: string; // Human-readable, e.g., "PAY-2025-001"

	// Relationships
	clientId: EntityId;
	invoiceId?: EntityId;
	jobId?: EntityId;
	contractId?: EntityId; // NEW

	// Payment Details
	status: PaymentStatus;
	method: PaymentMethod;
	amount: Money;

	// Transaction Details
	transactionId?: string; // External payment processor ID
	processor?: 'stripe' | 'paypal' | 'square' | 'manual';
	processorResponse?: Record<string, unknown>;

	// Payment Method Details (stored securely, PCI compliant)
	paymentMethodId?: EntityId; // Reference to stored payment method

	// Metadata
	notes?: string;
	receiptUrl?: string;
	refundAmount?: Money;
	refundReason?: string;

	// Relationships
	activityLogIds: EntityId[]; // NEW

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	processedAt?: Timestamp;
	completedAt?: Timestamp;
	failedAt?: Timestamp;
	failureReason?: string;
	refundedAt?: Timestamp;
}

// ============================================================================
// Invoice Entity (Enhanced)
// ============================================================================

export interface InvoiceLineItem {
	id: EntityId;
	description: string;
	quantity: number;
	unitPrice: Money;
	total: Money;
	type: 'service' | 'material' | 'labor' | 'discount' | 'tax';
	referenceId?: EntityId; // jobId, materialId, etc.
}

export interface Invoice {
	id: EntityId;
	invoiceNumber: string; // Human-readable, e.g., "INV-2025-001"

	// Relationships
	clientId: EntityId;
	jobId?: EntityId;
	quoteId?: EntityId;
	contractId?: EntityId;

	// Invoice Details
	status: InvoiceStatus;
	lineItems: InvoiceLineItem[];

	// Financial
	subtotal: Money;
	tax: Money;
	discount?: Money;
	total: Money;
	balance: Money; // For partially paid

	// Dates
	issueDate: Timestamp;
	dueDate: Timestamp;
	paidAt?: Timestamp;
	lastReminderSent?: Timestamp;

	// Payment
	paymentTerms?: string;
	paymentInstructions?: string;
	lateFee?: Money;

	// Relationships
	paymentIds: EntityId[];
	activityLogIds: EntityId[]; // NEW

	// Documents
	pdfUrl?: string;
	notes?: string;

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	sentAt?: Timestamp;
}

// ============================================================================
// Contract Entity (New)
// ============================================================================

export interface Contract {
	id: EntityId;
	contractNumber: string; // Human-readable, e.g., "CT-2025-001"

	// Relationships
	clientId: EntityId;
	jobId?: EntityId;
	quoteId?: EntityId;
	parentContractId?: EntityId; // If amendment or renewal

	// Contract Details
	title: string;
	description?: string;
	status: ContractStatus;

	// Dates
	startDate: Timestamp;
	endDate?: Timestamp;
	signedAt?: Timestamp;
	expiresAt?: Timestamp;

	// Financial
	value: Money;
	deposit?: Money;
	depositPaid: boolean;
	paymentTerms?: string;

	// Legal
	terms?: string;
	specialConditions?: string;
	cancellationTerms?: string;
	governingLaw?: string;

	// Documents
	documentUrl?: string;
	attachments?: Array<{
		id: EntityId;
		name: string;
		url: string;
		type: string;
	}>;

	// Signatures
	signedByClient?: {
		name: string;
		email: string;
		ipAddress?: string;
		timestamp: Timestamp;
	};
	signedByCompany?: {
		employeeId: EntityId;
		employeeName: string;
		timestamp: Timestamp;
	};

	// Relationships
	noteIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW
	paymentIds: EntityId[];
	invoiceIds: EntityId[];

	// Metadata
	notes?: string;
	internalNotes?: string;
	createdBy: EntityId;
	approvedBy?: EntityId;
	approvedAt?: Timestamp;

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// ============================================================================
// Communication Entity (Updated)
// ============================================================================

export interface Communication {
	id: EntityId;

	// Relationships
	clientId?: EntityId;
	employeeId?: EntityId; // Sender if outbound, recipient if inbound
	jobId?: EntityId;
	quoteId?: EntityId;
	serviceRequestId?: EntityId;
	contractId?: EntityId; // NEW

	// Communication Details
	type: CommunicationType;
	direction: CommunicationDirection;
	subject?: string;
	content: string;

	// Status
	status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
	readAt?: Timestamp;
	deliveredAt?: Timestamp;

	// Template
	templateId?: EntityId;
	templateVariables?: Record<string, string>;

	// Attachments
	attachments?: {
		id: EntityId;
		name: string;
		url: string;
		mimeType: string;
		size: number;
	}[];

	// Metadata
	priority: Priority;
	tags?: string[];

	// Relationships
	reminderIds: EntityId[]; // NEW
	activityLogIds: EntityId[]; // NEW

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	sentAt?: Timestamp;
	scheduledFor?: Timestamp; // For scheduled communications
}

// ============================================================================
// Communication Template Entity (New)
// ============================================================================

export interface CommunicationTemplate {
	id: EntityId;
	name: string;
	type: CommunicationType;
	subject: string;
	content: string;
	variables: string[]; // Available variables like {{client.name}}

	// Metadata
	isActive: boolean;
	category?: string;
	tags?: string[];

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	createdBy: EntityId;
}

// ============================================================================
// Note Entity (New)
// ============================================================================

export interface Note {
	id: EntityId;

	// Relationships (polymorphic)
	entityType: 'client' | 'job' | 'quote' | 'contract' | 'employee';
	entityId: EntityId;

	// Note Details
	content: string;
	category: NoteCategory;
	priority?: Priority;

	// Privacy
	isPrivate: boolean; // Internal only
	isArchived: boolean;

	// Attachments
	attachments?: Array<{
		id: EntityId;
		name: string;
		url: string;
		type: string;
	}>;

	// Mentions
	mentions?: EntityId[]; // Employee IDs mentioned

	// Metadata
	createdBy: EntityId;
	createdByName?: string;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
	updatedBy?: EntityId;
}

// ============================================================================
// Reminder Entity (New)
// ============================================================================

export interface Reminder {
	id: EntityId;

	// Relationships (polymorphic)
	entityType: 'communication' | 'job' | 'payment' | 'contract' | 'client';
	entityId: EntityId;

	// Reminder Details
	title: string;
	description?: string;
	reminderDate: Timestamp;

	// Status
	completed: boolean;
	completedAt?: Timestamp;
	completedBy?: EntityId;

	// Assignment
	assignedTo: EntityId; // Employee ID

	// Recurring
	isRecurring: boolean;
	recurringPattern?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		endDate?: Timestamp;
	};

	// Metadata
	createdAt: Timestamp;
	updatedAt: Timestamp;
	createdBy: EntityId;
}

// ============================================================================
// Activity Log Entity (New - For audit trail)
// ============================================================================

export interface ActivityLog {
	id: EntityId;

	// Who
	userId: EntityId;
	userName: string;

	// What
	action: string; // e.g., "CREATE", "UPDATE", "DELETE", "VIEW"
	entityType: string;
	entityId: EntityId;

	// Changes
	oldValues?: Record<string, any>;
	newValues?: Record<string, any>;

	// Where
	ipAddress?: string;
	userAgent?: string;

	// When
	timestamp: Timestamp;

	// Metadata
	description: string;
	important: boolean;
}

// ============================================================================
// Service Request Entity (For quote requests)
// ============================================================================

export interface ServiceRequest {
	id: EntityId;

	// Client Info
	clientName: string;
	clientEmail: string;
	clientPhone?: string;

	// Service Details
	serviceName: string;
	projectType: string;
	zone: string;
	hours: number;
	sqft: number;
	visits: number;
	extras?: string;

	// Pricing
	minCents: number;
	maxCents: number;
	breakdownMetadata: Record<string, any>;

	// Status
	status: 'pending' | 'reviewed' | 'sent';

	// Communication
	messageToClient?: string;

	// Approval
	approvedMinCents?: number;
	approvedMaxCents?: number;

	// Timestamps
	createdAt: Timestamp;
	updatedAt: Timestamp;
	sentAt?: Timestamp;

	// Relationships
	convertedToQuoteId?: EntityId;
	convertedToJobId?: EntityId;
}

// ============================================================================
// Type Guards and Utility Types
// ============================================================================

export function isClient(entity: any): entity is Client {
	return entity && 'contactInfo' in entity && 'segment' in entity;
}

export function isJob(entity: any): entity is Job {
	return entity && 'jobNumber' in entity && 'tasks' in entity;
}

export function isQuote(entity: any): entity is Quote {
	return entity && 'quoteNumber' in entity && 'lineItems' in entity;
}

export function isPayment(entity: any): entity is Payment {
	return entity && 'paymentNumber' in entity && 'amount' in entity;
}

export function isEmployee(entity: any): entity is Employee {
	return entity && 'firstName' in entity && 'role' in entity;
}

export function isContract(entity: any): entity is Contract {
	return entity && 'contractNumber' in entity && 'status' in entity;
}

export function isInvoice(entity: any): entity is Invoice {
	return entity && 'invoiceNumber' in entity && 'total' in entity;
}

export function isNote(entity: any): entity is Note {
	return entity && 'content' in entity && 'category' in entity;
}

export function isCommunication(entity: any): entity is Communication {
	return entity && 'type' in entity && 'direction' in entity;
}

export function isProperty(entity: any): entity is Property {
	return entity && 'address' in entity && 'type' in entity;
}

// ============================================================================
// Extended Relationship Types
// ============================================================================

export interface ClientWithFullRelations {
	client: Client;
	preferences?: ClientPreferences;
	properties?: Property[];
	contracts?: Contract[];
	quotes?: Quote[];
	jobs?: Job[];
	payments?: Payment[];
	invoices?: Invoice[];
	communications?: Communication[];
	notes?: Note[];
	activityLogs?: ActivityLog[];
	employees?: Employee[]; // Assigned employees from jobs
}

export interface JobWithFullRelations {
	job: Job;
	client?: Client;
	quote?: Quote;
	contract?: Contract;
	employees?: Employee[];
	schedules?: Schedule[];
	payments?: Payment[];
	invoices?: Invoice[];
	communications?: Communication[];
	notes?: Note[];
	materials?: JobMaterial[];
	tasks?: JobTask[];
	activityLogs?: ActivityLog[];
}

export interface ContractWithRelations {
	contract: Contract;
	client?: Client;
	job?: Job;
	quote?: Quote;
	payments?: Payment[];
	invoices?: Invoice[];
	communications?: Communication[];
	notes?: Note[];
	amendments?: Contract[]; // Child contracts
}

export interface InvoiceWithRelations {
	invoice: Invoice;
	client?: Client;
	job?: Job;
	quote?: Quote;
	contract?: Contract;
	payments?: Payment[];
	communications?: Communication[];
}

export interface EmployeeWithRelations {
	employee: Employee;
	assignedJobs?: Job[];
	supervisedJobs?: Job[];
	notes?: Note[];
	reminders?: Reminder[];
	schedules?: Schedule[];
}
