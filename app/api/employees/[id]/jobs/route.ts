import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/lib/auth';
import { assignEmployeeToJob, getAssignmentsByEmployee, removeEmployeeFromJob } from '@/src/services/assignmentService';

const assignSchema = z.object({ jobId: z.string().uuid() });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: employeeId } = await params;
    const assignments = await getAssignmentsByEmployee(employeeId);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('GET /api/employees/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: employeeId } = await params;
    const body = await request.json();
    const data = assignSchema.parse(body);
    await assignEmployeeToJob({
      employeeId,
      jobId: data.jobId,
      role: 'member',
      assignedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten(), message: 'Validation failed' }, { status: 400 });
    }
    console.error('POST /api/employees/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: employeeId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) {
      return NextResponse.json({ error: 'jobId query required' }, { status: 400 });
    }
    await removeEmployeeFromJob(employeeId, jobId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/employees/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove assignment' },
      { status: 500 }
    );
  }
}
