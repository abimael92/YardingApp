/**
 * Domain Entities
 * 
 * Core business entities following Domain-Driven Design principles.
 * These represent the main aggregates in the system.
 */

// ============================================================================
// Value Objects & Enums
// ============================================================================

export type EntityId = string
export type Timestamp = string // ISO 8601 format

export enum ClientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum ClientSegment {
  VIP = "vip",
  REGULAR = "regular",
  NEW = "new",
  AT_RISK = "at_risk",
}

export enum JobStatus {
  DRAFT = "draft",
  QUOTED = "quoted",
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  VIEWED = "viewed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
  REVISED = "revised",
}

export enum EmployeeRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  WORKER = "worker",
}

export enum EmployeeStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ON_LEAVE = "on_leave",
  TERMINATED = "terminated",
}

export enum ScheduleStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  RESCHEDULED = "rescheduled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  ACH = "ach",
  CHECK = "check",
  CASH = "cash",
  OTHER = "other",
}

export enum CommunicationType {
  EMAIL = "email",
  SMS = "sms",
  IN_APP = "in_app",
  PUSH = "push",
  PHONE = "phone",
}

export enum CommunicationDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// ============================================================================
// Value Objects
// ============================================================================

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ContactInfo {
  email: string
  phone: string
  phoneSecondary?: string
  preferredContactMethod: "email" | "phone" | "sms"
}

export interface Money {
  amount: number
  currency: string // ISO 4217 code, e.g., "USD"
}

export interface TimeRange {
  start: Timestamp
  end: Timestamp
}

// ============================================================================
// Client Entity
// ============================================================================

export interface Client {
  id: EntityId
  // Identity
  name: string
  contactInfo: ContactInfo
  
  // Location
  primaryAddress: Address
  additionalAddresses?: Address[]
  
  // Status & Classification
  status: ClientStatus
  segment: ClientSegment
  tags?: string[]
  
  // Business Data
  totalSpent: Money
  lifetimeValue: Money
  firstServiceDate?: Timestamp
  lastServiceDate?: Timestamp
  nextScheduledService?: Timestamp
  
  // Relationships (IDs only - loaded separately)
  serviceRequestIds: EntityId[]
  quoteIds: EntityId[]
  jobIds: EntityId[]
  paymentIds: EntityId[]
  communicationIds: EntityId[]
  
  // Metadata
  notes?: string
  internalNotes?: string // Admin/Supervisor only
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: EntityId // Employee ID
}

// ============================================================================
// Quote Entity
// ============================================================================

export interface QuoteLineItem {
  id: EntityId
  serviceId: EntityId
  serviceName: string
  description: string
  quantity: number
  unitPrice: Money
  totalPrice: Money
  notes?: string
}

export interface Quote {
  id: EntityId
  quoteNumber: string // Human-readable, e.g., "Q-2025-001"
  
  // Relationships
  clientId: EntityId
  requestedBy?: EntityId // Employee ID who created the quote
  jobId?: EntityId // If converted to job
  
  // Quote Details
  status: QuoteStatus
  lineItems: QuoteLineItem[]
  subtotal: Money
  tax: Money
  discount?: Money
  total: Money
  
  // Validity
  validUntil: Timestamp
  expiresAt: Timestamp
  
  // Metadata
  notes?: string
  terms?: string
  revisionNumber: number
  parentQuoteId?: EntityId // If this is a revision
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  sentAt?: Timestamp
  viewedAt?: Timestamp
  acceptedAt?: Timestamp
  rejectedAt?: Timestamp
  rejectionReason?: string
}

// ============================================================================
// Job Entity
// ============================================================================

export interface JobTask {
  id: EntityId
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  priority: Priority
  estimatedDuration: number // minutes
  actualDuration?: number // minutes
  order: number // Sequence in job
}

export interface JobMaterial {
  id: EntityId
  name: string
  quantity: number
  unit: string
  cost: Money
  supplier?: string
}

export interface Job {
  id: EntityId
  jobNumber: string // Human-readable, e.g., "J-2025-001"
  
  // Relationships
  clientId: EntityId
  quoteId?: EntityId // If created from quote
  serviceRequestId?: EntityId // If created from request
  
  // Job Details
  status: JobStatus
  title: string
  description: string
  priority: Priority
  
  // Location
  address: Address
  
  // Work Details
  tasks: JobTask[]
  materials?: JobMaterial[]
  estimatedDuration: number // minutes
  actualDuration?: number // minutes
  estimatedCost: Money
  actualCost?: Money
  
  // Scheduling
  scheduledStart?: Timestamp
  scheduledEnd?: Timestamp
  actualStart?: Timestamp
  actualEnd?: Timestamp
  
  // Assignment
  assignedEmployeeIds: EntityId[]
  supervisorId?: EntityId
  
  // Financial
  quotedPrice: Money
  finalPrice?: Money
  invoiceId?: EntityId
  
  // Metadata
  notes?: string
  internalNotes?: string
  photos?: string[] // URLs
  completionNotes?: string
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt?: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
}

// ============================================================================
// Employee Entity
// ============================================================================

export interface Employee {
  id: EntityId
  // Identity
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  phoneEmergency?: string
  
  // Role & Status
  role: EmployeeRole
  status: EmployeeStatus
  employeeNumber?: string
  
  // Work Details
  department?: string
  hireDate: Timestamp
  terminationDate?: Timestamp
  
  // Availability
  availability: {
    monday: TimeRange[]
    tuesday: TimeRange[]
    wednesday: TimeRange[]
    thursday: TimeRange[]
    friday: TimeRange[]
    saturday: TimeRange[]
    sunday: TimeRange[]
  }
  
  // Performance
  rating?: number
  completedJobsCount: number
  totalHoursWorked: number
  
  // Relationships
  assignedJobIds: EntityId[]
  supervisedJobIds: EntityId[] // If supervisor
  
  // Metadata
  avatar?: string
  notes?: string
  certifications?: string[]
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================================================
// Schedule Entity
// ============================================================================

export interface Schedule {
  id: EntityId
  
  // Relationships
  jobId: EntityId
  employeeIds: EntityId[] // Multiple employees can be scheduled
  
  // Timing
  scheduledStart: Timestamp
  scheduledEnd: Timestamp
  timeRange: TimeRange
  
  // Status
  status: ScheduleStatus
  
  // Location
  address: Address
  travelTime?: number // minutes
  
  // Metadata
  notes?: string
  reminderSent?: boolean
  reminderSentAt?: Timestamp
  
  // Recurring
  isRecurring: boolean
  recurringPattern?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly"
    interval: number
    endDate?: Timestamp
    occurrences?: number
  }
  parentScheduleId?: EntityId // If this is a recurring instance
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
}

// ============================================================================
// Payment Entity
// ============================================================================

export interface Payment {
  id: EntityId
  paymentNumber: string // Human-readable, e.g., "PAY-2025-001"
  
  // Relationships
  clientId: EntityId
  invoiceId?: EntityId
  jobId?: EntityId
  
  // Payment Details
  status: PaymentStatus
  method: PaymentMethod
  amount: Money
  
  // Transaction Details
  transactionId?: string // External payment processor ID
  processor?: "stripe" | "paypal" | "square" | "manual"
  processorResponse?: Record<string, unknown>
  
  // Payment Method Details (stored securely, PCI compliant)
  paymentMethodId?: EntityId // Reference to stored payment method
  
  // Metadata
  notes?: string
  receiptUrl?: string
  refundAmount?: Money
  refundReason?: string
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  processedAt?: Timestamp
  completedAt?: Timestamp
  failedAt?: Timestamp
  failureReason?: string
  refundedAt?: Timestamp
}

// ============================================================================
// Communication Entity
// ============================================================================

export interface Communication {
  id: EntityId
  
  // Relationships
  clientId?: EntityId
  employeeId?: EntityId // Sender if outbound, recipient if inbound
  jobId?: EntityId
  quoteId?: EntityId
  serviceRequestId?: EntityId
  
  // Communication Details
  type: CommunicationType
  direction: CommunicationDirection
  subject?: string
  content: string
  
  // Status
  status: "draft" | "sent" | "delivered" | "read" | "failed"
  readAt?: Timestamp
  deliveredAt?: Timestamp
  
  // Template
  templateId?: EntityId
  templateVariables?: Record<string, string>
  
  // Attachments
  attachments?: {
    id: EntityId
    name: string
    url: string
    mimeType: string
    size: number
  }[]
  
  // Metadata
  priority: Priority
  tags?: string[]
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  sentAt?: Timestamp
  scheduledFor?: Timestamp // For scheduled communications
}

// ============================================================================
// Relationship Types (for type-safe relationships)
// ============================================================================

export interface ClientWithRelations {
  client: Client
  quotes?: Quote[]
  jobs?: Job[]
  payments?: Payment[]
  communications?: Communication[]
  employees?: Employee[] // Assigned employees from jobs
}

export interface JobWithRelations {
  job: Job
  client?: Client
  quote?: Quote
  employees?: Employee[]
  schedules?: Schedule[]
  payments?: Payment[]
  communications?: Communication[]
}

export interface QuoteWithRelations {
  quote: Quote
  client?: Client
  job?: Job
  communications?: Communication[]
}

export interface ScheduleWithRelations {
  schedule: Schedule
  job?: Job
  employees?: Employee[]
  client?: Client
}

export interface PaymentWithRelations {
  payment: Payment
  client?: Client
  job?: Job
}

export interface CommunicationWithRelations {
  communication: Communication
  client?: Client
  employee?: Employee
  job?: Job
  quote?: Quote
}
