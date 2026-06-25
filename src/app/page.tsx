import { getAllThoughts } from "@/actions/thoughts"
import { getUpcomingReminders } from "@/actions/reminders"
import { format } from "date-fns"
import { SectionCards } from "@/components/dashboard/section-cards"
import { QuickCapture } from "@/components/dashboard/quick-capture"
import { RecentThoughts } from "@/components/dashboard/recent-thoughts"
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [thoughts, reminders] = await Promise.all([
    getAllThoughts(),
    getUpcomingReminders(5),
  ])

  const today = format(new Date(), "yyyy-MM-dd")
  const thoughtsToday = thoughts.filter(t => t.date === today).length
  const remindersDue = reminders.filter(r => !r.isCompleted).length

  let streak = 0
  const sortedDates = Array.from(new Set(thoughts.map(t => t.date))).sort().reverse()
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd")
    if (sortedDates[i] === expected) {
      streak++
    } else {
      break
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards thoughtsToday={thoughtsToday} streak={streak} remindersDue={remindersDue} />
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <QuickCapture />
            <UpcomingReminders reminders={reminders} />
          </div>
        </div>
        <div className="px-4 lg:px-6">
          <RecentThoughts thoughts={thoughts} />
        </div>
      </div>
    </div>
  )
}
