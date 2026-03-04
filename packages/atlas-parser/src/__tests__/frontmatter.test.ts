import { describe, it, expect } from "vitest";
import { extractFrontmatter } from "../frontmatter.js";

describe("extractFrontmatter", () => {
  it("extracts YAML frontmatter", () => {
    const input = `---
status: accepted
date: 2024-01-10
tags: [messaging, events]
---

# My ADR

Content here.`;

    const result = extractFrontmatter(input);
    expect(result.data.status).toBe("accepted");
    // gray-matter parses date strings as Date objects
    expect(result.data.date).toBeInstanceOf(Date);
    expect(result.data.tags).toEqual(["messaging", "events"]);
    expect(result.content).toContain("# My ADR");
    expect(result.content).not.toContain("---");
  });

  it("returns empty data for content without frontmatter", () => {
    const input = "# Just a heading\n\nSome content.";
    const result = extractFrontmatter(input);
    expect(result.data).toEqual({});
    expect(result.content).toContain("# Just a heading");
  });

  it("handles empty input", () => {
    const result = extractFrontmatter("");
    expect(result.data).toEqual({});
    expect(result.content).toBe("");
  });
});
