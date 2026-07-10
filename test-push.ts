import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./src/db/index";
import webpush from 'web-push';

async function run() {
  try {
    const subscriptions = await db.query.pushSubscriptions.findMany();
    if (subscriptions.length === 0) {
      console.log("No subscriptions found in production DB.");
      return;
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          }
        }, JSON.stringify({ title: "Test Notification", body: "This is a test from your assistant! Everything is working correctly." }));
        sent++;
        console.log(`Successfully sent to endpoint: ${sub.endpoint.substring(0, 50)}...`);
      } catch (e: any) {
        console.error(`Failed to send to endpoint ${sub.endpoint.substring(0, 50)}... Error:`, e.message);
      }
    }
    console.log(`Sent ${sent} test notifications.`);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
