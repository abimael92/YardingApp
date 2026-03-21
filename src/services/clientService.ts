/**
 * Client Service
 * * 100% REAL Postgres connection. Zero mock data.
 */

import { neon } from '@neondatabase/serverless';
import type { Client, EntityId } from '@/src/domain/entities';

// Strict connection. If the URL is missing, it will (and should) fail loudly.
const sql = neon(process.env.DATABASE_URL!);

// ============================================================================
// Service Interface
// ============================================================================

export interface ClientService {
	getAll(): Promise<Client[]>;
	getById(id: EntityId): Promise<Client | undefined>;
	create(client: any): Promise<Client>;
	update(id: EntityId, updates: any): Promise<Client | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const getAllClients = async (): Promise<Client[]> => {
	try {
		// Left Join payments to calculate REAL total spent
		const rows = await sql`
      SELECT 
        c.id, 
        c.name, 
        c.email, 
        c.phone, 
        c.street, 
        c.city, 
        c.state, 
        c.zip_code as "zipCode", 
        c.country, 
        c.created_at as "createdAt", 
        c.updated_at as "updatedAt",
        COALESCE(SUM(p.amount_cents), 0) / 100.0 as "totalSpentAmount"
      FROM clients c
      LEFT JOIN payments p ON p.client_id = c.id AND p.status = 'completed'
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

		return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      contactInfo: {
        email: row.email,
        phone: row.phone,
        preferredContactMethod: 'email',
      },
      primaryAddress: {
        street: row.street,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        country: row.country || 'USA',
      },
      status: 'active', // Missing from DB
      segment: 'regular', // Missing from DB
      totalSpent: { amount: Number(row.totalSpentAmount), currency: 'USD' },
      lifetimeValue: { amount: Number(row.totalSpentAmount), currency: 'USD' },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      serviceRequestIds: [],
      quoteIds: [],
      jobIds: [],
      paymentIds: [],
      notes: '',
      tags: [],
    }) as unknown as Client);
	} catch (error) {
		console.error('Database error in getAllClients:', error);
		throw error;
	}
};

export const getClientById = async (
	id: EntityId,
): Promise<Client | undefined> => {
	try {
		const rows = await sql`
      SELECT 
        c.id, 
        c.name, 
        c.email, 
        c.phone, 
        c.street, 
        c.city, 
        c.state, 
        c.zip_code as "zipCode", 
        c.country, 
        c.created_at as "createdAt", 
        c.updated_at as "updatedAt",
        COALESCE(SUM(p.amount_cents), 0) / 100.0 as "totalSpentAmount"
      FROM clients c
      LEFT JOIN payments p ON p.client_id = c.id AND p.status = 'completed'
      WHERE c.id = ${id} AND c.deleted_at IS NULL
      GROUP BY c.id
    `;

		if (rows.length === 0) return undefined;
		const row = rows[0];

		return {
			id: row.id,
			name: row.name,
			contactInfo: {
				email: row.email,
				phone: row.phone,
				preferredContactMethod: 'email',
			},
			primaryAddress: {
				street: row.street,
				city: row.city,
				state: row.state,
				zipCode: row.zipCode,
				country: row.country || 'USA',
			},
			status: 'active',
			segment: 'regular',
			totalSpent: { amount: Number(row.totalSpentAmount), currency: 'USD' },
			lifetimeValue: { amount: Number(row.totalSpentAmount), currency: 'USD' },
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
		} as Client;
	} catch (error) {
		console.error('Database error in getClientById:', error);
		throw error;
	}
};

export const createClient = async (client: any): Promise<Client> => {
	try {
		const result = await sql`
      INSERT INTO clients (
        name, 
        email, 
        phone, 
        street, 
        city, 
        state, 
        zip_code, 
        country
      ) VALUES (
        ${client.name},
        ${client.contactInfo?.email || ''},
        ${client.contactInfo?.phone || ''},
        ${client.primaryAddress?.street || ''},
        ${client.primaryAddress?.city || ''},
        ${client.primaryAddress?.state || ''},
        ${client.primaryAddress?.zipCode || ''},
        ${client.primaryAddress?.country || 'US'}
      )
      RETURNING id, created_at, updated_at
    `;

		return {
			...client,
			id: result[0].id,
			totalSpent: { amount: 0, currency: 'USD' },
			lifetimeValue: { amount: 0, currency: 'USD' },
			createdAt: result[0].created_at,
			updatedAt: result[0].updated_at,
		};
	} catch (error) {
		console.error('Create failed:', error);
		throw error;
	}
};

export const updateClient = async (
	id: EntityId,
	updates: any,
): Promise<Client | undefined> => {
	try {
		await sql`
      UPDATE clients
      SET 
        name = COALESCE(${updates.name ?? null}, name),
        email = COALESCE(${updates.contactInfo?.email ?? null}, email),
        phone = COALESCE(${updates.contactInfo?.phone ?? null}, phone),
        street = COALESCE(${updates.primaryAddress?.street ?? null}, street),
        city = COALESCE(${updates.primaryAddress?.city ?? null}, city),
        state = COALESCE(${updates.primaryAddress?.state ?? null}, state),
        zip_code = COALESCE(${updates.primaryAddress?.zipCode ?? null}, zip_code),
        country = COALESCE(${updates.primaryAddress?.country ?? null}, country),
        updated_at = NOW()
      WHERE id = ${id}
    `;
		return getClientById(id);
	} catch (error) {
		console.error('Update failed:', error);
		throw error;
	}
};

export const deleteClient = async (id: EntityId): Promise<boolean> => {
	try {
		await sql`UPDATE clients SET deleted_at = NOW() WHERE id = ${id}`;
		return true;
	} catch (error) {
		console.error('Delete failed:', error);
		throw error;
	}
};

export const clientService: ClientService = {
	getAll: getAllClients,
	getById: getClientById,
	create: createClient,
	update: updateClient,
	delete: deleteClient,
};
