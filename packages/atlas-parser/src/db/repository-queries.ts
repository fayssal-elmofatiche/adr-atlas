import { eq, sql } from "drizzle-orm";
import type { AtlasDb } from "./connection.js";
import { repositories } from "./schema.js";
import { adrs } from "./schema.js";

export interface RepositoryRow {
  id: number;
  slug: string;
  sourceUrl: string | null;
  localPath: string;
  sourceType: string;
  scanPaths: string[];
  status: string;
  errorMessage: string | null;
  adrCount: number;
  autoSync: boolean;
  syncIntervalSeconds: number;
  lastSyncedAt: string | null;
  createdAt: string | null;
}

function toRow(raw: typeof repositories.$inferSelect): RepositoryRow {
  return {
    id: raw.id,
    slug: raw.slug,
    sourceUrl: raw.sourceUrl ?? null,
    localPath: raw.localPath,
    sourceType: raw.sourceType,
    scanPaths: raw.scanPaths ? JSON.parse(raw.scanPaths) : [],
    status: raw.status,
    errorMessage: raw.errorMessage ?? null,
    adrCount: raw.adrCount ?? 0,
    autoSync: !!raw.autoSync,
    syncIntervalSeconds: raw.syncIntervalSeconds ?? 300,
    lastSyncedAt: raw.lastSyncedAt ?? null,
    createdAt: raw.createdAt ?? null,
  };
}

export async function getRepositories(db: AtlasDb): Promise<RepositoryRow[]> {
  const rows = await db.select().from(repositories);
  return rows.map(toRow);
}

export async function getRepositoryById(db: AtlasDb, id: number): Promise<RepositoryRow | null> {
  const rows = await db.select().from(repositories).where(eq(repositories.id, id));
  return rows.length > 0 ? toRow(rows[0]) : null;
}

export async function getRepositoryBySlug(db: AtlasDb, slug: string): Promise<RepositoryRow | null> {
  const rows = await db.select().from(repositories).where(eq(repositories.slug, slug));
  return rows.length > 0 ? toRow(rows[0]) : null;
}

export async function insertRepository(
  db: AtlasDb,
  data: {
    slug: string;
    sourceUrl?: string;
    localPath: string;
    sourceType: string;
    scanPaths?: string[];
  },
): Promise<RepositoryRow> {
  const rows = await db
    .insert(repositories)
    .values({
      slug: data.slug,
      sourceUrl: data.sourceUrl ?? null,
      localPath: data.localPath,
      sourceType: data.sourceType,
      scanPaths: JSON.stringify(data.scanPaths ?? []),
    })
    .returning();
  return toRow(rows[0]);
}

export async function updateRepositoryStatus(
  db: AtlasDb,
  id: number,
  updates: {
    status?: string;
    errorMessage?: string | null;
    adrCount?: number;
    lastSyncedAt?: string;
  },
): Promise<void> {
  await db
    .update(repositories)
    .set({
      ...updates,
      updatedAt: sql`datetime('now')`,
    })
    .where(eq(repositories.id, id));
}

export async function deleteRepositoryAndAdrs(db: AtlasDb, id: number): Promise<void> {
  const rows = await db.select().from(repositories).where(eq(repositories.id, id));
  if (rows.length > 0) {
    await db.delete(adrs).where(eq(adrs.repository, rows[0].slug));
    await db.delete(repositories).where(eq(repositories.id, id));
  }
}
