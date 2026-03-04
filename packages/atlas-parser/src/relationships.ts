import type { AdrReference, EdgeType, ReferenceSource } from "./types.js";

/** Patterns for explicit relationship references.
 * The \[? allows optional markdown link brackets around the ADR reference. */
const RELATIONSHIP_PATTERNS: Array<{
  type: EdgeType;
  pattern: RegExp;
}> = [
  {
    type: "supersedes",
    pattern: /supersedes?\s+\[?(?:ADR[- ]?)?(\d+)/gi,
  },
  {
    type: "relates_to",
    pattern: /(?:relates?\s+to|related\s+to)\s+\[?(?:ADR[- ]?)?(\d+)/gi,
  },
  {
    type: "depends_on",
    pattern: /depends?\s+on\s+\[?(?:ADR[- ]?)?(\d+)/gi,
  },
  {
    type: "conflicts_with",
    pattern: /conflicts?\s+with\s+\[?(?:ADR[- ]?)?(\d+)/gi,
  },
];

/** Pattern for "and ADR-NNN" continuations after a relationship keyword */
const AND_CONTINUATION_PATTERN = /\band\s+\[?(?:ADR[- ]?)(\d+)\]?/gi;

/** Pattern for markdown link references to ADR files */
const MARKDOWN_LINK_ADR_PATTERN =
  /\[([^\]]*(?:ADR[- ]?\d+)[^\]]*)\]\(([^)]+\.md)\)/gi;

/** Pattern for bracketed implicit references like [ADR-003] (not markdown links) */
const IMPLICIT_REF_PATTERN = /(?<!\()\[ADR[- ]?(\d+)\](?!\()/gi;

/**
 * Detects all ADR references in frontmatter data and markdown sections.
 */
export function detectRelationships(
  frontmatter: Record<string, unknown>,
  sections: Record<string, string>,
): AdrReference[] {
  const refs: AdrReference[] = [];

  // 1. Frontmatter references
  refs.push(...extractFrontmatterRefs(frontmatter));

  // 2. Section-based references
  for (const [sectionName, content] of Object.entries(sections)) {
    const source: ReferenceSource =
      sectionName === "status" ? "status_section" : "inline";
    refs.push(...extractTextRefs(content, source));
  }

  return deduplicateRefs(refs);
}

function extractFrontmatterRefs(
  fm: Record<string, unknown>,
): AdrReference[] {
  const refs: AdrReference[] = [];
  const mapping: Record<string, EdgeType> = {
    supersedes: "supersedes",
    "relates-to": "relates_to",
    relates_to: "relates_to",
    "depends-on": "depends_on",
    depends_on: "depends_on",
    "conflicts-with": "conflicts_with",
    conflicts_with: "conflicts_with",
  };

  for (const [key, type] of Object.entries(mapping)) {
    const val = fm[key];
    if (val == null) continue;

    const identifiers = Array.isArray(val) ? val.map(String) : [String(val)];
    for (const id of identifiers) {
      const normalized = id.trim();
      if (normalized) {
        refs.push({
          type,
          targetIdentifier: normalized,
          source: "frontmatter",
        });
      }
    }
  }

  return refs;
}

function extractTextRefs(
  text: string,
  source: ReferenceSource,
): AdrReference[] {
  const refs: AdrReference[] = [];

  // Explicit relationship patterns
  for (const { type, pattern } of RELATIONSHIP_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      refs.push({
        type,
        targetIdentifier: `ADR-${match[1]}`,
        source,
      });

      // Check for "and ADR-NNN" continuations after this match
      const remainder = text.slice(match.index + match[0].length);
      AND_CONTINUATION_PATTERN.lastIndex = 0;
      let contMatch;
      // Only match if the continuation starts near the end of the previous match
      while ((contMatch = AND_CONTINUATION_PATTERN.exec(remainder)) !== null) {
        // Only consider continuations that are close (within ~20 chars) or at the start
        if (contMatch.index > 30) break;
        refs.push({
          type,
          targetIdentifier: `ADR-${contMatch[1]}`,
          source,
        });
      }
    }
  }

  // Markdown link references to .md files
  MARKDOWN_LINK_ADR_PATTERN.lastIndex = 0;
  let linkMatch;
  while ((linkMatch = MARKDOWN_LINK_ADR_PATTERN.exec(text)) !== null) {
    // Only add if not already captured by explicit patterns
    const filePath = linkMatch[2];
    refs.push({
      type: "relates_to", // default for untyped links
      targetIdentifier: filePath,
      source: "markdown_link",
    });
  }

  // Implicit bracketed references [ADR-003]
  IMPLICIT_REF_PATTERN.lastIndex = 0;
  let implicitMatch;
  while ((implicitMatch = IMPLICIT_REF_PATTERN.exec(text)) !== null) {
    refs.push({
      type: "relates_to", // default for untyped references
      targetIdentifier: `ADR-${implicitMatch[1]}`,
      source: "inline",
    });
  }

  return refs;
}

function deduplicateRefs(refs: AdrReference[]): AdrReference[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.type}:${ref.targetIdentifier}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
