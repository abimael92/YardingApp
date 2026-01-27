# Admin Implementation Quick Reference

## Phase 1: Read-Only Views (2-3 days)

### 1. Create Mock Store

**File**: `src/data/mockStore.ts`

```typescript
class MockStore {
  private users = new Map()
  private clients = new Map()
  private employees = new Map()
  
  getUsers() { return Array.from(this.users.values()) }
  getClients() { return Array.from(this.clients.values()) }
  getEmployees() { return Array.from(this.employees.values()) }
  
  initialize() {
    // Seed with 20 users, 10 clients, 5 employees
  }
}
export const mockStore = new MockStore()
```

### 2. Create Services

**File**: `src/services/userService.ts`
```typescript
import { mockStore } from "@/src/data/mockStore"
export const getAllUsers = () => mockStore.getUsers()
export const getUserById = (id) => mockStore.getUserById(id)
```

**File**: `src/services/clientService.ts`
```typescript
import { mockStore } from "@/src/data/mockStore"
export const getAllClients = () => mockStore.getClients()
export const getClientById = (id) => mockStore.getClientById(id)
```

### 3. Create List Components

**File**: `src/features/admin/users/ui/UserList.tsx`
```typescript
import { getAllUsers } from "@/src/services/userService"

export const UserList = () => {
  const users = getAllUsers()
  return (/* table with users */)
}
```

### 4. Update Dashboard

**File**: `src/features/dashboards/admin/ui/AdminDashboard.tsx`
```typescript
import { getAllUsers } from "@/src/services/userService"
import { getAllClients } from "@/src/services/clientService"

const users = getAllUsers()
const clients = getAllClients()

const stats = [
  { title: "Active Clients", value: clients.length.toString() }
]
```

---

## Phase 2: CRUD Operations (4-5 days)

### 1. Add CRUD to Services

**File**: `src/services/userService.ts`
```typescript
export const createUser = (data) => mockStore.createUser(data)
export const updateUser = (id, updates) => mockStore.updateUser(id, updates)
export const deleteUser = (id) => mockStore.deleteUser(id)
```

### 2. Create Management Hook

**File**: `src/features/admin/users/hooks/useUserManagement.ts`
```typescript
export const useUserManagement = () => {
  const [users, setUsers] = useState(getAllUsers())
  
  const create = (data) => {
    createUser(data)
    setUsers(getAllUsers())
  }
  
  return { users, create, update, delete }
}
```

### 3. Create Form Modal

**File**: `src/features/admin/users/ui/CreateUserModal.tsx`
```typescript
export const CreateUserModal = ({ isOpen, onClose, onCreate }) => {
  const { create } = useUserManagement()
  
  const handleSubmit = (data) => {
    create(data)
    onCreate()
    onClose()
  }
  
  return (/* form UI */)
}
```

---

## Phase 3: Advanced Features (3-4 days)

### 1. Create Analytics Service

**File**: `src/services/analyticsService.ts`
```typescript
export const getRevenueByPeriod = (start, end) => {
  const payments = getAllPayments()
    .filter(p => p.date >= start && p.date <= end)
  return payments.reduce((sum, p) => sum + p.amount, 0)
}
```

### 2. Create Settings Service

**File**: `src/services/settingsService.ts`
```typescript
export const getSettings = () => mockStore.getSettings()
export const updateSetting = (key, value) => mockStore.updateSetting(key, value)
```

---

## Verification Commands

```bash
# Type check
pnpm run typecheck

# Build
pnpm run build

# Dev server
pnpm run dev

# Test admin routes
# http://localhost:3000/admin
# http://localhost:3000/admin/users
# http://localhost:3000/admin/tasks
# http://localhost:3000/admin/analytics
# http://localhost:3000/admin/settings
```

---

## Rollback Instructions

### Phase 1 Rollback
- Remove service imports from AdminDashboard
- Restore hardcoded stats
- Delete new service files

### Phase 2 Rollback
- Remove CRUD methods from services
- Remove form components
- Keep read-only functionality

### Phase 3 Rollback
- Remove advanced services
- Keep core CRUD functionality
- Remove analytics/settings UI
