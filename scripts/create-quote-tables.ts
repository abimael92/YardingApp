/**
 * Creates only the quote_requests and admin_notifications tables (and enum).
 * Run with: pnpm tsx scripts/create-quote-tables.ts
 * Use this if you don't want to run "prisma db push" (which may warn about other schema changes).
 */

import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

// Load .env.local first (Next.js convention), then .env
config({ path: ".env.local" })
config({ path: ".env" })

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set. Set it in .env and try again.")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  const statements = [
    `DO $$ BEGIN CREATE TYPE "quote_request_status" AS ENUM ('pending', 'reviewed', 'sent'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `CREATE TABLE IF NOT EXISTS "quote_requests" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "client_name" VARCHAR(255) NOT NULL,
      "client_email" VARCHAR(255) NOT NULL,
      "client_phone" VARCHAR(64),
      "service_name" VARCHAR(255) NOT NULL,
      "project_type" VARCHAR(32) NOT NULL,
      "zone" VARCHAR(32) NOT NULL,
      "hours" DOUBLE PRECISION NOT NULL,
      "sqft" INTEGER NOT NULL,
      "visits" INTEGER NOT NULL,
      "extras" VARCHAR(512),
      "min_cents" BIGINT NOT NULL,
      "max_cents" BIGINT NOT NULL,
      "breakdown_metadata" JSONB DEFAULT '{}',
      "status" "quote_request_status" NOT NULL DEFAULT 'pending',
      "message_to_client" TEXT,
      "approved_min_cents" BIGINT,
      "approved_max_cents" BIGINT,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "sent_at" TIMESTAMPTZ(6),
      CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "admin_notifications" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "type" VARCHAR(64) NOT NULL,
      "entity_id" UUID NOT NULL,
      "read" BOOLEAN NOT NULL DEFAULT false,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "quote_request_id" UUID,
      CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
    )`,
  ]

  try {
    for (const statement of statements) {
      await sql(statement)
    }
    // Create indexes and FK if not exist (ignore errors if they exist)
    await sql(`CREATE INDEX IF NOT EXISTS "idx_quote_requests_status" ON "quote_requests"("status")`)
    await sql(`CREATE INDEX IF NOT EXISTS "idx_quote_requests_created_at" ON "quote_requests"("created_at")`)
    await sql(`CREATE INDEX IF NOT EXISTS "idx_admin_notifications_read" ON "admin_notifications"("read")`)
    await sql(`CREATE INDEX IF NOT EXISTS "idx_admin_notifications_quote_request" ON "admin_notifications"("quote_request_id")`)
    try {
      await sql(`ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE NOACTION`)
    } catch (_) {
      // FK may already exist
    }
    console.log("✅ quote_requests and admin_notifications tables are ready.")
  } catch (e) {
    console.error("❌ Error creating quote tables:", e)
    process.exit(1)
  }
}

main()
