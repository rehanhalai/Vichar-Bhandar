"use server";

import { db } from "@/db";
import { reminders } from "@/db/schema";
import { generateId } from "@/lib/nanoid";
import { eq, desc, asc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createReminder(data: {
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: number;
  categoryId?: string | null;
}) {
  const id = generateId();
  await db.insert(reminders).values({
    id,
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    dueDate: data.dueDate,
    dueTime: data.dueTime,
    priority: data.priority ?? 1,
    categoryId: data.categoryId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/");
  revalidatePath("/reminders");
  return id;
}

export async function updateReminder(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
    priority?: number;
    isCompleted?: boolean;
    categoryId?: string | null;
  }
) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.dueTime !== undefined) updateData.dueTime = data.dueTime;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted ? 1 : 0;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  await db.update(reminders).set(updateData).where(eq(reminders.id, id));
  revalidatePath("/");
  revalidatePath("/reminders");
}

export async function toggleReminder(id: string) {
  const reminder = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
  if (reminder[0]) {
    await db.update(reminders)
      .set({ isCompleted: reminder[0].isCompleted ? 0 : 1, updatedAt: new Date() })
      .where(eq(reminders.id, id));
  }
  revalidatePath("/");
  revalidatePath("/reminders");
}

export async function deleteReminder(id: string) {
  await db.delete(reminders).where(eq(reminders.id, id));
  revalidatePath("/");
  revalidatePath("/reminders");
}

export async function getAllReminders(filters?: {
  completed?: boolean;
  categoryId?: string;
}, _t?: number) {
  const conditions = [];
  if (filters?.completed !== undefined) {
    conditions.push(eq(reminders.isCompleted, filters.completed ? 1 : 0));
  }
  if (filters?.categoryId) {
    conditions.push(eq(reminders.categoryId, filters.categoryId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.query.reminders.findMany({
    where,
    orderBy: [asc(reminders.isCompleted), desc(reminders.priority), asc(reminders.dueDate)],
    with: { category: true },
  });
}

export async function getUpcomingReminders(limit: number = 5, _t?: number) {
  return db.query.reminders.findMany({
    where: eq(reminders.isCompleted, 0),
    orderBy: [asc(reminders.dueDate), desc(reminders.priority)],
    limit,
    with: { category: true },
  });
}
