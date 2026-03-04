---
title: Deprecate REST API v1
status: deprecated
date: 2024-06-01
tags: [api, deprecation]
components: [api-gateway]
authors: [David Kim]
supersedes: ADR-4
---

## Context

REST API v1 has been running alongside v2 for 18 months. Analytics show:
- Only 3% of traffic still uses v1 endpoints
- v1 lacks rate limiting and proper error response format
- Maintaining two versions doubles the testing burden for API changes
- All active mobile app versions have migrated to v2

## Decision

We will deprecate REST API v1:

- Add `Deprecation` and `Sunset` headers to all v1 responses
- Set sunset date to 2024-09-01 (3 months notice)
- Notify remaining v1 consumers via email and developer portal
- After sunset, v1 endpoints return 410 Gone with migration guide URL
- Monitor v1 traffic weekly and reach out to remaining consumers

## Consequences

- **Good:** Reduces API surface area and maintenance burden
- **Good:** Frees up engineering time for v2 improvements and GraphQL migration
- **Good:** Cleaner codebase without legacy compatibility shims
- **Neutral:** Requires communication effort with external API consumers
- **Bad:** Risk of breaking unknown consumers who haven't migrated
