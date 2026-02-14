import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function inspectDatabase() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	try {
		await client.connect();
		console.log('🔍 Inspecting database schema...\n');

		// Get all tables
		const tables = await client.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

		console.log('📊 Tables found:');
		for (const table of tables.rows) {
			console.log(`\n📋 Table: ${table.table_name}`);

			// Get columns for each table
			const columns = await client.query(
				`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `,
				[table.table_name],
			);

			console.log('  Columns:');
			columns.rows.forEach((col) => {
				const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
				const defaultVal = col.column_default
					? ` DEFAULT ${col.column_default}`
					: '';
				console.log(
					`    - ${col.column_name} (${col.data_type}) ${nullable}${defaultVal}`,
				);
			});

			// Get primary keys
			const pk = await client.query(
				`
        SELECT
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY';
      `,
				[table.table_name],
			);

			if (pk.rows.length > 0) {
				console.log(
					`  🔑 Primary Key: ${pk.rows.map((p) => p.column_name).join(', ')}`,
				);
			}

			// Get foreign keys
			const fk = await client.query(
				`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY';
      `,
				[table.table_name],
			);

			if (fk.rows.length > 0) {
				console.log('  🔗 Foreign Keys:');
				fk.rows.forEach((f) => {
					console.log(
						`    - ${f.column_name} → ${f.foreign_table_name}(${f.foreign_column_name})`,
					);
				});
			}
		}

		// Get enum types if any
		const enums = await client.query(`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY enum_name, e.enumsortorder;
    `);

		if (enums.rows.length > 0) {
			console.log('\n🔤 Enum Types:');
			const enumMap = new Map();
			enums.rows.forEach((e) => {
				if (!enumMap.has(e.enum_name)) {
					enumMap.set(e.enum_name, []);
				}
				enumMap.get(e.enum_name).push(e.enum_value);
			});

			enumMap.forEach((values, name) => {
				console.log(`  - ${name}: ${values.join(', ')}`);
			});
		}
	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await client.end();
	}
}

inspectDatabase()
	.then(() => {
		console.log('\n✅ Database inspection complete');
		process.exit(0);
	})
	.catch((error) => {
		console.error('❌ Error inspecting database:', error);
		process.exit(1);
	});
