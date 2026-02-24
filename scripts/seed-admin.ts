import { Client as PgClient } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

async function main() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not defined in .env.local');
    process.exit(1);
  }

  const client = new PgClient({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  const email = 'josue.garcia@landscaping.com';
  const password = 'Desert2026!';
  const name = 'Josue Garcia';
  const role = 'admin';

  try {
    await client.connect();
    console.log('✅ Connected to Neon DB via pg client.');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Removed 'id' from the insert—Postgres will generate it automatically
    const query = `
      INSERT INTO "User" (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        role = EXCLUDED.role
      RETURNING email;
    `;

    const res = await client.query(query, [name, email, hashedPassword, role]);
    console.log('✅ Success! Admin user ready:', res.rows[0].email);

  } catch (err) {
    console.error('❌ Database Error:', err);
  } finally {
    await client.end();
  }
}

main();