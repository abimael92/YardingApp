import RoleGate from "@/src/features/auth/ui/RoleGate"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="client">
      <section className="min-h-screen">{children}</section>
    </RoleGate>
  )
}
