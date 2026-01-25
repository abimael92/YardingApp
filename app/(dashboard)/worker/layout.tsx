import RoleGate from "@/src/features/auth/ui/RoleGate"

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGate role="worker">
      <section className="min-h-screen">{children}</section>
    </RoleGate>
  )
}
