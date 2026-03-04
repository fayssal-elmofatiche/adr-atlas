import { Command } from "commander";
import chalk from "chalk";
import { createMigratedDb, getGraph } from "@atlas/parser/db";

export const graphCommand = new Command("graph")
  .description("Display a summary of the ADR graph")
  .option("-d, --db <path>", "SQLite database file path", "atlas.db")
  .option("-s, --status <status>", "filter by status")
  .action(async (opts) => {
    try {
      const db = await createMigratedDb(opts.db);

      const filters = opts.status ? { status: opts.status } : undefined;
      const graph = await getGraph(db, filters);

      console.log(chalk.bold.cyan("ADR Graph Summary\n"));
      console.log(`  Nodes: ${graph.nodes.length}`);
      console.log(`  Edges: ${graph.edges.length}`);

      if (graph.edges.length > 0) {
        const typeCounts = new Map<string, number>();
        for (const e of graph.edges) {
          typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
        }

        console.log();
        console.log(chalk.bold("  Edge types:"));
        for (const [type, count] of typeCounts) {
          console.log(`    ${type.replace(/_/g, " ")}: ${count}`);
        }
      }

      if (graph.nodes.length > 0) {
        const statusCounts = new Map<string, number>();
        for (const n of graph.nodes) {
          statusCounts.set(n.status, (statusCounts.get(n.status) ?? 0) + 1);
        }

        console.log();
        console.log(chalk.bold("  Status breakdown:"));
        for (const [status, count] of statusCounts) {
          console.log(`    ${colorStatus(status)}: ${count}`);
        }

        const mostConnected = [...graph.nodes].sort((a, b) => b.connectionCount - a.connectionCount).slice(0, 5);
        if (mostConnected.some((n) => n.connectionCount > 0)) {
          console.log();
          console.log(chalk.bold("  Most connected:"));
          for (const n of mostConnected) {
            if (n.connectionCount === 0) break;
            console.log(`    ${n.title} (${n.connectionCount} connections)`);
          }
        }
      }
    } catch (err) {
      console.error(chalk.red(`Graph failed: ${(err as Error).message}`));
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
