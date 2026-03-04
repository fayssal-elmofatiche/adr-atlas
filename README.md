# ADR Atlas

ADR Atlas is a visual exploration tool for Architecture Decision Records. Instead of browsing static markdown files, it builds a knowledge graph of architecture decisions and lets you explore relationships, dependencies, and decision history.

## Features

- **Interactive graph visualization** — React Flow-powered graph with color-coded nodes by status, typed edge styles, and dagre auto-layout
- **Git repo ingestion** — Point at any git repository URL and ingest ADRs automatically
- **Watch mode** — Auto-sync ADRs from git repositories on a polling interval
- **Unified serve** — Single command starts API + web UI on one port
- **ADR list with filters** — Filter by status, tag, or component
- **Full-text search** — Search across ADR titles, context, decisions, and consequences
- **CLI tool** — Scan, ingest, query, and serve from the terminal
- **Multi-format parsing** — Supports adr-tools (Nygard), MADR, and generic frontmatter markdown

## Quick Start

```bash
# Ingest ADRs from a git repository
npx @atlas/cli ingest https://github.com/your-org/your-repo

# Start the server (API + web UI)
npx @atlas/cli serve
```

Open [http://localhost:3000](http://localhost:3000) to explore your ADR graph.

### Watch Mode

Keep your ADR database in sync with a repository:

```bash
npx @atlas/cli ingest https://github.com/your-org/your-repo --watch
```

This polls for changes every 5 minutes (configurable with `--interval <seconds>`).

### Local Directory

You can also ingest ADRs from a local directory:

```bash
npx @atlas/cli ingest ./path/to/repo
npx @atlas/cli serve
```

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

## CLI

```bash
# Ingest from a git repo or local directory
atlas ingest <source> [--watch] [--interval <secs>] [--db <path>] [--repo <name>]

# Discover ADR files
atlas scan [paths...] --base-path <path>

# Query the database
atlas list [--status accepted] [--tag messaging] [--component order-service]
atlas show <id>
atlas graph

# Start the API server with web UI
atlas serve [--port 3000] [--db <path>] [--api-only]
```

All data is stored in `~/.atlas/atlas.db` by default. Cloned repositories are cached in `~/.atlas/repos/`.

## API Endpoints

| Method | Endpoint                     | Description                                     |
| ------ | ---------------------------- | ----------------------------------------------- |
| GET    | `/api/adrs`                  | List ADRs (query: `status`, `tag`, `component`) |
| GET    | `/api/adrs/:id`              | ADR detail with relationships                   |
| GET    | `/api/adrs/search?q=`        | Full-text search                                |
| GET    | `/api/graph`                 | Graph nodes and edges (filterable)              |
| GET    | `/api/components`            | List all components                             |
| GET    | `/api/components/:name/adrs` | ADRs for a component                            |
| POST   | `/api/ingest`                | Trigger ingestion pipeline                      |
| GET    | `/api/health`                | Health check                                    |

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
- **CLI**: Commander, chalk, cli-table3, simple-git
- **Testing**: Vitest (72 tests)

## Docker

```bash
# Build the image
docker build -t adr-atlas .

# Ingest from a git repo and start the server
docker run -p 3000:3000 -v atlas-data:/root/.atlas adr-atlas ingest https://github.com/your-org/your-repo
docker run -p 3000:3000 -v atlas-data:/root/.atlas adr-atlas serve

# Try with the bundled sample ADRs
docker run -p 3000:3000 adr-atlas ingest ./examples/sample-repo
docker run -p 3000:3000 adr-atlas serve
```

The `atlas-data` named volume persists the database and cloned repos across container runs.

## Development

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages (including UI → CLI embedding)
pnpm test             # Run all tests
pnpm typecheck        # TypeScript check all packages

# Dev mode with sample data
pnpm --filter @atlas/cli dev -- ingest ./examples/sample-repo
pnpm --filter @atlas/cli dev -- serve
```

## License

MIT
