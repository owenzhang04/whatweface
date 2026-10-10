import { computeDerived, type DerivedResult } from "./derived";
import { formatNumber } from "./format";
import type { Problem, Stat } from "./schemas";
import { periodLabel, pickPoint, type Series } from "./series";

export interface ResolvedStat {
  id: string;
  label: string;
  value: number;
  display: string;
  // "± 0.17" or "275.4 to 281.2", formatted like the value.
  spread?: string;
  unit: string;
  period: string;
  asOf: number;
  source: string;
  note?: string;
}

/** Decimal places as written, so 278.3 stays "278.3" and 1.20 from a series stays "1.20". */
function decimalsOf(n: number): number {
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

function formatSpread(
  decimals: number,
  range?: [number, number],
  uncertainty?: number,
): string | undefined {
  if (range) return `${formatNumber(range[0], decimals)} to ${formatNumber(range[1], decimals)}`;
  if (uncertainty !== undefined) return `± ${formatNumber(uncertainty, decimals)}`;
  return undefined;
}

export function resolveStat(stat: Stat, getSeries: (id: string) => Series): ResolvedStat {
  const base = { id: stat.id, label: stat.label, unit: stat.unit, source: stat.source };
  const note = stat.note === undefined ? {} : { note: stat.note };

  if (stat.series !== undefined) {
    const series = getSeries(stat.series);
    const point = pickPoint(series, stat.offset_years);
    const uncertainty = stat.uncertainty ?? point.uncertainty;
    const spread = formatSpread(series.decimals, stat.range, uncertainty);
    return {
      ...base,
      ...note,
      value: point.value,
      display: formatNumber(point.value, series.decimals),
      ...(spread === undefined ? {} : { spread }),
      period: periodLabel(point),
      asOf: point.year,
    };
  }

  // The schema guarantees a typed stat has both value and as_of.
  const value = stat.value!;
  const asOf = stat.as_of!;
  const decimals = Math.max(
    decimalsOf(value),
    ...(stat.range ?? []).map(decimalsOf),
    stat.uncertainty === undefined ? 0 : decimalsOf(stat.uncertainty),
  );
  const spread = formatSpread(decimals, stat.range, stat.uncertainty);
  return {
    ...base,
    ...note,
    value,
    display: formatNumber(value, decimals),
    ...(spread === undefined ? {} : { spread }),
    period: String(asOf),
    asOf,
  };
}

/** Numbers each source in the order a reader meets it: stats, prose citations, action evidence. */
export function citationOrder(problem: Problem): Map<string, number> {
  const order = new Map<string, number>();
  const add = (id: string | null) => {
    if (id !== null && !order.has(id)) order.set(id, order.size + 1);
  };
  problem.stats.forEach((s) => add(s.source));
  problem.cites.forEach(add);
  problem.actions.forEach((a) => add(a.evidence));
  return order;
}

export interface ResolvedProblem {
  stats: Map<string, ResolvedStat>;
  derived: DerivedResult[];
  citations: Map<string, number>;
}

export function resolveProblem(
  problem: Problem,
  getSeries: (id: string) => Series,
): ResolvedProblem {
  const stats = new Map(problem.stats.map((s) => [s.id, resolveStat(s, getSeries)]));
  const values = new Map([...stats].map(([id, s]) => [id, s.value]));
  return {
    stats,
    derived: problem.derived.map((d) => computeDerived(d, values)),
    citations: citationOrder(problem),
  };
}
