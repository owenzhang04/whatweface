import * as Plot from "@observablehq/plot";
import { parseHTML } from "linkedom";
import { formatNumber } from "./stats";
import { periodLabel, type Series } from "./series";

export interface LineChartOptions {
  id: string;
  title: string;
  description: string;
  yLabel: string;
}

/**
 * Renders an annual series as a static SVG string at build time. Colours come
 * from CSS (tokens), not from Plot, so both themes work without re-rendering.
 */
export function renderLineChart(series: Series, opts: LineChartOptions): string {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  const data = series.points.map((p) => ({
    x: p.month ? p.year + (p.month - 0.5) / 12 : p.year,
    y: p.value,
  }));
  const svg = Plot.plot({
    document,
    width: 560,
    height: 320,
    marginLeft: 48,
    style: { fontSize: "14px", "--plot-background": "var(--bg)" } as Partial<CSSStyleDeclaration>,
    x: { label: null, tickFormat: "d" },
    y: { label: opts.yLabel, grid: true, tickFormat: (d: number) => String(d) },
    marks: [
      Plot.ruleY([0], { className: "chart-baseline" }),
      Plot.lineY(data, { x: "x", y: "y", className: "chart-line", strokeWidth: 2 }),
    ],
  }) as unknown as Element;

  const titleId = `${opts.id}-title`;
  const descId = `${opts.id}-desc`;
  const title = document.createElement("title");
  title.setAttribute("id", titleId);
  title.textContent = opts.title;
  const desc = document.createElement("desc");
  desc.setAttribute("id", descId);
  desc.textContent = opts.description;
  svg.insertBefore(desc, svg.firstChild);
  svg.insertBefore(title, svg.firstChild);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-labelledby", `${titleId} ${descId}`);
  return svg.outerHTML;
}

/** A one-sentence, data-generated summary: range covered, extremes and latest value. */
export function describeSeries(series: Series, unit: string): string {
  const pts = series.points;
  const fmt = (v: number) => `${formatNumber(v, series.decimals)} ${unit}`;
  const first = pts[0]!;
  const last = pts.at(-1)!;
  const low = pts.reduce((a, b) => (b.value < a.value ? b : a));
  const high = pts.reduce((a, b) => (b.value > a.value ? b : a));
  return (
    `From ${periodLabel(first)} to ${periodLabel(last)}. ` +
    `Lowest: ${fmt(low.value)} in ${periodLabel(low)}. ` +
    `Highest: ${fmt(high.value)} in ${periodLabel(high)}. ` +
    `Latest: ${fmt(last.value)} in ${periodLabel(last)}.`
  );
}
