"use client"

import { useEffect, useRef } from "react"
import { showNotification, scheduleDailyReminder } from "@/lib/notifications"
import { getAllReminders } from "@/actions/reminders"

export function NotificationScheduler() {
  const scheduledRef = useRef(false)

  useEffect(() => {
    if (scheduledRef.current) return
    scheduledRef.current = true

    if (!("Notification" in window) || Notification.permission !== "granted") return

    scheduleDailyReminder(20, 0)

    const interval = setInterval(async () => {
      try {
        const reminders = await getAllReminders({ completed: false })
        const now = new Date()

        for (const r of reminders) {
          if (!r.dueDate || !r.dueTime) continue
          const dueDate = new Date(`${r.dueDate}T${r.dueTime}`)
          const diff = Math.abs(now.getTime() - dueDate.getTime())
          if (diff < 60000) {
            showNotification("Reminder Due", r.title)
          }
        }
      } catch {}
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return null
}
