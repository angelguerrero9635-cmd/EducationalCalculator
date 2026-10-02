/**
 * HC97: a scatter plot's points from a value group (pure, so the harness reads them the same
 * way). The group's variables in order are x₁, y₁, x₂, y₂, …; a value past its data set's count
 * is left out, and a pair with an unknown value is not drawn.
 */
import type { VariableDef } from '@/engine/types';

/** A round grid step for a range (as Plot's niceStep; kept here so the harness needs no UI). */
function niceStep(range: number): number {
  const raw = range / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

type Axis = { label: string; min: number; max: number; step?: number };

/** The ids of a group, in the page's order, past-the-count ones left out. */
export function groupIds(
  group: string,
  variables: VariableDef[],
  get: (id: string) => number | undefined,
): string[] {
  return variables
    .filter((v) => v.group === group)
    .filter((v) => {
      if (!v.countedBy) return true;
      const n = get(v.countedBy.count);
      return n === undefined || v.countedBy.index <= n;
    })
    .map((v) => v.id);
}

/** The points (x, y) the group's values make. */
export function pointsOf(
  group: string,
  variables: VariableDef[],
  get: (id: string) => number | undefined,
): [number, number][] {
  const ids = groupIds(group, variables, get);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < ids.length; i += 2) {
    const [x, y] = [get(ids[i]!), get(ids[i + 1]!)];
    if (x !== undefined && y !== undefined) out.push([x, y]);
  }
  return out;
}

/**
 * An axis grown to hold every value, with half a grid step to spare where a value would sit on
 * the edge (the plot clips at its frame, so a dot there would be cut in half).
 */
export function axisFor(a: Axis, values: number[]): Axis {
  if (!values.length) return a;
  const step = a.step ?? niceStep(a.max - a.min);
  const [lo, hi] = [Math.min(...values), Math.max(...values)];
  const edge = 0.02 * (Math.max(a.max, hi) - Math.min(a.min, lo));
  return {
    ...a,
    min: lo < a.min + edge ? Math.min(a.min, lo - step / 2) : a.min,
    max: hi > a.max - edge ? Math.max(a.max, hi + step / 2) : a.max,
  };
}
