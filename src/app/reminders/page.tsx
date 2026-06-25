import { RemindersList } from "@/components/reminders/reminders-list"
import { getAllReminders } from "@/actions/reminders"

export const dynamic = 'force-dynamic'

export default async function RemindersPage() {
  const reminders = await getAllReminders()

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <RemindersList initialReminders={reminders} />
        </div>
      </div>
    </div>
  )
}
