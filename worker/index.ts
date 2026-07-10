/// <reference lib="webworker" />
export default null;
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Vichar Bhandar";
    const body = data.body || "You have a new reminder.";
    
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    );
  } catch (e) {
    console.error("Error showing push notification:", e);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
