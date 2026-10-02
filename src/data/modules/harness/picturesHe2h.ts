/**
 * Picture checks for the college round 2 group H kinds (`typesHe2h.ts`): HC24 `wing`. What each
 * draws must agree with the values and the relations it shows. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import {
  camber,
  inducedAngle,
  inducedDrag,
  nacaOf,
  planformBox,
  sectionVectors,
  toDeg,
} from '@/components/module/reps/aeroMath';

import type { NumOrVar } from '../typesGraphs';
import type { WingSpec } from '../typesHe2h';
import type { Representation } from '../types';

type Getter = (x: NumOrVar | undefined) => number | undefined;

/** Equal to 0.1% (or 10⁻⁶ near zero, below what a page shows). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-3, Math.abs(a), Math.abs(b));

export function he2hIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const get: Getter = (x) => {
    if (x === undefined) return undefined;
    const y = typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'wing') return wingIssues(rep, get);
  return [];
}

function wingIssues(spec: WingSpec, get: Getter): string[] {
  const out: string[] = [];
  if ((spec.mode ?? 'section') === 'section') {
    const alpha = get(spec.alpha) ?? 0;
    const v = sectionVectors(alpha);
    // Lift ⟂ the wind (not the chord), whatever α is.
    const dot = v.lift[0] * v.wind[0] + v.lift[1] * v.wind[1];
    if (Math.abs(dot) > 1e-9) out.push(`wing: lift is not ⟂ the wind at α = ${alpha}°`);
    const chordUp = v.chord[0] * v.up[0] + v.chord[1] * v.up[1];
    if (Math.abs(chordUp) > 1e-9) out.push('wing: the section is skewed');
    const d = spec.digits;
    if (d) {
      const [d1, d2, d34] = [get(d.d1), get(d.d2), get(d.d34)];
      if (d1 !== undefined && d2 !== undefined && d34 !== undefined) {
        const n = nacaOf(d1, d2, d34);
        if (n.m > 0 && n.p > 0) {
          // The drawn camber line peaks at d₂ × 10% of the chord, d₁% high.
          let best = 0;
          let top = -Infinity;
          for (let k = 0; k <= 1000; k++) {
            const y = camber(n, k / 1000);
            if (y > top) {
              top = y;
              best = k / 1000;
            }
          }
          if (Math.abs(best - n.p) > 0.002)
            out.push(`wing: camber peaks at ${best} of the chord, not ${n.p}`);
          if (!near(top, n.m)) out.push(`wing: camber ${top}, not ${n.m}`);
        }
        const c = get(spec.chord);
        if (c !== undefined) {
          const cm = get(spec.camber);
          const at = get(spec.camberAt);
          const t = get(spec.thickness);
          if (cm !== undefined && !near(cm, n.m * c))
            out.push(`wing: max camber ${cm}, but d₁% of c = ${n.m * c}`);
          if (at !== undefined && n.m > 0 && !near(at, n.p * c))
            out.push(`wing: camber place ${at}, but d₂ × 10% of c = ${n.p * c}`);
          if (t !== undefined && !near(t, n.t * c))
            out.push(`wing: thickness ${t}, but d₃d₄% of c = ${n.t * c}`);
        }
      }
    }
    if (spec.forces) {
      const [L, D, cl, cd] = [
        get(spec.forces.lift),
        get(spec.forces.drag),
        get(spec.cl),
        get(spec.cd),
      ];
      if (L !== undefined && D !== undefined && cl !== undefined && cd !== undefined && D && cd)
        if (!near(L / D, cl / cd))
          // Cosmetic: a degenerate state (q = 0) leaves L and D free of the coefficients.
          out.push(`~wing: L ÷ D = ${L / D}, but c_l ÷ c_d = ${cl / cd}`);
    }
    if (spec.pressure) {
      const [cp, V, Vinf] = [get(spec.pressure.cp), get(spec.pressure.speed), get(spec.speed)];
      if (cp !== undefined && V !== undefined && Vinf !== undefined && Vinf > 0) {
        const want = 1 - (V / Vinf) ** 2;
        if (!near(cp, want)) out.push(`wing: C_p ${cp}, but 1 − (V ÷ V∞)² = ${want}`);
      }
    }
    if (spec.circulation) {
      const [g, Lp] = [get(spec.circulation.gamma), get(spec.circulation.lift)];
      if (g !== undefined && Lp !== undefined && g * Lp < 0)
        out.push('wing: the loop turns against the lift');
    }
    return out;
  }
  // Planform: AR read off the drawing is b² ÷ S within 2%.
  const [b, cr, ct0, S, AR] = [
    get(spec.span),
    get(spec.rootChord),
    get(spec.tipChord),
    get(spec.area),
    get(spec.aspectRatio),
  ];
  const ct = ct0 ?? cr;
  if (b !== undefined && cr !== undefined && ct !== undefined && b > 0 && cr > 0) {
    const box = planformBox(b, cr, ct);
    if (AR !== undefined && Math.abs(box.aspect - AR) > 0.02 * AR)
      out.push(`wing: drawn AR ${box.aspect}, but AR = ${AR}`);
    const area = (b * (cr + ct)) / 2;
    if (S !== undefined && !near(S, area)) out.push(`wing: S ${S}, but b(c_r + c_t) ÷ 2 = ${area}`);
    const lam = get(spec.taper);
    if (lam !== undefined && !near(lam, ct / cr))
      out.push(`wing: λ ${lam}, but c_t ÷ c_r = ${ct / cr}`);
  } else if (AR !== undefined && AR > 0) {
    const box = planformBox(AR, 1, 1);
    if (Math.abs(box.aspect - AR) > 0.02 * AR) out.push(`wing: drawn AR ${box.aspect}, not ${AR}`);
  }
  const [CL, e, CDi, ai] = [get(spec.CL), get(spec.e), get(spec.CDi), get(spec.alphaI)];
  if (
    CL !== undefined &&
    AR !== undefined &&
    e !== undefined &&
    CDi !== undefined &&
    AR > 0 &&
    e > 0
  )
    if (!near(CDi, inducedDrag(CL, AR, e)))
      out.push(`wing: C_Di ${CDi}, but C_L² ÷ (πeAR) = ${inducedDrag(CL, AR, e)}`);
  if (CL !== undefined && AR !== undefined && ai !== undefined && AR > 0)
    if (!near(ai, toDeg(inducedAngle(CL, AR))))
      out.push(`wing: α_i ${ai}°, but C_L ÷ (πAR) = ${toDeg(inducedAngle(CL, AR))}°`);
  return out;
}
