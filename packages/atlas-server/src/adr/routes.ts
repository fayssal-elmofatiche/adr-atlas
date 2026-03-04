import { Router, type Request, type Response } from "express";
import { getAdrs, getAdrById, searchAdrs } from "@atlas/parser/db";
import { getDb } from "../database/provider.js";

export const adrRouter = Router();

/** GET /api/adrs — List ADRs with optional filters */
adrRouter.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const filters: Record<string, string> = {};

  if (typeof req.query.status === "string") filters.status = req.query.status;
  if (typeof req.query.tag === "string") filters.tag = req.query.tag;
  if (typeof req.query.component === "string") filters.component = req.query.component;
  if (typeof req.query.repository === "string") filters.repository = req.query.repository;

  const result = await getAdrs(db, Object.keys(filters).length > 0 ? filters : undefined);
  res.json(result);
});

/** GET /api/adrs/search?q= — Full-text search */
adrRouter.get("/search", async (req: Request, res: Response) => {
  const q = req.query.q;
  if (typeof q !== "string" || q.trim().length === 0) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const db = await getDb();
  const result = await searchAdrs(db, q.trim());
  res.json(result);
});

/** GET /api/adrs/:id — Get ADR detail by ID */
adrRouter.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ADR ID" });
    return;
  }

  const db = await getDb();
  const result = await getAdrById(db, id);
  if (!result) {
    res.status(404).json({ error: "ADR not found" });
    return;
  }
  res.json(result);
});
