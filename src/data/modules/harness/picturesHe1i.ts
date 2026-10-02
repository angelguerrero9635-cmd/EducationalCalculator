/**
 * Harness checks for college pictures, round 1, group I (HC8): `phaseEnvelope` and the
 * one-component `substance` of `chemDiagram` mode `phase`. Each check recomputes what the
 * picture draws and compares it with the page's values. Called from `pictures.ts`.
 */
import {
  absorberStairs,
  bubbleP,
  bubbleT,
  degreesOfFreedom,
  dewP,
  dewT,
  distillationStairs,
  feedPoint,
  kremser,
  margules,
  minLiquid,
  qPinch,
  rectifying,
  stairsMatch,
  tieAt,
  vaporP,
  yEq,
  type TP,
} from '@/components/module/reps/phaseEnvelopeMath';

import type { PhaseEnvelopeSpec, PhaseSubstance } from '../typesHe1i';

type Val = (x: string | number) => number | undefined;

const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const fraction = (x: number | undefined) => x !== undefined && x >= 0 && x <= 1;

export function phaseEnvelopeIssues(rep: PhaseEnvelopeSpec, val: Val): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const same = (what: string, shown: number | undefined, drawn: number, tol?: number) => {
    if (shown !== undefined && Number.isFinite(drawn) && !near(shown, drawn, tol))
      out.push(`${what} is drawn at ${drawn}, the value shows ${shown}`);
  };
  /**
   * A value drawn from a mole fraction the page shows to 3 decimals: it may sit anywhere the
   * fraction's rounding allows (y₁ from x₁ = 0.000 can be up to y₁ at 0.0005).
   */
  const around = (what: string, shown: number | undefined, f: (x: number) => number, x: number) => {
    if (shown === undefined) return;
    const at = [x - 5e-4, x, x + 5e-4].filter((t) => t >= 0 && t <= 1).map(f);
    if (at.some((d) => !Number.isFinite(d))) return;
    const [lo, hi] = [Math.min(...at), Math.max(...at)];
    const tol = 2e-3 * Math.max(1, Math.abs(shown));
    if (shown < lo - tol || shown > hi + tol)
      out.push(`${what} is drawn at ${f(x)}, the value shows ${shown}`);
  };
  const fractions = (...xs: [string, number | undefined][]) => {
    for (const [name, x] of xs)
      if (x !== undefined && !fraction(x)) out.push(`${name} = ${x} is not a mole fraction`);
  };
  switch (rep.mode) {
    case 'Pxy': {
      const [p1, p2] = [num(rep.p1), num(rep.p2)];
      const [x, y, P, z, A] = [num(rep.x), num(rep.y), num(rep.P), num(rep.z), num(rep.margules)];
      fractions(['x₁', x], ['y₁', y], ['z₁', z]);
      if (p1 === undefined || p2 === undefined) break;
      if (!(p1 > 0 && p2 > 0)) {
        out.push('a vapor pressure is not positive');
        break;
      }
      const a = A ?? 0;
      // The bubble curve lies above the dew curve at every composition (Raoult's law).
      if (a === 0)
        for (let k = 0; k <= 20; k++) {
          const c = k / 20;
          if (bubbleP(c, p1, p2).P < dewP(c, p1, p2).P - 1e-9 * p1)
            out.push(`the bubble curve dips under the dew curve at ${c}`);
        }
      const tie =
        rep.tie ?? (rep.z !== undefined ? 'flash' : rep.x !== undefined ? 'bubble' : 'dew');
      let drawn: { x: number; y: number; P: number } | undefined;
      if (tie === 'bubble' && fraction(x)) {
        const r = bubbleP(x!, p1, p2, a);
        drawn = { x: x!, y: r.y1, P: r.P };
        around('P', P, (t) => bubbleP(t, p1, p2, a).P, x!);
        around('y₁', y, (t) => bubbleP(t, p1, p2, a).y1, x!);
      } else if (tie === 'dew' && fraction(y)) {
        const r = dewP(y!, p1, p2);
        drawn = { x: r.x1, y: y!, P: r.P };
        around('P', P, (t) => dewP(t, p1, p2).P, y!);
        around('x₁', x, (t) => dewP(t, p1, p2).x1, y!);
      } else if (tie === 'flash' && P !== undefined && P > 0) {
        const r = tieAt(P, p1, p2);
        if (fraction(r.x1)) {
          drawn = { x: r.x1, y: r.y1, P };
          same('x₁', x, r.x1);
          same('y₁', y, r.y1);
          if (rep.K) {
            same('K₁', num(rep.K[0]), p1 / P);
            same('K₂', num(rep.K[1]), p2 / P);
          }
          const vf = num(rep.vf);
          if (z !== undefined && Math.abs(r.y1 - r.x1) > 1e-9)
            same('V ÷ F (lever rule)', vf, (z - r.x1) / (r.y1 - r.x1));
        }
      }
      // The more volatile component is richer in the vapor (Raoult's law).
      if (drawn && a === 0 && (p1 - p2) * (drawn.y - drawn.x) < -1e-9)
        out.push(
          `y₁ = ${drawn.y} against x₁ = ${drawn.x}: the more volatile is not richer in the vapor`,
        );
      if (rep.gammas && x !== undefined && A !== undefined) {
        around('γ₁', num(rep.gammas[0]), (t) => margules(A, t)[0], x);
        around('γ₂', num(rep.gammas[1]), (t) => margules(A, t)[1], x);
      }
      break;
    }
    case 'Txy': {
      const [P, x, y, T] = [num(rep.P), num(rep.x), num(rep.y), num(rep.T)];
      fractions(['x₁', x], ['y₁', y]);
      if (P === undefined || !(P > 0)) break;
      const [a1, a2] = rep.antoine;
      for (let k = 0; k <= 10; k++) {
        const c = k / 10;
        const [tb, td] = [bubbleT(c, P, a1, a2), dewT(c, P, a1, a2)];
        if (tb && td && tb.T > td.T + 1e-6)
          out.push(`the dew curve dips under the bubble curve at ${c}`);
      }
      const tie = rep.tie ?? (rep.x !== undefined ? 'bubble' : 'dew');
      if (tie === 'bubble' && fraction(x)) {
        around('T', T, (t) => bubbleT(t, P, a1, a2)?.T ?? NaN, x!);
        around('y₁', y, (t) => bubbleT(t, P, a1, a2)?.y1 ?? NaN, x!);
      } else if (tie === 'dew' && fraction(y)) {
        around('T', T, (t) => dewT(t, P, a1, a2)?.T ?? NaN, y!);
        around('x₁', x, (t) => dewT(t, P, a1, a2)?.x1 ?? NaN, y!);
      }
      break;
    }
    case 'xy': {
      const [alpha, m, xD, xB, xF, R] = [rep.alpha, rep.m, rep.xD, rep.xB, rep.xF, rep.R].map(num);
      const q = rep.q === undefined ? 1 : num(rep.q);
      fractions(['x_D', xD], ['x_B', xB], ['x_F', xF]);
      if (alpha !== undefined && !(alpha > 1)) out.push(`α = ${alpha}: no more volatile component`);
      if (xB !== undefined && xD !== undefined && !(xB < xD)) out.push('x_B is not below x_D');
      if (xF !== undefined && xD !== undefined && !(xF < xD)) out.push('x_F is not below x_D');
      if (xB !== undefined && xF !== undefined && !(xB < xF)) out.push('x_B is not below x_F');
      if (R !== undefined && xD !== undefined && R >= 0) {
        const top = rectifying(R, xD);
        same('slope', num(rep.slope), top.slope);
        same('intercept', num(rep.intercept), top.intercept);
        // The operating lines cross on the q-line.
        if (xF !== undefined && q !== undefined && xF < xD) {
          const [fx, fy] = feedPoint(R, xD, xF, q);
          const onQ = Math.abs(q - 1) < 1e-9 ? fx - xF : fy - ((q / (q - 1)) * fx - xF / (q - 1));
          if (Math.abs(onQ) > 1e-9) out.push('the operating lines do not cross on the q-line');
          if (Math.abs(fy - (top.slope * fx + top.intercept)) > 1e-9)
            out.push('the feed point is off the rectifying line');
        }
      }
      const Rmin = num(rep.Rmin);
      if (
        Rmin !== undefined &&
        alpha !== undefined &&
        alpha > 1 &&
        xF !== undefined &&
        xD !== undefined &&
        q !== undefined
      ) {
        const pinch = qPinch(alpha, xF, q);
        if (pinch && pinch[0] < xD) {
          const top = rectifying(Rmin, xD);
          if (Math.abs(top.slope * pinch[0] + top.intercept - pinch[1]) > 2e-3)
            out.push(`R_min = ${Rmin}: its line misses the pinch on the q-line`);
        }
      }
      const valid =
        alpha !== undefined &&
        alpha > 1 &&
        xD !== undefined &&
        xB !== undefined &&
        xB > 0 &&
        xD < 1 &&
        xB < xD;
      if (rep.steps === 'total' && valid) {
        const n = distillationStairs(alpha, xD, xB).stairs.length;
        const N = num(rep.minStages);
        if (N !== undefined && !stairsMatch(n, N))
          out.push(`${n} stairs drawn at total reflux, but N_min = ${N}`);
      }
      if (
        rep.steps === 'stages' &&
        valid &&
        R !== undefined &&
        xF !== undefined &&
        q !== undefined &&
        xB < xF &&
        xF < xD
      ) {
        const s = distillationStairs(alpha, xD, xB, { R, xF, q });
        const [stages, feed] = [num(rep.stages), num(rep.feedStage)];
        if (s.pinched && stages !== undefined)
          out.push(`${stages} stages shown, but the operating lines pinch: no count`);
        if (!s.pinched) {
          if (stages !== undefined && stages !== s.stairs.length)
            out.push(`${s.stairs.length} stairs drawn, the stage count shows ${stages}`);
          if (feed !== undefined && feed !== s.feed)
            out.push(`the feed is drawn on stage ${s.feed}, the value shows ${feed}`);
        }
      }
      // The equilibrium curve: y ≥ x for the more volatile component.
      if (alpha !== undefined && alpha > 1)
        for (let k = 0; k <= 10; k++)
          if (yEq({ alpha }, k / 10) < k / 10 - 1e-12) out.push('the curve dips under y = x');
      const ab = rep.absorber;
      if (ab && m !== undefined) {
        const [yIn, yOut, xIn] = [num(ab.yIn), num(ab.yOut), num(ab.xIn)];
        const A = num(ab.A);
        const LG = num(ab.LG) ?? (A !== undefined ? A * m : undefined);
        if (yIn === undefined || yOut === undefined || xIn === undefined) break;
        const LGmin = num(ab.LGmin);
        if (yIn > yOut && yIn / m > xIn) same('(L ÷ G)min', LGmin, minLiquid(yIn, yOut, xIn, m));
        if (A !== undefined && num(ab.LG) !== undefined) same('A', A, num(ab.LG)! / m);
        if (LG === undefined) break;
        const s = absorberStairs(m, LG, yIn, yOut, xIn);
        const N = num(ab.N);
        if (!s.pinched && N !== undefined) {
          if (A !== undefined && A > 0) same('N (Kremser)', N, kremser(yIn, yOut, xIn, m, A));
          if (!stairsMatch(s.stairs.length, N))
            out.push(`${s.stairs.length} stairs drawn, but Kremser’s N = ${N}`);
        }
      }
      break;
    }
  }
  return out;
}

export function phaseSubstanceIssues(s: PhaseSubstance | undefined, val: Val): string[] {
  const out: string[] = [];
  if (!s) return out;
  const num = (x: string | number | undefined) => (x === undefined ? undefined : val(x));
  const [Tt, Pt] = s.triple.map(num);
  const [Tc, Pc] = s.critical.map(num);
  if (Tt === undefined || Pt === undefined || Tc === undefined || Pc === undefined) return out;
  if (!(Tt > 0 && Pt > 0 && Tc > Tt && Pc > Pt)) {
    out.push('the critical point is not above and right of the triple point');
    return out;
  }
  const pts: TP[] = [];
  for (const [t, p] of s.points ?? []) {
    const [T, P] = [num(t), num(p)];
    if (T === undefined || P === undefined) continue;
    // A point outside the liquid's range is drawn off the curve, the caption says why.
    if (T > Tt && T < Tc && P > 0) pts.push([T, P]);
  }
  const Tb = num(s.normalBoiling);
  if (Tb !== undefined && Tb > Tt && Tb < Tc) pts.push([Tb, s.atm ?? 1]);
  const knots = [[Tt, Pt] as TP, ...pts, [Tc, Pc] as TP].sort((a, b) => a[0] - b[0]);
  // The curve passes every point (one that falls with T draws faded, the caption says why).
  knots.forEach(([T, P]) => {
    if (!near(vaporP(knots, T), P, 1e-6)) out.push(`the vapor curve misses (${T} K, ${P})`);
  });
  const slope = num(s.meltSlope);
  if (slope !== undefined && slope === 0) out.push('a melting line of slope 0 is flat');
  const rule = s.rule;
  if (rule) {
    const [C, P, F] = [num(rule.components), num(rule.phases), num(rule.freedom)];
    if (C !== undefined && P !== undefined && F !== undefined && F !== degreesOfFreedom(C, P))
      out.push(`F = C − P + 2 = ${degreesOfFreedom(C, P)}, the value shows ${F}`);
  }
  return out;
}
