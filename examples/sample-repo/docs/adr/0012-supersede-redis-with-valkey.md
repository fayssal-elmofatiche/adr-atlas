---
title: Migrate from Redis to Valkey
status: accepted
date: 2024-07-01
tags: [caching, infrastructure, open-source]
components: [user-service, api-gateway]
authors: [Alice Chen]
supersedes: ADR-3
---

## Context

Following Redis Ltd's license change from BSD to dual SSPL/RSALv2 in March 2024, our legal team has flagged compliance concerns for our cloud deployment. The Linux Foundation forked Redis 7.2 as Valkey, maintaining the open-source BSD license.

We need to decide whether to accept the new Redis license, switch to Valkey, or explore alternatives.

## Decision

We will migrate from Redis to Valkey:

- Valkey 8.0 is API-compatible with Redis 7.2 (drop-in replacement)
- No application code changes required — only infrastructure config updates
- Migration path: deploy Valkey replicas alongside Redis, switch traffic, decommission Redis
- Use AWS ElastiCache Valkey (serverless) in production

## Consequences

- **Good:** Maintains open-source compliance with BSD license
- **Good:** Zero application code changes needed
- **Good:** Active community and Linux Foundation governance
- **Good:** AWS/GCP/Azure all offer managed Valkey
- **Neutral:** Need to update monitoring dashboards and runbooks
- **Bad:** Valkey and Redis will diverge over time, locking us into the Valkey ecosystem
