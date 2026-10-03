/**
 * Picture checks for college round 4, group L (docs/RENDERINGS_HE.md, the mechanical plan's
 * pictures). Each check works its answer out independently of the picture and requires the
 * page's values to agree. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import type { VariableDef } from '@/engine/types';
import { cuspOf, MOODY_LAMINAR, si4l, trainValue } from '@/components/module/reps/he4lMath';

import type { Representation } from '../types';
import { siOf } from './picturesHs2c';
import type { GearPairSpec, He4lSpec, MoodyChartSpec, PrintLayersSpec } from '../typesHe4l';

type Val = (x: string | number) => number | undefined;
type X = string | number | undefined;

const close = (a: number, b: number, rel = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(1e-12, Math.abs(a), Math.abs(b));

const HE4L_KINDS: string[] = ['moodyChart', 'gearPair', 'printLayers'];
const isHe4l = (r: Representation): r is He4lSpec => HE4L_KINDS.includes(r.kind);

/** The group L checks, by kind. */
export function he4lIssues(
  rep: Representation,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  if (!isHe4l(rep)) return [];
  // `val` reads the shown unit; `formula` the variable's own (its unitFactor).
  const formula = siOf(val, byId);
  const get = (x: X) => (x === undefined ? undefined : typeof x === 'number' ? x : formula(x));
  /** A value in SI, from its variable's unit (`unit` for a fixed number). */
  const si = (x: X, unit: string) => {
    const v = get(x);
    if (v === undefined) return undefined;
    return v * si4l(typeof x === 'string' ? (byId.get(x)?.unit ?? unit) : unit);
  };
  switch (rep.kind) {
    case 'moodyChart':
      return moodyIssues(rep, get, si);
    case 'gearPair':
      return gearIssues(rep, get, si);
    case 'printLayers':
      return printIssues(rep, get, si);
  }
}

/**
 * HC165: the point lies on its curve: f = 64 ÷ Re below 2300, else f satisfies Colebrook
 * itself (the residual 1 ÷ √f + 2 log₁₀(ε ÷ 3.7D + 2.51 ÷ (Re√f)) is checked directly, not by
 * re-running the picture's iteration); ε ÷ D is not negative; a family curve is on the chart.
 */
function moodyIssues(
  rep: MoodyChartSpec,
  get: (x: X) => number | undefined,
  si: (x: X, unit: string) => number | undefined,
): string[] {
  const out: string[] = [];
  const re = get(rep.re);
  const f = get(rep.f);
  const rough =
    rep.roughness !== undefined
      ? get(rep.roughness)
      : (() => {
          const [e, D] = [si(rep.epsilon, 'm'), si(rep.diameter, 'm')];
          return e === undefined || D === undefined || D <= 0 ? undefined : e / D;
        })();
  if (rough !== undefined && rough < 0) out.push(`Moody: ε ÷ D = ${rough} is negative`);
  for (const x of rep.curves ?? [])
    if (x < 0 || x > 0.05) out.push(`Moody: a family curve at ε ÷ D = ${x}, off the chart`);
  if (re === undefined || f === undefined || !(re > 0) || !(f > 0)) return out;
  if (re < MOODY_LAMINAR) {
    if (!close(f, 64 / re, 1e-4)) out.push(`Moody: laminar f = ${f} is not 64 ÷ Re = ${64 / re}`);
    return out;
  }
  if (rough === undefined) return out;
  const residual = 1 / Math.sqrt(f) + 2 * Math.log10(rough / 3.7 + 2.51 / (re * Math.sqrt(f)));
  if (Math.abs(residual) > 1e-4 / Math.sqrt(f))
    out.push(`Moody: the point f = ${f} at Re = ${re} is off the ε ÷ D = ${rough} curve`);
  return out;
}

/**
 * HC166: at least 3 teeth (the picture rounds N to draw); each mesh has n_aN_a = n_bN_b (gears on one shaft turn
 * together); each mesh's pitch circles touch, so both gears have one module (d ÷ N agree, and
 * d = mN when the page gives m); the train value is ΠN_driving ÷ ΠN_driven and n_out = e n_in;
 * V = πd₁n₁ and W_t = P ÷ V (in SI).
 */
function gearIssues(
  rep: GearPairSpec,
  get: (x: X) => number | undefined,
  si: (x: X, unit: string) => number | undefined,
): string[] {
  const out: string[] = [];
  const count = rep.teeth.length;
  if (count < 2 || count > 4) out.push(`gears: ${count} gears (2 to 4 are drawn)`);
  const N = rep.teeth.map(get);
  N.forEach((n, i) => {
    if (n !== undefined && n < 3) out.push(`gears: N${i + 1} = ${n} is fewer than 3 teeth`);
  });
  const opt = (x: X | null | undefined) => (x === null ? undefined : x);
  const n = (i: number) => get(opt(rep.speeds?.[i]));
  const d = (i: number) => get(opt(rep.diameters?.[i]));
  const meshes: [number, number][] =
    count === 4
      ? [
          [0, 1],
          [2, 3],
        ]
      : count === 3
        ? [
            [0, 1],
            [1, 2],
          ]
        : [[0, 1]];
  for (const [a, b] of meshes) {
    const [Na, Nb, na, nb] = [N[a], N[b], n(a), n(b)];
    if ([Na, Nb, na, nb].every((x) => x !== undefined) && !close(na! * Na!, nb! * Nb!))
      out.push(`gears: n${a + 1}N${a + 1} = ${na! * Na!} but n${b + 1}N${b + 1} = ${nb! * Nb!}`);
    const [da, db] = [d(a), d(b)];
    if ([Na, Nb, da, db].every((x) => x !== undefined) && !close(da! / Na!, db! / Nb!))
      out.push(
        `gears: gears ${a + 1} and ${b + 1} have different modules, so their pitch circles cannot roll together`,
      );
  }
  if (count === 4 && n(1) !== undefined && n(2) !== undefined && !close(n(1)!, n(2)!))
    out.push('gears: gears 2 and 3 share a shaft but turn at different speeds');
  const m = get(rep.module);
  if (m !== undefined)
    N.forEach((Ni, i) => {
      const di = d(i);
      if (Ni !== undefined && di !== undefined && !close(di, m * Ni))
        out.push(`gears: d${i + 1} = ${di} is not mN = ${m * Ni}`);
    });
  const known = N.every((x) => x !== undefined);
  const e = get(rep.value);
  if (known && e !== undefined && !close(e, trainValue(N as number[])))
    out.push(`gears: e = ${e} is not ΠN driving ÷ ΠN driven = ${trainValue(N as number[])}`);
  const [nIn, nOut] = [n(0), n(count - 1)];
  if (
    known &&
    nIn !== undefined &&
    nOut !== undefined &&
    !close(nOut, trainValue(N as number[]) * nIn)
  )
    out.push(`gears: n out = ${nOut} is not e × n in`);
  const [d1, n1, V] = [
    si(opt(rep.diameters?.[0]), 'mm'),
    si(opt(rep.speeds?.[0]), 'rpm'),
    si(rep.pitchSpeed, 'm/s'),
  ];
  if (d1 !== undefined && n1 !== undefined && V !== undefined && !close(V, Math.PI * d1 * n1))
    out.push(`gears: V = ${V} m/s is not πd₁n₁ = ${Math.PI * d1 * n1} m/s`);
  const [P, W] = [si(rep.power, 'W'), si(rep.force, 'N')];
  if (P !== undefined && W !== undefined && V !== undefined && V > 0 && !close(W, P / V))
    out.push(`gears: W_t = ${W} N is not P ÷ V = ${P / V} N`);
  return out;
}

/**
 * HC167: n = H ÷ t; c = t cos θ; t_layer = A ÷ (sv) + t_r; T = n t_layer (all in SI); t > 0 and
 * θ within 0° to 90°.
 */
function printIssues(
  rep: PrintLayersSpec,
  get: (x: X) => number | undefined,
  si: (x: X, unit: string) => number | undefined,
): string[] {
  const out: string[] = [];
  const [t, H, n, th, cusp] = [
    si(rep.layer, 'mm'),
    si(rep.height, 'mm'),
    get(rep.layers),
    get(rep.angle),
    si(rep.cusp, 'mm'),
  ];
  if (t !== undefined && t <= 0) out.push(`layers: t = ${t} is not positive`);
  if (th !== undefined && (th < 0 || th > 90)) out.push(`layers: θ = ${th}° is outside 0° to 90°`);
  if (t !== undefined && H !== undefined && n !== undefined && t > 0 && !close(n, H / t))
    out.push(`layers: n = ${n} is not H ÷ t = ${H / t}`);
  if (t !== undefined && th !== undefined && cusp !== undefined && !close(cusp, cuspOf(t, th)))
    out.push(`layers: c = ${cusp} m is not t cos θ = ${cuspOf(t, th)} m`);
  const [A, s, v, tr, tl, T] = [
    si(rep.area, 'mm²'),
    si(rep.hatch, 'mm'),
    si(rep.speed, 'mm/s'),
    si(rep.recoat, 's'),
    si(rep.layerTime, 's'),
    si(rep.buildTime, 'h'),
  ];
  if ([A, s, v, tr, tl].every((x) => x !== undefined) && s! * v! > 0) {
    const want = A! / (s! * v!) + tr!;
    if (!close(tl!, want)) out.push(`layers: t_layer = ${tl} s is not A ÷ (sv) + t_r = ${want} s`);
  }
  if (n !== undefined && tl !== undefined && T !== undefined && !close(T, n * tl))
    out.push(`layers: T = ${T} s is not n t_layer = ${n * tl} s`);
  return out;
}
