/**
 * Picture checks for the college round 3 group J kinds (`typesHe3j.ts`): HC60 `roadCurve`, HC61
 * `connection`, HC88 `streamChannel` options, HC89 `hydrograph` and HC90 `blockDiagram`. What
 * each draws must agree with the values and the physics. Called from `repIssues` in
 * `pictures.ts`. Test-only.
 */
import {
  alternateDepth,
  brakingDistance,
  cnRunoff,
  criticalDepth,
  crestConstant,
  curveElements,
  detentionStorage,
  equalLags,
  froude,
  jumpDepth,
  jumpLoss,
  manningQ,
  minRadius,
  proportionalLoop,
  rationalPeak,
  reactionDistance,
  specificEnergy,
  worstSight,
} from '@/components/module/reps/he3jMath';

import type { NumOrVar } from '../typesGraphs';
import type { He3jSpec } from '../typesHe3j';

/** Equal to a relative tolerance (or 10⁻⁶ near zero). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(a), Math.abs(b));

export function he3jIssues(rep: He3jSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const get = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const y = typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  const expect = (name: string, x: NumOrVar | undefined, want: number | undefined, tol = 2e-3) => {
    const v = get(x);
    if (v !== undefined && want !== undefined && Number.isFinite(want) && !near(v, want, tol))
      out.push(`${name} ${v}, but the picture draws ${want}`);
  };
  const positive = (name: string, x: NumOrVar | undefined) => {
    const v = get(x);
    if (v !== undefined && !(v > 0)) out.push(`${name} ${v} is not positive`);
  };

  if (rep.kind === 'streamChannel') {
    const g = get(rep.g) ?? 9.81;
    const [b, y] = [get(rep.width), get(rep.depth)];
    if (rep.mode === 'manning') {
      positive('width', rep.width);
      positive('depth', rep.depth);
      if (b !== undefined && y !== undefined) {
        const A = b * y;
        expect('area', rep.area, A);
        expect('hydraulic radius', rep.radius, A / (b + 2 * y));
        const [n, S] = [get(rep.n), get(rep.slope)];
        const Q =
          n !== undefined && S !== undefined ? manningQ(b, y, n, S, rep.manningK ?? 1) : undefined;
        expect('discharge', rep.discharge, Q);
        const V = get(rep.speed) ?? (Q !== undefined ? Q / A : undefined);
        if (get(rep.discharge) !== undefined) expect('speed', rep.speed, get(rep.discharge)! / A);
        expect('Froude number', rep.froude, V !== undefined ? froude(V, y, g) : undefined);
      }
    }
    if (rep.mode === 'specificEnergy') {
      const Q = get(rep.discharge);
      const q = get(rep.q) ?? (Q !== undefined && b !== undefined ? Q / b : undefined);
      if (Q !== undefined && b !== undefined) expect('unit discharge', rep.q, Q / b);
      if (q !== undefined) {
        const yc = criticalDepth(q, g);
        expect('critical depth', rep.yc, yc);
        expect('E_min', rep.Emin, 1.5 * yc);
        // E is least at y_c: just above and below it, E is larger.
        if (!(specificEnergy(yc * 0.99, q, g) > specificEnergy(yc, q, g)))
          out.push('E is not least at y_c (below it)');
        if (!(specificEnergy(yc * 1.01, q, g) > specificEnergy(yc, q, g)))
          out.push('E is not least at y_c (above it)');
        if (y !== undefined) {
          const E = specificEnergy(y, q, g);
          expect('specific energy', rep.energy, E);
          if (E < 1.5 * yc * (1 - 1e-9)) out.push(`E ${E} below E_min ${1.5 * yc}`);
          const alt = alternateDepth(y, q, g);
          if (!near(specificEnergy(alt, q, g), E, 1e-4))
            out.push(`the alternate depth ${alt} does not have E ${E}`);
        }
      }
    }
    if (rep.mode === 'jump') {
      const [y1, V1] = [get(rep.y1), get(rep.V1)];
      const Fr1 =
        get(rep.Fr1) ?? (y1 !== undefined && V1 !== undefined ? froude(V1, y1, g) : undefined);
      if (y1 !== undefined && V1 !== undefined) expect('Fr₁', rep.Fr1, froude(V1, y1, g));
      if (y1 !== undefined && Fr1 !== undefined) {
        const y2 = jumpDepth(y1, Fr1);
        expect('y₂', rep.y2, y2);
        expect('h_L', rep.hL, jumpLoss(y1, get(rep.y2) ?? y2));
        // A jump draws only from supercritical flow, and it deepens.
        if (Fr1 > 1 && !(y2 > y1)) out.push(`jump with Fr₁ ${Fr1} but y₂ ${y2} ≤ y₁ ${y1}`);
        if (Fr1 > 1 && !(jumpLoss(y1, y2) > 0)) out.push('a jump that loses no energy');
      }
    }
  }

  if (rep.kind === 'roadCurve') {
    const g = get(rep.g) ?? 9.81;
    if (rep.mode === 'stopping') {
      const [V, t, a] = [get(rep.speed), get(rep.reaction), get(rep.decel)];
      // A grade the page names but leaves "?" draws nothing to check against.
      const G = rep.grade === undefined ? 0 : get(rep.grade);
      if (V !== undefined && t !== undefined) {
        const r = reactionDistance(V, t);
        expect('reaction distance', rep.reactionDistance, r);
        if (a !== undefined && G !== undefined) {
          const d = brakingDistance(V, a, G, g);
          if (!(a / g + G > 0)) out.push('the car cannot stop on this grade');
          expect('braking distance', rep.brakingDistance, d);
          expect('stopping sight distance', rep.ssd, r + d);
        }
      }
    }
    if (rep.mode === 'plan') {
      const [R, D] = [get(rep.radius), get(rep.delta)];
      if (R !== undefined && D !== undefined) {
        const el = curveElements(R, D);
        // T = R tan(Δ ÷ 2) on the drawing.
        expect('tangent', rep.tangent, el.T);
        expect('arc length', rep.length, el.L);
        expect('external', rep.external, el.E);
        if (!(D > 0 && D < 180)) out.push(`Δ ${D}° cannot be drawn as a curve`);
      }
      const [V, e, f] = [get(rep.speed), get(rep.e), get(rep.f)];
      if (V !== undefined && e !== undefined && f !== undefined)
        expect('least radius', rep.radius, minRadius(V, e, f));
    }
    if (rep.mode === 'profile') {
      const [g1, g2, L, S] = [get(rep.g1), get(rep.g2), get(rep.curveLength), get(rep.sight)];
      const [h1, h2] = [rep.eye ?? 1.08, rep.object ?? 0.6];
      if (g1 !== undefined && g2 !== undefined) {
        expect('A', rep.A, Math.abs(g1 - g2));
        // A sag (G₁ ≤ G₂) draws faded with the reason: not a fault of the picture.
        if (!(g1 > g2)) out.push('~a crest curve needs G₁ > G₂');
        if (L !== undefined && S !== undefined && g1 > g2) {
          const A = g1 - g2;
          const K = crestConstant(h1, h2);
          const need = (A * S * S) / K >= S ? (A * S * S) / K : 2 * S - K / A;
          const w = worstSight(g1, g2, L, S, h1, h2);
          // The sight line clears the crest exactly when L meets the formula.
          if (near(L, need, 1e-4) && Math.abs(w.gap) > 2e-3 * h2)
            out.push(`L meets the formula but the sight line misses the crest by ${w.gap} m`);
          if (L > need * 1.001 && !(w.gap > 0)) out.push('a longer curve than needed, but blocked');
          if (L < need * 0.999 && !(w.gap < 0)) out.push('a shorter curve than needed, but clear');
        }
      }
    }
  }

  if (rep.kind === 'connection') {
    if (rep.mode === 'tension') {
      const [w, t, n, d] = [get(rep.plateWidth), get(rep.t), get(rep.holes), get(rep.holeSize)];
      if (n !== undefined && (n < 0 || Math.round(n) !== n)) out.push(`holes ${n} is not a count`);
      if (w !== undefined && n !== undefined && d !== undefined) {
        // The net width drawn is the width less the holes.
        const net = w - n * d;
        if (!(net > 0)) out.push(`the holes (${n} × ${d}) leave no plate in ${w}`);
        if (t !== undefined) {
          expect('gross area', rep.Ag, w * t);
          expect('net area', rep.An, net * t);
          const U = get(rep.U) ?? 1;
          expect('effective area', rep.Ae, U * net * t);
          const [Fy, Fu] = [get(rep.Fy), get(rep.Fu)];
          if (Fy !== undefined && Fu !== undefined)
            expect('φP_n', rep.strength, Math.min(0.9 * Fy * w * t, 0.75 * Fu * U * net * t));
        }
      }
    }
    if (rep.mode === 'bolts') {
      const [d, n, F] = [get(rep.d), get(rep.n), get(rep.Fnv)];
      if (n !== undefined && (n < 1 || Math.round(n) !== n)) out.push(`bolts ${n} is not a count`);
      if (d !== undefined) {
        const Ab = (Math.PI * d * d) / 4;
        expect('A_b', rep.Ab, Ab);
        if (F !== undefined) {
          expect('φr_n', rep.perBolt, 0.75 * F * Ab);
          if (n !== undefined) expect('φR_n', rep.strength, n * 0.75 * F * Ab);
        }
      }
    }
    if (rep.mode === 'weld') {
      const [w, L, F] = [get(rep.weldLeg), get(rep.weldLength), get(rep.Fexx)];
      if (w !== undefined) {
        expect('throat', rep.throat, 0.707 * w);
        if (F !== undefined) {
          const per = 0.75 * 0.6 * F * 0.707 * w;
          expect('φR_n per inch', rep.perInch, per);
          if (L !== undefined) expect('φR_n', rep.strength, per * L * (rep.welds ?? 2));
        }
      }
    }
    if (rep.mode === 'blockShear') {
      const [Agv, Anv, Ant, Fy, Fu] = [
        get(rep.Agv),
        get(rep.Anv),
        get(rep.Ant),
        get(rep.Fy),
        get(rep.Fu),
      ];
      if (Agv !== undefined && Anv !== undefined && Anv > Agv)
        out.push(`A_nv ${Anv} more than A_gv ${Agv}`);
      const U = get(rep.Ubs) ?? 1;
      if ([Agv, Anv, Ant, Fy, Fu].every((x) => x !== undefined))
        expect(
          'φR_n',
          rep.strength,
          0.75 * Math.min(0.6 * Fu! * Anv! + U * Fu! * Ant!, 0.6 * Fy! * Agv! + U * Fu! * Ant!),
        );
    }
  }

  if (rep.kind === 'hydrograph') {
    if (rep.mode === 'split') {
      const CN = get(rep.CN);
      const S = get(rep.S) ?? (CN !== undefined ? 1000 / CN - 10 : undefined);
      if (CN !== undefined) expect('S', rep.S, 1000 / CN - 10);
      if (S !== undefined) expect('I_a', rep.Ia, 0.2 * S);
      const P = get(rep.P);
      if (P !== undefined && S !== undefined) {
        const Q = cnRunoff(P, S);
        expect('runoff', rep.Q, Q);
        const Ia = Math.min(P, 0.2 * S);
        const F = P - Ia - Q;
        expect('infiltration', rep.F, F);
        // The column's parts add to the rain: I_a + F + Q = P.
        if (!near(Ia + F + Q, P, 1e-9)) out.push(`I_a + F + Q = ${Ia + F + Q}, not P ${P}`);
        if (F < -1e-9) out.push(`infiltration ${F} is negative`);
      }
    }
    if (rep.mode === 'rational') {
      const [C, i, A] = [get(rep.C), get(rep.i), get(rep.A)];
      if (C !== undefined && (C < 0 || C > 1)) out.push(`C ${C} is not a share`);
      if (C !== undefined && i !== undefined && A !== undefined)
        expect('peak flow', rep.Qp, rationalPeak(C, i, A));
    }
    if (rep.mode === 'detention') {
      const [Qi, Qo, tb] = [get(rep.Qin), get(rep.Qout), get(rep.tb)];
      if (Qi !== undefined && Qo !== undefined && !(Qo < Qi))
        out.push(`outflow peak ${Qo} not below the inflow peak ${Qi}`);
      if (Qi !== undefined && Qo !== undefined && tb !== undefined) {
        // The shaded area between the triangles: ½t_b(Q_i − Q_o).
        const s = rep.tbSeconds ?? 3600;
        const p = rep.peakAt ?? 0.375;
        if (!(p > 0 && p < 1)) out.push(`peakAt ${p} is not inside the base`);
        expect('storage', rep.V, detentionStorage(Qi, Qo, tb, s));
      }
    }
  }

  if (rep.kind === 'blockDiagram') {
    // Every gain a block shows is a value: a fixed number or a variable.
    const [Kc, Kp, tau, r] = [get(rep.Kc), get(rep.Kp), get(rep.tau), get(rep.setpoint)];
    if (rep.mode !== 'feedforward' && rep.Kp === undefined)
      out.push('the process block has no gain');
    if (rep.mode === 'feedback' || rep.mode === 'cascade') {
      if (rep.Kc === undefined) out.push('the controller block has no gain');
      if (Kc !== undefined && Kp !== undefined && tau !== undefined && r !== undefined) {
        const loop = proportionalLoop(Kc, Kp, tau, r);
        expect('loop gain', rep.loopGain, loop.K);
        expect('final value', rep.final, loop.final);
        expect('offset', rep.offset, loop.offset);
        expect('τ_cl', rep.tauCl, loop.tauCl);
      }
    }
    if (rep.mode === 'lags' && tau !== undefined) {
      const L = equalLags(rep.lags ?? 3, tau);
      if (Kp !== undefined) expect('K_c,u', rep.Kcu, L.loop / Kp);
      expect('ω_u', rep.wu, L.wu);
      expect('P_u', rep.Pu, L.Pu);
    }
    if (rep.mode === 'feedforward') {
      const [Kd, Kff] = [get(rep.Kd), get(rep.Kff)];
      if (Kd !== undefined && Kp !== undefined) expect('K_ff', rep.Kff, -Kd / Kp);
      // The two paths cancel at the output: K_d + K_ffK_p = 0.
      if (Kd !== undefined && Kp !== undefined && Kff !== undefined)
        if (Math.abs(Kd + Kff * Kp) > 1e-3 * Math.abs(Kd))
          out.push('the feedforward does not cancel');
    }
  }
  return out;
}
