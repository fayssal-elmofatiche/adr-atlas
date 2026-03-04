import chalk from "chalk";
import { pullAndDetectChanges } from "./git.js";
import { ingestRepository } from "@atlas/parser";

export interface WatchOptions {
  localPath: string;
  repository: string;
  dbPath: string;
  scanPaths: string[];
  intervalSeconds: number;
}

/**
 * Starts a polling loop that pulls from git and re-ingests on changes.
 * Returns a cleanup function. Blocks until SIGINT/SIGTERM.
 */
export async function startWatchLoop(opts: WatchOptions): Promise<void> {
  const { localPath, repository, dbPath, scanPaths, intervalSeconds } = opts;
  let polling = false;

  function timestamp(): string {
    return new Date().toLocaleTimeString();
  }

  async function poll() {
    if (polling) return;
    polling = true;

    try {
      const changed = await pullAndDetectChanges(localPath);

      if (changed) {
        console.log(chalk.blue(`[${timestamp()}] Changes detected, re-ingesting...`));
        const result = await ingestRepository({
          paths: scanPaths,
          basePath: localPath,
          repository,
          dbPath,
        });
        console.log(chalk.green(`[${timestamp()}] Ingested ${result.adrCount} ADRs, ${result.edgeCount} edges`));
      } else {
        console.log(chalk.gray(`[${timestamp()}] No changes`));
      }
    } catch (err) {
      console.error(chalk.red(`[${timestamp()}] Poll error: ${(err as Error).message}`));
    } finally {
      polling = false;
    }
  }

  console.log(chalk.blue(`Watching for changes every ${intervalSeconds}s. Press Ctrl+C to stop.\n`));

  const timer = setInterval(poll, intervalSeconds * 1000);

  await new Promise<void>((resolve) => {
    function shutdown() {
      clearInterval(timer);
      console.log(chalk.gray("\nWatch stopped."));
      resolve();
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  });
}
