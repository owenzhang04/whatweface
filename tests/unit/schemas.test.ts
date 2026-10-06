import { describe, expect, it } from "vitest";
import { checkCitations, assertCitations } from "../../src/lib/citations";
import { problemSchema, sourceSchema, type Problem, type Source } from "../../src/lib/schemas";

const validSource = {
  id: "noaa-gml-co2",
  tier: 1,
  publisher: "NOAA Global Monitoring Laboratory",
  title: "Trends in Atmospheric Carbon Dioxide",
  year: 2026,
  url: "https://gml.noaa.gov/ccgg/trends/",
  archived_url: "https://web.archive.org/web/20261006000000/https://gml.noaa.gov/ccgg/trends/",
  accessed: "2026-10-06",
  locator: "Mauna Loa monthly mean",
};

const validStat = {
  id: "co2",
  label: "Carbon dioxide in the air",
  value: 1,
  unit: "ppm",
  as_of: 2026,
  source: "noaa-gml-co2",
};

const validProblem = {
  title: "Climate change",
  description: "Test problem",
  scale: "earth",
  status: "Active",
  last_reviewed: "2026-10-06",
  headline: "co2",
  stats: [validStat],
};

function without<T extends object>(obj: T, key: keyof T) {
  const copy: Partial<T> = { ...obj };
  delete copy[key];
  return copy;
}

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((i) => i.message).join("; ") ?? "";
}

function entries(problem: Problem, sources: Source[]) {
  return {
    problems: [{ id: "earth/test", data: problem }],
    sources: sources.map((s) => ({ id: s.id, data: s })),
  };
}

describe("source schema", () => {
  it("accepts a complete source", () => {
    expect(sourceSchema.safeParse(validSource).success).toBe(true);
  });

  it("fails when archived_url is missing", () => {
    const result = sourceSchema.safeParse(without(validSource, "archived_url"));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["archived_url"]);
  });

  it("fails when archived_url is not a Wayback Machine link", () => {
    const result = sourceSchema.safeParse({ ...validSource, archived_url: "https://example.org" });
    expect(messages(result)).toContain("Wayback Machine");
  });

  it("fails on an unknown tier", () => {
    expect(sourceSchema.safeParse({ ...validSource, tier: 4 }).success).toBe(false);
  });
});

describe("problem schema", () => {
  it("accepts a complete problem", () => {
    expect(problemSchema.safeParse(validProblem).success).toBe(true);
  });

  it("fails when a stat has no source", () => {
    const stats = [without(validStat, "source")];
    const result = problemSchema.safeParse({ ...validProblem, stats });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["stats", 0, "source"]);
  });

  it("fails when a typed stat has no as_of", () => {
    const stats = [without(validStat, "as_of")];
    const result = problemSchema.safeParse({ ...validProblem, stats });
    expect(messages(result)).toContain("as_of");
  });

  it("fails when a stat has neither value nor series", () => {
    const stats = [without(validStat, "value")];
    const result = problemSchema.safeParse({ ...validProblem, stats });
    expect(messages(result)).toContain("`value` or `series`");
  });

  it("fails when the headline is not one of the stats", () => {
    const result = problemSchema.safeParse({ ...validProblem, headline: "missing" });
    expect(messages(result)).toContain('headline "missing"');
  });

  it("fails when a derived stat refers to an unknown stat", () => {
    const derived = [{ id: "d", from: "nope", formula: "multiple_of", label: "{n} times" }];
    const result = problemSchema.safeParse({ ...validProblem, derived });
    expect(messages(result)).toContain('unknown stat "nope"');
  });
});

describe("citation check", () => {
  const problem = problemSchema.parse(validProblem);
  const source = sourceSchema.parse(validSource);

  it("passes when every stat cites a T1/T2 source", () => {
    const { problems, sources } = entries(problem, [source]);
    expect(checkCitations(problems, sources, 2026).errors).toEqual([]);
  });

  it("fails when a headline stat comes from a T3 source", () => {
    const { problems, sources } = entries(problem, [{ ...source, tier: 3 }]);
    const { errors } = checkCitations(problems, sources, 2026);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("headline stat from T3");
    expect(() => assertCitations({ errors, warnings: [] })).toThrow(/Citation check failed/);
  });

  it("fails when any other stat comes from a T3 source", () => {
    const extra = { ...validStat, id: "other", source: "news" };
    const p = problemSchema.parse({ ...validProblem, stats: [validStat, extra] });
    const news = { ...source, id: "news", tier: 3 as const };
    const { problems, sources } = entries(p, [source, news]);
    expect(checkCitations(problems, sources, 2026).errors[0]).toContain('stat "other" is a stat');
  });

  it("fails when a stat cites a source that isn't in the registry", () => {
    const { problems, sources } = entries(problem, []);
    expect(checkCitations(problems, sources, 2026).errors[0]).toContain("unknown source");
  });

  it("fails when an action's evidence isn't in the registry", () => {
    const actions = [{ kind: "Do", title: "Act", evidence: "missing" }];
    const p = problemSchema.parse({ ...validProblem, actions });
    const { problems, sources } = entries(p, [source]);
    expect(checkCitations(problems, sources, 2026).errors[0]).toContain('action "Act"');
  });

  it("fails when a source file name and its id disagree", () => {
    const { problems } = entries(problem, [source]);
    const sources = [{ id: "other-name", data: source }];
    expect(checkCitations(problems, sources, 2026).errors[0]).toContain("must match");
  });

  it("warns, but doesn't fail, on stats older than five years", () => {
    const old = problemSchema.parse({ ...validProblem, stats: [{ ...validStat, as_of: 2020 }] });
    const { problems, sources } = entries(old, [source]);
    const report = checkCitations(problems, sources, 2026);
    expect(report.errors).toEqual([]);
    expect(report.warnings[0]).toContain("more than 5 years old");
  });
});
