import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 500);
    const sql = neon(process.env.DATABASE_URL!);
    const jobs = status
      ? await sql`
          SELECT j.id, j.job_number AS "jobNumber", j.title, j.status, j.client_id AS "clientId", j.quoted_price_cents AS "quotedPriceCents", j.created_at AS "createdAt"
          FROM jobs j
          WHERE j.status = ${status} AND j.deleted_at IS NULL
          ORDER BY j.created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT j.id, j.job_number AS "jobNumber", j.title, j.status, j.client_id AS "clientId", j.quoted_price_cents AS "quotedPriceCents", j.created_at AS "createdAt"
          FROM jobs j
          WHERE j.deleted_at IS NULL
          ORDER BY j.created_at DESC
          LIMIT ${limit}
        `;
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('GET /api/jobs/available error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
