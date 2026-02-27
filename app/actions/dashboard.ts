"use server"

import {
	getRecentActivity,
	getPendingActions,
} from "@/src/services/adminService"

const VIEW_ALL_ACTIVITY_LIMIT = 100

/** Fetches recent activity from DB for the Activity modal. */
export async function getRecentActivityForModal() {
	return getRecentActivity(VIEW_ALL_ACTIVITY_LIMIT)
}

/** Fetches pending actions from DB for the Pending Actions modal. Job → jobs page, customer → clients page. */
export async function getPendingActionsForModal() {
	return getPendingActions({ jobs: 100, payments: 100 })
}
