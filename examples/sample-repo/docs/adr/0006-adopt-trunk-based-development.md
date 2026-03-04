---
title: Adopt Trunk-Based Development
status: accepted
date: 2024-04-01
tags: [process, ci-cd, development]
components: []
authors: [Eve Foster]
---

## Context

Our current Git branching strategy (Gitflow) is causing long-lived feature branches, painful merges, and slow integration. Release branches often diverge significantly from main, and hotfixes require cherry-picking across multiple branches.

We need a simpler branching model that supports continuous delivery.

## Decision

We will adopt trunk-based development:

- All developers commit to `main` (trunk) at least daily
- Short-lived feature branches (max 2 days) merged via pull request
- Feature flags for incomplete features instead of long-lived branches
- Automated CI pipeline runs on every push to main
- Release candidates are tagged directly from main

## Consequences

- **Good:** Continuous integration catches issues early
- **Good:** Eliminates merge hell from long-lived branches
- **Good:** Simplifies release process (any green commit on main is deployable)
- **Neutral:** Requires investment in feature flag infrastructure
- **Neutral:** Team needs to learn to break work into small, incremental changes
- **Bad:** Incomplete features on main require discipline with feature flags
