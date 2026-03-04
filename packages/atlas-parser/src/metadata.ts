import type { AdrStatus } from "./types.js";
import { ADR_STATUSES } from "./constants.js";

export interface ResolvedMetadata {
  title: string;
  status: AdrStatus | string;
  date: string | null;
  authors: string[];
  tags: string[];
  components: string[];
}

/**
 * Merges metadata from frontmatter, the H1 title, parsed sections,
 * and raw body content into a single normalized metadata object.
 */
export function resolveMetadata(
  frontmatter: Record<string, unknown>,
  h1Title: string | null,
  sections: Record<string, string>,
  filePath: string,
  bodyContent?: string,
): ResolvedMetadata {
  return {
    title: resolveTitle(frontmatter, h1Title, filePath),
    status: resolveStatus(frontmatter, sections),
    date: resolveDate(frontmatter, sections, bodyContent),
    authors: resolveArray(frontmatter, "authors", "decision-makers"),
    tags: resolveArray(frontmatter, "tags"),
    components: resolveArray(frontmatter, "components"),
  };
}

function resolveTitle(
  fm: Record<string, unknown>,
  h1Title: string | null,
  filePath: string,
): string {
  // Prefer frontmatter title
  if (typeof fm.title === "string" && fm.title.trim()) {
    return fm.title.trim();
  }

  // Then H1 heading (strip numeric prefixes like "1." or "ADR-001:")
  if (h1Title) {
    return h1Title.replace(/^\d+\.\s*/, "").replace(/^ADR-?\d+[.:]\s*/i, "").trim();
  }

  // Fallback to filename
  const name = filePath.split("/").pop() ?? filePath;
  return name.replace(/\.md$/i, "").replace(/^\d+-/, "").replace(/-/g, " ");
}

function resolveStatus(
  fm: Record<string, unknown>,
  sections: Record<string, string>,
): AdrStatus | string {
  // Frontmatter status
  if (typeof fm.status === "string" && fm.status.trim()) {
    return normalizeStatus(fm.status.trim());
  }

  // Status section (adr-tools style)
  if (sections.status) {
    // Take the first meaningful word/line
    const firstLine = sections.status.split("\n")[0].trim();
    // Strip trailing punctuation and any relationship text
    const statusWord = firstLine.split(/\s/)[0].replace(/[.,;:]$/, "");
    if (statusWord) {
      return normalizeStatus(statusWord);
    }
  }

  return "proposed";
}

function normalizeStatus(raw: string): AdrStatus | string {
  const lower = raw.toLowerCase();
  if (ADR_STATUSES.includes(lower as AdrStatus)) {
    return lower as AdrStatus;
  }
  return lower;
}

function resolveDate(
  fm: Record<string, unknown>,
  sections: Record<string, string>,
  bodyContent?: string,
): string | null {
  // Frontmatter date
  if (fm.date != null) {
    if (fm.date instanceof Date) {
      return fm.date.toISOString().split("T")[0];
    }
    const str = String(fm.date).trim();
    if (str) return str;
  }

  // Look for "Date:" inline pattern in sections
  for (const content of Object.values(sections)) {
    const match = content.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (match) return match[1];
  }

  // Look for "Date:" in raw body content (handles Nygard format where
  // "Date:" appears between H1 and first H2, outside any section)
  if (bodyContent) {
    const match = bodyContent.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (match) return match[1];
  }

  return null;
}

function resolveArray(
  fm: Record<string, unknown>,
  ...keys: string[]
): string[] {
  for (const key of keys) {
    const val = fm[key];
    if (Array.isArray(val)) {
      return val.map(String).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof val === "string" && val.trim()) {
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}
