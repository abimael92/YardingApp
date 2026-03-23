/**
 * Equipment Service
 * 100% REAL Postgres connection via Neon.
 * Maps frontend multi-step form data to the equipment table schema.
 */

import { neon } from '@neondatabase/serverless';
import type { EntityId } from '@/src/domain/entities';

// Strict connection.
const sql = neon(process.env.DATABASE_URL!);

// ============================================================================
// Service Interface
// ============================================================================

export interface EquipmentService {
	getAll(): Promise<any[]>;
	getById(id: string): Promise<any | undefined>;
	create(data: any): Promise<any>;
	update(id: string, updates: any): Promise<any | undefined>;
	delete(id: string): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const getAllEquipment = async (): Promise<any[]> => {
	try {
		const rows = await sql`
      SELECT 
        e.*, 
        ec.name as "categoryName"
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      WHERE e.is_active = true
      ORDER BY e.created_at DESC
    `;
		return rows;
	} catch (error) {
		console.error('Database error in getAllEquipment:', error);
		throw error;
	}
};

export const getEquipmentById = async (
	id: string,
): Promise<any | undefined> => {
	try {
		const rows = await sql`
      SELECT e.*, ec.name as "categoryName"
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      WHERE e.id = ${id} AND e.is_active = true
    `;

		if (rows.length === 0) return undefined;
		return rows[0];
	} catch (error) {
		console.error('Database error in getEquipmentById:', error);
		throw error;
	}
};

export const createEquipment = async (data: any): Promise<any> => {
	try {
		// Note: We map UI fields to the exact snake_case DB columns
		const result = await sql`
      INSERT INTO equipment (
        name, 
        type, 
        category_id, 
        status, 
        hours_meter, 
        manufacturer, 
        model, 
        year, 
        serial_number, 
        purchase_date, 
        purchase_price_cents, 
        fuel_type, 
        requires_license, 
        required_license_type, 
        location, 
        service_zone_id, 
        vin, 
        license_plate, 
        gvwr, 
        axles, 
        tank_capacity, 
        blade_condition, 
        notes,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${data.name},
        ${data.type || 'Machinery'},
        ${data.category_id || null},
        ${data.status || 'operational'},
        ${Number(data.hours_meter) || 0},
        ${data.manufacturer || null},
        ${data.model || null},
        ${data.year || new Date().getFullYear()},
        ${data.serial_number || null},
        ${data.purchase_date || null},
        ${data.purchase_price_cents || 0},
        ${data.fuel_type || 'gasoline'},
        ${data.requires_license || false},
        ${data.required_license_type || null},
        ${data.location || 'Phoenix Yard'},
        ${data.service_zone_id || null},
        ${data.vin || null},
        ${data.license_plate || null},
        ${data.gvwr || 0},
        ${data.axles || '2'},
        ${data.tank_capacity || 0},
        ${data.blade_condition || 'Good'},
        ${data.notes || null},
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

		return result[0];
	} catch (error) {
		console.error('Create equipment failed:', error);
		throw error;
	}
};

export const updateEquipment = async (
	id: string,
	updates: any,
): Promise<any | undefined> => {
	try {
		await sql`
      UPDATE equipment
      SET 
        name = COALESCE(${updates.name ?? null}, name),
        category_id = COALESCE(${updates.category_id ?? null}, category_id),
        status = COALESCE(${updates.status ?? null}, status),
        hours_meter = COALESCE(${updates.hours_meter ?? null}, hours_meter),
        location = COALESCE(${updates.location ?? null}, location),
        service_zone_id = COALESCE(${updates.service_zone_id ?? null}, service_zone_id),
        notes = COALESCE(${updates.notes ?? null}, notes),
        updated_at = NOW()
      WHERE id = ${id}
    `;
		return getEquipmentById(id);
	} catch (error) {
		console.error('Update equipment failed:', error);
		throw error;
	}
};

export const deleteEquipment = async (id: string): Promise<boolean> => {
	try {
		// Soft delete to keep maintenance logs intact
		await sql`UPDATE equipment SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
		return true;
	} catch (error) {
		console.error('Delete equipment failed:', error);
		throw error;
	}
};

export const equipmentService: EquipmentService = {
	getAll: getAllEquipment,
	getById: getEquipmentById,
	create: createEquipment,
	update: updateEquipment,
	delete: deleteEquipment,
};
