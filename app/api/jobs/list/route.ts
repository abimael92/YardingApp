import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import { authOptions } from '@/app/lib/auth';

/**
 * GET /api/jobs/list
 * Returns jobs with client name and assignment info (employee or crew).
 * Optional: scheduled date/duration when available from schedule_jobs or jobs.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 200, 500);
    const sql = neon(process.env.DATABASE_URL!);

    const jobs = await sql`
      SELECT
        j.id,
        j.job_number AS "jobNumber",
        j.title,
        j.status,
        j.client_id AS "clientId",
        c.name AS "clientName",
        j.quoted_price_cents AS "quotedPriceCents",
        j.created_at AS "createdAt",
        j.updated_at AS "updatedAt"
      FROM jobs j
      LEFT JOIN clients c ON c.id = j.client_id
      WHERE j.deleted_at IS NULL
      ${status ? sql`AND j.status = ${status}` : sql``}
      ORDER BY j.created_at DESC
      LIMIT ${limit}
    `;

    const jobIds = (jobs as { id: string }[]).map((r) => r.id);
    const assignMap = new Map<
      string,
      { assigneeName: string; assigneeType: 'employee' | 'crew' }
    >();

    if (jobIds.length > 0) {
      const employeeAssignments = await sql`
        SELECT ej.job_id AS "jobId", p.full_name AS "assigneeName"
        FROM employee_jobs ej
        JOIN profiles p ON p.id = ej.employee_id
        WHERE ej.job_id IN (SELECT id FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${limit})
      `;
      for (const row of employeeAssignments as { jobId: string; assigneeName: string }[]) {
        if (!assignMap.has(row.jobId)) {
          assignMap.set(row.jobId, {
            assigneeName: row.assigneeName ?? 'Unknown',
            assigneeType: 'employee',
          });
        }
      }
      try {
        const crewAssignments = await sql`
          SELECT cj.job_id AS "jobId", c.name AS "assigneeName"
          FROM crew_jobs cj
          JOIN crews c ON c.id = cj.crew_id
          WHERE cj.job_id IN (SELECT id FROM jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${limit})
        `;
        for (const row of crewAssignments as { jobId: string; assigneeName: string }[]) {
          if (!assignMap.has(row.jobId)) {
            assignMap.set(row.jobId, {
              assigneeName: row.assigneeName ?? 'Unknown',
              assigneeType: 'crew',
            });
          }
        }
      } catch {
        // crew_jobs table may not exist
      }
    }

    const list = (jobs as Record<string, unknown>[]).map((j) => {
      const a = assignMap.get(j.id as string);
      return {
        ...j,
        clientName: j.clientName ?? '—',
        assignedToType: a?.assigneeType ?? null,
        assignedToName: a?.assigneeName ?? null,
        scheduledDate: (j.createdAt as string) ?? null,
        duration: null,
      };
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('GET /api/jobs/list error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
