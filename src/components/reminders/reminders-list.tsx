"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleReminder, getAllReminders } from "@/actions/reminders"
import RemindersView, { Priority, Reminder as ViewReminder } from "./reminders-view"
import { parseISO } from "date-fns"
import { useUIStore, AppReminder } from "@/store/ui-store"

const priorityMap: Record<number, Priority> = {
  0: "low",
  1: "medium",
  2: "high",
}

function toViewReminder(r: AppReminder): ViewReminder {
  return {
    id: r.id,
    title: r.title,
    detail: r.description || undefined,
    priority: priorityMap[r.priority ?? 1] ?? "medium",
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    startAt: r.startDate ? parseISO(r.startDate) : undefined,
    dueAt: r.dueDate ? parseISO(r.dueDate) : new Date(),
    dueTime: r.dueTime || undefined,
    category: r.category?.name || undefined,
    categoryId: r.categoryId || null,
    completed: !!r.isCompleted,
  }
}

export function RemindersList({ initialReminders }: { initialReminders: AppReminder[] }) {
  const [reminders, setReminders] = useState<AppReminder[]>(initialReminders)
  const [, startTransition] = useTransition()
  const { openReminderDialog } = useUIStore()

  // Sync when server data updates (after revalidatePath)
  useEffect(() => {
    setReminders(initialReminders)
  }, [initialReminders])

  const handleToggle = (id: string) => {
    // 1. Optimistically flip the local state immediately — no flicker, instant UI feedback
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, isCompleted: r.isCompleted ? 0 : 1 } : r)
    )

    // 2. Fire server action in the background
    startTransition(async () => {
      try {
        await toggleReminder(id)
      } catch {
        // Rollback on failure
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, isCompleted: r.isCompleted ? 0 : 1 } : r)
        )
      }
    })
  }

  const handleAddClick = () => {
    openReminderDialog()
  }

  const handleEditClick = (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (reminder) openReminderDialog(reminder)
  }

  return (
    <RemindersView
      reminders={reminders.map(toViewReminder)}
      onToggle={handleToggle}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
    />
  )
}
