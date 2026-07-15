import { Router, type IRouter } from "express";
import { count, avg } from "drizzle-orm";
import { db, legalDocumentsTable, documentChunksTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [docStats] = await db
    .select({ total: count(), avgPageCount: avg(legalDocumentsTable.pageCount) })
    .from(legalDocumentsTable);

  const [chunkStats] = await db
    .select({ total: count() })
    .from(documentChunksTable);

  const typeRows = await db
    .select({ docType: legalDocumentsTable.docType, cnt: count() })
    .from(legalDocumentsTable)
    .groupBy(legalDocumentsTable.docType);

  const documentsByType: Record<string, number> = {};
  for (const row of typeRows) {
    documentsByType[row.docType] = Number(row.cnt);
  }

  const response = {
    totalDocuments: Number(docStats?.total ?? 0),
    totalChunks: Number(chunkStats?.total ?? 0),
    documentsByType,
    avgPageCount: parseFloat(String(docStats?.avgPageCount ?? "0")),
  };

  res.json(GetStatsResponse.parse(response));
});

export default router;
