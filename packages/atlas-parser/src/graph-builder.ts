import type {
  ParsedAdr,
  AdrNode,
  AdrEdge,
  AdrGraph,
  GraphWarning,
} from "./types.js";

export interface GraphInput {
  adr: ParsedAdr;
  repository: string;
}

/**
 * Builds an ADR graph from parsed ADRs.
 * Creates nodes for each ADR, resolves references into edges,
 * detects conflicts, and collects warnings for unresolved references.
 */
export function buildGraph(inputs: GraphInput[]): AdrGraph {
  const warnings: GraphWarning[] = [];

  // 1. Create nodes
  const nodes: AdrNode[] = inputs.map((input) => ({
    id: makeNodeId(input.repository, input.adr.filePath),
    adr: input.adr,
    repository: input.repository,
  }));

  // 2. Check for duplicate identities
  const idSet = new Map<string, AdrNode>();
  for (const node of nodes) {
    if (idSet.has(node.id)) {
      warnings.push({
        type: "duplicate_identity",
        message: `Duplicate ADR identity: ${node.id}`,
        context: {
          id: node.id,
          existingTitle: idSet.get(node.id)!.adr.title,
          newTitle: node.adr.title,
        },
      });
    }
    idSet.set(node.id, node);
  }

  // 3. Build a lookup index to resolve references
  // Maps various identifiers to node IDs
  const lookup = buildLookupIndex(nodes);

  // 4. Resolve references into edges
  const edges: AdrEdge[] = [];
  const supersessionTargets = new Map<string, string[]>(); // targetId -> sourceIds

  for (const node of nodes) {
    for (const ref of node.adr.references) {
      const targetId = resolveReference(ref.targetIdentifier, node, lookup);

      if (!targetId) {
        warnings.push({
          type: "unresolved_reference",
          message: `Unresolved reference "${ref.targetIdentifier}" from "${node.adr.title}"`,
          context: {
            sourceId: node.id,
            sourceTitle: node.adr.title,
            targetIdentifier: ref.targetIdentifier,
            referenceType: ref.type,
          },
        });
        continue;
      }

      // Don't create self-referential edges
      if (targetId === node.id) continue;

      edges.push({
        sourceId: node.id,
        targetId,
        type: ref.type,
      });

      // Track supersessions for conflict detection
      if (ref.type === "supersedes") {
        const existing = supersessionTargets.get(targetId) ?? [];
        existing.push(node.id);
        supersessionTargets.set(targetId, existing);
      }
    }
  }

  // 5. Detect ambiguous supersessions
  for (const [targetId, sourceIds] of supersessionTargets) {
    if (sourceIds.length > 1) {
      const targetNode = idSet.get(targetId);
      warnings.push({
        type: "ambiguous_supersession",
        message: `ADR "${targetNode?.adr.title ?? targetId}" is superseded by multiple ADRs`,
        context: {
          targetId,
          supersedingIds: sourceIds.join(", "),
        },
      });
    }
  }

  // 6. Deduplicate edges
  const uniqueEdges = deduplicateEdges(edges);

  return { nodes, edges: uniqueEdges, warnings };
}

function makeNodeId(repository: string, filePath: string): string {
  return `${repository}:${filePath}`;
}

/**
 * Builds a lookup index mapping various identifier forms to node IDs.
 * Supports: "ADR-001", "001", "0001-use-kafka.md", filename, title.
 */
function buildLookupIndex(nodes: AdrNode[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const node of nodes) {
    // By full file path
    index.set(node.adr.filePath.toLowerCase(), node.id);

    // By filename only
    const filename = node.adr.filePath.split("/").pop()?.toLowerCase();
    if (filename) {
      index.set(filename, node.id);
    }

    // Extract numeric ID from filename (e.g., "0004-use-kafka.md" -> "4")
    const numericFromFile = filename?.match(/^(\d+)/);
    if (numericFromFile) {
      const num = String(parseInt(numericFromFile[1], 10));
      index.set(`adr-${num}`, node.id);
      index.set(num, node.id);
    }

    // Extract numeric ID from title (e.g., "ADR-004: Use Kafka" -> "4")
    const numericFromTitle = node.adr.title.match(/ADR[- ]?(\d+)/i);
    if (numericFromTitle) {
      const num = String(parseInt(numericFromTitle[1], 10));
      index.set(`adr-${num}`, node.id);
      index.set(num, node.id);
    }
  }

  return index;
}

/**
 * Resolves a reference identifier to a node ID using the lookup index.
 */
function resolveReference(
  identifier: string,
  sourceNode: AdrNode,
  lookup: Map<string, string>,
): string | null {
  const normalized = identifier.trim().toLowerCase();

  // Direct lookup
  if (lookup.has(normalized)) return lookup.get(normalized)!;

  // Try ADR-NNN format
  const adrMatch = normalized.match(/^adr[- ]?(\d+)$/);
  if (adrMatch) {
    const num = String(parseInt(adrMatch[1], 10));
    if (lookup.has(`adr-${num}`)) return lookup.get(`adr-${num}`)!;
    if (lookup.has(num)) return lookup.get(num)!;
  }

  // Try as relative file path from source
  const sourceDir = sourceNode.adr.filePath.split("/").slice(0, -1).join("/");
  const resolvedPath = sourceDir
    ? `${sourceDir}/${identifier}`.toLowerCase()
    : identifier.toLowerCase();
  if (lookup.has(resolvedPath)) return lookup.get(resolvedPath)!;

  // Try just the filename part
  const filenameOnly = identifier.split("/").pop()?.toLowerCase();
  if (filenameOnly && lookup.has(filenameOnly))
    return lookup.get(filenameOnly)!;

  return null;
}

function deduplicateEdges(edges: AdrEdge[]): AdrEdge[] {
  const seen = new Set<string>();
  return edges.filter((edge) => {
    const key = `${edge.sourceId}|${edge.targetId}|${edge.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
