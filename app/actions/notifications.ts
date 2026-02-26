"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/app/lib/prisma"

export async function getUnreadQuoteNotificationCount(): Promise<number> {
  const count = await prisma.admin_notifications.count({
    where: { type: "quote_request", read: false },
  })
  return count
}

export async function getUnreadQuoteNotifications(): Promise<
  Array<{ id: string; entity_id: string; created_at: Date }>
> {
  const list = await prisma.admin_notifications.findMany({
    where: { type: "quote_request", read: false },
    orderBy: { created_at: "desc" },
    select: { id: true, entity_id: true, created_at: true },
  })
  return list
}

export async function markNotificationRead(id: string): Promise<void> {
  await prisma.admin_notifications.update({
    where: { id },
    data: { read: true },
  })
  revalidatePath("/admin/quotes")
}

export async function markQuoteNotificationReadByQuoteId(quoteRequestId: string): Promise<void> {
  await prisma.admin_notifications.updateMany({
    where: { quote_request_id: quoteRequestId },
    data: { read: true },
  })
  revalidatePath("/admin/quotes")
}
