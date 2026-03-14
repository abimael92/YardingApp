import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { neon } from '@neondatabase/serverless';
import { authOptions } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT p.id, p.full_name AS "fullName", p.status,
        u.email,
        ed.employee_number AS "employeeNumber", ed.department, ed.position,
        (SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.profile_id = p.id LIMIT 1) AS role
      FROM profiles p
      LEFT JOIN "User" u ON u.id = p.user_id
      LEFT JOIN employee_details ed ON ed.profile_id = p.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.full_name
    `;
    const employees = rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      fullName: r.fullName ?? 'Unknown',
      email: r.email ?? '',
      status: r.status,
      role: r.role,
      employeeNumber: r.employeeNumber,
      department: r.department,
      position: r.position,
    }));
    return NextResponse.json(employees);
  } catch (error) {
    console.error('GET /api/employees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
