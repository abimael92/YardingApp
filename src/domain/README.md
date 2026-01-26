# Domain Models Architecture

## Overview

This directory contains the domain models following Domain-Driven Design (DDD) principles. The models are organized into entities, value objects, and relationships.

## File Structure

```
src/domain/
├── entities.ts          # Core domain entities and value objects
├── relationships.ts     # Relationship definitions and aggregate roots
├── models.ts            # Legacy models (to be migrated)
└── README.md            # This file
```

## Entity Relationships Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ├───< (1:N) ───┐
     │              │
     │         ┌────▼────┐
     │         │  Quote  │
     │         └────┬────┘
     │              │
     │              └───> (1:1) ───┐
     │                             │
     ├───< (1:N) ───┐         ┌────▼────┐
     │              │         │   Job   │
     │         ┌────▼────┐    └────┬────┘
     │         │   Job   │         │
     │         └────┬────┘         │
     │              │               │
     │              ├───< (N:M) ────┘
     │              │
     │              └───< (1:N) ───┐
     │                             │
     ├───< (1:N) ───┐         ┌────▼────┐
     │              │         │Schedule │
     │         ┌────▼────┐    └────┬────┘
     │         │ Payment │         │
     │         └─────────┘         │
     │                              │
     ├───< (1:N) ───┐         ┌────▼────┐
     │              │         │Employee │
     │         ┌────▼────┐    └─────────┘
     │         │   Comm  │
     │         └─────────┘
     │
     └───< (1:N) ───┐
                    │
               ┌────▼────┐
               │   Comm  │
               └─────────┘
```

## Key Design Decisions

### 1. Entity IDs
- All entities use `EntityId` type (string)
- IDs are opaque and should not contain business logic
- Use UUIDs or similar for production

### 2. Timestamps
- All timestamps use ISO 8601 format strings
- Type alias: `Timestamp`
- Consider using a date library for manipulation (date-fns, dayjs)

### 3. Money Value Object
- Uses `Money` interface with `amount` (number) and `currency` (ISO 4217)
- Prevents currency mixing errors
- Consider using a decimal library for financial calculations

### 4. Aggregate Roots
- Each aggregate has a root entity
- Related entities are loaded via relationships
- References use IDs to maintain aggregate boundaries

### 5. Status Enums
- All status fields use TypeScript enums
- Provides type safety and autocomplete
- Easy to extend

## Usage Patterns

### Loading an Entity with Relationships

```typescript
import type { Client, ClientRelationships } from "@/src/domain/entities"

// Load client
const client: Client = await getClientById(clientId)

// Load relationships separately
const relationships: ClientRelationships = {
  quotes: await getQuotesByClientId(clientId),
  jobs: await getJobsByClientId(clientId),
  payments: await getPaymentsByClientId(clientId),
  communications: await getCommunicationsByClientId(clientId),
}
```

### Creating a New Entity

```typescript
import type { Client, ClientStatus, ClientSegment } from "@/src/domain/entities"

const newClient: Client = {
  id: generateId(),
  name: "John Doe",
  contactInfo: {
    email: "john@example.com",
    phone: "+1-555-0123",
    preferredContactMethod: "email",
  },
  primaryAddress: {
    street: "123 Main St",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85001",
  },
  status: ClientStatus.ACTIVE,
  segment: ClientSegment.REGULAR,
  totalSpent: { amount: 0, currency: "USD" },
  lifetimeValue: { amount: 0, currency: "USD" },
  serviceRequestIds: [],
  quoteIds: [],
  jobIds: [],
  paymentIds: [],
  communicationIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

## Migration from Legacy Models

The existing `models.ts` file contains legacy models that should be migrated:

- `Task` → `JobTask` (nested in `Job`)
- `Worker` → `Employee`
- `User` → Keep separate (auth concern, not domain)
- `Service` → Keep (catalog/service definition)
- `Client` → Enhanced in `entities.ts`
- `Testimonial` → Keep (marketing concern)

## Next Steps

1. Create repository interfaces for each aggregate
2. Implement mock data generators
3. Create service layer that uses these models
4. Migrate existing code to use new models
5. Add validation schemas (Zod/Yup)
