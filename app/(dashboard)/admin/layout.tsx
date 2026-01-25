export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="min-h-screen">{children}</section>
}
