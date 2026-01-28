# Collapsible Dropdown Navbar Implementation

## Overview

The sidebar has been transformed into a collapsible dropdown navbar for admin users, while maintaining the simple navigation structure for other roles (worker, supervisor, client).

## Key Features

### ✅ Collapsible Dropdowns
- Each main category (ADMINISTRATION, USER MANAGEMENT, OPERATIONS, FINANCIAL) is a dropdown button
- Only one dropdown can be open at a time
- Smooth expand/collapse animations using Framer Motion
- Auto-opens dropdown when navigating to a page within that section

### ✅ Responsive Design
- Works seamlessly on both desktop and mobile
- Mobile overlay for sidebar
- Touch-friendly interactions

### ✅ Accessibility
- Proper ARIA attributes (`aria-expanded`, `aria-controls`)
- Keyboard navigation support
- Screen reader friendly

### ✅ Active Page Highlighting
- Current page is clearly highlighted
- Parent dropdown is automatically opened when on a child page
- Visual indicators for active states

## Components Created

### 1. NavDropdown Component
**File**: `src/shared/ui/NavDropdown.tsx`

- Reusable dropdown component for navigation sections
- Smooth animations with Framer Motion
- Handles icon display, badges, and active states
- Fully accessible with ARIA attributes

### 2. Updated Sidebar Component
**File**: `src/shared/ui/Sidebar.tsx`

- Conditional rendering: dropdowns for admin, simple nav for others
- State management for tracking open dropdown
- Auto-opens relevant dropdown based on current route
- Maintains all existing functionality

## Admin Navigation Structure

### ADMINISTRATION
- Dashboard (`/admin`)
- Analytics (`/admin/analytics`)
- Settings (`/admin/settings`)

### USER MANAGEMENT
- System Users (`/admin/users`)
- Clients (`/admin/clients`)
- Employees (`/admin/employees`)

### OPERATIONS
- Jobs (`/admin/jobs`) - with badge count
- Tasks (`/admin/tasks`)
- Schedule (`/admin/schedule`)
- Quotes (`/admin/quotes`)

### FINANCIAL
- Payments (`/admin/payments`)
- Invoices (`/admin/invoices`)
- Reports (`/admin/reports`)

## Page Components Created

### 1. Analytics Page
**File**: `src/features/admin/analytics/ui/AnalyticsPage.tsx`
- Revenue trends chart
- Service revenue breakdown
- Crew performance metrics
- Seasonal demand forecasting
- Job completion and client retention rates

### 2. Settings Page
**File**: `src/features/admin/settings/ui/SettingsPage.tsx`
- Tabbed interface for different settings categories
- Company information
- Billing preferences
- Notification settings
- Integration setup
- Email templates

### 3. Quotes Page
**File**: `src/features/admin/quotes/ui/QuotesPage.tsx`
- Quote management table
- Summary cards (total quotes, pending, conversion rate)
- Status badges
- Create quote functionality

### 4. Invoices Page
**File**: `src/features/admin/invoices/ui/InvoicesPage.tsx`
- Invoice management table
- Summary cards (outstanding, total paid, overdue, pending)
- Status tracking
- Create invoice functionality

### 5. Payments Page
**File**: `src/features/admin/payments/ui/PaymentsPage.tsx`
- Payment processing dashboard
- Summary cards (total paid, outstanding, total payments)
- Payment history table
- Status tracking

### 6. Reports Page
**File**: `src/features/admin/reports/ui/ReportsPage.tsx`
- Profit & Loss statements
- Accounts receivable aging
- Revenue by service type
- Client profitability analysis
- Expense breakdown
- Year-over-year comparisons

## Mock Data Services

### 1. Analytics Service
**File**: `src/services/analyticsService.ts`
- Revenue trends
- Service revenue breakdown
- Crew performance
- Seasonal forecasting
- Service area data
- Completion and retention rates

### 2. Quote Service
**File**: `src/services/quoteService.ts`
- Quote management
- Quote templates
- Conversion tracking
- Pending quotes

### 3. Invoice Service
**File**: `src/services/invoiceService.ts`
- Invoice management
- Status tracking
- Outstanding balances
- Payment tracking

### 4. Reports Service
**File**: `src/services/reportsService.ts`
- Profit & Loss data
- Accounts receivable aging
- Revenue by service
- Client profitability
- Crew productivity
- Expense categories
- Year-over-year comparisons

## Implementation Details

### State Management
```typescript
const [openDropdown, setOpenDropdown] = useState<string | null>(null)

const handleDropdownToggle = (sectionKey: string) => {
  setOpenDropdown(openDropdown === sectionKey ? null : sectionKey)
}
```

### Auto-Open Logic
```typescript
useEffect(() => {
  if (userRole === "admin") {
    const adminSections = [
      { key: "ADMINISTRATION", paths: ["/admin", "/admin/analytics", "/admin/settings"] },
      { key: "USER MANAGEMENT", paths: ["/admin/users", "/admin/clients", "/admin/employees"] },
      { key: "OPERATIONS", paths: ["/admin/jobs", "/admin/tasks", "/admin/schedule", "/admin/quotes"] },
      { key: "FINANCIAL", paths: ["/admin/payments", "/admin/invoices", "/admin/reports"] },
    ]
    const currentSection = adminSections.find((section) =>
      section.paths.some((path) => pathname.startsWith(path))
    )
    if (currentSection && openDropdown !== currentSection.key) {
      setOpenDropdown(currentSection.key)
    }
  }
}, [pathname, userRole, openDropdown])
```

### Animation Configuration
- **Duration**: 0.2s for smooth transitions
- **Easing**: easeInOut for natural feel
- **Height animation**: Auto height for content flexibility
- **Opacity**: Fade in/out for smooth appearance

## Styling

- Consistent with existing design system
- Dark mode support
- Primary color scheme for active states
- Hover effects for better UX
- Responsive spacing and typography

## Testing Checklist

- ✅ Dropdown opens/closes on click
- ✅ Only one dropdown open at a time
- ✅ Auto-opens when navigating to child page
- ✅ Active page highlighting works
- ✅ Mobile responsive
- ✅ Keyboard navigation
- ✅ Screen reader accessible
- ✅ Smooth animations
- ✅ Other roles see simple nav

## Future Enhancements

- [ ] Add keyboard shortcuts for navigation
- [ ] Persist dropdown state in localStorage
- [ ] Add search functionality within dropdowns
- [ ] Add tooltips for icons
- [ ] Add notification badges to categories
- [ ] Add recent pages quick access

## Files Modified/Created

### New Files
- `src/shared/ui/NavDropdown.tsx`
- `src/features/admin/analytics/ui/AnalyticsPage.tsx`
- `src/features/admin/settings/ui/SettingsPage.tsx`
- `src/features/admin/quotes/ui/QuotesPage.tsx`
- `src/features/admin/invoices/ui/InvoicesPage.tsx`
- `src/features/admin/payments/ui/PaymentsPage.tsx`
- `src/features/admin/reports/ui/ReportsPage.tsx`
- `src/services/analyticsService.ts`
- `src/services/quoteService.ts`
- `src/services/invoiceService.ts`
- `src/services/reportsService.ts`
- `app/(dashboard)/admin/quotes/page.tsx`
- `app/(dashboard)/admin/invoices/page.tsx`
- `app/(dashboard)/admin/reports/page.tsx`
- `app/(dashboard)/admin/payments/page.tsx`

### Modified Files
- `src/shared/ui/Sidebar.tsx`
- `app/(dashboard)/admin/analytics/page.tsx`
- `app/(dashboard)/admin/settings/page.tsx`

## Usage

The dropdown navbar is automatically active for admin users. No additional configuration needed. Simply navigate to any admin page and the relevant dropdown will automatically open.

For other roles (worker, supervisor, client), the simple navigation structure remains unchanged.
