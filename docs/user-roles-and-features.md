# User Roles and Features

This document provides a comprehensive list of all user types in the application and the features available to each role.

---

## User Roles Overview

The application supports **4 user roles**:

1. **Admin** - Full system access and management
2. **Client** - Service customers who request and pay for services
3. **Supervisor** - Team managers who oversee workers and tasks
4. **Worker** - Field employees who perform the actual work

---

## 1. Admin Role

**Purpose**: Complete system administration and management

**Access Level**: Full system access

### Features

#### Dashboard (`/admin`)
- **System Overview**
  - Total revenue statistics
  - Active clients count
  - Team members count
  - Active tasks overview
- **Revenue Charts**
  - Monthly revenue trends (6 months)
  - Service distribution pie chart
  - Performance metrics (efficiency & satisfaction)
- **Recent Users Table**
  - Last 4 users who joined
  - User details (name, email, role, join date)
- **System Health**
  - Status indicators (healthy/warning/critical)
  - System alerts and notifications

#### User Management (`/admin/users`)
- **View All Users**
  - Complete list of all system users
  - Filter by role, status
  - Search functionality
- **Create Users**
  - Add new users to the system
  - Assign roles (Admin, Client, Supervisor, Worker)
  - Set status (Active, Pending, Inactive)
- **Edit Users**
  - Update user information
  - Change roles and permissions
  - Modify user status
- **Delete Users**
  - Remove users from system
  - Confirmation required
- **View User Details**
  - Complete user profile information
  - Activity history

#### Client Management (`/admin/clients`)
- **View All Clients**
  - Complete client directory
  - Client contact information
  - Service history per client
- **Create Clients**
  - Add new clients
  - Enter contact details (name, email, phone, address)
  - Set client status
- **Edit Clients**
  - Update client information
  - Modify contact details
  - Update service preferences
- **Delete Clients**
  - Remove clients from system
  - Confirmation required
- **View Client Details**
  - Complete client profile
  - Service history
  - Payment history
  - Job history

#### Employee Management (`/admin/employees`)
- **View All Employees**
  - Complete employee directory
  - Employee roles and departments
  - Performance metrics (ratings, completed jobs)
- **Create Employees**
  - Add new employees
  - Set role (Worker, Supervisor)
  - Assign department
  - Set hire date
- **Edit Employees**
  - Update employee information
  - Change roles and departments
  - Update status (Active, Inactive, On Leave, Terminated)
- **Delete Employees**
  - Remove employees from system
  - Confirmation required
- **View Employee Details**
  - Complete employee profile
  - Performance metrics
  - Job history
  - Availability schedule

#### Job Management (`/admin/jobs`)
- **View All Jobs**
  - Complete job/work order list
  - Job status tracking
  - Client and employee assignments
- **Create Jobs**
  - Create new work orders
  - Assign to clients
  - Assign employees
  - Set priority and status
  - Add job details (title, description, address)
  - Set pricing (quoted price, estimated cost)
- **Edit Jobs**
  - Update job information
  - Change assignments
  - Update status and priority
  - Modify pricing
- **Delete Jobs**
  - Remove jobs from system
  - Confirmation required
- **View Job Details**
  - Complete job information
  - Task breakdown
  - Financial details
  - Scheduling information
  - Assigned employees

#### Task Overview (`/admin/tasks`)
- **View All Tasks**
  - Legacy view of tasks (converted from Jobs)
  - Task status tracking
  - Employee assignments
  - Due dates and locations
- **Read-Only Access**
  - View task details
  - No create/edit/delete (use Jobs instead)

#### Analytics (`/admin/analytics`)
- **Advanced Analytics** (Pending Implementation)
  - Revenue analytics
  - User activity charts
  - Service performance metrics
  - Time-based trends
  - Custom reports

#### Settings (`/admin/settings`)
- **System Configuration** (Pending Implementation)
  - Company information
  - System preferences
  - Notification settings
  - User permissions
  - Integration settings
  - Security settings

### Permissions
- ✅ Full CRUD on all entities (Users, Clients, Employees, Jobs)
- ✅ View all system data
- ✅ Manage system settings
- ✅ Access analytics and reports
- ✅ Manage user permissions

---

## 2. Client Role

**Purpose**: Service customers who request and pay for landscaping services

**Access Level**: Self-service portal for their own data

### Features

#### Dashboard (`/client`)
- **Personal Overview**
  - Active services count
  - Upcoming appointments
  - Recent activity
  - Spending summary
- **Monthly Spending Chart**
  - Visual representation of spending over time
- **Property Overview**
  - Property details
  - Service history summary

#### My Services (`/client/services`)
- **Browse Available Services**
  - View all available landscaping services
  - Service descriptions and pricing
  - Service categories
  - Service cards with images
- **Service History**
  - View past and current services
  - Service status tracking
  - Job details for each service
  - Scheduled dates
  - Pricing information

#### Schedule (`/client/schedule`)
- **View Scheduled Services**
  - Calendar-style schedule view
  - Upcoming appointments
  - Past appointments
  - Service details per appointment
- **Appointment Information**
  - Date and time
  - Service type
  - Location/address
  - Status (Scheduled, In Progress, Completed, Cancelled)
  - Notes and special instructions

#### Billing (`/client/billing`)
- **Payment History**
  - Complete payment history table
  - Payment details (amount, method, date, status)
  - Payment number tracking
- **Summary Cards**
  - Total Paid (all completed payments)
  - Pending Amount (outstanding payments)
  - Total Payments count
- **Payment Status**
  - Completed payments
  - Pending payments
  - Failed payments
  - Refunded payments

### Permissions
- ✅ View own service history
- ✅ View own schedule
- ✅ View own billing/payment history
- ✅ Browse available services
- ❌ Cannot create/edit/delete jobs
- ❌ Cannot access other users' data
- ❌ Cannot manage employees
- ❌ Cannot access system settings

---

## 3. Supervisor Role

**Purpose**: Team managers who oversee workers and coordinate tasks

**Access Level**: Team and task management

### Features

#### Dashboard (`/supervisor`)
- **Team Overview**
  - Active workers count
  - Tasks today
  - Team efficiency metrics
  - Issues reported
- **Performance Charts**
  - Weekly task completion
  - Task status distribution
  - Team performance trends

#### Team Overview (`/supervisor/team`)
- **View Team Members**
  - List of all workers under supervision
  - Worker status (available, busy, offline)
  - Worker performance metrics
  - Worker cards with details

#### Task Management (`/supervisor/tasks`)
- **View All Tasks**
  - Tasks assigned to team members
  - Task status tracking
  - Priority management
  - Due dates
- **Task Assignment**
  - Assign tasks to workers
  - Reassign tasks
  - Update task status
  - Set priorities

#### Analytics (`/supervisor/analytics`)
- **Team Analytics**
  - Team performance metrics
  - Task completion rates
  - Efficiency trends
  - Worker productivity

#### Schedule (`/supervisor/schedule`)
- **Team Schedule**
  - View team member schedules
  - Task scheduling
  - Calendar view of assignments
  - Schedule optimization

### Permissions
- ✅ View and manage team members
- ✅ View and assign tasks
- ✅ View team analytics
- ✅ Manage team schedules
- ✅ Update task statuses
- ❌ Cannot manage clients
- ❌ Cannot manage system users
- ❌ Cannot access system settings
- ❌ Cannot view all jobs (only team-related)

---

## 4. Worker Role

**Purpose**: Field employees who perform the actual landscaping work

**Access Level**: Personal task and schedule management

### Features

#### Dashboard (`/worker`)
- **Personal Overview**
  - Today's tasks count
  - Completed tasks this week
  - Hours logged
  - Efficiency rating
- **Task Cards**
  - Assigned tasks display
  - Task details
  - Quick status updates

#### My Tasks (`/worker/tasks`)
- **View Assigned Tasks**
  - Personal task list
  - Task details (title, description, location)
  - Task status (pending, in-progress, completed)
  - Priority levels
  - Due dates
- **Task Management**
  - Update task status
  - Mark tasks as completed
  - View task details
  - View task location

#### Schedule (`/worker/schedule`)
- **Personal Schedule**
  - Daily/weekly schedule view
  - Assigned tasks calendar
  - Time slots
  - Location information

#### Map View (`/worker/map`)
- **Geographic View**
  - Map display of task locations
  - Route planning
  - Location markers
  - Navigation assistance

### Permissions
- ✅ View own assigned tasks
- ✅ Update own task status
- ✅ View own schedule
- ✅ View map of task locations
- ❌ Cannot assign tasks to others
- ❌ Cannot view other workers' tasks
- ❌ Cannot manage clients
- ❌ Cannot access team management
- ❌ Cannot view analytics
- ❌ Cannot access system settings

---

## Feature Comparison Matrix

| Feature | Admin | Client | Supervisor | Worker |
|---------|-------|--------|------------|--------|
| **Dashboard** | ✅ Full System | ✅ Personal | ✅ Team | ✅ Personal |
| **User Management** | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Client Management** | ✅ Full CRUD | ❌ | ❌ | ❌ |
| **Employee Management** | ✅ Full CRUD | ❌ | ✅ View Team | ❌ |
| **Job Management** | ✅ Full CRUD | ❌ | ✅ View Team Jobs | ❌ |
| **Task Management** | ✅ View All | ❌ | ✅ Manage Team | ✅ Own Tasks |
| **Service Browsing** | ✅ | ✅ | ❌ | ❌ |
| **Schedule View** | ✅ All | ✅ Own | ✅ Team | ✅ Own |
| **Billing/Payments** | ✅ All | ✅ Own | ❌ | ❌ |
| **Analytics** | ✅ Full | ❌ | ✅ Team | ❌ |
| **Map View** | ✅ | ❌ | ✅ | ✅ |
| **Settings** | ✅ System | ❌ | ❌ | ❌ |
| **Create Jobs** | ✅ | ❌ | ❌ | ❌ |
| **Assign Tasks** | ✅ | ❌ | ✅ | ❌ |
| **Update Task Status** | ✅ | ❌ | ✅ | ✅ Own Only |

---

## Navigation Structure by Role

### Admin Navigation
- Dashboard
- Analytics
- User Management
- Clients
- Employees
- Jobs
- Task Overview
- Settings

### Client Navigation
- Dashboard
- My Services
- Schedule
- Billing

### Supervisor Navigation
- Dashboard
- Team Overview
- Task Management
- Analytics
- Schedule

### Worker Navigation
- Dashboard
- My Tasks
- Schedule
- Map View

---

## Login Credentials (Mock)

For testing purposes, the following mock credentials are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | josue.garcia@jjdesertlandscaping.com | Desert2025! |
| Client | client@client.com | Arizona2025! |
| Supervisor | supervisor@supervisor.com | Arizona2025! |
| Worker | worker@worker.com | Arizona2025! |

---

## Role Hierarchy

```
Admin (Highest)
  ├── Full system access
  ├── Can manage all users
  └── Can configure system

Supervisor
  ├── Can manage team
  ├── Can assign tasks
  └── Can view team analytics

Worker
  ├── Can view own tasks
  ├── Can update task status
  └── Can view schedule

Client (Lowest)
  ├── Can view own services
  ├── Can view own billing
  └── Can view own schedule
```

---

## Implementation Status

✅ **Fully Implemented**:
- Admin: Dashboard, Users, Clients, Employees, Jobs, Tasks
- Client: Dashboard, Services, Schedule, Billing
- Supervisor: Dashboard (basic)
- Worker: Dashboard (basic)

⏳ **Partially Implemented**:
- Supervisor: Team, Tasks, Analytics, Schedule (routes exist, need UI)
- Worker: Tasks, Schedule, Map (routes exist, need UI)

📋 **Pending Implementation**:
- Admin: Analytics (dedicated page), Settings (dedicated page)
- Supervisor: Full team management UI
- Worker: Full task management UI

---

## Notes

- All roles have role-based access control (RBAC) via `RoleGate` component
- Routes are protected and redirect to login if unauthorized
- Mock authentication is currently in place (cookie-based)
- All data is currently using mock data from `mockStore`
- Services are API-ready and can be swapped with real API calls
