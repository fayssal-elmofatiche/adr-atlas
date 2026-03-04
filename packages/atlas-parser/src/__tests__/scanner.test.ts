import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { scanForAdrs } from "../scanner.js";

const MOCK_REPO = join(import.meta.dirname, "fixtures", "mock-repo");

describe("scanForAdrs", () => {
  it("discovers ADR files in default directories", async () => {
    const results = await scanForAdrs({
      basePath: MOCK_REPO,
      repository: "test-repo",
    });

    expect(results.length).toBe(3);
    expect(results.every((r) => r.repository === "test-repo")).toBe(true);
    expect(results.every((r) => r.filePath.endsWith(".md"))).toBe(true);
    expect(results.every((r) => r.rawContent.length > 0)).toBe(true);
  });

  it("uses file paths relative to basePath", async () => {
    const results = await scanForAdrs({
      basePath: MOCK_REPO,
      repository: "test-repo",
    });

    const paths = results.map((r) => r.filePath);
    expect(paths).toContain("docs/adr/0001-use-postgres.md");
    expect(paths).toContain("docs/adr/0002-use-redis.md");
    expect(paths).toContain("architecture/decisions/0003-use-kafka.md");
  });

  it("scans explicit paths", async () => {
    const results = await scanForAdrs({
      basePath: MOCK_REPO,
      repository: "test-repo",
      paths: ["docs/adr"],
    });

    expect(results.length).toBe(2);
  });

  it("returns empty for non-existent paths", async () => {
    const results = await scanForAdrs({
      basePath: MOCK_REPO,
      repository: "test-repo",
      paths: ["nonexistent"],
    });

    expect(results).toEqual([]);
  });
});
