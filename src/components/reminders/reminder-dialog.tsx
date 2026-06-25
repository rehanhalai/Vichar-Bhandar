"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { createReminder, updateReminder } from "@/actions/reminders"
import { useUIStore } from "@/store/ui-store"
import { CategorySelector } from "@/components/categories/category-selector"

interface ReminderFormData {
  title: string
  description: string
  startDate: string
  dueDate: string
  dueTime: string
  priority: string
  categoryId: string | null
}

const emptyForm: ReminderFormData = {
  title: "",
  description: "",
  startDate: "",
  dueDate: "",
  dueTime: "",
  priority: "1",
  categoryId: null,
}

export function ReminderDialog() {
  const { isReminderDialogOpen, editingReminder, closeReminderDialog } = useUIStore()
  const queryClient = useQueryClient()
  
  const [form, setForm] = useState<ReminderFormData>(emptyForm)

  useEffect(() => {
    if (isReminderDialogOpen) {
      if (editingReminder) {
        setForm({
          title: editingReminder.title,
          description: editingReminder.description || "",
          startDate: editingReminder.startDate || "",
          dueDate: editingReminder.dueDate || "",
          dueTime: editingReminder.dueTime || "",
          priority: editingReminder.priority?.toString() || "1",
          categoryId: editingReminder.categoryId || null,
        })
      } else {
        setForm(emptyForm)
      }
    }
  }, [isReminderDialogOpen, editingReminder])

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      closeReminderDialog()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateReminder>[1] }) => updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      closeReminderDialog()
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
      categoryId: form.categoryId || null,
    }

    if (editingReminder) {
      updateMutation.mutate({ id: editingReminder.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Dialog open={isReminderDialogOpen} onOpenChange={(open) => !open && closeReminderDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingReminder ? "Edit Reminder" : "New Reminder"}</DialogTitle>
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
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="block">
              <CategorySelector
                value={form.categoryId}
                onChange={(val) => setForm(f => ({ ...f, categoryId: val }))}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {editingReminder ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
