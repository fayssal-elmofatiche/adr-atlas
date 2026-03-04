import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const adrs = sqliteTable(
  "adr",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    status: text("status").notNull(),
    date: text("date"),
    authors: text("authors"), // JSON array stored as text
    repository: text("repository").notNull(),
    filePath: text("file_path").notNull(),
    summary: text("summary"),
    context: text("context"),
    decision: text("decision"),
    consequences: text("consequences"),
    rawContent: text("raw_content"),
    createdAt: text("created_at").default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex("uq_adr_repo_path").on(table.repository, table.filePath)],
);

export const tags = sqliteTable("tag", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const adrTags = sqliteTable(
  "adr_tag",
  {
    adrId: integer("adr_id")
      .notNull()
      .references(() => adrs.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("uq_adr_tag").on(table.adrId, table.tagId)],
);

export const components = sqliteTable("component", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  team: text("team"),
  system: text("system"),
});

export const adrComponents = sqliteTable(
  "adr_component",
  {
    adrId: integer("adr_id")
      .notNull()
      .references(() => adrs.id, { onDelete: "cascade" }),
    componentId: integer("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("uq_adr_component").on(table.adrId, table.componentId)],
);

export const adrEdges = sqliteTable("adr_edge", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceAdrId: integer("source_adr_id")
    .notNull()
    .references(() => adrs.id, { onDelete: "cascade" }),
  targetAdrId: integer("target_adr_id")
    .notNull()
    .references(() => adrs.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'supersedes' | 'relates_to' | 'depends_on' | 'conflicts_with'
});
