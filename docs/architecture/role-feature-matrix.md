# Role-Based Feature Access Matrix

## Feature Access by Role

### Legend
- ✅ **Full Access**: Create, Read, Update, Delete
- 📖 **Read/Edit**: Read and Update (no delete)
- 👁️ **Read Only**: View only
- ✏️ **Create/Read Own**: Create new, read own records
- 🔒 **Self Only**: Access to own data only
- ❌ **No Access**: Not available to this role

---

## Detailed Access Matrix

| Module | Feature | Admin | Supervisor | Worker | Client |
|--------|---------|-------|------------|--------|--------|
| **Client Management** |
| | View All Clients | ✅ | ✅ | 👁️ | ❌ |
| | Create Client | ✅ | ✅ | ❌ | ❌ |
| | Edit Client | ✅ | ✅ | ❌ | ❌ |
| | Delete Client | ✅ | ❌ | ❌ | ❌ |
| | View Client History | ✅ | ✅ | 👁️ (Assigned) | 🔒 |
| | Edit Own Profile | ✅ | ✅ | ✅ | 🔒 |
| **Requests** |
| | View All Requests | ✅ | ✅ | 👁️ (Assigned) | 🔒 |
| | Create Request | ✅ | ✅ | ❌ | ✏️ |
| | Approve/Reject Request | ✅ | ✅ | ❌ | ❌ |
| | Assign Request | ✅ | ✅ | ❌ | ❌ |
| | Update Request Status | ✅ | ✅ | ✏️ (Assigned) | ✏️ (Own) |
| | Cancel Request | ✅ | ✅ | ❌ | ✏️ (Own) |
| **Jobs & Quotes** |
| | View All Quotes/Jobs | ✅ | ✅ | 👁️ (Assigned) | 🔒 |
| | Create Quote | ✅ | ✅ | ❌ | ❌ |
| | Edit Quote | ✅ | ✅ | ❌ | ❌ |
| | Send Quote | ✅ | ✅ | ❌ | ❌ |
| | Accept/Reject Quote | ✅ | ❌ | ❌ | ✏️ (Own) |
| | Create Job | ✅ | ✅ | ❌ | ❌ |
| | Update Job Status | ✅ | ✅ | ✏️ (Assigned) | ❌ |
| **Scheduling** |
| | View All Schedules | ✅ | ✅ | 👁️ (Own) | 🔒 |
| | Create Appointment | ✅ | ✅ | ❌ | ✏️ (Request) |
| | Edit Appointment | ✅ | ✅ | ✏️ (Assigned) | ✏️ (Own) |
| | Assign Workers | ✅ | ✅ | ❌ | ❌ |
| | View Worker Availability | ✅ | ✅ | 👁️ | ❌ |
| | Request Time Off | ✅ | ✅ | ✏️ | ❌ |
| **Communication** |
| | Send Messages (All) | ✅ | ✅ | ✏️ (Limited) | ✏️ (To Company) |
| | View All Messages | ✅ | ✅ | 👁️ (Relevant) | 🔒 |
| | Configure Templates | ✅ | ✅ | ❌ | ❌ |
| | Notification Settings | ✅ | ✅ | ✅ | ✅ |
| **Financials** |
| | View All Financials | ✅ | ✅ | 👁️ (Own) | 🔒 |
| | Generate Invoice | ✅ | ✅ | ❌ | ❌ |
| | Process Payment | ✅ | ✅ | ❌ | ✏️ (Own) |
| | View Reports | ✅ | ✅ | ❌ | ❌ |
| | View Payment History | ✅ | ✅ | 👁️ (Own) | 🔒 |
| **Retention** |
| | View Retention Data | ✅ | ✅ | 👁️ | ❌ |
| | Create Campaigns | ✅ | ❌ | ❌ | ❌ |
| | Flag At-Risk Clients | ✅ | ✅ | ❌ | ❌ |
| | View Loyalty Points | ✅ | ✅ | ❌ | 🔒 |
| | Manage Referrals | ✅ | ✅ | ❌ | 🔒 |
| **Marketing** |
| | Manage Campaigns | ✅ | ✅ | ❌ | ❌ |
| | View Analytics | ✅ | ✅ | ❌ | ❌ |
| | Manage Leads | ✅ | ✅ | ❌ | ❌ |
| | Submit Testimonials | ✅ | ✅ | ❌ | ✏️ |
| | Share Referrals | ✅ | ✅ | ✅ | ✏️ |

---

## Role Capability Summary

### Admin Role
**Primary Functions:**
- Full system access and configuration
- User and role management
- Financial oversight and reporting
- Marketing campaign management
- System settings and integrations

**Key Modules:**
- ✅ All modules with full access
- ✅ System administration
- ✅ Analytics and reporting
- ✅ Configuration management

---

### Supervisor Role
**Primary Functions:**
- Team management and oversight
- Task and job assignment
- Client relationship management
- Operational reporting
- Quality control

**Key Modules:**
- ✅ Requests (Full)
- ✅ Jobs & Quotes (Full)
- ✅ Scheduling (Full)
- ✅ Client Management (Read/Edit)
- ✅ Communication (Full)
- ✅ Financials (Read/Generate)
- ✅ Retention (Read/Act)

---

### Worker Role
**Primary Functions:**
- Task execution and updates
- Schedule management
- Client interaction (limited)
- Time tracking
- Status reporting

**Key Modules:**
- ✅ Tasks (Read/Update Own)
- ✅ Scheduling (Read/Update Own)
- ✅ Communication (Send/Receive)
- ✅ Client Management (Read Only - Assigned)
- ✅ Financials (Read Own Time/Billing)

---

### Client Role
**Primary Functions:**
- Service requests
- Schedule viewing and requests
- Payment processing
- Communication with company
- Profile management

**Key Modules:**
- ✅ Requests (Create/Read Own)
- ✅ Jobs & Quotes (Read Own)
- ✅ Scheduling (Read Own)
- ✅ Financials (Read Own, Pay)
- ✅ Communication (Send/Receive)
- ✅ Client Management (Self Only)
- ✅ Retention (View Own Points)

---

## Permission Inheritance

```
Admin
  ├── All Supervisor permissions
  ├── All Worker permissions (view)
  └── System administration

Supervisor
  ├── All Worker permissions (view)
  └── Team management

Worker
  └── Own task management

Client
  └── Own data access
```

---

## Module Access Heatmap

| Module | Admin | Supervisor | Worker | Client |
|--------|:-----:|:----------:|:------:|:------:|
| Client Management | 🔥🔥🔥 | 🔥🔥 | 🔥 | 🔥 |
| Requests | 🔥🔥🔥 | 🔥🔥🔥 | 🔥 | 🔥🔥 |
| Jobs & Quotes | 🔥🔥🔥 | 🔥🔥🔥 | 🔥 | 🔥 |
| Scheduling | 🔥🔥🔥 | 🔥🔥🔥 | 🔥🔥 | 🔥🔥 |
| Communication | 🔥🔥🔥 | 🔥🔥🔥 | 🔥🔥 | 🔥🔥 |
| Financials | 🔥🔥🔥 | 🔥🔥 | 🔥 | 🔥🔥 |
| Retention | 🔥🔥🔥 | 🔥🔥 | - | 🔥 |
| Marketing | 🔥🔥🔥 | 🔥 | - | 🔥 |

**Legend:**
- 🔥🔥🔥 = Full Access
- 🔥🔥 = Significant Access
- 🔥 = Limited Access
- - = No Access

---

## Feature Gating Rules

### Client Management
- **Admin/Supervisor**: Can view all clients
- **Worker**: Can only view clients for assigned tasks
- **Client**: Can only view/edit own profile

### Requests
- **Admin/Supervisor**: Can approve/reject any request
- **Worker**: Can only update status of assigned requests
- **Client**: Can create and view own requests only

### Jobs & Quotes
- **Admin/Supervisor**: Can create and manage all quotes/jobs
- **Worker**: Can view and update assigned jobs
- **Client**: Can view and accept/reject own quotes

### Scheduling
- **Admin/Supervisor**: Can schedule any appointment
- **Worker**: Can view own schedule and request changes
- **Client**: Can view own appointments and request rescheduling

### Financials
- **Admin**: Full financial access
- **Supervisor**: Can generate invoices, view team financials
- **Worker**: Can view own time/billing
- **Client**: Can view invoices and make payments

### Communication
- **Admin/Supervisor**: Can message anyone
- **Worker**: Can message supervisors and assigned clients
- **Client**: Can message company support

### Retention
- **Admin**: Full retention management
- **Supervisor**: Can view metrics and flag at-risk clients
- **Worker**: Read-only access to indicators
- **Client**: Can view own loyalty points

### Marketing
- **Admin/Supervisor**: Can manage campaigns
- **Worker**: Can share referrals
- **Client**: Can submit testimonials and referrals
