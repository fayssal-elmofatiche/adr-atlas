---
status: accepted
date: 2024-06-01
decision-makers: ["Alice", "Bob", "Charlie"]
---

# Use React for Frontend Framework

## Context and Problem Statement

We need to choose a frontend framework for our new customer portal. The framework should have strong community support, good TypeScript integration, and be suitable for building complex SPAs.

## Decision Drivers

* Developer experience and productivity
* Ecosystem maturity and library availability
* TypeScript support
* Performance characteristics
* Hiring pool

## Considered Options

* React
* Vue.js
* Angular
* Svelte

## Decision Outcome

Chosen option: "React" because it has the largest ecosystem, best TypeScript support, and the widest hiring pool. Our team already has React experience.

### Consequences

React's virtual DOM approach provides good performance for our use case. We will use Next.js for server-side rendering where needed. The large ecosystem means we can leverage existing libraries rather than building custom solutions.

## Pros and Cons of the Options

### React

* Good, because largest ecosystem
* Good, because excellent TypeScript support
* Bad, because requires additional routing/state management choices

### Vue.js

* Good, because simpler learning curve
* Bad, because smaller ecosystem than React

### Angular

* Good, because batteries-included
* Bad, because steeper learning curve
* Bad, because heavier bundle size
