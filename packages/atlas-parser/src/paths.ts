import { join } from "node:path";
import { homedir } from "node:os";
import { mkdirSync } from "node:fs";

const ATLAS_HOME = process.env.ATLAS_HOME ?? join(homedir(), ".atlas");

export const paths = {
  home: ATLAS_HOME,
  repos: join(ATLAS_HOME, "repos"),
  db: join(ATLAS_HOME, "atlas.db"),
} as const;

export function ensureAtlasDirs(): void {
  mkdirSync(paths.repos, { recursive: true });
}
