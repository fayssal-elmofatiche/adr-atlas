---
title: Use JWT for Service Authentication
status: accepted
date: 2024-03-15
tags: [security, authentication, api]
components: [api-gateway, user-service]
authors: [David Kim, Alice Chen]
---

## Context

We need a stateless authentication mechanism that works across our microservices. Session-based authentication requires sticky sessions or a shared session store, adding complexity. Services need to verify user identity without calling back to the auth service on every request.

## Decision

We will use JSON Web Tokens (JWT) for authentication.

- Short-lived access tokens (15 minutes) + refresh tokens (7 days)
- Access tokens contain user ID, roles, and permissions as claims
- Tokens signed with RS256 (asymmetric keys) so services can verify without shared secrets
- Refresh tokens stored in Redis with ability to revoke

Relates to ADR-4 (API Gateway validates JWTs at the edge).
Relates to ADR-3 (Redis stores refresh tokens and revocation list).

## Consequences

- **Good:** Stateless verification reduces inter-service calls
- **Good:** Standard format with broad library support
- **Good:** Claims-based authorization is flexible and extensible
- **Neutral:** Token size is larger than opaque session IDs (~1KB vs ~32 bytes)
- **Bad:** Cannot revoke individual access tokens before expiry (mitigated by short TTL)
- **Bad:** Key rotation requires coordinated deployment
