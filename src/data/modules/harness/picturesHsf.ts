/**
 * Picture checks for the Grades 9–12 fields group HF adds to existing kinds (H23–H29,
 * `typesHsf.ts`): what each draws must agree with the values. Called from the kind's case in
 * `repIssues` (`pictures.ts`). Test-only.
 */
import { splitterShape } from '@/components/module/reps/scaleSplitter';
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

/**
 * H24: a dilation's copy lengths are k times the original's (whole squares, on a grid of up to
 * 30 squares); the side-splitter's pieces add to the sides in the ratio k : (1 − k), DE is k × BC,
 * and the three sides close.
 */
export function scaleCopyHsfIssues(rep: Of<'scaleCopy'>, val: Val): string[] {
  const out: string[] = [];
  const [W, H, k] = [rep.width, rep.height, rep.factor].map(val);
  if (k !== undefined && k <= 0) out.push(`scale factor ${k} is not positive`);
  if (rep.splitter) {
    if (k !== undefined && k >= 1) out.push(`side-splitter factor ${k} is not below 1`);
    if (W === undefined || H === undefined || k === undefined) return out;
    const [ad, db, ae, ec] = (rep.splitter.parts ?? []).map(val);
    const want = [k * W, (1 - k) * W, k * H, (1 - k) * H];
    ['AD', 'DB', 'AE', 'EC'].forEach((name, i) => {
      const x = [ad, db, ae, ec][i];
      if (x !== undefined && far(x, want[i]!))
        out.push(`${name} = ${x}, the picture has ${want[i]}`);
    });
    const [de, bc] = (rep.splitter.base ?? []).map(val);
    if (de !== undefined && bc !== undefined && far(de, k * bc))
      out.push(`DE = ${de} is not ${k} × BC (${bc})`);
    if (!splitterShape(W, H, bc).tri) out.push(`sides ${W}, ${H}, ${bc} make no triangle`);
    return out;
  }
  // A dilation: whole squares for the original, and the grid stays readable.
  for (const [x, name] of [
    [W, 'width'],
    [H, 'height'],
  ] as const)
    if (x !== undefined && (x < 1 || x > 12 || x !== Math.round(x)))
      out.push(`original ${name} ${x} (whole squares, 1–12)`);
  const [cx, cy] = rep.center!.map(val);
  if (W === undefined || H === undefined || k === undefined || cx === undefined || cy === undefined)
    return out;
  const xs = [0, W, cx, cx + k * -cx, cx + k * (W - cx)];
  const ys = [0, H, cy, cy + k * -cy, cy + k * (H - cy)];
  const span = (v: number[]) => Math.ceil(Math.max(...v)) - Math.floor(Math.min(...v)) + 2;
  if (span(xs) > 30 || span(ys) > 30)
    out.push(`dilation grid ${span(xs)} × ${span(ys)} squares (up to 30)`);
  const cw = rep.copyWidth ? val(rep.copyWidth) : undefined;
  const ch = rep.copyHeight ? val(rep.copyHeight) : undefined;
  if (cw !== undefined && far(cw, W * k)) out.push(`copy width ${cw} is not ${k} × ${W}`);
  if (ch !== undefined && far(ch, H * k)) out.push(`copy height ${ch} is not ${k} × ${H}`);
  return out;
}
