const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function reset() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_HnYjoCB24XZa@ep-sparkling-salad-ah1yriwz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
  });
  
  await client.connect();
  const hash = await bcrypt.hash('Desert2026!', 10);
  await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [hash, 'josue.garcia@landscaping.com']);
  console.log('✅ PASSWORD RESET TO: Desert2026!');
  await client.end();
}

reset().catch(console.error);
