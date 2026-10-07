import { describe, expect, it } from "vitest";
import { problemSchema, statSchema } from "../../src/lib/schemas";
import { pickPoint, seriesFromCsv, type Series } from "../../src/lib/series";
import { citationOrder, resolveProblem, resolveStat } from "../../src/lib/stats";

const co2Csv = [
  "year,month,decimal_date,average,deseasonalized,ndays,sdev,unc",
  "1958,3,1958.2027,315.71,314.44,-1,-9.99,-0.99",
  "2016,8,2016.6250,402.25,404.39,27,0.41,0.15",
  "2026,7,2026.5417,429.13,428.78,21,0.61,0.26",
  "2026,8,2026.6250,427.55,429.51,17,0.36,0.17",
].join("\n");

const gistempCsv = "year,anomaly\n2024,1.29\n2025,1.20\n";

const series: Record<string, Series> = {
  "noaa/co2-mlo-monthly": seriesFromCsv("noaa/co2-mlo-monthly", co2Csv),
  "nasa/gistemp-global": seriesFromCsv("nasa/gistemp-global", gistempCsv),
};
const getSeries = (id: string) => series[id]!;

const stat = (fields: Record<string, unknown>) =>
  statSchema.parse({ id: "s", label: "Label", unit: "ppm", source: "src", ...fields });

describe("series", () => {
  it("drops NOAA's negative 'missing' uncertainty", () => {
    expect(series["noaa/co2-mlo-monthly"]!.points[0]).toEqual({
      year: 1958,
      month: 3,
      value: 315.71,
    });
  });

  it("picks the same month N years before the latest", () => {
    expect(pickPoint(series["noaa/co2-mlo-monthly"]!, 10)).toMatchObject({ year: 2016, month: 8 });
  });

  it("fails when the comparison point doesn't exist", () => {
    expect(() => pickPoint(series["noaa/co2-mlo-monthly"]!, 30)).toThrow(/30 years before/);
  });

  it("rejects an unknown series id", () => {
    expect(() => seriesFromCsv("nope/nope", co2Csv)).toThrow(/Unknown series/);
  });

  it("rejects a series with non-numeric values", () => {
    expect(() => seriesFromCsv("nasa/gistemp-global", "year,anomaly\n2025,abc\n")).toThrow(
      /non-numeric/,
    );
  });
});

describe("resolveStat", () => {
  it("takes the latest series point, its period and its stated uncertainty", () => {
    const r = resolveStat(stat({ series: "noaa/co2-mlo-monthly" }), getSeries);
    expect(r).toMatchObject({
      value: 427.55,
      display: "427.55",
      spread: "± 0.17",
      period: "August 2026",
      asOf: 2026,
    });
  });

  it("keeps a series' fixed decimals, including trailing zeros", () => {
    const r = resolveStat(stat({ series: "nasa/gistemp-global", unit: "°C" }), getSeries);
    expect(r).toMatchObject({ display: "1.20", period: "2025" });
    expect(r.spread).toBeUndefined();
  });

  it("formats a typed value as written, with its uncertainty", () => {
    const r = resolveStat(stat({ value: 278.3, uncertainty: 2.9, as_of: 1750 }), getSeries);
    expect(r).toMatchObject({ display: "278.3", spread: "± 2.9", period: "1750" });
  });

  it("formats a typed range at the same precision as the value", () => {
    const r = resolveStat(
      stat({ value: 1_200_000, range: [1_100_000, 1_350_000], as_of: 2024 }),
      getSeries,
    );
    expect(r).toMatchObject({ display: "1,200,000", spread: "1,100,000 to 1,350,000" });
  });
});

describe("resolveProblem", () => {
  const problem = problemSchema.parse({
    title: "T",
    description: "D",
    scale: "earth",
    status: "Active",
    last_reviewed: "2026-10-06",
    headline: "now",
    stats: [
      { id: "now", label: "Now", unit: "ppm", source: "noaa", series: "noaa/co2-mlo-monthly" },
      { id: "before", label: "Before", unit: "ppm", source: "ipcc", value: 278.3, as_of: 1750 },
      { id: "again", label: "Again", unit: "ppm", source: "noaa", series: "noaa/co2-mlo-monthly" },
    ],
    cites: ["ipcc", "extra"],
    derived: [{ id: "x", from: "now", of: "before", formula: "multiple_of", label: "{n} times" }],
    actions: [
      { kind: "Learn", title: "Read", evidence: null },
      { kind: "Do", title: "Act", evidence: "evidence" },
    ],
  });

  it("computes derived stats from resolved values", () => {
    expect(resolveProblem(problem, getSeries).derived).toEqual([
      { id: "x", n: 427.55 / 278.3, text: "1.5 times" },
    ]);
  });

  it("numbers sources in reading order without duplicates", () => {
    expect([...citationOrder(problem)]).toEqual([
      ["noaa", 1],
      ["ipcc", 2],
      ["extra", 3],
      ["evidence", 4],
    ]);
  });
});
