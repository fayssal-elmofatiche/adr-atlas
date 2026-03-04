# ADR Atlas — Complete Project Blueprint

## Project

ADR Atlas

**Tagline:**
Mapping and exploring architecture decisions.

ADR Atlas is a tool that ingests Architecture Decision Records (ADRs) and turns them into a **navigable knowledge graph**, allowing engineers to explore relationships between architectural decisions, systems, and time.

---

# 1. Project Vision

Modern software systems accumulate hundreds of architecture decisions over time. These decisions are typically stored as Markdown ADRs but are difficult to navigate and understand.

ADR Atlas transforms static ADR documents into:

* an interactive **decision graph**
* a **timeline of architectural evolution**
* a **searchable knowledge base**

The goal is to make architectural context **discoverable, explorable, and understandable**.

---

# 2. Key Capabilities

ADR Atlas enables engineers to:

• Explore decisions through an interactive graph
• Trace decision evolution through supersession chains
• Discover related decisions
• Search ADR content and metadata
• View architecture decisions by service or component
• Understand how architecture evolved over time

---

# 3. Example Use Cases

### Investigating a System

An engineer working on `order-service` wants to understand architectural constraints.

Steps:

1. Filter ADRs by component `order-service`
2. See all decisions impacting the service
3. Follow dependency edges
4. Read related ADRs

---

### Understanding Architecture Evolution

Architecture lead wants to analyze changes over time.

Steps:

1. Open timeline view
2. Inspect decision clusters
3. Identify major architecture shifts

---

### Decision Reuse

Engineer asks:

"Did we already evaluate Redis vs Kafka?"

Search returns ADR discussing messaging system choice.

---

# 4. System Architecture

```
                     ┌───────────────┐
                     │ Git Repos     │
                     │ ADR Sources   │
                     └───────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ ADR Ingestion   │
                    │ Parser Engine   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Graph Builder   │
                    └────────┬────────┘
                             │
                             ▼
                     ┌───────────────┐
                     │ PostgreSQL    │
                     │ Graph Storage │
                     └───────┬───────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Backend API     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ React Frontend  │
                    │ Graph Explorer  │
                    └─────────────────┘
```

---

# 5. Technology Stack

## Frontend

React
TypeScript
TailwindCSS
React Query
React Flow (graph rendering)

Optional alternatives:

Cytoscape.js
Sigma.js
D3

---

## Backend

Recommended

Node.js + NestJS (TypeScript)

Advantages

• Shared types with React frontend (monorepo-friendly)
• Shared validation schemas across packages
• Parser logic reusable on client and server
• Strong async support

Alternative

FastAPI (Python) — if team prefers Python ecosystem

---

## Database

MVP / CLI mode

SQLite

Reasons:

• Zero infrastructure
• Ships embedded with the CLI
• Sufficient for 100–5,000 ADRs

Production / Server mode

PostgreSQL

Reasons:

• Mature
• Excellent indexing
• Full text search
• Scalable

Optional:

pgvector (semantic search)

---

# 6. Repository Structure

```
adr-atlas/

├─ atlas-cli/
│
├─ atlas-server/
│   ├─ api
│   ├─ services
│   ├─ models
│   ├─ graph
│   └─ ingestion
│
├─ atlas-ui/
│   ├─ components
│   ├─ pages
│   ├─ graph
│   └─ api
│
├─ atlas-parser/
│
├─ docs/
│
└─ examples/
```

---

# 7. ADR Format Support

ADR Atlas supports multiple ADR formats.

### MADR Example

```
# ADR-015: Use PostgreSQL

Date: 2025-05-01
Status: Accepted
Tags: database
Components: user-service

## Context

...

## Decision

...

## Consequences

...
```

---

# 8. ADR Metadata Extraction

Metadata sources

1. frontmatter
2. headers
3. inline references

Example frontmatter

```
---
status: accepted
date: 2025-01-10
tags: [messaging]
components: [order-service]
---
```

---

# 9. Data Model

## ADR Table

```
adr
id
title
status
date
authors
repository
file_path
summary
context
decision
consequences
created_at
updated_at
```

---

## Tags

```
tag
id
name
```

---

## ADR Tags

```
adr_tag
adr_id
tag_id
```

---

## Components

```
component
id
name
team
system
```

---

## ADR Components

```
adr_component
adr_id
component_id
```

---

## ADR Edges

```
adr_edge
id
source_adr_id
target_adr_id
type
```

Edge types

• supersedes (inverse `superseded_by` is derived at query time)
• relates_to
• depends_on
• conflicts_with

---

# 10. ADR Ingestion Pipeline

### Step 1

Scan repository

Typical directories

```
/adr
/docs/adr
/architecture/decisions
```

---

### Step 2

Parse markdown files

Extract

• title
• status
• date
• sections

---

### Step 3

Extract relationships

Example

```
Supersedes ADR-004
Relates to ADR-009
```

---

### Step 4

Conflict detection and deduplication

Handle edge cases:

• Same ADR found in multiple repositories
• Multiple ADRs claiming to supersede the same target
• Duplicate ADR identifiers across sources

Strategy:

• Use `(repository, file_path)` as the unique identity
• Flag conflicts for manual review
• Log warnings for ambiguous relationships

---

### Step 5

Build graph

Nodes

ADR documents

Edges

decision relationships

---

# 11. Backend API

Base URL

```
/api
```

---

## ADR Endpoints

### List ADRs

```
GET /adrs
```

Filters

status
tag
component
repository

---

### Get ADR

```
GET /adrs/{id}
```

---

### Search ADRs

```
GET /search?q=kafka
```

---

## Graph

```
GET /graph
```

Returns

nodes
edges

---

## Components

```
GET /components
GET /components/{name}/adrs
```

---

# 12. UI Wireframes

## ADR List

```
-------------------------------------------------
ID       Title                     Status
-------------------------------------------------
ADR-001  Use PostgreSQL            Accepted
ADR-002  Event Streaming           Accepted
ADR-003  Monolith → Microservices  Superseded
```

Filters

• status
• tags
• components
• date

---

## ADR Detail Page

```
Title
Status
Date
Tags

Context
Decision
Consequences

Related ADRs
Supersedes
Superseded by
```

---

## Graph View

Interactive network.

Capabilities

• zoom
• pan
• highlight dependencies
• expand node neighborhood

Node color by status.

---

## Timeline View

Chronological decision history.

Example

```
2021 | ADR-001
2022 | ADR-010
2023 | ADR-022
```

Capabilities

• Decision velocity chart (decisions per month/quarter)
• Cluster detection (bursts of related decisions indicating major initiatives)
• Quiet zone highlighting (periods with no decisions — potential gaps)
• Filter by component/tag to see per-system evolution
• Supersession chains rendered as connected arcs across the timeline

---

# 13. Graph Visualization

Node attributes

color = status
size = number of connections

---

Status colors

```
Accepted    → green
Proposed    → yellow
Superseded  → red
Deprecated  → gray
```

---

Edge types

```
supersedes
depends_on
relates_to
```

---

# 14. CLI Tool

Command

```
atlas
```

Examples

```
atlas scan ./repo
atlas ingest
atlas serve
atlas sync
```

---

# 15. Search

Two levels

### Full text search

Search across

context
decision
consequences

---

### Structured filters

status
tags
components
date range

---

### Future

Semantic search

Example

```
Why did we adopt Kafka?
```

---

# 16. Security

If deployed internally

Authentication

SSO
OIDC

Access control

viewer
admin

---

# 17. Deployment

Deployment options

Docker
Kubernetes
Internal platform

Example stack

```
Frontend: React
Backend: NestJS (TypeScript)
Database: SQLite (CLI) / PostgreSQL (server)
```

---

# 18. MVP Roadmap (6 Weeks)

### Week 1

Repository scanner
Markdown parser

---

### Week 2

Metadata extraction
Basic ADR database

---

### Week 3

Graph builder

---

### Week 4

Backend API

---

### Week 5

React UI
ADR list + detail page

---

### Week 6

Graph visualization

---

# 19. Future Features

Service catalog integration

Example

Map ADRs to services automatically.

---

Architecture overlays

Combine with system diagrams.

---

AI assistance

• summarize decisions
• suggest relationships
• detect duplicate ADRs

---

Governance

• stale ADR detection
• review reminders

---

# 20. Example README

```
# ADR Atlas

ADR Atlas is a visualization and exploration tool for Architecture Decision Records.

It converts ADR markdown documents into a navigable graph of architecture decisions.

## Features

• Interactive ADR graph
• Timeline of architecture evolution
• Full text search
• Repository ingestion
• Component mapping

ADR Atlas helps engineers understand the history and reasoning behind architectural decisions.
```

---

# 21. Success Metrics

Success indicators

• faster architecture discovery
• higher ADR reuse
• reduced duplicate decisions
• improved onboarding

---

# 22. License

Recommended

MIT License

or

Apache 2.0

---

# End of Document
