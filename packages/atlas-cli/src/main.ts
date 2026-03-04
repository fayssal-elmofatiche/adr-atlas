#!/usr/bin/env node
import { program } from "commander";
import { scanCommand } from "./commands/scan.js";
import { ingestCommand } from "./commands/ingest.js";
import { listCommand } from "./commands/list.js";
import { showCommand } from "./commands/show.js";
import { graphCommand } from "./commands/graph.js";
import { serveCommand } from "./commands/serve.js";

program
  .name("atlas")
  .description("ADR Atlas — Architecture Decision Record knowledge graph")
  .version("0.1.0");

program.addCommand(scanCommand);
program.addCommand(ingestCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(graphCommand);
program.addCommand(serveCommand);

program.parse();
