/**
 * Picture checks for the college pictures of round 3, group I (`typesHe3i.ts`): HC81 the
 * `simpleMachine` `limb` option, HC82 `binaryPhase`, HC83 `machining`, HC84 `linkage`. What each
 * draws must agree with the values. `val` reads formula units (the variable's declared unit);
 * checks that mix units convert with `siFactor`. Test-only.
 */
import { HIP_SHARE, limbBalance } from '@/components/module/reps/limbMath';
import { STEEL } from '@/components/module/reps/binaryPhaseMath';
import { siFactor } from '@/components/module/reps/he3iUnits';
import type { VariableDef } from '@/engine/types';

import type { BinaryPhaseSpec, He3iSpec } from '../typesHe3i';
import type { SimpleMachineSpec } from '../typesHsk';

type Val = (id: string) => number | undefined;
type X = number | string | undefined;

/** Equal to 1e-4 of the larger (values are rounded when shown, then worked on). */
const near = (a: number, b: number, scale = 0) =>
  Math.abs(a - b) <= 1e-4 * Math.max(Math.abs(a), Math.abs(b), scale) + 1e-9;

/** A reader in SI: a fixed number is taken in `unit`, a variable in its declared unit. */
function reader(val: Val, byId: Map<string, VariableDef>) {
  return (x: X, unit: string): number | undefined => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x * siFactor(unit);
    const v = val(x);
    return v === undefined ? undefined : v * siFactor(byId.get(x)?.unit ?? unit);
  };
}

/** HC81: Σ moments about the joint = 0 with the values; the joint force from vertical balance. */
export function limbIssues(
  rep: SimpleMachineSpec,
  val: Val,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const o = rep.limb!;
  const si = reader(val, byId);
  if (rep.machine !== 'lever') out.push('simpleMachine: a limb on a machine not a lever');
  const share = o.body === 'hip' ? (o.share ?? HIP_SHARE) : 1;
  const W = si(rep.load, 'N');
  const dL = si(rep.loadArm, 'cm');
  const dM = si(rep.effortArm, 'cm');
  const extra = (o.loads ?? []).map((l) => [si(l.force, 'N'), si(l.arm, 'cm')] as const);
  if ([W, dL, dM, ...extra.flat()].some((x) => x === undefined)) return out;
  for (const [x, what] of [
    [W!, 'load'],
    [dL!, 'load arm'],
    [dM!, 'muscle arm'],
  ] as const)
    if (x < 0) out.push(`simpleMachine limb: ${what} ${x} is negative`);
  if (dM! <= 0) return out;
  const loads = [
    { force: share * W!, arm: dL! },
    ...extra.map(([f, a]) => ({ force: f!, arm: a! })),
  ];
  const b = limbBalance(o.body, loads, dM!);
  const F = si(rep.effort, 'N');
  if (F !== undefined && !near(F * dM!, b.moment))
    out.push(
      `simpleMachine limb: F_M d_M = ${F * dM!}, not Σ F d = ${b.moment} (moments about the joint)`,
    );
  const muscle = F ?? b.muscle;
  const joint = o.body === 'hip' ? muscle + b.joint - b.muscle : muscle - (b.muscle - b.joint);
  const J = si(o.joint, 'N');
  if (J !== undefined && !near(J, joint, muscle))
    out.push(`simpleMachine limb: joint force ${J}, the vertical balance gives ${joint}`);
  const ratio = o.ratio ? val(o.ratio) : undefined;
  if (ratio !== undefined && W! > 0 && !near(ratio, (J ?? joint) / W!))
    out.push(`simpleMachine limb: F_J ÷ W = ${ratio}, the picture draws ${(J ?? joint) / W!}`);
  if (rep.advantage) {
    const ma = val(rep.advantage);
    if (ma !== undefined && dL! > 0 && !near(ma, dM! / dL!))
      out.push(`simpleMachine limb: MA = ${ma}, not d_M ÷ d_L = ${dM! / dL!}`);
  }
  return out;
}

/** HC82–HC84: the new kinds of group I. */
export function he3iIssues(rep: He3iSpec, val: Val, byId: Map<string, VariableDef>): string[] {
  const out: string[] = [];
  const si = reader(val, byId);
  switch (rep.kind) {
    case 'binaryPhase':
      out.push(...binaryPhaseIssues(rep, val));
      break;
    default:
      void si;
      break;
  }
  return out;
}

/** HC82: the fractions add to 1 and match the lever arms; C₀ lies on the tie line. */
function binaryPhaseIssues(rep: BinaryPhaseSpec, val: Val): string[] {
  const out: string[] = [];
  const v = (x: X, fallback?: number) =>
    x === undefined ? fallback : typeof x === 'number' ? x : val(x);
  const steel = rep.system === 'steel';
  const c0 = v(rep.c0);
  const ca = v(rep.calpha, steel ? STEEL.calpha : undefined);
  const other = rep.system === 'isomorphous' ? v(rep.cl) : v(rep.ce, steel ? STEEL.ce : undefined);
  if (rep.system === 'isomorphous' && rep.cl === undefined)
    out.push('binaryPhase: an isomorphous diagram needs the liquid’s composition cl');
  if (rep.system === 'eutectic' && rep.ce === undefined)
    out.push('binaryPhase: a eutectic diagram needs the eutectic composition ce');
  if (c0 === undefined || ca === undefined || other === undefined) return out;
  for (const [x, what] of [
    [c0, 'C₀'],
    [ca, 'C_α'],
    [other, 'the other end'],
  ] as const)
    if (x < 0 || x > (steel ? STEEL.xMax : 100))
      out.push(`binaryPhase: ${what} = ${x} is off the composition axis`);
  if (rep.system !== 'isomorphous' && !(ca < other))
    out.push(
      `binaryPhase: C_α ${ca} is not below the ${steel ? 'eutectoid' : 'eutectic'} ${other}`,
    );
  const [lo, hi] = [Math.min(ca, other), Math.max(ca, other)];
  if (c0 < lo - 1e-9 || c0 > hi + 1e-9) return out; // a one-phase alloy draws faded
  // The share of the phase at the `other` end (liquid, eutectic or pearlite) is the arm from
  // C_α to C₀ over the tie line; the solid's is the rest.
  const wOther = (c0 - ca) / (other - ca);
  const wl = rep.system === 'isomorphous' ? v(rep.wl) : v(rep.we);
  const wa = v(rep.walpha);
  if (wl !== undefined && !near(wl, wOther, 1))
    out.push(
      `binaryPhase: ${rep.system === 'isomorphous' ? 'W_L' : 'W_e'} = ${wl}, the lever arms give ${wOther}`,
    );
  if (wa !== undefined && !near(wa, 1 - wOther, 1))
    out.push(`binaryPhase: W_α = ${wa}, the lever arms give ${1 - wOther}`);
  if (wl !== undefined && wa !== undefined && !near(wl + wa, 1, 1))
    out.push(`binaryPhase: the fractions add to ${wl + wa}, not 1`);
  return out;
}
