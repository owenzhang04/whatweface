import { describe, expect, it } from "vitest";
import { formatNumber, unitSuffix } from "../../src/lib/format";

describe("formatNumber", () => {
  it("keeps the decimals asked for and adds thousands separators", () => {
    expect(formatNumber(1234.5, 2)).toBe("1,234.50");
    expect(formatNumber(10, 1)).toBe("10.0");
  });
});

describe("unitSuffix", () => {
  it("joins a per cent sign to the number", () => {
    expect(`8.4${unitSuffix("%")}`).toBe("8.4%");
  });

  it("puts a space before any other unit", () => {
    expect(`423${unitSuffix("ppm")}`).toBe("423 ppm");
    expect(`1.4${unitSuffix("billion adults aged 30–79")}`).toBe("1.4 billion adults aged 30–79");
  });
});
