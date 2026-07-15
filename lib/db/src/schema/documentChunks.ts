import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { legalDocumentsTable } from "./legalDocuments";

export const documentChunksTable = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id")
    .notNull()
    .references(() => legalDocumentsTable.id, { onDelete: "cascade" }),
  pageNum: integer("page_num").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDocumentChunkSchema = createInsertSchema(documentChunksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertDocumentChunk = z.infer<typeof insertDocumentChunkSchema>;
export type DocumentChunk = typeof documentChunksTable.$inferSelect;
