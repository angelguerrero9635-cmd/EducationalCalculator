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
import {
  layerRatio,
  siGetter,
  stefanFlux,
  TUBE_STATIONS,
  tubeCentre,
  tubeSpeed,
} from '@/components/module/reps/velocityProfileMath';

import type { NumOrVar } from '../typesGraphs';
import type { ControlVolumeSpec, CvStream, VelocityProfileSpec } from '../typesHe1f';
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
  if (rep.kind === 'velocityProfile') return velocityProfileIssues(rep, get);
  return [];
}

function velocityProfileIssues(spec: VelocityProfileSpec, get: Getter): string[] {
  const out: string[] = [];
  const si = siGetter(spec, (x) => get(x));
  const v = (f: keyof VelocityProfileSpec) => si(f);
  if (spec.mode === 'tube') {
    const [R, Q, vavg, vmax] = [v('R'), v('Q'), v('vavg'), v('vmax')];
    if (R !== undefined && R <= 0) out.push(`velocityProfile: radius ${R} is not positive`);
    // v_max = 2v_avg, and the centre speed is 2Q ÷ πR².
    if (vavg !== undefined && vmax !== undefined && !near(vmax, 2 * vavg))
      out.push(`velocityProfile: v_max ${vmax}, but 2v_avg = ${2 * vavg}`);
    if (Q !== undefined && R !== undefined && R > 0) {
      const centre = tubeCentre(Q, R);
      if (vmax !== undefined && !near(vmax, centre))
        out.push(`velocityProfile: v_max ${vmax}, but 2Q ÷ πR² = ${centre}`);
      if (vavg !== undefined && !near(vavg, centre / 2))
        out.push(`velocityProfile: v_avg ${vavg}, but Q ÷ πR² = ${centre / 2}`);
      // The arrows: the centre one is v_max, each is v_max(1 − r²/R²), so they scale with Q.
      const arrows = TUBE_STATIONS.map((st) => tubeSpeed(centre, st));
      if (!near(Math.max(...arrows), centre))
        out.push('velocityProfile: the centre arrow is not the fastest');
    }
    // τ_w = ΔPR ÷ 2L, and ΔP = P₁ − P₂.
    const [dP0, P1, P2, L, tau] = [v('dP'), v('P1'), v('P2'), v('L'), v('tauW')];
    if (dP0 !== undefined && P1 !== undefined && P2 !== undefined && !near(dP0, P1 - P2))
      out.push(`velocityProfile: ΔP ${dP0}, but P₁ − P₂ = ${P1 - P2}`);
    const dP = dP0 ?? (P1 !== undefined && P2 !== undefined ? P1 - P2 : undefined);
    if (dP !== undefined && R !== undefined && L !== undefined && tau !== undefined && L > 0)
      if (!near(tau, (dP * R) / (2 * L)))
        out.push(`velocityProfile: τ_w ${tau}, but ΔPR ÷ 2L = ${(dP * R) / (2 * L)}`);
    // A page with μ and no ΔP or L draws τ_w = 4μQ ÷ πR³ (the wall's shear from the flow); with
    // ΔP and L the page's τ_w = ΔPR ÷ 2L above is the one drawn.
    const mu = v('mu');
    const direct = spec.dP === undefined && spec.P1 === undefined && spec.L === undefined;
    if (
      direct &&
      mu !== undefined &&
      Q !== undefined &&
      R !== undefined &&
      tau !== undefined &&
      R > 0
    )
      if (!near(tau, (4 * mu * Q) / (Math.PI * R ** 3)))
        out.push(
          `velocityProfile: τ_w ${tau}, but 4μQ ÷ πR³ = ${(4 * mu * Q) / (Math.PI * R ** 3)}`,
        );
  }
  if (spec.mode === 'plates') {
    const [mu, V, h, tau] = [v('mu'), v('V'), v('h'), v('tauW')];
    if (mu !== undefined && V !== undefined && h !== undefined && tau !== undefined && h > 0)
      if (!near(tau, (mu * V) / h))
        out.push(`velocityProfile: τ ${tau}, but μV ÷ h = ${(mu * V) / h}`);
  }
  if (spec.mode === 'film') {
    const [vavg, vmax] = [v('vavg'), v('vmax')];
    if (vavg !== undefined && vmax !== undefined && !near(vmax, 1.5 * vavg))
      out.push(`velocityProfile: film v_max ${vmax}, but 1.5v_avg = ${1.5 * vavg}`);
    const beta = v('angle');
    if (beta !== undefined && (beta < 0 || beta >= 90))
      out.push(`velocityProfile: a film at ${beta}° from vertical doesn't fall`);
  }
  if (spec.mode === 'concentration') {
    // The line is straight: one flux, N_A = D(c_A1 − c_A2) ÷ L.
    const [D, c1, c2, L, N] = [v('D'), v('cA1'), v('cA2'), v('L'), v('flux')];
    if ([c1, c2].some((x) => x !== undefined && x < 0))
      out.push('velocityProfile: a negative concentration');
    if (
      D !== undefined &&
      c1 !== undefined &&
      c2 !== undefined &&
      L !== undefined &&
      N !== undefined &&
      L > 0
    )
      if (!near(N, (D * (c1 - c2)) / L))
        out.push(`velocityProfile: N_A ${N}, but D(c_A1 − c_A2) ÷ L = ${(D * (c1 - c2)) / L}`);
  }
  if (spec.mode === 'stefan') {
    const [x1, x2, cc, D, L, N] = [v('x1'), v('x2'), v('c'), v('D'), v('L'), v('flux')];
    if ([x1, x2].some((x) => x !== undefined && (x < 0 || x >= 1)))
      out.push('velocityProfile: a mole fraction outside 0 to 1');
    if ([x1, x2, cc, D, L, N].every((x) => x !== undefined) && L! > 0 && x1! < 1 && x2! < 1)
      if (!near(N!, stefanFlux(cc!, D!, L!, x1!, x2!)))
        out.push(
          `velocityProfile: N_A ${N}, but (cD ÷ L) ln((1 − x₂) ÷ (1 − x₁)) = ${stefanFlux(cc!, D!, L!, x1!, x2!)}`,
        );
  }
  if (spec.mode === 'analogy') {
    // The drawn layers: δ_T ÷ δ = Pr^(−1/3), δ_c ÷ δ = Sc^(−1/3).
    for (const f of ['Pr', 'Sc'] as const) {
      const n = v(f);
      if (n !== undefined && !(n > 0)) out.push(`velocityProfile: ${f} ${n} is not positive`);
      if (n !== undefined && n > 0 && !near(layerRatio(n) ** -3, n))
        out.push(`velocityProfile: the ${f} layer is not δ${f}^(−1/3)`);
    }
  }
  return out;
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
