import { getAllThoughts } from "@/actions/thoughts"
import { getUpcomingReminders } from "@/actions/reminders"
import { DashboardView } from "@/components/dashboard/dashboard-view"

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
