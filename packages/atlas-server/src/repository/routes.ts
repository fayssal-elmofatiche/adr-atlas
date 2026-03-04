import { basename, join } from "node:path";
import { existsSync } from "node:fs";
import { Router, type Request, type Response } from "express";
import { isGitUrl, repoSlugFromUrl, paths } from "@atlas/parser";
import {
  getRepositories,
  getRepositoryById,
  getRepositoryBySlug,
  insertRepository,
  deleteRepositoryAndAdrs,
} from "@atlas/parser/db";
import { getDb } from "../database/provider.js";
import { enqueueSync } from "./sync-manager.js";

export const repositoryRouter = Router();

repositoryRouter.get("/", async (_req: Request, res: Response) => {
  const db = await getDb();
  const repos = await getRepositories(db);
  res.json(repos);
});

repositoryRouter.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const db = await getDb();
  const repo = await getRepositoryById(db, id);
  if (!repo) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }
  res.json(repo);
});

repositoryRouter.post("/", async (req: Request, res: Response) => {
  const { source, scanPaths } = req.body ?? {};

  if (!source || typeof source !== "string") {
    res.status(400).json({ error: "'source' is required (git URL or local path)" });
    return;
  }

  const db = await getDb();
  const isGit = isGitUrl(source);
  const slug = isGit ? repoSlugFromUrl(source) : basename(source);
  const localPath = isGit ? join(paths.repos, slug) : source;

  if (!isGit && !existsSync(source)) {
    res.status(400).json({ error: `Local path does not exist: ${source}` });
    return;
  }

  // Check for duplicate
  const existing = await getRepositoryBySlug(db, slug);
  if (existing) {
    // Re-sync existing repo instead of creating duplicate
    enqueueSync(existing.id);
    res.json(existing);
    return;
  }

  const repo = await insertRepository(db, {
    slug,
    sourceUrl: isGit ? source : undefined,
    localPath,
    sourceType: isGit ? "git" : "local",
    scanPaths: Array.isArray(scanPaths) ? scanPaths : [],
  });

  enqueueSync(repo.id);
  res.status(201).json(repo);
});

repositoryRouter.post("/:id/sync", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const db = await getDb();
  const repo = await getRepositoryById(db, id);
  if (!repo) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }
  enqueueSync(repo.id);
  res.json({ message: "Sync started" });
});

repositoryRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const db = await getDb();
  await deleteRepositoryAndAdrs(db, id);
  res.json({ message: "Deleted" });
});
