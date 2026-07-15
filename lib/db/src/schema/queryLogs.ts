import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const queryLogsTable = pgTable("query_logs", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  answer: text("answer").notNull(),
  searchMode: text("search_mode").notNull().default("hybrid"),
  processingTimeMs: integer("processing_time_ms").notNull().default(0),
  citationsJson: text("citations_json").notNull().default("[]"),
  llmUsed: boolean("llm_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQueryLogSchema = createInsertSchema(queryLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQueryLog = z.infer<typeof insertQueryLogSchema>;
export type QueryLog = typeof queryLogsTable.$inferSelect;
