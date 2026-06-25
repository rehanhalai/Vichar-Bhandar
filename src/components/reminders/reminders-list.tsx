"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toggleReminder, getAllReminders } from "@/actions/reminders"
import RemindersView, { Priority, Reminder as ViewReminder } from "./reminders-view"
import { parseISO } from "date-fns"
import { useUIStore, AppReminder } from "@/store/ui-store"

const priorityMap: Record<number, Priority> = {
  0: "low",
  1: "medium",
  2: "high"
}

export function RemindersList({ initialReminders }: { initialReminders: AppReminder[] }) {
  const queryClient = useQueryClient()
  const { openReminderDialog } = useUIStore()
  
  const { data: reminders = initialReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => getAllReminders(undefined, Date.now()),
    initialData: initialReminders,
  })

  const toggleMutation = useMutation({
    mutationFn: toggleReminder,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['reminders'] })
      const previous = queryClient.getQueryData<AppReminder[]>(['reminders'])
      if (previous) {
        queryClient.setQueryData<AppReminder[]>(['reminders'], prev => 
          prev?.map(r => r.id === id ? { ...r, isCompleted: r.isCompleted ? 0 : 1 } : r)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['reminders'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    }
  })

  const handleToggle = (id: string, completed: boolean) => {
    toggleMutation.mutate(id)
  }

  const handleAddClick = () => {
    openReminderDialog()
  }

  const handleEditClick = (id: string) => {
    const reminder = reminders.find((r: AppReminder) => r.id === id)
    if (reminder) {
      openReminderDialog(reminder)
    }
  }

  const mappedReminders: ViewReminder[] = reminders.map(r => ({
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
    completed: !!r.isCompleted
  }))

  return (
    <>
      <RemindersView 
        reminders={mappedReminders} 
        onToggleComplete={handleToggle} 
        onAddClick={handleAddClick} 
        onEditClick={handleEditClick}
      />
    </>
  )
}
