/**
 * Numbers for the college `orbitalDiagram` options of round 4, group D (HC109, HC110;
 * `typesHe4d.ts`): a hydrogen-like ion's levels and radial distribution, and the d electrons of
 * a metal ion in a crystal field. No drawing, so the harness checks the same numbers.
 */

/** The Rydberg energy in eV (the plan's 13.6; a page may pass its own). */
export const RYDBERG = 13.6;
/** The Bohr radius in nm (0.0529 nm in the plan). */
export const BOHR_NM = 0.0529177;

/** Eₙ = −R∞Z² ÷ n² (eV) for a hydrogen-like ion of charge Z. */
export const hydrogenicEnergy = (Z: number, n: number, ryd = RYDBERG) => (-ryd * Z * Z) / (n * n);

/** Radial nodes n − l − 1, angular nodes l, and the n² orbitals of a shell. */
export const radialNodes = (n: number, l: number) => n - l - 1;
export const degeneracy = (n: number) => n * n;

/** ⟨r⟩ = (a₀ ÷ 2Z)(3n² − l(l + 1)), in a₀. */
export const meanRadius = (Z: number, n: number, l: number) => (3 * n * n - l * (l + 1)) / (2 * Z);

/** The most probable radius of an orbital with l = n − 1 (one hump): n²a₀ ÷ Z. */
export const peakRadiusTop = (Z: number, n: number) => (n * n) / Z;

/** The generalized Laguerre polynomial L_k^α(x), by its three-term recurrence. */
export function laguerre(k: number, alpha: number, x: number): number {
  if (k <= 0) return 1;
  let prev = 1;
  let cur = 1 + alpha - x;
  for (let j = 1; j < k; j++) {
    const next = ((2 * j + 1 + alpha - x) * cur - (j + alpha) * prev) / (j + 1);
    prev = cur;
    cur = next;
  }
  return cur;
}

/** Where P(r) has died away (a₀): well past the last hump for every n ≤ 10. */
export const radialReach = (Z: number, n: number) => (n * (2.2 * n + 9)) / Z;

/** The unnormalized radial function R(r) (r in a₀). */
function rawR(Z: number, n: number, l: number, r: number) {
  const rho = (2 * Z * r) / n;
  return rho ** l * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
}

/** Simpson's rule on [a, b] with an even number of steps. */
function simpson(f: (x: number) => number, a: number, b: number, steps = 2000) {
  const hh = (b - a) / steps;
  let s = f(a) + f(b);
  for (let i = 1; i < steps; i++) s += f(a + i * hh) * (i % 2 ? 4 : 2);
  return (s * hh) / 3;
}

const NORM = new Map<string, number>();

/** P(r) = r²R²(r), normalized so its area is 1 (r in a₀, P per a₀). */
export function radialP(Z: number, n: number, l: number): (r: number) => number {
  const key = `${Z},${n},${l}`;
  let k = NORM.get(key);
  if (k === undefined) {
    k = simpson((r) => r * r * rawR(Z, n, l, r) ** 2, 0, radialReach(Z, n));
    NORM.set(key, k);
  }
  const norm = k;
  return (r) => (r * r * rawR(Z, n, l, r) ** 2) / norm;
}

/** The area under P(r) from 0 to the reach (1 when normalized). */
export const radialArea = (Z: number, n: number, l: number) =>
  simpson(radialP(Z, n, l), 0, radialReach(Z, n));

/** ⟨r⟩ found by integrating rP(r), to check the formula. */
export const radialMeanNumeric = (Z: number, n: number, l: number) => {
  const P = radialP(Z, n, l);
  return simpson((r) => r * P(r), 0, radialReach(Z, n));
};

/** The radial nodes (a₀): the zeros of the Laguerre factor, found by sign changes. */
export function radialNodeRadii(Z: number, n: number, l: number): number[] {
  const k = n - l - 1;
  if (k <= 0) return [];
  const f = (rho: number) => laguerre(k, 2 * l + 1, rho);
  // Every zero of L_k^α lies below k + (k − 1)√(k + α) + α + 2 (a safe bound).
  const top = 4 * k + 2 * l + 8;
  const out: number[] = [];
  const steps = 4000;
  let x0 = 1e-9;
  let f0 = f(x0);
  for (let i = 1; i <= steps && out.length < k; i++) {
    const x1 = (top * i) / steps;
    const f1 = f(x1);
    if (f0 === 0 || f0 * f1 < 0) {
      let [a, b, fa] = [x0, x1, f0];
      for (let j = 0; j < 60; j++) {
        const m = (a + b) / 2;
        const fm = f(m);
        if (fa * fm <= 0) b = m;
        else [a, fa] = [m, fm];
      }
      out.push(((a + b) / 2) * (n / (2 * Z)));
    }
    [x0, f0] = [x1, f1];
  }
  return out;
}

/** The most probable radius (a₀): the tallest hump of P(r). */
export function peakRadius(Z: number, n: number, l: number): number {
  if (l === n - 1) return peakRadiusTop(Z, n);
  const P = radialP(Z, n, l);
  const reach = radialReach(Z, n);
  let best = 0;
  let bestP = -1;
  const steps = 3000;
  for (let i = 1; i <= steps; i++) {
    const r = (reach * i) / steps;
    const p = P(r);
    if (p > bestP) [best, bestP] = [r, p];
  }
  // Golden-section polish around the best sample.
  let [a, b] = [best - reach / steps, best + reach / steps];
  for (let j = 0; j < 60; j++) {
    const m1 = b - (b - a) * 0.618;
    const m2 = a + (b - a) * 0.618;
    if (P(m1) < P(m2)) a = m1;
    else b = m2;
  }
  return (a + b) / 2;
}

/** Subshell letters s, p, d, f, g … */
export const subshellLetter = (l: number) => 'spdfghik'[l] ?? `(l = ${l})`;

// ─── Crystal field (HC110) ───────────────────────────────────────────────────

export type FieldGeometry = 'octahedral' | 'tetrahedral' | 'squarePlanar';

/** One d level of a split set: its name, how many orbitals, and its energy in units of Δ. */
export interface FieldLevel {
  name: string;
  orbitals: number;
  /** Energy in units of the splitting Δ, the barycentre at 0. */
  at: number;
}

/** The split d levels, lowest first (energies in Δ). */
export function fieldLevels(geometry: FieldGeometry): FieldLevel[] {
  switch (geometry) {
    case 'tetrahedral':
      return [
        { name: 'e', orbitals: 2, at: -0.6 },
        { name: 't_2', orbitals: 3, at: 0.4 },
      ];
    case 'squarePlanar':
      // The usual relative energies, Δ the gap from d_xy to d_x²−y².
      return [
        { name: 'xz, yz', orbitals: 2, at: -0.514 },
        { name: 'z²', orbitals: 1, at: -0.428 },
        { name: 'xy', orbitals: 1, at: 0.228 },
        { name: 'x²−y²', orbitals: 1, at: 1.228 },
      ];
    default:
      return [
        { name: 't_2g', orbitals: 3, at: -0.4 },
        { name: 'e_g', orbitals: 2, at: 0.6 },
      ];
  }
}

export interface FieldFill {
  /** Electrons in each level, lowest first. */
  counts: number[];
  /** Per orbital of each level: 0, 1 (up) or 2 (a pair). */
  boxes: number[][];
  unpaired: number;
  pairs: number;
  /** Pairs beyond the free ion's (max(0, d − 5)). */
  extraPairs: number;
  low: boolean;
  /** CFSE = Σ(nᵢ × atᵢ)Δ + extra pairs × P. */
  cfse: number;
  /** Spin-only moment √(n(n + 2)) in BM. */
  moment: number;
}

/**
 * Fill d electrons one at a time: each goes where it costs least, into an empty orbital at its
 * level's energy or into a half-full one at that energy plus the pairing energy P. In an
 * octahedral field that is low spin exactly when Δₒ > P (d⁴–d⁷).
 */
export function fieldFill(
  d: number,
  split: number,
  pairing: number,
  geometry: FieldGeometry = 'octahedral',
): FieldFill {
  const levels = fieldLevels(geometry);
  const boxes = levels.map((lv) => Array<number>(lv.orbitals).fill(0));
  for (let e = 0; e < d; e++) {
    let best: [number, number] | undefined;
    let bestCost = Infinity;
    levels.forEach((lv, i) => {
      const empty = boxes[i]!.indexOf(0);
      const half = boxes[i]!.indexOf(1);
      if (empty >= 0 && lv.at * split < bestCost - 1e-9) {
        bestCost = lv.at * split;
        best = [i, empty];
      }
      if (half >= 0 && lv.at * split + pairing < bestCost - 1e-9) {
        bestCost = lv.at * split + pairing;
        best = [i, half];
      }
    });
    if (!best) break;
    const [i, k] = best;
    boxes[i]![k]! += 1;
  }
  const counts = boxes.map((b) => b.reduce((s, x) => s + x, 0));
  const unpaired = boxes.flat().filter((x) => x === 1).length;
  const pairs = boxes.flat().filter((x) => x === 2).length;
  const extraPairs = pairs - Math.max(0, d - 5);
  // High spin: every one of the five orbitals takes one electron before any pairs.
  const high = d <= 5 ? d : 10 - d;
  const cfse =
    levels.reduce((s, lv, i) => s + counts[i]! * lv.at, 0) * split + extraPairs * pairing;
  return {
    counts,
    boxes,
    unpaired,
    pairs,
    extraPairs,
    low: unpaired < high,
    cfse,
    moment: Math.sqrt(unpaired * (unpaired + 2)),
  };
}

/** "t_2g⁴ e_g²" style configuration of a fill. */
export function fieldConfig(levels: FieldLevel[], counts: number[]): string {
  const sup = (n: number) => [...String(n)].map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)]).join('');
  return levels
    .map((lv, i) =>
      counts[i]! > 0 ? `${lv.name.includes(',') ? `(${lv.name})` : lv.name}${sup(counts[i]!)}` : '',
    )
    .filter(Boolean)
    .join(' ');
}
