import { Command } from "commander";
import chalk from "chalk";
import { createMigratedDb, getAdrById } from "@atlas/parser/db";

export const showCommand = new Command("show")
  .description("Display detailed information about an ADR")
  .argument("<id>", "ADR ID")
  .option("-d, --db <path>", "SQLite database file path", "atlas.db")
  .action(async (idStr: string, opts) => {
    try {
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        console.error(chalk.red("Invalid ADR ID"));
        process.exit(1);
      }

      const db = await createMigratedDb(opts.db);
      const adr = await getAdrById(db, id);

      if (!adr) {
        console.error(chalk.red(`ADR #${id} not found`));
        process.exit(1);
      }

      console.log(chalk.bold.cyan(`# ${adr.title}`));
      console.log();
      console.log(`  Status:     ${colorStatus(adr.status)}`);
      console.log(`  Date:       ${adr.date ?? "—"}`);
      console.log(`  Authors:    ${adr.authors.join(", ") || "—"}`);
      console.log(`  Tags:       ${adr.tags.join(", ") || "—"}`);
      console.log(`  Components: ${adr.components.join(", ") || "—"}`);
      console.log(`  File:       ${chalk.gray(adr.filePath)}`);

      if (adr.relationships.length > 0) {
        console.log();
        console.log(chalk.bold("  Relationships:"));
        for (const rel of adr.relationships) {
          console.log(`    ${rel.type.replace(/_/g, " ")} → ${rel.adrTitle} (#${rel.adrId})`);
        }
      }

      if (adr.context) {
        console.log();
        console.log(chalk.bold("  ## Context"));
        console.log(indent(adr.context));
      }
      if (adr.decision) {
        console.log();
        console.log(chalk.bold("  ## Decision"));
        console.log(indent(adr.decision));
      }
      if (adr.consequences) {
        console.log();
        console.log(chalk.bold("  ## Consequences"));
        console.log(indent(adr.consequences));
      }
    } catch (err) {
      console.error(chalk.red(`Show failed: ${(err as Error).message}`));
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

function indent(text: string): string {
  return text.split("\n").map((l) => `  ${l}`).join("\n");
}
