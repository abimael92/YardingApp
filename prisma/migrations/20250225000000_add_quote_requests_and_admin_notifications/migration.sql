-- CreateEnum
CREATE TYPE "quote_request_status" AS ENUM ('pending', 'reviewed', 'sent');

-- CreateTable
CREATE TABLE "quote_requests" (
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
);

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(64) NOT NULL,
    "entity_id" UUID NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quote_request_id" UUID,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_quote_requests_status" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "idx_quote_requests_created_at" ON "quote_requests"("created_at");

-- CreateIndex
CREATE INDEX "idx_admin_notifications_read" ON "admin_notifications"("read");

-- CreateIndex
CREATE INDEX "idx_admin_notifications_quote_request" ON "admin_notifications"("quote_request_id");

-- AddForeignKey
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_quote_request_id_fkey" FOREIGN KEY ("quote_request_id") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE NOACTION;
