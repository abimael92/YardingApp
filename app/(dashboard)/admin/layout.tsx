import RoleGate from "@/src/features/auth/ui/RoleGate"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="admin">
      <section className="min-h-screen">{children}</section>
    </RoleGate>
  )
}
