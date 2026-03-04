import { Router, type Request, type Response } from "express";
import { getGraph } from "@atlas/parser/db";
import { getDb } from "../database/provider.js";

export const graphRouter = Router();

/** GET /api/graph — Get the ADR graph with optional filters */
graphRouter.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const filters: Record<string, string> = {};

  if (typeof req.query.status === "string") filters.status = req.query.status;
  if (typeof req.query.tag === "string") filters.tag = req.query.tag;
  if (typeof req.query.component === "string") filters.component = req.query.component;

  const result = await getGraph(db, Object.keys(filters).length > 0 ? filters : undefined);
  res.json(result);
});
