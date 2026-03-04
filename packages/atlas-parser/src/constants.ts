import type { AdrStatus, EdgeType } from "./types.js";

/** All recognized ADR statuses */
export const ADR_STATUSES: AdrStatus[] = [
  "proposed",
  "accepted",
  "rejected",
  "deprecated",
  "superseded",
];

/** All stored edge types */
export const EDGE_TYPES: EdgeType[] = [
  "supersedes",
  "relates_to",
  "depends_on",
  "conflicts_with",
];

/** Default directories to scan for ADR files */
export const DEFAULT_SCAN_PATHS = [
  "adr",
  "adrs",
  "docs/adr",
  "docs/adrs",
  "doc/adr",
  "doc/adrs",
  "architecture/decisions",
  "docs/architecture/decisions",
];

/** Map variant section names to canonical names */
export const SECTION_ALIASES: Record<string, string> = {
  // Context
  context: "context",
  "context and problem statement": "context",
  "problem statement": "context",
  background: "context",

  // Decision
  decision: "decision",
  "decision outcome": "decision",
  "chosen option": "decision",

  // Consequences
  consequences: "consequences",
  "positive consequences": "consequences",
  "negative consequences": "consequences",
  implications: "consequences",

  // Options / Alternatives
  options: "options",
  "considered options": "options",
  alternatives: "options",
  "alternatives considered": "options",

  // Decision drivers
  "decision drivers": "decision_drivers",
  drivers: "decision_drivers",

  // Status
  status: "status",
};
