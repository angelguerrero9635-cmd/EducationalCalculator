/**
 * Sums and geometry for the college round 4, group F pictures (typesHe4f.ts), shared by the
 * pictures and their harness checks.
 */

// ─── HC116: ternary ─────────────────────────────────────────────────────────────

/** Fractions of the top, bottom-left and bottom-right corners (they add to 1). */
export type Bary = [number, number, number];

/** A point of the unit triangle (bottom left (0, 0), bottom right (1, 0), top (½, √3 ÷ 2)), y up. */
export const baryXY = ([a, , c]: Bary): [number, number] => [c + a / 2, (a * Math.sqrt(3)) / 2];

/** A ternary field: its code (drawn in it), its name and its corners (top, left, right). */
export interface TernaryField {
  code: string;
  name: string;
  poly: Bary[];
}

/**
 * The quadrilateral of a top-corner share between q0 and q1 and a base share c ÷ (b + c)
 * between s0 and s1 (lines of one base share run straight to the top corner).
 */
const band = (q0: number, q1: number, s0: number, s1: number): Bary[] =>
  [
    [q0, s0],
    [q0, s1],
    [q1, s1],
    [q1, s0],
  ].map(([q, s]) => [q!, (1 - q!) * (1 - s!), (1 - q!) * s!]);

const QAP_ROWS: [number, number, string[], string[]][] = [
  [
    0.2,
    0.6,
    ['2', '3a', '3b', '4', '5'],
    [
      'alkali-feldspar granite',
      'syenogranite (a granite)',
      'monzogranite (a granite)',
      'granodiorite',
      'tonalite',
    ],
  ],
  [
    0.05,
    0.2,
    ['6*', '7*', '8*', '9*', '10*'],
    [
      'quartz alkali-feldspar syenite',
      'quartz syenite',
      'quartz monzonite',
      'quartz monzodiorite',
      'quartz diorite (or gabbro)',
    ],
  ],
  [
    0,
    0.05,
    ['6', '7', '8', '9', '10'],
    ['alkali-feldspar syenite', 'syenite', 'monzonite', 'monzodiorite', 'diorite (or gabbro)'],
  ],
];
/** The P ÷ (A + P) bounds of the QAP rows. */
export const QAP_SHARES = [0, 0.1, 0.35, 0.65, 0.9, 1];
/** The Q′ bounds of the QAP rows. */
export const QAP_LEVELS = [0.05, 0.2, 0.6, 0.9];

/** The IUGS plutonic fields (Q, A, P), from their boundaries. */
export const QAP_FIELDS: TernaryField[] = [
  {
    code: '1a',
    name: 'quartzolite',
    poly: [
      [0.9, 0.1, 0],
      [1, 0, 0],
      [0.9, 0, 0.1],
    ],
  },
  { code: '1b', name: 'quartz-rich granitoid', poly: band(0.6, 0.9, 0, 1) },
  ...QAP_ROWS.flatMap(([q0, q1, codes, names]) =>
    codes.map((code, i) => ({
      code,
      name: names[i]!,
      poly: band(q0, q1, QAP_SHARES[i]!, QAP_SHARES[i + 1]!),
    })),
  ),
];

/** The plagioclase names by An ÷ (Ab + An), with their bounds (%). */
export const PLAGIOCLASE: [number, number, string][] = [
  [0, 10, 'albite'],
  [10, 30, 'oligoclase'],
  [30, 50, 'andesine'],
  [50, 70, 'labradorite'],
  [70, 90, 'bytownite'],
  [90, 100, 'anorthite'],
];
/** Plagioclase holds up to this share of Or, the alkali feldspars up to this share of An. */
export const FELDSPAR_EDGE = 0.1;
/** The anorthoclase–sanidine split, Or ÷ (Or + Ab). */
export const ANORTHOCLASE_TO = 0.37;

/** The feldspar fields (Or, Ab, An), drawn straight. */
export const FELDSPAR_FIELDS: TernaryField[] = [
  ...PLAGIOCLASE.map(([s0, s1, name]) => ({
    code: name,
    name: `${name} (plagioclase, An${sub(s0)}–An${sub(s1)})`,
    poly: band(0, FELDSPAR_EDGE, s0 / 100, s1 / 100),
  })),
  {
    code: 'anorthoclase',
    name: 'anorthoclase (an alkali feldspar)',
    poly: [
      [FELDSPAR_EDGE, 1 - FELDSPAR_EDGE, 0],
      [ANORTHOCLASE_TO, 1 - ANORTHOCLASE_TO, 0],
      orAt(ANORTHOCLASE_TO),
      [FELDSPAR_EDGE, 1 - 2 * FELDSPAR_EDGE, FELDSPAR_EDGE],
    ],
  },
  {
    code: 'sanidine',
    name: 'sanidine or orthoclase (an alkali feldspar)',
    poly: [
      [ANORTHOCLASE_TO, 1 - ANORTHOCLASE_TO, 0],
      [1, 0, 0],
      [1 - FELDSPAR_EDGE, 0, FELDSPAR_EDGE],
      orAt(ANORTHOCLASE_TO),
    ],
  },
  {
    code: 'gap',
    name: 'no single feldspar: two feldspars grow instead (the miscibility gap)',
    poly: [
      [FELDSPAR_EDGE, 1 - 2 * FELDSPAR_EDGE, FELDSPAR_EDGE],
      [1 - FELDSPAR_EDGE, 0, FELDSPAR_EDGE],
      [FELDSPAR_EDGE, 0, 1 - FELDSPAR_EDGE],
    ],
  },
];

/** The point of the An = 10 % line with Or ÷ (Or + Ab) = s. */
function orAt(s: number): Bary {
  const rest = 1 - FELDSPAR_EDGE;
  return [rest * s, rest * (1 - s), FELDSPAR_EDGE];
}

/** A whole number as subscript digits: 50 → ₅₀. */
export function sub(n: number): string {
  return [...String(Math.round(n))].map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)] ?? d).join('');
}

/** The three amounts as fractions of their sum, or nothing (an amount below 0, a sum of 0). */
export function normalize(a: number, b: number, c: number): Bary | undefined {
  const s = a + b + c;
  if (!(s > 0) || a < 0 || b < 0 || c < 0) return undefined;
  return [a / s, b / s, c / s];
}

/** The field a point falls in, by the classification's rules (not by its drawn shape). */
export function ternaryField(fields: 'qap' | 'feldspar', p: Bary): TernaryField {
  const [a, b, c] = p;
  const share = b + c > 0 ? c / (b + c) : 0;
  const eps = 1e-9;
  const find = (code: string) =>
    (fields === 'qap' ? QAP_FIELDS : FELDSPAR_FIELDS).find((f) => f.code === code)!;
  const col = (cut: number[]) => {
    let i = 0;
    while (i < cut.length - 2 && share >= cut[i + 1]! - eps) i++;
    return i;
  };
  if (fields === 'qap') {
    if (a >= 0.9 - eps) return find('1a');
    if (a >= 0.6 - eps) return find('1b');
    const row = a >= 0.2 - eps ? 0 : a >= 0.05 - eps ? 1 : 2;
    return find(QAP_ROWS[row]![2][col(QAP_SHARES)]!);
  }
  if (a <= FELDSPAR_EDGE + eps) return find(PLAGIOCLASE[col([0, 0.1, 0.3, 0.5, 0.7, 0.9, 1])]![2]);
  if (c <= FELDSPAR_EDGE + eps)
    return find(a / (a + b) < ANORTHOCLASE_TO ? 'anorthoclase' : 'sanidine');
  return find('gap');
}

/** Whether a point lies in a polygon of the unit triangle (on its edge counts). */
export function inPolygon(p: Bary, poly: Bary[]): boolean {
  const [x, y] = baryXY(p);
  const pts = poly.map(baryXY);
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!;
    const [x2, y2] = pts[(i + 1) % pts.length]!;
    const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
    if (Math.abs(cross) < 1e-9) continue;
    if (sign === 0) sign = Math.sign(cross);
    else if (Math.sign(cross) !== sign) return false;
  }
  return true;
}

/** A polygon's centroid (its corners' mean is enough for these convex fields). */
export function centroid(poly: Bary[]): Bary {
  const n = poly.length;
  return [0, 1, 2].map((k) => poly.reduce((s, p) => s + p[k]!, 0) / n) as Bary;
}

// ─── HC119: earthLayers rupture ─────────────────────────────────────────────────

/** Seismic moment M₀ = μLWD in N·m, from μ in GPa, L and W in km and D in m. */
export const momentOf = (mu: number, L: number, W: number, D: number) =>
  mu * 1e9 * (L * 1e3) * (W * 1e3) * D;

/** Moment magnitude Mw = (2 ÷ 3)(log₁₀ M₀ − 9.1), M₀ in N·m. */
export const magnitudeOf = (m0: number) => (2 / 3) * (Math.log10(m0) - 9.1);

/** The rupture patch drawn in a face `fw` × `fh` px: L × W to one scale, filling the face. */
export function ruptureRect(L: number, W: number, fw: number, fh: number) {
  const k = Math.max(L / fw, W / fh);
  return { w: L / k, h: W / k };
}
