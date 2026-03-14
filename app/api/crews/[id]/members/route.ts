import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/lib/auth';
import * as crewService from '@/src/services/crewService';

const addMemberSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.string().max(64).optional(),
});

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
    const members = await crewService.getCrewMembers(crewId);
    return NextResponse.json(members);
  } catch (error) {
    console.error('GET /api/crews/[id]/members error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch members' },
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
    const data = addMemberSchema.parse(body);
    const member = await crewService.addCrewMember(crewId, data.employeeId, data.role ?? 'member');
    if (!member) {
      return NextResponse.json({ error: 'Employee already in crew or invalid' }, { status: 400 });
    }
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten(), message: 'Validation failed' }, { status: 400 });
    }
    console.error('POST /api/crews/[id]/members error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
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
    const employeeId = searchParams.get('employeeId');
    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId query required' }, { status: 400 });
    }
    const removed = await crewService.removeCrewMember(crewId, employeeId);
    if (!removed) {
      return NextResponse.json({ error: 'Member not found or could not be removed' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/crews/[id]/members error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    );
  }
}
