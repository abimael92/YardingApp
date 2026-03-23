/**
 * Equipment Service
 * Full implementation mapping to the provided Postgres Schema.
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface EquipmentService {
	getAll(): Promise<any[]>;
	getById(id: string): Promise<any | undefined>;
	create(data: any): Promise<any>;
	update(id: string, updates: any): Promise<any | undefined>;
	delete(id: string): Promise<boolean>;
}

export const equipmentService: EquipmentService = {
	getAll: async () => {
		try {
			return await sql`
        SELECT e.*, ec.name as "categoryName"
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        WHERE e.is_active = true
        ORDER BY e.created_at DESC
      `;
		} catch (error) {
			console.error('Failed to fetch equipment:', error);
			throw error;
		}
	},

	getById: async (id: string) => {
		try {
			const rows = await sql`
        SELECT e.*, ec.name as "categoryName"
        FROM equipment e
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        WHERE e.id = ${id} AND e.is_active = true
      `;
			return rows[0];
		} catch (error) {
			console.error('Failed to fetch asset:', error);
			throw error;
		}
	},

	create: async (d: any) => {
		try {
			const result = await sql`
        INSERT INTO equipment (
          name, 
          type, 
          manufacturer, 
          model, 
          year, 
          serial_number, 
          plate_number, 
          identification_number, 
          purchase_date, 
          purchase_price_cents, 
          current_value_cents, 
          status, 
          condition, 
          location, 
          hourly_rate_cents, 
          daily_rate_cents, 
          weekly_rate_cents, 
          fuel_type, 
          hours_meter, 
          last_maintenance_date, 
          next_maintenance_date, 
          maintenance_interval_hours, 
          notes, 
          image_url, 
          is_active, 
          created_at, 
          updated_at, 
          created_by, 
          warranty_expiration, 
          requires_license, 
          required_license_type, 
          requires_training, 
          storage_location, 
          current_crew_id, 
          current_job_id, 
          insurance_expiration, 
          category_id
        ) VALUES (
          ${d.name}, 
          ${d.type || 'Machinery'}, 
          ${d.manufacturer || null}, 
          ${d.model || null}, 
          ${d.year || new Date().getFullYear()}, 
          ${d.serial_number || null}, 
          ${d.plate_number || null}, 
          ${d.identification_number || null}, 
          ${d.purchase_date || null}, 
          ${d.purchase_price_cents || 0}, 
          ${d.current_value_cents || 0}, 
          ${d.status || 'available'}, 
          ${d.condition || 'Good'}, 
          ${d.location || 'Phoenix Yard'}, 
          ${d.hourly_rate_cents || 0}, 
          ${d.daily_rate_cents || 0}, 
          ${d.weekly_rate_cents || 0}, 
          ${d.fuel_type || 'gasoline'}, 
          ${Number(d.hours_meter) || 0}, 
          ${d.last_maintenance_date || null}, 
          ${d.next_maintenance_date || null}, 
          ${d.maintenance_interval_hours || 250}, 
          ${d.notes || null}, 
          ${d.image_url || null}, 
          true, 
          NOW(), 
          NOW(), 
          ${d.created_by || null}, 
          ${d.warranty_expiration || null}, 
          ${d.requires_license || false}, 
          ${d.required_license_type || null}, 
          ${d.requires_training || false}, 
          ${d.storage_location || null}, 
          ${d.current_crew_id || null}, 
          ${d.current_job_id || null}, 
          ${d.insurance_expiration || null}, 
          ${d.category_id || null}
        ) RETURNING *`;
			return result[0];
		} catch (error) {
			console.error('Create equipment failed:', error);
			throw error;
		}
	},

	update: async (id: string, u: any) => {
		try {
			const result = await sql`
        UPDATE equipment
        SET 
          name = COALESCE(${u.name}, name),
          type = COALESCE(${u.type}, type),
          manufacturer = COALESCE(${u.manufacturer}, manufacturer),
          model = COALESCE(${u.model}, model),
          year = COALESCE(${u.year}, year),
          serial_number = COALESCE(${u.serial_number}, serial_number),
          status = COALESCE(${u.status}, status),
          condition = COALESCE(${u.condition}, condition),
          hours_meter = COALESCE(${u.hours_meter}, hours_meter),
          location = COALESCE(${u.location}, location),
          category_id = COALESCE(${u.category_id}, category_id),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
			return result[0];
		} catch (error) {
			console.error('Update equipment failed:', error);
			throw error;
		}
	},

	delete: async (id: string) => {
		try {
			await sql`UPDATE equipment SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
			return true;
		} catch (error) {
			console.error('Delete equipment failed:', error);
			throw error;
		}
	},
};
