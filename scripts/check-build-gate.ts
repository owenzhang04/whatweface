/**
 * Proves the citation rules fail a real `astro build`, not just unit tests.
 * Each case copies the project to a temp directory, breaks one rule, builds,
 * and expects the build to fail with a specific message. Run with
 * `pnpm test:gate`.
 */
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PROBLEM = "src/content/problems/earth/climate-change.mdx";
const SKIP = new Set(["node_modules", "dist", ".astro", ".git", ".lighthouseci", "test-results"]);

interface Case {
  name: string;
  file: string;
  edit: (text: string) => string;
  expect: RegExp;
}

function replaceOnce(text: string, from: string, to: string): string {
  if (!text.includes(from)) throw new Error(`Gate setup: "${from}" not found; update the gate`);
  return text.replace(from, to);
}

const CASES: Case[] = [
  {
    name: "a stat with its source removed",
    file: PROBLEM,
    edit: (t) => replaceOnce(t, "    source: noaa-gml-co2-mlo\n", ""),
    expect: /stats\.0\.source: Required/,
  },
  {
    name: "the headline stat's source downgraded to T3",
    file: "src/content/sources/noaa-gml-co2-mlo.yaml",
    edit: (t) => replaceOnce(t, "tier: 1", "tier: 3"),
    expect: /headline stat from T3 source "noaa-gml-co2-mlo"/,
  },
  {
    name: "a source with its archived_url removed",
    file: "src/content/sources/ipcc-ar6-wg1-ch2.yaml",
    edit: (t) => t.replace(/^archived_url:.*\n/m, ""),
    expect: /archived_url: Required/,
  },
];

async function runCase(c: Case): Promise<string | null> {
  const dir = await mkdtemp(join(tmpdir(), "wwf-gate-"));
  try {
    await cp(ROOT, dir, {
      recursive: true,
      filter: (src) => !SKIP.has(relative(ROOT, src).split("/")[0] ?? ""),
    });
    await symlink(join(ROOT, "node_modules"), join(dir, "node_modules"), "dir");
    const target = join(dir, c.file);
    await writeFile(target, c.edit(await readFile(target, "utf8")));

    const result = spawnSync("pnpm", ["exec", "astro", "build"], { cwd: dir, encoding: "utf8" });
    // CI forces colour output; strip ANSI codes before matching messages.
    // eslint-disable-next-line no-control-regex -- matching the ESC character is the point
    const output = `${result.stdout}\n${result.stderr}`.replace(/\u001b\[[0-9;]*m/g, "");
    if (result.status === 0) return `build succeeded but should have failed`;
    if (!c.expect.test(output)) {
      return `build failed, but without the expected message ${c.expect}:\n${output.slice(-2000)}`;
    }
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

let failed = 0;
for (const c of CASES) {
  const problem = await runCase(c);
  if (problem === null) {
    console.log(`ok   build fails on ${c.name}`);
  } else {
    failed++;
    console.error(`FAIL ${c.name}: ${problem}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
