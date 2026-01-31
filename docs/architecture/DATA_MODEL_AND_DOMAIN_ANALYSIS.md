# Data Model and Domain Analysis

**Application:** Yarding-App (J&J Desert Landscaping)  
**Scope:** End-to-end domain, entities, relationships, payment flow, and database-ready schema.  
**Constraint:** Inferred from existing app behavior only; no breaking changes to current flows.

---

## 1. High-Level System Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              IDENTITY & ACCESS                                    │
│  ┌──────────┐     (no formal link)     ┌──────────┐     ┌──────────┐              │
│  │   User   │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ Employee │     │  Client │              │
│  │ (auth)   │                          │ (domain) │     │ (domain) │              │
│  └──────────┘                          └────┬─────┘     └────┬─────┘              │
└─────────────────────────────────────────────┼─────────────────┼───────────────────┘
                                              │                 │
┌─────────────────────────────────────────────┼─────────────────┼───────────────────┐
│                              CATALOG        │                 │                   │
│  ┌──────────┐     ┌─────────────────┐     │                 │                   │
│  │ Service  │     │ QuoteTemplate    │     │                 │                   │
│  │ (offering)│     │ (quote builder) │     │                 │                   │
│  └────┬─────┘     └────────┬────────┘     │                 │                   │
└───────┼────────────────────┼───────────────┼─────────────────┼───────────────────┘
        │                    │               │                 │
        │     ┌──────────────▼───────────────▼─────┐            │
        │     │              Quote                 │            │
        │     │  (lineItems reference serviceId)   │◄───────────┘
        │     └──────────────┬─────────────────────┘            │
        │                    │ convert to job                   │
        │     ┌──────────────▼──────────────────────────────────▼─────┐
        │     │                    Job                               │   BILLING
        │     │  (tasks, materials, quotedPrice, invoiceId?)         │   ───────
        │     └──────────────┬───────────────────┬───────────────────┘
        │                    │                   │
        │                    │ 1..n              │ 0..1
        │     ┌──────────────▼─────┐   ┌─────────▼─────────┐
        │     │     Schedule       │   │      Invoice        │
        │     │ (employeeIds[])   │   │ (mockStore shape)  │
        │     └───────────────────┘   └─────────┬──────────┘
        │                                       │
        │                          ┌────────────▼────────────┐
        │                          │       Payment           │
        │                          │ (clientId, jobId?,     │
        │                          │  invoiceId?, refunds)  │
        │                          └────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────────────────────────────────┐
│  COMMUNICATION  │  Communication (clientId?, employeeId?, jobId?, quoteId?)      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Data flow (who pays whom, when, why):**

- **Client** requests work → **Quote** is created (optionally from **Service** catalog / **QuoteTemplate**).
- **Quote** accepted → **Job** created (quoteId, clientId). Job can also be created without a quote.
- **Job** is scheduled → **Schedule**(s) link job to **Employee**(s).
- **Invoice** is created for a **Client** (and optionally linked to a **Job**); line items describe services/amounts.
- **Payment** is made by **Client**; it references **clientId**, optionally **jobId** and **invoiceId**. Revenue is derived from completed **Payment**(s).
- **Refunds** are modeled on **Payment** (refundAmount, refundReason, refundedAt; status REFUNDED / PARTIALLY_REFUNDED).

---

## 2. Domain → Entities → Relationships

### 2.1 Bounded Contexts (Domain Breakdown)

| Bounded Context        | Purpose                                      | Entities |
|------------------------|----------------------------------------------|----------|
| **Identity & Access**  | Auth and roles; no formal link to domain IDs | User     |
| **Catalog**            | Service offerings and quote templates        | Service, QuoteTemplate |
| **CRM / Clients**      | Customer master data                          | Client   |
| **Quoting**            | Estimates and line items (→ Service)          | Quote, QuoteLineItem |
| **Operations**         | Work orders, tasks, materials, scheduling     | Job, JobTask, JobMaterial, Schedule |
| **Billing**            | Invoices and payments                         | Invoice, InvoiceLineItem, Payment |
| **Communications**     | Emails, SMS, in-app (linked to client/job/quote) | Communication |
| **Reporting / Audit**  | Derived or log data                          | ActivityLog, PendingAction, CalculationHistoryEntry, Settings |

### 2.2 Entity List per Domain (with descriptions)

| Domain       | Entity                 | Description |
|-------------|------------------------|-------------|
| Identity    | **User**               | Auth identity: id, name, email, role (Admin/Client/Supervisor/Worker), status, joinDate. Not linked to Employee or Client by ID. |
| Catalog     | **Service**            | Service offering: id, name, description, image, category, price (string), duration, features[]. Used in marketing and Create Invoice (service selection). |
| Catalog     | **QuoteTemplate**      | Reusable quote: id, name, description, lineItems (QuoteLineItem[]), defaultMarkup. Used by quoteService only (in-memory). |
| CRM         | **Client**             | Customer: id, name, contactInfo, primaryAddress, status, segment, totalSpent/lifetimeValue (Money), quoteIds, jobIds, paymentIds, communicationIds, createdAt, updatedAt, createdBy?. |
| Quoting     | **Quote**              | Estimate: id, quoteNumber, clientId, jobId?, status, lineItems (serviceId, serviceName, unitPrice/totalPrice Money), subtotal/tax/discount/total, validUntil, expiresAt, revisionNumber, parentQuoteId?, lifecycle timestamps. |
| Quoting     | **QuoteLineItem**      | Single line: id, serviceId, serviceName, description, quantity, unitPrice, totalPrice (Money), notes?. |
| Operations  | **Job**                | Work order: id, jobNumber, clientId, quoteId?, serviceRequestId?, status, title, description, priority, address, tasks[], materials?, estimated/actual duration & cost, scheduled/actual dates, assignedEmployeeIds, supervisorId?, quotedPrice, finalPrice?, invoiceId?, timestamps. |
| Operations  | **JobTask**            | Sub-task: id, title, description, status (pending/in_progress/completed/skipped), priority, estimated/actual duration, order. |
| Operations  | **JobMaterial**        | Material: id, name, quantity, unit, cost (Money), supplier?. |
| Operations  | **Schedule**           | Assignment: id, jobId, employeeIds[], scheduledStart/End, timeRange, status, address, isRecurring, recurringPattern?, parentScheduleId?, reminderSent?. |
| Billing     | **Invoice**            | Bill to client (current shape in mockStore): id, invoiceNumber, clientId, clientName (denorm), jobId?, status, amount, tax, total, dueDate, sentDate?, paidDate?, lineItems[], notes?. No paymentIds; link from Payment/Job to Invoice. |
| Billing     | **InvoiceLineItem**    | Line: id, description, quantity, unitPrice, total. (No serviceId in current mockStore; CreateInvoiceModal builds from Job/Service.) |
| Billing     | **Payment**            | Payment: id, paymentNumber, clientId, invoiceId?, jobId?, status, method, amount (Money), transactionId?, processor?, refundAmount?, refundReason?, processedAt/completedAt/failedAt/refundedAt. |
| Comms       | **Communication**     | Message: id, clientId?, employeeId?, jobId?, quoteId?, type, direction, subject?, content, status, attachments?, timestamps. |
| Reporting   | **ActivityLog**       | Admin feed: id, type, description, user?, timestamp, metadata?. Derived from Users, Clients, Jobs, Payments (not a stored table in current app). |
| Reporting   | **PendingAction**      | Admin todo: id, type, title, description, priority, link?. Derived from Jobs, Payments, Quotes. |
| Reporting   | **CalculationHistoryEntry** | Job cost calculator audit: id, timestamp, jobId, jobNumber, clientId, clientName, inputs (hours, sqft, visits, zone, projectType), breakdown (labor, materials, visitFees, subtotal, tax, total). Stored in mockStore. |
| Settings    | **Settings**           | Key-value (companyName, taxRate, timezone, etc.). |
| Settings    | **InvoiceSettings**    | taxRate, companyName, companyAddress, companyEmail, companyPhone. |

### 2.3 ER-Style Relationship Mapping

| From       | To           | Cardinality   | Notes |
|------------|--------------|---------------|-------|
| Client     | Quote        | 1 → N         | clientId on Quote |
| Client     | Job          | 1 → N         | clientId on Job |
| Client     | Payment      | 1 → N         | clientId on Payment |
| Client     | Communication| 1 → N         | clientId on Communication |
| Client     | Invoice      | 1 → N         | clientId on Invoice |
| Quote      | Client       | N → 1         | clientId |
| Quote      | Job          | 1 → 0..1      | jobId when converted |
| Quote      | QuoteLineItem| 1 → N         | embedded/child rows |
| QuoteLineItem | Service   | N → 0..1      | serviceId (catalog reference) |
| Job        | Client       | N → 1         | clientId |
| Job        | Quote        | 0..1 → 1      | quoteId |
| Job        | Schedule     | 1 → N         | jobId on Schedule |
| Job        | Employee     | N ↔ M         | assignedEmployeeIds; supervisorId 0..1 |
| Job        | Invoice      | 0..1 → 1      | job.invoiceId → Invoice |
| Job        | Payment      | 1 → N         | jobId on Payment |
| Job        | JobTask      | 1 → N         | embedded |
| Job        | JobMaterial  | 1 → N         | embedded |
| Schedule   | Job          | N → 1         | jobId |
| Schedule   | Employee     | N ↔ M         | employeeIds[] |
| Invoice    | Client       | N → 1         | clientId |
| Invoice    | Job          | 0..1 ← 1      | Job has invoiceId; Invoice has jobId? |
| Invoice    | InvoiceLineItem | 1 → N       | lineItems[] |
| Payment    | Client       | N → 1         | clientId |
| Payment    | Invoice      | N → 0..1      | invoiceId |
| Payment    | Job          | N → 0..1      | jobId |
| Communication | Client    | N → 0..1      | clientId |
| Communication | Employee  | N → 0..1      | employeeId |
| Communication | Job       | N → 0..1      | jobId |
| Communication | Quote     | N → 0..1      | quoteId |
| User       | Employee     | —             | No FK; same person implied by role/email |
| User       | Client       | —             | No FK |

---

## 3. Lifecycle States (Creation → Updates → Completion → Cancellation → Refunds)

| Entity        | Creation           | Updates / intermediate        | Completion / end      | Cancellation        | Refunds / reversal   |
|---------------|--------------------|-------------------------------|------------------------|---------------------|----------------------|
| **Quote**     | DRAFT              | SENT, VIEWED, REVISED         | ACCEPTED / REJECTED / EXPIRED | —                    | —                    |
| **Job**       | DRAFT              | QUOTED, SCHEDULED, IN_PROGRESS, ON_HOLD | COMPLETED             | CANCELLED (cancelledAt, cancellationReason) | —                    |
| **Schedule**  | created            | RESCHEDULED, IN_PROGRESS       | COMPLETED              | CANCELLED           | —                    |
| **Invoice**   | draft              | sent                          | paid (paidDate)        | cancelled           | — (payment side)     |
| **Payment**   | PENDING            | PROCESSING                    | COMPLETED (completedAt)| —                   | REFUNDED / PARTIALLY_REFUNDED (refundAmount, refundedAt) |
| **Client**    | created            | —                             | —                      | SUSPENDED / INACTIVE | —                    |
| **Employee**  | created            | —                             | —                      | TERMINATED          | —                    |
| **Communication** | draft          | sent, delivered               | read                   | failed              | —                    |

Refunds are modeled only on **Payment** (refundAmount, refundReason, refundedAt; status REFUNDED or PARTIALLY_REFUNDED). Invoice has no refund entity; “refund” is implied by payment status and amounts.

---

## 4. Implicit Data (Used in UI/APIs/Logic but Not Fully Modeled)

| Implicit / Missing piece | Where used | Recommendation |
|--------------------------|------------|----------------|
| **User ↔ Employee / Client** | Auth uses User; domain uses Employee and Client; no userId/employeeId or userId/clientId. | Add optional `userId` on Employee and Client (or link table) for auth binding. |
| **Invoice not in domain entities** | Invoice lives in mockStore and invoiceService; Job and Payment reference invoiceId. | Promote Invoice to domain; single source of truth; add paymentIds or Payment→Invoice only. |
| **Client name on Invoice** | Invoice.clientName (denormalized). | Keep for display or derive from Client; ensure Client updated when name changes. |
| **Currency** | Domain uses Money { amount, currency }; Invoice uses plain number (USD implied). | Normalize: Invoice amounts as Money or explicit currency. |
| **Tax** | Invoice.tax, InvoiceSettings.taxRate; PHOENIX_TAX_RATE in UI. | Single source: InvoiceSettings or tenant settings; store tax rate and tax amount per invoice. |
| **QuoteTemplate** | Only in quoteService (in-memory); not in mockStore. | Model as entity if quotes are built from templates; persist in DB. |
| **Service catalog** | mockData services; QuoteLineItem.serviceId; CreateInvoiceModal uses getServices(). | Formal Service entity/table; QuoteLineItem and InvoiceLineItem reference serviceId where applicable. |
| **Task (legacy)** | models.Task; taskService maps Job → Task for legacy UI. | Treat as view of Job; one day remove Task model when all UI uses Job. |
| **Worker** | models.Worker (marketing/dashboard). | Align with Employee (or Worker = view of Employee). |
| **Crew** | analyticsService/reportsService (crewId, crewName). | Either Employee group/team entity or derived from Job assignments. |
| **CalculationHistoryEntry** | mockStore; job cost calculator. | Formal audit/calculation log table; link to Job. |
| **ActivityLog / PendingAction** | adminService (derived). | Optional: persist as events or keep derived. |
| **Invoice ↔ Payment link** | Payment has invoiceId; Invoice has no paymentIds. | Prefer Payment→Invoice only; optionally add Invoice.paymentIds for convenience queries. |

---

## 5. Normalization and Duplication Notes

- **Client**: Two shapes (domain Client with ContactInfo/Address/Money vs models.Client with flat name/email/phone/address). Use domain Client everywhere; phase out models.Client.
- **Invoice**: One canonical shape (domain or shared type) with Money and optional serviceId on line items; remove duplicate Invoice in invoiceService vs mockStore.
- **Quote**: quoteService uses in-memory mockQuotes; mockStore has quotes[] but quoteService does not use mockStore. Unify: quotes in one store and quoteService reading/writing it.
- **Task vs Job**: Task is a legacy view of Job; normalize on Job and JobTask; map to Task only at service boundary until UI is migrated.
- **Worker vs Employee**: Prefer Employee as canonical; Worker as display/API view if needed.
- **Monetary fields**: Use Money { amount, currency } everywhere; avoid raw number for money (e.g. Invoice.amount/tax/total).

---

## 6. Required Fields per Entity (Summary)

- **id**: Every entity.
- **Ownership**: clientId (Quote, Job, Payment, Invoice, Communication); requestedBy/createdBy where applicable (Quote, Client).
- **References**: As per ER (quoteId, jobId, invoiceId, employeeIds, etc.).
- **Monetary**: Prefer Money { amount, currency }; for Payment add refundAmount; for Invoice/Quote subtotal, tax, discount, total.
- **Status/state**: Enum per entity (see entities.ts and mockStore).
- **Timestamps**: createdAt, updatedAt; domain-specific (sentAt, paidDate, completedAt, refundedAt, etc.).

---

## 7. Payment-Specific Modeling

- **Payment intent vs completed payment**: No separate PaymentIntent entity; status PROCESSING represents in-flight; COMPLETED + completedAt represents settled. For Stripe-like flows, consider adding PaymentIntent (id, status, amount, invoiceId?, jobId?) and Payment (completed payment linked to intent).
- **Service/Job linkage**: Payment has optional jobId and invoiceId; Invoice has optional jobId. So: Client pays → Payment(s) → optionally Invoice → optionally Job. One invoice can span multiple jobs in principle; current UI often 1 job per invoice.
- **Refunds**: On Payment: refundAmount (Money), refundReason (string), refundedAt (Timestamp); status REFUNDED or PARTIALLY_REFUNDED. No separate Refund entity; partial = multiple payments or one payment with partial refund.
- **Partial payments**: One invoice can have multiple Payments (multiple records with same invoiceId). No “amount remaining” on Invoice in current model—derive from Invoice.total − sum(Payment.amount where status COMPLETED) + sum(refundAmount).
- **Failed payments**: Payment.status FAILED; failedAt, failureReason. No automatic retry entity; could add later.

---

## 8. Interfaces (TypeScript) — Consolidated / Implementation-Ready

```ts
// ============= Value objects & enums =============
export type EntityId = string
export type Timestamp = string

export interface Money {
  amount: number
  currency: string // ISO 4217
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
  coordinates?: { lat: number; lng: number }
}

export interface ContactInfo {
  email: string
  phone: string
  phoneSecondary?: string
  preferredContactMethod: "email" | "phone" | "sms"
}

// Client
export type ClientStatus = "active" | "inactive" | "pending" | "suspended"
export type ClientSegment = "vip" | "regular" | "new" | "at_risk"

export interface Client {
  id: EntityId
  name: string
  contactInfo: ContactInfo
  primaryAddress: Address
  additionalAddresses?: Address[]
  status: ClientStatus
  segment: ClientSegment
  tags?: string[]
  totalSpent: Money
  lifetimeValue: Money
  firstServiceDate?: Timestamp
  lastServiceDate?: Timestamp
  nextScheduledService?: Timestamp
  serviceRequestIds: EntityId[]
  quoteIds: EntityId[]
  jobIds: EntityId[]
  paymentIds: EntityId[]
  communicationIds: EntityId[]
  notes?: string
  internalNotes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: EntityId
}

// Quote
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "revised"

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
  quoteNumber: string
  clientId: EntityId
  requestedBy?: EntityId
  jobId?: EntityId
  status: QuoteStatus
  lineItems: QuoteLineItem[]
  subtotal: Money
  tax: Money
  discount?: Money
  total: Money
  validUntil: Timestamp
  expiresAt: Timestamp
  notes?: string
  terms?: string
  revisionNumber: number
  parentQuoteId?: EntityId
  createdAt: Timestamp
  updatedAt: Timestamp
  sentAt?: Timestamp
  viewedAt?: Timestamp
  acceptedAt?: Timestamp
  rejectedAt?: Timestamp
  rejectionReason?: string
}

// Job
export type JobStatus = "draft" | "quoted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "on_hold"
export type Priority = "low" | "medium" | "high" | "urgent"

export interface JobTask {
  id: EntityId
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  priority: Priority
  estimatedDuration: number
  actualDuration?: number
  order: number
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
  jobNumber: string
  clientId: EntityId
  quoteId?: EntityId
  serviceRequestId?: EntityId
  status: JobStatus
  title: string
  description: string
  priority: Priority
  address: Address
  tasks: JobTask[]
  materials?: JobMaterial[]
  estimatedDuration: number
  actualDuration?: number
  estimatedCost: Money
  actualCost?: Money
  scheduledStart?: Timestamp
  scheduledEnd?: Timestamp
  actualStart?: Timestamp
  actualEnd?: Timestamp
  assignedEmployeeIds: EntityId[]
  supervisorId?: EntityId
  quotedPrice: Money
  finalPrice?: Money
  invoiceId?: EntityId
  notes?: string
  internalNotes?: string
  photos?: string[]
  completionNotes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt?: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
}

// Employee
export type EmployeeRole = "admin" | "supervisor" | "worker"
export type EmployeeStatus = "active" | "inactive" | "on_leave" | "terminated"

export interface Employee {
  id: EntityId
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  phoneEmergency?: string
  role: EmployeeRole
  status: EmployeeStatus
  employeeNumber?: string
  department?: string
  hireDate: Timestamp
  terminationDate?: Timestamp
  availability: Record<string, { start: Timestamp; end: Timestamp }[]>
  rating?: number
  completedJobsCount: number
  totalHoursWorked: number
  assignedJobIds: EntityId[]
  supervisedJobIds: EntityId[]
  avatar?: string
  notes?: string
  certifications?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Schedule
export type ScheduleStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled"

export interface Schedule {
  id: EntityId
  jobId: EntityId
  employeeIds: EntityId[]
  scheduledStart: Timestamp
  scheduledEnd: Timestamp
  timeRange: { start: Timestamp; end: Timestamp }
  status: ScheduleStatus
  address: Address
  travelTime?: number
  notes?: string
  reminderSent?: boolean
  reminderSentAt?: Timestamp
  isRecurring: boolean
  recurringPattern?: { frequency: string; interval: number; endDate?: Timestamp; occurrences?: number }
  parentScheduleId?: EntityId
  createdAt: Timestamp
  updatedAt: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
}

// Invoice (normalized: Money + optional serviceId on lines)
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

export interface InvoiceLineItem {
  id: EntityId
  description: string
  quantity: number
  unitPrice: number
  total: number
  serviceId?: EntityId
}

export interface Invoice {
  id: EntityId
  invoiceNumber: string
  clientId: EntityId
  clientName?: string // denormalized display
  jobId?: EntityId
  status: InvoiceStatus
  amount: Money
  tax: Money
  total: Money
  dueDate: Timestamp
  sentDate?: Timestamp
  paidDate?: Timestamp
  createdAt: Timestamp
  updatedAt?: Timestamp
  lineItems: InvoiceLineItem[]
  notes?: string
}

// Payment
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "partially_refunded"
export type PaymentMethod = "credit_card" | "debit_card" | "ach" | "check" | "cash" | "other"

export interface Payment {
  id: EntityId
  paymentNumber: string
  clientId: EntityId
  invoiceId?: EntityId
  jobId?: EntityId
  status: PaymentStatus
  method: PaymentMethod
  amount: Money
  transactionId?: string
  processor?: "stripe" | "paypal" | "square" | "manual"
  processorResponse?: Record<string, unknown>
  paymentMethodId?: EntityId
  notes?: string
  receiptUrl?: string
  refundAmount?: Money
  refundReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  processedAt?: Timestamp
  completedAt?: Timestamp
  failedAt?: Timestamp
  failureReason?: string
  refundedAt?: Timestamp
}

// Communication
export type CommunicationType = "email" | "sms" | "in_app" | "push" | "phone"
export type CommunicationDirection = "inbound" | "outbound"

export interface Communication {
  id: EntityId
  clientId?: EntityId
  employeeId?: EntityId
  jobId?: EntityId
  quoteId?: EntityId
  serviceRequestId?: EntityId
  type: CommunicationType
  direction: CommunicationDirection
  subject?: string
  content: string
  status: "draft" | "sent" | "delivered" | "read" | "failed"
  readAt?: Timestamp
  deliveredAt?: Timestamp
  templateId?: EntityId
  templateVariables?: Record<string, string>
  attachments?: { id: EntityId; name: string; url: string; mimeType: string; size: number }[]
  priority: Priority
  tags?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  sentAt?: Timestamp
  scheduledFor?: Timestamp
}

// User (identity only)
export interface User {
  id: EntityId
  name: string
  email: string
  role: "Admin" | "Client" | "Supervisor" | "Worker"
  status: "Active" | "Pending" | "Inactive"
  joinDate: string
}

// Service (catalog)
export interface Service {
  id: EntityId
  name: string
  description: string
  image: string
  category: string
  categoryColor: string
  duration: string
  price: string
  features: string[]
}

// Settings / audit
export interface InvoiceSettings {
  taxRate: number
  companyName: string
  companyAddress?: string
  companyEmail: string
  companyPhone: string
}

export interface CalculationHistoryEntry {
  id: EntityId
  timestamp: Timestamp
  jobId: EntityId
  jobNumber: string
  clientId: EntityId
  clientName: string
  inputs: { hours: number; sqft: number; visits: number; zone: string; projectType: string }
  breakdown: { labor: number; materials: number; visitFees: number; subtotal: number; tax: number; total: number }
}
```

---

## 9. Database Schema Draft (Tables / Prisma-Oriented)

```prisma
// Prisma-style draft (no migrations run; implementation-ready sketch)

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      String   // Admin | Client | Supervisor | Worker
  status    String   // Active | Pending | Inactive
  joinDate  DateTime
  createdAt DateTime @updatedAt
}

model Client {
  id                   String    @id @default(cuid())
  name                 String
  email                String
  phone                String
  preferredContact     String    // email | phone | sms
  street               String
  city                 String
  state                String
  zipCode              String
  country              String?
  status               String    // active | inactive | pending | suspended
  segment              String    // vip | regular | new | at_risk
  totalSpentCents      Int
  totalSpentCurrency   String    @default("USD")
  lifetimeValueCents   Int
  lifetimeValueCurrency String  @default("USD")
  firstServiceAt      DateTime?
  lastServiceAt        DateTime?
  nextScheduledAt     DateTime?
  notes                String?
  internalNotes        String?
  createdById          String?
  createdAt            DateTime  @updatedAt
  updatedAt            DateTime  @updatedAt
  quotes               Quote[]
  jobs                 Job[]
  payments             Payment[]
  communications       Communication[]
  invoices             Invoice[]
}

model Service {
  id          String   @id @default(cuid())
  name        String
  description String
  image       String?
  category    String
  categoryColor String?
  duration    String?
  price       String   // display e.g. "Starting at $75/visit"
  features    String[] // or JSON
}

model Quote {
  id             String   @id @default(cuid())
  quoteNumber    String   @unique
  clientId       String
  client         Client   @relation(fields: [clientId], references: [id])
  requestedById  String?
  jobId          String?  @unique
  job            Job?     @relation(fields: [jobId], references: [id])
  status         String
  subtotalCents  Int
  taxCents       Int
  discountCents   Int?
  totalCents     Int
  currency       String   @default("USD")
  validUntil     DateTime
  expiresAt      DateTime
  notes          String?
  terms          String?
  revisionNumber Int      @default(1)
  parentQuoteId  String?
  createdAt      DateTime @updatedAt
  updatedAt      DateTime @updatedAt
  sentAt         DateTime?
  viewedAt       DateTime?
  acceptedAt     DateTime?
  rejectedAt     DateTime?
  rejectionReason String?
  lineItems      QuoteLineItem[]
  communications Communication[]
}

model QuoteLineItem {
  id          String   @id @default(cuid())
  quoteId     String
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  serviceId   String?
  serviceName String
  description String
  quantity    Int
  unitPriceCents Int
  totalPriceCents Int
  currency    String   @default("USD")
  notes       String?
}

model Job {
  id                   String    @id @default(cuid())
  jobNumber            String    @unique
  clientId             String
  client               Client    @relation(fields: [clientId], references: [id])
  quoteId              String?
  quote                Quote?    @relation(fields: [quoteId], references: [id])
  serviceRequestId    String?
  status               String
  title                String
  description          String
  priority             String
  street               String
  city                 String
  state                String
  zipCode              String
  country              String?
  estimatedDurationMin Int
  actualDurationMin    Int?
  estimatedCostCents   Int
  actualCostCents      Int?
  scheduledStart       DateTime?
  scheduledEnd         DateTime?
  actualStart          DateTime?
  actualEnd            DateTime?
  supervisorId         String?
  quotedPriceCents     Int
  quotedPriceCurrency String    @default("USD")
  finalPriceCents      Int?
  finalPriceCurrency   String?  @default("USD")
  invoiceId            String?   @unique
  invoice              Invoice?  @relation(fields: [invoiceId], references: [id])
  notes                String?
  internalNotes        String?
  completionNotes      String?
  photos               String[]
  createdAt            DateTime  @updatedAt
  updatedAt            DateTime  @updatedAt
  completedAt          DateTime?
  cancelledAt          DateTime?
  cancellationReason   String?
  tasks                JobTask[]
  materials            JobMaterial[]
  schedules            Schedule[]
  payments             Payment[]
  communications       Communication[]
  jobAssignments       JobAssignment[]
}

model JobTask {
  id                String   @id @default(cuid())
  jobId             String
  job               Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  title             String
  description       String
  status            String
  priority          String
  estimatedDuration Int
  actualDuration    Int?
  order             Int
}

model JobMaterial {
  id       String   @id @default(cuid())
  jobId    String
  job      Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  name     String
  quantity Int
  unit     String
  costCents Int
  currency String   @default("USD")
  supplier String?
}

model JobAssignment {
  jobId      String
  job        Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@id([jobId, employeeId])
}

model Employee {
  id                 String   @id @default(cuid())
  firstName          String
  lastName           String
  displayName        String
  email              String   @unique
  phone              String
  phoneEmergency     String?
  role               String
  status             String
  employeeNumber     String?
  department         String?
  hireDate           DateTime
  terminationDate    DateTime?
  rating             Float?
  completedJobsCount Int      @default(0)
  totalHoursWorked   Int      @default(0)
  avatar             String?
  notes              String?
  certifications     String[]
  createdAt          DateTime @updatedAt
  updatedAt          DateTime @updatedAt
  jobAssignments     JobAssignment[]
  schedules          ScheduleAssignment[]
}

model Schedule {
  id              String   @id @default(cuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  scheduledStart  DateTime
  scheduledEnd    DateTime
  status         String
  street          String
  city           String
  state          String
  zipCode         String
  country         String?
  travelTimeMin   Int?
  notes           String?
  reminderSent    Boolean  @default(false)
  reminderSentAt  DateTime?
  isRecurring     Boolean  @default(false)
  recurringPattern Json?
  parentScheduleId String?
  createdAt       DateTime @updatedAt
  updatedAt      DateTime @updatedAt
  cancelledAt    DateTime?
  cancellationReason String?
  employeeAssignments ScheduleAssignment[]
}

model ScheduleAssignment {
  scheduleId String
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  @@id([scheduleId, employeeId])
}

model Invoice {
  id             String   @id @default(cuid())
  invoiceNumber  String   @unique
  clientId       String
  client         Client   @relation(fields: [clientId], references: [id])
  jobId          String?  @unique
  job            Job?     @relation(fields: [jobId], references: [id])
  status         String
  amountCents    Int
  taxCents       Int
  totalCents     Int
  currency       String   @default("USD")
  dueDate        DateTime
  sentDate       DateTime?
  paidDate       DateTime?
  notes          String?
  createdAt      DateTime @updatedAt
  updatedAt      DateTime? @updatedAt
  lineItems      InvoiceLineItem[]
  payments       Payment[]
}

model InvoiceLineItem {
  id          String   @id @default(cuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  description String
  quantity    Int
  unitPriceCents Int
  totalCents  Int
  serviceId   String?
}

model Payment {
  id                String    @id @default(cuid())
  paymentNumber     String    @unique
  clientId          String
  client            Client    @relation(fields: [clientId], references: [id])
  invoiceId         String?
  invoice           Invoice?  @relation(fields: [invoiceId], references: [id])
  jobId             String?
  job               Job?      @relation(fields: [jobId], references: [id])
  status            String
  method            String
  amountCents       Int
  currency          String    @default("USD")
  transactionId     String?
  processor         String?
  processorResponse Json?
  paymentMethodId   String?
  notes             String?
  receiptUrl        String?
  refundAmountCents Int?
  refundReason      String?
  createdAt         DateTime  @updatedAt
  updatedAt         DateTime  @updatedAt
  processedAt       DateTime?
  completedAt       DateTime?
  failedAt          DateTime?
  failureReason     String?
  refundedAt        DateTime?
}

model Communication {
  id           String   @id @default(cuid())
  clientId     String?
  client       Client?  @relation(fields: [clientId], references: [id])
  employeeId   String?
  jobId        String?
  quoteId      String?
  type         String
  direction    String
  subject      String?
  content      String
  status       String
  readAt       DateTime?
  deliveredAt  DateTime?
  templateId   String?
  templateVariables Json?
  priority     String
  createdAt    DateTime @updatedAt
  updatedAt    DateTime @updatedAt
  sentAt       DateTime?
  scheduledFor DateTime?
}

model CalculationHistoryEntry {
  id         String   @id @default(cuid())
  timestamp  DateTime
  jobId      String
  jobNumber  String
  clientId   String
  clientName String
  inputs     Json
  breakdown  Json
}

model InvoiceSettings {
  id             String   @id @default(cuid())
  taxRate        Float
  companyName    String
  companyAddress String?
  companyEmail   String
  companyPhone   String
}
```

---

## 10. Indexes, Constraints, and Data Integrity

- **Unique**: `User.email`, `Quote.quoteNumber`, `Job.jobNumber`, `Invoice.invoiceNumber`, `Payment.paymentNumber`; `Job.invoiceId` 0..1 per job; `Quote.jobId` 0..1 per quote.
- **Foreign keys**: All *Id fields as above; cascade delete where children cannot exist without parent (e.g. QuoteLineItem → Quote, JobTask → Job).
- **Indexes** (for queries observed in app):
  - Client: `status`, `createdAt`
  - Quote: `clientId`, `status`, `expiresAt`
  - Job: `clientId`, `status`, `scheduledStart`, `invoiceId`
  - Schedule: `jobId`, `scheduledStart`, `scheduledEnd`
  - Invoice: `clientId`, `status`, `dueDate`, `jobId`
  - Payment: `clientId`, `invoiceId`, `jobId`, `status`, `completedAt`
  - Communication: `clientId`, `jobId`, `quoteId`, `employeeId`
- **Integrity rules**:
  - When Payment is COMPLETED and has invoiceId, consider marking Invoice as paid (or derive paid from sum of payments).
  - Job.invoiceId and Invoice.jobId should stay in sync when linking.
  - Refund: refundAmount ≤ amount; if refundAmount === amount then status REFUNDED else PARTIALLY_REFUNDED.
  - Currency: same currency for amount and refundAmount on Payment; Invoice total = sum(lineItems) + tax in same currency.

---

## 11. Open Questions / Risks

| Question / risk | Impact | Mitigation |
|-----------------|--------|------------|
| User not linked to Employee/Client | Cannot enforce “this login is this client/employee” in DB. | Add optional userId to Employee and Client; populate from auth. |
| Quote and QuoteService not using mockStore | Quotes in memory in quoteService; mockStore has separate quotes. | Unify: persist quotes in one store (mockStore or DB) and have quoteService use it. |
| Invoice created without Job (e.g. ad-hoc billing) | jobId optional; some invoices may have no job. | Keep jobId optional; reporting by job only for linked invoices. |
| Multiple payments per invoice | Allowed by model; “amount remaining” not stored. | Derive remaining = Invoice.total − sum(completed payments) + sum(refunds); or add computed column/cache. |
| Partial payments | Multiple Payment rows per invoice. | Same as above; ensure UI shows “paid X of Y”. |
| Currency mix | All current data USD; schema allows currency. | Enforce single currency per tenant or add conversion. |
| Crew / team | Analytics use crewId/crewName; no Crew entity. | Add Crew/Team and assign employees; or derive crew from job assignments. |
| Payouts (company → worker) | Not modeled. | If needed, add Payout entity (company pays employee; link to Job or Schedule). |
| Idempotency for payments | Duplicate submissions could create duplicate payments. | Use transactionId + invoiceId + amount as idempotency key; unique constraint or application check. |

---

**Document version:** 1.0  
**Last updated:** From codebase analysis (no generated code; analysis and doc only).
