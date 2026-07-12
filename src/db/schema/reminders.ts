import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories";

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  dueTime: text("due_time"),
  priority: integer("priority").default(1),
  isCompleted: integer("is_completed").default(0),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const remindersRelations = relations(reminders, ({ one }) => ({
  category: one(categories, {
    fields: [reminders.categoryId],
    references: [categories.id],
  }),
}));
