"use server";

import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { generateId } from "@/lib/nanoid";
import { eq } from "drizzle-orm";

export async function savePushSubscription(subscription: any) {
  const id = generateId();
  
  // We should ideally check if the endpoint already exists to avoid duplicates
  const existing = await db.query.pushSubscriptions.findFirst({
    where: eq(pushSubscriptions.endpoint, subscription.endpoint),
  });

  if (existing) {
    // Already subscribed
    return existing.id;
  }

  await db.insert(pushSubscriptions).values({
    id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });

  return id;
}

export async function unsubscribePush(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}
