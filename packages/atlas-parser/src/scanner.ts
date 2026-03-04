import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import type { ScanResult } from "./types.js";
import { DEFAULT_SCAN_PATHS } from "./constants.js";

export interface ScanOptions {
  /** Directories to scan. If empty, scans DEFAULT_SCAN_PATHS relative to basePath. */
  paths?: string[];
  /** Base path to resolve relative directories against */
  basePath: string;
  /** Repository identifier */
  repository: string;
}

/**
 * Scans directories for ADR markdown files.
 * Searches default ADR locations if no explicit paths are provided.
 */
export async function scanForAdrs(options: ScanOptions): Promise<ScanResult[]> {
  const { basePath, repository } = options;
  const resolvedBase = resolve(basePath);

  // Build glob patterns
  const searchPaths = options.paths?.length
    ? options.paths
    : DEFAULT_SCAN_PATHS;

  const patterns = searchPaths.map((p) =>
    join(resolvedBase, p, "**/*.md").replace(/\\/g, "/"),
  );

  const files = await fg(patterns, {
    absolute: true,
    onlyFiles: true,
    ignore: ["**/node_modules/**"],
  });

  const results: ScanResult[] = [];
  for (const file of files.sort()) {
    const content = await readFile(file, "utf-8");
    results.push({
      filePath: relative(resolvedBase, file),
      repository,
      rawContent: content,
    });
  }

  return results;
}
