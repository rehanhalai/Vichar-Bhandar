import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { thoughts } from "./thoughts";
import { reminders } from "./reminders";

export const categoriesRelations = relations(categories, ({ many }) => ({
  thoughts: many(thoughts),
  reminders: many(reminders),
}));
