/** Fixed decimal places with thousands separators: formatNumber(1234.5, 2) is "1,234.50". */
export function formatNumber(n: number, decimals: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}
