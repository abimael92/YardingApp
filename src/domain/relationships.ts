/**
 * Domain Relationships
 * 
 * Defines relationships between domain entities.
 * These types help ensure type-safe relationship handling.
 */

import type {
  Client,
  Job,
  Quote,
  Employee,
  Schedule,
  Payment,
  Communication,
  EntityId,
} from "./entities"

// ============================================================================
// Relationship Definitions
// ============================================================================

/**
 * Client Relationships
 * 
 * Client (1) ──< (N) Quote
 * Client (1) ──< (N) Job
 * Client (1) ──< (N) Payment
 * Client (1) ──< (N) Communication
 * Client (1) ──< (N) ServiceRequest (future)
 */
export interface ClientRelationships {
  quotes: Quote[]
  jobs: Job[]
  payments: Payment[]
  communications: Communication[]
  serviceRequests?: EntityId[] // Future module
}

/**
 * Quote Relationships
 * 
 * Quote (N) >── (1) Client
 * Quote (1) ──< (1) Job (optional, if converted)
 * Quote (1) ──< (N) Communication
 * Quote (1) ──< (1) Quote (parent, if revision)
 */
export interface QuoteRelationships {
  client: Client
  job?: Job
  communications: Communication[]
  parentQuote?: Quote
  revisions?: Quote[]
}

/**
 * Job Relationships
 * 
 * Job (N) >── (1) Client
 * Job (1) >── (1) Quote (optional, if created from quote)
 * Job (1) ──< (N) Schedule
 * Job (N) >── (M) Employee (many-to-many)
 * Job (1) >── (1) Employee (supervisor, optional)
 * Job (1) ──< (N) Payment
 * Job (1) ──< (N) Communication
 */
export interface JobRelationships {
  client: Client
  quote?: Quote
  schedules: Schedule[]
  employees: Employee[]
  supervisor?: Employee
  payments: Payment[]
  communications: Communication[]
}

/**
 * Employee Relationships
 * 
 * Employee (M) >──< (N) Job (many-to-many)
 * Employee (1) ──< (N) Job (supervised jobs, if supervisor)
 * Employee (1) ──< (N) Schedule
 * Employee (1) ──< (N) Communication
 */
export interface EmployeeRelationships {
  assignedJobs: Job[]
  supervisedJobs: Job[] // If supervisor role
  schedules: Schedule[]
  communications: Communication[]
}

/**
 * Schedule Relationships
 * 
 * Schedule (N) >── (1) Job
 * Schedule (N) >── (M) Employee (many-to-many)
 * Schedule (N) >── (1) Client (via Job)
 */
export interface ScheduleRelationships {
  job: Job
  employees: Employee[]
  client: Client // Derived from job
}

/**
 * Payment Relationships
 * 
 * Payment (N) >── (1) Client
 * Payment (1) >── (1) Job (optional)
 * Payment (1) >── (1) Invoice (optional, future)
 */
export interface PaymentRelationships {
  client: Client
  job?: Job
  invoice?: EntityId // Future module
}

/**
 * Communication Relationships
 * 
 * Communication (N) >── (1) Client (optional)
 * Communication (N) >── (1) Employee (optional)
 * Communication (N) >── (1) Job (optional)
 * Communication (N) >── (1) Quote (optional)
 * Communication (N) >── (1) ServiceRequest (optional, future)
 */
export interface CommunicationRelationships {
  client?: Client
  employee?: Employee
  job?: Job
  quote?: Quote
  serviceRequest?: EntityId // Future module
}

// ============================================================================
// Aggregate Roots
// ============================================================================

/**
 * Aggregate Roots define the boundaries of consistency.
 * Each aggregate root manages its own entities and value objects.
 */

/**
 * Client Aggregate
 * - Root: Client
 * - Contains: Client entity, Address value objects
 * - References: Quote IDs, Job IDs, Payment IDs (other aggregates)
 */
export type ClientAggregate = Client & {
  _relationships?: ClientRelationships
}

/**
 * Job Aggregate
 * - Root: Job
 * - Contains: Job entity, JobTask entities, JobMaterial entities
 * - References: Client ID, Employee IDs, Quote ID (other aggregates)
 */
export type JobAggregate = Job & {
  _relationships?: JobRelationships
}

/**
 * Quote Aggregate
 * - Root: Quote
 * - Contains: Quote entity, QuoteLineItem entities
 * - References: Client ID, Job ID (other aggregates)
 */
export type QuoteAggregate = Quote & {
  _relationships?: QuoteRelationships
}

/**
 * Employee Aggregate
 * - Root: Employee
 * - Contains: Employee entity, Availability value objects
 * - References: Job IDs (other aggregates)
 */
export type EmployeeAggregate = Employee & {
  _relationships?: EmployeeRelationships
}

/**
 * Schedule Aggregate
 * - Root: Schedule
 * - Contains: Schedule entity, TimeRange value objects
 * - References: Job ID, Employee IDs (other aggregates)
 */
export type ScheduleAggregate = Schedule & {
  _relationships?: ScheduleRelationships
}

/**
 * Payment Aggregate
 * - Root: Payment
 * - Contains: Payment entity, Money value objects
 * - References: Client ID, Job ID (other aggregates)
 */
export type PaymentAggregate = Payment & {
  _relationships?: PaymentRelationships
}

/**
 * Communication Aggregate
 * - Root: Communication
 * - Contains: Communication entity
 * - References: Client ID, Employee ID, Job ID, Quote ID (other aggregates)
 */
export type CommunicationAggregate = Communication & {
  _relationships?: CommunicationRelationships
}

// ============================================================================
// Relationship Loading Helpers
// ============================================================================

/**
 * Type-safe relationship loading patterns
 */

export type LoadRelationships<T> = T extends ClientAggregate
  ? ClientRelationships
  : T extends JobAggregate
  ? JobRelationships
  : T extends QuoteAggregate
  ? QuoteRelationships
  : T extends EmployeeAggregate
  ? EmployeeRelationships
  : T extends ScheduleAggregate
  ? ScheduleRelationships
  : T extends PaymentAggregate
  ? PaymentRelationships
  : T extends CommunicationAggregate
  ? CommunicationRelationships
  : never

// ============================================================================
// Entity Reference Types
// ============================================================================

/**
 * Lightweight references for when full entities aren't needed
 */

export interface ClientReference {
  id: EntityId
  name: string
  email: string
  status: Client["status"]
}

export interface JobReference {
  id: EntityId
  jobNumber: string
  title: string
  status: Job["status"]
  clientId: EntityId
}

export interface QuoteReference {
  id: EntityId
  quoteNumber: string
  status: Quote["status"]
  total: Quote["total"]
  clientId: EntityId
}

export interface EmployeeReference {
  id: EntityId
  displayName: string
  role: Employee["role"]
  status: Employee["status"]
}

export interface ScheduleReference {
  id: EntityId
  scheduledStart: Schedule["scheduledStart"]
  scheduledEnd: Schedule["scheduledEnd"]
  status: Schedule["status"]
  jobId: EntityId
}

export interface PaymentReference {
  id: EntityId
  paymentNumber: string
  amount: Payment["amount"]
  status: Payment["status"]
  clientId: EntityId
}
