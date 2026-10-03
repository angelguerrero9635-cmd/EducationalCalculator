/**
 * HC121 `michelLevy`: interference colours between crossed polars, computed (never scanned from a
 * chart). A grain of retardation Γ at 45° to the polars passes sin²(πΓ ÷ λ) of each wavelength λ;
 * that spectrum, lit by a 6,500 K black body, is weighed with analytic fits to the CIE 1931
 * colour-matching functions (sums of Gaussians), turned into sRGB and gamma-encoded. Shared by
 * the picture and its harness check.
 */

/** A two-sided Gaussian lobe of the colour-matching fits. */
const lobe = (l: number, mu: number, s1: number, s2: number) => {
  const t = (l - mu) / (l < mu ? s1 : s2);
  return Math.exp(-0.5 * t * t);
};

/** The CIE 1931 2° observer, fitted by Gaussian lobes (x̄, ȳ, z̄ at λ in nm). */
export function observer(l: number): [number, number, number] {
  return [
    1.056 * lobe(l, 599.8, 37.9, 31.0) +
      0.362 * lobe(l, 442.0, 16.0, 26.7) -
      0.065 * lobe(l, 501.1, 20.4, 26.2),
    0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8),
  ];
}

/** A black body's relative power at λ nm and temperature K (Planck's law). */
const planck = (l: number, k: number) => {
  const m = l * 1e-9;
  return 1 / (m ** 5 * (Math.exp(1.4388e-2 / (m * k)) - 1));
};

const LAMBDAS = Array.from({ length: 81 }, (_, i) => 380 + 5 * i);
const LAMP = LAMBDAS.map((l) => planck(l, 6500));
const CMF = LAMBDAS.map(observer);
const WHITE = LAMBDAS.reduce(
  (acc, _, i) => acc.map((a, k) => a + LAMP[i]! * CMF[i]![k]!) as [number, number, number],
  [0, 0, 0] as [number, number, number],
);

/** Light passed at λ by a grain of retardation Γ (nm) between crossed polars, at 45°. */
export const transmitted = (gamma: number, l: number) => Math.sin((Math.PI * gamma) / l) ** 2;

/** The colour's XYZ, the lamp's white at Y = 1. */
export function interferenceXYZ(gamma: number): [number, number, number] {
  const xyz: [number, number, number] = [0, 0, 0];
  LAMBDAS.forEach((l, i) => {
    const p = LAMP[i]! * transmitted(gamma, l);
    for (let k = 0; k < 3; k++) xyz[k] = xyz[k]! + p * CMF[i]![k]!;
  });
  return xyz.map((v) => v / WHITE[1]) as [number, number, number];
}

/** How bright the chart is drawn: the high orders average half the light, shown near white. */
const EXPOSURE = 1.7;

/** The interference colour of retardation Γ (nm) as '#rrggbb'. */
export function interferenceColor(gamma: number): string {
  const [x, y, z] = interferenceXYZ(gamma).map((v) => v * EXPOSURE) as [number, number, number];
  // Relative to the lamp's white, so white light stays neutral (a von Kries scaling to D65).
  const [xw, , zw] = WHITE.map((v) => v / WHITE[1]!) as [number, number, number];
  const xs = (x * 0.9505) / xw;
  const zs = (z * 1.089) / zw;
  const lin = [
    3.2406 * xs - 1.5372 * y - 0.4986 * zs,
    -0.9689 * xs + 1.8758 * y + 0.0415 * zs,
    0.0557 * xs - 0.204 * y + 1.057 * zs,
  ];
  const enc = (v: number) => {
    const c = Math.max(0, Math.min(1, v));
    const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(255 * s)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${lin.map(enc).join('')}`;
}

/** The order of an interference colour: each order spans about 550 nm. */
export const orderOf = (gamma: number) => Math.floor(gamma / 550) + 1;

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

/** The colour's usual name (the bands are approximate). */
const NAMES: [number, string][] = [
  [40, 'black'],
  [180, 'grey'],
  [320, 'white'],
  [430, 'yellow'],
  [530, 'orange'],
  [580, 'red to violet'],
  [700, 'blue'],
  [820, 'green'],
  [950, 'yellow'],
  [1100, 'red'],
  [1200, 'violet'],
  [1330, 'blue-green'],
  [1450, 'green'],
  [1560, 'yellow'],
  [1700, 'pink'],
  [Infinity, 'pale pink and green'],
];

/** "first-order white", "second-order red". */
export function interferenceName(gamma: number): string {
  const name = NAMES.find(([to]) => gamma < to)![1];
  const n = orderOf(gamma);
  return `${ORDINAL[n - 1] ?? `${n}th`}-order ${name}`;
}

/** Retardation (nm) from thickness (μm) and birefringence: Γ = 1,000tδ. */
export const retardationOf = (t: number, delta: number) => 1000 * t * delta;
