# State Management Architecture Proposal

## Executive Summary

**Recommended Solution: Zustand + React Query (TanStack Query)**

**Rationale**: Optimal balance of simplicity, performance, and developer experience for a multi-module dashboard application with real-time requirements.

---

## Requirements Analysis

### Application Characteristics

1. **Multi-Role Dashboards**: 4 distinct dashboards (Admin, Supervisor, Worker, Client)
2. **8 Core Modules**: Client Management, Requests, Jobs & Quotes, Scheduling, Communication, Financials, Retention, Marketing
3. **Real-Time Updates**: Scheduling changes, communication events, job status updates
4. **Complex Data Relationships**: Entities with cross-module dependencies
5. **CRUD Operations**: Extensive create, read, update, delete operations
6. **Next.js App Router**: Server components + client components hybrid

### Current State

- ✅ React 19 with Next.js 15.5.7
- ✅ App Router architecture
- ✅ Local state with `useState` only
- ✅ No global state management
- ✅ No data fetching library

---

## State Management Options Comparison

### Option 1: React Context API

**Pros:**
- ✅ Built-in, no dependencies
- ✅ Simple for small-scale state
- ✅ Works with React 19

**Cons:**
- ❌ Performance issues with frequent updates
- ❌ Provider hell (nested providers)
- ❌ No built-in devtools
- ❌ Re-render optimization complexity
- ❌ Not ideal for real-time updates

**Verdict**: ❌ **Not Recommended** - Insufficient for dashboard complexity

---

### Option 2: Redux Toolkit (RTK)

**Pros:**
- ✅ Industry standard, mature
- ✅ Excellent devtools
- ✅ Strong TypeScript support
- ✅ RTK Query for data fetching
- ✅ Time-travel debugging
- ✅ Large ecosystem

**Cons:**
- ❌ High boilerplate (even with RTK)
- ❌ Steep learning curve
- ❌ Overkill for many use cases
- ❌ Bundle size (~15KB gzipped)
- ❌ Complex setup for Next.js App Router

**Verdict**: ⚠️ **Overkill** - Too much boilerplate for this application

---

### Option 3: Zustand ⭐ **RECOMMENDED**

**Pros:**
- ✅ Minimal boilerplate (~1KB gzipped)
- ✅ Simple API, easy to learn
- ✅ Excellent TypeScript support
- ✅ No provider hell
- ✅ Built-in middleware support
- ✅ Works seamlessly with React 19
- ✅ Great performance (selective subscriptions)
- ✅ Easy to test
- ✅ Devtools support (Redux DevTools)
- ✅ Perfect for Next.js App Router

**Cons:**
- ⚠️ Smaller ecosystem than Redux
- ⚠️ Less opinionated (requires discipline)

**Verdict**: ✅ **RECOMMENDED** - Best fit for this application

---

### Option 4: Jotai

**Pros:**
- ✅ Atomic state management
- ✅ Fine-grained reactivity
- ✅ No re-render issues
- ✅ Good TypeScript support

**Cons:**
- ❌ Learning curve (atomic model)
- ❌ Smaller community
- ❌ Less documentation
- ❌ May be overkill

**Verdict**: ⚠️ **Not Recommended** - Too niche, Zustand is simpler

---

### Option 5: TanStack Query (React Query) + Zustand

**Pros:**
- ✅ TanStack Query: Best-in-class data fetching
- ✅ Automatic caching and refetching
- ✅ Optimistic updates
- ✅ Background sync
- ✅ Zustand: Perfect for UI state
- ✅ Separation of concerns

**Cons:**
- ⚠️ Two libraries to learn (but both are simple)

**Verdict**: ✅ **RECOMMENDED COMBINATION** - Best of both worlds

---

## Recommended Architecture

### Hybrid Approach: Zustand + TanStack Query

```
┌─────────────────────────────────────────────────────────┐
│                    STATE LAYERS                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  TanStack Query  │      │     Zustand      │        │
│  │  (Server State)  │      │   (Client State) │        │
│  └──────────────────┘      └──────────────────┘        │
│           │                         │                    │
│           │                         │                    │
│           ▼                         ▼                    │
│  ┌──────────────────────────────────────────┐           │
│  │         React Components                 │           │
│  └──────────────────────────────────────────┘           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### State Separation

#### TanStack Query (Server State)
- **Purpose**: Server data, caching, synchronization
- **Manages**:
  - Client data (CRUD operations)
  - Jobs, Quotes, Schedules
  - Payments, Communications
  - Real-time data synchronization
  - Optimistic updates

#### Zustand (Client State)
- **Purpose**: UI state, preferences, temporary state
- **Manages**:
  - Sidebar open/closed
  - Selected filters
  - Form state (before submission)
  - UI preferences (theme, view mode)
  - Modal/dialog state
  - Temporary selections

---

## Data Flow Architecture

### 1. CRUD Operations Flow

```
┌─────────────┐
│   Component  │
└──────┬───────┘
       │
       │ 1. User Action (Create/Update/Delete)
       ▼
┌──────────────────┐
│  TanStack Query  │
│   useMutation    │
└──────┬───────────┘
       │
       │ 2. Optimistic Update
       ▼
┌──────────────────┐
│   Zustand Store  │ (Optional: UI feedback)
└──────┬───────────┘
       │
       │ 3. API Call
       ▼
┌──────────────────┐
│   API Service    │
└──────┬───────────┘
       │
       │ 4. Server Response
       ▼
┌──────────────────┐
│  TanStack Query  │
│  Cache Update    │
└──────┬───────────┘
       │
       │ 5. Re-render Components
       ▼
┌─────────────┐
│  Component  │ (Updated data)
└─────────────┘
```

**Example: Create Client**

```typescript
// Component
const CreateClientForm = () => {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: createClient,
    onMutate: async (newClient) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['clients'] })
      const previous = queryClient.getQueryData(['clients'])
      queryClient.setQueryData(['clients'], (old) => [...old, newClient])
      return { previous }
    },
    onError: (err, newClient, context) => {
      // Rollback on error
      queryClient.setQueryData(['clients'], context.previous)
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
  
  return <form onSubmit={(e) => mutation.mutate(formData)}>...</form>
}
```

### 2. Scheduling Updates Flow

```
┌─────────────────┐
│  Schedule View  │
└────────┬────────┘
         │
         │ 1. User drags appointment
         ▼
┌──────────────────┐
│  Zustand Store   │ (Temporary: drag state)
└────────┬─────────┘
         │
         │ 2. Drop event
         ▼
┌──────────────────┐
│  TanStack Query  │
│   useMutation    │
└────────┬─────────┘
         │
         │ 3. Update schedule
         ▼
┌──────────────────┐
│  API Service     │
└────────┬─────────┘
         │
         │ 4. Success
         ▼
┌──────────────────┐
│  Real-time Sync  │ (WebSocket/SSE)
│  Update Cache    │
└────────┬─────────┘
         │
         │ 5. Broadcast to other users
         ▼
┌─────────────────┐
│ Other Dashboards│ (Auto-update)
└─────────────────┘
```

**Real-Time Update Pattern**

```typescript
// Real-time subscription hook
const useScheduleUpdates = (scheduleId: string) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = new WebSocket(`/api/schedules/${scheduleId}/updates`)
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      
      // Update cache
      queryClient.setQueryData(
        ['schedule', scheduleId],
        (old) => ({ ...old, ...update })
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    }
    
    return () => ws.close()
  }, [scheduleId, queryClient])
}
```

### 3. Communication Events Flow

```
┌──────────────────┐
│  Communication   │
│     Module       │
└────────┬─────────┘
         │
         │ 1. New message received
         ▼
┌──────────────────┐
│  Event Listener  │ (WebSocket/SSE)
└────────┬─────────┘
         │
         │ 2. Update TanStack Query cache
         ▼
┌──────────────────┐
│  TanStack Query  │
│  Cache Update    │
└────────┬─────────┘
         │
         │ 3. Update Zustand (notification count)
         ▼
┌──────────────────┐
│  Zustand Store   │
│  (Notifications) │
└────────┬─────────┘
         │
         │ 4. Trigger UI update
         ▼
┌──────────────────┐
│  Notification    │
│     Bell Icon    │ (Badge count)
└──────────────────┘
```

**Communication Store Pattern**

```typescript
// Zustand store for UI state
interface CommunicationStore {
  unreadCount: number
  activeConversationId: string | null
  setUnreadCount: (count: number) => void
  setActiveConversation: (id: string | null) => void
}

// TanStack Query for message data
const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    refetchInterval: 5000, // Polling fallback
  })
}
```

---

## Store Structure

### Zustand Stores (Client State)

```
src/stores/
├── uiStore.ts           # UI state (sidebar, modals, theme)
├── filterStore.ts       # Filter state (shared across modules)
├── notificationStore.ts # Notification state
└── formStore.ts         # Temporary form state (optional)
```

### TanStack Query (Server State)

```
src/hooks/queries/
├── clients/
│   ├── useClients.ts
│   ├── useClient.ts
│   └── useClientMutations.ts
├── jobs/
│   ├── useJobs.ts
│   ├── useJob.ts
│   └── useJobMutations.ts
├── schedules/
│   ├── useSchedules.ts
│   └── useScheduleMutations.ts
└── communications/
    ├── useMessages.ts
    └── useMessageMutations.ts
```

---

## Implementation Strategy

### Phase 1: Foundation (Week 1)

1. **Install Dependencies**
   ```bash
   pnpm add zustand @tanstack/react-query
   ```

2. **Setup TanStack Query Provider**
   - Wrap app with QueryClientProvider
   - Configure default options

3. **Create First Zustand Store**
   - UI store (sidebar, modals)
   - Replace existing useState calls

### Phase 2: Data Fetching (Week 2)

1. **Migrate Data Fetching**
   - Convert existing data fetching to TanStack Query
   - Create query hooks for each module

2. **Implement CRUD Operations**
   - Create mutation hooks
   - Add optimistic updates

### Phase 3: Real-Time (Week 3)

1. **Add Real-Time Subscriptions**
   - WebSocket/SSE integration
   - Update TanStack Query cache on events

2. **Communication Module**
   - Real-time message updates
   - Notification system

### Phase 4: Optimization (Week 4)

1. **Performance Tuning**
   - Query invalidation strategies
   - Cache optimization
   - Selective subscriptions

2. **Developer Experience**
   - DevTools setup
   - Error boundaries
   - Loading states

---

## Store Examples

### Zustand: UI Store

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  theme: 'light' | 'dark'
  setSidebarOpen: (open: boolean) => void
  setActiveModal: (modal: string | null) => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      activeModal: null,
      theme: 'light',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    { name: 'UI Store' }
  )
)
```

### TanStack Query: Client Queries

```typescript
// src/hooks/queries/clients/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Client } from '@/src/domain/entities'

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => fetchClients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
```

---

## Real-Time Update Strategy

### Option 1: WebSocket (Recommended for MVP)

```typescript
// src/hooks/useRealtimeUpdates.ts
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!)
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      switch (type) {
        case 'SCHEDULE_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['schedules'] })
          break
        case 'JOB_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['jobs', data.jobId] })
          break
        case 'NEW_MESSAGE':
          queryClient.setQueryData(
            ['messages', data.conversationId],
            (old) => [...old, data.message]
          )
          break
      }
    }
    
    return () => ws.close()
  }, [queryClient])
}
```

### Option 2: Server-Sent Events (SSE)

```typescript
// Simpler, one-way updates
export const useSSEUpdates = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const eventSource = new EventSource('/api/events')
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      // Update cache
    }
    
    return () => eventSource.close()
  }, [queryClient])
}
```

---

## Performance Considerations

### 1. Selective Subscriptions (Zustand)

```typescript
// ✅ Good: Only subscribe to needed state
const sidebarOpen = useUIStore((state) => state.sidebarOpen)

// ❌ Bad: Subscribe to entire store
const store = useUIStore()
```

### 2. Query Invalidation Strategy

```typescript
// ✅ Good: Specific invalidation
queryClient.invalidateQueries({ queryKey: ['clients', clientId] })

// ⚠️ Acceptable: Broad invalidation (when needed)
queryClient.invalidateQueries({ queryKey: ['clients'] })
```

### 3. Optimistic Updates

```typescript
// ✅ Good: Optimistic update with rollback
onMutate: async (newItem) => {
  await queryClient.cancelQueries({ queryKey: ['items'] })
  const previous = queryClient.getQueryData(['items'])
  queryClient.setQueryData(['items'], (old) => [...old, newItem])
  return { previous }
},
onError: (err, newItem, context) => {
  queryClient.setQueryData(['items'], context.previous)
}
```

---

## Migration Path

### Step 1: Add Libraries (No Breaking Changes)

```bash
pnpm add zustand @tanstack/react-query
```

### Step 2: Create Stores (Parallel to Existing Code)

- Create Zustand stores
- Create TanStack Query hooks
- Keep existing code working

### Step 3: Gradual Migration

- Migrate one module at a time
- Start with read operations (queries)
- Then mutations
- Finally, real-time updates

### Step 4: Remove Old Code

- Remove useState for global state
- Remove manual data fetching
- Clean up unused code

---

## Bundle Size Impact

| Library | Size (gzipped) | Impact |
|---------|---------------|--------|
| Zustand | ~1KB | ✅ Minimal |
| TanStack Query | ~13KB | ✅ Acceptable |
| **Total** | **~14KB** | ✅ **Reasonable** |

**Comparison:**
- Redux Toolkit: ~15KB
- Zustand + TanStack Query: ~14KB
- Context API: 0KB (but performance issues)

---

## Developer Experience

### Advantages

1. **TypeScript**: Full type safety
2. **DevTools**: Redux DevTools support (Zustand)
3. **Testing**: Easy to test stores and queries
4. **Debugging**: Clear data flow
5. **Documentation**: Excellent docs for both libraries

### Learning Curve

- **Zustand**: ~30 minutes (very simple)
- **TanStack Query**: ~2 hours (comprehensive)
- **Total**: ~2.5 hours to become productive

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Learning curve | Low | Medium | Good documentation, simple APIs |
| Bundle size | Low | Low | Small libraries, tree-shakeable |
| Migration complexity | Medium | Medium | Gradual migration, parallel implementation |
| Real-time complexity | Medium | High | Start with polling, add WebSocket later |

---

## Final Recommendation

### ✅ **Zustand + TanStack Query**

**Why:**
1. **Simplicity**: Easy to learn and implement
2. **Performance**: Excellent for dashboard complexity
3. **Real-Time**: TanStack Query handles caching, Zustand handles UI
4. **TypeScript**: First-class support
5. **Next.js**: Works perfectly with App Router
6. **Bundle Size**: Reasonable (~14KB)
7. **Ecosystem**: Mature, well-maintained

**When to Reconsider:**
- If application grows to 50+ stores (consider Redux)
- If need complex state machines (consider XState)
- If need time-travel debugging (Redux has better support)

---

## Next Steps

1. ✅ **Review this proposal** with team
2. ✅ **Install dependencies** (if approved)
3. ✅ **Create proof of concept** (one module)
4. ✅ **Get team feedback**
5. ✅ **Proceed with full implementation**

---

## Appendix: Alternative for Simple Cases

If the application remains simple, consider:

**React Query Only** (no Zustand)
- Use React Query for all state
- Use URL params for filters
- Use local state for truly local UI

**When this works:**
- Simple dashboards
- Minimal UI state
- No complex interactions

**For this application:** Not recommended due to complexity.
