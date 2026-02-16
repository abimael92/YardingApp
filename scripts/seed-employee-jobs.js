import { Client as PgClient } from 'pg';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

async function seedEmployeeJobs() {
	const client = new PgClient({
		connectionString: process.env.DATABASE_URL,
	});

	try {
		await client.connect();
		console.log('✅ Connected to database\n');

		// Get all active employees
		const employees = await client.query(`
            SELECT id, full_name 
            FROM profiles 
            WHERE status = 'active'
            AND id IN (
                SELECT profile_id FROM user_roles 
                WHERE role_id IN (SELECT id FROM roles WHERE name = 'employee')
            )
        `);
		console.log(`Found ${employees.rows.length} active employees\n`);

		// Get all jobs
		const jobs = await client.query(`
            SELECT id, status, created_at 
            FROM jobs
            WHERE status IN ('scheduled', 'in_progress', 'completed')
        `);
		console.log(`Found ${jobs.rows.length} jobs to assign\n`);

		let assigned = 0;

		// Assign 1-3 employees to each job
		for (const job of jobs.rows) {
			const numEmployees = randomInt(1, 3);
			const shuffled = [...employees.rows].sort(() => 0.5 - Math.random());
			const selected = shuffled.slice(0, numEmployees);

			for (const employee of selected) {
				// Check if already assigned
				const existing = await client.query(
					'SELECT id FROM employee_jobs WHERE employee_id = $1 AND job_id = $2',
					[employee.id, job.id]
				);

				if (existing.rows.length === 0) {
					await client.query(
						`INSERT INTO employee_jobs (id, employee_id, job_id, assigned_at, status)
                         VALUES ($1, $2, $3, $4, $5)`,
						[
							randomUUID(),
							employee.id,
							job.id,
							job.created_at,
							job.status === 'completed' ? 'completed' : 'assigned'
						]
					);
					assigned++;
				}
			}
		}

		console.log(`✅ Assigned ${assigned} employee-job relationships\n`);

		// Show sample
		const sample = await client.query(`
            SELECT ej.*, p.full_name as employee_name, j.job_number
            FROM employee_jobs ej
            JOIN profiles p ON ej.employee_id = p.id
            JOIN jobs j ON ej.job_id = j.id
            LIMIT 5
        `);

		console.log('📋 Sample assignments:');
		sample.rows.forEach(row => {
			console.log(`  - ${row.employee_name} → Job ${row.job_number} (${row.status})`);
		});

	} catch (error) {
		console.error('❌ Error:', error);
	} finally {
		await client.end();
	}
}

seedEmployeeJobs()
	.then(() => {
		console.log('\n✨ Employee jobs seeding complete');
		process.exit(0);
	})
	.catch((error) => {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	});