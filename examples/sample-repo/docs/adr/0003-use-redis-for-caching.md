---
title: Use Redis for Application Caching
status: accepted
date: 2024-02-20
tags: [caching, performance, infrastructure]
components: [user-service, api-gateway]
authors: [Alice Chen, Carol Davis]
---

## Context

Database queries for frequently accessed data (user profiles, product catalog, session data) are causing high read latency under load. Our P99 response times exceed 500ms for key endpoints.

We need a caching layer to reduce database load and improve response times.

## Decision

We will use Redis as our distributed caching solution.

- Cache-aside pattern for most read-heavy queries
- Write-through cache for session management
- TTL-based expiration with staggered TTLs to prevent cache stampede
- Redis Sentinel for high availability

Relates to ADR-1 (caching reduces load on PostgreSQL).

## Consequences

- **Good:** P99 latency reduced to under 50ms for cached queries
- **Good:** Reduces PostgreSQL read load by ~60%
- **Good:** Versatile data structures (sorted sets for leaderboards, pub/sub for real-time)
- **Neutral:** Cache invalidation requires careful design per use case
- **Bad:** Additional infrastructure to operate and monitor
