import { describe, it, expect } from "vitest";
import { extractSections } from "../sections.js";

describe("extractSections", () => {
  it("extracts H1 title and H2 sections", () => {
    const input = `# My Decision

## Context

Some context here.

## Decision

We decided X.

## Consequences

Result of the decision.`;

    const result = extractSections(input);
    expect(result.title).toBe("My Decision");
    expect(result.sections.context).toBe("Some context here.");
    expect(result.sections.decision).toBe("We decided X.");
    expect(result.sections.consequences).toBe("Result of the decision.");
  });

  it("normalizes MADR section names", () => {
    const input = `# Title

## Context and Problem Statement

The problem.

## Decision Outcome

The outcome.

## Considered Options

Options list.`;

    const result = extractSections(input);
    expect(result.sections.context).toBe("The problem.");
    expect(result.sections.decision).toBe("The outcome.");
    expect(result.sections.options).toBe("Options list.");
  });

  it("handles content with no sections", () => {
    const result = extractSections("# Just a title\n\nSome text.");
    expect(result.title).toBe("Just a title");
    expect(Object.keys(result.sections)).toHaveLength(0);
  });

  it("handles content with no title", () => {
    const input = `## Context

Some context.`;

    const result = extractSections(input);
    expect(result.title).toBeNull();
    expect(result.sections.context).toBe("Some context.");
  });
});
