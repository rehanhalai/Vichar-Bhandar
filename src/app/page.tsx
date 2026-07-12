import { getAllThoughts } from "@/features/thoughts/actions"
import { getUpcomingReminders } from "@/features/reminders/actions"
import { DashboardView } from "@/features/dashboard/components/dashboard-view"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [thoughts, reminders] = await Promise.all([
    getAllThoughts(),
    getUpcomingReminders(5),
  ])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <DashboardView initialThoughts={thoughts} initialReminders={reminders} />
    </div>
  )
}
