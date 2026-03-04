import { eq, inArray } from "drizzle-orm";
import type { AtlasDb } from "./connection.js";
import { adrs, tags, adrTags, components, adrComponents, adrEdges } from "./schema.js";
import type { AdrGraph } from "../types.js";

/**
 * Populates the database from an AdrGraph.
 * Inserts ADRs, tags, components, and edges.
 * Uses upsert semantics — safe to call multiple times.
 */
export async function seedDatabase(db: AtlasDb, graph: AdrGraph): Promise<void> {
  const nodeToDbId = new Map<string, number>();

  // 1. Insert ADRs
  for (const node of graph.nodes) {
    const [result] = await db
      .insert(adrs)
      .values({
        title: node.adr.title,
        status: node.adr.status,
        date: node.adr.date,
        authors: JSON.stringify(node.adr.authors),
        repository: node.repository,
        filePath: node.adr.filePath,
        context: node.adr.context,
        decision: node.adr.decision,
        consequences: node.adr.consequences,
        rawContent: node.adr.rawContent,
      })
      .onConflictDoUpdate({
        target: [adrs.repository, adrs.filePath],
        set: {
          title: node.adr.title,
          status: node.adr.status,
          date: node.adr.date,
          authors: JSON.stringify(node.adr.authors),
          context: node.adr.context,
          decision: node.adr.decision,
          consequences: node.adr.consequences,
          rawContent: node.adr.rawContent,
        },
      })
      .returning({ id: adrs.id });

    if (result) {
      nodeToDbId.set(node.id, result.id);
    }

    const adrId = result?.id;
    if (!adrId) continue;

    // 2. Insert tags
    for (const tagName of node.adr.tags) {
      await db.insert(tags).values({ name: tagName }).onConflictDoNothing();

      const tagRow = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, tagName))
        .get();

      if (tagRow) {
        await db
          .insert(adrTags)
          .values({ adrId, tagId: tagRow.id })
          .onConflictDoNothing();
      }
    }

    // 3. Insert components
    for (const compName of node.adr.components) {
      await db.insert(components).values({ name: compName }).onConflictDoNothing();

      const compRow = await db
        .select({ id: components.id })
        .from(components)
        .where(eq(components.name, compName))
        .get();

      if (compRow) {
        await db
          .insert(adrComponents)
          .values({ adrId, componentId: compRow.id })
          .onConflictDoNothing();
      }
    }
  }

  // 4. Delete old edges for re-ingested ADRs, then insert fresh edges
  const dbIds = [...nodeToDbId.values()];
  if (dbIds.length > 0) {
    await db.delete(adrEdges).where(inArray(adrEdges.sourceAdrId, dbIds));
  }

  for (const edge of graph.edges) {
    const sourceDbId = nodeToDbId.get(edge.sourceId);
    const targetDbId = nodeToDbId.get(edge.targetId);

    if (sourceDbId != null && targetDbId != null) {
      await db.insert(adrEdges).values({
        sourceAdrId: sourceDbId,
        targetAdrId: targetDbId,
        type: edge.type,
      }).onConflictDoNothing();
    }
  }
}
