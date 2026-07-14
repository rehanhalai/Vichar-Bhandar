import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders, pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import webpush from 'web-push';


export async function GET(request: Request) {
  // Security check: ensure the request is authorized
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
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

    const nowUTC = new Date();
    const now = nowUTC.getTime();

    // Evaluate Engagement Push
    const istTime = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const currentHourIST = istTime.getUTCHours();
    const isEngagementTime = (currentHourIST >= 8 || currentHourIST === 0) && currentHourIST % 2 === 0;

    const engagementMessages = [
      "Aakho di bas time pass j karvo chhe ke kaik lakhavu pan chhe?",
      "Magan ma bhel chhe ke bhejoo? Kadho bahar!",
      "Jivto chhe ne bapa? Ke potu fari gayu? Lakhi nakh kaik!",
      "Su vichare chhe aatlu badhu? PM banvu chhe? Chup chap lakhi nakh.",
      "Aaje pan kachro j bharyo chhe dimag ma? Dumper ma nakh fafda jeva!",
      "Tarathi navra koi nathi bhai duniya ma, chal kaik lakh.",
      "uper walo pan kantaali gayo chhe tara vicharo thi, ahi kadhi nakh ne!",
      "Khali magaj no kothlo, kaik nakh aama!",
      "Fari thi aalsi thaine besi rahyo? Bapu kaik toh kripa karo tari jaat par.",
      "Navra betha nakhod vaade! Aena karta kaik vichar kadhi nakh ne!",
      "Su kye party! Kaik toh lakho bapu!",
      "Chal ne! Ketli vaar lagaadish?",
      "Bolo!"
    ];

    const pushesToSend: { title: string, body: string }[] = [];

    if (isEngagementTime) {
      const randomMsg = engagementMessages[Math.floor(Math.random() * engagementMessages.length)];
      pushesToSend.push({
        title: "Thought Dumper",
        body: randomMsg
      });
    }

    const notificationThresholdsHours = [72, 36, 24, 12, 6, 3, 1, 0]; // Added 0 for "Due Now"

    for (const r of allPendingReminders) {
      if (!r.dueDate || !r.dueTime || r.dueTime === 'null' || r.dueDate === 'null') continue;

      // The server might run in UTC, but the user inputs local time (IST, +05:30).
      // We explicitly append the IST timezone offset to evaluate the correct timestamp.
      const dueDateStr = `${r.dueDate}T${r.dueTime}:00+05:30`;
      const dueDate = new Date(dueDateStr).getTime();

      if (isNaN(dueDate)) {
        console.error(`Invalid date parsing for reminder ${r.id}: ${dueDateStr}`);
        continue;
      }

      const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

      // Check if it falls precisely in one of our thresholds
      // The cron runs hourly, so we check if it's within the current hour bracket
      for (const threshold of notificationThresholdsHours) {
        if (hoursUntilDue > threshold - 1 && hoursUntilDue <= threshold) {
          pushesToSend.push({
            title: threshold === 0 ? "Reminder Due Now" : `Reminder Due in ${threshold} Hours`,
            body: r.title
          });
          break;
        }
      }
    }

    if (pushesToSend.length === 0) {
      return NextResponse.json({ success: true, pushed: 0, reason: "No reminders or engagement pushes due" });
    }

    // 2. Fetch all subscriptions
    const subscriptions = await db.query.pushSubscriptions.findMany();
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, pushed: 0, reason: "No subscribers" });
    }

    // Configure Web Push
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    let sentCount = 0;
    for (const pushData of pushesToSend) {
      const payload = JSON.stringify(pushData);

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
