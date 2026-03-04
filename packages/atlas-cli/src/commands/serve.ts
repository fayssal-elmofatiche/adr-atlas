import { Command } from "commander";
import chalk from "chalk";

export const serveCommand = new Command("serve")
  .description("Start the Atlas API server")
  .option("-p, --port <port>", "port to listen on", "3000")
  .option("-d, --db <path>", "SQLite database file path", "atlas.db")
  .action(async (opts) => {
    process.env.PORT = opts.port;
    process.env.DATABASE_PATH = opts.db;

    try {
      // Dynamic import to avoid loading express unless needed
      const { createApp } = await import("@atlas/server/app");
      const port = parseInt(opts.port, 10);
      const app = createApp();

      app.listen(port, () => {
        console.log(chalk.green(`Atlas server listening on http://localhost:${port}`));
        console.log(chalk.gray(`Database: ${opts.db}`));
        console.log(chalk.gray("Press Ctrl+C to stop"));
      });
    } catch (err) {
      console.error(chalk.red(`Server failed to start: ${(err as Error).message}`));
      process.exit(1);
    }
  });
