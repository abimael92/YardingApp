/**
 * Quote Service
 * 
 * Service layer for quote management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Quote, EntityId, QuoteStatus } from "@/src/domain/entities"
import { QuoteStatus as QuoteStatusEnum } from "@/src/domain/entities"
import { getAllClients } from "./clientService"
import { asyncify, asyncifyWithError } from "./utils"

// Initialize with seed data if empty (lazy initialization)
let quotesInitialized = false
const initializeQuotes = async () => {
  if (quotesInitialized || mockStore.getQuotes().length > 0) {
    quotesInitialized = true
    return
  }
  
  try {
    const clients = await getAllClients()
    
    if (clients.length > 0) {
      const client = clients[0]
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

      mockStore.createQuote({
        clientId: client.id,
        status: QuoteStatusEnum.SENT,
        lineItems: [
          {
            id: `line-${Date.now()}-1`,
            serviceId: "service-1",
            serviceName: "Lawn Care & Maintenance",
            description: "Weekly lawn maintenance service",
            quantity: 4,
            unitPrice: { amount: 75.0, currency: "USD" },
            totalPrice: { amount: 300.0, currency: "USD" },
          },
        ],
        subtotal: { amount: 300.0, currency: "USD" },
        tax: { amount: 24.0, currency: "USD" },
        total: { amount: 324.0, currency: "USD" },
        validUntil: expiresAt,
        expiresAt,
        revisionNumber: 1,
      })
    }
    quotesInitialized = true
  } catch (error) {
    console.warn("Failed to initialize quotes:", error)
  }
}

// ============================================================================
// Service Interface
// ============================================================================

export interface QuoteService {
  getAll(): Promise<Quote[]>
  getById(id: EntityId): Promise<Quote | undefined>
  getByClientId(clientId: EntityId): Promise<Quote[]>
  getByStatus(status: QuoteStatus): Promise<Quote[]>
  create(quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Promise<Quote>
  update(id: EntityId, updates: Partial<Quote>): Promise<Quote | undefined>
  delete(id: EntityId): Promise<boolean>
}

// ============================================================================
// Service Implementation
// ============================================================================

export const quoteService: QuoteService = {
  getAll: async () => {
    await initializeQuotes()
    return asyncify(() => mockStore.getQuotes())()
  },

  getById: async (id: EntityId) => {
    await initializeQuotes()
    return asyncify(() => mockStore.getQuoteById(id))()
  },

  getByClientId: async (clientId: EntityId) => {
    await initializeQuotes()
    return asyncify(() => mockStore.getQuotesByClientId(clientId))()
  },

  getByStatus: async (status: QuoteStatus) => {
    await initializeQuotes()
    return asyncify(() => mockStore.getQuotes().filter((quote) => quote.status === status))()
  },

  create: (quote) =>
    asyncifyWithError(() => {
      const newQuote = mockStore.createQuote(quote)
      return newQuote
    }),

  update: (id, updates) =>
    asyncifyWithError(() => {
      const updated = mockStore.updateQuote(id, updates)
      if (!updated) {
        throw new Error(`Quote with id ${id} not found`)
      }
      return updated
    }),

  delete: (id) =>
    asyncifyWithError(() => {
      const deleted = mockStore.deleteQuote(id)
      if (!deleted) {
        throw new Error(`Quote with id ${id} not found`)
      }
      return deleted
    }),
}

// ============================================================================
// Convenience Functions
// ============================================================================

export const getQuotes = () => quoteService.getAll()
export const getQuoteById = (id: EntityId) => quoteService.getById(id)
export const getQuotesByClientId = (clientId: EntityId) => quoteService.getByClientId(clientId)
export const createQuote = (quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "updatedAt">) =>
  quoteService.create(quote)
export const updateQuote = (id: EntityId, updates: Partial<Quote>) =>
  quoteService.update(id, updates)
export const deleteQuote = (id: EntityId) => quoteService.delete(id)
