import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  body: text("body"),
  categoryId: text("category_id"),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});
