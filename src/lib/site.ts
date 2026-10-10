export const REPO_URL = "https://github.com/owenzhang04/whatweface";
export const NEW_ISSUE_URL = `${REPO_URL}/issues/new`;

/** A file in the repo on GitHub, e.g. repoFile("docs/PLAN.md"). */
export function repoFile(path: string): string {
  return `${REPO_URL}/blob/main/${path}`;
}
