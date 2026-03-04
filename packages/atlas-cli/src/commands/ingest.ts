import { basename } from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { ingestRepository } from "@atlas/parser";
import { resolvePath } from "../resolve-path.js";
import { paths, ensureAtlasDirs } from "../paths.js";
import { isGitUrl, cloneOrPull } from "../git.js";
import { startWatchLoop } from "../watch.js";

export const ingestCommand = new Command("ingest")
  .description("Ingest ADRs from a git repository or local directory")
  .argument("<source>", "git URL (https/ssh) or local directory path")
  .option("-d, --db <path>", "SQLite database file path", paths.db)
  .option("-r, --repo <name>", "repository identifier (auto-derived if omitted)")
  .option("--paths <dirs...>", "subdirectories to scan within the source")
  .option("-w, --watch", "watch for changes and re-ingest automatically")
  .option("-i, --interval <seconds>", "polling interval in seconds for watch mode", "300")
  .action(async (source: string, opts) => {
    try {
      ensureAtlasDirs();

      let basePath: string;
      let repository: string;
      let isGit = false;

      if (isGitUrl(source)) {
        isGit = true;
        console.log(chalk.blue(`Cloning ${source}...`));
        const result = await cloneOrPull(source);
        basePath = result.localPath;
        repository = opts.repo ?? result.slug;

        if (result.changed) {
          console.log(chalk.green(`Repository ready at ${result.localPath}`));
        } else {
          console.log(chalk.gray("Repository already up to date."));
        }
      } else {
        basePath = resolvePath(source);
        repository = opts.repo ?? basename(basePath);
      }

      const dbPath = resolvePath(opts.db);
      const scanPaths: string[] = opts.paths ?? [];

      console.log(chalk.blue("Ingesting ADRs..."));

      const result = await ingestRepository({
        paths: scanPaths,
        basePath,
        repository,
        dbPath,
      });

      console.log(chalk.green(`\nIngestion complete:`));
      console.log(`  ADRs:     ${result.adrCount}`);
      console.log(`  Edges:    ${result.edgeCount}`);
      console.log(`  Database: ${chalk.gray(dbPath)}`);

      if (result.warnings.length > 0) {
        console.log(chalk.yellow(`\n  Warnings: ${result.warnings.length}`));
        for (const w of result.warnings) {
          console.log(`    - [${w.type}] ${w.message}`);
        }
      }

      if (opts.watch) {
        if (!isGit) {
          console.error(chalk.red("\n--watch requires a git URL as source."));
          process.exit(1);
        }

        console.log();
        await startWatchLoop({
          localPath: basePath,
          repository,
          dbPath,
          scanPaths,
          intervalSeconds: parseInt(opts.interval, 10),
        });
      }
    } catch (err) {
      console.error(chalk.red(`Ingestion failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });
