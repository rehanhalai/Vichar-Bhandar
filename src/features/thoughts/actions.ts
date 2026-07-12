/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use server";

import { db } from "@/db";
import { thoughts, tags, categories } from "@/db/schema";
import { generateId } from "@/lib/nanoid";
import { eq, like, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createThought(data: { body: string; categoryId?: string | null; mood?: number | null; date: string; tags: string[]; isPinned?: boolean }) {
  const thoughtId = generateId();
  
  await db.transaction(async (tx) => {
    await tx.insert(thoughts).values({
      id: thoughtId,
      body: data.body,
      categoryId: data.categoryId,
      mood: data.mood,
      date: data.date,
      isPinned: data.isPinned ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    if (data.tags && data.tags.length > 0) {
      const tagValues = data.tags.map(label => ({
        id: generateId(),
        thoughtId,
        label,
      }));
      await tx.insert(tags).values(tagValues);
    }
  });

  revalidatePath("/");
  return thoughtId;
}

export async function updateThought(id: string, data: { body?: string; categoryId?: string | null; mood?: number | null; date?: string; tags?: string[]; isPinned?: boolean }) {
  await db.transaction(async (tx) => {
    const updateData: any = { updatedAt: new Date() };
    if (data.body !== undefined) updateData.body = data.body;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.mood !== undefined) updateData.mood = data.mood;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned ? 1 : 0;
    
    await tx.update(thoughts).set(updateData).where(eq(thoughts.id, id));
    
    if (data.tags !== undefined) {
      await tx.delete(tags).where(eq(tags.thoughtId, id));
      if (data.tags.length > 0) {
        const tagValues = data.tags.map(label => ({
          id: generateId(),
          thoughtId: id,
          label,
        }));
        await tx.insert(tags).values(tagValues);
      }
    }
  });

  revalidatePath("/");
}

export async function deleteThought(id: string) {
  await db.delete(thoughts).where(eq(thoughts.id, id));
  revalidatePath("/");
}

export async function getAllThoughts(filters?: { search?: string; categoryId?: string; tag?: string }, _t?: number) {
  let whereClause = undefined;
  
  // If we need to filter by search
  if (filters?.search) {
    whereClause = like(thoughts.body, `%${filters.search}%`);
  }
  
  // Note: For advanced filtering (category, tag) we would build more complex where clauses.
  // For now, let's keep it simple with Drizzle relational queries and filter in-memory if needed.
  let allThoughts = await db.query.thoughts.findMany({
    where: whereClause,
    orderBy: [desc(thoughts.isPinned), desc(thoughts.date), desc(thoughts.createdAt)],
    with: {
      category: true,
      tags: true,
    },
  });
  
  // Filter by category
  if (filters?.categoryId) {
    allThoughts = allThoughts.filter(t => t.categoryId === filters.categoryId);
  }
  
  // Filter by tag
  if (filters?.tag) {
    const targetTag = filters.tag.toLowerCase();
    allThoughts = allThoughts.filter(t => t.tags.some(tag => tag.label.toLowerCase() === targetTag));
  }
  
  return allThoughts;
}
