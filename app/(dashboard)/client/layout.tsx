export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="min-h-screen">{children}</section>
}
