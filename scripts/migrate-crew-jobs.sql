-- Crew-to-Job assignment table (follows employee_jobs pattern).
-- Run this against your Neon DB if crew_jobs does not exist.
-- Usage: psql $DATABASE_URL -f scripts/migrate-crew-jobs.sql
-- Or run the SQL below in Neon SQL Editor.

CREATE TABLE IF NOT EXISTS crew_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  assigned_at timestamp without time zone DEFAULT now(),
  status character varying DEFAULT 'assigned',
  CONSTRAINT crew_jobs_crew_id_job_id_key UNIQUE (crew_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_jobs_crew_id ON crew_jobs(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_jobs_job_id ON crew_jobs(job_id);

COMMENT ON TABLE crew_jobs IS 'Crew-to-job assignments (parallel to employee_jobs for employees).';
