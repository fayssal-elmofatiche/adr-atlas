import { Router, type Request, type Response } from "express";
import { getComponents, getComponentAdrs } from "@atlas/parser/db";
import { getDb } from "../database/provider.js";

export const componentRouter = Router();

/** GET /api/components — List all components */
componentRouter.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = await getComponents(db);
  res.json(result);
});

/** GET /api/components/:name/adrs — Get ADRs for a specific component */
componentRouter.get("/:name/adrs", async (req: Request, res: Response) => {
  const db = await getDb();
  const result = await getComponentAdrs(db, req.params.name as string);
  res.json(result);
});
