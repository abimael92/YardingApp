# Module Dependencies & Data Flow

## Module Dependency Graph

```mermaid
graph TB
    Marketing[Marketing Module]
    ClientMgmt[Client Management]
    Requests[Requests Module]
    JobsQuotes[Jobs & Quotes]
    Scheduling[Scheduling Module]
    Financials[Financials Module]
    Communication[Communication Module]
    Retention[Retention Module]
    
    Marketing --> ClientMgmt
    ClientMgmt --> Requests
    ClientMgmt --> JobsQuotes
    ClientMgmt --> Financials
    ClientMgmt --> Retention
    Requests --> JobsQuotes
    JobsQuotes --> Scheduling
    JobsQuotes --> Financials
    Scheduling --> Communication
    Financials --> Communication
    Retention --> Communication
    Communication --> Marketing
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Requests
    participant JobsQuotes
    participant Scheduling
    participant Financials
    participant Communication
    
    Client->>Requests: Submit Service Request
    Requests->>Communication: Notify Admin/Supervisor
    Requests->>JobsQuotes: Convert to Quote
    JobsQuotes->>Communication: Send Quote to Client
    Client->>JobsQuotes: Accept Quote
    JobsQuotes->>Scheduling: Create Job & Schedule
    Scheduling->>Communication: Send Appointment Confirmation
    Scheduling->>Financials: Mark Job Complete
    Financials->>Communication: Send Invoice
    Client->>Financials: Make Payment
    Financials->>Communication: Send Payment Confirmation
```

## Module Interaction Matrix

| Module | Depends On | Provides To |
|--------|-----------|-------------|
| **Client Management** | None (Foundation) | Requests, Jobs & Quotes, Financials, Retention |
| **Requests** | Client Management | Jobs & Quotes, Scheduling |
| **Jobs & Quotes** | Client Management, Requests | Scheduling, Financials |
| **Scheduling** | Jobs & Quotes, Client Management | Financials, Communication |
| **Financials** | Jobs & Quotes, Client Management | Retention, Communication |
| **Communication** | All Modules | All Modules (Notification Hub) |
| **Retention** | Client Management, Financials, Scheduling | Communication, Marketing |
| **Marketing** | Client Management, Retention | Client Management (Leads) |

## Cross-Module Integration Points

### Communication Hub
- **Triggers from**: All modules
- **Sends to**: All roles (Admin, Supervisor, Worker, Client)
- **Channels**: Email, SMS, In-app, Push

### Client Management Hub
- **Used by**: All modules
- **Provides**: Client data, contact info, history
- **Central**: Single source of truth for client information

### Financials Integration
- **Receives from**: Jobs & Quotes (invoices), Scheduling (billable hours)
- **Provides to**: Retention (payment patterns), Reports (revenue)
