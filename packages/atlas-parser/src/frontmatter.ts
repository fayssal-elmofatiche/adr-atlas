import matter from "gray-matter";

export interface FrontmatterResult {
  /** Parsed frontmatter data */
  data: Record<string, unknown>;
  /** Markdown content with frontmatter stripped */
  content: string;
}

/**
 * Extracts YAML frontmatter from markdown content.
 * Returns the parsed data and the remaining content.
 */
export function extractFrontmatter(raw: string): FrontmatterResult {
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, content };
}
