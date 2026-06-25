export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  const permission = await Notification.requestPermission()
  return permission === "granted"
}

export function showNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return

  if (navigator.serviceWorker?.ready) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    })
  } else {
    new Notification(title, { body, icon: "/favicon.ico" })
  }
}

export function scheduleDailyReminder(hour: number, minute: number) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)
  if (target <= now) target.setDate(target.getDate() + 1)

  const msUntilTarget = target.getTime() - now.getTime()
  setTimeout(() => {
    showNotification("ThoughtDump", "Time to dump your !thoughts")
    scheduleDailyReminder(hour, minute)
  }, msUntilTarget)
}
