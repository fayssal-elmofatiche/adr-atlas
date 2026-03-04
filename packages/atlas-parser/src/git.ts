import { join } from "node:path";
import { existsSync } from "node:fs";
import { simpleGit } from "simple-git";

/**
 * Checks whether the input looks like a git URL (HTTPS, SSH, or git@ shorthand).
 */
export function isGitUrl(input: string): boolean {
  return (
    input.startsWith("https://") ||
    input.startsWith("http://") ||
    input.startsWith("ssh://") ||
    input.startsWith("git@") ||
    input.startsWith("git://")
  );
}

/**
 * Extracts a slug like "org/repo" from a git URL.
 * Handles HTTPS, SSH, and git@ shorthand formats.
 */
export function repoSlugFromUrl(url: string): string {
  let path = url;

  // Strip protocol
  path = path.replace(/^(https?|ssh|git):\/\//, "");

  // Handle git@ shorthand: git@github.com:org/repo → github.com/org/repo
  path = path.replace(/^git@([^:]+):/, "$1/");

  // Strip auth (user@)
  path = path.replace(/^[^@]+@/, "");

  // Strip host
  const slashIdx = path.indexOf("/");
  if (slashIdx !== -1) {
    path = path.slice(slashIdx + 1);
  }

  // Strip .git suffix
  path = path.replace(/\.git$/, "");

  // Strip trailing slashes
  path = path.replace(/\/+$/, "");

  return path;
}

export interface CloneOrPullResult {
  localPath: string;
  slug: string;
  changed: boolean;
}

/**
 * Clones a git repository if not already present, otherwise pulls latest changes.
 * Returns the local path and whether HEAD changed.
 */
export async function cloneOrPull(url: string, reposDir: string): Promise<CloneOrPullResult> {
  const slug = repoSlugFromUrl(url);
  const localPath = join(reposDir, slug);

  if (existsSync(join(localPath, ".git"))) {
    // Repository already cloned — pull and check for changes
    const git = simpleGit(localPath);
    const headBefore = await git.revparse(["HEAD"]);
    await git.pull();
    const headAfter = await git.revparse(["HEAD"]);

    return { localPath, slug, changed: headBefore !== headAfter };
  }

  // Fresh clone
  await simpleGit().clone(url, localPath);
  return { localPath, slug, changed: true };
}

/**
 * Pulls latest changes and returns whether HEAD changed.
 * Assumes the repository is already cloned.
 */
export async function pullAndDetectChanges(localPath: string): Promise<boolean> {
  const git = simpleGit(localPath);
  const headBefore = await git.revparse(["HEAD"]);
  await git.pull();
  const headAfter = await git.revparse(["HEAD"]);
  return headBefore !== headAfter;
}
