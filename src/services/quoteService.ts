/**
 * Quote Service
 * 
 * Service layer for quote management operations.
 */

import { mockStore } from "@/src/data/mockStore"
import type { Quote, EntityId, QuoteStatus } from "@/src/domain/entities"
import { QuoteStatus as QuoteStatusEnum } from "@/src/domain/entities"
import { getClients } from "./clientService"

// Initialize with seed data if empty (lazy initialization)
let quotesInitialized = false
const initializeQuotes = () => {
  if (quotesInitialized || mockStore.getQuotes().length > 0) {
    quotesInitialized = true
    return
  }
  
  try {
    const clients = getClients()
    
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
  getAll(): Quote[]
  getById(id: EntityId): Quote | undefined
  getByClientId(clientId: EntityId): Quote[]
  getByStatus(status: QuoteStatus): Quote[]
  create(quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "updatedAt">): Quote
  update(id: EntityId, updates: Partial<Quote>): Quote | undefined
  delete(id: EntityId): boolean
}

// ============================================================================
// Service Implementation
// ============================================================================

export const quoteService: QuoteService = {
  getAll: () => {
    initializeQuotes()
    return mockStore.getQuotes()
  },

  getById: (id: EntityId) => {
    initializeQuotes()
    return mockStore.getQuoteById(id)
  },

  getByClientId: (clientId: EntityId) => {
    initializeQuotes()
    return mockStore.getQuotesByClientId(clientId)
  },

  getByStatus: (status: QuoteStatus) => {
    initializeQuotes()
    return mockStore.getQuotes().filter((quote) => quote.status === status)
  },

  create: (quote) => mockStore.createQuote(quote),

  update: (id, updates) => mockStore.updateQuote(id, updates),

  delete: (id) => mockStore.deleteQuote(id),
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
