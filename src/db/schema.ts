import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#888888"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const thoughts = sqliteTable("thoughts", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  mood: integer("mood"),
  isPinned: integer("is_pinned").default(0),
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  thoughtId: text("thought_id").references(() => thoughts.id, { onDelete: "cascade" }).notNull(),
  label: text("label").notNull(),
});

export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  body: text("body"),
  categoryId: text("category_id"),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  thoughts: many(thoughts),
}));

export const thoughtsRelations = relations(thoughts, ({ one, many }) => ({
  category: one(categories, {
    fields: [thoughts.categoryId],
    references: [categories.id],
  }),
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  thought: one(thoughts, {
    fields: [tags.thoughtId],
    references: [thoughts.id],
  }),
}));
