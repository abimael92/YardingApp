import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function queryData() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	const outputFile = path.join(process.cwd(), 'database-data.json');
	const summaryFile = path.join(process.cwd(), 'database-summary.txt');

	try {
		await client.connect();

		// Show only minimal progress in terminal
		console.log('🔍 Querying database data...');
		console.log('📊 Writing to:', outputFile);

		// Collect all data
		const data: Record<string, any> = {};

		// Users (limited to 5 for simplicity)
		const users = await client.query(`
            SELECT id, email, role, email_verified 
            FROM "User" 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
		data.users = users.rows;

		// Profiles (limited)
		const profiles = await client.query(`
            SELECT id, user_id, full_name, status 
            FROM profiles 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
		data.profiles = profiles.rows;

		// Clients (limited)
		const clients = await client.query(`
            SELECT id, name, email, city, state, phone 
            FROM clients 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
		data.clients = clients.rows;

		// Jobs (limited)
		const jobs = await client.query(`
            SELECT id, job_number, title, status, client_id, quoted_price_cents
            FROM jobs 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
		data.jobs = jobs.rows;

		// Invoices (limited)
		const invoices = await client.query(`
            SELECT id, invoice_number, status, total_cents, due_date
            FROM invoices 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);
		data.invoices = invoices.rows;

		// New tables data (sample)
		if (await tableExists(client, 'materials')) {
			const materials = await client.query(`
                SELECT id, name, category, current_stock, unit
                FROM materials 
                LIMIT 5;
            `);
			data.materials = materials.rows;
		}

		if (await tableExists(client, 'equipment')) {
			const equipment = await client.query(`
                SELECT id, name, type, status, hourly_rate_cents
                FROM equipment 
                LIMIT 5;
            `);
			data.equipment = equipment.rows;
		}

		if (await tableExists(client, 'crews')) {
			const crews = await client.query(`
                SELECT id, name, supervisor_id, is_active
                FROM crews 
                LIMIT 5;
            `);
			data.crews = crews.rows;
		}

		if (await tableExists(client, 'contracts')) {
			const contracts = await client.query(`
                SELECT id, contract_number, title, status, total_value_cents
                FROM contracts 
                LIMIT 5;
            `);
			data.contracts = contracts.rows;
		}

		// Get counts for summary
		const counts = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM "User") as user_count,
                (SELECT COUNT(*) FROM profiles) as profile_count,
                (SELECT COUNT(*) FROM clients) as client_count,
                (SELECT COUNT(*) FROM jobs) as job_count,
                (SELECT COUNT(*) FROM invoices) as invoice_count,
                (SELECT COUNT(*) FROM materials) as material_count,
                (SELECT COUNT(*) FROM equipment) as equipment_count,
                (SELECT COUNT(*) FROM crews) as crew_count,
                (SELECT COUNT(*) FROM contracts) as contract_count,
                (SELECT COUNT(*) FROM client_communications) as communication_count;
        `);

		data.counts = counts.rows[0];

		// Write full data to JSON file
		fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

		// Write summary to text file
		const summaryStream = fs.createWriteStream(summaryFile, { flags: 'w' });

		summaryStream.write('📊 DATABASE SUMMARY\n');
		summaryStream.write('==================\n\n');

		summaryStream.write('RECORD COUNTS:\n');
		summaryStream.write(`👤 Users: ${data.counts.user_count}\n`);
		summaryStream.write(`📋 Profiles: ${data.counts.profile_count}\n`);
		summaryStream.write(`🤝 Clients: ${data.counts.client_count}\n`);
		summaryStream.write(`🔧 Jobs: ${data.counts.job_count}\n`);
		summaryStream.write(`💰 Invoices: ${data.counts.invoice_count}\n`);

		if (data.counts.material_count > 0) {
			summaryStream.write(`📦 Materials: ${data.counts.material_count}\n`);
		}
		if (data.counts.equipment_count > 0) {
			summaryStream.write(`🚜 Equipment: ${data.counts.equipment_count}\n`);
		}
		if (data.counts.crew_count > 0) {
			summaryStream.write(`👥 Crews: ${data.counts.crew_count}\n`);
		}
		if (data.counts.contract_count > 0) {
			summaryStream.write(`📝 Contracts: ${data.counts.contract_count}\n`);
		}
		if (data.counts.communication_count > 0) {
			summaryStream.write(
				`💬 Communications: ${data.counts.communication_count}\n`,
			);
		}

		summaryStream.write('\n📋 SAMPLE DATA:\n');
		summaryStream.write('===============\n\n');

		summaryStream.write('👤 Recent Users:\n');
		data.users.forEach((u) => {
			summaryStream.write(`  - ${u.email} (${u.role})\n`);
		});

		summaryStream.write('\n🤝 Recent Clients:\n');
		data.clients.forEach((c) => {
			summaryStream.write(`  - ${c.name} | ${c.city}, ${c.state}\n`);
		});

		summaryStream.write('\n🔧 Recent Jobs:\n');
		data.jobs.forEach((j) => {
			summaryStream.write(`  - ${j.job_number}: ${j.title} (${j.status})\n`);
		});

		if (data.materials) {
			summaryStream.write('\n📦 Recent Materials:\n');
			data.materials.forEach((m) => {
				summaryStream.write(`  - ${m.name} | ${m.current_stock} ${m.unit}\n`);
			});
		}

		if (data.equipment) {
			summaryStream.write('\n🚜 Recent Equipment:\n');
			data.equipment.forEach((e) => {
				summaryStream.write(`  - ${e.name} | ${e.status}\n`);
			});
		}

		if (data.contracts) {
			summaryStream.write('\n📝 Recent Contracts:\n');
			data.contracts.forEach((c) => {
				summaryStream.write(`  - ${c.contract_number}: ${c.title}\n`);
			});
		}

		summaryStream.end();

		// Minimal terminal output
		console.log('\n📊 SUMMARY:');
		console.log(`  👤 Users: ${data.counts.user_count}`);
		console.log(`  📋 Profiles: ${data.counts.profile_count}`);
		console.log(`  🤝 Clients: ${data.counts.client_count}`);
		console.log(`  🔧 Jobs: ${data.counts.job_count}`);
		console.log(`  💰 Invoices: ${data.counts.invoice_count}`);

		if (data.counts.material_count > 0) {
			console.log(`  📦 Materials: ${data.counts.material_count}`);
		}
		if (data.counts.equipment_count > 0) {
			console.log(`  🚜 Equipment: ${data.counts.equipment_count}`);
		}
	} catch (error) {
		console.error('❌ Error:', error instanceof Error ? error.message : String(error));
	} finally {
		await client.end();
		console.log('\n✅ Done! Files created:');
		console.log(`   - database-data.json (full data)`);
		console.log(`   - database-summary.txt (summary)`);
	}
}

// Helper function to check if table exists
async function tableExists(client, tableName) {
	const result = await client.query(
		`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
        );
    `,
		[tableName],
	);
	return result.rows[0].exists;
}

queryData();
