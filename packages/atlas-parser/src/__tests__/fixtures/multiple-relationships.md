---
title: Migrate to Microservices
status: accepted
date: 2024-08-01
tags: [architecture, microservices]
components: [order-service, billing-service, user-service]
---

## Context

The monolith has become difficult to maintain and deploy. Teams are stepping on each other's toes.

## Decision

We will decompose the monolith into microservices along domain boundaries. This supersedes ADR-001 which established the monolith architecture. This depends on ADR-004 for the event streaming infrastructure. This relates to ADR-005 regarding the API gateway pattern. This conflicts with ADR-006 which proposed a modular monolith approach.

## Consequences

Teams gain deployment independence. We accept increased operational complexity.
