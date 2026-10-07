import type { Derived } from "./schemas";

// Julian year (365.25 days), the convention for converting annual rates to seconds.
export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

const SECONDS_PER: Record<Derived["per"], number> = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
};

/** "One every N <per>": the time between events for a yearly count. */
export function perInterval(annualCount: number, per: Derived["per"]): number {
  if (!(annualCount > 0)) {
    throw new Error(`per_interval needs a positive yearly count, got ${annualCount}`);
  }
  return SECONDS_PER_YEAR / annualCount / SECONDS_PER[per];
}

/** "One in N people": the population divided by the number affected. */
export function shareOfPopulation(affected: number, population: number): number {
  if (!(affected > 0) || !(population >= affected)) {
    throw new Error(
      `share_of_population needs 0 < affected <= population, got ${affected} of ${population}`,
    );
  }
  return population / affected;
}

/** "N times": how many times larger one stat is than another. */
export function multipleOf(value: number, base: number): number {
  if (!(base > 0)) {
    throw new Error(`multiple_of needs a positive base, got ${base}`);
  }
  return value / base;
}

/**
 * Rounds a derived number for display. Multiples keep one decimal ("1.5
 * times"); counts of people or seconds are whole numbers, except intervals
 * under ten, which keep one decimal so "every 0.4 seconds" doesn't become 0.
 */
export function formatDerived(n: number, formula: Derived["formula"]): string {
  const fractionDigits =
    formula === "multiple_of" || (formula === "per_interval" && n < 10) ? 1 : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

export interface DerivedResult {
  id: string;
  n: number;
  text: string;
}

export function computeDerived(def: Derived, values: ReadonlyMap<string, number>): DerivedResult {
  const lookup = (id: string | undefined, role: string): number => {
    const v = id === undefined ? undefined : values.get(id);
    if (v === undefined) {
      throw new Error(`derived "${def.id}": ${role} stat "${id ?? "(missing `of`)"}" has no value`);
    }
    return v;
  };

  const from = lookup(def.from, "from");
  let n: number;
  switch (def.formula) {
    case "per_interval":
      n = perInterval(from, def.per);
      break;
    case "share_of_population":
      n = shareOfPopulation(from, lookup(def.of, "of"));
      break;
    case "multiple_of":
      n = multipleOf(from, lookup(def.of, "of"));
      break;
  }
  return { id: def.id, n, text: def.label.replace("{n}", formatDerived(n, def.formula)) };
}
