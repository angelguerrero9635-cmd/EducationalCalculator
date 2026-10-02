/**
 * The beam behind the `beam` picture (HC1): reactions by the stiffness method (so a propped
 * cantilever, a fixed–fixed span and a continuous beam solve as easily as a simple span), the
 * shear V(x) and moment M(x) by statics from the left end, the bent shape from M ÷ EI, influence
 * lines by moving a load of 1 along, moment distribution, and buckled column shapes. Pure: the
 * picture and its harness check (`harness/picturesHe1a.ts`) share it.
 *
 * Signs: x from the left end; loads push down when positive; reactions + up; a support's
 * moment + counterclockwise; V and M by the "smile" convention (V = Σ upward forces left of the
 * cut, M > 0 sagging); deflection + up. EI = 1: shapes are drawn scaled, never measured.
 */

export type SupportKind = 'pin' | 'roller' | 'fixed';

export interface BeamPoint {
  kind: 'point';
  x: number;
  P: number;
}

/** A load spread from a to b, w going straight from wa to wb (a uniform load has wa = wb). */
export interface BeamSpread {
  kind: 'spread';
  a: number;
  b: number;
  wa: number;
  wb: number;
}

export type BeamLoadModel = BeamPoint | BeamSpread;

export interface BeamModel {
  L: number;
  supports: { x: number; kind: SupportKind }[];
  loads: BeamLoadModel[];
}

export interface BeamSolution {
  /** False when the supports can't hold the beam (it would swing or slide). */
  ok: boolean;
  /** Vertical reactions, one per support, + up. */
  R: number[];
  /** Support moments, + counterclockwise (0 where a support can't take one). */
  Mr: number[];
  /** Shear just right of x (just left at x = L). */
  V: (x: number) => number;
  /** Bending moment at x. */
  M: (x: number) => number;
  /** The bent shape at x with EI = 1 (+ up), and its slope. */
  y: (x: number) => number;
  slope: (x: number) => number;
}

const near = (a: number, b: number, L: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, L);

/** Solves A x = b by Gaussian elimination with partial pivoting; undefined when singular. */
function solveLinear(A: number[][], b: number[]): number[] | undefined {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i]!]);
  const scale = Math.max(1e-300, ...A.flat().map(Math.abs));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r]![c]!) > Math.abs(m[p]![c]!)) p = r;
    if (Math.abs(m[p]![c]!) < 1e-10 * scale) return undefined;
    [m[c], m[p]] = [m[p]!, m[c]!];
    for (let r = c + 1; r < n; r++) {
      const f = m[r]![c]! / m[c]![c]!;
      for (let k = c; k <= n; k++) m[r]![k]! -= f * m[c]![k]!;
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r]![n]!;
    for (let k = r + 1; k < n; k++) s -= m[r]![k]! * x[k]!;
    x[r] = s / m[r]![r]!;
  }
  return x;
}

/** The spread load's intensity at x (0 outside it). */
const spreadAt = (l: BeamSpread, x: number) =>
  x < l.a || x > l.b || l.b <= l.a ? 0 : l.wa + ((l.wb - l.wa) * (x - l.a)) / (l.b - l.a);

/** ∫ from 0 to x of the spread load, and of the load times its arm to x. */
function spreadUpTo(l: BeamSpread, x: number): { F: number; M: number } {
  if (x <= l.a || l.b <= l.a) return { F: 0, M: 0 };
  const D = l.b - l.a;
  const k = (l.wb - l.wa) / D;
  const T = Math.min(x, l.b) - l.a;
  const X = x - l.a;
  return {
    F: l.wa * T + (k * T * T) / 2,
    M: l.wa * (X * T - (T * T) / 2) + k * ((X * T * T) / 2 - (T * T * T) / 3),
  };
}

/** The total of every load (down +) and its moment about x = 0. */
export function loadTotals(loads: BeamLoadModel[]): { F: number; M0: number } {
  let F = 0;
  let M0 = 0;
  for (const l of loads) {
    if (l.kind === 'point') {
      F += l.P;
      M0 += l.P * l.x;
    } else {
      const D = l.b - l.a;
      if (D <= 0) continue;
      const f = ((l.wa + l.wb) / 2) * D;
      // The centroid of a trapezoid of load, from a.
      const xc = l.wa + l.wb === 0 ? D / 2 : (D * (l.wa + 2 * l.wb)) / (3 * (l.wa + l.wb));
      F += f;
      M0 += f * (l.a + xc);
    }
  }
  return { F, M0 };
}

/** Reactions, V, M and the bent shape of a beam on its supports. */
export function solveBeam(model: BeamModel): BeamSolution {
  const { L } = model;
  const xs: number[] = [0, L, ...model.supports.map((s) => s.x)];
  for (const l of model.loads) {
    if (l.kind === 'point') xs.push(l.x);
    else xs.push(l.a, l.b);
  }
  const nodes = xs
    .map((x) => Math.min(L, Math.max(0, x)))
    .sort((a, b) => a - b)
    .filter((x, i, arr) => i === 0 || !near(x, arr[i - 1]!, L));
  const n = nodes.length;
  const dof = 2 * n;
  const K = Array.from({ length: dof }, () => new Array<number>(dof).fill(0));
  const F = new Array<number>(dof).fill(0);
  const nodeOf = (x: number) => nodes.findIndex((p) => near(p, x, L));

  for (let e = 0; e < n - 1; e++) {
    const h = nodes[e + 1]! - nodes[e]!;
    const k = [
      [12 / h ** 3, 6 / h ** 2, -12 / h ** 3, 6 / h ** 2],
      [6 / h ** 2, 4 / h, -6 / h ** 2, 2 / h],
      [-12 / h ** 3, -6 / h ** 2, 12 / h ** 3, -6 / h ** 2],
      [6 / h ** 2, 2 / h, -6 / h ** 2, 4 / h],
    ];
    const map = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[map[i]!]![map[j]!]! += k[i]![j]!;
    // Spread loads over this element: the fixed-end forces of a straight-varying load.
    const [x1, x2] = [nodes[e]!, nodes[e + 1]!];
    for (const l of model.loads) {
      if (l.kind !== 'spread' || x2 <= l.a + 1e-12 || x1 >= l.b - 1e-12) continue;
      const q1 = spreadAt(l, x1 + 1e-12 * h);
      const q2 = spreadAt(l, x2 - 1e-12 * h);
      F[map[0]!]! -= (h * (7 * q1 + 3 * q2)) / 20;
      F[map[1]!]! -= (h * h * (3 * q1 + 2 * q2)) / 60;
      F[map[2]!]! -= (h * (3 * q1 + 7 * q2)) / 20;
      F[map[3]!]! += (h * h * (2 * q1 + 3 * q2)) / 60;
    }
  }
  for (const l of model.loads) if (l.kind === 'point') F[2 * nodeOf(l.x)]! -= l.P;

  const held = new Set<number>();
  for (const s of model.supports) {
    const i = nodeOf(Math.min(L, Math.max(0, s.x)));
    held.add(2 * i);
    if (s.kind === 'fixed') held.add(2 * i + 1);
  }
  const free = [...Array(dof).keys()].filter((i) => !held.has(i));
  const d = new Array<number>(dof).fill(0);
  let ok = held.size > 0;
  if (ok && free.length) {
    const sol = solveLinear(
      free.map((i) => free.map((j) => K[i]![j]!)),
      free.map((i) => F[i]!),
    );
    if (!sol) ok = false;
    else free.forEach((i, k) => (d[i] = sol[k]!));
  }
  // A single pin or roller (or none) can't hold a beam: the load would turn it.
  const rows = new Set(model.supports.map((s) => (s.kind === 'fixed' ? 2 : 1)));
  if (model.supports.length === 1 && !rows.has(2)) ok = false;

  const force = (i: number) => K[i]!.reduce((s, kij, j) => s + kij * d[j]!, 0) - F[i]!;
  const R = model.supports.map((s) => (ok ? force(2 * nodeOf(Math.min(L, Math.max(0, s.x)))) : 0));
  const Mr = model.supports.map((s) =>
    ok && s.kind === 'fixed' ? force(2 * nodeOf(Math.min(L, Math.max(0, s.x))) + 1) : 0,
  );

  const sx = model.supports.map((s) => Math.min(L, Math.max(0, s.x)));
  const left = (p: number, x: number, right: boolean) => (right ? p <= x + 1e-12 : p < x - 1e-12);
  const VM = (x: number, rightSide = true) => {
    let V = 0;
    let M = 0;
    sx.forEach((p, i) => {
      if (!left(p, x, rightSide)) return;
      V += R[i]!;
      M += R[i]! * (x - p) - Mr[i]!;
    });
    for (const l of model.loads) {
      if (l.kind === 'point') {
        if (!left(l.x, x, rightSide)) continue;
        V -= l.P;
        M -= l.P * (x - l.x);
      } else {
        const s = spreadUpTo(l, x);
        V -= s.F;
        M -= s.M;
      }
    }
    return { V, M };
  };
  const V = (x: number) => VM(x, x < L - 1e-12).V;
  // M at x = L is the moment just left of the end: what stands at L acts on no arm but its own.
  const M = (x: number) => VM(x, x < L - 1e-12).M;

  // The bent shape: integrate M (EI = 1) across each element, starting from the stiffness
  // method's deflection and slope at its left node, so it meets every support exactly.
  const SUB = 48;
  const table: { x: number; y: number; t: number }[] = [];
  for (let e = 0; e < n - 1; e++) {
    const [x1, x2] = [nodes[e]!, nodes[e + 1]!];
    let y = d[2 * e]!;
    let t = d[2 * e + 1]!;
    let mPrev = M(x1);
    table.push({ x: x1, y, t });
    for (let k = 1; k <= SUB; k++) {
      const dx = (x2 - x1) / SUB;
      const x = x1 + dx * k;
      const m = M(x);
      // Exact while M is straight across the step: y gains t·dx + dx²(2M₀ + M₁) ÷ 6.
      y += t * dx + (dx * dx * (2 * mPrev + m)) / 6;
      t += ((mPrev + m) / 2) * dx;
      mPrev = m;
      if (k < SUB) table.push({ x, y, t });
    }
  }
  table.push({ x: L, y: d[2 * (n - 1)]!, t: d[2 * (n - 1) + 1]! });
  const lookup = (x: number, key: 'y' | 't') => {
    if (!ok) return 0;
    const i = table.findIndex((p) => p.x >= x - 1e-12);
    if (i <= 0) return table[0]![key];
    const [a, b] = [table[i - 1]!, table[i]!];
    const f = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
    return a[key] + (b[key] - a[key]) * f;
  };
  return {
    ok,
    R,
    Mr,
    V: (x) => (ok ? V(x) : 0),
    M: (x) => (ok ? M(x) : 0),
    y: (x) => lookup(x, 'y'),
    slope: (x) => lookup(x, 't'),
  };
}

/** Where V and M jump or bend: the ends, supports, point loads and the ends of spread loads. */
export function keyPoints(model: BeamModel): number[] {
  const xs = [0, model.L, ...model.supports.map((s) => s.x)];
  for (const l of model.loads) {
    if (l.kind === 'point') xs.push(l.x);
    else xs.push(l.a, l.b);
  }
  return xs
    .map((x) => Math.min(model.L, Math.max(0, x)))
    .sort((a, b) => a - b)
    .filter((x, i, arr) => i === 0 || !near(x, arr[i - 1]!, model.L));
}

/**
 * Samples of V and M for drawing: each key point twice (just left and just right, so jumps are
 * vertical), and `per` points between.
 */
export function diagramSamples(model: BeamModel, sol: BeamSolution, per = 40) {
  const keys = keyPoints(model);
  const out: { x: number; V: number; M: number }[] = [];
  const eps = 1e-9 * Math.max(1, model.L);
  for (let i = 0; i < keys.length; i++) {
    const x = keys[i]!;
    if (i > 0) out.push({ x, V: sol.V(x - eps), M: sol.M(x) });
    if (i < keys.length - 1) {
      out.push({ x, V: sol.V(x), M: sol.M(x) });
      const nx = keys[i + 1]!;
      for (let k = 1; k < per; k++) {
        const xi = x + ((nx - x) * k) / per;
        out.push({ x: xi, V: sol.V(xi), M: sol.M(xi) });
      }
    }
  }
  return out;
}

/** The largest |V| and |M| and where they are, and where V crosses zero inside the span. */
export function extremes(model: BeamModel, sol: BeamSolution) {
  const s = diagramSamples(model, sol, 200);
  let vMax = s[0]!;
  let mMax = s[0]!;
  for (const p of s) {
    if (Math.abs(p.V) > Math.abs(vMax.V) + 1e-12) vMax = p;
    if (Math.abs(p.M) > Math.abs(mMax.M) + 1e-12) mMax = p;
  }
  // Refine the moment's peak: where V changes sign between samples (or jumps through 0).
  const crossings: number[] = [];
  for (let i = 1; i < s.length; i++) {
    const [a, b] = [s[i - 1]!, s[i]!];
    if ((a.V > 0 && b.V < 0) || (a.V < 0 && b.V > 0)) {
      const x = a.x === b.x ? a.x : a.x + ((b.x - a.x) * a.V) / (a.V - b.V);
      if (x > 1e-9 * model.L && x < model.L * (1 - 1e-9)) crossings.push(x);
    }
  }
  for (const x of crossings)
    if (Math.abs(sol.M(x)) > Math.abs(mMax.M)) mMax = { x, V: 0, M: sol.M(x) };
  return { vMax, mMax, crossings };
}

/** The largest deflection (by size) and where it is. */
export function maxDeflection(model: BeamModel, sol: BeamSolution) {
  let best = { x: 0, y: 0 };
  for (let k = 0; k <= 400; k++) {
    const x = (model.L * k) / 400;
    const y = sol.y(x);
    if (Math.abs(y) > Math.abs(best.y)) best = { x, y };
  }
  return best;
}

/**
 * The influence line: the reaction at support `support`, or the shear or moment at section
 * c, with a load of 1 standing at each of the sample points.
 */
export function influenceLine(
  model: BeamModel,
  of: 'reaction' | 'shear' | 'moment',
  c: number,
  count = 120,
): { x: number; y: number }[] {
  const { L } = model;
  const eps = 1e-6 * L;
  const xs = [...Array(count + 1).keys()].map((k) => (L * k) / count);
  for (const s of model.supports) xs.push(s.x);
  if (of !== 'reaction') xs.push(c - eps, c + eps);
  xs.sort((a, b) => a - b);
  const si = model.supports.findIndex((s) => near(s.x, c, L));
  return xs.map((x) => {
    const sol = solveBeam({ ...model, loads: [{ kind: 'point', x, P: 1 }] });
    if (!sol.ok) return { x, y: 0 };
    if (of === 'reaction') return { x, y: si >= 0 ? sol.R[si]! : 0 };
    if (of === 'moment') return { x, y: sol.M(c) };
    // Shear just right of c: a load left of c is in the free body, one right of it isn't.
    return { x, y: sol.V(c + (x <= c ? eps / 2 : -eps / 2)) };
  });
}

/** A buckled column's shape, 0 at the bottom: its sideways sway at height s (0 to 1 of L). */
export function bucklingShape(k: number, s: number): number {
  if (k === 2) return 1 - Math.cos((Math.PI * s) / 2); // fixed at the bottom, free on top
  if (k === 0.5) return (1 - Math.cos(2 * Math.PI * s)) / 2; // fixed–fixed
  if (k === 0.7) {
    // Fixed at the bottom, pinned on top: kL = 4.4934 (tan kL = kL).
    const kL = 4.493409457909064;
    const cot = 1 / Math.tan(kL);
    const w = (t: number) => -cot * Math.sin(kL * t) + Math.cos(kL * t) + kL * cot * t - 1;
    return w(s) / FIXED_PINNED_PEAK;
  }
  return Math.sin(Math.PI * s); // pinned–pinned
}

const FIXED_PINNED_PEAK = (() => {
  const kL = 4.493409457909064;
  const cot = 1 / Math.tan(kL);
  let peak = 0;
  for (let i = 0; i <= 2000; i++) {
    const t = i / 2000;
    const w = -cot * Math.sin(kL * t) + Math.cos(kL * t) + kL * cot * t - 1;
    if (Math.abs(w) > Math.abs(peak)) peak = w;
  }
  return peak;
})();

/**
 * The effective length's ends on the column (0 to 1 of L, or past 1 for a fixed–free column,
 * whose half-wave runs on through its mirror image above the free end): its inflection points,
 * or a pinned end.
 */
export function halfWave(k: number): [number, number] {
  if (k === 2) return [0, 2];
  if (k === 0.5) return [0.25, 0.75];
  if (k === 0.7) return [inflectionFixedPinned(), 1];
  return [0, 1];
}

function inflectionFixedPinned(): number {
  // Where w″ = 0 between the fixed bottom and the pinned top (w″ ∝ cot·sin kLt − cos kLt).
  const kL = 4.493409457909064;
  const cot = 1 / Math.tan(kL);
  const f = (t: number) => cot * Math.sin(kL * t) - Math.cos(kL * t);
  let [a, b] = [0.05, 0.6];
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2;
    if (Math.sign(f(m)) === Math.sign(f(a))) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/** The ends a K names: 0.5 fixed–fixed, 0.7 fixed–pinned, 1 pinned–pinned, 2 fixed–free. */
export function endsOfK(k: number): { bottom: 'fixed' | 'pin'; top: 'fixed' | 'pin' | 'free' } {
  if (k === 0.5) return { bottom: 'fixed', top: 'fixed' };
  if (k === 0.7) return { bottom: 'fixed', top: 'pin' };
  if (k === 2) return { bottom: 'fixed', top: 'free' };
  return { bottom: 'pin', top: 'pin' };
}

/** The nearest of the four K values a column's ends can make. */
export const nearestK = (k: number) =>
  [0.5, 0.7, 1, 2].reduce((best, x) => (Math.abs(x - k) < Math.abs(best - k) ? x : best), 1);

// ─── Moment distribution ────────────────────────────────────────────────────

export interface DistributionTable {
  /** Column names, member ends left to right: AB, BA, BC, CB … */
  ends: string[];
  /** Distribution factors (0 at a fixed end, 1 at a pinned end that is released). */
  df: number[];
  fem: number[];
  /** Balance and carry-over rows, in order, each named. */
  rows: { name: string; values: (number | undefined)[] }[];
  final: number[];
  /** Cycles run before every joint balanced within 0.1%. */
  cycles: number;
}

/**
 * Hardy Cross moment distribution for a beam whose supports are its span ends (2 or 3 spans,
 * every support a pin, roller or fixed end). End moments are clockwise + on the member. With
 * `far: 'pinned'`, an end span's pinned far end is released once and for all (stiffness 3 ÷ L,
 * fixed-end moment worked out with it released), so only the interior joints balance.
 */
export function momentDistribution(
  model: BeamModel,
  names: string[],
  far: 'pinned' | 'fixed' = 'fixed',
  maxCycles = 4,
): DistributionTable | undefined {
  const sup = [...model.supports].sort((a, b) => a.x - b.x);
  if (sup.length < 3) return undefined;
  const spans = sup.slice(1).map((s, i) => ({ a: sup[i]!, b: s, L: s.x - sup[i]!.x }));
  if (spans.some((s) => s.L <= 0)) return undefined;
  const ends: string[] = [];
  spans.forEach((_, i) => ends.push(`${names[i]}${names[i + 1]}`, `${names[i + 1]}${names[i]}`));

  // Fixed-end moments from a fixed–fixed span with only that span's loads.
  const fem: number[] = [];
  spans.forEach((s) => {
    const loads = clipLoads(model.loads, s.a.x, s.b.x);
    const sol = solveBeam({
      L: s.L,
      supports: [
        { x: 0, kind: 'fixed' },
        { x: s.L, kind: 'fixed' },
      ],
      loads,
    });
    fem.push(-sol.Mr[0]!, -sol.Mr[1]!);
  });
  const pinnedEnd = (j: number) => {
    // Member end j sits on the first or last support, which is a pin or roller.
    const support = j === 0 ? sup[0]! : j === ends.length - 1 ? sup[sup.length - 1]! : undefined;
    return !!support && support.kind !== 'fixed';
  };
  const released = (j: number) => far === 'pinned' && pinnedEnd(j);
  // Modified stiffness: a far end pinned and released gives 3 ÷ L and no carry-over to it.
  const stiff = ends.map((_, j) => {
    const span = spans[Math.floor(j / 2)]!;
    const other = j % 2 === 0 ? j + 1 : j - 1;
    return released(other) ? 3 / span.L : 4 / span.L;
  });
  if (far === 'pinned') {
    for (let j = 0; j < ends.length; j++) {
      if (!released(j)) continue;
      const other = j % 2 === 0 ? j + 1 : j - 1;
      fem[other] = fem[other]! - fem[j]! / 2;
      fem[j] = 0;
    }
  }
  // Joints: the member ends meeting at each support.
  const joints = sup.map((_, i) => [2 * i - 1, 2 * i].filter((j) => j >= 0 && j < ends.length));
  const df = new Array<number>(ends.length).fill(0);
  joints.forEach((js, i) => {
    const s = sup[i]!;
    const outer = i === 0 || i === sup.length - 1;
    if (outer && s.kind === 'fixed') return; // a wall takes what comes
    if (outer && far === 'pinned') return; // already released
    const total = js.reduce((t, j) => t + stiff[j]!, 0);
    js.forEach((j) => (df[j] = total > 0 ? stiff[j]! / total : 0));
  });

  const final = [...fem];
  const rows: DistributionTable['rows'] = [];
  let carry = new Array<number>(ends.length).fill(0);
  let cycles = 0;
  let pending = [...fem];
  for (let c = 0; c < 40; c++) {
    const bal = new Array<number>(ends.length).fill(0);
    let biggest = 0;
    joints.forEach((js) => {
      const unbalanced = js.reduce((t, j) => t + pending[j]!, 0);
      js.forEach((j) => (bal[j] = -df[j]! * unbalanced));
      if (js.some((j) => df[j]! > 0)) biggest = Math.max(biggest, Math.abs(unbalanced));
    });
    const scale = Math.max(1e-12, ...fem.map(Math.abs));
    if (biggest <= 1e-3 * scale) break;
    cycles++;
    carry = new Array<number>(ends.length).fill(0);
    bal.forEach((b, j) => {
      final[j] = final[j]! + b;
      const other = j % 2 === 0 ? j + 1 : j - 1;
      if (!released(other)) carry[other] = carry[other]! + b / 2;
    });
    carry.forEach((x, j) => (final[j] = final[j]! + x));
    if (c < maxCycles) {
      rows.push({
        name: `Balance ${c + 1}`,
        values: bal.map((b, j) => (df[j]! > 0 ? b : undefined)),
      });
      if (carry.some((x) => Math.abs(x) > 1e-12))
        rows.push({
          name: `Carry-over ${c + 1}`,
          values: carry.map((x) => (x === 0 ? undefined : x)),
        });
    }
    pending = carry;
  }
  return { ends, df, fem, rows, final, cycles };
}

/** The loads between x1 and x2, measured from x1 (spread loads cut at the span's ends). */
export function clipLoads(loads: BeamLoadModel[], x1: number, x2: number): BeamLoadModel[] {
  const out: BeamLoadModel[] = [];
  for (const l of loads) {
    if (l.kind === 'point') {
      if (l.x > x1 && l.x < x2) out.push({ ...l, x: l.x - x1 });
      continue;
    }
    const a = Math.max(l.a, x1);
    const b = Math.min(l.b, x2);
    if (b <= a) continue;
    out.push({ kind: 'spread', a: a - x1, b: b - x1, wa: spreadAt(l, a), wb: spreadAt(l, b) });
  }
  return out;
}
