---
title: Use Redis for Caching
status: accepted
date: 2024-04-10
tags: [caching, performance, infrastructure]
components: [order-service, user-service, api-gateway]
supersedes: ADR-002
relates-to: [ADR-001, ADR-004]
---

## Context

Our services are experiencing high latency on frequently accessed data. We need a caching layer to reduce database load and improve response times.

## Decision

We will use Redis as our distributed caching solution. It will sit between the application layer and PostgreSQL.

## Consequences

Response times for cached data will drop significantly. We need to implement cache invalidation strategies and handle cache misses gracefully.
