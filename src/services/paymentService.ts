/**
 * Payment Service
 * 
 * Service layer for payment management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Payment, EntityId, PaymentStatus } from "@/src/domain/entities"
import { PaymentStatus as PaymentStatusEnum, PaymentMethod as PaymentMethodEnum } from "@/src/domain/entities"
import { getAllClients } from "./clientService"
import { getJobs } from "./jobService"
import { asyncify, asyncifyWithError } from "./utils"

// Initialize with seed data if empty (lazy initialization)
let paymentsInitialized = false
const initializePayments = async () => {
  if (paymentsInitialized || mockStore.getPayments().length > 0) {
    paymentsInitialized = true
    return
  }
  
  try {
    const clients = await getAllClients()
    const jobs = await getJobs()
    
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
  getAll(): Promise<Payment[]>
  getById(id: EntityId): Promise<Payment | undefined>
  getByClientId(clientId: EntityId): Promise<Payment[]>
  getByJobId(jobId: EntityId): Promise<Payment[]>
  getByStatus(status: PaymentStatus): Promise<Payment[]>
  create(payment: Omit<Payment, "id" | "paymentNumber" | "createdAt" | "updatedAt">): Promise<Payment>
  update(id: EntityId, updates: Partial<Payment>): Promise<Payment | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const paymentService: PaymentService = {
  getAll: async () => {
    await initializePayments()
    return asyncify(() => mockStore.getPayments())()
  },

  getById: async (id: EntityId) => {
    await initializePayments()
    return asyncify(() => mockStore.getPaymentById(id))()
  },

  getByClientId: async (clientId: EntityId) => {
    await initializePayments()
    return asyncify(() => mockStore.getPaymentsByClientId(clientId))()
  },

  getByJobId: async (jobId: EntityId) => {
    await initializePayments()
    return asyncify(() => mockStore.getPaymentsByJobId(jobId))()
  },

  getByStatus: async (status: PaymentStatus) => {
    await initializePayments()
    return asyncify(() => mockStore.getPayments().filter((payment) => payment.status === status))()
  },

  create: (payment) =>
    asyncifyWithError(() => {
      const newPayment = mockStore.createPayment(payment)
      return newPayment
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updatePayment(id, updates)
      if (!updated) {
        throw new Error(`Payment with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deletePayment(id)
      if (!deleted) {
        throw new Error(`Payment with id ${id} not found`)
      }
      return deleted
    }),
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
