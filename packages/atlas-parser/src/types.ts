/** ADR status lifecycle */
export type AdrStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "deprecated"
  | "superseded";

/** Relationship types stored as edges. `superseded_by` is derived at query time. */
export type EdgeType =
  | "supersedes"
  | "relates_to"
  | "depends_on"
  | "conflicts_with";

/** Where a reference was found during parsing */
export type ReferenceSource =
  | "frontmatter"
  | "status_section"
  | "inline"
  | "markdown_link";

/** Raw reference found during parsing (before graph resolution) */
export interface AdrReference {
  type: EdgeType;
  targetIdentifier: string; // "ADR-004", "0004-use-kafka.md", etc.
  source: ReferenceSource;
}

/** Result of parsing a single ADR file */
export interface ParsedAdr {
  title: string;
  status: AdrStatus | string; // allow unknown statuses, normalize known ones
  date: string | null;
  authors: string[];
  tags: string[];
  components: string[];
  sections: Record<string, string>; // normalized section name -> raw content
  context: string | null;
  decision: string | null;
  consequences: string | null;
  references: AdrReference[];
  filePath: string;
  rawContent: string;
}

/** Result from scanning a directory for ADR files */
export interface ScanResult {
  filePath: string;
  repository: string;
  rawContent: string;
}

/** A node in the ADR graph */
export interface AdrNode {
  id: string; // composite: repository:filePath
  adr: ParsedAdr;
  repository: string;
}

/** An edge in the ADR graph */
export interface AdrEdge {
  sourceId: string;
  targetId: string;
  type: EdgeType;
}

/** Warning types during graph construction */
export type GraphWarningType =
  | "unresolved_reference"
  | "duplicate_identity"
  | "ambiguous_supersession";

/** A warning produced during graph construction */
export interface GraphWarning {
  type: GraphWarningType;
  message: string;
  context: Record<string, string>;
}

/** The complete ADR graph */
export interface AdrGraph {
  nodes: AdrNode[];
  edges: AdrEdge[];
  warnings: GraphWarning[];
}
