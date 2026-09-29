/**
 * Optional fields that group HF (H23–H29 in `pictureRequestsHs.ts`) adds to existing picture
 * kinds for Grades 9–12. Kept apart so each kind's spec in `types.ts` / `typesGraphs.ts` gains
 * one line per field. Every string is a variable id; a number is a fixed value.
 */
import type { Mirror, NumOrVar } from './typesGraphs';

/** The second of two moves (H23): the same moves `transformation` makes, applied to A′. */
export type SecondMove =
  | { move: 'translate'; right: NumOrVar; up: NumOrVar }
  | { move: 'reflect'; mirror: Mirror }
  | { move: 'rotate'; angle: NumOrVar; center?: [NumOrVar, NumOrVar] }
  | { move: 'dilate'; factor: NumOrVar; center?: [NumOrVar, NumOrVar] };

/** The variable ids a second move names. */
export function secondMoveVars(m: SecondMove | undefined): string[] {
  if (!m) return [];
  const xs: (NumOrVar | undefined)[] =
    m.move === 'translate'
      ? [m.right, m.up]
      : m.move === 'reflect'
        ? typeof m.mirror === 'object'
          ? ['x' in m.mirror ? m.mirror.x : m.mirror.y]
          : []
        : m.move === 'rotate'
          ? [m.angle, ...(m.center ?? [])]
          : [m.factor, ...(m.center ?? [])];
  return xs.filter((x): x is string => typeof x === 'string');
}
