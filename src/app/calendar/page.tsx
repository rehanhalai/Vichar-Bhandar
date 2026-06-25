import { getAllThoughts } from "@/actions/thoughts"
import { getAllReminders } from "@/actions/reminders"
import { CalendarView } from "@/components/calendar/calendar-view"

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const [thoughts, reminders] = await Promise.all([
    getAllThoughts(),
    getAllReminders(),
  ])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <CalendarView initialThoughts={thoughts} initialReminders={reminders} />
        </div>
      </div>
    </div>
  )
}
