import { create } from 'zustand'

export interface AppReminder {
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

interface UIStore {
  isReminderDialogOpen: boolean
  editingReminder: AppReminder | null
  openReminderDialog: (reminder?: AppReminder) => void
  closeReminderDialog: () => void

  isThoughtDialogOpen: boolean
  editingThought: any | null
  openThoughtDialog: (thought?: any) => void
  closeThoughtDialog: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isReminderDialogOpen: false,
  editingReminder: null,
  openReminderDialog: (reminder) => set({ 
    isReminderDialogOpen: true, 
    editingReminder: reminder || null 
  }),
  closeReminderDialog: () => set({ 
    isReminderDialogOpen: false, 
    editingReminder: null 
  }),

  isThoughtDialogOpen: false,
  editingThought: null,
  openThoughtDialog: (thought) => set({ 
    isThoughtDialogOpen: true,
    editingThought: thought || null
  }),
  closeThoughtDialog: () => set({ 
    isThoughtDialogOpen: false,
    editingThought: null
  }),
}))
