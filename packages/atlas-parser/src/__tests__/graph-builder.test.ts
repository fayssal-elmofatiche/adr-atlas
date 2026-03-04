import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAdr } from "../parse-adr.js";
import { buildGraph } from "../graph-builder.js";
import type { GraphInput } from "../graph-builder.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf-8");
}

describe("buildGraph", () => {
  it("creates nodes for each ADR", () => {
    const inputs: GraphInput[] = [
      {
        adr: parseAdr(readFixture("nygard-simple.md"), "docs/adr/0001-use-postgresql.md"),
        repository: "my-repo",
      },
      {
        adr: parseAdr(readFixture("madr-full.md"), "docs/adr/0005-use-react.md"),
        repository: "my-repo",
      },
    ];

    const graph = buildGraph(inputs);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes[0].id).toBe("my-repo:docs/adr/0001-use-postgresql.md");
    expect(graph.nodes[1].id).toBe("my-repo:docs/adr/0005-use-react.md");
  });

  it("resolves relationships into edges", () => {
    const inputs: GraphInput[] = [
      {
        adr: parseAdr(
          readFixture("mock-repo/docs/adr/0001-use-postgres.md"),
          "docs/adr/0001-use-postgres.md",
        ),
        repository: "test",
      },
      {
        adr: parseAdr(
          readFixture("mock-repo/docs/adr/0002-use-redis.md"),
          "docs/adr/0002-use-redis.md",
        ),
        repository: "test",
      },
    ];

    const graph = buildGraph(inputs);

    // ADR-002 supersedes ADR-001
    const supersedes = graph.edges.filter((e) => e.type === "supersedes");
    expect(supersedes).toHaveLength(1);
    expect(supersedes[0].sourceId).toBe("test:docs/adr/0002-use-redis.md");
    expect(supersedes[0].targetId).toBe("test:docs/adr/0001-use-postgres.md");
  });

  it("warns about unresolved references", () => {
    const inputs: GraphInput[] = [
      {
        adr: parseAdr(readFixture("multiple-relationships.md"), "docs/adr/0010-microservices.md"),
        repository: "test",
      },
    ];

    const graph = buildGraph(inputs);

    // All references should be unresolved since only one ADR exists
    const unresolved = graph.warnings.filter(
      (w) => w.type === "unresolved_reference",
    );
    expect(unresolved.length).toBeGreaterThan(0);
  });

  it("detects ambiguous supersession", () => {
    // Two ADRs both claiming to supersede the same target
    const target = parseAdr("# Target ADR\n\n## Status\n\nAccepted", "0001.md");
    const sup1 = parseAdr(
      "# First Superseder\n\n## Status\n\nAccepted\n\nSupersedes ADR-1",
      "0002.md",
    );
    const sup2 = parseAdr(
      "# Second Superseder\n\n## Status\n\nAccepted\n\nSupersedes ADR-1",
      "0003.md",
    );

    const inputs: GraphInput[] = [
      { adr: target, repository: "test" },
      { adr: sup1, repository: "test" },
      { adr: sup2, repository: "test" },
    ];

    const graph = buildGraph(inputs);
    const ambiguous = graph.warnings.filter(
      (w) => w.type === "ambiguous_supersession",
    );
    expect(ambiguous).toHaveLength(1);
  });

  it("detects duplicate identities", () => {
    const adr = parseAdr("# Some ADR\n\n## Status\n\nAccepted", "same/path.md");
    const inputs: GraphInput[] = [
      { adr, repository: "repo" },
      { adr, repository: "repo" },
    ];

    const graph = buildGraph(inputs);
    const dupes = graph.warnings.filter(
      (w) => w.type === "duplicate_identity",
    );
    expect(dupes).toHaveLength(1);
  });

  it("does not create self-referential edges", () => {
    const adr = parseAdr(
      "# ADR-1: Self Ref\n\n## Context\n\nSee [ADR-1] for context.",
      "0001-self-ref.md",
    );
    const inputs: GraphInput[] = [{ adr, repository: "test" }];

    const graph = buildGraph(inputs);
    expect(graph.edges).toHaveLength(0);
  });

  it("builds a full graph from mock repo files", () => {
    const files = [
      "mock-repo/docs/adr/0001-use-postgres.md",
      "mock-repo/docs/adr/0002-use-redis.md",
      "mock-repo/architecture/decisions/0003-use-kafka.md",
    ];

    const inputs: GraphInput[] = files.map((f) => ({
      adr: parseAdr(readFixture(f), f.replace("mock-repo/", "")),
      repository: "test",
    }));

    const graph = buildGraph(inputs);
    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
