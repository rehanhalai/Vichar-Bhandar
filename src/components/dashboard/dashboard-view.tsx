"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllThoughts } from "@/actions/thoughts"
import { getUpcomingReminders } from "@/actions/reminders"
import { format } from "date-fns"
import { SectionCards } from "@/components/dashboard/section-cards"
import { QuickCapture } from "@/components/dashboard/quick-capture"
import { RecentThoughts } from "@/components/dashboard/recent-thoughts"
import { UpcomingReminders } from "@/components/dashboard/upcoming-reminders"

export function DashboardView({ initialThoughts, initialReminders }: any) {
  const { data: thoughts = initialThoughts } = useQuery({
    queryKey: ['thoughts'],
    queryFn: () => getAllThoughts(undefined, Date.now()),
    initialData: initialThoughts,
  })

  const { data: reminders = initialReminders } = useQuery({
    queryKey: ['upcoming-reminders'],
    queryFn: () => getUpcomingReminders(5, Date.now()),
    initialData: initialReminders,
  })

  const today = format(new Date(), "yyyy-MM-dd")
  const thoughtsToday = thoughts.filter((t: any) => t.date === today).length
  const remindersDue = reminders.filter((r: any) => !r.isCompleted).length

  let streak = 0
  const sortedDates = Array.from(new Set(thoughts.map((t: any) => t.date))).sort().reverse() as string[]
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd")
    if (sortedDates[i] === expected) {
      streak++
    } else {
      break
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 md:gap-6 md:flex-col">
        <div className="order-2 md:order-1">
          <SectionCards thoughtsToday={thoughtsToday} streak={streak} remindersDue={remindersDue} />
        </div>
        <div className="px-4 lg:px-6 order-1 md:order-2">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <QuickCapture />
            <UpcomingReminders reminders={reminders} />
          </div>
        </div>
      </div>
      <div className="px-4 lg:px-6 order-3">
        <RecentThoughts thoughts={thoughts} />
      </div>
    </div>
  )
}
