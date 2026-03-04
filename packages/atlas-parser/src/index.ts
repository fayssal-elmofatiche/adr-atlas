// Core types
export type {
  AdrStatus,
  EdgeType,
  ReferenceSource,
  AdrReference,
  ParsedAdr,
  ScanResult,
  AdrNode,
  AdrEdge,
  AdrGraph,
  GraphWarning,
  GraphWarningType,
} from "./types.js";

// Constants
export {
  ADR_STATUSES,
  EDGE_TYPES,
  DEFAULT_SCAN_PATHS,
  SECTION_ALIASES,
} from "./constants.js";

// Parser
export { parseAdr } from "./parse-adr.js";

// Scanner
export { scanForAdrs } from "./scanner.js";
export type { ScanOptions } from "./scanner.js";

// Graph builder
export { buildGraph } from "./graph-builder.js";
export type { GraphInput } from "./graph-builder.js";

// Ingestion pipeline
export { ingestRepository } from "./ingest.js";
export type { IngestOptions, IngestResult } from "./ingest.js";

// Sub-modules (for advanced usage)
export { extractFrontmatter } from "./frontmatter.js";
export { extractSections } from "./sections.js";
export { resolveMetadata } from "./metadata.js";
export { detectRelationships } from "./relationships.js";
