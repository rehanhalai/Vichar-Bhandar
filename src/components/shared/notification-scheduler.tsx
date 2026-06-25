"use client"

import { useEffect, useState } from "react"
import { savePushSubscription } from "@/actions/push"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Loader2 } from "lucide-react"

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationScheduler() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    if (!("Notification" in window)) return
    setPermission(Notification.permission)

    // If they already granted permission, ensure we are subscribed silently
    if (Notification.permission === "granted") {
      subscribeToPush()
    }
  }, [])

  const subscribeToPush = async () => {
    try {
      setIsSubscribing(true)
      
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.error("Push not supported")
        return
      }

      // Ensure SW is ready
      const registration = await navigator.serviceWorker.ready

      // Ask for permission if not granted
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== "granted") return

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
          console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY")
          return
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        })
      }

      // Send to server
      await savePushSubscription(JSON.parse(JSON.stringify(subscription)))
    } catch (err) {
      console.error("Failed to subscribe to push", err)
    } finally {
      setIsSubscribing(false)
    }
  }

  // Only show button if not granted
  if (permission === "granted") return null

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={subscribeToPush}
      disabled={isSubscribing}
      className="h-8 w-full text-xs gap-2"
    >
      {isSubscribing ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
      Enable Push
    </Button>
  )
}
