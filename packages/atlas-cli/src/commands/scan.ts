import { Command } from "commander";
import chalk from "chalk";
import { scanForAdrs } from "@atlas/parser";

export const scanCommand = new Command("scan")
  .description("Discover ADR files in given directories")
  .argument("[paths...]", "directories to scan (defaults to standard ADR paths)")
  .option("-b, --base-path <path>", "base path to resolve directories against", process.cwd())
  .option("-r, --repo <name>", "repository identifier", "default")
  .action(async (paths: string[], opts) => {
    try {
      const results = await scanForAdrs({
        paths: paths.length > 0 ? paths : undefined,
        basePath: opts.basePath,
        repository: opts.repo,
      });

      if (results.length === 0) {
        console.log(chalk.yellow("No ADR files found."));
        return;
      }

      console.log(chalk.green(`Found ${results.length} ADR file(s):\n`));
      for (const r of results) {
        console.log(`  ${chalk.cyan(r.filePath)}`);
      }
    } catch (err) {
      console.error(chalk.red(`Scan failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });
