import { describe, it, expect } from "vitest";
import { detectRelationships } from "../relationships.js";

describe("detectRelationships", () => {
  it("detects explicit supersedes references", () => {
    const refs = detectRelationships({}, {
      status: "Accepted\n\nSupersedes ADR-004",
    });

    const supersedes = refs.filter((r) => r.type === "supersedes");
    expect(supersedes).toHaveLength(1);
    expect(supersedes[0].targetIdentifier).toBe("ADR-004");
  });

  it("detects depends_on references in text", () => {
    const refs = detectRelationships({}, {
      decision: "We will use X. This depends on ADR-001.",
    });

    const dependsOn = refs.filter((r) => r.type === "depends_on");
    expect(dependsOn).toHaveLength(1);
    expect(dependsOn[0].targetIdentifier).toBe("ADR-001");
  });

  it("detects relates_to references in text", () => {
    const refs = detectRelationships({}, {
      context: "This relates to ADR-005 and ADR-010.",
    });

    const relatesTo = refs.filter((r) => r.type === "relates_to");
    expect(relatesTo).toHaveLength(2);
  });

  it("detects conflicts_with references", () => {
    const refs = detectRelationships({}, {
      decision: "This conflicts with ADR-003.",
    });

    const conflicts = refs.filter((r) => r.type === "conflicts_with");
    expect(conflicts).toHaveLength(1);
  });

  it("detects frontmatter references", () => {
    const refs = detectRelationships(
      {
        supersedes: "ADR-002",
        "relates-to": ["ADR-001", "ADR-004"],
      },
      {},
    );

    expect(refs.filter((r) => r.type === "supersedes")).toHaveLength(1);
    expect(refs.filter((r) => r.type === "relates_to")).toHaveLength(2);
  });

  it("detects implicit bracketed references [ADR-003]", () => {
    const refs = detectRelationships({}, {
      context: "As discussed in [ADR-003], we need a new approach.",
    });

    const relatesTo = refs.filter((r) => r.type === "relates_to");
    expect(relatesTo).toHaveLength(1);
    expect(relatesTo[0].targetIdentifier).toBe("ADR-003");
  });

  it("detects markdown link references with relationship context", () => {
    const refs = detectRelationships({}, {
      status: "Supersedes [ADR-003](0003-use-rabbitmq.md)",
    });

    // Should detect supersedes from the keyword + bracketed ADR ref
    const supersedes = refs.filter((r) => r.type === "supersedes");
    expect(supersedes.length).toBeGreaterThanOrEqual(1);
    expect(supersedes[0].targetIdentifier).toBe("ADR-003");
  });

  it("deduplicates references", () => {
    const refs = detectRelationships(
      { supersedes: "ADR-002" },
      { decision: "Supersedes ADR-002." },
    );

    // Frontmatter uses "ADR-002", text detection uses "ADR-002" — should dedup
    const supersedes = refs.filter((r) => r.type === "supersedes");
    expect(supersedes).toHaveLength(1);
  });

  it("returns empty array for content with no references", () => {
    const refs = detectRelationships({}, {
      context: "Just some regular text without any ADR references.",
    });

    expect(refs).toHaveLength(0);
  });
});
