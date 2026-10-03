/**
 * HC14 math (college round 2, group A): complex arithmetic, polynomial roots (Durand–Kerner, no
 * dependency), the root locus traced by K, its centroid, asymptotes and breakaway points, and
 * phasor tips (tip to tail). Shared by `ComplexPlaneHe2a.tsx` and the harness check, so the
 * picture and its check work from one set of numbers.
 */

export interface Cx {
  re: number;
  im: number;
}

const cx = (re: number, im = 0): Cx => ({ re, im });
export const cadd = (a: Cx, b: Cx): Cx => cx(a.re + b.re, a.im + b.im);
export const csub = (a: Cx, b: Cx): Cx => cx(a.re - b.re, a.im - b.im);
export const cmul = (a: Cx, b: Cx): Cx => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
export const cabs = (a: Cx) => Math.hypot(a.re, a.im);

/** A point and, when it is off the real axis, its conjugate. */
export const withConjugates = (ps: Cx[]): Cx[] =>
  ps.flatMap((p) => (Math.abs(p.im) > 1e-12 ? [p, cx(p.re, -p.im)] : [cx(p.re, 0)]));

/** Real coefficients (lowest power first) of Π(s − r) over roots closed under conjugation. */
export function polyOf(roots: Cx[]): number[] {
  let p: Cx[] = [cx(1)];
  for (const r of roots) {
    const next: Cx[] = Array.from({ length: p.length + 1 }, () => cx(0));
    p.forEach((c, i) => {
      next[i + 1] = cadd(next[i + 1]!, c);
      next[i] = csub(next[i]!, cmul(c, r));
    });
    p = next;
  }
  return p.map((c) => c.re);
}

/** p(s), coefficients lowest power first. */
export function polyAt(p: number[], s: Cx): Cx {
  let out = cx(0);
  for (let i = p.length - 1; i >= 0; i--) out = cadd(cmul(out, s), cx(p[i]!));
  return out;
}

/** The derivative's coefficients. */
export const polyDiff = (p: number[]) => p.slice(1).map((c, i) => c * (i + 1));

/** a·p + b·q. */
export function polyAdd(p: number[], q: number[], a = 1, b = 1): number[] {
  return Array.from(
    { length: Math.max(p.length, q.length) },
    (_, i) => a * (p[i] ?? 0) + b * (q[i] ?? 0),
  );
}

export function polyMul(p: number[], q: number[]): number[] {
  const out = Array.from({ length: p.length + q.length - 1 }, () => 0);
  p.forEach((a, i) => q.forEach((b, k) => (out[i + k]! += a * b)));
  return out;
}

/** Every root of a real polynomial (lowest power first), by Durand–Kerner. */
export function polyRoots(p: number[]): Cx[] {
  const c = [...p];
  while (c.length > 1 && Math.abs(c[c.length - 1]!) < 1e-14 * Math.max(...c.map(Math.abs))) c.pop();
  const n = c.length - 1;
  if (n < 1) return [];
  const lead = c[n]!;
  const a = c.map((x) => x / lead);
  // Cauchy's bound sets the starting circle.
  const radius = 1 + Math.max(...a.slice(0, n).map(Math.abs));
  let z: Cx[] = Array.from({ length: n }, (_, k) => {
    const t = (2 * Math.PI * k) / n + 0.4;
    return cx(radius * 0.9 * Math.cos(t), radius * 0.9 * Math.sin(t));
  });
  for (let it = 0; it < 800; it++) {
    let moved = 0;
    z = z.map((zi, i) => {
      let den = cx(1);
      z.forEach((zk, k) => {
        if (k !== i) den = cmul(den, csub(zi, zk));
      });
      if (cabs(den) === 0) den = cx(1e-12);
      const step = cdiv(polyAt(a, zi), den);
      moved = Math.max(moved, cabs(step) / (1 + cabs(zi)));
      return csub(zi, step);
    });
    if (moved < 1e-14) break;
  }
  // A root a hair off the axis is real.
  return z.map((r) => (Math.abs(r.im) < 1e-9 * (1 + Math.abs(r.re)) ? cx(r.re, 0) : r));
}

/** The closed-loop poles: the roots of D(s) + K·N(s). */
export function closedLoopPoles(poles: Cx[], zeros: Cx[], k: number): Cx[] {
  return sortRoots(polyRoots(polyAdd(polyOf(poles), polyOf(zeros), 1, k)));
}

/** Rightmost first, then the upper of a pair. */
export const sortRoots = (rs: Cx[]) =>
  [...rs].sort((a, b) => (Math.abs(b.re - a.re) > 1e-9 ? b.re - a.re : b.im - a.im));

/** The asymptotes' centroid (Σ poles − Σ zeros) ÷ (n − m), or undefined when n = m. */
export function centroidOf(poles: Cx[], zeros: Cx[]): number | undefined {
  const d = poles.length - zeros.length;
  if (d <= 0) return undefined;
  const sum = (xs: Cx[]) => xs.reduce((s, x) => s + x.re, 0);
  return (sum(poles) - sum(zeros)) / d;
}

/** The asymptote angles (2k + 1)·180° ÷ (n − m), in degrees from 0 up to 360. */
export function asymptoteAngles(poles: number, zeros: number): number[] {
  const d = poles - zeros;
  return d <= 0 ? [] : Array.from({ length: d }, (_, k) => ((2 * k + 1) * 180) / d);
}

/** Whether a point x on the real axis is on the locus (K > 0): an odd count of real poles
 * and zeros to its right. */
export function onRealLocus(x: number, poles: Cx[], zeros: Cx[]): boolean {
  const right = [...poles, ...zeros].filter(
    (p) => Math.abs(p.im) < 1e-12 && p.re > x + 1e-12,
  ).length;
  return right % 2 === 1;
}

/** K = −D(s) ÷ N(s) at a real s. */
export function gainAt(s: number, poles: Cx[], zeros: Cx[]): number {
  return -polyAt(polyOf(poles), cx(s)).re / polyAt(polyOf(zeros), cx(s)).re;
}

/**
 * The breakaway and break-in points: real roots of D′N − DN′ = 0 where K > 0 (on the locus),
 * rightmost first.
 */
export function breakawayPoints(poles: Cx[], zeros: Cx[]): number[] {
  const D = polyOf(poles);
  const N = polyOf(zeros);
  const f = polyAdd(polyMul(polyDiff(D), N), polyMul(D, polyDiff(N)), 1, -1);
  if (f.length < 2) return [];
  return polyRoots(f)
    .filter((r) => r.im === 0)
    .map((r) => r.re)
    .filter((x) => onRealLocus(x, poles, zeros) && gainAt(x, poles, zeros) > 0)
    .sort((a, b) => b - a);
}

/** One branch of the locus: its points and the gain at each. */
export interface Branch {
  pts: Cx[];
  ks: number[];
}

/**
 * The locus branches from K = 0 to `kMax` (log steps, halved where a root jumps more than
 * `maxStep`), each root followed to its nearest root at the next gain.
 */
export function traceLocus(poles: Cx[], zeros: Cx[], kMax: number, maxStep: number): Branch[] {
  const D = polyOf(poles);
  const N = polyOf(zeros);
  const rootsAt = (k: number) => polyRoots(polyAdd(D, N, 1, k));
  const start = sortRoots(poles);
  const branches: Branch[] = start.map((p) => ({ pts: [p], ks: [0] }));
  if (!branches.length) return branches;
  const match = (prev: Cx[], next: Cx[]) => {
    const left = [...next];
    return prev.map((p) => {
      let best = 0;
      left.forEach((q, i) => {
        if (cabs(csub(q, p)) < cabs(csub(left[best]!, p))) best = i;
      });
      return left.splice(best, 1)[0] ?? p;
    });
  };
  let last = branches.map((b) => b.pts[0]!);
  let kLast = 0;
  const push = (k: number, rs: Cx[]) => {
    rs.forEach((r, i) => {
      branches[i]!.pts.push(r);
      branches[i]!.ks.push(k);
    });
    last = rs;
    kLast = k;
  };
  const go = (k: number, depth: number) => {
    const rs = match(last, rootsAt(k));
    const jump = Math.max(...rs.map((r, i) => cabs(csub(r, last[i]!))));
    if (jump > maxStep && depth < 10) {
      const mid = kLast > 0 ? Math.sqrt(kLast * k) : k / 8;
      go(mid, depth + 1);
      go(k, depth + 1);
      return;
    }
    push(k, rs);
  };
  const steps = 160;
  const kMin = kMax * 1e-7;
  for (let i = 0; i <= steps; i++) go(kMin * (kMax / kMin) ** (i / steps), 0);
  return branches;
}

/** A segment of a polyline clipped to a box (Liang–Barsky), or undefined when outside. */
export function clipSegment(
  a: Cx,
  b: Cx,
  box: { x0: number; x1: number; y0: number; y1: number },
): [Cx, Cx] | undefined {
  let t0 = 0;
  let t1 = 1;
  const d = csub(b, a);
  const edges: [number, number][] = [
    [-d.re, a.re - box.x0],
    [d.re, box.x1 - a.re],
    [-d.im, a.im - box.y0],
    [d.im, box.y1 - a.im],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return undefined;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  if (t0 > t1) return undefined;
  return [cadd(a, cmul(d, cx(t0))), cadd(a, cmul(d, cx(t1)))];
}

// ─── Phasors ────────────────────────────────────────────────────────────────

/** A phasor with its values read: magnitude, angle in degrees (offset and sign applied). */
export interface PhasorValue {
  name: string;
  mag: number;
  angle: number;
  unit?: string;
  tail?: string;
  ends?: string;
}

/** The angle a phasor is drawn at: (−θ when negated) + offset. */
export const phasorAngle = (theta: number, negate?: boolean, offset = 0) =>
  (negate ? -theta : theta) + offset;

/** A phasor as a complex number in its own unit. */
export const phasorVector = (p: { mag: number; angle: number }): Cx => {
  const t = (p.angle * Math.PI) / 180;
  return cx(p.mag * Math.cos(t), p.mag * Math.sin(t));
};

/**
 * Where each phasor runs, in drawing units: phasors in the first phasor's unit at true length,
 * a second unit scaled so its longest is 0.6 of the first unit's longest; tip to tail from the
 * tail's tip.
 */
export function phasorLayout(ps: PhasorValue[]) {
  const main = ps[0]?.unit;
  const longest = (u: string | undefined) =>
    Math.max(0, ...ps.filter((p) => p.unit === u).map((p) => Math.abs(p.mag)));
  const big = longest(main) || 1;
  const scaleOf = (u: string | undefined) =>
    u === main ? 1 : longest(u) > 0 ? (0.6 * big) / longest(u) : 1;
  const out = new Map<string, { from: Cx; to: Cx; scale: number; own: boolean }>();
  for (const p of ps) {
    const scale = scaleOf(p.unit);
    const from = (p.tail && out.get(p.tail)?.to) || cx(0);
    const v = phasorVector(p);
    out.set(p.name, {
      from,
      to: cadd(from, cx(v.re * scale, v.im * scale)),
      scale,
      own: p.unit !== main,
    });
  }
  return out;
}
