import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function inspectSchema() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	const outputFile = path.join(process.cwd(), 'schema-summary.txt');

	try {
		await client.connect();

		const stream = fs.createWriteStream(outputFile, { flags: 'w' });
		const write = (t: string) => stream.write(t + '\n');

		write('DATABASE SCHEMA OVERVIEW');
		write('=========================');

		// -------------------------
		// TABLES
		// -------------------------
		const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);

		for (const table of tables.rows) {
			write(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
			write(`TABLE: ${table.table_name}`);
			write(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

			// Columns
			const columns = await client.query(
				`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema='public'
        AND table_name=$1
        ORDER BY ordinal_position;
      `,
				[table.table_name],
			);

			write(`\nCOLUMNS`);
			columns.rows.forEach((c) => {
				write(
					`  • ${c.column_name} : ${c.data_type} ${
						c.is_nullable === 'NO' ? 'NOT NULL' : ''
					} ${c.column_default ? `DEFAULT ${c.column_default}` : ''}`,
				);
			});

			// Primary key
			const pk = await client.query(
				`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name=$1
        AND tc.constraint_type='PRIMARY KEY'
      `,
				[table.table_name],
			);

			if (pk.rows.length) {
				write(`\nPRIMARY KEY`);
				pk.rows.forEach((r) => write(`  • ${r.column_name}`));
			}

			// Foreign keys
			const fks = await client.query(
				`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table,
          ccu.column_name AS foreign_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name=$1;
      `,
				[table.table_name],
			);

			if (fks.rows.length) {
				write(`\nFOREIGN KEYS`);
				fks.rows.forEach((fk) =>
					write(
						`  • ${fk.column_name} → ${fk.foreign_table}.${fk.foreign_column}`,
					),
				);
			}
		}

		// -------------------------
		// ENUMS
		// -------------------------
		const enums = await client.query(`
      SELECT 
        t.typname AS enum_name,
        e.enumlabel AS value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY enum_name, e.enumsortorder
    `);

		const enumMap: Record<string, string[]> = {};

		enums.rows.forEach((r) => {
			if (!enumMap[r.enum_name]) enumMap[r.enum_name] = [];
			enumMap[r.enum_name].push(r.value);
		});

		write(`\n\nENUM TYPES`);
		write(`===========`);

		Object.entries(enumMap).forEach(([name, values]) => {
			write(`\n${name}`);
			values.forEach((v) => write(`  • ${v}`));
		});

		// -------------------------
		// RELATIONSHIP GRAPH
		// -------------------------
		const relationships = await client.query(`
      SELECT
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type='FOREIGN KEY'
      ORDER BY source_table;
    `);

		write(`\n\nTABLE RELATIONSHIPS`);
		write(`===================`);

		relationships.rows.forEach((r) => {
			write(
				`${r.source_table}.${r.source_column} → ${r.target_table}.${r.target_column}`,
			);
		});

		stream.end();

		console.log(`Schema report written to ${outputFile}`);
	} catch (e) {
		console.error(e);
	} finally {
		await client.end();
	}
}

inspectSchema();
