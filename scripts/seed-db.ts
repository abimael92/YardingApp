import { Client as PgClient } from 'pg';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ============================================================================
// Types
// ============================================================================

interface Profile {
	id: string;
	user_id: string;
	full_name: string;
	email: string;
	role: 'admin' | 'manager' | 'employee' | 'client';
	status: 'active' | 'pending' | 'inactive';
}

interface ClientRecord {
	id: string;
	name: string;
	email: string;
	phone: string;
	street: string;
	city: string;
	state: string;
	zip_code: string;
	country: string;
	created_at: Date;
	created_by: string;
}

interface Job {
	id: string;
	job_number: string;
	client_id: string;
	status:
		| 'draft'
		| 'quoted'
		| 'scheduled'
		| 'in_progress'
		| 'completed'
		| 'cancelled'
		| 'on_hold';
	title: string;
	description: string;
	street: string;
	city: string;
	state: string;
	zip_code: string;
	country: string;
	quoted_price_cents: number;
	currency: string;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

interface JobItem {
	id: string;
	job_id: string;
	service_id: string | null;
	description: string;
	quantity: number;
	unit_price_cents: number;
	total_cents: number;
	sort_order: number;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

interface Service {
	id: string;
	name: string;
	description: string;
	category: string;
	price_display: string;
	duration: string;
	features: any;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

interface Invoice {
	id: string;
	invoice_number: string;
	client_id: string;
	job_id: string | null;
	status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
	amount_cents: number;
	tax_cents: number;
	total_cents: number;
	currency: string;
	due_date: Date;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

interface PaymentIntent {
	id: string;
	client_id: string;
	invoice_id: string | null;
	amount_cents: number;
	currency: string;
	status:
		| 'requires_payment_method'
		| 'requires_confirmation'
		| 'requires_action'
		| 'processing'
		| 'succeeded'
		| 'cancelled';
	method:
		| 'credit_card'
		| 'debit_card'
		| 'ach'
		| 'check'
		| 'cash'
		| 'other'
		| null;
	processor: string | null;
	processor_intent_id: string | null;
	metadata: any;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

interface Payment {
	id: string;
	payment_number: string;
	payment_intent_id: string | null;
	client_id: string;
	invoice_id: string | null;
	job_id: string | null;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	method: 'credit_card' | 'debit_card' | 'ach' | 'check' | 'cash' | 'other';
	amount_cents: number;
	currency: string;
	transaction_id: string | null;
	processor: string | null;
	processor_response: any;
	created_at: Date;
	updated_at: Date;
	created_by: string;
}

// ============================================================================
// Configuration
// ============================================================================

const END_DATE = new Date('2025-12-31T23:59:59Z');
const START_DATE = new Date('2023-01-01T00:00:00Z');

const CLIENTS_COUNT = 25;
const EMPLOYEES_COUNT = 15;
const JOBS_PER_CLIENT_MIN = 2;
const JOBS_PER_CLIENT_MAX = 8;

// ============================================================================
// Helper Functions
// ============================================================================

function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function formatCurrency(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const FIRST_NAMES = [
	'James',
	'Mary',
	'John',
	'Patricia',
	'Robert',
	'Jennifer',
	'Michael',
	'Linda',
];
const LAST_NAMES = [
	'Smith',
	'Johnson',
	'Williams',
	'Brown',
	'Jones',
	'Garcia',
	'Miller',
	'Davis',
];
const STREET_NAMES = [
	'Main St',
	'Oak Ave',
	'Maple Dr',
	'Cedar Ln',
	'Pine St',
	'Elm St',
	'Desert View Dr',
	'Cactus Rd',
];
const CITIES = [
	'Phoenix',
	'Scottsdale',
	'Tempe',
	'Mesa',
	'Chandler',
	'Gilbert',
	'Glendale',
];
const STATES = ['AZ'];
const ZIP_CODES = ['85001', '85251', '85282', '85202', '85234'];

const JOB_TITLES = [
	'Desert Landscape Installation',
	'Irrigation System Repair',
	'Tree Trimming',
	'Lawn Maintenance',
	'Xeriscape Design',
	'Patio Installation',
	'Retaining Wall',
];

const JOB_DESCRIPTIONS = [
	'Complete desert landscape makeover with native plants',
	'Emergency irrigation repair and system check',
	'Seasonal tree trimming and palm frond removal',
	'Weekly lawn maintenance and edging service',
	'Full xeriscape conversion with drip irrigation',
	'Custom patio installation with pavers',
];

const SERVICE_CATEGORIES = [
	'Landscape Design',
	'Installation',
	'Maintenance',
	'Irrigation',
	'Tree Care',
];

const SERVICES = [
	{ name: 'Desert Landscape Design', price: 2500, duration: '2-3 weeks' },
	{ name: 'Irrigation System Installation', price: 3500, duration: '1 week' },
	{ name: 'Tree Trimming (per tree)', price: 300, duration: '2-4 hours' },
	{ name: 'Lawn Maintenance (monthly)', price: 150, duration: 'ongoing' },
	{ name: 'Xeriscape Conversion', price: 5000, duration: '2-3 weeks' },
	{ name: 'Patio Installation', price: 8000, duration: '2 weeks' },
];

// ============================================================================
// Main Seed Function
// ============================================================================

async function seedDatabase() {
	const client = new PgClient({
		connectionString: process.env.DATABASE_URL,
		connectionTimeoutMillis: 30000,
		query_timeout: 30000,
	});

	client.on('error', (err) => {
		console.error('Unexpected database error:', err);
	});

	try {
		await client.connect();
		console.log('✅ Connected to database\n');
		console.log('🌱 Starting database seed...\n');

		await client.query('BEGIN');

		// ========================================================================
		// 1. Create roles
		// ========================================================================
		console.log('Creating roles...');

		const adminRoleId = randomUUID();
		const managerRoleId = randomUUID();
		const employeeRoleId = randomUUID();
		const clientRoleId = randomUUID();

		await client.query(
			`DELETE FROM roles WHERE name IN ('admin', 'manager', 'employee', 'client')`,
		);

		await client.query(
			`INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
       ($1, 'admin', 'System administrator with full access', NOW(), NOW()),
       ($2, 'manager', 'Manager with operational access', NOW(), NOW()),
       ($3, 'employee', 'Field employee with limited access', NOW(), NOW()),
       ($4, 'client', 'Client portal access', NOW(), NOW())`,
			[adminRoleId, managerRoleId, employeeRoleId, clientRoleId],
		);

		const roleMap = new Map();
		roleMap.set('admin', adminRoleId);
		roleMap.set('manager', managerRoleId);
		roleMap.set('employee', employeeRoleId);
		roleMap.set('client', clientRoleId);

		console.log('✅ Roles created\n');
		await delay(500);

		// ========================================================================
		// 2. Create admin user
		// ========================================================================
		console.log('Creating admin user...');

		const adminProfileId = randomUUID();
		const adminUserId = randomUUID();

		await client.query(
			`INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
       VALUES ($1, $2, 'System Admin', NOW(), NOW())`,
			[adminProfileId, adminUserId],
		);

		await client.query(
			`INSERT INTO user_roles (profile_id, role_id, created_at)
       VALUES ($1, $2, NOW())`,
			[adminProfileId, roleMap.get('admin')],
		);

		console.log(`✅ Admin created with profile ID: ${adminProfileId}\n`);
		await delay(500);

		// ========================================================================
		// 3. Create employees
		// ========================================================================
		console.log(`Creating ${EMPLOYEES_COUNT} employees...`);

		const employeeProfiles: Profile[] = [];
		for (let i = 0; i < EMPLOYEES_COUNT; i++) {
			const firstName = randomElement(FIRST_NAMES);
			const lastName = randomElement(LAST_NAMES);
			const fullName = `${firstName} ${lastName}`;
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@jjlandscaping.com`;
			const profileId = randomUUID();
			const userId = randomUUID();

			await client.query(
				`INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
				[profileId, userId, fullName],
			);

			await client.query(
				`INSERT INTO user_roles (profile_id, role_id, created_at)
         VALUES ($1, $2, NOW())`,
				[profileId, roleMap.get('employee')],
			);

			employeeProfiles.push({
				id: profileId,
				user_id: userId,
				full_name: fullName,
				email,
				role: 'employee',
				status: 'active',
			});

			if ((i + 1) % 5 === 0) {
				console.log(`  Created ${i + 1}/${EMPLOYEES_COUNT} employees`);
				await delay(500);
			}
		}
		console.log(`✅ Created ${employeeProfiles.length} employees\n`);
		await delay(1000);

		// ========================================================================
		// 4. Create clients
		// ========================================================================
		console.log(`Creating ${CLIENTS_COUNT} clients...`);

		const clients: ClientRecord[] = [];

		for (let i = 0; i < CLIENTS_COUNT; i++) {
			const firstName = randomElement(FIRST_NAMES);
			const lastName = randomElement(LAST_NAMES);
			const fullName = `${firstName} ${lastName}`;
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
			const phone = `602-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
			const profileId = randomUUID();
			const userId = randomUUID();
			const clientId = randomUUID();
			const createdAt = randomDate(START_DATE, END_DATE);

			await client.query(
				`INSERT INTO profiles (id, user_id, full_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4)`,
				[profileId, userId, fullName, createdAt],
			);

			await client.query(
				`INSERT INTO user_roles (profile_id, role_id, created_at)
         VALUES ($1, $2, $3)`,
				[profileId, roleMap.get('client'), createdAt],
			);

			await client.query(
				`INSERT INTO clients (
          id, name, email, phone, street, city, state, zip_code, country,
          created_at, updated_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11)`,
				[
					clientId,
					fullName,
					email,
					phone,
					`${randomInt(100, 9999)} ${randomElement(STREET_NAMES)}`,
					randomElement(CITIES),
					randomElement(STATES),
					randomElement(ZIP_CODES),
					'US',
					createdAt,
					adminProfileId,
				],
			);

			clients.push({
				id: clientId,
				name: fullName,
				email,
				phone,
				street: `${randomInt(100, 9999)} ${randomElement(STREET_NAMES)}`,
				city: randomElement(CITIES),
				state: randomElement(STATES),
				zip_code: randomElement(ZIP_CODES),
				country: 'US',
				created_at: createdAt,
				created_by: adminProfileId,
			});

			if ((i + 1) % 5 === 0) {
				console.log(`  Created ${i + 1}/${CLIENTS_COUNT} clients`);
				await delay(500);
			}
		}
		console.log(`✅ Created ${clients.length} clients\n`);
		await delay(1000);

		// ========================================================================
		// 5. Create services
		// ========================================================================
		console.log('Creating services...');

		const services: Service[] = [];
		for (const service of SERVICES) {
			const serviceId = randomUUID();
			const priceCents = service.price * 100;

			await client.query(
				`INSERT INTO services (
          id, name, description, category, price_display, duration, features,
          created_at, updated_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)`,
				[
					serviceId,
					service.name,
					`Professional ${service.name.toLowerCase()} service for desert landscapes`,
					randomElement(SERVICE_CATEGORIES),
					formatCurrency(priceCents),
					service.duration,
					JSON.stringify(['licensed', 'insured', 'warranty']),
					adminProfileId,
				],
			);

			services.push({
				id: serviceId,
				name: service.name,
				description: `Professional ${service.name.toLowerCase()} service for desert landscapes`,
				category: randomElement(SERVICE_CATEGORIES),
				price_display: formatCurrency(priceCents),
				duration: service.duration,
				features: ['licensed', 'insured', 'warranty'],
				created_at: new Date(),
				updated_at: new Date(),
				created_by: adminProfileId,
			});
		}
		console.log(`✅ Created ${services.length} services\n`);
		await delay(1000);

		// ========================================================================
		// 6. Create jobs and related data
		// ========================================================================
		console.log('Creating jobs, job items, invoices, and payments...');

		const jobs: Job[] = [];
		let jobCounter = 1000;
		let paymentCounter = 10000;

		const paymentMethods: Payment['method'][] = [
			'credit_card',
			'debit_card',
			'ach',
			'check',
			'cash',
		];

		let clientIndex = 0;
		for (const clientRecord of clients) {
			clientIndex++;
			const numJobs = randomInt(JOBS_PER_CLIENT_MIN, JOBS_PER_CLIENT_MAX);
			console.log(
				`  Processing client ${clientIndex}/${clients.length} (${numJobs} jobs)...`,
			);

			for (let j = 0; j < numJobs; j++) {
				const jobId = randomUUID();
				const jobNumber = `JOB-${jobCounter++}`;
				const jobCreatedAt = randomDate(
					new Date(
						Math.max(clientRecord.created_at.getTime(), START_DATE.getTime()),
					),
					END_DATE,
				);

				let jobStatus: Job['status'];
				if (jobCreatedAt > new Date('2025-11-01')) {
					jobStatus = randomElement([
						'draft',
						'quoted',
						'scheduled',
						'in_progress',
					] as const);
				} else if (jobCreatedAt > new Date('2025-09-01')) {
					jobStatus = randomElement([
						'scheduled',
						'in_progress',
						'completed',
					] as const);
				} else {
					jobStatus = randomElement([
						'completed',
						'cancelled',
						'on_hold',
					] as const);
				}

				const quotedPriceCents = randomInt(500, 50000) * 100;

				// Create job
				await client.query(
					`INSERT INTO jobs (
            id, job_number, client_id, status, title, description,
            street, city, state, zip_code, country,
            quoted_price_cents, currency,
            created_at, updated_at, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
					[
						jobId,
						jobNumber,
						clientRecord.id,
						jobStatus,
						randomElement(JOB_TITLES),
						randomElement(JOB_DESCRIPTIONS),
						clientRecord.street,
						clientRecord.city,
						clientRecord.state,
						clientRecord.zip_code,
						clientRecord.country,
						quotedPriceCents,
						'USD',
						jobCreatedAt,
						jobCreatedAt,
						adminProfileId,
					],
				);

				jobs.push({
					id: jobId,
					job_number: jobNumber,
					client_id: clientRecord.id,
					status: jobStatus,
					title: randomElement(JOB_TITLES),
					description: randomElement(JOB_DESCRIPTIONS),
					street: clientRecord.street,
					city: clientRecord.city,
					state: clientRecord.state,
					zip_code: clientRecord.zip_code,
					country: clientRecord.country,
					quoted_price_cents: quotedPriceCents,
					currency: 'USD',
					created_at: jobCreatedAt,
					updated_at: jobCreatedAt,
					created_by: adminProfileId,
				});

				// Create job items
				const numItems = randomInt(1, 3);
				for (let k = 0; k < numItems; k++) {
					const service = randomElement(services);
					const quantity = randomInt(1, 5);
					const unitPrice = randomInt(100, 300) * 100;
					const total = quantity * unitPrice;

					await client.query(
						`INSERT INTO job_items (
              id, job_id, service_id, description, quantity,
              unit_price_cents, total_cents, sort_order,
              created_at, updated_at, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
						[
							randomUUID(),
							jobId,
							service.id,
							service.name,
							quantity,
							unitPrice,
							total,
							k,
							jobCreatedAt,
							jobCreatedAt,
							adminProfileId,
						],
					);
				}

				// Create invoice for completed or in-progress jobs
				if (jobStatus === 'completed' || jobStatus === 'in_progress') {
					const invoiceId = randomUUID();
					const invoiceNumber = `INV-${jobCounter}`;
					const invoiceCreatedAt = new Date(
						jobCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
					);

					let invoiceStatus: Invoice['status'];
					if (invoiceCreatedAt < new Date('2025-11-15')) {
						invoiceStatus = randomElement(['paid', 'overdue'] as const);
					} else {
						invoiceStatus = randomElement(['draft', 'sent'] as const);
					}

					const taxCents = Math.round(quotedPriceCents * 0.08);
					const totalCents = quotedPriceCents + taxCents;

					await client.query(
						`INSERT INTO invoices (
              id, invoice_number, client_id, job_id, status,
              amount_cents, tax_cents, total_cents, currency, due_date,
              created_at, updated_at, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
						[
							invoiceId,
							invoiceNumber,
							clientRecord.id,
							jobId,
							invoiceStatus,
							quotedPriceCents,
							taxCents,
							totalCents,
							'USD',
							new Date(invoiceCreatedAt.getTime() + 30 * 24 * 60 * 60 * 1000),
							invoiceCreatedAt,
							invoiceCreatedAt,
							adminProfileId,
						],
					);

					// Create payment for paid invoices
					if (invoiceStatus === 'paid') {
						const paymentIntentId = randomUUID();
						const paymentId = randomUUID();
						const paymentNumber = `PAY-${paymentCounter++}`;
						const paymentDate = new Date(
							invoiceCreatedAt.getTime() +
								randomInt(1, 15) * 24 * 60 * 60 * 1000,
						);

						// Create payment intent
						await client.query(
							`INSERT INTO payment_intents (
                id, client_id, invoice_id, amount_cents, currency, status, method,
                processor, processor_intent_id, metadata,
                created_at, updated_at, created_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
							[
								paymentIntentId,
								clientRecord.id,
								invoiceId,
								totalCents,
								'USD',
								'succeeded',
								randomElement(paymentMethods),
								'stripe',
								`pi_${randomInt(100000, 999999)}`,
								JSON.stringify({}),
								paymentDate,
								paymentDate,
								adminProfileId,
							],
						);

						// Create payment
						await client.query(
							`INSERT INTO payments (
                id, payment_number, payment_intent_id, client_id, invoice_id, job_id,
                status, method, amount_cents, currency, transaction_id, processor,
                processor_response, created_at, updated_at, created_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
							[
								paymentId,
								paymentNumber,
								paymentIntentId,
								clientRecord.id,
								invoiceId,
								jobId,
								'completed',
								randomElement(paymentMethods),
								totalCents,
								'USD',
								`ch_${randomInt(100000, 999999)}`,
								'stripe',
								JSON.stringify({ success: true }),
								paymentDate,
								paymentDate,
								adminProfileId,
							],
						);
					}
				}
			}

			if (clientIndex % 5 === 0) {
				console.log('  Taking a short break...');
				await delay(2000);
			}
		}

		console.log(`✅ Created ${jobs.length} jobs\n`);

		await client.query('COMMIT');
		console.log('✅ Transaction committed\n');

		console.log('\n📊 Seed Summary:');
		console.log(`  - Admin: 1`);
		console.log(`  - Employees: ${employeeProfiles.length}`);
		console.log(`  - Clients: ${clients.length}`);
		console.log(`  - Services: ${services.length}`);
		console.log(`  - Jobs: ${jobs.length}`);
		console.log(
			`  - Date Range: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`,
		);
		console.log('\n✅ Database seeding complete!');
	} catch (error) {
		console.error('❌ Error seeding database, rolling back...');
		try {
			await client.query('ROLLBACK');
			console.log('✅ Rollback successful');
		} catch (rollbackError) {
			console.error('❌ Rollback failed:', rollbackError);
		}
		console.error('Error details:', error);
		throw error;
	} finally {
		try {
			await client.end();
			console.log('Database connection closed');
		} catch (endError) {
			console.error('Error closing connection:', endError);
		}
	}
}

seedDatabase()
	.then(() => {
		console.log('Seed process completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Fatal error in seed process:', error);
		process.exit(1);
	});
