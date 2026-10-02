/**
 * Picture checks for the college round 1 group F kinds (`typesHe1f.ts`): HC5 `controlVolume`
 * and HC13 `velocityProfile`. What each draws must agree with the values and the balances.
 * Called from `repIssues` in `pictures.ts`. Test-only.
 */
import {
  balances,
  componentFlows,
  energyBalance,
  foodToMass,
  holdsBalance,
  residenceTime,
  stageFactor,
  stagesLeft,
  streamSide,
  streamTotal,
  type Getter,
} from '@/components/module/reps/controlVolumeMath';

import type { NumOrVar } from '../typesGraphs';
import type { ControlVolumeSpec, CvStream } from '../typesHe1f';
import type { Representation } from '../types';

/** Equal to 0.1% (or 10⁻⁶ near zero, below what a page shows). */
const near = (a: number, b: number, tol = 1e-3) =>
  Math.abs(a - b) <= tol * Math.max(1e-3, Math.abs(a), Math.abs(b));

export function he1fIssues(rep: Representation, val: (id: string) => number | undefined): string[] {
  const get: Getter = (x: NumOrVar | undefined) => {
    if (x === undefined) return undefined;
    const y = typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  if (rep.kind === 'controlVolume') return controlVolumeIssues(rep, get);
  return [];
}

function controlVolumeIssues(spec: ControlVolumeSpec, get: Getter): string[] {
  const out: string[] = [];
  const kind = spec.device ?? spec.unit ?? 'box';
  // Every stream's arrow points the way it flows: inlets into the unit, outlets away from it.
  spec.streams.forEach((s, i) => {
    const side = streamSide(spec, i);
    if (s.dir === 'in' && side !== 'L') out.push(`controlVolume: inlet ${s.name} drawn leaving`);
    if (s.dir === 'out' && side === 'L') out.push(`controlVolume: outlet ${s.name} drawn entering`);
    // Fractions are shares: each from 0 to 1, together at most 1.
    const xs = (s.fractions ?? []).map((f) => get(f.x));
    if (xs.some((x) => x !== undefined && (x < -1e-9 || x > 1 + 1e-9)))
      out.push(`controlVolume: ${s.name} has a fraction outside 0 to 1`);
    if (xs.every((x) => x !== undefined) && xs.reduce((a, b) => a + b!, 0) > 1 + 1e-6)
      out.push(`controlVolume: ${s.name}'s fractions add to more than 1`);
  });
  if (!spec.streams.some((s) => s.dir === 'in') && kind !== 'stream')
    out.push('controlVolume: no stream enters');
  // Every component's total in (plus what the reaction makes) equals its total out, to 0.1%.
  if (kind !== 'stream' && !spec.dof)
    for (const b of balances(spec, get))
      if (!holdsBalance(b))
        out.push(
          `controlVolume: ${b.name} in ${b.into}${b.made ? ` + ${b.made}` : ''} ≠ out ${b.out}`,
        );
  // Σṁh in + Q̇ = Σṁh out + Ẇ.
  const e = energyBalance(spec, get);
  if (e) {
    const tIn = e.into.reduce((a, p) => a + p.value, 0);
    const tOut = e.out.reduce((a, p) => a + p.value, 0);
    if (!near(tIn, tOut)) out.push(`controlVolume: energy in ${tIn} ≠ energy out ${tOut}`);
  }
  // The column's recovery: the light key leaving in the distillate over what came in.
  if (kind === 'column' && spec.recovery !== undefined) {
    const [feed, top] = spec.streams;
    const name = feed?.fractions?.[0]?.name;
    const r = get(spec.recovery);
    if (feed && top && name && r !== undefined) {
      const fin = componentFlows(feed, get).get(name);
      const fout = componentFlows(top, get).get(name);
      if (fin !== undefined && fout !== undefined && fin > 0) {
        const want = (fout / fin) * (spec.recoveryPercent ? 100 : 1);
        if (!near(r, want)) out.push(`controlVolume: recovery ${r}, but Dx_D ÷ Fz = ${want}`);
      }
    }
  }
  // The bypass: the split, the evaporator and the mixing point each balance too.
  if (kind === 'evaporator' && spec.bypass) {
    const [feed, vapour, product, bypass, evapFeed, conc] = spec.streams;
    if (!feed || !vapour || !product || !bypass || !evapFeed || !conc)
      out.push('controlVolume: a bypass needs six streams');
    else {
      const node = (name: string, ins: CvStream[], outs: CvStream[]) => {
        const sum = (ss: CvStream[]) => {
          const xs = ss.map((s) => streamTotal(s, get));
          return xs.some((x) => x === undefined) ? undefined : xs.reduce((a, b) => a! + b!, 0)!;
        };
        const [a, b] = [sum(ins), sum(outs)];
        if (a !== undefined && b !== undefined && !near(a, b))
          out.push(`controlVolume: ${name} in ${a} ≠ out ${b}`);
      };
      node('split', [feed], [bypass, evapFeed]);
      node('evaporator', [evapFeed], [vapour, conc]);
      node('mixing point', [conc, bypass], [product]);
    }
  }
  // The steam that condenses supplies the heater's duty: Q̇ = ṁ_sλ.
  if (spec.steam && spec.heat !== undefined) {
    const [q, m, l] = [get(spec.heat), get(spec.steam.flow), get(spec.steam.latent)];
    if (q !== undefined && m !== undefined && l !== undefined && !near(q, m * l))
      out.push(`controlVolume: Q̇ ${q}, but ṁ_sλ = ${m * l}`);
  }
  // A tank's residence time and an aeration tank's F/M.
  if (spec.volume !== undefined) {
    const V = get(spec.volume);
    const q = spec.streams[0] ? streamTotal(spec.streams[0], get) : undefined;
    if (spec.residence) {
      const tau = get(spec.residence.tau);
      if (V !== undefined && q !== undefined && tau !== undefined && q > 0) {
        const want = residenceTime(V, q, spec.residence.factor);
        if (!near(tau, want)) out.push(`controlVolume: τ ${tau}, but V ÷ q = ${want}`);
      }
    }
    if (spec.loading) {
      const [S0, X, fm] = [
        get(spec.loading.substrate),
        get(spec.loading.biomass),
        get(spec.loading.ratio),
      ];
      if ([V, q, S0, X, fm].every((x) => x !== undefined) && V! * X! > 0) {
        const want = foodToMass(q!, S0!, V!, X!);
        if (!near(fm!, want)) out.push(`controlVolume: F/M ${fm}, but QS₀ ÷ (VX) = ${want}`);
      }
    }
  }
  // Extraction stages: the fraction left and the extraction factor per stage.
  if (spec.stages) {
    const st = spec.stages;
    const [n, kd, ratio] = [get(st.count), get(st.kd), get(st.ratio)];
    if (n !== undefined && (n < 1 || n > 10 || Math.abs(n - Math.round(n)) > 1e-9))
      out.push(`controlVolume: ${n} stages (the chain draws 1 to 10)`);
    if (n !== undefined && kd !== undefined && ratio !== undefined && n >= 1) {
      const left = get(st.left);
      const want = stagesLeft(Math.round(n), kd, ratio, st.flow);
      if (left !== undefined && !near(left, want))
        out.push(`controlVolume: ${left} left, but ${st.flow} stages leave ${want}`);
      const E = get(st.factor);
      const wantE = stageFactor(Math.round(n), kd, ratio, st.flow);
      if (E !== undefined && !near(E, wantE))
        out.push(`controlVolume: E ${E}, but the stage's K_DS ÷ F = ${wantE}`);
    }
  }
  // Degrees of freedom: the lit unknowns are counted, and DOF = U − B − S − R.
  if (spec.dof) {
    const [u, b, s, r, d] = [
      get(spec.dof.unknowns),
      get(spec.dof.balances),
      get(spec.dof.specs),
      get(spec.dof.relations),
      get(spec.dof.dof),
    ];
    if ([u, b, s, r, d].every((x) => x !== undefined) && !near(d!, u! - b! - s! - r!))
      out.push(`controlVolume: DOF ${d}, but ${u} − ${b} − ${s} − ${r} = ${u! - b! - s! - r!}`);
  }
  // Reverse osmosis: J_w = A_w(ΔP − π), and no flux unless ΔP > π.
  if (spec.pressure) {
    const p = spec.pressure;
    const [dP, pi, A, J] = [get(p.applied), get(p.osmotic), get(p.permeability), get(p.flux)];
    if (dP !== undefined && pi !== undefined && A !== undefined && J !== undefined) {
      const want = A * (dP - pi);
      if (!near(J, want, 2e-3)) out.push(`controlVolume: J_w ${J}, but A_w(ΔP − π) = ${want}`);
    }
  }
  // Gas permeation: y ÷ (1 − y) = αx ÷ (1 − x) between the feed and the permeate.
  if (spec.selectivity !== undefined && kind === 'membrane') {
    const a = get(spec.selectivity);
    const x = get(spec.streams[0]?.fractions?.[0]?.x);
    const y = get(spec.streams[2]?.fractions?.[0]?.x);
    if (a !== undefined && x !== undefined && y !== undefined && x < 1 && y < 1) {
      if (!near(y / (1 - y), (a * x) / (1 - x)))
        out.push(
          `controlVolume: y ${y}, but y ÷ (1 − y) = αx ÷ (1 − x) gives ${(a * x) / (1 - x + a * x)}`,
        );
    }
  }
  return out;
}
