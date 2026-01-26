/**
 * Payment Service
 * 
 * Service layer for payment management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Payment, EntityId, PaymentStatus } from "@/src/domain/entities"
import { PaymentStatus as PaymentStatusEnum, PaymentMethod as PaymentMethodEnum } from "@/src/domain/entities"
import { getClients } from "./clientService"
import { getJobs } from "./jobService"

// Initialize with seed data if empty (lazy initialization)
let paymentsInitialized = false
const initializePayments = () => {
  if (paymentsInitialized || mockStore.getPayments().length > 0) {
    paymentsInitialized = true
    return
  }
  
  try {
    const clients = getClients()
    const jobs = getJobs()
    
    if (clients.length > 0 && jobs.length > 0) {
      const client = clients[0]
      const job = jobs[0]

      mockStore.createPayment({
        clientId: client.id,
        jobId: job.id,
        status: PaymentStatusEnum.COMPLETED,
        method: PaymentMethodEnum.CREDIT_CARD,
        amount: { amount: 150.0, currency: "USD" },
        processor: "stripe",
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    paymentsInitialized = true
  } catch (error) {
    console.warn("Failed to initialize payments:", error)
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface PaymentService {
  getAll(): Payment[]
  getById(id: EntityId): Payment | undefined
  getByClientId(clientId: EntityId): Payment[]
  getByJobId(jobId: EntityId): Payment[]
  getByStatus(status: PaymentStatus): Payment[]
  create(payment: Omit<Payment, "id" | "paymentNumber" | "createdAt" | "updatedAt">): Payment
  update(id: EntityId, updates: Partial<Payment>): Payment | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const paymentService: PaymentService = {
  getAll: () => {
    initializePayments()
    return mockStore.getPayments()
  },

  getById: (id: EntityId) => {
    initializePayments()
    return mockStore.getPaymentById(id)
  },

  getByClientId: (clientId: EntityId) => {
    initializePayments()
    return mockStore.getPaymentsByClientId(clientId)
  },

  getByJobId: (jobId: EntityId) => {
    initializePayments()
    return mockStore.getPaymentsByJobId(jobId)
  },

  getByStatus: (status: PaymentStatus) => {
    initializePayments()
    return mockStore.getPayments().filter((payment) => payment.status === status)
  },

  create: (payment) => mockStore.createPayment(payment),

  update: (id, updates) => mockStore.updatePayment(id, updates),

  delete: (id) => mockStore.deletePayment(id),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getPayments = () => paymentService.getAll()
export const getPaymentById = (id: EntityId) => paymentService.getById(id)
export const getPaymentsByClientId = (clientId: EntityId) => paymentService.getByClientId(clientId)
export const getPaymentsByJobId = (jobId: EntityId) => paymentService.getByJobId(jobId)
export const createPayment = (
  payment: Omit<Payment, "id" | "paymentNumber" | "createdAt" | "updatedAt">
) => paymentService.create(payment)
export const updatePayment = (id: EntityId, updates: Partial<Payment>) =>
  paymentService.update(id, updates)
export const deletePayment = (id: EntityId) => paymentService.delete(id)
