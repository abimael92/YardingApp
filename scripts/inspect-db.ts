import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function simplifiedInspect() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	const outputFile = path.join(process.cwd(), 'schema-summary.txt');

	try {
		await client.connect();
		console.log('🔍 Generating schema summary...');

		const summaryStream = fs.createWriteStream(outputFile, { flags: 'w' });

		interface SummaryWriteFn {
			(text: string): boolean;
		}

		const write: SummaryWriteFn = (text: string): boolean =>
			summaryStream.write(text + '\n');

		write('📊 DATABASE SCHEMA SUMMARY\n');
		write('==========================\n');

		// Get all tables with column counts
		const tables = await client.query(`
            SELECT 
                table_name,
                (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
                obj_description(c.oid) as table_description
            FROM information_schema.tables t
            LEFT JOIN pg_class c ON c.relname = t.table_name
            WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);

		write('\n📋 TABLES:\n');

		const newTables = [
			'suppliers',
			'materials',
			'stock_movements',
			'job_materials',
			'purchase_orders',
			'purchase_order_items',
			'equipment',
			'equipment_assignments',
			'equipment_maintenance_logs',
			'equipment_fuel_logs',
			'plant_catalog',
			'plant_inventory',
			'plant_usage',
			'crews',
			'crew_members',
			'schedules',
			'schedule_jobs',
			'route_optimization',
			'job_photos',
			'job_milestones',
			'job_notes',
			'contract_templates',
			'contracts',
			'contract_amendments',
			'communication_templates',
			'client_communications',
			'communication_reminders',
			'client_preferences',
			'report_definitions',
			'saved_reports',
			'dashboard_widgets',
			'user_dashboards',
			'dashboard_widget_assignments',
		];

		for (const table of tables.rows) {
			const isNew = newTables.includes(table.table_name);
			const emoji = isNew ? '🆕' : '📌';
			write(`${emoji} ${table.table_name} (${table.column_count} cols)`);
		}

		// Get enum types
		const enums = await client.query(`
            SELECT 
                t.typname as enum_name,
                COUNT(e.enumlabel) as value_count
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY t.typname
            ORDER BY enum_name;
        `);

		if (enums.rows.length > 0) {
			write('\n🔤 ENUMS:\n');
			enums.rows.forEach((e) => {
				write(`  - ${e.enum_name} (${e.value_count} values)`);
			});
		}

		// Get new tables summary
		const newTablesResult = await client.query(
			`
            SELECT 
                COUNT(*) as total_new,
                SUM((SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name)) as total_columns
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                AND table_name = ANY($1::text[]);
        `,
			[newTables],
		);

		write('\n📊 SUMMARY:\n');
		write(`  Total tables: ${tables.rows.length}`);
		write(`  New tables added: ${newTablesResult.rows[0].total_new}`);
		write(`  New columns added: ${newTablesResult.rows[0].total_columns}`);

		// Check if columns were added to existing tables
		const clientColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            ORDER BY ordinal_position;
        `);

		const jobColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'jobs' 
            ORDER BY ordinal_position;
        `);

		write('\n📋 CLIENTS TABLE:');
		write(`  Total columns: ${clientColumns.rows.length}`);

		write('\n📋 JOBS TABLE:');
		write(`  Total columns: ${jobColumns.rows.length}`);

		summaryStream.end();

		// Minimal terminal output
		console.log('\n✅ Schema summary saved to:', outputFile);
		console.log(
			`   📊 Tables: ${tables.rows.length} total (${newTablesResult.rows[0].total_new} new)`,
		);
		console.log(`   🔤 Enums: ${enums.rows.length}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Error:', errorMessage);
	} finally {
		await client.end();
	}
}

simplifiedInspect();
