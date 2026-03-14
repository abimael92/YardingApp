import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/lib/auth';
import * as crewService from '@/src/services/crewService';

const updateCrewSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  supervisorId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  region: z.string().max(128).nullable().optional(),
  isActive: z.boolean().optional(),
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
    const { id } = await params;
    const crew = await crewService.getCrewById(id);
    if (!crew) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 });
    }
    return NextResponse.json(crew);
  } catch (error) {
    console.error('GET /api/crews/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch crew' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const data = updateCrewSchema.parse(body);
    const crew = await crewService.updateCrew(id, data);
    if (!crew) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 });
    }
    return NextResponse.json(crew);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten(), message: 'Validation failed' }, { status: 400 });
    }
    console.error('PUT /api/crews/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update crew' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const deleted = await crewService.deleteCrew(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Crew not found or could not be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/crews/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete crew' },
      { status: 500 }
    );
  }
}
