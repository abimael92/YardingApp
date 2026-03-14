import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/app/lib/auth';
import * as crewService from '@/src/services/crewService';

const createCrewSchema = z.object({
  name: z.string().min(1).max(255),
  supervisorId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  region: z.string().max(128).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const crews = await crewService.getCrews();
    return NextResponse.json(crews);
  } catch (error) {
    console.error('GET /api/crews error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch crews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const data = createCrewSchema.parse(body);
    const crew = await crewService.createCrew({
      name: data.name,
      supervisorId: data.supervisorId ?? null,
      description: data.description ?? null,
      region: data.region ?? null,
      isActive: data.isActive ?? true,
    });
    return NextResponse.json(crew, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten(), message: 'Validation failed' }, { status: 400 });
    }
    console.error('POST /api/crews error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create crew' },
      { status: 500 }
    );
  }
}
