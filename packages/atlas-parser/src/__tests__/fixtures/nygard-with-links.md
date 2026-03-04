# 4. Use Kafka for event streaming

Date: 2024-03-20

## Status

Accepted

Supersedes [3. Use RabbitMQ](0003-use-rabbitmq.md)

## Context

Our event-driven architecture needs a scalable message broker that supports high-throughput event streaming and replay capabilities. The previous decision to use RabbitMQ [ADR-003] does not meet our throughput requirements.

## Decision

We will use Apache Kafka as our event streaming platform. This depends on ADR-001 for the underlying data persistence requirements.

## Consequences

We get high throughput, message replay, and partitioning. However, Kafka has higher operational complexity than RabbitMQ.
