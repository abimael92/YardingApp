import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await getServerSession();
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { contactType, notes, nextFollowupDate } = await req.json();

		const now = new Date();

		// Set follow-up date (default to 7 days if not provided)
		const followupDate = nextFollowupDate
			? new Date(nextFollowupDate)
			: new Date(now.setDate(now.getDate() + 7));

		const updatedClient = await prisma.clients.update({
			where: { id: params.id },
			data: {
				last_contact_date: new Date(), // Use snake_case
				next_followup_date: followupDate, // Use snake_case
				contact_status: 'ACTIVE', // Use snake_case
				followup_notes: notes || null, // Use snake_case
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
