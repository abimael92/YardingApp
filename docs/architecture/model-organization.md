# Model Organization Recommendations

## Current Structure

```
src/
├── domain/
│   ├── models.ts          # Legacy models
│   ├── entities.ts         # New domain entities
│   └── relationships.ts   # Relationship definitions
├── data/
│   └── mockData.ts        # Legacy mock data
└── services/
    └── ...                # Service layer
```

## Recommended Structure

```
src/
├── domain/                          # Domain Layer (DDD)
│   ├── entities.ts                  # Core domain entities
│   ├── relationships.ts             # Relationship types
│   ├── value-objects.ts             # Value objects (optional split)
│   ├── enums.ts                     # Domain enums (optional split)
│   ├── types.ts                     # Domain type aliases
│   └── README.md                    # Domain documentation
│
├── data/                            # Data Layer
│   ├── mocks/                       # Mock data generators
│   │   ├── generators/              # Entity generators
│   │   ├── factories/               # Relationship factories
│   │   ├── seeds/                   # Seed data
│   │   └── index.ts                 # Public API
│   └── repositories/                # Repository interfaces (future)
│       ├── clientRepository.ts
│       ├── jobRepository.ts
│       └── ...
│
├── services/                        # Application Services
│   ├── clientService.ts             # Client business logic
│   ├── jobService.ts                # Job business logic
│   └── ...
│
└── features/                        # Feature Modules
    ├── clients/
    │   ├── domain/                  # Feature-specific domain models
    │   ├── services/                 # Feature services
    │   └── ui/                       # UI components
    └── jobs/
        ├── domain/
        ├── services/
        └── ui/
```

## Model Location Guidelines

### 1. Domain Models (`src/domain/`)

**Purpose**: Core business entities, value objects, and domain logic

**Contains**:
- ✅ Entity interfaces
- ✅ Value object interfaces
- ✅ Domain enums
- ✅ Type aliases (EntityId, Timestamp, etc.)
- ✅ Aggregate root definitions
- ✅ Domain validation rules (if pure TypeScript)

**Does NOT contain**:
- ❌ UI components
- ❌ API calls
- ❌ Database schemas
- ❌ Framework-specific code

**Files**:
- `entities.ts` - All entity definitions
- `relationships.ts` - Relationship types and aggregates
- `value-objects.ts` - Value objects (if split out)
- `enums.ts` - Domain enums (if split out)

### 2. Feature-Specific Domain Models (`src/features/{feature}/domain/`)

**Purpose**: Feature-specific domain extensions

**Contains**:
- ✅ Feature-specific entity extensions
- ✅ Feature-specific value objects
- ✅ Feature-specific domain events (future)

**Example**:
```typescript
// src/features/clients/domain/clientExtensions.ts
import type { Client } from "@/src/domain/entities"

export interface ClientWithMetrics extends Client {
  metrics: {
    averageJobValue: number
    retentionScore: number
    churnRisk: "low" | "medium" | "high"
  }
}
```

### 3. Data Models (`src/data/`)

**Purpose**: Data access, persistence, and mock data

**Contains**:
- ✅ Mock data generators
- ✅ Repository interfaces (future)
- ✅ Data transformation utilities
- ✅ API response types (if different from domain)

**Does NOT contain**:
- ❌ Business logic
- ❌ Domain validation (use domain layer)

### 4. Service Models (`src/services/`)

**Purpose**: Application service layer

**Contains**:
- ✅ Service interfaces
- ✅ Service-specific DTOs (if needed)
- ✅ Service response types

**Does NOT contain**:
- ❌ Domain entities (import from domain/)
- ❌ UI components

## Import Strategy

### Domain Models (Always Import from Domain)

```typescript
// ✅ Good - Import from domain
import type { Client, Job, Quote } from "@/src/domain/entities"
import type { ClientRelationships } from "@/src/domain/relationships"

// ❌ Bad - Don't re-export domain models from other layers
import type { Client } from "@/src/services/clientService"
```

### Feature-Specific Extensions

```typescript
// ✅ Good - Import base from domain, extend in feature
import type { Client } from "@/src/domain/entities"
import type { ClientWithMetrics } from "@/src/features/clients/domain/clientExtensions"
```

### Service Layer

```typescript
// ✅ Good - Services use domain models
import type { Client } from "@/src/domain/entities"

export interface ClientService {
  getClient(id: string): Promise<Client>
  createClient(data: CreateClientDTO): Promise<Client>
}
```

## File Organization Patterns

### Pattern 1: Single File (Current)

**Pros**: Easy to find, single import
**Cons**: Large files, harder to navigate

```typescript
// src/domain/entities.ts (all entities in one file)
export interface Client { ... }
export interface Job { ... }
export interface Quote { ... }
```

### Pattern 2: One File Per Entity (Recommended for Large Projects)

**Pros**: Better organization, easier navigation
**Cons**: More imports

```
src/domain/
├── entities/
│   ├── client.ts
│   ├── job.ts
│   ├── quote.ts
│   └── index.ts
└── relationships.ts
```

### Pattern 3: Feature-Based (For Very Large Projects)

**Pros**: Clear feature boundaries
**Cons**: Potential duplication, harder to find

```
src/domain/
├── clients/
│   ├── client.ts
│   └── clientRelationships.ts
├── jobs/
│   ├── job.ts
│   └── jobRelationships.ts
```

## Recommended Approach for This Project

### Phase 1: Current Structure (Keep)

```
src/domain/
├── entities.ts          # All entities
├── relationships.ts    # All relationships
└── README.md
```

**Rationale**: Project is manageable size, single file is fine

### Phase 2: Split When Needed

When `entities.ts` exceeds ~1000 lines, split into:

```
src/domain/
├── entities/
│   ├── client.ts
│   ├── job.ts
│   ├── quote.ts
│   ├── employee.ts
│   ├── schedule.ts
│   ├── payment.ts
│   ├── communication.ts
│   └── index.ts        # Re-exports all
├── relationships.ts
└── README.md
```

## Type Exports Strategy

### Barrel Exports (Recommended)

```typescript
// src/domain/index.ts
export * from "./entities"
export * from "./relationships"
export type { EntityId, Timestamp } from "./entities"
```

**Usage**:
```typescript
import type { Client, Job, EntityId } from "@/src/domain"
```

### Named Exports (Alternative)

```typescript
// src/domain/entities.ts
export type { Client, Job, Quote } from "./entities"
```

## Validation Strategy

### Option 1: Zod Schemas (Recommended)

```typescript
// src/domain/validators/clientSchema.ts
import { z } from "zod"
import type { Client } from "../entities"

export const clientSchema: z.ZodType<Client> = z.object({
  id: z.string(),
  name: z.string().min(1),
  // ... rest of schema
})
```

### Option 2: Type Guards

```typescript
// src/domain/guards/clientGuards.ts
import type { Client } from "../entities"

export function isValidClient(value: unknown): value is Client {
  // Validation logic
}
```

## Migration Checklist

- [x] Create new entity models in `src/domain/entities.ts`
- [x] Create relationship definitions in `src/domain/relationships.ts`
- [ ] Create mock data generators
- [ ] Migrate existing code to use new models
- [ ] Add validation schemas
- [ ] Update service layer to use new models
- [ ] Deprecate legacy `models.ts` (keep for backward compatibility)
- [ ] Remove legacy models after migration complete

## Best Practices

1. **Single Source of Truth**: Domain models live in `src/domain/`
2. **No Duplication**: Don't redefine entities in other layers
3. **Type Safety**: Use TypeScript types, not `any`
4. **Immutability**: Prefer `readonly` for entity properties
5. **Documentation**: Document complex relationships
6. **Versioning**: Consider versioning for breaking changes

## Anti-Patterns to Avoid

❌ **Don't**: Put domain models in UI components
```typescript
// ❌ Bad
// src/components/ClientCard.tsx
interface Client { ... }
```

❌ **Don't**: Duplicate domain models in services
```typescript
// ❌ Bad
// src/services/clientService.ts
interface Client { ... } // Duplicate!
```

❌ **Don't**: Mix domain and API models
```typescript
// ❌ Bad
interface Client {
  // Domain properties
  // API-specific properties mixed in
  _apiVersion: string
}
```

✅ **Do**: Separate concerns
```typescript
// ✅ Good
// Domain model
interface Client { ... }

// API response (if different)
interface ClientAPIResponse extends Client {
  _meta: { version: string }
}
```
