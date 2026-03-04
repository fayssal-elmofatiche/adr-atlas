# 1. Use PostgreSQL for persistence

Date: 2024-01-15

## Status

Accepted

## Context

We need a reliable, mature relational database for our core services. The system requires ACID transactions, complex queries, and strong data integrity guarantees.

## Decision

We will use PostgreSQL as our primary relational database.

## Consequences

We gain a mature ecosystem with excellent tooling, strong community support, and proven scalability. The team will need to learn PostgreSQL-specific features like JSONB and full-text search.
