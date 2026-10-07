/**
 * Fetches the Phase 1 series (docs/DATA.md) and writes them to data/series/
 * as CSV plus a .meta.json. Run with `pnpm fetch-data`.
 *
 * Each provider is retried 3 times with exponential backoff. A failed or
 * malformed download leaves the existing file untouched and is reported; the
 * script exits non-zero if any provider failed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { toCsv } from "../src/lib/csv.ts";
import { noaaFileCreated, parseGistempAnnual, parseNoaaCo2Monthly } from "../src/lib/parsers.ts";

interface Dataset {
  id: string;
  endpoint: string;
  sourceId: string;
  convert: (text: string) => { columns: string[]; rows: string[][]; lastUpdated: string | null };
}

const DATASETS: Dataset[] = [
  {
    id: "noaa/co2-mlo-monthly",
    endpoint: "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt",
    sourceId: "noaa-gml-co2-mlo",
    convert: (text) => ({
      columns: [
        "year",
        "month",
        "decimal_date",
        "average",
        "deseasonalized",
        "ndays",
        "sdev",
        "unc",
      ],
      rows: parseNoaaCo2Monthly(text).map((r) => [
        String(r.year),
        String(r.month),
        r.decimal_date.toFixed(4),
        r.average.toFixed(2),
        r.deseasonalized.toFixed(2),
        String(r.ndays),
        r.sdev.toFixed(2),
        r.unc.toFixed(2),
      ]),
      lastUpdated: noaaFileCreated(text),
    }),
  },
  {
    id: "nasa/gistemp-global",
    endpoint: "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv",
    sourceId: "nasa-gistemp-v4",
    convert: (text) => ({
      columns: ["year", "anomaly"],
      rows: parseGistempAnnual(text).map((r) => [String(r.year), r.anomaly.toFixed(2)]),
      lastUpdated: null,
    }),
  },
];

const ATTEMPTS = 3;
const SERIES_DIR = join(process.cwd(), "data", "series");

async function fetchWithRetry(url: string): Promise<{ text: string; lastModified: string | null }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "whatweface-data-fetch" } });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return { text: await res.text(), lastModified: res.headers.get("last-modified") };
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) {
        const delayMs = 1000 * 2 ** (attempt - 1);
        console.warn(`  attempt ${attempt} failed (${String(error)}); retrying in ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error(`${url}: failed after ${ATTEMPTS} attempts: ${String(lastError)}`);
}

async function update(dataset: Dataset): Promise<void> {
  console.log(`Fetching ${dataset.id}`);
  const { text, lastModified } = await fetchWithRetry(dataset.endpoint);
  const { columns, rows, lastUpdated } = dataset.convert(text);
  const csvPath = join(SERIES_DIR, `${dataset.id}.csv`);
  const meta = {
    id: dataset.id,
    source: dataset.sourceId,
    endpoint: dataset.endpoint,
    fetched_at: new Date().toISOString(),
    provider_last_updated: lastUpdated ?? lastModified,
    rows: rows.length,
  };
  await mkdir(dirname(csvPath), { recursive: true });
  await writeFile(csvPath, toCsv(columns, rows));
  await writeFile(
    join(SERIES_DIR, `${dataset.id}.meta.json`),
    JSON.stringify(meta, null, 2) + "\n",
  );
  console.log(`  wrote ${rows.length} rows to ${csvPath}`);
}

const results = await Promise.allSettled(DATASETS.map(update));
const failures = results.flatMap((r, i) =>
  r.status === "rejected" ? [`${DATASETS[i]!.id}: ${String(r.reason)}`] : [],
);
if (failures.length > 0) {
  console.error(`\n${failures.length} dataset(s) failed; existing files were left unchanged:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
