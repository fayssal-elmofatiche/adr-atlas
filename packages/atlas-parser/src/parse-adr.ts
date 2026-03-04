import type { ParsedAdr } from "./types.js";
import { extractFrontmatter } from "./frontmatter.js";
import { extractSections } from "./sections.js";
import { resolveMetadata } from "./metadata.js";
import { detectRelationships } from "./relationships.js";

/**
 * Parses a raw ADR markdown string into a structured ParsedAdr object.
 * Supports adr-tools, MADR, and generic frontmatter formats.
 */
export function parseAdr(rawContent: string, filePath: string): ParsedAdr {
  // 1. Extract frontmatter (if any)
  const { data: frontmatter, content: bodyContent } =
    extractFrontmatter(rawContent);

  // 2. Extract sections from the markdown body
  const { title: h1Title, sections } = extractSections(bodyContent);

  // 3. Resolve metadata from all sources
  const metadata = resolveMetadata(frontmatter, h1Title, sections, filePath, bodyContent);

  // 4. Detect relationships
  const references = detectRelationships(frontmatter, sections);

  return {
    title: metadata.title,
    status: metadata.status,
    date: metadata.date,
    authors: metadata.authors,
    tags: metadata.tags,
    components: metadata.components,
    sections,
    context: sections.context ?? null,
    decision: sections.decision ?? null,
    consequences: sections.consequences ?? null,
    references,
    filePath,
    rawContent,
  };
}
