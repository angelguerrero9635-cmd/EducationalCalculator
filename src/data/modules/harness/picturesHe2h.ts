/**
 * Picture checks for the college round 2 group H kinds (`typesHe2h.ts`): HC24 `wing`, HC30 `duct`. What each
 * draws must agree with the values and the relations it shows. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import {
  areaRatio,
  camber,
  contourAt,
  ductArea,
  ductShape,
  jetThrust,
  machFromArea,
  normalShock,
  nozzleState,
  pRatio,
  propulsiveEfficiency,
  throatHalf,
  tRatio,
  type DuctShape,
  inducedAngle,
  inducedDrag,
  nacaOf,
  planformBox,
  sectionVectors,
  toDeg,
} from '@/components/module/reps/aeroMath';

import type { NumOrVar } from '../typesGraphs';
import type { DuctSpec, WingSpec } from '../typesHe2h';
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
  if (rep.kind === 'duct') return ductIssues(rep, get);
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

/** The throat is the narrowest section, and widths go as √(A ÷ A*). */
function shapeIssues(sh: DuctShape, g: number): string[] {
  const out: string[] = [];
  const end = sh.form === 'converging' ? 1 : 1;
  let minS = 0;
  let minA = Infinity;
  for (let k = 0; k <= 1000; k++) {
    const s = (k / 1000) * end;
    const A = ductArea(sh, s);
    if (A < minA) {
      minA = A;
      minS = s;
    }
  }
  if (Math.abs(minS - sh.throat) > 0.002 || !near(minA, 1))
    out.push(`duct: the narrowest section is at ${minS} (A ÷ A* ${minA}), not the throat`);
  const hs = throatHalf(sh);
  const exitHalf = hs * Math.sqrt(ductArea(sh, 1));
  if (sh.form === 'cd' && !near(exitHalf / hs, Math.sqrt(sh.exit)))
    out.push(
      `duct: exit ÷ throat width ${exitHalf / hs}, not √(A_e ÷ A_t) = ${Math.sqrt(sh.exit)}`,
    );
  // Subsonic before the throat, M = 1 at it.
  const before = nozzleState(ductArea(sh, sh.throat / 2), 'sub', g);
  if (before && before.M >= 1) out.push(`duct: M ${before.M} before the throat`);
  const at = nozzleState(ductArea(sh, sh.throat), 'sub', g);
  if (at && !near(at.M, 1)) out.push(`duct: M ${at.M} at the throat, not 1`);
  return out;
}

function ductIssues(spec: DuctSpec, get: Getter): string[] {
  const out: string[] = [];
  const g = get(spec.gamma) ?? 1.4;
  if (!(g > 1)) return out;
  const mode = spec.mode ?? 'station';
  if (mode === 'engine') {
    const [m, V0, Ve, F] = [get(spec.mdot), get(spec.V0), get(spec.Ve), get(spec.thrust)];
    if (m !== undefined && V0 !== undefined && Ve !== undefined && F !== undefined)
      if (!near(F, jetThrust(m, V0, Ve)))
        out.push(`duct: F ${F}, but ṁ(V_e − V₀) = ${jetThrust(m, V0, Ve)}`);
    if (
      V0 !== undefined &&
      Ve !== undefined &&
      V0 > 0 &&
      !(propulsiveEfficiency(V0, Ve) <= 1 || Ve < V0)
    )
      out.push('duct: propulsive efficiency above 1');
    return out;
  }
  const [M, A, Me, T, T0, p, p0, pe] = [
    get(spec.M),
    get(spec.areaRatio),
    get(spec.Me),
    get(spec.T),
    get(spec.T0),
    get(spec.p),
    get(spec.p0),
    get(spec.pe),
  ];
  if (mode === 'station') {
    if (spec.choked || M === 1) out.push(...shapeIssues(ductShape(1, 'sonic'), g));
    else if (M !== undefined && M > 0) {
      const sh = ductShape(areaRatio(M, g), M > 1 ? 'super' : 'sub');
      out.push(...shapeIssues(sh, g));
      // The station's area on the drawing is the area–Mach relation's.
      if (!near(ductArea(sh, sh.station), areaRatio(M, g)))
        out.push(
          `duct: station drawn at A ÷ A* ${ductArea(sh, sh.station)}, not ${areaRatio(M, g)}`,
        );
      if (A !== undefined && !near(A, areaRatio(M, g)))
        out.push(`duct: A ÷ A* ${A}, but the relation gives ${areaRatio(M, g)} at M ${M}`);
      if (T !== undefined && T0 !== undefined && T > 0 && !near(T0 / T, tRatio(M, g)))
        out.push(`duct: T₀ ÷ T ${T0 / T}, but 1 + (γ − 1)M² ÷ 2 = ${tRatio(M, g)}`);
      if (p !== undefined && p0 !== undefined && T !== undefined && T0 !== undefined && p > 0)
        if (!near(p0 / p, (T0 / T) ** (g / (g - 1))))
          out.push(
            `duct: p₀ ÷ p ${p0 / p}, but (T₀ ÷ T)^(γ ÷ (γ − 1)) = ${(T0 / T) ** (g / (g - 1))}`,
          );
    }
    return out;
  }
  // Nozzle: the exit from A_e ÷ A_t, M_e on the supersonic branch (no shock).
  if (A !== undefined && A >= 1) {
    const sh: DuctShape = {
      inlet: spec.chamber ? 2.2 : 3,
      exit: A,
      throat: 0.38,
      form: 'cd',
      station: 1,
    };
    out.push(...shapeIssues(sh, g));
    const shockAt = get(spec.shockAt);
    if (shockAt !== undefined) {
      if (shockAt <= 1 || shockAt >= A)
        out.push(`duct: shock at ${shockAt} outside the diverging part`);
      else {
        if (contourAt(shockAt, sh.inlet, sh.exit, sh.throat, 'super') === undefined)
          out.push('duct: the shock has no place on the drawing');
        const M1 = machFromArea(shockAt, g, 'super')!;
        const [m1, m2] = [get(spec.shockM1), get(spec.shockM2)];
        if (m1 !== undefined && !near(m1, M1)) out.push(`duct: M₁ ${m1}, but the area gives ${M1}`);
        if (m2 !== undefined && !near(m2, normalShock(M1, g).M2))
          out.push(`duct: M₂ ${m2}, but the shock gives ${normalShock(M1, g).M2}`);
        const exit = nozzleState(A, 'super', g, shockAt);
        if (Me !== undefined && exit && !near(Me, exit.M))
          out.push(`duct: M_e ${Me}, but ${exit.M} after the shock`);
        if (exit && exit.M >= 1) out.push('duct: supersonic after a normal shock');
      }
    } else if (spec.shockAt === undefined) {
      const Mx = machFromArea(A, g, 'super')!;
      if (Me !== undefined && !near(Me, Mx)) out.push(`duct: M_e ${Me}, but A_e ÷ A_t gives ${Mx}`);
      if (pe !== undefined && p0 !== undefined && p0 > 0 && !near(pe / p0, 1 / pRatio(Mx, g)))
        out.push(`duct: p_e ÷ p₀ ${pe / p0}, not ${1 / pRatio(Mx, g)}`);
    }
  }
  return out;
}
