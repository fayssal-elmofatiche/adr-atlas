import { eq, like, or, and, inArray } from "drizzle-orm";
import type { AtlasDb } from "./connection.js";
import { adrs, tags, adrTags, components, adrComponents, adrEdges } from "./schema.js";

export interface AdrFilter {
  status?: string;
  tag?: string;
  component?: string;
  repository?: string;
}

export interface AdrListItem {
  id: number;
  title: string;
  status: string;
  date: string | null;
  repository: string;
  filePath: string;
  tags: string[];
  components: string[];
}

export interface AdrDetail extends AdrListItem {
  authors: string[];
  context: string | null;
  decision: string | null;
  consequences: string | null;
  rawContent: string | null;
  relationships: AdrRelationship[];
}

export interface AdrRelationship {
  adrId: number;
  adrTitle: string;
  type: string;
}

export interface GraphNode {
  id: number;
  title: string;
  status: string;
  date: string | null;
  tags: string[];
  components: string[];
  connectionCount: number;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Get list of ADRs with optional filters */
export async function getAdrs(db: AtlasDb, filters?: AdrFilter): Promise<AdrListItem[]> {
  let rows = await db.select().from(adrs);

  if (filters?.status) {
    rows = rows.filter((r) => r.status === filters.status);
  }
  if (filters?.repository) {
    rows = rows.filter((r) => r.repository === filters.repository);
  }

  if (filters?.tag) {
    const tagRow = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, filters.tag)).get();
    if (!tagRow) return [];
    const adrIds = (
      await db.select({ adrId: adrTags.adrId }).from(adrTags).where(eq(adrTags.tagId, tagRow.id))
    ).map((r) => r.adrId);
    rows = rows.filter((r) => adrIds.includes(r.id));
  }

  if (filters?.component) {
    const compRow = await db
      .select({ id: components.id })
      .from(components)
      .where(eq(components.name, filters.component))
      .get();
    if (!compRow) return [];
    const adrIds = (
      await db
        .select({ adrId: adrComponents.adrId })
        .from(adrComponents)
        .where(eq(adrComponents.componentId, compRow.id))
    ).map((r) => r.adrId);
    rows = rows.filter((r) => adrIds.includes(r.id));
  }

  const results: AdrListItem[] = [];
  for (const r of rows) {
    results.push({
      id: r.id,
      title: r.title,
      status: r.status,
      date: r.date,
      repository: r.repository,
      filePath: r.filePath,
      tags: await getTagsForAdr(db, r.id),
      components: await getComponentsForAdr(db, r.id),
    });
  }
  return results;
}

/** Get a single ADR by ID with full detail */
export async function getAdrById(db: AtlasDb, id: number): Promise<AdrDetail | null> {
  const row = await db.select().from(adrs).where(eq(adrs.id, id)).get();
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    date: row.date,
    repository: row.repository,
    filePath: row.filePath,
    authors: row.authors ? JSON.parse(row.authors) : [],
    context: row.context,
    decision: row.decision,
    consequences: row.consequences,
    rawContent: row.rawContent,
    tags: await getTagsForAdr(db, row.id),
    components: await getComponentsForAdr(db, row.id),
    relationships: await getRelationshipsForAdr(db, row.id),
  };
}

/** Full-text search across ADR content */
export async function searchAdrs(db: AtlasDb, query: string): Promise<AdrListItem[]> {
  const pattern = `%${query}%`;
  const rows = await db
    .select()
    .from(adrs)
    .where(
      or(
        like(adrs.title, pattern),
        like(adrs.context, pattern),
        like(adrs.decision, pattern),
        like(adrs.consequences, pattern),
      ),
    );

  const results: AdrListItem[] = [];
  for (const r of rows) {
    results.push({
      id: r.id,
      title: r.title,
      status: r.status,
      date: r.date,
      repository: r.repository,
      filePath: r.filePath,
      tags: await getTagsForAdr(db, r.id),
      components: await getComponentsForAdr(db, r.id),
    });
  }
  return results;
}

/** Get the full graph (nodes + edges) with optional filters */
export async function getGraph(db: AtlasDb, filters?: AdrFilter): Promise<GraphData> {
  const adrList = await getAdrs(db, filters);
  const adrIds = adrList.map((a) => a.id);

  const allEdges = await db.select().from(adrEdges);
  const filteredEdges = allEdges.filter(
    (e) => adrIds.includes(e.sourceAdrId) && adrIds.includes(e.targetAdrId),
  );

  const connectionCount = new Map<number, number>();
  for (const edge of filteredEdges) {
    connectionCount.set(edge.sourceAdrId, (connectionCount.get(edge.sourceAdrId) ?? 0) + 1);
    connectionCount.set(edge.targetAdrId, (connectionCount.get(edge.targetAdrId) ?? 0) + 1);
  }

  const nodes: GraphNode[] = adrList.map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    date: a.date,
    tags: a.tags,
    components: a.components,
    connectionCount: connectionCount.get(a.id) ?? 0,
  }));

  const edges: GraphEdge[] = filteredEdges.map((e) => ({
    id: e.id,
    source: e.sourceAdrId,
    target: e.targetAdrId,
    type: e.type,
  }));

  return { nodes, edges };
}

/** Get all components */
export async function getComponents(db: AtlasDb) {
  return db.select().from(components);
}

/** Get ADRs linked to a specific component */
export async function getComponentAdrs(db: AtlasDb, componentName: string): Promise<AdrListItem[]> {
  const comp = await db
    .select({ id: components.id })
    .from(components)
    .where(eq(components.name, componentName))
    .get();

  if (!comp) return [];

  const adrIds = (
    await db
      .select({ adrId: adrComponents.adrId })
      .from(adrComponents)
      .where(eq(adrComponents.componentId, comp.id))
  ).map((r) => r.adrId);

  if (adrIds.length === 0) return [];

  const rows = await db.select().from(adrs).where(inArray(adrs.id, adrIds));

  const results: AdrListItem[] = [];
  for (const r of rows) {
    results.push({
      id: r.id,
      title: r.title,
      status: r.status,
      date: r.date,
      repository: r.repository,
      filePath: r.filePath,
      tags: await getTagsForAdr(db, r.id),
      components: await getComponentsForAdr(db, r.id),
    });
  }
  return results;
}

// --- Helpers ---

async function getTagsForAdr(db: AtlasDb, adrId: number): Promise<string[]> {
  const rows = await db
    .select({ name: tags.name })
    .from(adrTags)
    .innerJoin(tags, eq(adrTags.tagId, tags.id))
    .where(eq(adrTags.adrId, adrId));
  return rows.map((r) => r.name);
}

async function getComponentsForAdr(db: AtlasDb, adrId: number): Promise<string[]> {
  const rows = await db
    .select({ name: components.name })
    .from(adrComponents)
    .innerJoin(components, eq(adrComponents.componentId, components.id))
    .where(eq(adrComponents.adrId, adrId));
  return rows.map((r) => r.name);
}

async function getRelationshipsForAdr(db: AtlasDb, adrId: number): Promise<AdrRelationship[]> {
  const rels: AdrRelationship[] = [];

  // Outbound edges
  const outbound = await db
    .select({
      targetId: adrEdges.targetAdrId,
      type: adrEdges.type,
      title: adrs.title,
    })
    .from(adrEdges)
    .innerJoin(adrs, eq(adrEdges.targetAdrId, adrs.id))
    .where(eq(adrEdges.sourceAdrId, adrId));

  for (const row of outbound) {
    rels.push({ adrId: row.targetId, adrTitle: row.title, type: row.type });
  }

  // Inbound supersedes → superseded_by
  const inboundSupersedes = await db
    .select({ sourceId: adrEdges.sourceAdrId, title: adrs.title })
    .from(adrEdges)
    .innerJoin(adrs, eq(adrEdges.sourceAdrId, adrs.id))
    .where(and(eq(adrEdges.targetAdrId, adrId), eq(adrEdges.type, "supersedes")));

  for (const row of inboundSupersedes) {
    rels.push({ adrId: row.sourceId, adrTitle: row.title, type: "superseded_by" });
  }

  // Inbound depends_on → depended_on_by
  const inboundDepends = await db
    .select({ sourceId: adrEdges.sourceAdrId, title: adrs.title })
    .from(adrEdges)
    .innerJoin(adrs, eq(adrEdges.sourceAdrId, adrs.id))
    .where(and(eq(adrEdges.targetAdrId, adrId), eq(adrEdges.type, "depends_on")));

  for (const row of inboundDepends) {
    rels.push({ adrId: row.sourceId, adrTitle: row.title, type: "depended_on_by" });
  }

  return rels;
}
