import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseCsv } from "./csv";

export interface SeriesPoint {
  year: number;
  month?: number;
  value: number;
  // Provider's stated uncertainty for this point, when it publishes one.
  uncertainty?: number;
}

export interface Series {
  id: string;
  decimals: number;
  points: SeriesPoint[];
}

type RowMapper = (row: Record<string, string>) => SeriesPoint;

interface SeriesDef {
  decimals: number;
  toPoint: RowMapper;
}

const SERIES_DEFS: Record<string, SeriesDef> = {
  "noaa/co2-mlo-monthly": {
    decimals: 2,
    toPoint: (r) => {
      const unc = Number(r.unc);
      // NOAA marks interpolated months and pre-1974 Scripps data with negative uncertainty.
      return {
        year: Number(r.year),
        month: Number(r.month),
        value: Number(r.average),
        ...(unc > 0 ? { uncertainty: unc } : {}),
      };
    },
  },
  "nasa/gistemp-global": {
    decimals: 2,
    toPoint: (r) => ({ year: Number(r.year), value: Number(r.anomaly) }),
  },
};

export function seriesFromCsv(id: string, text: string): Series {
  const def = SERIES_DEFS[id];
  if (!def)
    throw new Error(`Unknown series "${id}". Known: ${Object.keys(SERIES_DEFS).join(", ")}`);
  const points = parseCsv(text).map(def.toPoint);
  if (points.length === 0) throw new Error(`Series "${id}" has no rows`);
  for (const p of points) {
    if (!Number.isFinite(p.year) || !Number.isFinite(p.value)) {
      throw new Error(`Series "${id}" has a non-numeric row: ${JSON.stringify(p)}`);
    }
  }
  return { id, decimals: def.decimals, points };
}

const cache = new Map<string, Series>();

export function loadSeries(id: string, dataDir = join(process.cwd(), "data", "series")): Series {
  const cached = cache.get(id);
  if (cached) return cached;
  const path = join(dataDir, `${id}.csv`);
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`Series "${id}": can't read ${path}. Run \`pnpm fetch-data\`.`, {
      cause: error,
    });
  }
  const series = seriesFromCsv(id, text);
  cache.set(id, series);
  return series;
}

/**
 * The latest point, or the point `offsetYears` before it in the same month,
 * so a comparison always spans whole years.
 */
export function pickPoint(series: Series, offsetYears = 0): SeriesPoint {
  const latest = series.points.at(-1)!;
  if (offsetYears === 0) return latest;
  const target = series.points.find(
    (p) => p.year === latest.year - offsetYears && p.month === latest.month,
  );
  if (!target) {
    throw new Error(`Series "${series.id}" has no point ${offsetYears} years before the latest`);
  }
  return target;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function periodLabel(point: SeriesPoint): string {
  return point.month === undefined
    ? String(point.year)
    : `${MONTHS[point.month - 1]} ${point.year}`;
}
