---
title: Use MongoDB for Analytics Data
status: rejected
date: 2024-05-01
tags: [database, analytics, storage]
components: [analytics-service]
authors: [Bob Martinez]
conflicts_with: ADR-1
---

## Context

The analytics team needs to store high-volume event data with flexible schemas. Events have varying structures depending on the source (web, mobile, IoT). They proposed using MongoDB for its schema flexibility and horizontal scaling.

## Decision

**Rejected.** After evaluation, we decided against MongoDB for analytics:

- Our analytics queries are primarily aggregations over time windows, which PostgreSQL handles well with TimescaleDB extension
- Adding MongoDB would introduce a second database technology with separate operational knowledge
- PostgreSQL's JSONB columns provide sufficient schema flexibility for varying event structures
- TimescaleDB's compression and continuous aggregates better fit our query patterns

We will instead use PostgreSQL + TimescaleDB extension (extending ADR-1).

## Consequences

- **Good:** Single database technology to operate and maintain
- **Good:** Team doesn't need to learn a new database paradigm
- **Good:** TimescaleDB's time-series optimizations outperform MongoDB for our aggregation queries
- **Neutral:** Schema flexibility is slightly more constrained than MongoDB
- **Bad:** Horizontal write scaling is more limited than MongoDB's sharding
