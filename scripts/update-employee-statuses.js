import { Client as PgClient } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateEmployeeStatuses() {
    const client = new PgClient({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Get all employees
        const employees = await client.query(`
            SELECT p.id, p.full_name 
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.profile_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'employee'
        `);

        console.log(`Found ${employees.rows.length} employees\n`);

        // Set 2 employees as inactive (disabled)
        for (let i = 0; i < Math.min(2, employees.rows.length); i++) {
            const emp = employees.rows[i];
            await client.query(
                'UPDATE profiles SET status = $1 WHERE id = $2',
                ['inactive', emp.id]
            );
            console.log(`🚫 Disabled: ${emp.full_name}`);
        }

        // Set 1 employee as pending
        if (employees.rows.length > 2) {
            const emp = employees.rows[2];
            await client.query(
                'UPDATE profiles SET status = $1 WHERE id = $2',
                ['pending', emp.id]
            );
            console.log(`⏳ Pending: ${emp.full_name}`);
        }

        // Show final statuses
        const final = await client.query(`
            SELECT p.full_name, p.status 
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.profile_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = 'employee'
            ORDER BY p.status
        `);

        console.log('\n📊 Final employee statuses:');
        final.rows.forEach(row => {
            let emoji = '✅';
            if (row.status === 'inactive') emoji = '❌';
            if (row.status === 'pending') emoji = '⏳';
            console.log(`  ${emoji} ${row.full_name}: ${row.status}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

updateEmployeeStatuses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });