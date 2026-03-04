import { scanForAdrs } from "./scanner.js";
import { parseAdr } from "./parse-adr.js";
import { buildGraph } from "./graph-builder.js";
import { createMigratedDb } from "./db/connection.js";
import { seedDatabase } from "./db/seed.js";
import type { GraphWarning } from "./types.js";

export interface IngestOptions {
  /** Directories to scan for ADR files */
  paths: string[];
  /** Base path to resolve directories against */
  basePath: string;
  /** Repository identifier */
  repository: string;
  /** Path to the SQLite database file */
  dbPath: string;
}

export interface IngestResult {
  adrCount: number;
  edgeCount: number;
  warnings: GraphWarning[];
}

/**
 * Full ingestion pipeline: scan -> parse -> build graph -> persist to SQLite.
 */
export async function ingestRepository(options: IngestOptions): Promise<IngestResult> {
  const { paths, basePath, repository, dbPath } = options;

  // 1. Scan for ADR files
  const scanResults = await scanForAdrs({
    paths: paths.length > 0 ? paths : undefined,
    basePath,
    repository,
  });

  // 2. Parse each file
  const graphInputs = scanResults.map((sr) => ({
    adr: parseAdr(sr.rawContent, sr.filePath),
    repository: sr.repository,
  }));

  // 3. Build graph
  const graph = buildGraph(graphInputs);

  // 4. Create database (with migrations) and persist
  const db = await createMigratedDb(dbPath);
  await seedDatabase(db, graph);

  return {
    adrCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    warnings: graph.warnings,
  };
}
