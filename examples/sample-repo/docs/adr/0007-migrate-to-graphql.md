---
title: Migrate Public API to GraphQL
status: proposed
date: 2024-05-15
tags: [api, frontend, developer-experience]
components: [api-gateway, user-service, order-service]
authors: [Frank Garcia]
---

## Context

Our REST API is showing limitations as the frontend grows more complex:

- Mobile clients over-fetch data on list views (receiving full objects when only summaries are needed)
- Composing data from multiple services requires multiple round-trips
- API versioning is becoming a maintenance burden with 3 active versions
- Frontend team spends significant time writing data-fetching boilerplate

Relates to ADR-4 (GraphQL would be served through the API Gateway).

## Decision

We will introduce a GraphQL layer for public-facing APIs while keeping internal service-to-service communication as REST/gRPC.

- Apollo Server as the GraphQL runtime
- Schema-first design with code generation for type safety
- DataLoader pattern to prevent N+1 query problems
- Persisted queries in production for security and performance
- REST endpoints remain available during transition period

## Consequences

- **Good:** Clients request exactly the data they need, reducing payload size by ~40%
- **Good:** Single request for composed views eliminates waterfall fetching
- **Good:** Strong typing and introspection improve developer experience
- **Neutral:** Learning curve for team members unfamiliar with GraphQL
- **Bad:** Caching is more complex than REST (no HTTP caching by default)
- **Bad:** Query complexity analysis needed to prevent expensive queries
