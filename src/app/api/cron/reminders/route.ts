import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic'; // Prevent Vercel from caching the cron job

export async function GET(request: Request) {
  // Security check: Vercel sends a specific header when triggering crons securely
  const authHeader = request.headers.get('authorization');
  if (
    process.env.VERCEL_CRON_SECRET && 
    authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Query the database for upcoming reminders
    // We would look for reminders whose due dates map to 3 days, 24h, 6h, etc.
    const allPendingReminders = await db.query.reminders.findMany({
      where: eq(reminders.isCompleted, 0),
    });

    console.log(`Cron triggered: Found ${allPendingReminders.length} pending reminders.`);

    // 2. Here is where the Web Push logic goes!
    // For this to work, we need a table in the database to store the user's PushSubscription object.
    // We would iterate over the pending reminders, check if it's precisely 24 hours away, 
    // and if so, execute webpush.sendNotification(subscription, payload).

    return NextResponse.json({ success: true, count: allPendingReminders.length });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
