/**
 * Parsers for raw provider files (see docs/DATA.md). They validate shape and
 * throw on anything unexpected, so a malformed download never replaces a
 * good series.
 */

export interface Co2MonthlyRow {
  year: number;
  month: number;
  decimal_date: number;
  average: number;
  deseasonalized: number;
  ndays: number;
  sdev: number;
  unc: number;
}

export interface GistempAnnualRow {
  year: number;
  anomaly: number;
}

const MIN_CO2_ROWS = 600; // Monthly since March 1958.
const MIN_GISTEMP_ROWS = 140; // Annual since 1880.

function toNumber(raw: string, context: string): number {
  const n = Number(raw);
  if (raw.trim() === "" || !Number.isFinite(n)) {
    throw new Error(`${context}: expected a number, got "${raw}"`);
  }
  return n;
}

/** NOAA GML co2_mm_mlo.txt: whitespace-separated, `#` comment lines, 8 columns. */
export function parseNoaaCo2Monthly(text: string): Co2MonthlyRow[] {
  const rows: Co2MonthlyRow[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;
    const cols = trimmed.split(/\s+/);
    const where = `co2_mm_mlo.txt line ${i + 1}`;
    if (cols.length !== 8) {
      throw new Error(`${where}: expected 8 columns, got ${cols.length}`);
    }
    const [year, month, decimal_date, average, deseasonalized, ndays, sdev, unc] = cols.map((c) =>
      toNumber(c, where),
    ) as [number, number, number, number, number, number, number, number];
    if (month < 1 || month > 12) throw new Error(`${where}: month ${month} out of range`);
    rows.push({ year, month, decimal_date, average, deseasonalized, ndays, sdev, unc });
  });
  if (rows.length < MIN_CO2_ROWS) {
    throw new Error(`co2_mm_mlo.txt: expected at least ${MIN_CO2_ROWS} rows, got ${rows.length}`);
  }
  return rows;
}

/**
 * NASA GISTEMP GLB.Ts+dSST.csv: a title line, then a header starting
 * `Year,Jan,...,Dec,J-D`. `***` marks missing values. Returns the J-D
 * (January–December) annual mean for each complete year.
 */
export function parseGistempAnnual(text: string): GistempAnnualRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const headerIndex = lines.findIndex((l) => l.startsWith("Year,"));
  if (headerIndex === -1) throw new Error("GISTEMP: header row starting 'Year,' not found");
  const header = lines[headerIndex]!.split(",");
  const yearCol = header.indexOf("Year");
  const annualCol = header.indexOf("J-D");
  if (annualCol === -1) throw new Error("GISTEMP: 'J-D' column not found");

  const rows: GistempAnnualRow[] = [];
  for (const [offset, line] of lines.slice(headerIndex + 1).entries()) {
    const cols = line.split(",");
    const where = `GISTEMP line ${headerIndex + offset + 2}`;
    if (cols.length !== header.length) {
      throw new Error(`${where}: expected ${header.length} columns, got ${cols.length}`);
    }
    const annual = cols[annualCol]!;
    if (annual === "***") continue;
    rows.push({
      year: toNumber(cols[yearCol]!, where),
      anomaly: toNumber(annual, where),
    });
  }
  if (rows.length < MIN_GISTEMP_ROWS) {
    throw new Error(`GISTEMP: expected at least ${MIN_GISTEMP_ROWS} years, got ${rows.length}`);
  }
  return rows;
}

/** NOAA's file header carries "File Creation: <date>"; used as the provider's last_updated. */
export function noaaFileCreated(text: string): string | null {
  const match = /^#\s*File Creation:\s*(.+)$/m.exec(text);
  return match ? match[1]!.trim() : null;
}
