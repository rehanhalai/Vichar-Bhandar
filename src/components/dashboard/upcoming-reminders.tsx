"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Inbox } from "lucide-react"
import { toggleReminder } from "@/actions/reminders"
import { format, parseISO, isPast } from "date-fns"
import { cn } from "@/lib/utils"

interface Reminder {
  id: string
  title: string
  dueDate: string | null
  dueTime: string | null
  priority: number | null
  isCompleted: number | null
  category?: { name: string; color: string | null } | null
}

const priorityDot: Record<number, string> = {
  0: "bg-gray-300 dark:bg-gray-600",
  1: "bg-yellow-400 dark:bg-yellow-500",
  2: "bg-red-400 dark:bg-red-500",
}

export function UpcomingReminders({ reminders: initial }: { reminders: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initial)
  const [, startTransition] = useTransition()

  const handleToggle = (id: string) => {
    // Optimistic flip
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, isCompleted: r.isCompleted ? 0 : 1 } : r)
    )

    startTransition(async () => {
      try {
        await toggleReminder(id)
      } catch {
        // Rollback
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, isCompleted: r.isCompleted ? 0 : 1 } : r)
        )
      }
    })
  }

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
      <CardContent className="space-y-1">
        {reminders.map(reminder => {
          const isCompleted = !!reminder.isCompleted
          const isOverdue =
            !isCompleted &&
            !!reminder.dueDate &&
            isPast(parseISO(reminder.dueDate))

          return (
            <div
              key={reminder.id}
              className={cn(
                "flex items-start gap-3 px-2 py-2 rounded-lg transition-colors",
                isCompleted ? "bg-muted/30" : "hover:bg-muted/40"
              )}
            >
              <Checkbox
                id={`ur-${reminder.id}`}
                checked={isCompleted}
                onCheckedChange={() => handleToggle(reminder.id)}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`ur-${reminder.id}`}
                  className={cn(
                    "text-sm cursor-pointer select-none",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {reminder.title}
                </Label>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={cn("size-2 rounded-full shrink-0", priorityDot[reminder.priority ?? 1] ?? "bg-gray-300")} />
                  {reminder.dueDate && (
                    <span className={cn("text-[10px]", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      {format(parseISO(reminder.dueDate), "MMM d")}
                      {reminder.dueTime ? ` at ${reminder.dueTime}` : ""}
                      {isOverdue && " · overdue"}
                    </span>
                  )}
                  {reminder.category && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: `${reminder.category.color ?? "#888"}20`,
                        color: reminder.category.color ?? "#888",
                      }}
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
