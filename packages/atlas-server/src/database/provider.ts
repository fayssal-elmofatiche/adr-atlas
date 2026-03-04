import { createMigratedDb, type AtlasDb } from "@atlas/parser/db";

let db: AtlasDb | null = null;

/**
 * Returns the shared database instance. Creates and migrates on first call.
 */
export async function getDb(): Promise<AtlasDb> {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH ?? "atlas.db";
    db = await createMigratedDb(dbPath);
  }
  return db;
}

/**
 * Replace the database instance (used in tests to inject an in-memory DB).
 */
export function setDb(instance: AtlasDb) {
  db = instance;
}
