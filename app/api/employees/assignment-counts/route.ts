import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import { authOptions } from '@/app/lib/auth';

/**
 * GET /api/employees/assignment-counts
 * Returns { counts: { [employeeId]: number } } for job assignment counts per employee.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT employee_id AS "employeeId", COUNT(*)::int AS count
      FROM employee_jobs
      GROUP BY employee_id
    `;
    const counts: Record<string, number> = {};
    for (const row of rows as { employeeId: string; count: number }[]) {
      if (row.employeeId) counts[row.employeeId] = row.count;
    }
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('GET /api/employees/assignment-counts error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    );
  }
}
