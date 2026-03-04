---
title: Use gRPC for Internal Service Communication
status: proposed
date: 2024-06-15
tags: [architecture, api, performance]
components: [user-service, order-service, inventory-service, notification-service]
authors: [Frank Garcia, Alice Chen]
---

## Context

Internal service-to-service communication currently uses REST over HTTP/1.1 with JSON serialization. As traffic grows, we're seeing:

- JSON serialization overhead adds 10-15ms per service hop
- No formal contract enforcement between services (breaking changes slip through)
- HTTP/1.1 head-of-line blocking under high concurrency
- Manual client SDK maintenance for each service

Relates to ADR-2 (gRPC would complement event-driven async communication with synchronous RPC where needed).

## Decision

We will adopt gRPC with Protocol Buffers for synchronous internal service communication:

- Proto3 as the IDL (Interface Definition Language)
- Shared proto definitions in a dedicated repository
- Generated clients and servers in TypeScript via ts-proto
- HTTP/2 for multiplexed connections
- Deadline propagation for cascading timeout control
- Keep REST/GraphQL for external-facing APIs

## Consequences

- **Good:** Binary serialization reduces payload size by ~70% vs JSON
- **Good:** Strongly typed contracts prevent accidental breaking changes
- **Good:** HTTP/2 multiplexing improves connection efficiency
- **Good:** Auto-generated clients eliminate manual SDK maintenance
- **Neutral:** Requires protobuf build step in CI pipeline
- **Bad:** Harder to debug than REST (binary protocol, not curl-friendly)
- **Bad:** Browser clients can't use gRPC directly (need gRPC-Web proxy)
