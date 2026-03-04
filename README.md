# ADR Atlas

ADR Atlas is a visual exploration tool for Architecture Decision Records. Instead of browsing static markdown files, it builds a knowledge graph of architecture decisions and lets you explore relationships, dependencies, and decision history.

## Features

- **Interactive graph visualization** — React Flow-powered graph with color-coded nodes by status, typed edge styles, and dagre auto-layout
- **ADR list with filters** — Filter by status, tag, or component
- **Full-text search** — Search across ADR titles, context, decisions, and consequences
- **ADR detail view** — Rendered markdown with relationship panel and metadata
- **Component mapping** — See which decisions affect which services
- **CLI tool** — Scan, ingest, query, and serve from the terminal
- **Multi-format parsing** — Supports adr-tools (Nygard), MADR, and generic frontmatter markdown

## Architecture

```text
packages/
  atlas-parser   — ADR parsing, graph building, database layer
  atlas-server   — Express 5 REST API
  atlas-ui       — React + Vite + TailwindCSS frontend
  atlas-cli      — Command-line interface
examples/
  sample-repo    — 12 sample ADRs for demo
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Ingest sample ADRs
pnpm --filter @atlas/cli dev -- ingest \
  --base-path "$(pwd)/examples/sample-repo" \
  --repo sample \
  --db atlas.db

# Start the API server
DATABASE_PATH=atlas.db pnpm --filter @atlas/server start:dev

# Start the UI (in a second terminal)
pnpm --filter @atlas/ui dev
```

Open [http://localhost:5173](http://localhost:5173) to explore.

## CLI

```bash
# Discover ADR files
atlas scan [paths...] --base-path <path>

# Full ingestion pipeline (scan → parse → graph → persist)
atlas ingest [paths...] --base-path <path> --repo <name> --db <file>

# Query the database
atlas list [--status accepted] [--tag messaging] [--component order-service]
atlas show <id>
atlas graph

# Start the API server
atlas serve [--port 3000] [--db atlas.db]
```

## API Endpoints

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| GET    | `/api/adrs`                    | List ADRs (query: `status`, `tag`, `component`)  |
| GET    | `/api/adrs/:id`                | ADR detail with relationships                    |
| GET    | `/api/adrs/search?q=`          | Full-text search                                 |
| GET    | `/api/graph`                   | Graph nodes and edges (filterable)               |
| GET    | `/api/components`              | List all components                              |
| GET    | `/api/components/:name/adrs`   | ADRs for a component                             |
| POST   | `/api/ingest`                  | Trigger ingestion pipeline                       |
| GET    | `/api/health`                  | Health check                                     |

## Supported ADR Formats

**adr-tools (Nygard)** — Title in H1, status/date as text between H1 and first H2

**MADR** — YAML frontmatter with `status`, `date`, `deciders`

**Generic frontmatter** — Any markdown with YAML frontmatter containing `title`, `status`, `tags`, `components`

### Relationship Detection

ADR Atlas detects relationships from:

- Explicit references: `Supersedes ADR-004`, `Depends on ADR-1`
- Implicit references: `[ADR-003]`, `See ADR-010`
- Frontmatter fields: `supersedes: ADR-4`, `conflicts_with: ADR-1`
- Compound references: `Relates to ADR-005 and ADR-010`

### Edge Types

| Type             | Description                        |
| ---------------- | ---------------------------------- |
| `supersedes`     | This ADR replaces a previous one   |
| `depends_on`     | This ADR requires another to hold  |
| `relates_to`     | General relationship               |
| `conflicts_with` | Contradictory decisions            |

Inverse relationships (`superseded_by`, `depended_on_by`) are derived at query time.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Language**: TypeScript (strict, ES2022, NodeNext)
- **Parser**: gray-matter + custom markdown processing
- **Database**: SQLite via libSQL + Drizzle ORM
- **Server**: Express 5
- **Frontend**: React 19, TailwindCSS v4, React Flow, TanStack Query
- **CLI**: Commander, chalk, cli-table3
- **Testing**: Vitest (72 tests)

## Development

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm typecheck        # TypeScript check all packages
```

## License

MIT
