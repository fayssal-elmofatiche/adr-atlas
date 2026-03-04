---
title: Implement API Gateway Pattern
status: accepted
date: 2024-03-10
tags: [architecture, api, security]
components: [api-gateway]
authors: [David Kim]
---

## Context

As we decompose into microservices, clients face multiple challenges: different service URLs, inconsistent authentication, no rate limiting, and complex client-side service discovery. Mobile clients are particularly affected by the need to make multiple API calls to compose a single view.

## Decision

We will implement an API Gateway as the single entry point for all client requests.

Responsibilities:
- Request routing to appropriate backend services
- Authentication and authorization (JWT validation)
- Rate limiting and throttling
- Request/response transformation
- API versioning via URL path prefixes
- Circuit breaker for downstream service failures

We'll build this using Express.js with custom middleware rather than adopting a heavyweight gateway product.

Depends on ADR-3 (Redis for rate limiting state and session caching).

## Consequences

- **Good:** Single entry point simplifies client integration
- **Good:** Centralized cross-cutting concerns (auth, rate limiting, logging)
- **Good:** Backend services don't need to handle auth individually
- **Neutral:** Gateway becomes a critical path component requiring high availability
- **Bad:** Potential single point of failure if not properly scaled
- **Bad:** Adds latency to every request (typically 5-10ms)
