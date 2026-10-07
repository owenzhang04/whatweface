import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "../../src/lib/csv";
import { noaaFileCreated, parseGistempAnnual, parseNoaaCo2Monthly } from "../../src/lib/parsers";

function co2Line(i: number): string {
  const year = 1958 + Math.floor(i / 12);
  const month = (i % 12) + 1;
  return ` ${year}    ${month}   ${(year + month / 12).toFixed(4)}      315.71      314.44     -1   -9.99   -0.99`;
}

function co2File(rows: number, extra: string[] = []): string {
  const body = Array.from({ length: rows }, (_, i) => co2Line(i));
  return ["# File Creation: Sat Sep  5 03:55:38 2026", "#", ...body, ...extra].join("\n");
}

function gistempFile(years: number, extra: string[] = []): string {
  const header = "Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N,DJF,MAM,JJA,SON";
  const row = (y: number) => `${y},.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,-.18,***,***,.1,.1,.1`;
  const body = Array.from({ length: years }, (_, i) => row(1880 + i));
  return ["Land-Ocean: Global Means", header, ...body, ...extra].join("\n");
}

describe("parseNoaaCo2Monthly", () => {
  it("parses rows and skips comments", () => {
    const rows = parseNoaaCo2Monthly(co2File(600));
    expect(rows).toHaveLength(600);
    expect(rows[0]).toEqual({
      year: 1958,
      month: 1,
      decimal_date: 1958.0833,
      average: 315.71,
      deseasonalized: 314.44,
      ndays: -1,
      sdev: -9.99,
      unc: -0.99,
    });
  });

  it("rejects a truncated download", () => {
    expect(() => parseNoaaCo2Monthly(co2File(10))).toThrow(/at least 600 rows, got 10/);
  });

  it("rejects an empty response", () => {
    expect(() => parseNoaaCo2Monthly("")).toThrow(/got 0/);
  });

  it("rejects a row with the wrong number of columns", () => {
    expect(() => parseNoaaCo2Monthly(co2File(600, [" 2026 9 2026.7 427.1"]))).toThrow(
      /expected 8 columns, got 4/,
    );
  });

  it("rejects a non-numeric value", () => {
    const bad = " 2026    9   2026.7083      abc      429.51     17    0.36    0.17";
    expect(() => parseNoaaCo2Monthly(co2File(600, [bad]))).toThrow(/expected a number, got "abc"/);
  });

  it("rejects an HTML error page", () => {
    expect(() => parseNoaaCo2Monthly("<html><body>Service Unavailable</body></html>")).toThrow();
  });

  it("reads the file creation date", () => {
    expect(noaaFileCreated(co2File(600))).toBe("Sat Sep  5 03:55:38 2026");
    expect(noaaFileCreated("no header")).toBeNull();
  });
});

describe("parseGistempAnnual", () => {
  it("returns J-D annual means and skips years with *** (incomplete)", () => {
    const partial =
      "2026,1.09,1.25,1.32,1.17,1.13,1.18,1.25,1.40,***,***,***,***,***,***,1.13,1.21,1.28,***";
    const rows = parseGistempAnnual(gistempFile(146, [partial]));
    expect(rows).toHaveLength(146);
    expect(rows[0]).toEqual({ year: 1880, anomaly: -0.18 });
    expect(rows.at(-1)?.year).toBe(2025);
  });

  it("rejects a file without the expected header", () => {
    expect(() => parseGistempAnnual("Land-Ocean: Global Means\nfoo,bar")).toThrow(/header/);
  });

  it("rejects a truncated download", () => {
    expect(() => parseGistempAnnual(gistempFile(20))).toThrow(/at least 140 years, got 20/);
  });

  it("rejects a row with missing columns", () => {
    expect(() => parseGistempAnnual(gistempFile(146, ["2026,1.0,1.1"]))).toThrow(/columns/);
  });
});

describe("csv", () => {
  it("round-trips rows", () => {
    const text = toCsv(["year", "value"], [["2025", "1.19"]]);
    expect(text).toBe("year,value\n2025,1.19\n");
    expect(parseCsv(text)).toEqual([{ year: "2025", value: "1.19" }]);
  });

  it("refuses fields that would need quoting", () => {
    expect(() => toCsv(["a"], [["x,y"]])).toThrow(/quoting/);
  });

  it("rejects ragged rows", () => {
    expect(() => toCsv(["a", "b"], [["1"]])).toThrow(/1 fields/);
    expect(() => parseCsv("a,b\n1")).toThrow(/line 2/);
  });

  it("rejects an empty file", () => {
    expect(() => parseCsv("")).toThrow(/empty/);
  });
});
