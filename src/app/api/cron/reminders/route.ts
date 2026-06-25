import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders, pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import webpush from 'web-push';

export const dynamic = 'force-dynamic'; // Prevent Vercel from caching the cron job

export async function GET(request: Request) {
  // Security check: Vercel sends a specific header when triggering crons securely
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
  if (
    secret && 
    authHeader !== `Bearer ${secret}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Query the database for upcoming reminders
    const allPendingReminders = await db.query.reminders.findMany({
      where: eq(reminders.isCompleted, 0),
    });

    const now = Date.now();
    const notificationThresholdsHours = [72, 24, 6, 3, 1]; // 3 days, 1 day, 6h, 3h, 1h
    const remindersToPush = [];

    for (const r of allPendingReminders) {
      if (!r.dueDate || !r.dueTime) continue;
      const dueDate = new Date(`${r.dueDate}T${r.dueTime}`).getTime();
      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

      // Check if it falls precisely in one of our thresholds
      // Vercel cron runs hourly, so we check if it's within the current hour bracket
      for (const threshold of notificationThresholdsHours) {
        if (hoursUntilDue > threshold - 1 && hoursUntilDue <= threshold) {
          remindersToPush.push({ reminder: r, threshold });
          break;
        }
      }
    }

    if (remindersToPush.length === 0) {
      return NextResponse.json({ success: true, pushed: 0 });
    }

    // 2. Fetch all subscriptions
    const subscriptions = await db.query.pushSubscriptions.findMany();
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, pushed: 0, reason: "No subscribers" });
    }

    // Configure Web Push
    webpush.setVapidDetails(
      'mailto:admin@thoughtdump.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    let sentCount = 0;
    for (const { reminder, threshold } of remindersToPush) {
      const payload = JSON.stringify({
        title: `Reminder Due in ${threshold} Hours`,
        body: reminder.title,
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            }
          }, payload);
          sentCount++;
        } catch (e: any) {
          if (e.statusCode === 410) {
            // Subscription has expired or is no longer valid
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint));
          } else {
            console.error('Push error:', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, pushed: sentCount });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
