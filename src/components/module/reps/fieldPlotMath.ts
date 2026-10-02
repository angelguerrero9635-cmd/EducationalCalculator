/**
 * HC21 `fieldPlot` (college round 2, group G): the arithmetic the field pictures draw, free of
 * React so the harness checks the same numbers. Expressions in x and y use the HC10 grammar
 * (`exprHe1e.ts`), evaluated here with both coordinates. Euler's polyline (`eulerSteps`) is
 * shared with HC45's Newton and Euler pages.
 */
import type { FieldPath, FieldPlotSpec } from '@/data/modules/typesHe2g';
import type { NumOrVar } from '@/data/modules/typesGraphs';

import { parseExpr, type ExprFunc, type ExprNode } from './exprHe1e';

export type Vec = [number, number];
export type Get = (v: NumOrVar | undefined, fallback: number) => number;

const FN: Record<ExprFunc, (x: number) => number> = {
  exp: Math.exp,
  ln: (x) => (x > 0 ? Math.log(x) : NaN),
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
  abs: Math.abs,
  u: (x) => (x >= 0 ? 1 : 0),
};

/** A tree's value with every name read through `env` (the coordinates and the page's values). */
export function evalNode(n: ExprNode, env: (name: string) => number): number {
  switch (n.t) {
    case 'num':
      return n.v;
    case 'name':
      return env(n.name);
    case 'neg':
      return -evalNode(n.a, env);
    case 'call':
      return FN[n.fn](evalNode(n.a, env));
    case 'bin': {
      const [a, b] = [evalNode(n.a, env), evalNode(n.b, env)];
      switch (n.op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          return b === 0 ? NaN : a / b;
        case '^':
          return a < 0 && !Number.isInteger(b) ? NaN : a ** b;
      }
    }
  }
}

/** g(x, y) from an expression in x and y, the other names the page's values (NaN unparsed). */
export function fieldFn(src: string | undefined, get: Get): (x: number, y: number) => number {
  if (src === undefined) return () => NaN;
  let tree: ExprNode;
  try {
    tree = parseExpr(src);
  } catch {
    return () => NaN;
  }
  const vals = new Map<string, number>();
  const read = (name: string) => {
    if (!vals.has(name)) vals.set(name, get(name, NaN));
    return vals.get(name)!;
  };
  return (x, y) => evalNode(tree, (name) => (name === 'x' ? x : name === 'y' ? y : read(name)));
}

// ─── Slope fields ──────────────────────────────────────────────────────────────

/** Euler's method: n steps of h from (x₀, y₀) along y′ = g(x, y); the n + 1 points. */
export function eulerSteps(
  g: (x: number, y: number) => number,
  x0: number,
  y0: number,
  h: number,
  n: number,
): Vec[] {
  const out: Vec[] = [[x0, y0]];
  let [x, y] = [x0, y0];
  for (let i = 0; i < Math.min(200, Math.max(0, Math.round(n))); i++) {
    y += h * g(x, y);
    x = x0 + (i + 1) * h;
    if (!Number.isFinite(y)) break;
    out.push([x, y]);
  }
  return out;
}

/** The solution of y′ = g(x, y) through (x₀, y₀) at x, by RK4 (many small steps). */
export function slopeSolution(
  g: (x: number, y: number) => number,
  x0: number,
  y0: number,
  x: number,
  steps = 2000,
): number {
  const h = (x - x0) / steps;
  let [t, y] = [x0, y0];
  for (let i = 0; i < steps; i++) {
    const k1 = g(t, y);
    const k2 = g(t + h / 2, y + (h / 2) * k1);
    const k3 = g(t + h / 2, y + (h / 2) * k2);
    const k4 = g(t + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t += h;
    if (!Number.isFinite(y)) return NaN;
  }
  return y;
}

/** The solution curve through (x₀, y₀) across [lo, hi], stopping where it leaves [yLo, yHi]. */
export function slopeCurve(
  g: (x: number, y: number) => number,
  x0: number,
  y0: number,
  lo: number,
  hi: number,
  yLo: number,
  yHi: number,
): Vec[] {
  const run = (to: number) => {
    const pts: Vec[] = [];
    const n = 240;
    const h = (to - x0) / n;
    let [t, y] = [x0, y0];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < 4; j++) {
        const s = h / 4;
        const k1 = g(t, y);
        const k2 = g(t + s / 2, y + (s / 2) * k1);
        const k3 = g(t + s / 2, y + (s / 2) * k2);
        const k4 = g(t + s, y + s * k3);
        y += (s / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        t += s;
      }
      if (!Number.isFinite(y)) break;
      pts.push([t, y]);
      if (y < yLo || y > yHi) break;
    }
    return pts;
  };
  return [...run(lo).reverse(), [x0, y0], ...run(hi)];
}

// ─── Vector fields and line integrals ─────────────────────────────────────────

/** A path's pieces: straight sides from → to, or a whole circle. */
export interface PathPiece {
  /** Where the piece is at t in [0, 1], and its velocity dr/dt. */
  r: (t: number) => Vec;
  dr: (t: number) => Vec;
  from: Vec;
  to: Vec;
  /** A circle's center and radius (a side has none). */
  circle?: { c: Vec; R: number };
}

/** The path as pieces in the order they're run (a rectangle counterclockwise from its corner). */
export function pathPieces(p: FieldPath, get: Get): PathPiece[] {
  const side = (a: Vec, b: Vec): PathPiece => ({
    r: (t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])],
    dr: () => [b[0] - a[0], b[1] - a[1]],
    from: a,
    to: b,
  });
  if (p.shape === 'segment')
    return [side([get(p.from[0], 0), get(p.from[1], 0)], [get(p.to[0], 1), get(p.to[1], 1)])];
  if (p.shape === 'rectangle') {
    const [x0, y0, w, h] = [get(p.x0, 0), get(p.y0, 0), get(p.width, 1), get(p.height, 1)];
    const c: Vec[] = [
      [x0, y0],
      [x0 + w, y0],
      [x0 + w, y0 + h],
      [x0, y0 + h],
    ];
    return [side(c[0]!, c[1]!), side(c[1]!, c[2]!), side(c[2]!, c[3]!), side(c[3]!, c[0]!)];
  }
  const [R, cx, cy] = [get(p.r, 1), get(p.cx, 0), get(p.cy, 0)];
  const T = 2 * Math.PI;
  return [
    {
      r: (t) => [cx + R * Math.cos(T * t), cy + R * Math.sin(T * t)],
      dr: (t) => [-R * T * Math.sin(T * t), R * T * Math.cos(T * t)],
      from: [cx + R, cy],
      to: [cx + R, cy],
      circle: { c: [cx, cy], R },
    },
  ];
}

/** ∫ F · dr along a piece, by Simpson's rule (exact for the polynomial fields on a side). */
export function pieceWork(
  P: (x: number, y: number) => number,
  Q: (x: number, y: number) => number,
  piece: PathPiece,
  n = 400,
): number {
  const g = (t: number) => {
    const [x, y] = piece.r(t);
    const [dx, dy] = piece.dr(t);
    return P(x, y) * dx + Q(x, y) * dy;
  };
  let s = g(0) + g(1);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(i / n);
  return s / (3 * n);
}

// ─── Linear systems ───────────────────────────────────────────────────────────

export interface Eigen {
  T: number;
  D: number;
  disc: number;
  /** Real eigenvalues (larger first) with their directions, or the complex pair re ± im·i. */
  real?: { l1: number; l2: number; v1: Vec; v2: Vec };
  complex?: { re: number; im: number };
  /** The equilibrium's type in words. */
  type: string;
}

const unit = (v: Vec): Vec => {
  const m = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / m, v[1] / m];
};

/** An eigenvector of [[a, b], [c, d]] for λ. */
function eigvec(a: number, b: number, c: number, d: number, l: number): Vec {
  if (Math.abs(b) > 1e-12) return unit([b, l - a]);
  if (Math.abs(c) > 1e-12) return unit([l - d, c]);
  return Math.abs(l - a) < Math.abs(l - d) ? [1, 0] : [0, 1];
}

/** Trace, determinant, eigenvalues and the type of x′ = Ax at the origin. */
export function eigen2(a: number, b: number, c: number, d: number): Eigen {
  const T = a + d;
  const D = a * d - b * c;
  const disc = T * T - 4 * D;
  const eps = 1e-10 * Math.max(1, T * T, Math.abs(D));
  const type =
    Math.abs(D) <= eps
      ? 'a line of equilibria (det A = 0)'
      : D < 0
        ? 'a saddle'
        : Math.abs(disc) <= eps
          ? T < 0
            ? 'a stable degenerate node'
            : 'an unstable degenerate node'
          : disc > 0
            ? T < 0
              ? 'a stable node'
              : 'an unstable node'
            : Math.abs(T) <= eps
              ? 'a center'
              : T < 0
                ? 'a stable spiral'
                : 'an unstable spiral';
  if (disc >= -eps) {
    const r = Math.sqrt(Math.max(0, disc));
    const [l1, l2] = [(T + r) / 2, (T - r) / 2];
    return {
      T,
      D,
      disc,
      real: { l1, l2, v1: eigvec(a, b, c, d, l1), v2: eigvec(a, b, c, d, l2) },
      type,
    };
  }
  return { T, D, disc, complex: { re: T / 2, im: Math.sqrt(-disc) / 2 }, type };
}

/** A trajectory of x′ = F(x) from p for time t (negative runs backward), by RK4. */
export function flowTo(f: (p: Vec) => Vec, p: Vec, t: number, steps = 2000): Vec {
  const h = t / steps;
  let [x, y] = p;
  for (let i = 0; i < steps; i++) {
    const k1 = f([x, y]);
    const k2 = f([x + (h / 2) * k1[0], y + (h / 2) * k1[1]]);
    const k3 = f([x + (h / 2) * k2[0], y + (h / 2) * k2[1]]);
    const k4 = f([x + h * k3[0], y + h * k3[1]]);
    x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  }
  return [x, y];
}

/** A trajectory as points, run until it leaves `box` (grown by half) or `tMax` passes. */
export function trajectory(
  f: (p: Vec) => Vec,
  p: Vec,
  dir: 1 | -1,
  box: { x: [number, number]; y: [number, number] },
  tMax = 40,
): Vec[] {
  const [bw, bh] = [box.x[1] - box.x[0], box.y[1] - box.y[0]];
  const out: Vec[] = [p];
  let q = p;
  // Steps small in the picture: by the field's speed, so slow and fast parts are both smooth.
  let t = 0;
  for (let i = 0; i < 4000 && t < tMax; i++) {
    const v = f(q);
    const speed = Math.hypot(v[0] / bw, v[1] / bh);
    if (!(speed > 1e-9)) break;
    const h = Math.min(0.05, 0.004 / speed);
    q = flowTo(f, q, dir * h, 4);
    t += h;
    if (!q.every(Number.isFinite)) break;
    out.push(q);
    if (
      q[0] < box.x[0] - bw / 2 ||
      q[0] > box.x[1] + bw / 2 ||
      q[1] < box.y[0] - bh / 2 ||
      q[1] > box.y[1] + bh / 2
    )
      break;
  }
  return out;
}

/** Lotka–Volterra: the equilibrium and the small-cycle period 2π ÷ √(αγ). */
export function lotkaNumbers(alpha: number, beta: number, gamma: number, delta: number) {
  return {
    x: gamma / delta,
    y: alpha / beta,
    period: (2 * Math.PI) / Math.sqrt(alpha * gamma),
  };
}

/** Competition: the crossing of the isoclines, and whether both species live there. */
export function competitionNumbers(K1: number, K2: number, alpha: number, beta: number) {
  const den = 1 - alpha * beta;
  const n1 = (K1 - alpha * K2) / den;
  const n2 = (K2 - beta * K1) / den;
  const coexist = den > 0 && n1 > 0 && n2 > 0;
  // With no stable crossing, the species whose isocline lies outside wins.
  const winner = coexist
    ? undefined
    : K1 > K2 / beta && K2 < K1 / alpha
      ? 1
      : K2 > K1 / alpha && K1 < K2 / beta
        ? 2
        : 0;
  return { n1, n2, coexist, winner };
}

// ─── The spec as numbers ──────────────────────────────────────────────────────

/** The field's flow F(x, y) for the phase and isocline modes (and the vector field's F). */
export function flowOf(spec: FieldPlotSpec, get: Get): ((p: Vec) => Vec) | undefined {
  if (spec.mode === 'phase' && spec.matrix) {
    const [a, b, c, d] = spec.matrix.map((m) => get(m, 0)) as [number, number, number, number];
    return ([x, y]) => [a * x + b * y, c * x + d * y];
  }
  if (spec.mode === 'phase' && spec.lotka) {
    const l = spec.lotka;
    const [al, be, ga, de] = [get(l.alpha, 1), get(l.beta, 1), get(l.gamma, 1), get(l.delta, 1)];
    return ([x, y]) => [al * x - be * x * y, -ga * y + de * x * y];
  }
  if (spec.mode === 'isoclines' && spec.competition) {
    const k = spec.competition;
    const [K1, K2, al, be] = [get(k.K1, 1), get(k.K2, 1), get(k.alpha, 1), get(k.beta, 1)];
    return ([x, y]) => [x * (1 - (x + al * y) / K1), y * (1 - (y + be * x) / K2)];
  }
  if (spec.mode === 'vector') {
    const [P, Q] = [fieldFn(spec.P, get), fieldFn(spec.Q, get)];
    return ([x, y]) => [P(x, y), Q(x, y)];
  }
  return undefined;
}

/** The point x(t) from `start` (phase mode), or undefined. */
export function phasePoint(spec: FieldPlotSpec, get: Get): Vec | undefined {
  const f = flowOf(spec, get);
  if (!f || !spec.start || spec.time === undefined) return undefined;
  return flowTo(f, [get(spec.start.x, 0), get(spec.start.y, 0)], get(spec.time, 0));
}

/** The Euler points (slope mode), or undefined. */
export function eulerOf(spec: FieldPlotSpec, get: Get): Vec[] | undefined {
  if (spec.mode !== 'slope' || !spec.euler || !spec.start) return undefined;
  return eulerSteps(
    fieldFn(spec.dy, get),
    get(spec.start.x, 0),
    get(spec.start.y, 0),
    get(spec.euler.h, 0.1),
    get(spec.euler.n, 1),
  );
}

/** A window from lo to hi with a margin (never empty). */
const pad = (lo: number, hi: number, by = 0.12): [number, number] => {
  if (!(hi > lo)) return [lo - 1, hi + 1];
  const m = (hi - lo) * by;
  return [lo - m, hi + m];
};

/** The window the field is drawn on, from the values. */
export function fieldWindow(
  spec: FieldPlotSpec,
  get: Get,
): { x: [number, number]; y: [number, number] } {
  const fixed = spec.window;
  const out = (x: [number, number], y: [number, number]) => ({
    x: fixed?.x ?? x,
    y: fixed?.y ?? y,
  });
  if (spec.mode === 'slope') {
    const g = fieldFn(spec.dy, get);
    const [x0, y0] = spec.start ? [get(spec.start.x, 0), get(spec.start.y, 0)] : [0, 0];
    const len = spec.euler ? get(spec.euler.h, 0.1) * get(spec.euler.n, 1) : 2;
    const [a, b] = len > 0 ? [x0, x0 + len] : [x0 + len, x0];
    const x = pad(a, b, 0.25);
    const ys = [y0];
    for (const [, y] of eulerOf(spec, get) ?? []) ys.push(y);
    for (let i = 0; i <= 20; i++) {
      const y = slopeSolution(g, x0, y0, x[0] + ((x[1] - x[0]) * i) / 20, 200);
      if (Number.isFinite(y)) ys.push(y);
    }
    const [ylo, yhi] = [Math.min(...ys), Math.max(...ys)];
    const span = Math.max(yhi - ylo, (x[1] - x[0]) * 0.6, 1e-6);
    const mid = (ylo + yhi) / 2;
    return out(x, pad(mid - span / 2, mid + span / 2, 0.2));
  }
  if (spec.mode === 'vector' && spec.path) {
    const pts = pathPieces(spec.path, get).flatMap((p) =>
      p.circle
        ? [
            [p.circle.c[0] - p.circle.R, p.circle.c[1] - p.circle.R] as Vec,
            [p.circle.c[0] + p.circle.R, p.circle.c[1] + p.circle.R] as Vec,
          ]
        : [p.from, p.to],
    );
    const xs = [0, ...pts.map((p) => p[0])];
    const ys = [0, ...pts.map((p) => p[1])];
    const [xl, xh, yl, yh] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const span = Math.max(xh - xl, yh - yl, 1);
    const [cx, cy] = [(xl + xh) / 2, (yl + yh) / 2];
    return out(pad(cx - span / 2, cx + span / 2, 0.3), pad(cy - span / 2, cy + span / 2, 0.3));
  }
  if (spec.mode === 'phase' && spec.lotka) {
    const l = spec.lotka;
    const e = lotkaNumbers(get(l.alpha, 1), get(l.beta, 1), get(l.gamma, 1), get(l.delta, 1));
    return out([0, Math.max(1e-6, e.x * 2.6)], [0, Math.max(1e-6, e.y * 2.6)]);
  }
  if (spec.mode === 'isoclines' && spec.competition) {
    const k = spec.competition;
    const [K1, K2, al, be] = [get(k.K1, 1), get(k.K2, 1), get(k.alpha, 1), get(k.beta, 1)];
    const xs = [K1, K2 / be].filter((v) => Number.isFinite(v) && v > 0);
    const ys = [K2, K1 / al].filter((v) => Number.isFinite(v) && v > 0);
    return out([0, Math.max(1, ...xs) * 1.12], [0, Math.max(1, ...ys) * 1.12]);
  }
  // A linear system: square about the origin, wide enough for x(0) and x(t).
  const pts: Vec[] = [];
  if (spec.start) pts.push([get(spec.start.x, 0), get(spec.start.y, 0)]);
  const q = phasePoint(spec, get);
  if (q && q.every(Number.isFinite)) pts.push(q);
  const r = Math.max(3, ...pts.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])) * 1.15));
  return out([-r, r], [-r, r]);
}
