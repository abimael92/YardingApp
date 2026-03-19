"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import {
	createWorkDay,
	detectCrewDayCollisions,
	listPlannerJobs,
	type CrewDayCollision,
	type PlannerJobOption,
} from "@/src/services/schedulePlannerService"
import { getCrews, type Crew } from "@/src/services/crewService"

async function requireAdmin() {
	const session = await getServerSession(authOptions)
	if (!session?.user || session.user.role !== "admin") {
		throw new Error("Unauthorized")
	}
}

export async function getDailyPlannerData(): Promise<{
	crews: Crew[]
	jobs: PlannerJobOption[]
}> {
	await requireAdmin()
	const [crews, jobs] = await Promise.all([getCrews(), listPlannerJobs()])
	return { crews, jobs }
}

export async function previewCrewDayCollisions(
	crewId: string,
	dateYmd: string,
): Promise<{ warnings: CrewDayCollision[] }> {
	await requireAdmin()
	const warnings = await detectCrewDayCollisions(crewId, dateYmd)
	return { warnings }
}

export async function submitCreateWorkDay(
	dateYmd: string,
	crewId: string,
	jobIds: string[],
): Promise<
	| { success: true; scheduleId: string; warnings: CrewDayCollision[] }
	| { success: false; error: string }
> {
	try {
		await requireAdmin()
		const result = await createWorkDay(dateYmd, crewId, jobIds)
		if (!result.ok) {
			return { success: false, error: result.error }
		}
		revalidatePath("/admin/schedule")
		revalidatePath("/admin/jobs")
		return {
			success: true,
			scheduleId: result.scheduleId,
			warnings: result.warnings,
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Failed"
		if (msg === "Unauthorized") return { success: false, error: "Unauthorized." }
		console.error("[submitCreateWorkDay]", e)
		return { success: false, error: msg }
	}
}
