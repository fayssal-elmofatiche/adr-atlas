import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { createMigratedDb, getAdrs } from "@atlas/parser/db";
import { resolvePath } from "../resolve-path.js";

export const listCommand = new Command("list")
  .description("List ADRs from the database")
  .option("-d, --db <path>", "SQLite database file path", "atlas.db")
  .option("-s, --status <status>", "filter by status")
  .option("-t, --tag <tag>", "filter by tag")
  .option("-c, --component <name>", "filter by component")
  .action(async (opts) => {
    try {
      const db = await createMigratedDb(resolvePath(opts.db));

      const filters: Record<string, string> = {};
      if (opts.status) filters.status = opts.status;
      if (opts.tag) filters.tag = opts.tag;
      if (opts.component) filters.component = opts.component;

      const adrs = await getAdrs(db, Object.keys(filters).length > 0 ? filters : undefined);

      if (adrs.length === 0) {
        console.log(chalk.yellow("No ADRs found."));
        return;
      }

      const table = new Table({
        head: ["ID", "Title", "Status", "Date", "Tags"].map((h) => chalk.bold(h)),
        style: { head: [] },
      });

      for (const adr of adrs) {
        table.push([
          adr.id,
          adr.title,
          colorStatus(adr.status),
          adr.date ?? "—",
          adr.tags.join(", ") || "—",
        ]);
      }

      console.log(table.toString());
      console.log(chalk.gray(`\n${adrs.length} ADR(s)`));
    } catch (err) {
      console.error(chalk.red(`List failed: ${(err as Error).message}`));
      process.exit(1);
    }
  });

function colorStatus(status: string): string {
  switch (status) {
    case "accepted": return chalk.green(status);
    case "proposed": return chalk.yellow(status);
    case "rejected": return chalk.red(status);
    case "deprecated": return chalk.gray(status);
    case "superseded": return chalk.magenta(status);
    default: return status;
  }
}
