// app/(dashboard)/admin/analytics/page.tsx
export const dynamic = 'force-dynamic'

import AnalyticsPage from "@/src/features/admin/analytics/ui/AnalyticsPage"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"

export default function Page() {
  return (
    <>
      <Breadcrumbs />
      <AnalyticsPage />
    </>
  )
}