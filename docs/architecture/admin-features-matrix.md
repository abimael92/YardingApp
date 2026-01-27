# Admin Features Matrix & Data Requirements

## Admin Feature Requirements

### User Management
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View Users | Read | User[] | None |
| Create User | Write | User (name, email, role, status) | None |
| Edit User | Update | User (id, updates) | None |
| Delete User | Delete | User (id) | Check: assigned jobs, clients |
| Activate/Deactivate | Update | User (id, status) | None |
| Change Role | Update | User (id, role) | Validate permissions |

### Client Management
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View Clients | Read | Client[] | Quotes[], Jobs[], Payments[] |
| Create Client | Write | Client (full profile) | None |
| Edit Client | Update | Client (id, updates) | None |
| Delete Client | Delete | Client (id) | Check: active jobs, unpaid invoices |
| View Client Details | Read | Client (id) | All relationships |
| Segment Clients | Update | Client (id, segment) | None |
| Add Notes | Update | Client (id, notes) | None |

### Employee Management
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View Employees | Read | Employee[] | Jobs[], Schedules[] |
| Create Employee | Write | Employee (full profile) | None |
| Edit Employee | Update | Employee (id, updates) | None |
| Delete Employee | Delete | Employee (id) | Check: assigned jobs |
| Change Role | Update | Employee (id, role) | Validate permissions |
| Manage Availability | Update | Employee (id, availability) | None |

### Task/Job Management
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View All Jobs | Read | Job[] | Client, Employees, Quote |
| View Job Details | Read | Job (id) | All relationships |
| Reassign Job | Update | Job (id, employeeIds) | Validate employee availability |
| Modify Job | Update | Job (id, updates) | Validate client, employees |
| Cancel Job | Update | Job (id, status) | Check: payments, schedules |
| Change Priority | Update | Job (id, priority) | None |
| Add Notes | Update | Job (id, notes) | None |

### Financial Oversight
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View Payments | Read | Payment[] | Client, Job |
| View Payment Details | Read | Payment (id) | Client, Job |
| Process Refund | Update | Payment (id, amount) | Validate: original payment |
| Update Status | Update | Payment (id, status) | None |
| Generate Reports | Read | Payment[] (filtered) | Aggregated by period |

### Analytics & Reporting
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| Revenue Analytics | Read | Payment[] (aggregated) | Time-series |
| Client Growth | Read | Client[] (aggregated) | Time-series |
| Performance Metrics | Read | Job[] (aggregated) | Employee, Client |
| Service Distribution | Read | Job[] (aggregated) | Service type |
| Export Data | Read | All entities (filtered) | Formatted export |

### System Configuration
| Feature | Operation | Data Required | Relationships |
|---------|-----------|--------------|---------------|
| View Settings | Read | Settings (key-value) | None |
| Update Settings | Update | Settings (key, value) | None |
| Feature Flags | Update | FeatureFlag[] | None |
| Integration Config | Update | IntegrationConfig[] | None |

---

## Current vs Required Services

| Service | Current | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|---------|
| userService | ❌ | ✅ Read | ✅ CRUD | ✅ Full |
| clientService | ❌ | ✅ Read | ✅ CRUD | ✅ Full |
| employeeService | ❌ | ✅ Read | ✅ CRUD | ✅ Full |
| taskService | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| jobService | ❌ | ✅ Read | ✅ CRUD | ✅ Full |
| quoteService | ❌ | ❌ | ❌ | ✅ Full |
| paymentService | ❌ | ✅ Read | ✅ Read | ✅ Full |
| scheduleService | ❌ | ✅ Read | ✅ Read | ✅ Full |
| communicationService | ❌ | ✅ Read | ✅ Read | ✅ Full |
| analyticsService | ❌ | ❌ | ❌ | ✅ Full |
| settingsService | ❌ | ❌ | ❌ | ✅ Full |

---

## File Structure by Phase

### Phase 1 Structure
```
src/
├── data/
│   └── mockStore.ts                    [NEW]
├── services/
│   ├── userService.ts                  [NEW]
│   ├── clientService.ts                [NEW]
│   ├── employeeService.ts              [NEW]
│   └── adminService.ts                 [NEW]
└── features/
    └── admin/
        ├── users/
        │   └── ui/
        │       └── UserList.tsx         [NEW]
        ├── clients/
        │   └── ui/
        │       └── ClientList.tsx       [NEW]
        └── employees/
            └── ui/
                └── EmployeeList.tsx     [NEW]
```

### Phase 2 Structure
```
src/
├── services/
│   └── [All services add CRUD methods] [MODIFY]
└── features/
    └── admin/
        ├── users/
        │   ├── ui/
        │   │   ├── CreateUserModal.tsx  [NEW]
        │   │   ├── EditUserModal.tsx    [NEW]
        │   │   └── DeleteUserConfirm.tsx [NEW]
        │   └── hooks/
        │       └── useUserManagement.ts [NEW]
        └── [Similar for clients/employees]
```

### Phase 3 Structure
```
src/
├── services/
│   ├── quoteService.ts                 [NEW]
│   ├── paymentService.ts               [NEW]
│   ├── scheduleService.ts              [NEW]
│   ├── communicationService.ts        [NEW]
│   ├── analyticsService.ts            [NEW]
│   └── settingsService.ts              [NEW]
└── features/
    └── admin/
        ├── analytics/
        │   └── ui/                     [NEW]
        ├── settings/
        │   └── ui/                     [NEW]
        └── financials/
            └── ui/                     [NEW]
```

---

## Implementation Order (Safe Sequence)

### Week 1: Phase 1
1. Day 1: Create mockStore + userService
2. Day 2: Create clientService + employeeService
3. Day 3: Create UI components (read-only)
4. Day 4: Update AdminDashboard
5. Day 5: Testing & refinement

### Week 2: Phase 2
1. Day 1: Add CRUD to userService + hooks
2. Day 2: Add CRUD to clientService + hooks
3. Day 3: Add CRUD to employeeService + hooks
4. Day 4: Create form components
5. Day 5: Integration & testing

### Week 3: Phase 3
1. Day 1: Create remaining services
2. Day 2: Create analytics components
3. Day 3: Create settings components
4. Day 4: Create financial components
5. Day 5: Integration & testing

---

## Validation Checklist

### After Each Phase

**Phase 1:**
- [ ] All admin pages load
- [ ] Data displays from services
- [ ] No console errors
- [ ] Build passes
- [ ] No breaking changes

**Phase 2:**
- [ ] Can create entities
- [ ] Can edit entities
- [ ] Can delete entities
- [ ] Forms validate
- [ ] Changes persist (session)
- [ ] UI updates immediately

**Phase 3:**
- [ ] All services functional
- [ ] Analytics accurate
- [ ] Settings work
- [ ] Financial operations work
- [ ] Ready for API integration
