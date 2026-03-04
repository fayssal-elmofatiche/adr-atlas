import { Router, type Request, type Response } from "express";
import { ingestRepository } from "@atlas/parser";

export const ingestionRouter = Router();

/** POST /api/ingest — Trigger ADR ingestion for a repository */
ingestionRouter.post("/", async (req: Request, res: Response) => {
  const { paths, basePath, repository } = req.body ?? {};

  if (!basePath || typeof basePath !== "string") {
    res.status(400).json({ error: "'basePath' is required" });
    return;
  }
  if (!repository || typeof repository !== "string") {
    res.status(400).json({ error: "'repository' is required" });
    return;
  }

  const dbPath = process.env.DATABASE_PATH ?? "atlas.db";

  const result = await ingestRepository({
    paths: Array.isArray(paths) ? paths : [],
    basePath,
    repository,
    dbPath,
  });

  res.json({
    message: "Ingestion complete",
    adrCount: result.adrCount,
    edgeCount: result.edgeCount,
    warnings: result.warnings,
  });
});
