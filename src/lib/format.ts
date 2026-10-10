/** Fixed decimal places with thousands separators: formatNumber(1234.5, 2) is "1,234.50". */
export function formatNumber(n: number, decimals: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** The unit as written after a number: "8.4%" takes no space, "423 ppm" does. */
export function unitSuffix(unit: string): string {
  return unit === "%" ? unit : ` ${unit}`;
}
