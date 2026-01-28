# Admin Pages Specification

This document describes what should be displayed on each admin page.

## Overview

All admin pages follow a consistent layout:
- **Sidebar**: Navigation menu on the left
- **Header**: Page title and description at the top
- **Breadcrumbs**: Navigation breadcrumb trail
- **Main Content**: Page-specific content area

---

## 1. Admin Dashboard (`/admin`)

**Purpose**: Overview and system statistics

**Content**:
- **Stats Cards** (4 cards):
  - Total Revenue (with pending revenue)
  - Active Clients (with total clients count)
  - Team Members (with total employees count)
  - Active Tasks (with completed tasks count)

- **Revenue Chart**: Monthly revenue line chart (last 6 months + current)

- **Service Distribution**: Pie chart showing service types breakdown

- **Performance Metrics**: Weekly efficiency and satisfaction chart

- **Recent Users Table**: Last 4 users who joined (Name, Email, Role, Join Date)

- **System Health**: Status indicator (healthy/warning/critical)

- **System Alerts**: List of recent system alerts/notifications

---

## 2. Users Management (`/admin/users`)

**Purpose**: Manage all system users

**Content**:
- **Header**: 
  - Title: "Users"
  - Description: "Manage all system users"
  - Action Button: "Add User" (green button with plus icon)

- **Data Table** with columns:
  - Name (bold)
  - Email
  - Role (color-coded: Admin=purple, Supervisor=blue, Worker=green, Client=gray)
  - Status (badge: Active=green, Pending=yellow, Inactive=gray)
  - Join Date (formatted)

- **Actions per row**:
  - View (eye icon) - Opens detail modal
  - Edit (pencil icon) - Opens edit form modal
  - Delete (trash icon) - Confirms and deletes

- **Modals**:
  - **User Form**: Create/Edit user (Name, Email, Role, Status)
  - **User Detail**: View-only detailed information

- **Empty State**: "No users found. Create your first user to get started."

---

## 3. Clients Management (`/admin/clients`)

**Purpose**: Manage all clients

**Content**:
- **Header**:
  - Title: "Clients"
  - Description: "Manage all clients"
  - Action Button: "Add Client" (green button with plus icon)

- **Data Table** with columns:
  - Name (bold)
  - Email
  - Phone
  - Address (formatted)
  - Status (badge)
  - Total Spent (currency formatted)

- **Actions per row**:
  - View (eye icon) - Opens detail modal
  - Edit (pencil icon) - Opens edit form modal
  - Delete (trash icon) - Confirms and deletes

- **Modals**:
  - **Client Form**: Create/Edit client (Name, Email, Phone, Address fields, Status)
  - **Client Detail**: View-only detailed information including service history

- **Empty State**: "No clients found. Create your first client to get started."

---

## 4. Employees Management (`/admin/employees`)

**Purpose**: Manage all employees/workers

**Content**:
- **Header**:
  - Title: "Employees"
  - Description: "Manage all employees"
  - Action Button: "Add Employee" (green button with plus icon)

- **Data Table** with columns:
  - Employee (avatar image + display name)
  - Department
  - Role (capitalized)
  - Status (badge: Active=green, Inactive=gray, On Leave=yellow, Terminated=red)
  - Rating (with star icon)
  - Completed Jobs (count)

- **Actions per row**:
  - View (eye icon) - Opens detail modal
  - Edit (pencil icon) - Opens edit form modal
  - Delete (trash icon) - Confirms and deletes

- **Modals**:
  - **Employee Form**: Create/Edit employee (First Name, Last Name, Display Name, Email, Phone, Role, Status, Department, Hire Date)
  - **Employee Detail**: View-only detailed information including performance metrics

- **Empty State**: "No employees found. Create your first employee to get started."

---

## 5. Jobs Management (`/admin/jobs`)

**Purpose**: Manage all jobs/work orders

**Content**:
- **Header**:
  - Title: "Jobs"
  - Description: "Manage all jobs and work orders"
  - Action Button: "Create Job" (green button with plus icon)

- **Data Table** with columns:
  - Job (Job Number + Title)
  - Client (client name from clientId)
  - Status (badge: Draft=gray, Quoted=blue, Scheduled=yellow, In Progress=purple, Completed=green, Cancelled=red, On Hold=orange)
  - Priority (color-coded: Low=green, Medium=yellow, High=red, Urgent=red bold)
  - Quoted Price (currency formatted)
  - Scheduled (scheduled start date or "Not scheduled")

- **Actions per row**:
  - View (eye icon) - Opens detail modal
  - Edit (pencil icon) - Opens edit form modal
  - Delete (trash icon) - Confirms and deletes

- **Modals**:
  - **Job Form**: Create/Edit job (Client selection, Title, Description, Status, Priority, Address fields, Estimated Duration, Estimated Cost, Quoted Price, Employee assignment multi-select)
  - **Job Detail**: View-only detailed information including tasks, financial info, scheduling, and assigned employees

- **Empty State**: "No jobs found. Create your first job to get started."

---

## 6. Tasks Overview (`/admin/tasks`)

**Purpose**: Legacy view of tasks (converted from Jobs)

**Content**:
- **Header**:
  - Title: "Tasks"
  - Description: "View all tasks (legacy view - Jobs are the primary entity)"
  - No action button (read-only)

- **Data Table** with columns:
  - Task (Title + Description)
  - Assigned To (employee name or "Unassigned")
  - Status (badge: pending=yellow, in-progress=blue, completed=green, cancelled=red)
  - Priority (color-coded: low=green, medium=yellow, high=red)
  - Due Date (formatted)
  - Location (address)

- **Actions per row**:
  - View only (read-only view)

- **Empty State**: "No tasks found."

**Note**: This is a read-only view. Tasks are converted from Jobs for backward compatibility.

---

## 7. Analytics (`/admin/analytics`)

**Purpose**: Advanced analytics and reporting

**Content**: (Currently shows AdminDashboard - needs dedicated implementation)
- Revenue analytics
- User activity charts
- Service performance metrics
- Time-based trends

---

## 8. Settings (`/admin/settings`)

**Purpose**: System configuration

**Content**: (Currently shows AdminDashboard - needs dedicated implementation)
- Company information
- System preferences
- Notification settings
- User permissions
- Integration settings

---

## Common Features Across All Pages

### Loading States
- Spinner with message: "Loading [resource]..."
- Shown while data is being fetched

### Empty States
- Icon
- Title: "No [resource] found"
- Message: Contextual message
- Optional action button (e.g., "Create your first [resource]")

### Error Handling
- Console error logging
- User-friendly error messages
- Retry functionality where appropriate

### Data Table Features
- Sorting (if implemented)
- Pagination (if implemented)
- Search/Filter (if implemented)
- Responsive design

### Form Modals
- Title: "Create New [Resource]" or "Edit [Resource]"
- Form fields with validation
- Cancel button (left)
- Submit button (right): "Create"/"Update" or "Save"
- Loading state during submission

### Detail Modals
- Title: "[Resource] Details"
- Read-only information display
- Close button only
- Formatted data (dates, currency, etc.)

---

## Navigation Structure

All admin pages are accessible via:
- **Sidebar menu** (persistent navigation)
- **Breadcrumbs** (shows current location)
- **Direct URL** (e.g., `/admin/users`)

---

## Status Badge Colors

### User Status
- **Active**: Green
- **Pending**: Yellow
- **Inactive**: Gray

### Employee Status
- **Active**: Green
- **Inactive**: Gray
- **On Leave**: Yellow
- **Terminated**: Red

### Job Status
- **Draft**: Gray
- **Quoted**: Blue
- **Scheduled**: Yellow
- **In Progress**: Purple
- **Completed**: Green
- **Cancelled**: Red
- **On Hold**: Orange

### Task Status
- **Pending**: Yellow
- **In Progress**: Blue
- **Completed**: Green
- **Cancelled**: Red

---

## Priority Colors

- **Low**: Green
- **Medium**: Yellow
- **High**: Red
- **Urgent**: Red (bold)

---

## Implementation Status

✅ **Implemented**:
- Admin Dashboard
- Users Management (Full CRUD)
- Clients Management (Full CRUD)
- Employees Management (Full CRUD)
- Jobs Management (Full CRUD)
- Tasks Overview (Read-only)

⏳ **Pending**:
- Analytics (dedicated page)
- Settings (dedicated page)
