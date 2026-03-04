import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import chalk from "chalk";
import express from "express";
import { resolvePath } from "../resolve-path.js";
import { paths } from "../paths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findUiDist(): string | null {
  // When running from dist/commands/ (production build)
  const fromDist = join(__dirname, "..", "ui");
  if (existsSync(join(fromDist, "index.html"))) return fromDist;

  // When running from src/commands/ via tsx (development)
  const fromSrc = join(__dirname, "..", "..", "dist", "ui");
  if (existsSync(join(fromSrc, "index.html"))) return fromSrc;

  return null;
}

export const serveCommand = new Command("serve")
  .description("Start the Atlas API server with web UI")
  .option("-p, --port <port>", "port to listen on", "3000")
  .option("-d, --db <path>", "SQLite database file path", paths.db)
  .option("--api-only", "serve only the API without the web UI")
  .action(async (opts) => {
    const dbPath = resolvePath(opts.db);
    process.env.DATABASE_PATH = dbPath;

    try {
      const { createApp } = await import("@atlas/server/app");
      const port = parseInt(opts.port, 10);
      const app = createApp();

      const uiDist = opts.apiOnly ? null : findUiDist();

      if (uiDist) {
        app.use(express.static(uiDist));

        // SPA fallback: serve index.html for non-API routes (Express 5 requires named wildcard)
        app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
          if (req.method !== "GET" || req.path.startsWith("/api")) return next();
          res.sendFile(join(uiDist, "index.html"));
        });
      }

      app.listen(port, () => {
        console.log(chalk.green(`Atlas server listening on http://localhost:${port}`));
        console.log(chalk.gray(`Database: ${dbPath}`));
        if (uiDist) {
          console.log(chalk.gray(`UI: http://localhost:${port}`));
        } else if (!opts.apiOnly) {
          console.log(chalk.gray("UI not found (run 'pnpm build' to include the web UI)"));
        }
        console.log(chalk.gray("Press Ctrl+C to stop"));
      });
    } catch (err) {
      console.error(chalk.red(`Server failed to start: ${(err as Error).message}`));
      process.exit(1);
    }
  });
