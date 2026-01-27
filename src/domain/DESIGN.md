# Domain Models Design Document

## Overview

This document defines the TypeScript data models for the landscaping application following Domain-Driven Design (DDD) principles. All models are located in `src/domain/` and organized by concern.

---

## Model Organization

### Current Structure

```
src/domain/
├── entities.ts          # Core domain entities (aggregate roots)
├── relationships.ts     # Relationship definitions and aggregate types
├── models.ts           # Legacy models (deprecated, for backward compatibility)
└── DESIGN.md           # This document
```

### Recommended Structure (Future)

```
src/domain/
├── entities/
│   ├── client.ts
│   ├── job.ts
│   ├── quote.ts
│   ├── employee.ts
│   ├── schedule.ts
│   ├── payment.ts
│   └── communication.ts
├── value-objects/
│   ├── address.ts
│   ├── money.ts
│   ├── contact-info.ts
│   └── time-range.ts
├── enums/
│   ├── status.ts
│   ├── priority.ts
│   └── types.ts
├── relationships.ts     # Relationship definitions
└── index.ts            # Public API exports
```

**Current Status**: All models are in `entities.ts` for simplicity. Consider splitting when the file exceeds 1000 lines.

---

## Core Domain Models

### 1. Client Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
```

**Key Relationships**:
- 1:N with Quote
- 1:N with Job
- 1:N with Payment
- 1:N with Communication

---

### 2. Job Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
  estimatedDuration: number // minutes
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
```

**Key Relationships**:
- N:1 with Client
- 1:1 with Quote (optional)
- N:M with Employee
- 1:1 with Employee (supervisor)
- 1:N with Schedule
- 1:N with Payment
- 1:N with Communication

**Nested Entities**:
- `JobTask[]` - Tasks within a job
- `JobMaterial[]` - Materials used

---

### 3. Quote Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
```

**Key Relationships**:
- N:1 with Client
- 1:1 with Job (optional, if converted)
- 1:1 with Quote (parent, if revision)
- 1:N with Communication

**Nested Entities**:
- `QuoteLineItem[]` - Line items in the quote

---

### 4. Employee Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
  availability: {
    monday: TimeRange[]
    tuesday: TimeRange[]
    wednesday: TimeRange[]
    thursday: TimeRange[]
    friday: TimeRange[]
    saturday: TimeRange[]
    sunday: TimeRange[]
  }
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
```

**Key Relationships**:
- M:N with Job (assigned jobs)
- 1:N with Job (supervised jobs, if supervisor)
- 1:N with Schedule
- 1:N with Communication

---

### 5. Schedule Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
export interface Schedule {
  id: EntityId
  jobId: EntityId
  employeeIds: EntityId[]
  scheduledStart: Timestamp
  scheduledEnd: Timestamp
  timeRange: TimeRange
  status: ScheduleStatus
  address: Address
  travelTime?: number // minutes
  notes?: string
  reminderSent?: boolean
  reminderSentAt?: Timestamp
  isRecurring: boolean
  recurringPattern?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly"
    interval: number
    endDate?: Timestamp
    occurrences?: number
  }
  parentScheduleId?: EntityId
  createdAt: Timestamp
  updatedAt: Timestamp
  cancelledAt?: Timestamp
  cancellationReason?: string
}
```

**Key Relationships**:
- N:1 with Job
- N:M with Employee
- N:1 with Schedule (parent, if recurring instance)

---

### 6. Payment Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
```

**Key Relationships**:
- N:1 with Client
- N:1 with Job (optional)
- N:1 with Invoice (optional, future)

---

### 7. Communication Entity

**Location**: `src/domain/entities.ts`

**Aggregate Root**: Yes

**Definition**:
```typescript
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
  attachments?: {
    id: EntityId
    name: string
    url: string
    mimeType: string
    size: number
  }[]
  priority: Priority
  tags?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  sentAt?: Timestamp
  scheduledFor?: Timestamp
}
```

**Key Relationships**:
- N:1 with Client (optional)
- N:1 with Employee (optional)
- N:1 with Job (optional)
- N:1 with Quote (optional)

---

## Value Objects

### Address
```typescript
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
```

### Money
```typescript
export interface Money {
  amount: number
  currency: string // ISO 4217 code, e.g., "USD"
}
```

### ContactInfo
```typescript
export interface ContactInfo {
  email: string
  phone: string
  phoneSecondary?: string
  preferredContactMethod: "email" | "phone" | "sms"
}
```

### TimeRange
```typescript
export interface TimeRange {
  start: Timestamp
  end: Timestamp
}
```

---

## Relationship Diagram

```
                    ┌──────────┐
                    │  Client  │ (Aggregate Root)
                    └────┬─────┘
                         │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  Quote  │      │   Job   │      │ Payment │
   └────┬────┘      └────┬────┘      └─────────┘
        │                │
        │                │
        └───────> (1:1) ─┘ (if converted)
                         │
                         │
                    ┌────▼────┐
                    │Schedule │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │Employee │ (Aggregate Root)
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │   Comm  │
                    └─────────┘
```

**Key Relationships**:
- **Client** → **Quote** (1:N)
- **Client** → **Job** (1:N)
- **Client** → **Payment** (1:N)
- **Client** → **Communication** (1:N)
- **Quote** → **Job** (1:1, optional)
- **Job** → **Employee** (M:N)
- **Job** → **Schedule** (1:N)
- **Job** → **Payment** (1:N)
- **Schedule** → **Employee** (M:N)

---

## Mock Data Strategy

### Principles

1. **Realistic Data**: Mock data should reflect real-world scenarios
2. **Consistent Relationships**: IDs must reference valid entities
3. **Temporal Consistency**: Dates should be logical (e.g., `createdAt < updatedAt`)
4. **State Consistency**: Status transitions should be valid
5. **Referential Integrity**: All foreign keys must reference existing entities

### Mock Data Structure

```
src/data/
├── mockStore.ts           # Centralized data store (current)
├── generators/
│   ├── clientGenerator.ts
│   ├── jobGenerator.ts
│   ├── quoteGenerator.ts
│   ├── employeeGenerator.ts
│   ├── scheduleGenerator.ts
│   ├── paymentGenerator.ts
│   └── communicationGenerator.ts
└── seeds/
    ├── clients.ts
    ├── employees.ts
    └── baseData.ts
```

### Generation Strategy

#### Phase 1: Seed Data (Static)
- Pre-defined entities with fixed IDs
- Used for development and testing
- Located in `src/data/seeds/`

#### Phase 2: Dynamic Generation (Future)
- Factory functions that generate entities
- Configurable parameters (count, date ranges, etc.)
- Located in `src/data/generators/`

### Mock Data Guidelines

1. **ID Generation**:
   ```typescript
   // Pattern: {entity-type}-{sequential-number}
   "client-1", "client-2", ...
   "job-1", "job-2", ...
   ```

2. **Date Generation**:
   ```typescript
   // Use relative dates for consistency
   const now = new Date()
   const createdAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
   ```

3. **Relationship Consistency**:
   ```typescript
   // When creating a Job, ensure clientId exists
   const job: Job = {
     clientId: existingClient.id, // Must reference real client
     // ...
   }
   ```

4. **Status Transitions**:
   ```typescript
   // Valid transitions only
   JobStatus.DRAFT → JobStatus.QUOTED → JobStatus.SCHEDULED → JobStatus.IN_PROGRESS → JobStatus.COMPLETED
   ```

### Example Mock Data Generator

```typescript
// src/data/generators/clientGenerator.ts
import type { Client, ClientStatus, ClientSegment } from "@/src/domain/entities"
import { ClientStatus as CS, ClientSegment as Seg } from "@/src/domain/entities"

export const generateClient = (overrides?: Partial<Client>): Client => {
  const id = `client-${Date.now()}`
  const now = new Date().toISOString()
  
  return {
    id,
    name: `Client ${id}`,
    contactInfo: {
      email: `client${id}@example.com`,
      phone: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      preferredContactMethod: "email",
    },
    primaryAddress: {
      street: `${Math.floor(Math.random() * 9999)} Main St`,
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
    },
    status: CS.ACTIVE,
    segment: Seg.REGULAR,
    totalSpent: { amount: 0, currency: "USD" },
    lifetimeValue: { amount: 0, currency: "USD" },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: [],
    paymentIds: [],
    communicationIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}
```

---

## Model Location Recommendations

### Current Structure ✅

**Location**: `src/domain/entities.ts`

**Pros**:
- Single source of truth
- Easy to find all models
- Simple imports
- Good for small to medium projects

**Cons**:
- File can become large
- Harder to navigate with many models
- All models loaded even if only one needed

### Recommended Structure (When Needed)

**Location**: `src/domain/entities/{entity}.ts`

**When to Split**:
- File exceeds 1000 lines
- Team size > 5 developers
- Need to lazy-load models
- Different teams own different domains

**Migration Path**:
1. Create `src/domain/entities/index.ts` that re-exports from `entities.ts`
2. Gradually split into individual files
3. Update imports to use new structure
4. Remove old `entities.ts` file

### Import Patterns

**Current**:
```typescript
import type { Client, Job, Employee } from "@/src/domain/entities"
```

**Future (if split)**:
```typescript
import type { Client } from "@/src/domain/entities/client"
import type { Job } from "@/src/domain/entities/job"
import type { Employee } from "@/src/domain/entities/employee"
```

**Or with index**:
```typescript
import type { Client, Job, Employee } from "@/src/domain/entities"
```

---

## Type Safety Recommendations

### 1. Use TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. Use Branded Types for IDs (Optional)
```typescript
type ClientId = string & { readonly brand: unique symbol }
type JobId = string & { readonly brand: unique symbol }
```

### 3. Use Discriminated Unions for Status
```typescript
type JobWithStatus = 
  | (Job & { status: JobStatus.DRAFT })
  | (Job & { status: JobStatus.COMPLETED; completedAt: Timestamp })
```

### 4. Validation Schemas (Future)
```typescript
// Use Zod or Yup for runtime validation
import { z } from "zod"

const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  // ...
})
```

---

## Summary

### Models Defined ✅

1. ✅ **Client** - Aggregate root, manages client relationships
2. ✅ **Job** - Aggregate root, contains JobTask and JobMaterial
3. ✅ **Quote** - Aggregate root, contains QuoteLineItem
4. ✅ **Employee** - Aggregate root, manages employee relationships
5. ✅ **Schedule** - Aggregate root, links Job and Employee
6. ✅ **Payment** - Aggregate root, financial transactions
7. ✅ **Communication** - Aggregate root, messaging and notifications

### Relationships Documented ✅

- All relationships defined in `src/domain/relationships.ts`
- Aggregate roots identified
- Reference types provided for lightweight access

### Mock Data Strategy ✅

- Centralized in `src/data/mockStore.ts`
- Seed data approach for Phase 1
- Generator functions for Phase 2
- Guidelines for consistency

### Location Recommendations ✅

- Current structure (`src/domain/entities.ts`) is appropriate
- Split when file exceeds 1000 lines or team grows
- Maintain backward compatibility during migration

---

## Next Steps

1. ✅ Models defined and documented
2. ⏭️ Create validation schemas (Zod/Yup)
3. ⏭️ Implement mock data generators
4. ⏭️ Create repository interfaces
5. ⏭️ Add unit tests for models
6. ⏭️ Migrate legacy code from `models.ts`

---

**Status**: ✅ Complete - All models defined, relationships documented, mock data strategy proposed, and location recommendations provided.
