"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toggleReminder, createReminder, updateReminder, getAllReminders } from "@/actions/reminders"
import RemindersView, { Priority, Reminder as ViewReminder } from "./reminders-view"
import { parseISO } from "date-fns"

interface DBReminder {
  id: string
  title: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  dueTime: string | null
  priority: number | null
  isCompleted: number | null
  categoryId?: string | null
  category?: { name: string; color: string | null } | null
  createdAt: Date | null
  updatedAt?: Date | null
}

interface ReminderFormData {
  title: string
  description: string
  startDate: string
  dueDate: string
  dueTime: string
  priority: string
}

const emptyForm: ReminderFormData = {
  title: "",
  description: "",
  startDate: "",
  dueDate: "",
  dueTime: "",
  priority: "1",
}

const priorityMap: Record<number, Priority> = {
  0: "low",
  1: "medium",
  2: "high"
}

export function RemindersList({ initialReminders }: { initialReminders: DBReminder[] }) {
  const queryClient = useQueryClient()
  
  const { data: reminders = initialReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => getAllReminders(),
    initialData: initialReminders,
  })

  const [editing, setEditing] = useState<DBReminder | null>(null)
  const [form, setForm] = useState<ReminderFormData>(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      setDialogOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateReminder>[1] }) => updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      setDialogOpen(false)
    }
  })

  const toggleMutation = useMutation({
    mutationFn: toggleReminder,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['reminders'] })
      const previous = queryClient.getQueryData<DBReminder[]>(['reminders'])
      if (previous) {
        queryClient.setQueryData<DBReminder[]>(['reminders'], prev => 
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

  const handleSave = () => {
    if (!form.title.trim()) return

    const data = {
      title: form.title,
      description: form.description || null,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      dueTime: form.dueTime || null,
      priority: parseInt(form.priority),
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleToggle = (id: string, completed: boolean) => {
    toggleMutation.mutate(id)
  }

  const handleAddClick = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const handleEditClick = (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (reminder) {
      setEditing(reminder)
      setForm({
        title: reminder.title,
        description: reminder.description || "",
        startDate: reminder.startDate || "",
        dueDate: reminder.dueDate || "",
        dueTime: reminder.dueTime || "",
        priority: reminder.priority?.toString() || "1"
      })
      setDialogOpen(true)
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Reminder" : "New Reminder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What do you need to remember?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="min-h-[60px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sdate">Start Date (optional)</Label>
                <Input
                  id="sdate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Due Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Due Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => setForm(f => ({ ...f, dueTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setForm(f => ({ ...f, priority: value ?? "1" }))}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Low</SelectItem>
                    <SelectItem value="1">Medium</SelectItem>
                    <SelectItem value="2">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              className="w-full" 
              disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
