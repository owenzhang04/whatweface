/**
 * Fails when a problem page types a number into prose instead of using a stat
 * (CONTENT_STANDARDS rule 1). Run with `pnpm lint:content`; part of `pnpm check`.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { lintProse } from "../src/lib/prose-lint.ts";

const PROBLEMS_DIR = "src/content/problems";

const files = (await readdir(PROBLEMS_DIR, { recursive: true }))
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => join(PROBLEMS_DIR, f))
  .sort();

if (files.length === 0) {
  console.error(`lint-content: no .mdx files found in ${PROBLEMS_DIR}`);
  process.exit(1);
}

let count = 0;
for (const file of files) {
  for (const f of lintProse(await readFile(file, "utf8"))) {
    count++;
    console.error(`${file}:${f.line}:${f.column}  "${f.token}"  ${f.message}`);
  }
}

if (count > 0) {
  console.error(`\nlint-content: ${count} number(s) in prose across ${files.length} page(s).`);
  console.error(
    "If a match is a name, not a quantity (e.g. PM2.5), add it to ALLOWED_NAMES in src/lib/prose-lint.ts.",
  );
  process.exit(1);
}
console.log(`lint-content: ${files.length} page(s), no numbers in prose.`);
