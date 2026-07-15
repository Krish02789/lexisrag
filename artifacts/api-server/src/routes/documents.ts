import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, legalDocumentsTable, documentChunksTable } from "@workspace/db";
import { GetDocumentParams, ListDocumentsResponse, GetDocumentResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/documents", async (_req, res): Promise<void> => {
  const docs = await db
    .select()
    .from(legalDocumentsTable)
    .orderBy(legalDocumentsTable.docType, legalDocumentsTable.title);

  const response = docs.map((d) => ({
    id: d.id,
    title: d.title,
    docType: d.docType,
    pageCount: d.pageCount,
    description: d.description ?? null,
    createdAt: d.createdAt.toISOString(),
  }));

  res.json(ListDocumentsResponse.parse(response));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const [doc] = await db
    .select()
    .from(legalDocumentsTable)
    .where(eq(legalDocumentsTable.id, params.data.id));

  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  const chunks = await db
    .select()
    .from(documentChunksTable)
    .where(eq(documentChunksTable.documentId, params.data.id))
    .orderBy(documentChunksTable.pageNum);

  const response = {
    id: doc.id,
    title: doc.title,
    docType: doc.docType,
    pageCount: doc.pageCount,
    description: doc.description ?? null,
    createdAt: doc.createdAt.toISOString(),
    chunks: chunks.map((c) => ({
      id: c.id,
      pageNum: c.pageNum,
      content: c.content,
    })),
  };

  res.json(GetDocumentResponse.parse(response));
});

export default router;
