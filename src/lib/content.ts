import { getCollection } from "astro:content";
import { assertContent, checkContent } from "./content-rules";

/**
 * Loads problems and sources and fails the build if any content rule is
 * broken. Every page that renders content goes through this.
 */
export async function getCheckedContent() {
  const [problems, sources] = await Promise.all([
    getCollection("problems"),
    getCollection("sources"),
  ]);
  assertContent(checkContent(problems, sources, new Date().getFullYear()));
  return { problems, sources };
}
