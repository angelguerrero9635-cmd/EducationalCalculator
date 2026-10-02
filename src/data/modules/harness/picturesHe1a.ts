/**
 * Picture checks for the college `beam` (HC1, group A of round 1; `typesHe1a.ts`): what it
 * draws must agree with the values. Called from `repIssues` in `pictures.ts` with a reader of
 * formula units (`siOf`). Test-only.
 */
import {
  diagramSamples,
  extremes,
  halfWave,
  influenceLine,
  keyPoints,
  loadTotals,
  maxDeflection,
  momentDistribution,
  solveBeam,
  type BeamLoadModel,
  type BeamModel,
} from '@/components/module/reps/beamMath';

import { geometryOf, type BeamSpec } from '../typesHe1a';

type Val = (id: string) => number | undefined;
type X = number | string | undefined;

const near = (a: number, b: number, scale = 0) =>
  Math.abs(a - b) <= 1e-4 * Math.max(Math.abs(a), Math.abs(b), scale) + 1e-9;

const read = (val: Val, x: X, fallback?: number) =>
  x === undefined ? fallback : typeof x === 'number' ? x : val(x);

/** The beam a spec draws, in formula units, or undefined while a value it needs is blank. */
export function beamModelOf(rep: BeamSpec, val: Val): BeamModel | undefined {
  const geo = geometryOf(rep, (x) => read(val, x));
  const L = geo.length;
  if (L === undefined || !(L > 0)) return undefined;
  const clamp = (x: number) => Math.min(L, Math.max(0, x));
  const supports: BeamModel['supports'] = [];
  for (const s of geo.supports) {
    if (s.x === undefined) return undefined;
    supports.push({ x: clamp(s.x), kind: s.kind });
  }
  const loads: BeamLoadModel[] = [];
  for (const l of rep.loads ?? []) {
    const size = read(val, l.size);
    if (size === undefined) return undefined;
    if (l.kind === 'point') {
      const x = read(val, l.at);
      if (x === undefined) return undefined;
      loads.push({ kind: 'point', x: clamp(x), P: size });
      continue;
    }
    const [a, b] = [read(val, l.from, 0), read(val, l.to, L)];
    if (a === undefined || b === undefined) return undefined;
    const high = l.peak === 'from';
    loads.push({
      kind: 'spread',
      a: clamp(a),
      b: clamp(b),
      wa: l.kind === 'uniform' || high ? size : 0,
      wb: l.kind === 'uniform' || !high ? size : 0,
    });
  }
  return { L, supports, loads };
}

/** The `beam` picture: statics, the diagrams, the bent shape and each mode's drawn values. */
export function he1aIssues(rep: BeamSpec, val: Val): string[] {
  const out: string[] = [];
  const same = (id: X, want: number | undefined, what: string, scale = 0) => {
    const x = typeof id === 'string' ? val(id) : undefined;
    if (x !== undefined && want !== undefined && Number.isFinite(want) && !near(x, want, scale))
      out.push(`beam: ${what} ${String(id)} = ${x}, the picture draws ${want}`);
  };
  const mode = rep.mode ?? 'beam';

  if (mode === 'beam') {
    const model = beamModelOf(rep, val);
    if (!model) return out;
    const sol = solveBeam(model);
    if (!sol.ok) return out;
    const tot = loadTotals(model.loads);
    const scaleF = Math.max(1e-9, Math.abs(tot.F), ...sol.R.map(Math.abs));
    const scaleM = Math.max(1e-9, Math.abs(tot.M0), ...sol.Mr.map(Math.abs));
    // ΣF = 0 and ΣM = 0 (about the left end) with the drawn reactions.
    const sumR = sol.R.reduce((s, r) => s + r, 0);
    if (!near(sumR, tot.F, scaleF))
      out.push(`beam: reactions ${sumR} don't balance the load ${tot.F}`);
    const sumM = model.supports.reduce((s, p, i) => s + sol.R[i]! * p.x + sol.Mr[i]!, 0);
    if (!near(sumM, tot.M0, scaleM)) out.push(`beam: moments ${sumM} don't balance ${tot.M0}`);
    geometryOf(rep, (x) => read(val, x)).supports.forEach((s, i) => {
      same(s.reaction, sol.R[i], `reaction at ${s.name ?? i}`, scaleF);
      same(s.moment, Math.abs(sol.Mr[i]!), `wall moment at ${s.name ?? i}`, scaleM);
    });
    // V jumps by each point load (and reaction) where it stands.
    const eps = 1e-7 * model.L;
    for (const x of keyPoints(model)) {
      if (x <= 0 || x >= model.L) continue;
      let jump = 0;
      model.loads.forEach((l) => {
        if (l.kind === 'point' && Math.abs(l.x - x) <= 1e-9 * model.L) jump -= l.P;
      });
      model.supports.forEach((p, i) => {
        if (Math.abs(p.x - x) <= 1e-9 * model.L) jump += sol.R[i]!;
      });
      const dv = sol.V(x + eps) - sol.V(x - eps);
      if (!near(dv, jump, scaleF)) out.push(`beam: V jumps by ${dv} at x = ${x}, not ${jump}`);
    }
    // The area under V between key points is the change in M.
    const keys = keyPoints(model);
    for (let i = 1; i < keys.length; i++) {
      const [a, b] = [keys[i - 1]!, keys[i]!];
      const n = 200;
      let area = 0;
      for (let k = 0; k < n; k++) area += sol.V(a + ((b - a) * (k + 0.5)) / n) * ((b - a) / n);
      const dM = sol.M(b) - sol.M(a);
      if (Math.abs(area - dM) > 1e-3 * scaleM + 1e-9)
        out.push(`beam: area under V from ${a} to ${b} is ${area}, M changes by ${dM}`);
    }
    // M peaks where V crosses zero.
    const ex = extremes(model, sol);
    for (const z of ex.crossings) {
      const d = 1e-3 * model.L;
      const [m0, ml, mr] = [sol.M(z), sol.M(z - d), sol.M(z + d)];
      const peak =
        (m0 >= ml - 1e-9 * scaleM && m0 >= mr - 1e-9 * scaleM) ||
        (m0 <= ml + 1e-9 * scaleM && m0 <= mr + 1e-9 * scaleM);
      if (!peak) out.push(`beam: V crosses 0 at x = ${z} but M doesn't peak there`);
    }
    const at = read(val, rep.at);
    // (A section past the ends isn't drawn; the page's limits keep it on the span.)
    if (at !== undefined && at >= 0 && at <= model.L) {
      const x = Math.min(model.L, Math.max(0, at));
      same(rep.shear, sol.V(x), 'shear at x', scaleF);
      same(rep.moment, sol.M(x), 'moment at x', scaleM);
    }
    same(rep.maxShear, Math.abs(ex.vMax.V), 'largest shear', scaleF);
    same(rep.maxMoment, Math.abs(ex.mMax.M), 'largest moment', scaleM);
    // The bent shape meets every support and sags the way the load pushes.
    if (rep.deflection) {
      const d = maxDeflection(model, sol);
      const big = Math.max(1e-30, Math.abs(d.y));
      for (const p of model.supports)
        if (Math.abs(sol.y(p.x)) > 1e-6 * big)
          out.push(`beam: the bent shape misses the support at ${p.x}`);
      const down = model.loads.every((l) =>
        l.kind === 'point' ? l.P >= 0 : l.wa >= 0 && l.wb >= 0,
      );
      if (down && model.supports.length <= 2 && d.y > 0)
        out.push('beam: the bent shape rises under loads that push down');
    }
    // Influence lines: the named ordinates are the drawn ones.
    if (rep.influence) {
      const c = read(val, rep.influence.at);
      if (c !== undefined) {
        const line = influenceLine({ ...model, loads: [] }, rep.influence.of, c);
        const e = 1e-8 * model.L;
        const pick = (x: number) =>
          line.reduce((b, p) => (Math.abs(p.x - x) < Math.abs(b.x - x) ? p : b)).y;
        // (At a support's own place there is no "just left" and "just right" on the beam.)
        const inside = c > 1e-5 * model.L && c < model.L * (1 - 1e-5);
        if (rep.influence.of === 'shear' && !inside) {
          // nothing drawn to compare
        } else if (rep.influence.of === 'shear') {
          // (Ordinates per unit load: within 10⁻⁴ of 1, and of L for a moment's.)
          same(rep.influence.left, pick(c - e), 'shear ordinate left of c', 1);
          same(rep.influence.right, pick(c + e), 'shear ordinate right of c', 1);
        } else
          same(
            rep.influence.ordinate,
            pick(c),
            'influence ordinate at c',
            rep.influence.of === 'moment' ? model.L : 1,
          );
      }
    }
    // Moment distribution: the named factors, fixed-end moments and moment are the table's.
    if (rep.continuous) {
      const names = geometryOf(rep, (x) => read(val, x)).supports.map(
        (s, i) => s.name ?? 'ABCDEFGH'[i]!,
      );
      const t = momentDistribution(model, names, rep.continuous.far);
      if (t) {
        rep.continuous.df?.forEach((id, k) => same(id, t.df[1 + k], 'distribution factor'));
        rep.continuous.fem?.forEach((id, k) =>
          same(id, Math.abs(t.fem[1 + k]!), 'fixed-end moment', scaleM),
        );
        same(
          rep.continuous.moment,
          Math.abs(t.final[1]!),
          'moment at the first interior support',
          scaleM,
        );
        // The table settles on the moment the beam has there.
        const xB = [...model.supports].sort((a, b) => a.x - b.x)[1]!.x;
        if (!near(Math.abs(t.final[1]!), Math.abs(sol.M(xB)), scaleM * 3))
          out.push(`beam: the table's moment ${t.final[1]} isn't the beam's ${sol.M(xB)}`);
      }
    }
    if (diagramSamples(model, sol, 4).some((p) => !Number.isFinite(p.V) || !Number.isFinite(p.M)))
      out.push('beam: the diagrams have a value that is not a number');
    return out;
  }

  if (mode === 'column' && rep.column) {
    const k = read(val, rep.column.k);
    const L = read(val, rep.length);
    if (k === undefined) return out;
    if (![0.5, 0.7, 1, 2].some((x) => near(x, k)))
      out.push(`beam: column K = ${k} is not one of 0.5, 0.7, 1, 2`);
    else {
      const [a, b] = halfWave([0.5, 0.7, 1, 2].find((x) => near(x, k))!);
      if (Math.abs(b - a - k) > 0.01)
        out.push(`beam: the drawn half-wave is ${b - a} L, not K = ${k}`);
    }
    if (L !== undefined) same(rep.column.effective, k * L, 'effective length KL');
    return out;
  }

  if (mode === 'axial' && rep.axial) {
    const ax = rep.axial;
    const E0 = read(val, ax.modulus, 1);
    // Each segment's force: the end load plus every load to its right.
    const end = read(val, ax.load, 0);
    const segs = ax.segments.map((s) => {
      const L = read(val, s.length);
      const d = read(val, s.diameter);
      const A =
        s.area !== undefined
          ? read(val, s.area)
          : d !== undefined
            ? (Math.PI * d * d) / 4
            : undefined;
      const E = read(val, s.modulus, E0);
      return { L, A, E, own: read(val, s.load, 0) };
    });
    if (
      end === undefined ||
      segs.some(
        (s) => s.L === undefined || s.A === undefined || s.E === undefined || s.own === undefined,
      )
    )
      return out;
    const force = segs.map((_, i) => end + segs.slice(i).reduce((t, s) => t + (s.own ?? 0), 0));
    const flex = segs.map((s, i) => (force[i]! * s.L!) / (s.A! * s.E!));
    // δᵢ in proportion to FᵢLᵢ ÷ (AᵢEᵢ), whatever the page's units.
    const named = ax.segments.map((s) => read(val, s.delta));
    const ref = named.findIndex((x, i) => x !== undefined && Math.abs(flex[i]!) > 0);
    if (ref >= 0) {
      const k = named[ref]! / flex[ref]!;
      named.forEach((x, i) => {
        if (x !== undefined && !near(x, k * flex[i]!))
          out.push(`beam: δ of segment ${i + 1} is ${x}, not ${k * flex[i]!}`);
      });
    }
    const total = read(val, ax.total);
    if (total !== undefined && named.every((x) => x !== undefined) && !ax.walls) {
      const sum = named.reduce((t, x) => t! + x!, 0)!;
      if (!near(total, sum)) out.push(`beam: δ = ${total} isn't the segments' sum ${sum}`);
    }
    return out;
  }

  if (mode === 'plate' && rep.plate) {
    const p = rep.plate;
    const edge =
      typeof p.edge === 'string' && (p.edge === 'clamped' || p.edge === 'simple')
        ? undefined
        : read(val, p.edge);
    if (edge !== undefined && edge < 1 - 1e-9)
      out.push(`beam: plate edge factor ${edge} is below 1 (clamped)`);
    for (const [id, what] of [
      [p.radius, 'radius'],
      [p.thickness, 'thickness'],
    ] as const) {
      const x = read(val, id);
      if (x !== undefined && !(x > 0)) out.push(`beam: plate ${what} ${x} is not positive`);
    }
    return out;
  }

  if (mode === 'panel' && rep.panel) {
    const k = read(val, rep.panel.k);
    if (k !== undefined && !(k > 0)) out.push(`beam: panel k = ${k} is not positive`);
    return out;
  }
  return out;
}
