/**
 * Mock Data Store
 *
 * Centralized in-memory data store for development and testing.
 * Phase 1: Read-only access only. No mutations.
 */

import type { User } from "@/src/domain/models"
import type { Employee, Client, Job, Payment, Schedule, Quote, Communication } from "@/src/domain/entities"

// ============================================================================
// Mock Data Store (Read-Only for Phase 1)
// ============================================================================

class MockStore {
  // In-memory storage (read-only access in Phase 1)
  private readonly users: User[] = []
  private readonly employees: Employee[] = []
  private readonly clients: Client[] = []
  private readonly jobs: Job[] = []
  private readonly payments: Payment[] = []
  private readonly schedules: Schedule[] = []
  private readonly quotes: Quote[] = []
  private readonly communications: Communication[] = []
  private settings: Record<string, any> = {}

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

  // Settings
  getSettings(): Record<string, any> {
    return { ...this.settings } // Return copy
  }

  getSetting(key: string): any {
    return this.settings[key]
  }

  // ============================================================================
  // Mutation Methods (CRUD Operations)
  // ============================================================================

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

  // ============================================================================
  // Seed Data Initialization
  // ============================================================================

  private initializeSeedData() {
    // Seed Users (basic seed data)
    this.users.push(
      {
        id: "user-1",
        name: "Maria Rodriguez",
        email: "maria@email.com",
        role: "Client",
        status: "Active",
        joinDate: "2024-01-15",
      },
      {
        id: "user-2",
        name: "James Wilson",
        email: "james@email.com",
        role: "Worker",
        status: "Active",
        joinDate: "2024-01-12",
      },
      {
        id: "user-5",
        name: "Josue Garcia",
        email: "josue.garcia@jjdesertlandscaping.com",
        role: "Admin",
        status: "Active",
        joinDate: "2023-12-01",
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
        role: "worker" as any,
        status: "active" as any,
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
        role: "worker" as any,
        status: "active" as any,
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
  }
}

// Singleton instance
export const mockStore = new MockStore()
