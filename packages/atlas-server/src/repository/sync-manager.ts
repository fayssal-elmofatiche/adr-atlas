import {
  isGitUrl,
  cloneOrPull,
  ensureAtlasDirs,
  paths,
  ingestRepository,
} from "@atlas/parser";
import {
  getRepositoryById,
  getRepositories,
  updateRepositoryStatus,
} from "@atlas/parser/db";
import { getDb } from "../database/provider.js";

const syncQueue: number[] = [];
let processing = false;

export function enqueueSync(repoId: number): void {
  if (!syncQueue.includes(repoId)) {
    syncQueue.push(repoId);
    processQueue();
  }
}

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    while (syncQueue.length > 0) {
      const repoId = syncQueue.shift()!;
      await syncRepository(repoId);
    }
  } finally {
    processing = false;
  }
}

async function syncRepository(repoId: number): Promise<void> {
  const db = await getDb();
  const repo = await getRepositoryById(db, repoId);
  if (!repo) return;

  await updateRepositoryStatus(db, repoId, { status: "syncing", errorMessage: null });

  try {
    let basePath = repo.localPath;

    if (repo.sourceType === "git" && repo.sourceUrl) {
      ensureAtlasDirs();
      const result = await cloneOrPull(repo.sourceUrl, paths.repos);
      basePath = result.localPath;
    }

    const dbPath = process.env.DATABASE_PATH ?? paths.db;

    const result = await ingestRepository({
      paths: repo.scanPaths,
      basePath,
      repository: repo.slug,
      dbPath,
    });

    await updateRepositoryStatus(db, repoId, {
      status: "ready",
      adrCount: result.adrCount,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (err) {
    await updateRepositoryStatus(db, repoId, {
      status: "error",
      errorMessage: (err as Error).message,
    });
  }
}

let autoSyncTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(): void {
  if (autoSyncTimer) return;
  autoSyncTimer = setInterval(async () => {
    try {
      const db = await getDb();
      const repos = await getRepositories(db);
      const now = Date.now();
      for (const repo of repos) {
        if (!repo.autoSync || repo.sourceType !== "git") continue;
        const lastSync = repo.lastSyncedAt ? new Date(repo.lastSyncedAt).getTime() : 0;
        if (now - lastSync > repo.syncIntervalSeconds * 1000) {
          enqueueSync(repo.id);
        }
      }
    } catch {
      // Silently continue — auto-sync failures are non-fatal
    }
  }, 60_000);
}

export function stopAutoSync(): void {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}
