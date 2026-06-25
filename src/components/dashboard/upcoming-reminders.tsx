"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Inbox } from "lucide-react"
import { toggleReminder } from "@/actions/reminders"
import { format, parseISO, isPast } from "date-fns"

interface Reminder {
  id: string
  title: string
  dueDate: string | null
  dueTime: string | null
  priority: number | null
  isCompleted: number | null
  category?: { name: string; color: string | null } | null
}

const priorityColors: Record<number, string> = {
  0: "bg-gray-200 dark:bg-gray-700",
  1: "bg-yellow-200 dark:bg-yellow-700",
  2: "bg-red-200 dark:bg-red-700",
}

export function UpcomingReminders({ reminders }: { reminders: Reminder[] }) {
  if (reminders.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="size-8 mb-2 opacity-50" />
            <p className="text-sm">All clear</p>
            <p className="text-xs">No pending reminders</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => {
          const isOverdue = reminder.dueDate && isPast(parseISO(reminder.dueDate)) && !reminder.isCompleted

          return (
            <div key={reminder.id} className="flex items-start gap-3 group">
              <Checkbox
                id={`reminder-${reminder.id}`}
                checked={!!reminder.isCompleted}
                onCheckedChange={() => toggleReminder(reminder.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`reminder-${reminder.id}`}
                  className={`text-sm cursor-pointer ${reminder.isCompleted ? "line-through text-muted-foreground" : ""}`}
                >
                  {reminder.title}
                </Label>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`size-2 rounded-full ${priorityColors[reminder.priority ?? 1] ?? "bg-gray-300"}`} />
                  {reminder.dueDate && (
                    <span className={`text-[10px] ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                      {format(parseISO(reminder.dueDate), "MMM d")}
                      {reminder.dueTime ? ` at ${reminder.dueTime}` : ""}
                    </span>
                  )}
                  {reminder.category && (
                    <span
                      className="text-[10px] px-1 py-0.5 rounded"
                      style={{ backgroundColor: `${reminder.category.color ?? "#888"}20`, color: reminder.category.color ?? "#888" }}
                    >
                      {reminder.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
