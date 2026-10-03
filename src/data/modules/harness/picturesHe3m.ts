/**
 * Harness checks for the college pictures, round 3, group M: `aquifer` (HC75), `refraction`
 * (HC76). Each check
 * recomputes what the picture draws, with the picture's own math, and compares it with the
 * page's values. Called from `pictures.ts`.
 */
import {
  WATER_GAMMA,
  discharge,
  exaggeration,
  gradient,
  pressureHead,
  seepage,
  thiemHead,
  thiemRate,
} from '@/components/module/reps/aquiferMath';

import {
  LIGHT_M_PER_NS,
  criticalAngle,
  crossoverOf,
  depthFromCrossover,
  headTime,
  interceptTime,
  radarDepth,
  radarSpeed,
  reflectionTime,
} from '@/components/module/reps/refractionMath';

import {
  bufferArea,
  meanCenter,
  shoelaceArea,
  shoelaceTerms,
  sidesCross,
  standardDistance,
} from '@/components/module/reps/gisMath';
import {
  PROPERTY,
  jacobian,
  parallelY,
  scaleFactors,
  type ProjectionName,
} from '@/components/module/reps/projectionMath';

import type { LayoutDef } from '../layouts';
import type {
  AquiferSpec,
  He3mSpec,
  PlaneGis,
  ProjectionCard,
  ProjectionSpec,
  RefractionSpec,
} from '../typesHe3m';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-9;

/** A checker bound to the page's values: `num` reads a field, `same` compares. */
function checker(val: Val) {
  const out: string[] = [];
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (what: string, shown: number | undefined, drawn: number, tol?: number) => {
    if (shown !== undefined && Number.isFinite(drawn) && !near(shown, drawn, tol))
      out.push(`${what} is drawn as ${drawn}, the value shows ${shown}`);
  };
  return { out, num, same };
}

export function aquiferIssues(rep: AquiferSpec, val: Val): string[] {
  const { out, num, same } = checker(val);
  switch (rep.mode) {
    case 'section': {
      const [dh, L, K, A, n] = [rep.drop, rep.length, rep.conductivity, rep.area, rep.porosity].map(
        num,
      );
      if (L !== undefined && L <= 0) out.push(`L = ${L}: the wells must be apart`);
      if (dh === undefined || L === undefined || L <= 0) break;
      const i = gradient(dh, L);
      same('i (Δh ÷ L)', num(rep.gradient), i);
      // The drawn slope is the gradient stretched × X, and gentle enough to read.
      const X = exaggeration(i * (rep.confined ? 1.4 : 1));
      if (
        Math.abs(i) >= 1e-6 &&
        Math.abs(i) <= 1e3 &&
        !(Math.abs(i * X) <= 0.25 + 1e-9 && Math.abs(i * X) >= 0.02)
      )
        out.push(`the water table is drawn at slope ${i * X}, too steep or too flat to read`);
      if (K !== undefined && A !== undefined) {
        const Q = discharge(K, A, i);
        same('Q = KAi', num(rep.discharge), Q);
        same('q = Q ÷ A', num(rep.flux), Q / A);
        if (n !== undefined && n > 0) {
          const v = seepage(Q / A, n);
          same('v = q ÷ n', num(rep.velocity), v);
          if (v !== 0) same('t = L ÷ v', num(rep.time), L / v);
          if (n < 1 && Math.abs(v) < Math.abs(Q / A)) out.push('the seepage velocity is below q');
        }
      }
      // Flow runs from high head to low: the arrows point toward the lower well.
      const Q = num(rep.discharge);
      if (Q !== undefined && Q !== 0 && Math.sign(Q) !== Math.sign(dh))
        out.push('Q points up the head gradient (water flows from high head to low)');
      break;
    }
    case 'head': {
      const [z, p, psi, h] = [rep.elevation, rep.pressure, rep.pressureHead, rep.head].map(num);
      const gamma = num(rep.weight) ?? WATER_GAMMA;
      if (gamma <= 0) out.push(`γ = ${gamma}: water's unit weight must be above 0`);
      const head = psi ?? (p !== undefined ? pressureHead(p, gamma) : undefined);
      if (p !== undefined && gamma > 0) same('ψ = p ÷ γ', psi, pressureHead(p, gamma));
      if (z !== undefined && head !== undefined) same('h = z + ψ', h, z + head);
      break;
    }
    case 'well': {
      const [b, r1, r2, h1, h2, Q, K] = [
        rep.thickness,
        rep.r1,
        rep.r2,
        rep.h1,
        rep.h2,
        rep.rate,
        rep.conductivity,
      ].map(num);
      if (r1 !== undefined && r2 !== undefined && !(r1 > 0 && r2 > r1))
        out.push(`r₁ = ${r1}, r₂ = ${r2}: the far well must be farther out (r₂ > r₁ > 0)`);
      if (b !== undefined && b <= 0) out.push(`b = ${b}: the aquifer has no thickness`);
      if ([r1, r2, h1, h2].some((x) => x === undefined) || !(r1! > 0 && r2! > r1!)) break;
      // The drawn cone passes both observed heads.
      same('the cone at r₁', h1, thiemHead(r1!, h1!, h2!, r1!, r2!), 1e-9);
      same('the cone at r₂', h2, thiemHead(r2!, h1!, h2!, r1!, r2!), 1e-9);
      // It rises outward (a pumped well draws the heads down toward it).
      if (h2! > h1! && !(thiemHead(r1! / 2, h1!, h2!, r1!, r2!) < h1!))
        out.push('the cone does not fall toward the well');
      if (K !== undefined && b !== undefined)
        same('Q (Thiem)', Q, thiemRate(K, b, h1!, h2!, r1!, r2!));
      break;
    }
  }
  return out;
}

/** Every group M picture kind's check (one call from `pictures.ts`). */
export function he3mIssues(rep: He3mSpec, val: Val): string[] {
  switch (rep.kind) {
    case 'aquifer':
      return aquiferIssues(rep, val);
    case 'refraction':
      return refractionIssues(rep, val);
    case 'projection':
      return projectionIssues(rep, val);
  }
}

export function refractionIssues(rep: RefractionSpec, val: Val): string[] {
  const { out, num, same } = checker(val);
  switch (rep.mode) {
    case 'refraction': {
      const [v1, v2, xc, h] = [rep.v1, rep.v2, rep.crossover, rep.depth].map(num);
      if (v1 === undefined || v2 === undefined) break;
      if (!(v2 > v1)) {
        out.push(`v₂ = ${v2} is not above v₁ = ${v1}: no head wave (the page should refuse it)`);
        break;
      }
      const ic = criticalAngle(v1, v2);
      same('i_c = sin⁻¹(v₁ ÷ v₂)', num(rep.critical), ic);
      const depth = h ?? (xc !== undefined ? depthFromCrossover(xc, v1, v2) : undefined);
      if (depth === undefined) break;
      if (xc !== undefined) same('h from x_c', h, depthFromCrossover(xc, v1, v2));
      // The two drawn time lines cross at x_c.
      const x = crossoverOf(depth, v1, v2);
      if (!near(x / v1, headTime(x, depth, v1, v2), 1e-9))
        out.push('the direct and head-wave lines do not cross at x_c');
      same('x_c (where the lines cross)', xc, x);
      // tᵢ in ms, as the page writes it.
      same('tᵢ = 2h cos i_c ÷ v₁ (ms)', num(rep.intercept), interceptTime(depth, v1, v2) * 1000);
      break;
    }
    case 'reflection': {
      const [h, v, x] = [rep.depth, rep.speed, rep.offset].map(num);
      if (h === undefined || v === undefined || !(h > 0 && v > 0)) break;
      same('t₀ = 2h ÷ v', num(rep.t0), (2 * h) / v);
      if (x === undefined) break;
      const t = reflectionTime(x, h, v);
      same('t(x) = √(x² + 4h²) ÷ v', num(rep.time), t);
      same('Δt = t − t₀', num(rep.moveout), t - (2 * h) / v);
      if (t < (2 * h) / v - 1e-12) out.push('the hyperbola dips below t₀');
      break;
    }
    case 'gpr': {
      const [eps, t] = [rep.permittivity, rep.time].map(num);
      const c = num(rep.light) ?? LIGHT_M_PER_NS;
      if (eps === undefined) break;
      if (eps < 1) out.push(`εᵣ = ${eps} is below 1 (air)`);
      const v = radarSpeed(eps, c);
      same('v = c ÷ √εᵣ', num(rep.speed), v);
      if (t !== undefined) same('d = vt ÷ 2', num(rep.depth), radarDepth(v, t));
      break;
    }
  }
  return out;
}

/**
 * HC77, the GIS options of `coordinatePlane`: the shoelace terms and area, 2rL + πr², the mean
 * centre and the standard distance, from the drawn points.
 */
export function planeGisIssues(
  rep: PlaneGis & {
    x: string;
    y: string;
    polygon?: [string | number, string | number][];
  },
  val: Val,
): string[] {
  const { out, num, same } = checker(val);
  const set = [rep.shoelace, rep.buffer, rep.center].filter(Boolean).length;
  if (set > 1) out.push(`a GIS plane sets one of shoelace, buffer, center (${set} set)`);
  const read = (pts: [string | number, string | number][]) => {
    const r = pts.map(([x, y]) => [num(x), num(y)] as const);
    return r.every(([x, y]) => x !== undefined && y !== undefined)
      ? (r as [number, number][])
      : undefined;
  };
  if (rep.shoelace) {
    if (!rep.polygon) out.push('shoelace needs the polygon’s vertices');
    const pts = rep.polygon ? read(rep.polygon) : undefined;
    if (pts) {
      if (sidesCross(pts)) out.push('two sides cross: the shoelace area is not the figure’s');
      // The listed terms add to twice the signed area.
      const sum = shoelaceTerms(pts).reduce((a, b) => a + b, 0);
      same('½|Σ terms|', shoelaceArea(pts), Math.abs(sum) / 2, 1e-9);
      same('the shoelace area', num(rep.shoelace.area), shoelaceArea(pts));
    }
  }
  if (rep.buffer) {
    const [L, r] = [num(rep.x), num(rep.y)];
    if (L !== undefined && L < 0) out.push(`L = ${L}: a line has no negative length`);
    if (r !== undefined && r <= 0) out.push(`r = ${r}: the buffer needs a radius`);
    if (L !== undefined && r !== undefined && L >= 0 && r > 0) {
      same('2rL + πr²', num(rep.buffer.area), bufferArea(L, r));
      // The drawn strip and the two half-discs make the same area.
      same('strip + ends', bufferArea(L, r), 2 * r * L + (2 * (Math.PI * r * r)) / 2, 1e-12);
    }
  }
  if (rep.center) {
    if (rep.center.points.length < 2) out.push('a mean centre needs at least two points');
    const pts = read(rep.center.points);
    if (pts) {
      const [mx, my] = meanCenter(pts);
      same('x̄', num(rep.center.x as string | number), mx);
      same('ȳ', num(rep.center.y as string | number), my);
      same('SD', num(rep.center.sd as string | number), standardDistance(pts));
    }
  }
  return out;
}

/** HC78: y(φ) by the projection's formula; the Tissot axes are k_E and k_N; area = k_E k_N. */
export function projectionIssues(rep: ProjectionSpec, val: Val): string[] {
  const { out, num, same } = checker(val);
  const lat = num(rep.latitude);
  if (lat === undefined) return out;
  if (Math.abs(lat) >= 90) {
    out.push(`φ = ${lat}: a pole never fits the cylinder`);
    return out;
  }
  if (rep.projection === 'mercator' && Math.abs(lat) > 85)
    out.push(`φ = ${lat}: the Mercator picture stops at 85°`);
  const R = num(rep.radius);
  if (R !== undefined) same('y(φ)', num(rep.y), parallelY(rep.projection, lat, R));
  const { kE, kN } = scaleFactors(rep.projection, lat);
  // The drawn ellipse (from the map's own Jacobian) has the formula's axes.
  const J = jacobian(rep.projection, lat, -150);
  if (!near(J.kE, kE, 1e-5) || !near(J.kN, kN, 1e-5))
    out.push(`the drawn Tissot axes ${J.kE}, ${J.kN} are not k_E = ${kE}, k_N = ${kN}`);
  same('k_E', num(rep.kE), kE);
  same('k_N', num(rep.kN), kN);
  same('the area factor k_E × k_N', num(rep.area), kE * kN);
  if (rep.projection === 'cylindricalEqualArea' && !near(kE * kN, 1, 1e-9))
    out.push('the equal-area projection’s k_E × k_N is not 1');
  return out;
}

/** What each card's projection keeps, checked on its own Jacobian at a few places. */
export function projectionKeeps(name: ProjectionName): string | undefined {
  const spots: [number, number][] = [
    [15, -40],
    [45, 20],
    [60, 80],
  ];
  const js = spots.map(([la, lo]) => jacobian(name, la, lo));
  const prop = PROPERTY[name];
  if (prop === 'conformal' && js.some((j) => !near(j.kE, j.kN, 1e-4)))
    return `${name} is filed conformal but k_E ≠ k_N`;
  if (prop === 'equalArea' && js.some((j) => !near(j.area, js[0]!.area, 1e-4)))
    return `${name} is filed equal-area but its area factor varies`;
  if (prop === 'equidistant' && js.some((j) => !near(j.kN, 1, 1e-4)))
    return `${name} is filed equidistant but k_N ≠ 1 along the meridians`;
  if (prop === 'compromise') {
    const j = js[2]!;
    if (near(j.kE, j.kN, 1e-3) || near(j.area, js[0]!.area, 1e-3))
      return `${name} is filed a compromise but keeps shapes or areas`;
  }
  return undefined;
}

/** HC78 card figures on a sort: each projection really keeps what its class says. */
export function projectionCardIssues(l: LayoutDef): string[] {
  if (l.kind !== 'sort') return [];
  const out: string[] = [];
  for (const card of l.cards) {
    const f = card.figure as ProjectionCard | undefined;
    if (f?.kind !== 'projection') continue;
    const why = projectionKeeps(f.projection);
    if (why) out.push(`card "${card.label}": ${why}`);
  }
  return out;
}
