-- Run on Neon if `jobs.quote_request_id` is missing (aligns with Prisma schema).
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS quote_request_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_quote_request_id_fkey'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_quote_request_id_fkey
      FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_quote_request_id ON jobs(quote_request_id);
