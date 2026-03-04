---
title: Use PostgreSQL as Primary Database
status: accepted
date: 2024-01-15
tags: [database, storage, infrastructure]
components: [user-service, order-service]
authors: [Alice Chen]
---

## Context

We need a reliable, scalable relational database for our core services. The application requires ACID transactions, complex queries across related entities, and strong data consistency guarantees. Our team has significant experience with SQL databases.

## Decision

We will use PostgreSQL as our primary relational database.

Key factors:
- Mature ecosystem with excellent tooling
- Native JSON/JSONB support for semi-structured data
- Strong community and long-term support
- Proven scalability with read replicas and partitioning
- Rich extension ecosystem (PostGIS, pg_trgm, etc.)

## Consequences

- **Good:** Battle-tested reliability, excellent query optimizer, rich data types
- **Good:** Strong ecosystem of ORMs, migration tools, and monitoring solutions
- **Neutral:** Team needs to manage connection pooling (PgBouncer)
- **Bad:** Vertical scaling has limits; may need sharding strategy for very large datasets
