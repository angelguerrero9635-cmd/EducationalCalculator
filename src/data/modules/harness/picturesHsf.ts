/**
 * Picture checks for the Grades 9–12 fields group HF adds to existing kinds (H23–H29,
 * `typesHsf.ts`): what each draws must agree with the values. Called from the kind's case in
 * `repIssues` (`pictures.ts`). Test-only.
 */
import { imageOf, type MoveValues, type Pt } from '@/components/module/reps/transform';

import type { SecondMove } from '../typesHsf';
import type { Representation } from '../types';

type Val = (x: string | number) => number | undefined;
type Of<K extends Representation['kind']> = Extract<Representation, { kind: K }>;

const far = (a: number, b: number) => Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b));

/** A move's numbers, or undefined while one is unknown. */
function moveValues(m: SecondMove, val: Val): MoveValues | undefined {
  const num = (x: string | number | undefined, d: number) => (x === undefined ? d : val(x));
  const center = 'center' in m && m.center ? m.center : undefined;
  const mirror = m.move === 'reflect' ? m.mirror : undefined;
  const line =
    mirror && typeof mirror === 'object' ? val('x' in mirror ? mirror.x : mirror.y) : undefined;
  if (mirror && typeof mirror === 'object' && line === undefined) return undefined;
  const xs = [
    m.move === 'translate' ? num(m.right, 0) : 0,
    m.move === 'translate' ? num(m.up, 0) : 0,
    m.move === 'rotate' ? num(m.angle, 0) : 0,
    m.move === 'dilate' ? num(m.factor, 1) : 1,
    num(center?.[0], 0),
    num(center?.[1], 0),
  ];
  if (xs.some((x) => x === undefined)) return undefined;
  const [right, up, angle, factor, cx, cy] = xs as number[];
  return {
    right: right!,
    up: up!,
    mirror,
    line,
    angle: angle!,
    factor: factor!,
    center: [cx!, cy!],
  };
}

/** H23: a second move takes A′ to A″ (`image2`), and a figure with symmetry has 3+ corners. */
export function transformationHsfIssues(rep: Of<'transformation'>, val: Val): string[] {
  const out: string[] = [];
  if (rep.image2 && !rep.then) out.push('image2 (A″) needs a second move (then)');
  if (rep.symmetry && rep.figure.length < 3)
    out.push('symmetry needs a figure of 3 or more corners');
  if (!rep.then) return out;
  const second = moveValues(rep.then, val);
  if (second && rep.then.move === 'dilate' && second.factor <= 0)
    out.push(`second dilation by scale factor ${second.factor}`);
  const first = moveValues(rep as unknown as SecondMove, val);
  const a = rep.figure[0] && [val(rep.figure[0][0]), val(rep.figure[0][1])];
  if (!rep.image2 || !first || !second || !a || a.some((x) => x === undefined)) return out;
  const [ix, iy] = [val(rep.image2.x), val(rep.image2.y)];
  if (ix === undefined || iy === undefined) return out;
  const [ex, ey] = imageOf(imageOf(a as Pt, rep.move, first), rep.then.move, second);
  if (far(ix, ex) || far(iy, ey))
    out.push(`A″ (${ix}, ${iy}) is not where the two moves take A (${ex}, ${ey})`);
  return out;
}
