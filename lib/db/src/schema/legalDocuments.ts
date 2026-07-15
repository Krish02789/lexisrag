import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const legalDocumentsTable = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  docType: text("doc_type").notNull(), // 'Act' | 'Court Judgment' | 'POV' | 'Tax Document'
  description: text("description"),
  pageCount: integer("page_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocumentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type LegalDocument = typeof legalDocumentsTable.$inferSelect;
