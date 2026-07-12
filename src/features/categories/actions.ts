"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { generateId } from "@/lib/nanoid";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string, color: string = "#888888") {
  const id = generateId();
  await db.insert(categories).values({
    id,
    name,
    color,
    createdAt: new Date(),
  });
  revalidatePath("/");
  return id;
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
}

export async function getAllCategories(_t?: number) {
  return db.select().from(categories);
}
