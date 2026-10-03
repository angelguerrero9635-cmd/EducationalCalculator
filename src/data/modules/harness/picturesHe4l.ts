/**
 * Picture checks for college round 4, group L (docs/RENDERINGS_HE.md, the mechanical plan's
 * pictures). Each check works its answer out independently of the picture and requires the
 * page's values to agree. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import type { VariableDef } from '@/engine/types';
import { siFactor } from '@/components/module/reps/he3iUnits';
import { MOODY_LAMINAR } from '@/components/module/reps/he4lMath';

import type { Representation } from '../types';
import { siOf } from './picturesHs2c';
import type { He4lSpec, MoodyChartSpec } from '../typesHe4l';

type Val = (x: string | number) => number | undefined;
type X = string | number | undefined;

const close = (a: number, b: number, rel = 1e-6) =>
  Math.abs(a - b) <= rel * Math.max(1e-12, Math.abs(a), Math.abs(b));

const isHe4l = (r: Representation): r is He4lSpec => r.kind === 'moodyChart';

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
    return v * siFactor(typeof x === 'string' ? (byId.get(x)?.unit ?? unit) : unit);
  };
  switch (rep.kind) {
    case 'moodyChart':
      return moodyIssues(rep, get, si);
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
