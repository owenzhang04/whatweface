import { describe, expect, it } from "vitest";
import {
  SECONDS_PER_YEAR,
  computeDerived,
  formatDerived,
  multipleOf,
  perInterval,
  shareOfPopulation,
} from "../../src/lib/derived";
import { derivedSchema } from "../../src/lib/schemas";

describe("perInterval", () => {
  it("converts a yearly count to seconds between events", () => {
    expect(perInterval(SECONDS_PER_YEAR, "second")).toBe(1);
    expect(perInterval(SECONDS_PER_YEAR / 10, "second")).toBeCloseTo(10);
  });

  it("expresses the interval in the requested unit", () => {
    expect(perInterval(365.25, "day")).toBeCloseTo(1);
    expect(perInterval(365.25 * 24, "hour")).toBeCloseTo(1);
    expect(perInterval(SECONDS_PER_YEAR / 60, "minute")).toBeCloseTo(1);
  });

  it("rejects zero, negative and NaN counts", () => {
    expect(() => perInterval(0, "second")).toThrow(/positive/);
    expect(() => perInterval(-5, "second")).toThrow(/positive/);
    expect(() => perInterval(Number.NaN, "second")).toThrow(/positive/);
  });
});

describe("shareOfPopulation", () => {
  it("returns N in 'one in N'", () => {
    expect(shareOfPopulation(1_000, 10_000)).toBe(10);
    expect(shareOfPopulation(5, 5)).toBe(1);
  });

  it("rejects an affected count of zero or larger than the population", () => {
    expect(() => shareOfPopulation(0, 100)).toThrow(/affected/);
    expect(() => shareOfPopulation(101, 100)).toThrow(/affected/);
  });
});

describe("multipleOf", () => {
  it("divides value by base", () => {
    expect(multipleOf(30, 20)).toBe(1.5);
  });

  it("rejects a zero or negative base", () => {
    expect(() => multipleOf(1, 0)).toThrow(/positive base/);
    expect(() => multipleOf(1, -1)).toThrow(/positive base/);
  });
});

describe("formatDerived", () => {
  it("keeps one decimal for multiples", () => {
    expect(formatDerived(1.5363, "multiple_of")).toBe("1.5");
    expect(formatDerived(2, "multiple_of")).toBe("2.0");
  });

  it("rounds people counts to whole numbers with separators", () => {
    expect(formatDerived(12_345.6, "share_of_population")).toBe("12,346");
  });

  it("keeps one decimal only for intervals under ten", () => {
    expect(formatDerived(0.44, "per_interval")).toBe("0.4");
    expect(formatDerived(9.96, "per_interval")).toBe("10.0");
    expect(formatDerived(10.4, "per_interval")).toBe("10");
  });
});

describe("computeDerived", () => {
  const values = new Map([
    ["now", 30],
    ["before", 20],
  ]);

  it("fills the label with the formatted number", () => {
    const def = derivedSchema.parse({
      id: "ratio",
      from: "now",
      of: "before",
      formula: "multiple_of",
      label: "{n} times the earlier level",
    });
    expect(computeDerived(def, values)).toEqual({
      id: "ratio",
      n: 1.5,
      text: "1.5 times the earlier level",
    });
  });

  it("rejects a two-operand formula without `of`", () => {
    const def = { id: "ratio", from: "now", formula: "multiple_of", label: "{n} times" };
    expect(derivedSchema.safeParse(def).success).toBe(false);
  });

  it("rejects `of` on per_interval, which has one operand", () => {
    const def = { id: "gap", from: "now", of: "then", formula: "per_interval", label: "{n}" };
    expect(derivedSchema.safeParse(def).success).toBe(false);
  });

  it("fails clearly when a referenced stat has no value", () => {
    const def = derivedSchema.parse({
      id: "gap",
      from: "unknown",
      formula: "per_interval",
      label: "every {n} seconds",
    });
    expect(() => computeDerived(def, values)).toThrow(/"unknown" has no value/);
  });
});
