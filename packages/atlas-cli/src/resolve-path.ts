import { resolve } from "node:path";

/**
 * Resolves a path relative to the user's actual working directory.
 * pnpm --filter changes cwd to the package dir, but sets INIT_CWD
 * to the original directory. We prefer INIT_CWD when available.
 */
export function resolvePath(p: string): string {
  const base = process.env.INIT_CWD ?? process.cwd();
  return resolve(base, p);
}
