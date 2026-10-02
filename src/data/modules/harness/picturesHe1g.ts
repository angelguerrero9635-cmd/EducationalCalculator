/**
 * Picture checks for the college round 1 group G kind `fluidSystem` (HC6, `typesHe1g.ts`): what
 * each mode draws must agree with the values and with the physics (column heights equal
 * ΔP ÷ ρg; A₁V₁ = A₂V₂; the grade lines fall in the flow direction by h_L; EGL − HGL = V² ÷ 2g;
 * parallel pipes' h_f are equal; the jet's force opposes its turn). Called from `repIssues` in
 * `pictures.ts` with a reader of formula units (`siOf`); values are turned into SI here. Test-only.
 */
import {
  DEFAULT_G,
  PLATE_LAMINAR_RE,
  areaOf,
  darcy,
  gateOf,
  hardyCross,
  hazenWilliams,
  jetForce,
  layerAt,
  manningFull,
  modelSpeed,
} from '@/components/module/reps/fluidMath';
import { getUnit } from '@/engine/units';
import type { VariableDef } from '@/engine/types';

import type { NumOrVar } from '../typesGraphs';
import type { He1gSpec } from '../typesHe1g';

type Val = (id: string) => number | undefined;

/** Equal to display rounding (4 figures). */
const near = (a: number, b: number, tol = 2e-3) =>
  Math.abs(a - b) <= tol * Math.max(Math.abs(a), Math.abs(b)) + 1e-12;

export function he1gIssues(rep: He1gSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const si = (x: NumOrVar | undefined): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    const y = val(x);
    return y === undefined || Number.isNaN(y)
      ? undefined
      : y * (getUnit(byId.get(x)?.unit)?.factor ?? 1);
  };
  const g = si(rep.g) ?? DEFAULT_G;
  const tag = `fluidSystem ${rep.mode}`;
  /** A named value must agree with what the picture works out. */
  const same = (x: NumOrVar | undefined, want: number | undefined, what: string) => {
    const y = si(x);
    if (y !== undefined && want !== undefined && Number.isFinite(want) && !near(y, want))
      out.push(`${tag}: ${what} is ${y}, the picture draws ${want}`);
  };
  if (!(g > 0)) out.push(`${tag}: g = ${g} is not positive`);
  switch (rep.mode) {
    case 'tank': {
      const [h, rho, atm] = [si(rep.depth), si(rep.density), si(rep.atm)];
      const gauge = h !== undefined && rho !== undefined ? rho * g * h : si(rep.gauge);
      same(rep.gauge, gauge, 'P_gauge (ρgh)');
      if (atm !== undefined && gauge !== undefined) same(rep.absolute, atm + gauge, 'P_abs');
      if (h !== undefined && h < 0) out.push(`${tag}: the point is above the surface`);
      break;
    }
    case 'manometer': {
      const [h, rho, rhoM] = [si(rep.reading), si(rep.density), si(rep.gaugeDensity)];
      if (rho !== undefined && rhoM !== undefined && rhoM <= rho)
        out.push(`~${tag}: the gauge fluid is no heavier than the pipe's (drawn faded)`);
      if (h !== undefined && rho !== undefined && rhoM !== undefined) {
        same(rep.difference, (rhoM - rho) * g * h, 'ΔP');
        // The drawn column difference is the reading: ΔP ÷ ((ρ_m − ρ)g).
        const dP = si(rep.difference);
        if (dP !== undefined && rhoM > rho) same(rep.reading, dP / ((rhoM - rho) * g), 'h');
      }
      break;
    }
    case 'gate': {
      const [b, H, d, rho] = [si(rep.width), si(rep.height), si(rep.top), si(rep.density)];
      if (H === undefined || d === undefined) break;
      if (d < 0) out.push(`${tag}: the gate's top is above the surface`);
      const geo = gateOf(rho ?? NaN, g, b ?? NaN, H, d);
      same(rep.centroid, geo.hc, 'h_c');
      same(rep.center, geo.ycp, 'y_cp');
      if (b !== undefined && rho !== undefined) same(rep.force, geo.F, 'F');
      if (!(geo.ycp > geo.hc)) out.push(`${tag}: the center of pressure is not below the centroid`);
      if (!(geo.ycp < d + H)) out.push(`${tag}: the center of pressure is off the gate`);
      break;
    }
    case 'buoyancy': {
      const [V, rhoB, rho] = [si(rep.volume), si(rep.bodyDensity), si(rep.density)];
      if (rhoB === undefined || rho === undefined) break;
      const share = rhoB / rho;
      if (share >= 1) out.push(`~${tag}: the body sinks (drawn faded)`);
      same(rep.share, Math.min(1, share) * 100, 'the submerged share');
      if (V !== undefined) {
        const Vsub = V * Math.min(1, share);
        same(rep.submerged, Vsub, 'V_sub');
        same(rep.buoyant, rho * g * Vsub, 'F_B');
        // Floating: the drawn F_B and weight arrows are one length.
        if (share < 1 && !near(rho * g * Vsub, rhoB * g * V))
          out.push(`${tag}: F_B and the weight differ for a floating body`);
      }
      break;
    }
    case 'venturi': {
      const [D1, D2, rho, dP] = [
        si(rep.inlet),
        si(rep.throat),
        si(rep.density),
        si(rep.difference),
      ];
      const [V1, V2] = [si(rep.speed1), si(rep.speed2)];
      if (D1 !== undefined && D2 !== undefined && D2 >= D1)
        out.push(`~${tag}: the throat is no narrower than the inlet (drawn faded)`);
      if (D1 !== undefined && D2 !== undefined && V1 !== undefined && V2 !== undefined) {
        if (!near(areaOf(D1) * V1, areaOf(D2) * V2)) out.push(`${tag}: A₁V₁ ≠ A₂V₂`);
        same(rep.flow, areaOf(D1) * V1, 'Q');
      }
      if (rho !== undefined && V1 !== undefined && V2 !== undefined)
        same(rep.difference, 0.5 * rho * (V2 * V2 - V1 * V1), 'ΔP');
      // The piezometer columns differ by ΔP ÷ ρg, drawn on the metre scale.
      if (dP !== undefined && rho !== undefined && !(dP / (rho * g) >= 0))
        out.push(`${tag}: the throat column stands higher than the inlet's`);
      break;
    }
    case 'pitot': {
      const [V, dP, rho] = [si(rep.speed), si(rep.difference), si(rep.density)];
      if (V !== undefined && rho !== undefined) same(rep.difference, 0.5 * rho * V * V, 'ΔP');
      const rhoM = si(rep.gaugeDensity);
      if (
        dP !== undefined &&
        rhoM !== undefined &&
        rho !== undefined &&
        !(dP / ((rhoM - rho) * g) > 0)
      )
        out.push(`${tag}: the gauge reading is not above zero`);
      break;
    }
    case 'jet': {
      const [V, th, A, rho] = [si(rep.speed), si(rep.angle), si(rep.area), si(rep.density)];
      const mdot =
        A !== undefined && rho !== undefined && V !== undefined ? rho * V * A : si(rep.massFlow);
      same(rep.massFlow, mdot, 'ṁ');
      if (V === undefined || th === undefined || mdot === undefined) break;
      if (th <= 0 || th > 180) out.push(`${tag}: θ = ${th}° is outside 0–180°`);
      const F = jetForce(mdot, V, th);
      same(rep.forceX, F.Fx, 'Fₓ');
      same(rep.forceY, F.Fy, 'F_y');
      // The force on the vane opposes the jet's change of momentum (cos θ − 1, sin θ).
      const t = (th * Math.PI) / 180;
      const dot = F.Fx * (Math.cos(t) - 1) + F.Fy * Math.sin(t);
      if (!(dot <= 1e-9)) out.push(`${tag}: the force does not oppose the jet's turn`);
      break;
    }
    case 'pipe': {
      const hL = si(rep.headLoss);
      if (hL !== undefined && !(hL > 0))
        out.push(`${tag}: the grade lines do not fall in the flow direction (h_L ≤ 0)`);
      const [D, L, f, Q, rho] = [
        si(rep.diameter),
        si(rep.length),
        si(rep.friction),
        si(rep.flow),
        si(rep.density),
      ];
      const V = si(rep.speed) ?? (Q !== undefined && D !== undefined ? Q / areaOf(D) : undefined);
      if (Q !== undefined && D !== undefined) same(rep.speed, Q / areaOf(D), 'V = Q ÷ A');
      if (f !== undefined && L !== undefined && D !== undefined && V !== undefined)
        same(rep.headLoss, darcy(f, L, D, V, g), 'h_L');
      if (hL !== undefined && rho !== undefined) same(rep.drop, rho * g * hL, 'ΔP');
      // The gap between the lines is the velocity head.
      if (V !== undefined && !(V * V >= 0)) out.push(`${tag}: no velocity head`);
      if (rep.pump) {
        const [dz, hp] = [si(rep.rise), si(rep.pumpHead)];
        if (dz !== undefined && hL !== undefined) same(rep.pumpHead, dz + hL, 'h_p');
        const eta = si(rep.efficiency);
        if (rho !== undefined && Q !== undefined && hp !== undefined && eta !== undefined) {
          const share = typeof rep.efficiency === 'string' && eta > 1 ? eta / 100 : eta;
          same(rep.power, (rho * g * Q * hp) / share, 'P');
        }
      }
      break;
    }
    case 'parallel': {
      const Q = si(rep.flow);
      const [a, b] = rep.pipes.map((p) => ({
        D: si(p.diameter),
        L: si(p.length),
        Q: si(p.flow),
      }));
      if (Q !== undefined && a!.Q !== undefined && b!.Q !== undefined && !near(a!.Q + b!.Q, Q))
        out.push(`${tag}: Q₁ + Q₂ ≠ Q`);
      const C = si(rep.hazen);
      if (C !== undefined) {
        const hf = [a!, b!].map((p) =>
          p.D !== undefined && p.L !== undefined && p.Q !== undefined
            ? hazenWilliams(p.L, p.Q, C, p.D)
            : undefined,
        );
        if (hf[0] !== undefined && hf[1] !== undefined && !near(hf[0], hf[1], 5e-3))
          out.push(`${tag}: the two pipes' h_f differ (${hf[0]} and ${hf[1]})`);
        same(rep.headLoss, hf[0], 'h_f');
      }
      break;
    }
    case 'loop': {
      const pipes = rep.pipes.map((p) => ({ K: si(p.constant), Q: si(p.flow) }));
      if (pipes.some((p) => p.K === undefined || p.Q === undefined)) break;
      const hc = hardyCross(pipes as { K: number; Q: number }[]);
      same(rep.correction, hc.dQ, 'ΔQ');
      break;
    }
    case 'full': {
      const [Q, n, S, D, size] = [
        si(rep.flow),
        si(rep.manning),
        si(rep.slope),
        si(rep.diameter),
        si(rep.size),
      ];
      if (Q !== undefined && n !== undefined && S !== undefined)
        same(rep.diameter, manningFull(Q, n, S), 'D (Manning, full)');
      if (D !== undefined && size !== undefined && size < D * (1 - 1e-9))
        out.push(`${tag}: the size laid (${size}) is smaller than D (${D})`);
      break;
    }
    case 'plate': {
      const [V, L, nu] = [si(rep.speed), si(rep.length), si(rep.viscosity)];
      if (V === undefined || L === undefined || nu === undefined) break;
      const Re = (V * L) / nu;
      same(rep.reynolds, Re, 'Re_L');
      same(rep.thickness, layerAt(L, V, nu, !!rep.turbulent), 'δ(L)');
      if (!rep.turbulent && Re >= PLATE_LAMINAR_RE)
        out.push(`~${tag}: Re_L past 5 × 10⁵ on a laminar page (drawn faded)`);
      // The layer grows as √x: at L ÷ 2 it is δ ÷ √2 (laminar).
      const half = layerAt(L / 2, V, nu, !!rep.turbulent) / layerAt(L, V, nu, !!rep.turbulent);
      if (!near(half, rep.turbulent ? 0.5 ** 0.8 : Math.SQRT1_2))
        out.push(`${tag}: the layer does not grow as it should`);
      break;
    }
    case 'model': {
      const [Vp, Lp, Lm, nuP, nuM] = [
        si(rep.protoSpeed),
        si(rep.protoLength),
        si(rep.modelLength),
        si(rep.protoViscosity),
        si(rep.modelViscosity),
      ];
      if (Vp === undefined || Lp === undefined || Lm === undefined) break;
      if (rep.rule === 'reynolds' && (nuP === undefined || nuM === undefined)) break;
      same(rep.modelSpeed, modelSpeed(rep.rule, Vp, Lp, Lm, nuP, nuM), 'V_m');
      if (rep.rule === 'reynolds') same(rep.reynolds, (Vp * Lp) / nuP!, 'Re');
      break;
    }
  }
  return out;
}
