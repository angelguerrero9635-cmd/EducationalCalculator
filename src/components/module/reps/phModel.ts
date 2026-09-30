/**
 * The numbers behind the pH scale and the titration curve (H55), shared by the picture and its
 * harness check. A titration's pH comes from the charge balance of a monoprotic acid titrated
 * with a strong base, [H⁺] + [Na⁺] = [OH⁻] + [A⁻], solved exactly by bisection on log [H⁺]:
 * no buffer or end-point shortcuts, so the curve is right before, at and after equivalence.
 */

/** Water's ion product at 25 °C. */
export const KW = 1e-14;

/**
 * The pH after `vb` of base (concentration `cb`) is added to `va` of acid (concentration `ca`),
 * volumes in the same unit. `ka` is the acid's Kₐ; leave it out for a strong acid.
 */
export function titrationPH(ca: number, va: number, cb: number, vb: number, ka?: number): number {
  const v = va + vb;
  if (!(v > 0)) return 7;
  const acid = (ca * va) / v;
  const na = (cb * vb) / v;
  const f = (h: number) => h + na - KW / h - (ka === undefined ? acid : (acid * ka) / (ka + h));
  let lo = -16;
  let hi = 2;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (f(10 ** mid) > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}

/** The volume of base that exactly uses up the acid. */
export const equivalenceVolume = (ca: number, va: number, cb: number) =>
  cb > 0 ? (ca * va) / cb : Infinity;

/** '#RRGGBB' mixed toward another color by t (0 to 1). */
export function mixColor(a: string, b: string, t: number): string {
  const parse = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [pa, pb] = [parse(a), parse(b)];
  if (a.length !== 7 || b.length !== 7 || pa.some(Number.isNaN) || pb.some(Number.isNaN))
    return t < 0.5 ? a : b;
  const hex = pa.map((v, i) =>
    Math.round(v + (pb[i]! - v) * t)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${hex.join('')}`;
}

/** Universal indicator: red in strong acid through orange, yellow, green at 7, blue, violet. */
export function indicatorColor(
  ph: number,
  c: {
    spectrumRed: string;
    spectrumOrange: string;
    spectrumYellow: string;
    spectrumGreen: string;
    spectrumBlue: string;
    spectrumViolet: string;
  },
): string {
  const stops: [number, string][] = [
    [0, c.spectrumRed],
    [3, c.spectrumOrange],
    [5, c.spectrumYellow],
    [7, c.spectrumGreen],
    [9.5, c.spectrumBlue],
    [12, c.spectrumViolet],
    [14, c.spectrumViolet],
  ];
  const x = Math.min(14, Math.max(0, ph));
  for (let i = 1; i < stops.length; i++) {
    const [x1, c1] = stops[i]!;
    const [x0, c0] = stops[i - 1]!;
    if (x <= x1) return mixColor(c0, c1, (x - x0) / (x1 - x0 || 1));
  }
  return c.spectrumViolet;
}

/** Everyday things on the pH scale (typical values from chemistry references). */
export const EVERYDAY: { name: string; pH: number; row: 0 | 1 }[] = [
  { name: 'lemon juice', pH: 2, row: 0 },
  { name: 'coffee', pH: 5, row: 1 },
  { name: 'pure water', pH: 7, row: 0 },
  { name: 'baking soda', pH: 8.3, row: 1 },
  { name: 'ammonia', pH: 11.5, row: 0 },
];
