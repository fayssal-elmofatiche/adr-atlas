---
title: Adopt Event-Driven Architecture
status: accepted
date: 2024-02-01
tags: [architecture, messaging, scalability]
components: [order-service, notification-service, inventory-service]
authors: [Bob Martinez]
---

## Context

Our monolithic request-response patterns are creating tight coupling between services. The order placement flow currently makes synchronous calls to inventory, payment, and notification services, leading to cascading failures and high latency.

We need a way to decouple services while maintaining data consistency.

## Decision

We will adopt an event-driven architecture using Apache Kafka as our message broker.

- Services publish domain events (e.g., `OrderPlaced`, `PaymentProcessed`)
- Interested services subscribe to relevant event topics
- Use the outbox pattern for reliable event publishing
- Events are immutable and append-only

Depends on ADR-1 for the outbox pattern (PostgreSQL-backed transactional outbox).

## Consequences

- **Good:** Services are loosely coupled and can evolve independently
- **Good:** Natural audit trail through event log
- **Good:** Enables CQRS pattern for read-heavy workloads
- **Neutral:** Eventual consistency requires careful handling of race conditions
- **Bad:** Increased operational complexity (Kafka cluster management)
- **Bad:** Debugging distributed flows is harder than synchronous calls
