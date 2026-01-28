/**
 * Quote Service
 * 
 * Service layer for quote/estimate management
 */

import { mockStore } from "@/src/data/mockStore"
import type { Quote, EntityId, QuoteLineItem } from "@/src/domain/entities"
import { QuoteStatus } from "@/src/domain/entities"
import { asyncify, asyncifyWithError } from "./utils"

export interface QuoteTemplate {
  id: string
  name: string
  description: string
  lineItems: QuoteLineItem[]
  defaultMarkup: number
}

const mockQuotes: Quote[] = [
  {
    id: "quote-1",
    clientId: "client-1",
    quoteNumber: "QT-2025-001",
    jobId: "job-1",
    status: QuoteStatus.SENT,
    lineItems: [
      {
        id: "li-1",
        serviceId: "service-1",
        serviceName: "Weekly Lawn Maintenance",
        description: "Lawn mowing, edging, and trimming",
        quantity: 12,
        unitPrice: { amount: 75, currency: "USD" },
        totalPrice: { amount: 900, currency: "USD" },
      },
      {
        id: "li-2",
        serviceId: "service-2",
        serviceName: "Fertilizer Application",
        description: "Seasonal fertilizer application",
        quantity: 3,
        unitPrice: { amount: 150, currency: "USD" },
        totalPrice: { amount: 450, currency: "USD" },
      },
    ],
    subtotal: { amount: 2700, currency: "USD" },
    tax: { amount: 216, currency: "USD" },
    discount: { amount: 66, currency: "USD" },
    total: { amount: 2850, currency: "USD" },
    validUntil: "2025-02-15T00:00:00Z",
    expiresAt: "2025-02-15T00:00:00Z",
    revisionNumber: 1,
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
    sentAt: "2025-01-20T10:00:00Z",
    notes: "Includes weekly maintenance for 3 months",
  },
  {
    id: "quote-2",
    clientId: "client-2",
    quoteNumber: "QT-2025-002",
    jobId: "job-2",
    status: QuoteStatus.VIEWED,
    lineItems: [
      {
        id: "li-3",
        serviceId: "service-3",
        serviceName: "Tree Removal",
        description: "Large tree removal and stump grinding",
        quantity: 1,
        unitPrice: { amount: 3500, currency: "USD" },
        totalPrice: { amount: 3500, currency: "USD" },
      },
      {
        id: "li-4",
        serviceId: "service-4",
        serviceName: "Debris Removal",
        description: "Cleanup and debris removal",
        quantity: 1,
        unitPrice: { amount: 500, currency: "USD" },
        totalPrice: { amount: 500, currency: "USD" },
      },
    ],
    subtotal: { amount: 4000, currency: "USD" },
    tax: { amount: 320, currency: "USD" },
    discount: { amount: 120, currency: "USD" },
    total: { amount: 4200, currency: "USD" },
    validUntil: "2025-02-20T00:00:00Z",
    expiresAt: "2025-02-20T00:00:00Z",
    revisionNumber: 1,
    createdAt: "2025-01-22T14:30:00Z",
    updatedAt: "2025-01-23T09:15:00Z",
    sentAt: "2025-01-22T14:30:00Z",
    viewedAt: "2025-01-23T09:15:00Z",
    notes: "Tree removal and stump grinding",
  },
  {
    id: "quote-3",
    clientId: "client-3",
    quoteNumber: "QT-2025-003",
    status: QuoteStatus.DRAFT,
    lineItems: [
      {
        id: "li-5",
        serviceId: "service-5",
        serviceName: "Irrigation System Repair",
        description: "Repair and maintenance of irrigation system",
        quantity: 1,
        unitPrice: { amount: 1500, currency: "USD" },
        totalPrice: { amount: 1500, currency: "USD" },
      },
      {
        id: "li-6",
        serviceId: "service-6",
        serviceName: "Parts and Materials",
        description: "Replacement parts and materials",
        quantity: 1,
        unitPrice: { amount: 250, currency: "USD" },
        totalPrice: { amount: 250, currency: "USD" },
      },
    ],
    subtotal: { amount: 1750, currency: "USD" },
    tax: { amount: 140, currency: "USD" },
    total: { amount: 1890, currency: "USD" },
    validUntil: "2025-02-25T00:00:00Z",
    expiresAt: "2025-02-25T00:00:00Z",
    revisionNumber: 1,
    createdAt: "2025-01-24T11:00:00Z",
    updatedAt: "2025-01-24T11:00:00Z",
    notes: "Irrigation system repair",
  },
]

const mockTemplates: QuoteTemplate[] = [
  {
    id: "template-1",
    name: "Standard Lawn Care",
    description: "Weekly lawn maintenance package",
    lineItems: [
      {
        id: "li-1",
        serviceId: "service-1",
        serviceName: "Lawn Mowing",
        description: "Weekly lawn mowing service",
        quantity: 4,
        unitPrice: { amount: 75, currency: "USD" },
        totalPrice: { amount: 300, currency: "USD" },
      },
      {
        id: "li-2",
        serviceId: "service-2",
        serviceName: "Edging & Trimming",
        description: "Edging and trimming service",
        quantity: 4,
        unitPrice: { amount: 25, currency: "USD" },
        totalPrice: { amount: 100, currency: "USD" },
      },
      {
        id: "li-3",
        serviceId: "service-3",
        serviceName: "Fertilizer Application",
        description: "Fertilizer application",
        quantity: 1,
        unitPrice: { amount: 150, currency: "USD" },
        totalPrice: { amount: 150, currency: "USD" },
      },
    ],
    defaultMarkup: 20,
  },
  {
    id: "template-2",
    name: "Tree Service Package",
    description: "Tree trimming and removal",
    lineItems: [
      {
        id: "li-4",
        serviceId: "service-4",
        serviceName: "Tree Trimming",
        description: "Professional tree trimming",
        quantity: 1,
        unitPrice: { amount: 350, currency: "USD" },
        totalPrice: { amount: 350, currency: "USD" },
      },
      {
        id: "li-5",
        serviceId: "service-5",
        serviceName: "Debris Removal",
        description: "Debris cleanup and removal",
        quantity: 1,
        unitPrice: { amount: 150, currency: "USD" },
        totalPrice: { amount: 150, currency: "USD" },
      },
      {
        id: "li-6",
        serviceId: "service-6",
        serviceName: "Equipment Rental",
        description: "Specialized equipment rental",
        quantity: 1,
        unitPrice: { amount: 200, currency: "USD" },
        totalPrice: { amount: 200, currency: "USD" },
      },
    ],
    defaultMarkup: 25,
  },
]

export const quoteService = {
  getAll: (): Promise<Quote[]> => asyncify(() => mockQuotes),

  getById: (id: EntityId): Promise<Quote | undefined> =>
    asyncify(() => mockQuotes.find((q) => q.id === id)),

  getByClientId: (clientId: EntityId): Promise<Quote[]> =>
    asyncify(() => mockQuotes.filter((q) => q.clientId === clientId)),

  getTemplates: (): Promise<QuoteTemplate[]> =>
    asyncify(() => mockTemplates),

  getPendingQuotes: (): Promise<Quote[]> =>
    asyncify(() => mockQuotes.filter((q) => q.status === QuoteStatus.SENT || q.status === QuoteStatus.VIEWED)),

  getConversionRate: (): Promise<number> =>
    asyncify(() => 68.5), // 68.5% conversion rate
}
