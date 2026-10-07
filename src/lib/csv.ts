/** Minimal CSV for our own numeric series files: no quoting, no embedded commas. */

export function toCsv(columns: readonly string[], rows: readonly (readonly string[])[]): string {
  for (const row of rows) {
    if (row.length !== columns.length) {
      throw new Error(`CSV row has ${row.length} fields, header has ${columns.length}`);
    }
    if (row.some((field) => /[",\n]/.test(field))) {
      throw new Error(`CSV field needs quoting, which this writer doesn't support: ${row}`);
    }
  }
  return [columns.join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l !== "");
  const [headerLine, ...body] = lines;
  if (headerLine === undefined) throw new Error("CSV is empty");
  const header = headerLine.split(",");
  return body.map((line, i) => {
    const fields = line.split(",");
    if (fields.length !== header.length) {
      throw new Error(`CSV line ${i + 2}: ${fields.length} fields, header has ${header.length}`);
    }
    return Object.fromEntries(header.map((h, j) => [h, fields[j]!]));
  });
}
