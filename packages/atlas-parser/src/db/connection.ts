import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export type AtlasDb = ReturnType<typeof drizzleFromClient>;

function drizzleFromClient(client: Client) {
  return drizzle(client, { schema });
}

function toLibsqlUrl(dbPath: string): string {
  if (dbPath === ":memory:") return ":memory:";
  // Absolute paths need file:// prefix, relative paths use file:
  if (dbPath.startsWith("/")) return `file:${dbPath}`;
  return `file:${dbPath}`;
}

/**
 * Creates a Drizzle ORM database connection backed by libSQL/SQLite.
 * Pass ":memory:" for an in-memory database (useful for tests),
 * or a file path for a file-based database.
 */
export function createDb(dbPath: string) {
  const client = createClient({ url: toLibsqlUrl(dbPath) });
  return drizzleFromClient(client);
}

/**
 * Creates a database connection AND runs migrations in one step.
 * Essential for in-memory databases where each connection is isolated.
 */
export async function createMigratedDb(dbPath: string) {
  const client = createClient({ url: toLibsqlUrl(dbPath) });

  // Run migrations on this client
  await runMigrationSql(client);

  return drizzleFromClient(client);
}

const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS adr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT,
    authors TEXT,
    repository TEXT NOT NULL,
    file_path TEXT NOT NULL,
    summary TEXT,
    context TEXT,
    decision TEXT,
    consequences TEXT,
    raw_content TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_repo_path ON adr(repository, file_path);

  CREATE TABLE IF NOT EXISTS tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS adr_tag (
    adr_id INTEGER NOT NULL REFERENCES adr(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_tag ON adr_tag(adr_id, tag_id);

  CREATE TABLE IF NOT EXISTS component (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    team TEXT,
    system TEXT
  );

  CREATE TABLE IF NOT EXISTS adr_component (
    adr_id INTEGER NOT NULL REFERENCES adr(id) ON DELETE CASCADE,
    component_id INTEGER NOT NULL REFERENCES component(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_component ON adr_component(adr_id, component_id);

  CREATE TABLE IF NOT EXISTS adr_edge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_adr_id INTEGER NOT NULL REFERENCES adr(id) ON DELETE CASCADE,
    target_adr_id INTEGER NOT NULL REFERENCES adr(id) ON DELETE CASCADE,
    type TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_edge ON adr_edge(source_adr_id, target_adr_id, type);

  CREATE TABLE IF NOT EXISTS repository (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    source_url TEXT,
    local_path TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'git',
    scan_paths TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    adr_count INTEGER DEFAULT 0,
    auto_sync INTEGER DEFAULT 0,
    sync_interval_seconds INTEGER DEFAULT 300,
    last_synced_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS uq_repository_slug ON repository(slug);
`;

async function runMigrationSql(client: Client) {
  const statements = MIGRATION_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await client.execute(stmt);
  }
}

/**
 * Ensures all tables exist. For file-based databases, opens a separate
 * connection, runs migrations, and closes. For in-memory databases,
 * use createMigratedDb() instead.
 */
export async function migrateDb(dbPath: string) {
  const client = createClient({ url: toLibsqlUrl(dbPath) });
  await runMigrationSql(client);
  client.close();
}
