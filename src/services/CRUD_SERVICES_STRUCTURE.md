# CRUD Services Structure

## Service Layer Pattern

All services follow this pattern:

```typescript
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

## Services Status

- ✅ clientService.ts - Updated
- ✅ jobService.ts - Updated
- ⏳ employeeService.ts - Needs update
- ⏳ quoteService.ts - Needs update
- ⏳ scheduleService.ts - Needs update
- ⏳ paymentService.ts - Needs update
- ⏳ communicationService.ts - Needs update
