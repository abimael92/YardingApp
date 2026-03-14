import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/lib/auth';
import * as crewService from '@/src/services/crewService';

const assignJobSchema = z.object({ jobId: z.string().uuid() });
const assignJobsSchema = z.object({ jobIds: z.array(z.string().uuid()) });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: crewId } = await params;
    const jobs = await crewService.getCrewJobs(crewId);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('GET /api/crews/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch crew jobs' },
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
    const { id: crewId } = await params;
    const body = await request.json();
    if (Array.isArray(body.jobIds)) {
      const data = assignJobsSchema.parse(body);
      const result = await crewService.assignJobsToCrew(crewId, data.jobIds);
      return NextResponse.json(result, { status: 201 });
    }
    const data = assignJobSchema.parse(body);
    await crewService.assignJobToCrew(crewId, data.jobId);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten(), message: 'Validation failed' }, { status: 400 });
    }
    console.error('POST /api/crews/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign job(s)' },
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
    const { id: crewId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) {
      return NextResponse.json({ error: 'jobId query required' }, { status: 400 });
    }
    const removed = await crewService.unassignJobFromCrew(crewId, jobId);
    if (!removed) {
      return NextResponse.json({ error: 'Assignment not found or could not be removed' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/crews/[id]/jobs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unassign job' },
      { status: 500 }
    );
  }
}
