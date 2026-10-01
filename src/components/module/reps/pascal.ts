/**
 * Pascal's triangle and counting slots, as plain numbers: shared by `PascalTriangle.tsx` and the
 * harness (which checks every entry is the sum of the two above and the slots' product).
 */

/** Rows 0 to `last`, each built from the one above (the ends are 1). */
export function pascalRows(last: number): number[][] {
  const rows: number[][] = [[1]];
  for (let n = 1; n <= last; n++) {
    const above = rows[n - 1]!;
    rows.push(Array.from({ length: n + 1 }, (_, k) => (above[k - 1] ?? 0) + (above[k] ?? 0)));
  }
  return rows;
}

/**
 * The slots for r places from n: n × (n − 1) × … (r factors), and for a combination the r!
 * orders each group comes in, divided out.
 */
export function slotsOf(n: number, r: number, choose: boolean) {
  const factors = Array.from({ length: Math.max(0, r) }, (_, i) => n - i);
  const product = factors.reduce((t, x) => t * x, 1);
  const orders = Array.from({ length: Math.max(0, r) }, (_, i) => r - i);
  const divisor = choose ? orders.reduce((t, x) => t * x, 1) : 1;
  // Past 2⁵³ the product is not exact, so a count of groups is rounded to the whole number it is.
  const value = choose ? Math.round(product / divisor) : product;
  return { factors, product, orders: choose ? orders : [], divisor, value };
}

/** "a⁵ + 5a⁴b + 10a³b² + …": (a + b)ⁿ with row n's coefficients. */
export function expansion(n: number, a: string, b: string): string {
  const sup = (e: number) =>
    e === 1 ? '' : [...String(e)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
  const row = pascalRows(n)[n]!;
  return row
    .map((c, k) => {
      const pa = n - k ? `${a}${sup(n - k)}` : '';
      const pb = k ? `${b}${sup(k)}` : '';
      const coef = c === 1 && (pa || pb) ? '' : c.toLocaleString('en-US');
      return `${coef}${pa}${pb}`;
    })
    .join(' + ');
}

/** The groups that count: C(n, k), or with a second group C(n, k) × C(b, r − k). */
export function favourable(n: number, k: number, b?: number, r?: number): number {
  const c = (m: number, j: number) => {
    if (j < 0 || j > m) return 0;
    let v = 1;
    for (let i = 1; i <= j; i++) v = (v * (m - j + i)) / i;
    return Math.round(v);
  };
  return b === undefined || r === undefined ? c(n, k) : c(n, k) * c(b, r - k);
}
