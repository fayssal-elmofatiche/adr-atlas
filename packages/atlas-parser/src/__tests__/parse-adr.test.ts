import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAdr } from "../parse-adr.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf-8");
}

describe("parseAdr", () => {
  describe("adr-tools / Nygard format", () => {
    it("parses a simple Nygard-style ADR", () => {
      const raw = readFixture("nygard-simple.md");
      const result = parseAdr(raw, "docs/adr/0001-use-postgresql.md");

      expect(result.title).toBe("Use PostgreSQL for persistence");
      expect(result.status).toBe("accepted");
      expect(result.date).toBe("2024-01-15");
      expect(result.context).toContain("reliable, mature relational database");
      expect(result.decision).toContain("PostgreSQL as our primary relational database");
      expect(result.consequences).toContain("mature ecosystem");
    });

    it("parses Nygard-style with markdown link references", () => {
      const raw = readFixture("nygard-with-links.md");
      const result = parseAdr(raw, "docs/adr/0004-use-kafka.md");

      expect(result.title).toBe("Use Kafka for event streaming");
      expect(result.status).toBe("accepted");
      expect(result.date).toBe("2024-03-20");

      // Should detect supersedes reference from status section
      const supersedes = result.references.filter(
        (r) => r.type === "supersedes",
      );
      expect(supersedes.length).toBeGreaterThanOrEqual(1);

      // Should detect depends_on from inline text
      const dependsOn = result.references.filter(
        (r) => r.type === "depends_on",
      );
      expect(dependsOn.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("MADR format", () => {
    it("parses a full MADR-style ADR", () => {
      const raw = readFixture("madr-full.md");
      const result = parseAdr(raw, "docs/adr/0005-use-react.md");

      expect(result.title).toBe("Use React for Frontend Framework");
      expect(result.status).toBe("accepted");
      expect(result.date).toBe("2024-06-01");
      expect(result.authors).toEqual(["Alice", "Bob", "Charlie"]);
      expect(result.context).toContain("frontend framework");
      expect(result.sections).toHaveProperty("decision_drivers");
      expect(result.sections).toHaveProperty("options");
    });

    it("parses a minimal MADR-style ADR", () => {
      const raw = readFixture("madr-minimal.md");
      const result = parseAdr(raw, "docs/adr/0006-adopt-graphql.md");

      expect(result.title).toBe("Adopt GraphQL for Internal APIs");
      expect(result.status).toBe("proposed");
      expect(result.date).toBe("2024-07-15");
    });
  });

  describe("generic frontmatter format", () => {
    it("parses an ADR with full frontmatter metadata", () => {
      const raw = readFixture("frontmatter-full.md");
      const result = parseAdr(raw, "docs/adr/0007-use-redis.md");

      expect(result.title).toBe("Use Redis for Caching");
      expect(result.status).toBe("accepted");
      expect(result.date).toBe("2024-04-10");
      expect(result.tags).toEqual(["caching", "performance", "infrastructure"]);
      expect(result.components).toEqual([
        "order-service",
        "user-service",
        "api-gateway",
      ]);

      // Frontmatter relationships
      const supersedes = result.references.filter(
        (r) => r.type === "supersedes",
      );
      expect(supersedes).toHaveLength(1);
      expect(supersedes[0].targetIdentifier).toBe("ADR-002");

      const relatesTo = result.references.filter(
        (r) => r.type === "relates_to",
      );
      expect(relatesTo.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("multiple relationships", () => {
    it("detects all four relationship types in a single ADR", () => {
      const raw = readFixture("multiple-relationships.md");
      const result = parseAdr(raw, "docs/adr/0010-microservices.md");

      expect(result.title).toBe("Migrate to Microservices");

      const types = result.references.map((r) => r.type);
      expect(types).toContain("supersedes");
      expect(types).toContain("depends_on");
      expect(types).toContain("relates_to");
      expect(types).toContain("conflicts_with");
    });
  });

  describe("edge cases", () => {
    it("handles empty content gracefully", () => {
      const result = parseAdr("", "empty.md");
      expect(result.title).toBe("empty");
      expect(result.status).toBe("proposed");
      expect(result.references).toEqual([]);
    });

    it("uses filename as title fallback", () => {
      const result = parseAdr("Some content without a heading", "0099-my-decision.md");
      expect(result.title).toBe("my decision");
    });
  });
});
