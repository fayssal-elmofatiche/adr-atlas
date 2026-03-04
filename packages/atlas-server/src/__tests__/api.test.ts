import { describe, it, expect, beforeAll } from "vitest";
import { createApp } from "../app.js";
import { setDb } from "../database/provider.js";
import { createMigratedDb, seedDatabase } from "@atlas/parser/db";
import { parseAdr, buildGraph } from "@atlas/parser";
import type { Express } from "express";

// Lightweight request helper (avoids supertest dependency)
async function request(app: Express, method: string, path: string, body?: unknown) {
  const port = 0; // random port
  const server = app.listen(port);
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("Server did not start");

  const url = `http://127.0.0.1:${addr.port}${path}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = res.headers.get("content-type")?.includes("json") ? await res.json() : null;
  server.close();
  return { status: res.status, body: json };
}

function seedTestData() {
  const adr1 = parseAdr(
    `---\ntitle: Use PostgreSQL\nstatus: accepted\ndate: 2024-01-15\ntags: [database]\ncomponents: [user-service]\n---\n\n## Context\nWe need a database.\n\n## Decision\nUse PostgreSQL.\n\n## Consequences\nGood tooling.`,
    "docs/adr/0001-use-postgres.md",
  );
  const adr2 = parseAdr(
    `---\ntitle: Use Redis for Caching\nstatus: accepted\ndate: 2024-03-01\ntags: [caching, performance]\ncomponents: [user-service, order-service]\nsupersedes: ADR-1\n---\n\n## Context\nNeed caching.\n\n## Decision\nUse Redis.\n\n## Consequences\nFaster responses.`,
    "docs/adr/0002-use-redis.md",
  );
  const adr3 = parseAdr(
    `---\ntitle: Use Kafka for Events\nstatus: proposed\ndate: 2024-05-01\ntags: [messaging]\ncomponents: [order-service]\n---\n\n## Context\nNeed event streaming.\n\n## Decision\nUse Kafka.\n\n## Consequences\nHigh throughput.`,
    "docs/adr/0003-use-kafka.md",
  );

  return buildGraph([
    { adr: adr1, repository: "test" },
    { adr: adr2, repository: "test" },
    { adr: adr3, repository: "test" },
  ]);
}

describe("Atlas Server API", () => {
  let app: Express;

  beforeAll(async () => {
    const db = await createMigratedDb(":memory:");
    const graph = seedTestData();
    await seedDatabase(db, graph);
    setDb(db);
    app = createApp();
  });

  describe("GET /api/health", () => {
    it("returns ok", async () => {
      const res = await request(app, "GET", "/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("GET /api/adrs", () => {
    it("returns all ADRs", async () => {
      const res = await request(app, "GET", "/api/adrs");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
    });

    it("filters by status", async () => {
      const res = await request(app, "GET", "/api/adrs?status=accepted");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((a: any) => a.status === "accepted")).toBe(true);
    });

    it("filters by tag", async () => {
      const res = await request(app, "GET", "/api/adrs?tag=database");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Use PostgreSQL");
    });

    it("filters by component", async () => {
      const res = await request(app, "GET", "/api/adrs?component=order-service");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe("GET /api/adrs/:id", () => {
    it("returns ADR detail", async () => {
      const list = await request(app, "GET", "/api/adrs");
      const id = list.body[0].id;

      const res = await request(app, "GET", `/api/adrs/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Use PostgreSQL");
      expect(res.body.context).toContain("We need a database");
      expect(res.body.relationships).toBeDefined();
    });

    it("returns 404 for non-existent ID", async () => {
      const res = await request(app, "GET", "/api/adrs/999");
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid ID", async () => {
      const res = await request(app, "GET", "/api/adrs/abc");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/adrs/search", () => {
    it("finds ADRs by keyword", async () => {
      const res = await request(app, "GET", "/api/adrs/search?q=Kafka");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Use Kafka for Events");
    });

    it("returns 400 when q is missing", async () => {
      const res = await request(app, "GET", "/api/adrs/search");
      expect(res.status).toBe(400);
    });

    it("returns empty for no matches", async () => {
      const res = await request(app, "GET", "/api/adrs/search?q=nonexistent-xyz");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe("GET /api/graph", () => {
    it("returns nodes and edges", async () => {
      const res = await request(app, "GET", "/api/graph");
      expect(res.status).toBe(200);
      expect(res.body.nodes).toHaveLength(3);
      expect(res.body.edges.length).toBeGreaterThan(0);
    });

    it("filters by status", async () => {
      const res = await request(app, "GET", "/api/graph?status=proposed");
      expect(res.status).toBe(200);
      expect(res.body.nodes).toHaveLength(1);
      expect(res.body.nodes[0].title).toBe("Use Kafka for Events");
    });
  });

  describe("GET /api/components", () => {
    it("returns all components", async () => {
      const res = await request(app, "GET", "/api/components");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      const names = res.body.map((c: any) => c.name);
      expect(names).toContain("user-service");
      expect(names).toContain("order-service");
    });
  });

  describe("GET /api/components/:name/adrs", () => {
    it("returns ADRs for a component", async () => {
      const res = await request(app, "GET", "/api/components/user-service/adrs");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty for unknown component", async () => {
      const res = await request(app, "GET", "/api/components/nonexistent/adrs");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});
