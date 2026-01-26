# Mock Data Strategy

## Overview

This document outlines the strategy for generating and managing mock data for development and testing.

## Principles

1. **Realistic Data**: Mock data should reflect real-world scenarios
2. **Reproducible**: Same seed produces same data
3. **Relatable**: Use realistic names, addresses, and scenarios
4. **Complete Relationships**: Mock data should maintain referential integrity
5. **Configurable**: Easy to adjust data volume and complexity

## Mock Data Structure

```
src/data/
├── mocks/
│   ├── generators/
│   │   ├── clientGenerator.ts
│   │   ├── jobGenerator.ts
│   │   ├── quoteGenerator.ts
│   │   ├── employeeGenerator.ts
│   │   ├── scheduleGenerator.ts
│   │   ├── paymentGenerator.ts
│   │   └── communicationGenerator.ts
│   ├── seeds/
│   │   ├── clients.ts
│   │   ├── employees.ts
│   │   └── services.ts
│   ├── factories/
│   │   └── entityFactory.ts
│   └── index.ts
└── mockData.ts (legacy - to be migrated)
```

## Generator Pattern

Each generator should:

1. Accept configuration (count, options)
2. Use seed data for consistency
3. Generate related entities
4. Maintain referential integrity
5. Return typed entities

### Example: Client Generator

```typescript
// src/data/mocks/generators/clientGenerator.ts
import type { Client, EntityId } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"
import { faker } from "@faker-js/faker"

interface ClientGeneratorOptions {
  count: number
  seed?: number
  includeRelationships?: boolean
}

export function generateClients(
  options: ClientGeneratorOptions
): Client[] {
  if (options.seed) {
    faker.seed(options.seed)
  }

  return Array.from({ length: options.count }, (_, index) => {
    const id = `client-${index + 1}`
    return generateClient(id, options)
  })
}

function generateClient(id: EntityId, options: ClientGeneratorOptions): Client {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    contactInfo: {
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      preferredContactMethod: faker.helpers.arrayElement(["email", "phone", "sms"]),
    },
    primaryAddress: {
      street: faker.location.streetAddress(),
      city: "Phoenix",
      state: "AZ",
      zipCode: faker.location.zipCode("#####"),
    },
    status: faker.helpers.arrayElement(Object.values(ClientStatus)),
    segment: faker.helpers.arrayElement(Object.values(ClientSegment)),
    totalSpent: {
      amount: faker.number.float({ min: 0, max: 50000, precision: 0.01 }),
      currency: "USD",
    },
    lifetimeValue: {
      amount: faker.number.float({ min: 0, max: 100000, precision: 0.01 }),
      currency: "USD",
    },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: [],
    paymentIds: [],
    communicationIds: [],
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  }
}
```

## Relationship Generation

### Strategy: Generate in Order

1. **Clients** (no dependencies)
2. **Employees** (no dependencies)
3. **Quotes** (depends on Clients)
4. **Jobs** (depends on Clients, Quotes, Employees)
5. **Schedules** (depends on Jobs, Employees)
6. **Payments** (depends on Clients, Jobs)
7. **Communications** (depends on Clients, Employees, Jobs, Quotes)

### Example: Relationship Builder

```typescript
// src/data/mocks/factories/entityFactory.ts
import type {
  Client,
  Employee,
  Quote,
  Job,
  Schedule,
  Payment,
  Communication,
} from "@/src/domain/entities"

export class EntityFactory {
  private clients: Client[] = []
  private employees: Employee[] = []
  private quotes: Quote[] = []
  private jobs: Job[] = []
  private schedules: Schedule[] = []
  private payments: Payment[] = []
  private communications: Communication[] = []

  generate(options: {
    clients?: number
    employees?: number
    quotesPerClient?: number
    jobsPerQuote?: number
    // ... other options
  }) {
    // Generate in dependency order
    this.clients = generateClients({ count: options.clients ?? 10 })
    this.employees = generateEmployees({ count: options.employees ?? 5 })
    this.quotes = this.generateQuotes()
    this.jobs = this.generateJobs()
    this.schedules = this.generateSchedules()
    this.payments = this.generatePayments()
    this.communications = this.generateCommunications()

    return {
      clients: this.clients,
      employees: this.employees,
      quotes: this.quotes,
      jobs: this.jobs,
      schedules: this.schedules,
      payments: this.payments,
      communications: this.communications,
    }
  }

  private generateQuotes(): Quote[] {
    return this.clients.flatMap((client) => {
      const quoteCount = faker.number.int({ min: 0, max: 3 })
      return Array.from({ length: quoteCount }, () =>
        generateQuote(client.id)
      )
    })
  }

  // ... other generation methods
}
```

## Seed Data

### Static Seed Data

For consistent, realistic data:

```typescript
// src/data/mocks/seeds/clients.ts
export const seedClients = [
  {
    name: "Johnson Family",
    email: "johnson@example.com",
    address: {
      street: "1234 Desert View Dr",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
    },
  },
  // ... more seed clients
]

// src/data/mocks/seeds/employees.ts
export const seedEmployees = [
  {
    firstName: "Mike",
    lastName: "Rodriguez",
    role: EmployeeRole.WORKER,
    department: "Lawn Care",
  },
  // ... more seed employees
]
```

## Mock Data Scenarios

### Scenario 1: Happy Path
- Active clients with completed jobs
- All payments processed
- Positive communications

### Scenario 2: At-Risk Clients
- Clients with overdue payments
- Declined quotes
- No recent services

### Scenario 3: Complex Workflow
- Request → Quote → Job → Schedule → Payment
- Multiple revisions
- Rescheduled appointments

### Scenario 4: Edge Cases
- Cancelled jobs
- Refunded payments
- Expired quotes
- Inactive employees

## Usage in Development

### Development Mode

```typescript
// src/data/mocks/index.ts
import { EntityFactory } from "./factories/entityFactory"

const factory = new EntityFactory()

export const mockData = factory.generate({
  clients: 20,
  employees: 5,
  quotesPerClient: 2,
  jobsPerQuote: 0.7, // 70% conversion rate
})
```

### Testing

```typescript
// tests/fixtures/entities.ts
import { EntityFactory } from "@/src/data/mocks/factories/entityFactory"

export function createTestData(seed: number = 12345) {
  const factory = new EntityFactory()
  faker.seed(seed)
  return factory.generate({
    clients: 10,
    employees: 3,
  })
}
```

## Tools & Libraries

### Recommended

- **@faker-js/faker**: Generate realistic fake data
- **uuid**: Generate unique IDs
- **date-fns**: Date manipulation for timestamps

### Example Package.json Addition

```json
{
  "devDependencies": {
    "@faker-js/faker": "^8.0.0",
    "uuid": "^9.0.0"
  }
}
```

## Data Volume Recommendations

| Environment | Clients | Employees | Jobs | Quotes |
|------------|---------|-----------|------|--------|
| Development | 20-50 | 5-10 | 50-100 | 30-60 |
| Testing | 10-20 | 3-5 | 20-40 | 15-30 |
| Demo | 100+ | 10+ | 200+ | 150+ |

## Migration Plan

1. **Phase 1**: Create generators for new entities
2. **Phase 2**: Create factory for relationship generation
3. **Phase 3**: Migrate existing mockData.ts to use generators
4. **Phase 4**: Add scenario-based data generation
5. **Phase 5**: Add seed data for consistency

## Best Practices

1. **Never mutate seed data** - Always create copies
2. **Use consistent IDs** - Format: `{entity-type}-{index}`
3. **Maintain relationships** - Update related entity IDs
4. **Validate generated data** - Use Zod schemas
5. **Document scenarios** - Comment complex generation logic
