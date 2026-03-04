import { describe, it, expect, beforeEach } from "vitest";
import { createMigratedDb } from "../../db/connection.js";
import { seedDatabase } from "../../db/seed.js";
import {
  getAdrs,
  getAdrById,
  searchAdrs,
  getGraph,
  getComponents,
  getComponentAdrs,
} from "../../db/queries.js";
import { buildGraph } from "../../graph-builder.js";
import { parseAdr } from "../../parse-adr.js";
import type { AtlasDb } from "../../db/connection.js";

async function createSeededDb(): Promise<AtlasDb> {
  const db = await createMigratedDb(":memory:");

  const adr1 = parseAdr(
    `---\ntitle: Use PostgreSQL\nstatus: accepted\ndate: 2024-01-15\ntags: [database]\ncomponents: [user-service]\n---\n\n## Context\nWe need a database.\n\n## Decision\nUse PostgreSQL.\n\n## Consequences\nGood tooling.`,
    "docs/adr/0001-use-postgres.md",
  );
  const adr2 = parseAdr(
    `---\ntitle: Use Redis for Caching\nstatus: accepted\ndate: 2024-03-01\ntags: [caching, performance]\ncomponents: [user-service, order-service]\nsupersedes: ADR-1\n---\n\n## Context\nNeed caching.\n\n## Decision\nUse Redis.\n\n## Consequences\nFaster responses.`,
    "docs/adr/0002-use-redis.md",
  );
  const adr3 = parseAdr(
    `---\ntitle: Use Kafka for Events\nstatus: proposed\ndate: 2024-05-01\ntags: [messaging]\ncomponents: [order-service]\n---\n\n## Context\nNeed event streaming. Depends on ADR-1.\n\n## Decision\nUse Kafka.\n\n## Consequences\nHigh throughput.`,
    "docs/adr/0003-use-kafka.md",
  );

  const graph = buildGraph([
    { adr: adr1, repository: "test" },
    { adr: adr2, repository: "test" },
    { adr: adr3, repository: "test" },
  ]);

  await seedDatabase(db, graph);
  return db;
}

describe("Database queries", () => {
  let db: AtlasDb;

  beforeEach(async () => {
    db = await createSeededDb();
  });

  describe("getAdrs", () => {
    it("returns all ADRs with no filters", async () => {
      const result = await getAdrs(db);
      expect(result).toHaveLength(3);
    });

    it("filters by status", async () => {
      const result = await getAdrs(db, { status: "accepted" });
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.status === "accepted")).toBe(true);
    });

    it("filters by tag", async () => {
      const result = await getAdrs(db, { tag: "database" });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Use PostgreSQL");
    });

    it("filters by component", async () => {
      const result = await getAdrs(db, { component: "order-service" });
      expect(result).toHaveLength(2);
    });

    it("includes tags and components in results", async () => {
      const result = await getAdrs(db);
      const redis = result.find((r) => r.title === "Use Redis for Caching");
      expect(redis?.tags).toContain("caching");
      expect(redis?.tags).toContain("performance");
      expect(redis?.components).toContain("user-service");
      expect(redis?.components).toContain("order-service");
    });
  });

  describe("getAdrById", () => {
    it("returns full ADR detail", async () => {
      const allAdrs = await getAdrs(db);
      const detail = await getAdrById(db, allAdrs[0].id);
      expect(detail).not.toBeNull();
      expect(detail!.title).toBe("Use PostgreSQL");
      expect(detail!.context).toContain("We need a database");
      expect(detail!.decision).toContain("Use PostgreSQL");
    });

    it("includes relationships with derived superseded_by", async () => {
      const allAdrs = await getAdrs(db);
      const postgres = allAdrs.find((a) => a.title === "Use PostgreSQL")!;
      const detail = await getAdrById(db, postgres.id);

      const supersededBy = detail!.relationships.filter((r) => r.type === "superseded_by");
      expect(supersededBy).toHaveLength(1);
      expect(supersededBy[0].adrTitle).toBe("Use Redis for Caching");
    });

    it("returns null for non-existent ID", async () => {
      const result = await getAdrById(db, 999);
      expect(result).toBeNull();
    });
  });

  describe("searchAdrs", () => {
    it("finds ADRs by keyword in context", async () => {
      const result = await searchAdrs(db, "caching");
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("finds ADRs by keyword in title", async () => {
      const result = await searchAdrs(db, "Kafka");
      expect(result).toHaveLength(1);
    });

    it("returns empty for no matches", async () => {
      const result = await searchAdrs(db, "nonexistent-xyz");
      expect(result).toHaveLength(0);
    });
  });

  describe("getGraph", () => {
    it("returns nodes and edges", async () => {
      const graph = await getGraph(db);
      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    it("includes connection counts", async () => {
      const graph = await getGraph(db);
      const withConnections = graph.nodes.filter((n) => n.connectionCount > 0);
      expect(withConnections.length).toBeGreaterThan(0);
    });

    it("filters graph by status", async () => {
      const graph = await getGraph(db, { status: "proposed" });
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].title).toBe("Use Kafka for Events");
    });
  });

  describe("getComponents", () => {
    it("returns all components", async () => {
      const result = await getComponents(db);
      expect(result.length).toBeGreaterThanOrEqual(2);
      const names = result.map((c) => c.name);
      expect(names).toContain("user-service");
      expect(names).toContain("order-service");
    });
  });

  describe("getComponentAdrs", () => {
    it("returns ADRs for a component", async () => {
      const result = await getComponentAdrs(db, "user-service");
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty for unknown component", async () => {
      const result = await getComponentAdrs(db, "nonexistent");
      expect(result).toHaveLength(0);
    });
  });
});
