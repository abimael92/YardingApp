import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getServerSession();
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const { contactType, notes, nextFollowupDate } = await req.json();

		const now = new Date();

		// Set follow-up date (default to 7 days if not provided)
		const followupDate = nextFollowupDate
			? new Date(nextFollowupDate)
			: new Date(now.setDate(now.getDate() + 7));

		const updatedClient = await prisma.clients.update({
			where: { id: id },
			data: {
				last_contact_date: new Date(),
				next_followup_date: followupDate,
				contact_status: 'ACTIVE',
				followup_notes: notes || null,
			},
		});

		return NextResponse.json({ success: true, client: updatedClient });
	} catch (error) {
		console.error('Failed to log contact:', error);
		return NextResponse.json(
			{ error: 'Failed to log contact' },
			{ status: 500 },
		);
	}
}
