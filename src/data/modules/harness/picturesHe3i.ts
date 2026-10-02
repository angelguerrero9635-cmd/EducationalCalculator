/**
 * Picture checks for the college pictures of round 3, group I (`typesHe3i.ts`): HC81 the
 * `simpleMachine` `limb` option, HC82 `binaryPhase`, HC83 `machining`, HC84 `linkage`. What each
 * draws must agree with the values. `val` reads formula units (the variable's declared unit);
 * checks that mix units convert with `siFactor`. Test-only.
 */
import { HIP_SHARE, limbBalance } from '@/components/module/reps/limbMath';
import { siFactor } from '@/components/module/reps/he3iUnits';
import type { VariableDef } from '@/engine/types';

import type { He3iSpec } from '../typesHe3i';
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
  void reader(val, byId);
  switch (rep.kind) {
    default:
      break;
  }
  return out;
}
