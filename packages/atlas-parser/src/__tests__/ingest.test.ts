import { describe, it, expect, afterEach } from "vitest";
import { join } from "node:path";
import { unlinkSync, existsSync } from "node:fs";
import { ingestRepository } from "../ingest.js";
import { createDb } from "../db/connection.js";
import { getAdrs, getGraph } from "../db/queries.js";

const MOCK_REPO = join(import.meta.dirname, "fixtures", "mock-repo");
const TEST_DB = join(import.meta.dirname, "test-ingest.db");

afterEach(() => {
  if (existsSync(TEST_DB)) {
    try {
      unlinkSync(TEST_DB);
    } catch {
      // ignore
    }
  }
});

describe("ingestRepository", () => {
  it("ingests a mock repository end-to-end", async () => {
    const result = await ingestRepository({
      paths: [],
      basePath: MOCK_REPO,
      repository: "test-repo",
      dbPath: TEST_DB,
    });

    expect(result.adrCount).toBe(3);
    expect(result.edgeCount).toBeGreaterThan(0);

    const db = createDb(TEST_DB);
    const adrs = await getAdrs(db);
    expect(adrs).toHaveLength(3);
  });

  it("creates edges for detected relationships", async () => {
    await ingestRepository({
      paths: [],
      basePath: MOCK_REPO,
      repository: "test-repo",
      dbPath: TEST_DB,
    });

    const db = createDb(TEST_DB);
    const graph = await getGraph(db);
    expect(graph.edges.length).toBeGreaterThan(0);

    const supersedes = graph.edges.filter((e) => e.type === "supersedes");
    expect(supersedes.length).toBeGreaterThanOrEqual(1);
  });

  it("is idempotent — re-ingestion does not duplicate", async () => {
    await ingestRepository({
      paths: [],
      basePath: MOCK_REPO,
      repository: "test-repo",
      dbPath: TEST_DB,
    });

    await ingestRepository({
      paths: [],
      basePath: MOCK_REPO,
      repository: "test-repo",
      dbPath: TEST_DB,
    });

    const db = createDb(TEST_DB);
    const adrs = await getAdrs(db);
    expect(adrs).toHaveLength(3);
  });

  it("returns warnings array", async () => {
    const result = await ingestRepository({
      paths: [],
      basePath: MOCK_REPO,
      repository: "test-repo",
      dbPath: TEST_DB,
    });

    expect(Array.isArray(result.warnings)).toBe(true);
  });
});
