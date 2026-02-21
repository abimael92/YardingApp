import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import AdminShell from "./AdminShell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) throw redirect("/login")
  if (session.user.role !== "admin") throw redirect("/")

  return <AdminShell>{children}</AdminShell>
}