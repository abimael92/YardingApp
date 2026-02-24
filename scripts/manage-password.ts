import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.log('Current directory:', process.cwd());
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const action = await askQuestion('Do you want to (s)et password or (c)heck password? [s/c]: ');
    
    if (action.toLowerCase() === 's') {
      await setPassword(client);
    } else if (action.toLowerCase() === 'c') {
      await checkPassword(client);
    } else {
      console.log('Invalid option');
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
    rl.close();
  }
}

async function setPassword(client: Client) {
  const email = await askQuestion('Enter email: ');
  const password = await askQuestion('Enter new password: ');
  
  // Check if user exists
  const userCheck = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
  
  if (userCheck.rows.length === 0) {
    console.log('❌ User not found');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await client.query(
    'UPDATE "User" SET password = $1 WHERE email = $2',
    [hashedPassword, email]
  );
  
  console.log(`✅ Password set successfully for ${email}`);
}

async function checkPassword(client: Client) {
  const email = await askQuestion('Enter email: ');
  const password = await askQuestion('Enter password to check: ');
  
  const result = await client.query(
    'SELECT email, password FROM "User" WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    console.log('❌ User not found');
    return;
  }
  
  const user = result.rows[0];
  
  if (!user.password) {
    console.log('❌ No password set for this user');
    return;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (isValid) {
    console.log('✅ Password is correct!');
    console.log('You can login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } else {
    console.log('❌ Password is incorrect');
  }
}

main();