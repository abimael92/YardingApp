/**
 * Quote Service
 *
 * Service layer for quote/estimate management
 */

import { mockStore } from '@/src/data/mockStore';
import type { Quote, EntityId, QuoteLineItem } from '@/src/domain/entities';
import { QuoteStatus } from '@/src/domain/entities';
import { asyncify, asyncifyWithError } from './utils';

export interface QuoteTemplate {
	id: string;
	name: string;
	description: string;
	lineItems: QuoteLineItem[];
	defaultMarkup: number;
}

const mockQuotes: Quote[] = [
	{
		id: 'quote-1',
		clientId: 'client-1',
		quoteNumber: 'QT-2025-001',
		jobId: 'job-1',
		contractId: undefined,
		status: QuoteStatus.SENT,
		lineItems: [
			{
				id: 'li-1',
				serviceId: 'service-1',
				serviceName: 'Weekly Lawn Maintenance',
				description: 'Lawn mowing, edging, and trimming',
				quantity: 12,
				unitPrice: { amount: 75, currency: 'USD' },
				totalPrice: { amount: 900, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-2',
				serviceId: 'service-2',
				serviceName: 'Fertilizer Application',
				description: 'Seasonal fertilizer application',
				quantity: 3,
				unitPrice: { amount: 150, currency: 'USD' },
				totalPrice: { amount: 450, currency: 'USD' },
				notes: undefined,
			},
		],
		subtotal: { amount: 1350, currency: 'USD' },
		tax: { amount: 108, currency: 'USD' },
		discount: { amount: 0, currency: 'USD' },
		total: { amount: 1458, currency: 'USD' },
		validUntil: '2025-02-15T00:00:00Z',
		expiresAt: '2025-02-15T00:00:00Z',
		revisionNumber: 1,
		parentQuoteId: undefined,
		noteIds: [],
		activityLogIds: [],
		communicationIds: [],
		notes: 'Includes weekly maintenance for 3 months',
		terms: undefined,
		createdAt: '2025-01-20T10:00:00Z',
		updatedAt: '2025-01-20T10:00:00Z',
		sentAt: '2025-01-20T10:00:00Z',
		viewedAt: undefined,
		acceptedAt: undefined,
		rejectedAt: undefined,
		rejectionReason: undefined,
	},
	{
		id: 'quote-2',
		clientId: 'client-2',
		quoteNumber: 'QT-2025-002',
		jobId: 'job-2',
		contractId: undefined,
		status: QuoteStatus.VIEWED,
		lineItems: [
			{
				id: 'li-3',
				serviceId: 'service-3',
				serviceName: 'Tree Removal',
				description: 'Large tree removal and stump grinding',
				quantity: 1,
				unitPrice: { amount: 3500, currency: 'USD' },
				totalPrice: { amount: 3500, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-4',
				serviceId: 'service-4',
				serviceName: 'Debris Removal',
				description: 'Cleanup and debris removal',
				quantity: 1,
				unitPrice: { amount: 500, currency: 'USD' },
				totalPrice: { amount: 500, currency: 'USD' },
				notes: undefined,
			},
		],
		subtotal: { amount: 4000, currency: 'USD' },
		tax: { amount: 320, currency: 'USD' },
		discount: { amount: 0, currency: 'USD' },
		total: { amount: 4320, currency: 'USD' },
		validUntil: '2025-02-20T00:00:00Z',
		expiresAt: '2025-02-20T00:00:00Z',
		revisionNumber: 1,
		parentQuoteId: undefined,
		noteIds: [],
		activityLogIds: [],
		communicationIds: [],
		notes: 'Tree removal and stump grinding',
		terms: undefined,
		createdAt: '2025-01-22T14:30:00Z',
		updatedAt: '2025-01-23T09:15:00Z',
		sentAt: '2025-01-22T14:30:00Z',
		viewedAt: '2025-01-23T09:15:00Z',
		acceptedAt: undefined,
		rejectedAt: undefined,
		rejectionReason: undefined,
	},
	{
		id: 'quote-3',
		clientId: 'client-3',
		quoteNumber: 'QT-2025-003',
		jobId: undefined,
		contractId: undefined,
		status: QuoteStatus.DRAFT,
		lineItems: [
			{
				id: 'li-5',
				serviceId: 'service-5',
				serviceName: 'Irrigation System Repair',
				description: 'Repair and maintenance of irrigation system',
				quantity: 1,
				unitPrice: { amount: 1500, currency: 'USD' },
				totalPrice: { amount: 1500, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-6',
				serviceId: 'service-6',
				serviceName: 'Parts and Materials',
				description: 'Replacement parts and materials',
				quantity: 1,
				unitPrice: { amount: 250, currency: 'USD' },
				totalPrice: { amount: 250, currency: 'USD' },
				notes: undefined,
			},
		],
		subtotal: { amount: 1750, currency: 'USD' },
		tax: { amount: 140, currency: 'USD' },
		discount: { amount: 0, currency: 'USD' },
		total: { amount: 1890, currency: 'USD' },
		validUntil: '2025-02-25T00:00:00Z',
		expiresAt: '2025-02-25T00:00:00Z',
		revisionNumber: 1,
		parentQuoteId: undefined,
		noteIds: [],
		activityLogIds: [],
		communicationIds: [],
		notes: 'Irrigation system repair',
		terms: undefined,
		createdAt: '2025-01-24T11:00:00Z',
		updatedAt: '2025-01-24T11:00:00Z',
		sentAt: undefined,
		viewedAt: undefined,
		acceptedAt: undefined,
		rejectedAt: undefined,
		rejectionReason: undefined,
	},
];

const mockTemplates: QuoteTemplate[] = [
	{
		id: 'template-1',
		name: 'Standard Lawn Care',
		description: 'Weekly lawn maintenance package',
		lineItems: [
			{
				id: 'li-1',
				serviceId: 'service-1',
				serviceName: 'Lawn Mowing',
				description: 'Weekly lawn mowing service',
				quantity: 4,
				unitPrice: { amount: 75, currency: 'USD' },
				totalPrice: { amount: 300, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-2',
				serviceId: 'service-2',
				serviceName: 'Edging & Trimming',
				description: 'Edging and trimming service',
				quantity: 4,
				unitPrice: { amount: 25, currency: 'USD' },
				totalPrice: { amount: 100, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-3',
				serviceId: 'service-3',
				serviceName: 'Fertilizer Application',
				description: 'Fertilizer application',
				quantity: 1,
				unitPrice: { amount: 150, currency: 'USD' },
				totalPrice: { amount: 150, currency: 'USD' },
				notes: undefined,
			},
		],
		defaultMarkup: 20,
	},
	{
		id: 'template-2',
		name: 'Tree Service Package',
		description: 'Tree trimming and removal',
		lineItems: [
			{
				id: 'li-4',
				serviceId: 'service-4',
				serviceName: 'Tree Trimming',
				description: 'Professional tree trimming',
				quantity: 1,
				unitPrice: { amount: 350, currency: 'USD' },
				totalPrice: { amount: 350, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-5',
				serviceId: 'service-5',
				serviceName: 'Debris Removal',
				description: 'Debris cleanup and removal',
				quantity: 1,
				unitPrice: { amount: 150, currency: 'USD' },
				totalPrice: { amount: 150, currency: 'USD' },
				notes: undefined,
			},
			{
				id: 'li-6',
				serviceId: 'service-6',
				serviceName: 'Equipment Rental',
				description: 'Specialized equipment rental',
				quantity: 1,
				unitPrice: { amount: 200, currency: 'USD' },
				totalPrice: { amount: 200, currency: 'USD' },
				notes: undefined,
			},
		],
		defaultMarkup: 25,
	},
];

export const quoteService = {
	getAll: (): Promise<Quote[]> => asyncify(() => mockQuotes),

	getById: (id: EntityId): Promise<Quote | undefined> =>
		asyncify(() => mockQuotes.find((q) => q.id === id)),

	getByClientId: (clientId: EntityId): Promise<Quote[]> =>
		asyncify(() => mockQuotes.filter((q) => q.clientId === clientId)),

	getTemplates: (): Promise<QuoteTemplate[]> => asyncify(() => mockTemplates),

	getPendingQuotes: (): Promise<Quote[]> =>
		asyncify(() =>
			mockQuotes.filter(
				(q) => q.status === QuoteStatus.SENT || q.status === QuoteStatus.VIEWED,
			),
		),

	getConversionRate: (): Promise<number> => asyncify(() => 68.5), // 68.5% conversion rate
};
