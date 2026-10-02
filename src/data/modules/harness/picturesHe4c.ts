/**
 * Picture checks for the college pictures of round 4, group C (`typesHe4c.ts`): what each one
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only. `val`
 * reads formula units (see `siOf`).
 */
import { cubicAt, turnarounds, type Cubic } from '@/components/module/reps/he4cMath';

import type { He4cSpec } from '../typesHe4c';
import type { NumOrVar } from '../typesGraphs';

type Val = (id: string) => number | undefined;

/** Equal to 1e-4 of the larger (shown values are rounded, then worked on). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function he4cIssues(rep: He4cSpec, val: Val): string[] {
  const out: string[] = [];
  const read = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  /** The page's value of `id` agrees with what the picture draws. */
  const same = (id: string | undefined, want: number | undefined, what: string) => {
    const x = id ? val(id) : undefined;
    if (x === undefined || want === undefined || !Number.isFinite(want)) return;
    if (!near(x, want)) out.push(`${rep.kind}: ${what} ${id} = ${x}, the picture draws ${want}`);
  };
  switch (rep.kind) {
    case 'motionGraph': {
      // HC99: x, v and a at t by the power rule; every ringed turnaround has v = 0.
      const p = rep.polynomial;
      const cs = [read(p.c0), read(p.c1), read(p.c2), read(p.c3)];
      const t = read(p.at);
      if (t !== undefined && t < 0) out.push(`motionGraph: time ${t} is before 0`);
      if (cs.some((x) => x === undefined)) break;
      const cubic = cs as unknown as Cubic;
      for (const r of turnarounds(cubic)) {
        const v = cubicAt(cubic, r).v;
        if (Math.abs(v) > 1e-6) out.push(`motionGraph: the turnaround at t = ${r} has v = ${v}`);
        const [before, after] = [cubicAt(cubic, r * 0.999).v, cubicAt(cubic, r * 1.001).v];
        if (before * after > 0) out.push(`motionGraph: v doesn't change sign at t = ${r}`);
      }
      if (t === undefined) break;
      const s = cubicAt(cubic, t);
      same(p.position, s.x, 'x = c₀ + c₁t + c₂t² + c₃t³:');
      same(p.velocity, s.v, 'v = c₁ + 2c₂t + 3c₃t²:');
      same(p.acceleration, s.a, 'a = 2c₂ + 6c₃t:');
      break;
    }
  }
  return out;
}
