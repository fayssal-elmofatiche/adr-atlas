import { Command } from "commander";
import chalk from "chalk";
import { ingestRepository } from "@atlas/parser";
import { resolvePath } from "../resolve-path.js";

export const ingestCommand = new Command("ingest")
  .description("Scan, parse, and persist ADRs to the database")
  .argument("[paths...]", "directories to scan (defaults to standard ADR paths)")
  .option("-b, --base-path <path>", "base path to resolve directories against", ".")
  .option("-r, --repo <name>", "repository identifier", "default")
  .option("-d, --db <path>", "SQLite database file path", "atlas.db")
  .action(async (paths: string[], opts) => {
    try {
      console.log(chalk.blue("Ingesting ADRs..."));

      const result = await ingestRepository({
        paths: Array.isArray(paths) ? paths : [],
        basePath: resolvePath(opts.basePath),
        repository: opts.repo,
        dbPath: resolvePath(opts.db),
      });

      console.log(chalk.green(`\nIngestion complete:`));
      console.log(`  ADRs:     ${result.adrCount}`);
      console.log(`  Edges:    ${result.edgeCount}`);

      if (result.warnings.length > 0) {
        console.log(chalk.yellow(`\n  Warnings: ${result.warnings.length}`));
        for (const w of result.warnings) {
          console.log(`    - [${w.type}] ${w.message}`);
        }
      }
    } catch (err) {
      console.error(chalk.red(`Ingestion failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });
