/**
 * Harness checks for the round 2 group A options (H89–H92): sign boxes that drive a picture,
 * the number line's fitted window and ticks, the equal compound, and the line system's upright
 * boundaries and given point. Called from each kind's case in `pictures.ts`.
 */
import { lineStep, lineWindow } from '@/components/module/reps/integerLineWindow';
import { SIGN_CODES } from '@/components/module/reps/signBox';

import type { Representation } from '../types';
import type { ShadeSign, SignOf } from '../typesHs2a';

type Val = (x: string | number) => number | undefined;

export function hs2aIssues(rep: Representation, val: Val): string[] {
  const out: string[] = [];
  /** A sign box's code: a whole number in `codes`. */
  const code = (s: SignOf | undefined, codes: number[], what: string) => {
    if (!s) return;
    const k = val(s.sign);
    if (k !== undefined && !codes.includes(k))
      out.push(
        `${what} sign ${s.sign} = ${k} is not one of ${codes.map((c) => `${c} ${SIGN_CODES[c - 1]}`).join(', ')}`,
      );
  };
  const shade = (s: ShadeSign | undefined, what: string) =>
    code(typeof s === 'object' ? s : undefined, [1, 2, 3, 4, 5], what);
  const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  switch (rep.kind) {
    case 'linearFunction':
      shade(rep.shade, 'shaded');
      break;
    case 'lineSystem': {
      rep.lines.forEach((l, i) => shade(l.shade, `line ${i + 1}'s`));
      (rep.upright ?? []).forEach((u, i) => shade(u.shade, `upright line ${i + 1}'s`));
      // The given point is on the second line (the one drawn through it).
      if (rep.given) {
        const [x, y, m, b] = [
          rep.given.x,
          rep.given.y,
          rep.lines[1].slope,
          rep.lines[1].intercept,
        ].map(val);
        if ([x, y, m, b].every((v) => v !== undefined) && !near(m! * x! + b!, y!))
          out.push(`the given point (${x}, ${y}) is not on the second line y = ${m}x + ${b}`);
      }
      break;
    }
    case 'functionGraph':
      code(rep.inequality, [1, 2, 3, 4, 5, 6], 'f(x) ? 0');
      break;
    case 'normalCurve':
      if (typeof rep.test?.tail === 'object') code(rep.test.tail, [1, 2, 3, 4, 6], 'Hₐ');
      break;
    case 'integerLine': {
      (rep.compound?.closed ?? []).forEach((e, i) => {
        if (typeof e === 'string') code({ sign: e }, [1, 2, 3, 4], `bound ${i + 1}'s`);
      });
      if (rep.ticks !== undefined && !(rep.ticks > 0)) out.push(`ticks every ${rep.ticks}`);
      // H89: the window takes in every value drawn, with at most 40 ticks.
      const pts = [
        rep.value,
        rep.second,
        rep.compound?.center,
        rep.compound?.test,
        rep.inequality?.test,
      ]
        .map((id) => (id ? val(id) : undefined))
        .filter((v): v is number => v !== undefined);
      if (rep.fit || rep.ticks) {
        const [lo, hi] = lineWindow(rep, pts, 1);
        const step = lineStep(rep, lo, hi);
        if (pts.some((p) => p < lo || p > hi))
          out.push(`the line ${lo} to ${hi} leaves out ${pts.join(', ')}`);
        if ((hi - lo) / step > 40) out.push(`${(hi - lo) / step} ticks from ${lo} to ${hi}`);
      }
      break;
    }
    default:
      break;
  }
  return out;
}
