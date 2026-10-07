import { getCollection } from "astro:content";
import { assertCitations, checkCitations } from "./citations";

/**
 * Loads problems and sources and fails the build if any citation rule is
 * broken. Every page that renders content goes through this.
 */
export async function getCheckedContent() {
  const [problems, sources] = await Promise.all([
    getCollection("problems"),
    getCollection("sources"),
  ]);
  assertCitations(checkCitations(problems, sources, new Date().getFullYear()));
  return { problems, sources };
}
