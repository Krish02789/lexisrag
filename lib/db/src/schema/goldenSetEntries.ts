import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const goldenSetEntriesTable = pgTable("golden_set_entries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  groundTruthAnswer: text("ground_truth_answer").notNull(),
  sourceDocument: text("source_document").notNull(),
  pageNumbers: text("page_numbers").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGoldenSetEntrySchema = createInsertSchema(goldenSetEntriesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGoldenSetEntry = z.infer<typeof insertGoldenSetEntrySchema>;
export type GoldenSetEntry = typeof goldenSetEntriesTable.$inferSelect;
