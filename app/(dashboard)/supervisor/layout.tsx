import RoleGate from "@/src/features/auth/ui/RoleGate"

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="supervisor">
      <section className="min-h-screen">{children}</section>
    </RoleGate>
  )
}
