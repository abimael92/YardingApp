/**
 * Mock Data Store
 * 
 * In-memory data store for development and testing.
 * This simulates a database and provides CRUD operations.
 */

import type {
  Client,
  Job,
  Quote,
  Employee,
  Schedule,
  Payment,
  Communication,
  EntityId,
} from "@/src/domain/entities"
import {
  ClientStatus,
  ClientSegment,
  JobStatus,
  QuoteStatus,
  EmployeeRole,
  EmployeeStatus,
  ScheduleStatus,
  PaymentStatus,
  PaymentMethod,
  CommunicationType,
  CommunicationDirection,
} from "@/src/domain/entities"

// ============================================================================
// Mock Data Store
// ============================================================================

class MockStore {
  // In-memory storage
  private clients: Map<EntityId, Client> = new Map()
  private jobs: Map<EntityId, Job> = new Map()
  private quotes: Map<EntityId, Quote> = new Map()
  private employees: Map<EntityId, Employee> = new Map()
  private schedules: Map<EntityId, Schedule> = new Map()
  private payments: Map<EntityId, Payment> = new Map()
  private communications: Map<EntityId, Communication> = new Map()

  // Initialize with seed data
  constructor() {
    this.initializeSeedData()
  }

  // ============================================================================
  // Client Operations
  // ============================================================================

  getClients(): Client[] {
    return Array.from(this.clients.values())
  }

  getClientById(id: EntityId): Client | undefined {
    return this.clients.get(id)
  }

  createClient(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Client {
    const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      updatedAt: now,
    }
    this.clients.set(id, newClient)
    return newClient
  }

  updateClient(id: EntityId, updates: Partial<Client>): Client | undefined {
    const existing = this.clients.get(id)
    if (!existing) return undefined

    const updated: Client = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }
    this.clients.set(id, updated)
    return updated
  }

  deleteClient(id: EntityId): boolean {
    return this.clients.delete(id)
  }

  // ============================================================================
  // Job Operations
  // ============================================================================

  getJobs(): Job[] {
    return Array.from(this.jobs.values())
  }

  getJobById(id: EntityId): Job | undefined {
    return this.jobs.get(id)
  }

  getJobsByClientId(clientId: EntityId): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.clientId === clientId)
  }

  getJobsByEmployeeId(employeeId: EntityId): Job[] {
    return Array.from(this.jobs.values()).filter((job) =>
      job.assignedEmployeeIds.includes(employeeId)
    )
  }

  createJob(job: Omit<Job, "id" | "jobNumber" | "createdAt" | "updatedAt">): Job {
    const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const jobNumber = `J-${new Date().getFullYear()}-${String(this.jobs.size + 1).padStart(4, "0")}`
    const now = new Date().toISOString()
    const newJob: Job = {
      ...job,
      id,
      jobNumber,
      createdAt: now,
      updatedAt: now,
    }
    this.jobs.set(id, newJob)
    return newJob
  }

  updateJob(id: EntityId, updates: Partial<Job>): Job | undefined {
    const existing = this.jobs.get(id)
    if (!existing) return undefined

    const updated: Job = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.jobs.set(id, updated)
    return updated
  }

  deleteJob(id: EntityId): boolean {
    return this.jobs.delete(id)
  }

  // ============================================================================
  // Quote Operations
  // ============================================================================

  getQuotes(): Quote[] {
    return Array.from(this.quotes.values())
  }

  getQuoteById(id: EntityId): Quote | undefined {
    return this.quotes.get(id)
  }

  getQuotesByClientId(clientId: EntityId): Quote[] {
    return Array.from(this.quotes.values()).filter((quote) => quote.clientId === clientId)
  }

  createQuote(quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Quote {
    const id = `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(this.quotes.size + 1).padStart(4, "0")}`
    const now = new Date().toISOString()
    const newQuote: Quote = {
      ...quote,
      id,
      quoteNumber,
      createdAt: now,
      updatedAt: now,
    }
    this.quotes.set(id, newQuote)
    return newQuote
  }

  updateQuote(id: EntityId, updates: Partial<Quote>): Quote | undefined {
    const existing = this.quotes.get(id)
    if (!existing) return undefined

    const updated: Quote = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.quotes.set(id, updated)
    return updated
  }

  deleteQuote(id: EntityId): boolean {
    return this.quotes.delete(id)
  }

  // ============================================================================
  // Employee Operations
  // ============================================================================

  getEmployees(): Employee[] {
    return Array.from(this.employees.values())
  }

  getEmployeeById(id: EntityId): Employee | undefined {
    return this.employees.get(id)
  }

  createEmployee(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee {
    const id = `employee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: now,
      updatedAt: now,
    }
    this.employees.set(id, newEmployee)
    return newEmployee
  }

  updateEmployee(id: EntityId, updates: Partial<Employee>): Employee | undefined {
    const existing = this.employees.get(id)
    if (!existing) return undefined

    const updated: Employee = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.employees.set(id, updated)
    return updated
  }

  deleteEmployee(id: EntityId): boolean {
    return this.employees.delete(id)
  }

  // ============================================================================
  // Schedule Operations
  // ============================================================================

  getSchedules(): Schedule[] {
    return Array.from(this.schedules.values())
  }

  getScheduleById(id: EntityId): Schedule | undefined {
    return this.schedules.get(id)
  }

  getSchedulesByJobId(jobId: EntityId): Schedule[] {
    return Array.from(this.schedules.values()).filter((schedule) => schedule.jobId === jobId)
  }

  getSchedulesByEmployeeId(employeeId: EntityId): Schedule[] {
    return Array.from(this.schedules.values()).filter((schedule) =>
      schedule.employeeIds.includes(employeeId)
    )
  }

  createSchedule(schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">): Schedule {
    const id = `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const newSchedule: Schedule = {
      ...schedule,
      id,
      createdAt: now,
      updatedAt: now,
    }
    this.schedules.set(id, newSchedule)
    return newSchedule
  }

  updateSchedule(id: EntityId, updates: Partial<Schedule>): Schedule | undefined {
    const existing = this.schedules.get(id)
    if (!existing) return undefined

    const updated: Schedule = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.schedules.set(id, updated)
    return updated
  }

  deleteSchedule(id: EntityId): boolean {
    return this.schedules.delete(id)
  }

  // ============================================================================
  // Payment Operations
  // ============================================================================

  getPayments(): Payment[] {
    return Array.from(this.payments.values())
  }

  getPaymentById(id: EntityId): Payment | undefined {
    return this.payments.get(id)
  }

  getPaymentsByClientId(clientId: EntityId): Payment[] {
    return Array.from(this.payments.values()).filter((payment) => payment.clientId === clientId)
  }

  getPaymentsByJobId(jobId: EntityId): Payment[] {
    return Array.from(this.payments.values()).filter((payment) => payment.jobId === jobId)
  }

  createPayment(payment: Omit<Payment, "id" | "paymentNumber" | "createdAt" | "updatedAt">): Payment {
    const id = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(this.payments.size + 1).padStart(4, "0")}`
    const now = new Date().toISOString()
    const newPayment: Payment = {
      ...payment,
      id,
      paymentNumber,
      createdAt: now,
      updatedAt: now,
    }
    this.payments.set(id, newPayment)
    return newPayment
  }

  updatePayment(id: EntityId, updates: Partial<Payment>): Payment | undefined {
    const existing = this.payments.get(id)
    if (!existing) return undefined

    const updated: Payment = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.payments.set(id, updated)
    return updated
  }

  deletePayment(id: EntityId): boolean {
    return this.payments.delete(id)
  }

  // ============================================================================
  // Communication Operations
  // ============================================================================

  getCommunications(): Communication[] {
    return Array.from(this.communications.values())
  }

  getCommunicationById(id: EntityId): Communication | undefined {
    return this.communications.get(id)
  }

  getCommunicationsByClientId(clientId: EntityId): Communication[] {
    return Array.from(this.communications.values()).filter(
      (comm) => comm.clientId === clientId
    )
  }

  getCommunicationsByJobId(jobId: EntityId): Communication[] {
    return Array.from(this.communications.values()).filter((comm) => comm.jobId === jobId)
  }

  createCommunication(
    communication: Omit<Communication, "id" | "createdAt" | "updatedAt">
  ): Communication {
    const id = `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const newCommunication: Communication = {
      ...communication,
      id,
      createdAt: now,
      updatedAt: now,
    }
    this.communications.set(id, newCommunication)
    return newCommunication
  }

  updateCommunication(id: EntityId, updates: Partial<Communication>): Communication | undefined {
    const existing = this.communications.get(id)
    if (!existing) return undefined

    const updated: Communication = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    }
    this.communications.set(id, updated)
    return updated
  }

  deleteCommunication(id: EntityId): boolean {
    return this.communications.delete(id)
  }

  // ============================================================================
  // Seed Data Initialization
  // ============================================================================

  private initializeSeedData() {
    // Initialize with some seed data for development
    // This will be populated by service layer
  }
}

// Singleton instance
export const mockStore = new MockStore()
