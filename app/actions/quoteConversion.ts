"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { convertToJob, type JobSiteAddress } from "@/src/services/quoteService"

export async function approveQuoteAndCreateJob(
	quoteId: string,
	address: JobSiteAddress,
): Promise<
	| { success: true; jobId: string; alreadyExisted: boolean }
	| { success: false; error: string }
> {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user || session.user.role !== "admin") {
			return { success: false, error: "Unauthorized." }
		}
		const result = await convertToJob(quoteId, address)
		if (result.success) {
			revalidatePath("/admin/quotes")
			revalidatePath("/admin/jobs")
		}
		return result
	} catch (e) {
		console.error("[approveQuoteAndCreateJob]", e)
		return {
			success: false,
			error: e instanceof Error ? e.message : "Conversion failed.",
		}
	}
}
