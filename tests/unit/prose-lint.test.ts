import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { lintProse } from "../../src/lib/prose-lint";

const FRONTMATTER = `---
title: Example
description: A plain description.
stats:
  - id: deaths
    label: Deaths in 2023, all ages
    value: 1000
    unit: people
    as_of: 2023
    source: example-source
    note: Covers 204 countries.
derived:
  - id: per-second
    from: deaths
    formula: per_interval
    label: one death every {n} seconds
---
`;

const page = (body: string, frontmatter = FRONTMATTER) => frontmatter + body;
const tokens = (source: string) => lintProse(source).map((f) => f.token);

describe("lintProse: body text", () => {
  it("passes prose whose numbers all come from components", () => {
    const body = `About <Stat id="deaths" withPeriod /> people died.<Cite source="example-source" />\n`;
    expect(lintProse(page(body))).toEqual([]);
  });

  it("flags a digit typed into prose, with its line and column", () => {
    const source = page("## How big it is\n\nAbout 40 people died.\n");
    const [finding, ...rest] = lintProse(source);
    expect(rest).toEqual([]);
    expect(finding?.token).toBe("40");
    expect(finding?.line).toBe(source.split("\n").indexOf("About 40 people died.") + 1);
    expect(finding?.column).toBe(7);
  });

  it("flags digits inside words, years and ranges", () => {
    expect(tokens(page("Since 1987, about 1.2m people, in 2010–2020.\n"))).toEqual([
      "1987,",
      "1.2m",
      "2010–2020.",
    ]);
  });

  it("flags spelled scale words and percent signs", () => {
    expect(
      tokens(page("Two billion people. Half a Million more. Forty per cent. Ten %.\n")),
    ).toEqual(["billion", "Million", "per cent", "%"]);
  });

  it("ignores ordinary words that contain scale words", () => {
    expect(tokens(page("Percentages aside, a millionaire's dozenth thought.\n"))).toEqual([]);
  });

  it("allows listed names that contain digits", () => {
    expect(tokens(page("Fine particles (PM2.5) are the problem.\n"))).toEqual([]);
    expect(lintProse(page("Fine particles (PM2.5).\n"), [])).toHaveLength(1);
  });

  it("ignores component attributes, including multi-line props with > in strings", () => {
    const body = `<Chart\n  title="Temperature vs the 1951–1980 average"\n  axisNote="Values > 0 are warmer"\n/>\n`;
    expect(lintProse(page(body))).toEqual([]);
  });

  it("checks attributes that render as prose", () => {
    const body = `<MoreDetail title="Why 3 sources?">\n  Text.\n</MoreDetail>\n`;
    expect(tokens(page(body))).toEqual(["3"]);
  });

  it("still checks text between component tags", () => {
    expect(tokens(page(`<MoreDetail title="Why">\n  About 7 of them.\n</MoreDetail>\n`))).toEqual([
      "7",
    ]);
  });

  it("ignores link targets, comments, code, entities and imports", () => {
    const body = [
      `import X from "./x2.ts";`,
      `See [the report](https://example.org/2024/report-3).`,
      `{/* TODO: check 2024 data */}`,
      `<!-- 12 -->`,
      "```\nvalue = 42\n```",
      `A dash&#8212;here.`,
    ].join("\n");
    expect(lintProse(page(body))).toEqual([]);
  });

  it("flags digits inside JSX expressions", () => {
    expect(tokens(page("Total: {2 + 2}\n"))).toEqual(["{2", "2}"]);
  });

  it("handles a page with no frontmatter and Windows line endings", () => {
    expect(tokens("Plain text with 5 items.\r\n")).toEqual(["5"]);
  });
});

describe("lintProse: frontmatter", () => {
  it("doesn't check stat labels, notes or derived labels", () => {
    expect(lintProse(page("Body.\n"))).toEqual([]);
  });

  it("flags numbers in the page description and title", () => {
    const fm = FRONTMATTER.replace("A plain description.", "Kills 8 million a year.");
    expect(tokens(page("Body.\n", fm))).toEqual(["8", "million"]);
  });

  it("flags numbers in action titles and descriptions, with line numbers", () => {
    const fm = FRONTMATTER.replace(
      /---\n$/,
      `actions:\n  - kind: Do\n    title: Walk 30 minutes\n    description: >\n      It cuts risk by\n      a third, or 33%.\n    evidence: null\n---\n`,
    );
    const source = page("Body.\n", fm);
    const findings = lintProse(source);
    expect(findings.map((f) => f.token)).toEqual(["30", "33%."]);
    const lines = source.split("\n");
    expect(findings[0]?.line).toBe(lines.indexOf("    title: Walk 30 minutes") + 1);
    expect(findings[0]?.column).toBe("    title: Walk ".length + 1);
    expect(findings[1]?.line).toBe(lines.indexOf("      a third, or 33%.") + 1);
  });

  it("flags numbers in a content note", () => {
    const fm = FRONTMATTER.replace("title: Example", "title: Example\ncontent_note: 1 in 5 people");
    expect(tokens(page("Body.\n", fm))).toEqual(["1", "5"]);
  });
});

describe("lintProse: real content", () => {
  it("passes the climate change page", () => {
    const source = readFileSync("src/content/problems/earth/climate-change.mdx", "utf8");
    expect(lintProse(source)).toEqual([]);
  });
});
