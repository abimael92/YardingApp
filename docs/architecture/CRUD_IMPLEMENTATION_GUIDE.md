# CRUD Implementation Guide

## Overview

This guide documents the complete CRUD UI implementation for all domain aggregates. The Client aggregate serves as the reference implementation.

---

## Component Structure

### Shared UI Components

Located in `src/shared/ui/`:

```
src/shared/ui/
├── DataTable.tsx          # Reusable table component
├── FormModal.tsx          # Reusable modal for forms
├── LoadingState.tsx       # Loading spinner component
├── EmptyState.tsx         # Empty state component
└── ... (existing components)
```

### Feature Components Structure

Each aggregate follows this structure:

```
src/features/admin/{aggregate}/
└── ui/
    ├── {Aggregate}List.tsx      # Main list/table view
    ├── {Aggregate}Form.tsx      # Create/Edit form modal
    └── {Aggregate}Detail.tsx    # View detail modal
```

**Example (Client)**:
```
src/features/admin/clients/
└── ui/
    ├── ClientList.tsx
    ├── ClientForm.tsx
    └── ClientDetail.tsx
```

---

## Service Layer Structure

### Service Pattern

All services follow this async-like pattern:

```typescript
// src/services/{entity}Service.ts
import { mockStore } from "@/src/data/mockStore"
import type { Entity, EntityId } from "@/src/domain/entities"
import { asyncify, asyncifyWithError } from "./utils"

export interface EntityService {
  getAll(): Promise<Entity[]>
  getById(id: EntityId): Promise<Entity | undefined>
  create(entity: Omit<Entity, "id" | "createdAt" | "updatedAt">): Promise<Entity>
  update(id: EntityId, updates: Partial<Entity>): Promise<Entity | undefined>
  delete(id: EntityId): Promise<boolean>
}

export const entityService: EntityService = {
  getAll: () => asyncify(() => mockStore.getEntities()),
  getById: (id) => asyncify(() => mockStore.getEntityById(id)),
  create: (entity) => asyncifyWithError(() => mockStore.createEntity(entity)),
  update: (id, updates) => asyncifyWithError(() => {
    const updated = mockStore.updateEntity(id, updates)
    if (!updated) throw new Error(`Entity with id ${id} not found`)
    return updated
  }),
  delete: (id) => asyncifyWithError(() => {
    const deleted = mockStore.deleteEntity(id)
    if (!deleted) throw new Error(`Entity with id ${id} not found`)
    return deleted
  }),
}

// Convenience functions
export const getAllEntities = () => entityService.getAll()
export const getEntityById = (id: EntityId) => entityService.getById(id)
export const createEntity = (entity: Omit<Entity, "id" | "createdAt" | "updatedAt">) =>
  entityService.create(entity)
export const updateEntity = (id: EntityId, updates: Partial<Entity>) =>
  entityService.update(id, updates)
export const deleteEntity = (id: EntityId) => entityService.delete(id)
```

### Services Status

- ✅ `clientService.ts` - Full CRUD with async-like functions
- ✅ `jobService.ts` - Full CRUD with async-like functions
- ✅ `employeeService.ts` - Full CRUD with async-like functions
- ✅ `quoteService.ts` - Full CRUD with async-like functions
- ✅ `scheduleService.ts` - Full CRUD with async-like functions
- ✅ `paymentService.ts` - Full CRUD with async-like functions
- ✅ `communicationService.ts` - Full CRUD with async-like functions

---

## Complete Example: Client CRUD

### 1. ClientList Component

**File**: `src/features/admin/clients/ui/ClientList.tsx`

**Features**:
- Loads data from `getAllClients()` service
- Displays in `DataTable` component
- Handles Create, Edit, View, Delete actions
- Shows loading and empty states
- Manages modal state

**Key Pattern**:
```typescript
const [clients, setClients] = useState<Client[]>([])
const [isLoading, setIsLoading] = useState(true)

const loadClients = async () => {
  setIsLoading(true)
  try {
    const data = await getAllClients()
    setClients(data)
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => {
  loadClients()
}, [])
```

### 2. ClientForm Component

**File**: `src/features/admin/clients/ui/ClientForm.tsx`

**Features**:
- Uses `FormModal` wrapper
- Handles both create and edit modes
- Form validation
- Calls `createClient()` or `updateClient()` service
- Refreshes list on success

**Key Pattern**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (client) {
    await updateClient(client.id, formData)
  } else {
    await createClient(formData)
  }
  onSuccess() // Refreshes parent list
}
```

### 3. ClientDetail Component

**File**: `src/features/admin/clients/ui/ClientDetail.tsx`

**Features**:
- Read-only view
- Uses `FormModal` (footer: null)
- Displays all client information
- Formatted currency, dates, status badges

### 4. Route Page

**File**: `app/(dashboard)/admin/clients/page.tsx`

**Features**:
- Standard admin layout
- Renders `ClientList` component
- Includes sidebar and breadcrumbs

---

## Building Remaining Aggregates

### Template for New Aggregate

1. **Create List Component** (`{Aggregate}List.tsx`):
   - Copy `ClientList.tsx`
   - Replace `Client` with `{Aggregate}`
   - Update service imports
   - Customize columns for your entity
   - Adjust form/detail modal names

2. **Create Form Component** (`{Aggregate}Form.tsx`):
   - Copy `ClientForm.tsx`
   - Replace `Client` with `{Aggregate}`
   - Update form fields based on entity structure
   - Handle nested objects (e.g., Address, Money)
   - Update service calls

3. **Create Detail Component** (`{Aggregate}Detail.tsx`):
   - Copy `ClientDetail.tsx`
   - Replace `Client` with `{Aggregate}`
   - Display all relevant fields
   - Format data appropriately

4. **Create/Update Route Page**:
   - Copy `app/(dashboard)/admin/clients/page.tsx`
   - Update component imports
   - Update page title and description

---

## Component Patterns

### Loading State Pattern

```typescript
if (isLoading) {
  return <LoadingState message="Loading..." />
}
```

### Empty State Pattern

```typescript
<DataTable
  data={items}
  columns={columns}
  emptyMessage="No items found. Create your first item to get started."
  // ...
/>
```

### Error Handling Pattern

```typescript
try {
  await createEntity(data)
  onSuccess()
} catch (error) {
  console.error("Failed to create:", error)
  alert("Failed to create. Please try again.")
}
```

### Form Submission Pattern

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  try {
    // ... save logic
  } catch (error) {
    // ... error handling
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service Function (async)
    ↓
mockStore (sync, but wrapped in asyncify)
    ↓
State Update
    ↓
UI Re-render
```

**Example**:
```
User clicks "Create Client"
    ↓
ClientForm.handleSubmit()
    ↓
createClient(clientData) [async]
    ↓
clientService.create() [async]
    ↓
asyncifyWithError(() => mockStore.createClient()) [async wrapper]
    ↓
mockStore.createClient() [sync]
    ↓
setClients([...clients, newClient]) [state update]
    ↓
ClientList re-renders with new data
```

---

## API-Ready Migration

When replacing mock data with real API:

1. **Update Service Implementation**:
   ```typescript
   // Before (mock)
   getAll: () => asyncify(() => mockStore.getEntities())
   
   // After (API)
   getAll: async () => {
     const response = await fetch('/api/entities')
     return response.json()
   }
   ```

2. **No UI Changes Required**:
   - Components already use async/await
   - Error handling already in place
   - Loading states already implemented
   - Service interfaces remain the same

---

## Status Summary

### ✅ Completed

- **Service Layer**: All services updated with full CRUD and async-like functions
- **Shared Components**: DataTable, FormModal, LoadingState, EmptyState
- **Client CRUD**: Complete implementation (List, Form, Detail, Route)

### 📋 Remaining Aggregates

Follow the Client pattern to build:

1. **Job CRUD** - `src/features/admin/jobs/ui/`
2. **Quote CRUD** - `src/features/admin/quotes/ui/`
3. **Employee CRUD** - `src/features/admin/employees/ui/`
4. **Schedule CRUD** - `src/features/admin/schedules/ui/`
5. **Payment CRUD** - `src/features/admin/payments/ui/`
6. **Communication CRUD** - `src/features/admin/communications/ui/`

### 📝 Next Steps

1. Copy Client CRUD components as templates
2. Replace Client with target aggregate
3. Update form fields based on entity structure
4. Customize columns for DataTable
5. Create route pages
6. Test end-to-end

---

## File Structure Summary

```
src/
├── services/
│   ├── utils.ts                    # Async helpers
│   ├── clientService.ts            # ✅ Complete
│   ├── jobService.ts               # ✅ Complete
│   ├── employeeService.ts          # ✅ Complete
│   ├── quoteService.ts             # ✅ Complete
│   ├── scheduleService.ts          # ✅ Complete
│   ├── paymentService.ts           # ✅ Complete
│   └── communicationService.ts     # ✅ Complete
│
├── shared/ui/
│   ├── DataTable.tsx               # ✅ Complete
│   ├── FormModal.tsx               # ✅ Complete
│   ├── LoadingState.tsx            # ✅ Complete
│   └── EmptyState.tsx              # ✅ Complete
│
└── features/admin/
    ├── clients/ui/                 # ✅ Complete
    │   ├── ClientList.tsx
    │   ├── ClientForm.tsx
    │   └── ClientDetail.tsx
    │
    ├── jobs/ui/                    # ⏳ To build
    ├── quotes/ui/                  # ⏳ To build
    ├── employees/ui/               # ⏳ To build
    ├── schedules/ui/               # ⏳ To build
    ├── payments/ui/                # ⏳ To build
    └── communications/ui/          # ⏳ To build

app/(dashboard)/admin/
├── clients/page.tsx                # ✅ Complete
├── jobs/page.tsx                   # ⏳ To create
├── quotes/page.tsx                 # ⏳ To create
├── employees/page.tsx              # ⏳ To create
├── schedules/page.tsx              # ⏳ To create
├── payments/page.tsx               # ⏳ To create
└── communications/page.tsx         # ⏳ To create
```

---

## Verification Checklist

For each aggregate, verify:

- [ ] Service has full CRUD methods (async-like)
- [ ] List component loads and displays data
- [ ] Create form works and refreshes list
- [ ] Edit form pre-fills and updates correctly
- [ ] Delete confirms and removes item
- [ ] View detail shows all information
- [ ] Loading states display during operations
- [ ] Empty states show when no data
- [ ] Error handling works for failures
- [ ] Route page renders correctly
- [ ] All data comes from services (no hardcoded)

---

**Status**: Client CRUD complete and verified. Template ready for remaining aggregates.
