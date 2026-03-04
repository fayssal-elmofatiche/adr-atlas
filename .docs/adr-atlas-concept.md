# ADR Visualizer — Technical Specification

## 1. Overview

The **ADR Visualizer** is a tool for exploring, understanding, and navigating Architecture Decision Records (ADRs) through interactive visualizations and structured metadata. Instead of static document lists, it represents ADRs as a **graph of architectural decisions** and provides contextual navigation across systems, teams, and time.

The system ingests ADR documents (primarily Markdown) from repositories, extracts metadata, builds a decision graph, and exposes it via a modern interactive UI.

---

# 2. Goals

## Primary Goals

* Improve **discoverability of architectural decisions**
* Visualize **relationships between decisions**
* Enable **historical understanding of architecture evolution**
* Provide **structured search and filtering**
* Link decisions to **services, components, and repositories**

## Non-Goals (for MVP)

* Authoring ADRs
* Complex workflow management
* Editing ADR content
* Deep integration with incident or monitoring systems

---

# 3. Key Concepts

## Architecture Decision Record (ADR)

A document capturing a significant architectural decision including:

* Context
* Decision
* Consequences
* Alternatives considered
* Status

Example:

```
ADR-012: Use Kafka for event streaming
Status: Accepted
Date: 2024-01-14
Supersedes: ADR-004
Tags: messaging, events
Components: order-service, billing-service
```

---

## Decision Graph

A directed graph where:

Nodes:

* ADR documents

Edges:

* supersedes (inverse `superseded_by` is derived at query time)
* relates_to
* depends_on
* conflicts_with

---

## Decision Lifecycle

```
Proposed → Accepted → Deprecated → Superseded
```

Statuses:

* Proposed
* Accepted
* Rejected
* Deprecated
* Superseded

---

# 4. Supported ADR Formats

## Initial Target

Markdown-based ADRs including:

* adr-tools
* MADR
* custom markdown

Example structure:

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

# 5. System Architecture

```
                 ┌─────────────┐
                 │ Git Repos   │
                 │ ADR Sources │
                 └──────┬──────┘
                        │
                        │ Ingestion
                        ▼
                ┌───────────────┐
                │ ADR Parser    │
                │ Metadata      │
                │ Extractor     │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Graph Builder │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Database      │
                │ (Graph Data)  │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Backend API   │
                └──────┬────────┘
                       │
                       ▼
                ┌───────────────┐
                │ Frontend UI   │
                │ Visualization │
                └───────────────┘
```

---

# 6. Technology Stack (Suggested)

## Frontend

* React
* TypeScript
* Graph visualization:

  * Cytoscape.js
  * React Flow
  * Sigma.js

Supporting libraries:

* TailwindCSS
* Zustand or Redux
* TanStack Query

---

## Backend

Recommended:

* Node.js
* TypeScript
* NestJS

Advantages:

* Shared types with frontend (monorepo-friendly)
* Shared validation schemas across packages
* Parser logic reusable on client and server
* Strong async support

Alternative:

* Python / FastAPI (if team prefers Python ecosystem)

Responsibilities:

* ADR ingestion
* parsing
* metadata normalization
* graph building
* search API

---

## Database

MVP:

SQLite

Advantages:

* Zero infrastructure
* Ships embedded with the CLI
* Sufficient for 100–5,000 ADRs

Production / Server mode:

PostgreSQL

Tables:

* ADRs
* edges
* components
* tags

Optional enhancements:

* Postgres Full-Text Search
* pgvector for semantic search

Alternative:

* Neo4j (if prioritizing graph queries)

---

# 7. Data Model

## ADR Table

```
adr
----

id
title
status
date
authors
file_path
repository
summary
context
decision
consequences
created_at
updated_at
```

---

## Tag Table

```
tag
----

id
name
```

---

## ADR_Tag

```
adr_tag
--------

adr_id
tag_id
```

---

## Component Table

```
component
----------

id
name
system
team
```

---

## ADR_Component

```
adr_component
--------------

adr_id
component_id
```

---

## Edge Table

Represents relationships between ADRs.

```
adr_edge
---------

id
source_adr_id
target_adr_id
type
```

Edge types:

* supersedes (inverse `superseded_by` is derived at query time)
* relates_to
* depends_on
* conflicts_with

---

# 8. ADR Ingestion Pipeline

## Step 1: Repository Scan

Supported sources:

* GitHub
* GitLab
* local repository
* monorepo or multi-repo

Process:

```
scan_repo()
  locate ADR directories
  detect markdown files
```

Common paths:

```
/adr
/docs/adr
/architecture/decisions
```

---

## Step 2: Metadata Extraction

Metadata sources:

1. Frontmatter

```
---
status: accepted
date: 2025-01-10
tags: [messaging]
components: [order-service]
---
```

2. Header sections

3. Inline references

Example:

```
Supersedes: ADR-004
```

---

## Step 3: Content Parsing

Extract sections:

* context
* decision
* consequences
* alternatives

---

## Step 4: Relationship Detection

Methods:

Explicit references:

```
Supersedes ADR-002
Relates to ADR-009
```

Implicit references:

```
[ADR-003]
```

---

## Step 5: Conflict Detection and Deduplication

Handle edge cases during ingestion:

* Same ADR found in multiple repositories
* Multiple ADRs claiming to supersede the same target
* Duplicate ADR identifiers across sources

Strategy:

* Use `(repository, file_path)` as the unique identity
* Flag conflicts for manual review
* Log warnings for ambiguous relationships

---

## Step 6: Graph Construction

Create nodes:

```
ADR nodes
```

Create edges:

```
source → target
```

Example:

```
ADR-010 → ADR-005 (supersedes)
```

---

# 9. API Specification

Base URL:

```
/api
```

---

## ADR Endpoints

### Get ADR list

```
GET /adrs
```

Query params:

```
status
tag
component
repository
date_range
```

---

### Get ADR by ID

```
GET /adrs/{id}
```

Returns:

```
metadata
sections
relationships
```

---

### Search ADRs

```
GET /search?q=event%20streaming
```

---

## Graph Endpoints

### Full graph

```
GET /graph
```

Returns:

```
nodes
edges
```

---

### Filtered graph

```
GET /graph?status=accepted&tag=messaging
```

---

## Component Endpoints

```
GET /components
GET /components/{name}/adrs
```

---

# 10. Frontend Features

## Views

### ADR List View

Purpose:

Quick scanning.

Features:

* filters
* sorting
* status indicators

Columns:

* ID
* Title
* Status
* Date
* Tags
* Components

---

### ADR Detail View

Shows:

* metadata
* rendered markdown
* inbound/outbound relationships

Additional features:

* related ADRs
* backlinks
* supersession chain

---

### Graph View

Interactive visualization.

Nodes:

ADR documents.

Edges:

Decision relationships.

Capabilities:

* zoom/pan
* expand neighborhood
* highlight dependencies
* collapse clusters

Filters:

* status
* tags
* component
* repository
* date range

---

### Timeline View

Displays decisions across time.

Useful for:

* architecture evolution
* decision churn
* major shifts

Capabilities:

* Decision velocity chart (decisions per month/quarter)
* Cluster detection (bursts of related decisions indicating major initiatives)
* Quiet zone highlighting (periods with no decisions — potential gaps)
* Filter by component/tag to see per-system evolution
* Supersession chains rendered as connected arcs across the timeline

---

# 11. Visualization Design

Node attributes:

```
color = status
size = number_of_connections
label = ADR title
```

Edge attributes:

```
type
direction
weight
```

Legend example:

```
Accepted → green
Proposed → yellow
Deprecated → grey
Superseded → red
```

---

# 12. Search Capabilities

Types:

## Full Text Search

Across:

* context
* decision
* consequences

---

## Structured Search

Filters:

```
status
tags
components
teams
date range
```

---

## Semantic Search (Future)

Embedding based search:

```
"Why did we adopt Kafka?"
```

Returns ADRs explaining the decision.

---

# 13. Repository Integration

Supported providers:

* GitHub
* GitLab
* Bitbucket

Sync methods:

* webhook
* scheduled scan
* CI pipeline job

---

# 14. MVP Feature Set

Version 1 should include:

### Ingestion

* Git repository scanning
* markdown parsing
* metadata extraction

### Storage

* PostgreSQL schema
* ADR nodes
* relationship edges

### API

* ADR list
* ADR detail
* graph endpoint
* search

### UI

* ADR list
* ADR detail
* interactive graph
* filtering

---

# 15. Future Enhancements

## Code Integration

Map ADRs to:

* repositories
* services
* packages

---

## Architecture Overlay

Combine with:

* service catalog
* system maps
* domain boundaries

---

## Governance

Features:

* stale ADR detection
* review reminders
* approval workflows

---

## AI Assistance

Capabilities:

* summarize decisions
* suggest missing relationships
* detect duplicate decisions

---

# 16. Performance Considerations

Potential scale:

```
100 – 5000 ADRs
```

Optimizations:

* graph pagination
* server-side filtering
* indexed search

---

# 17. Security

If deployed internally:

* SSO authentication
* repo access via service account
* role-based access (viewer/admin)

---

# 18. Deployment

Deployment options:

* Docker
* Kubernetes
* internal developer portal plugin

Example stack:

```
frontend: React SPA
backend: NestJS (TypeScript)
database: SQLite (CLI) / PostgreSQL (server)
```

---

# 19. Example User Flow

Engineer investigating architecture:

1. Opens graph view
2. Filters for `order-service`
3. Sees decision chain
4. Clicks ADR-021
5. Reads decision and consequences
6. Navigates to superseding ADR

Total time: seconds instead of hours.

---

# 20. Success Metrics

Measure effectiveness via:

* ADR discovery time
* number of ADR cross-links
* search usage
* decision reuse

---

# End of Specification
