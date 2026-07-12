"use server";

import { db } from "@/db";
import { drafts } from "@/db/schema";
import { generateId } from "@/lib/nanoid";
import { eq } from "drizzle-orm";

export async function getDraft() {
  const draftList = await db.select().from(drafts).limit(1);
  return draftList[0] || null;
}

export async function upsertDraft(body: string, categoryId?: string | null) {
  const existing = await getDraft();
  if (existing) {
    await db.update(drafts).set({
      body,
      categoryId,
      updatedAt: new Date(),
    }).where(eq(drafts.id, existing.id));
  } else {
    await db.insert(drafts).values({
      id: generateId(),
      body,
      categoryId,
      updatedAt: new Date(),
    });
  }
}

export async function clearDraft() {
  await db.delete(drafts);
}
