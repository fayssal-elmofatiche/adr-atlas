import { SECTION_ALIASES } from "./constants.js";

export interface ExtractedSections {
  /** The H1 title, if present */
  title: string | null;
  /** Map of normalized section name -> raw content (trimmed) */
  sections: Record<string, string>;
}

/**
 * Splits markdown content by H2 headings and normalizes section names.
 * Also extracts the H1 title if present.
 */
export function extractSections(content: string): ExtractedSections {
  const lines = content.split("\n");
  let title: string | null = null;
  const sections: Record<string, string> = {};

  let currentSection: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    // Check for H1 title
    const h1Match = line.match(/^#\s+(.+)/);
    if (h1Match && title === null) {
      title = h1Match[1].trim();
      continue;
    }

    // Check for H2 section heading
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      // Save previous section
      if (currentSection !== null) {
        sections[currentSection] = currentLines.join("\n").trim();
      }
      currentSection = normalizeSection(h2Match[1].trim());
      currentLines = [];
      continue;
    }

    if (currentSection !== null) {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentSection !== null) {
    sections[currentSection] = currentLines.join("\n").trim();
  }

  return { title, sections };
}

/** Normalize a section heading to a canonical name */
function normalizeSection(heading: string): string {
  const lower = heading.toLowerCase();
  return SECTION_ALIASES[lower] ?? lower.replace(/\s+/g, "_");
}
