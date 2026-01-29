/**
 * Mock Data Store
 *
 * Centralized in-memory data store for development and testing.
 * J&J Desert Landscaping Invoice System: Invoice types, demo data, invoice settings.
 */

import type { User } from "@/src/domain/models"
import type {
  Employee,
  Client,
  Job,
  Payment,
  Schedule,
  Quote,
  Communication,
} from "@/src/domain/entities"
import { ClientStatus, ClientSegment, EmployeeRole, EmployeeStatus } from "@/src/domain/entities"

// -----------------------------------------------------------------------------
// Invoice types (J&J Desert Landscaping Invoice System)
// -----------------------------------------------------------------------------

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  jobId?: string
  status: InvoiceStatus
  amount: number
  tax: number
  total: number
  dueDate: string
  sentDate?: string
  paidDate?: string
  createdAt: string
  lineItems: InvoiceItem[]
  notes?: string
}

export interface InvoiceSettings {
  taxRate: number
  companyName: string
  companyAddress?: string
  companyEmail: string
  companyPhone: string
}

/** Calculation history entry for job cost calculator (formula: labor + materials + visits × zone × 1.086) */
export interface CalculationHistoryEntry {
  id: string
  timestamp: string
  jobId: string
  jobNumber: string
  clientId: string
  clientName: string
  inputs: {
    hours: number
    sqft: number
    visits: number
    zone: "residential" | "commercial"
    projectType: "maintenance" | "installation" | "repair"
  }
  breakdown: {
    labor: number
    materials: number
    visitFees: number
    subtotal: number
    tax: number
    total: number
  }
}

// Demo clients (match demo invoices: client-1 … client-4)
const DEMO_CLIENTS: Client[] = [
  {
    id: "client-1",
    name: "John Smith",
    contactInfo: {
      email: "john.smith@email.com",
      phone: "+1-602-555-0101",
      preferredContactMethod: "email",
    },
    primaryAddress: {
      street: "1234 Desert View Dr",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      country: "USA",
    },
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.REGULAR,
    totalSpent: { amount: 918, currency: "USD" },
    lifetimeValue: { amount: 918, currency: "USD" },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: ["job-1"],
    paymentIds: [],
    communicationIds: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "client-2",
    name: "Sarah Johnson",
    contactInfo: {
      email: "sarah.johnson@email.com",
      phone: "+1-602-555-0102",
      preferredContactMethod: "email",
    },
    primaryAddress: {
      street: "5678 Cactus Rd",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85002",
      country: "USA",
    },
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.VIP,
    totalSpent: { amount: 1296, currency: "USD" },
    lifetimeValue: { amount: 1296, currency: "USD" },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: ["job-2"],
    paymentIds: [],
    communicationIds: [],
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
  },
  {
    id: "client-3",
    name: "Mike Davis",
    contactInfo: {
      email: "mike.davis@email.com",
      phone: "+1-602-555-0103",
      preferredContactMethod: "phone",
    },
    primaryAddress: {
      street: "9012 Business Blvd",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85003",
      country: "USA",
    },
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.REGULAR,
    totalSpent: { amount: 702, currency: "USD" },
    lifetimeValue: { amount: 702, currency: "USD" },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: [],
    paymentIds: [],
    communicationIds: [],
    createdAt: "2025-12-20T00:00:00Z",
    updatedAt: "2025-12-28T00:00:00Z",
  },
  {
    id: "client-4",
    name: "Emily Wilson",
    contactInfo: {
      email: "emily.wilson@email.com",
      phone: "+1-602-555-0104",
      preferredContactMethod: "email",
    },
    primaryAddress: {
      street: "3456 Palm St",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85004",
      country: "USA",
    },
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.NEW,
    totalSpent: { amount: 0, currency: "USD" },
    lifetimeValue: { amount: 1026, currency: "USD" },
    serviceRequestIds: [],
    quoteIds: [],
    jobIds: ["job-4"],
    paymentIds: [],
    communicationIds: [],
    createdAt: "2025-01-25T00:00:00Z",
    updatedAt: "2025-01-25T00:00:00Z",
  },
]

// Demo invoice data array (seeded into store)
const DEMO_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2025-001",
    clientId: "client-1",
    clientName: "John Smith",
    jobId: "job-1",
    status: "paid",
    amount: 850.0,
    tax: 68.0,
    total: 918.0,
    dueDate: "2025-01-15T00:00:00Z",
    sentDate: "2025-01-01T10:00:00Z",
    paidDate: "2025-01-10T14:30:00Z",
    createdAt: "2025-01-01T10:00:00Z",
    lineItems: [
      { id: "li-1", description: "Weekly lawn maintenance (4 weeks)", quantity: 4, unitPrice: 75, total: 300 },
      { id: "li-2", description: "Fertilizer application", quantity: 1, unitPrice: 150, total: 150 },
      { id: "li-3", description: "Tree trimming", quantity: 1, unitPrice: 400, total: 400 },
    ],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2025-002",
    clientId: "client-2",
    clientName: "Sarah Johnson",
    jobId: "job-2",
    status: "sent",
    amount: 1200.0,
    tax: 96.0,
    total: 1296.0,
    dueDate: "2025-02-05T00:00:00Z",
    sentDate: "2025-01-20T09:00:00Z",
    createdAt: "2025-01-20T09:00:00Z",
    lineItems: [
      { id: "li-4", description: "Landscaping design", quantity: 1, unitPrice: 500, total: 500 },
      { id: "li-5", description: "Plant installation", quantity: 1, unitPrice: 700, total: 700 },
    ],
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2025-003",
    clientId: "client-3",
    clientName: "Mike Davis",
    status: "overdue",
    amount: 650.0,
    tax: 52.0,
    total: 702.0,
    dueDate: "2025-01-10T00:00:00Z",
    sentDate: "2025-12-28T11:00:00Z",
    createdAt: "2025-12-28T11:00:00Z",
    lineItems: [{ id: "li-6", description: "Irrigation repair", quantity: 1, unitPrice: 650, total: 650 }],
    notes: "Payment reminder sent",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2025-004",
    clientId: "client-4",
    clientName: "Emily Wilson",
    jobId: "job-4",
    status: "draft",
    amount: 950.0,
    tax: 76.0,
    total: 1026.0,
    dueDate: "2025-02-15T00:00:00Z",
    createdAt: "2025-01-25T15:00:00Z",
    lineItems: [{ id: "li-7", description: "Hardscaping - Patio", quantity: 1, unitPrice: 950, total: 950 }],
  },
]

// ============================================================================
// Mock Data Store (Read-Only for Phase 1)
// ============================================================================

class MockStore {
  // In-memory storage
  private users: User[] = []
  private employees: Employee[] = []
  private clients: Client[] = []
  private jobs: Job[] = []
  private payments: Payment[] = []
  private schedules: Schedule[] = []
  private quotes: Quote[] = []
  private communications: Communication[] = []
  private settings: Record<string, unknown> = {}
  private invoices: Invoice[] = []
  private invoiceSettings!: InvoiceSettings
  private calculationHistory: CalculationHistoryEntry[] = []

  constructor() {
    this.initializeSeedData()
  }

  // ============================================================================
  // Read-Only Accessors (Phase 1)
  // ============================================================================

  // Users
  getUsers(): User[] {
    return [...this.users] // Return copy to prevent mutations
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUsersByRole(role: User["role"]): User[] {
    return this.users.filter((u) => u.role === role)
  }

  getUsersByStatus(status: User["status"]): User[] {
    return this.users.filter((u) => u.status === status)
  }

  // Employees
  getEmployees(): Employee[] {
    return [...this.employees] // Return copy
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((e) => e.id === id)
  }

  // Clients
  getClients(): Client[] {
    return [...this.clients] // Return copy
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find((c) => c.id === id)
  }

  // Jobs
  getJobs(): Job[] {
    return [...this.jobs] // Return copy
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find((j) => j.id === id)
  }

  getJobsByClientId(clientId: string): Job[] {
    return this.jobs.filter((j) => j.clientId === clientId)
  }

  getJobsByEmployeeId(employeeId: string): Job[] {
    return this.jobs.filter((j) => j.assignedEmployeeIds.includes(employeeId))
  }

  // Payments
  getPayments(): Payment[] {
    return [...this.payments] // Return copy
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id)
  }

  getPaymentsByClientId(clientId: string): Payment[] {
    return this.payments.filter((p) => p.clientId === clientId)
  }

  getPaymentsByJobId(jobId: string): Payment[] {
    return this.payments.filter((p) => p.jobId === jobId)
  }

  // Schedules
  getSchedules(): Schedule[] {
    return [...this.schedules] // Return copy
  }

  getScheduleById(id: string): Schedule | undefined {
    return this.schedules.find((s) => s.id === id)
  }

  getSchedulesByJobId(jobId: string): Schedule[] {
    return this.schedules.filter((s) => s.jobId === jobId)
  }

  getSchedulesByEmployeeId(employeeId: string): Schedule[] {
    return this.schedules.filter((s) => s.employeeIds.includes(employeeId))
  }

  // Quotes
  getQuotes(): Quote[] {
    return [...this.quotes] // Return copy
  }

  getQuoteById(id: string): Quote | undefined {
    return this.quotes.find((q) => q.id === id)
  }

  getQuotesByClientId(clientId: string): Quote[] {
    return this.quotes.filter((q) => q.clientId === clientId)
  }

  // Communications
  getCommunications(): Communication[] {
    return [...this.communications] // Return copy
  }

  getCommunicationById(id: string): Communication | undefined {
    return this.communications.find((c) => c.id === id)
  }

  getCommunicationsByClientId(clientId: string): Communication[] {
    return this.communications.filter((c) => c.clientId === clientId)
  }

  getCommunicationsByJobId(jobId: string): Communication[] {
    return this.communications.filter((c) => c.jobId === jobId)
  }

  // Invoices (J&J Desert Landscaping Invoice System)
  getInvoices(): Invoice[] {
    return [...this.invoices]
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((inv) => inv.id === id)
  }

  getInvoicesByClientId(clientId: string): Invoice[] {
    return this.invoices.filter((inv) => inv.clientId === clientId)
  }

  getInvoiceSettings(): InvoiceSettings {
    return { ...this.invoiceSettings }
  }

  // Settings
  getSettings(): Record<string, unknown> {
    return { ...this.settings } // Return copy
  }

  getSetting(key: string): unknown {
    return this.settings[key]
  }

  // ============================================================================
  // Mutation Methods (CRUD Operations)
  // ============================================================================

  // Users
  createUser(user: Omit<User, "id" | "joinDate">): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      joinDate: new Date().toISOString().split("T")[0],
    }
    this.users.push(newUser)
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id)
    if (!user) return undefined
    const updated = { ...user, ...updates }
    const index = this.users.findIndex((u) => u.id === id)
    if (index >= 0) {
      this.users[index] = updated
    }
    return updated
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id)
    if (index >= 0) {
      this.users.splice(index, 1)
      return true
    }
    return false
  }

  // Clients
  createClient(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Client {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.clients.push(newClient)
    return newClient
  }

  updateClient(id: string, updates: Partial<Client>): Client | undefined {
    const client = this.getClientById(id)
    if (!client) return undefined
    const updated = { ...client, ...updates, updatedAt: new Date().toISOString() }
    const index = this.clients.findIndex((c) => c.id === id)
    if (index >= 0) {
      this.clients[index] = updated
    }
    return updated
  }

  deleteClient(id: string): boolean {
    const index = this.clients.findIndex((c) => c.id === id)
    if (index >= 0) {
      this.clients.splice(index, 1)
      return true
    }
    return false
  }

  // Employees
  createEmployee(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: `employee-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.employees.push(newEmployee)
    return newEmployee
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const employee = this.getEmployeeById(id)
    if (!employee) return undefined
    const updated = { ...employee, ...updates, updatedAt: new Date().toISOString() }
    const index = this.employees.findIndex((e) => e.id === id)
    if (index >= 0) {
      this.employees[index] = updated
    }
    return updated
  }

  deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex((e) => e.id === id)
    if (index >= 0) {
      this.employees.splice(index, 1)
      return true
    }
    return false
  }

  // Jobs
  createJob(job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">): Job {
    // Phase 1: No mutations - return a mock job
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      jobNumber: `J-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Job
    this.jobs.push(newJob)
    return newJob
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const job = this.getJobById(id)
    if (!job) return undefined
    const updated = { ...job, ...updates, updatedAt: new Date().toISOString() }
    const index = this.jobs.findIndex((j) => j.id === id)
    if (index >= 0) {
      this.jobs[index] = updated
    }
    return updated
  }

  deleteJob(id: string): boolean {
    const index = this.jobs.findIndex((j) => j.id === id)
    if (index >= 0) {
      this.jobs.splice(index, 1)
      return true
    }
    return false
  }

  createSchedule(schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">): Schedule {
    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Schedule
    this.schedules.push(newSchedule)
    return newSchedule
  }

  updateSchedule(id: string, updates: Partial<Schedule>): Schedule | undefined {
    const schedule = this.getScheduleById(id)
    if (!schedule) return undefined
    const updated = { ...schedule, ...updates, updatedAt: new Date().toISOString() }
    const index = this.schedules.findIndex((s) => s.id === id)
    if (index >= 0) {
      this.schedules[index] = updated
    }
    return updated
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex((s) => s.id === id)
    if (index >= 0) {
      this.schedules.splice(index, 1)
      return true
    }
    return false
  }

  createQuote(quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Quote {
    const newQuote: Quote = {
      ...quote,
      id: `quote-${Date.now()}`,
      quoteNumber: `Q-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Quote
    this.quotes.push(newQuote)
    return newQuote
  }

  updateQuote(id: string, updates: Partial<Quote>): Quote | undefined {
    const quote = this.getQuoteById(id)
    if (!quote) return undefined
    const updated = { ...quote, ...updates, updatedAt: new Date().toISOString() }
    const index = this.quotes.findIndex((q) => q.id === id)
    if (index >= 0) {
      this.quotes[index] = updated
    }
    return updated
  }

  deleteQuote(id: string): boolean {
    const index = this.quotes.findIndex((q) => q.id === id)
    if (index >= 0) {
      this.quotes.splice(index, 1)
      return true
    }
    return false
  }

  createPayment(payment: Omit<Payment, "id" | "paymentNumber" | "createdAt" | "updatedAt">): Payment {
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
      paymentNumber: `P-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Payment
    this.payments.push(newPayment)
    return newPayment
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const payment = this.getPaymentById(id)
    if (!payment) return undefined
    const updated = { ...payment, ...updates, updatedAt: new Date().toISOString() }
    const index = this.payments.findIndex((p) => p.id === id)
    if (index >= 0) {
      this.payments[index] = updated
    }
    return updated
  }

  deletePayment(id: string): boolean {
    const index = this.payments.findIndex((p) => p.id === id)
    if (index >= 0) {
      this.payments.splice(index, 1)
      return true
    }
    return false
  }

  createCommunication(communication: Omit<Communication, "id" | "createdAt" | "updatedAt">): Communication {
    const newComm: Communication = {
      ...communication,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Communication
    this.communications.push(newComm)
    return newComm
  }

  updateCommunication(id: string, updates: Partial<Communication>): Communication | undefined {
    const communication = this.getCommunicationById(id)
    if (!communication) return undefined
    const updated = { ...communication, ...updates, updatedAt: new Date().toISOString() }
    const index = this.communications.findIndex((c) => c.id === id)
    if (index >= 0) {
      this.communications[index] = updated
    }
    return updated
  }

  deleteCommunication(id: string): boolean {
    const index = this.communications.findIndex((c) => c.id === id)
    if (index >= 0) {
      this.communications.splice(index, 1)
      return true
    }
    return false
  }

  // Invoices CRUD
  createInvoice(inv: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Invoice {
    const nextNum = String(this.invoices.length + 1).padStart(3, "0")
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2025-${nextNum}`,
      createdAt: new Date().toISOString(),
    }
    this.invoices.push(newInv)
    return newInv
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | undefined {
    const inv = this.getInvoiceById(id)
    if (!inv) return undefined
    const updated = { ...inv, ...updates }
    const idx = this.invoices.findIndex((i) => i.id === id)
    if (idx >= 0) this.invoices[idx] = updated
    return updated
  }

  deleteInvoice(id: string): boolean {
    const idx = this.invoices.findIndex((i) => i.id === id)
    if (idx >= 0) {
      this.invoices.splice(idx, 1)
      return true
    }
    return false
  }

  // Calculation history (job cost calculator)
  getCalculationHistory(): CalculationHistoryEntry[] {
    return [...this.calculationHistory]
  }

  addCalculationEntry(
    entry: Omit<CalculationHistoryEntry, "id" | "timestamp">
  ): CalculationHistoryEntry {
    const full: CalculationHistoryEntry = {
      ...entry,
      id: `calc-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    this.calculationHistory.push(full)
    console.log("[mockStore] Calculation history entry added", { id: full.id, jobId: entry.jobId, total: entry.breakdown.total })
    return full
  }

  // ============================================================================
  // Seed Data Initialization
  // ============================================================================

  private initializeSeedData() {
    // Seed Users (comprehensive seed data)
    this.users.push(
      {
        id: "user-1",
        name: "Maria Rodriguez",
        email: "maria@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2025-01-15",
      },
      {
        id: "user-2",
        name: "James Wilson",
        email: "james@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2025-01-12",
      },
      {
        id: "user-3",
        name: "Sarah Chen",
        email: "sarah@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2025-01-10",
      },
      {
        id: "user-4",
        name: "Michael Thompson",
        email: "michael@email.com",
        role: "Supervisor",
        status: "Active",
        joinDate: "2023-11-20",
      },
      {
        id: "user-5",
        name: "Josue Garcia",
        email: "josue.garcia@jjdesertlandscaping.com",
        role: "Admin",
        status: "Active",
        joinDate: "2023-12-01",
      },
      {
        id: "user-6",
        name: "Emily Johnson",
        email: "emily@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2025-02-01",
      },
      {
        id: "user-7",
        name: "David Martinez",
        email: "david@email.com",
        role: "Client",
        status: "Pending",
        joinDate: "2025-02-15",
      },
      {
        id: "user-8",
        name: "Lisa Anderson",
        email: "lisa@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2025-01-05",
      },
      {
        id: "user-9",
        name: "Robert Brown",
        email: "robert@email.com",
        role: "Client",
        status: "Inactive",
        joinDate: "2023-10-15",
      },
      {
        id: "user-10",
        name: "Jennifer Lee",
        email: "jennifer@email.com",
        role: "Supervisor",
        status: "Active",
        joinDate: "2023-11-10",
      }
    )

    // Seed Employees (basic structure - will be populated by services)
    const now = new Date().toISOString()
    this.employees.push(
      {
        id: "employee-1",
        firstName: "Mike",
        lastName: "Rodriguez",
        displayName: "Mike Rodriguez",
        email: "mike@email.com",
        phone: "+1-555-0101",
        role: EmployeeRole.WORKER,
        status: EmployeeStatus.ACTIVE,
        hireDate: now,
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
        completedJobsCount: 156,
        totalHoursWorked: 0,
        assignedJobIds: [],
        supervisedJobIds: [],
        createdAt: now,
        updatedAt: now,
        rating: 4.8,
        department: "Lawn Specialist",
        avatar: "/professional-lawn-worker.jpg",
      } as Employee,
      {
        id: "employee-2",
        firstName: "Sarah",
        lastName: "Chen",
        displayName: "Sarah Chen",
        email: "sarah@email.com",
        phone: "+1-555-0102",
        role: EmployeeRole.WORKER,
        status: EmployeeStatus.ACTIVE,
        hireDate: now,
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
        completedJobsCount: 89,
        totalHoursWorked: 0,
        assignedJobIds: [],
        supervisedJobIds: [],
        createdAt: now,
        updatedAt: now,
        rating: 4.9,
        department: "Landscape Designer",
        avatar: "/female-landscape-designer.jpg",
      } as Employee
    )

    // Seed Settings
    this.settings = {
      companyName: "J&J Desert Landscaping LLC",
      companyEmail: "info@jjdesertlandscaping.com",
      companyPhone: "+1-555-0123",
      timezone: "America/Phoenix",
      currency: "USD",
      taxRate: 0.08,
      enableNotifications: true,
      enableEmailAlerts: true,
      maintenanceMode: false,
    }

    // Demo clients (match demo invoices: client-1 … client-4)
    console.log("[mockStore] Adding demo clients:", DEMO_CLIENTS.map((c) => ({ id: c.id, name: c.name })))
    this.clients.push(...DEMO_CLIENTS)

    // Invoice settings (tax rate, company info)
    this.invoiceSettings = {
      taxRate: 0.08,
      companyName: "J&J Desert Landscaping LLC",
      companyAddress: "Phoenix, AZ",
      companyEmail: "info@jjdesertlandscaping.com",
      companyPhone: "+1-555-0123",
    }

    // Demo invoice data array
    this.invoices.push(...DEMO_INVOICES)
  }
}

// Singleton instance
export const mockStore = new MockStore()
