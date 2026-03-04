---
title: Replace Mocha with Vitest for Testing
status: accepted
date: 2024-04-20
tags: [testing, developer-experience, tooling]
components: [user-service, order-service, notification-service, inventory-service]
authors: [Carol Davis]
---

## Context

Our test suite using Mocha + Chai + Sinon has grown to 2,000+ tests and takes over 8 minutes to run. Key pain points:

- No native TypeScript support (requires ts-node with slow startup)
- No built-in code coverage (separate nyc/istanbul config)
- Mocking requires Sinon with verbose setup
- No watch mode that works reliably with ESM
- Configuration spread across .mocharc, .nycrc, and test setup files

## Decision

We will migrate from Mocha to Vitest:

- Native ESM and TypeScript support with no configuration
- Built-in coverage via v8/istanbul
- Jest-compatible API (expect, describe, it) minimizes migration effort
- Built-in mocking with vi.fn(), vi.mock()
- Vite-powered transformation for fast startup

## Consequences

- **Good:** Test startup time reduced from 45s to 3s
- **Good:** Full test suite runs in under 2 minutes (4x improvement)
- **Good:** Single configuration file replaces three
- **Good:** Native watch mode with HMR-like speed
- **Neutral:** Migration effort estimated at 2-3 days for the full suite
- **Bad:** Less mature ecosystem compared to Jest/Mocha
