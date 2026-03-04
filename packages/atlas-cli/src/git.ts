export { isGitUrl, repoSlugFromUrl, pullAndDetectChanges } from "@atlas/parser";
export type { CloneOrPullResult } from "@atlas/parser";

import { cloneOrPull as _cloneOrPull, ensureAtlasDirs, paths } from "@atlas/parser";
import type { CloneOrPullResult } from "@atlas/parser";

/**
 * CLI wrapper for cloneOrPull that uses the default repos directory.
 */
export async function cloneOrPull(url: string): Promise<CloneOrPullResult> {
  ensureAtlasDirs();
  return _cloneOrPull(url, paths.repos);
}
