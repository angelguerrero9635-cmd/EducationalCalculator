/**
 * Picture checks for the Grades 9–12 group L pictures (`typesHsl.ts`, earth and space H71–H80):
 * what each one draws must agree with the values and with the science. Called from `repIssues`
 * in `pictures.ts`. Test-only.
 */
import {
  arrivals,
  EARTH,
  mantleRay,
  QUAKE_DEFAULTS,
  SHADOW,
} from '@/components/module/reps/earthModel';

import type { HslSpec } from '../typesHsl';

/** Equal to display rounding. */
const near = (a: number, b: number, tol = 1e-6) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hslIssues(rep: HslSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined, d?: number) => {
    const y = x === undefined ? d : typeof x === 'number' ? x : val(x);
    return y === undefined || Number.isNaN(y) ? undefined : y;
  };
  switch (rep.kind) {
    case 'earthLayers': {
      if (rep.mode === 'section') {
        const d = num(rep.distance);
        if (d !== undefined && (d < 0 || d > 180)) out.push(`station at ${d}°, not 0°–180°`);
        // Direct rays stay in the mantle, and the one to 104° just grazes the core.
        const rc = EARTH.core / EARTH.radius;
        for (const delta of [20, 60, 94, SHADOW.pFrom]) {
          const low = Math.min(...mantleRay(delta).map(([x, y]) => Math.hypot(x, y)));
          if (low < rc - 1e-6) out.push(`the ${delta}° ray dips into the core`);
          if (delta === SHADOW.pFrom && !near(low, rc, 1e-4))
            out.push(`the ${delta}° ray bottoms at ${low}, not the core's ${rc}`);
        }
      } else if (rep.mode === 'seismogram') {
        const km = num(rep.km);
        const vp = num(rep.vp, QUAKE_DEFAULTS.vp);
        const vs = num(rep.vs, QUAKE_DEFAULTS.vs);
        if (km === undefined || vp === undefined || vs === undefined) break;
        if (km <= 0) out.push(`distance ${km} km is not positive`);
        if (!(vp > vs && vs > 0)) out.push(`P speed ${vp} is not above S speed ${vs}`);
        const a = arrivals(km, vp, vs);
        if (!(a.p < a.s && a.s < a.surface)) out.push('arrivals are not P, then S, then surface');
        const lag = num(rep.lag);
        if (lag !== undefined && !near(lag, a.s - a.p, 1e-4))
          out.push(`lag ${lag} s, but the trace's S − P is ${a.s - a.p} s`);
      } else {
        const st = rep.stations.map((s) => ({ ...s, r: num(s.r) }));
        if (st.some((s) => s.r === undefined)) break;
        const known = st as { x: number; y: number; r: number }[];
        if (known.some((s) => s.r <= 0)) out.push('a station distance is not positive');
        // Circles that miss one point draw faded with the reason; stations in a line never
        // give one point.
        const [a, b, c] = rep.stations;
        if ((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) === 0)
          out.push('the three stations are in a line: no single epicenter');
      }
      break;
    }
  }
  return out;
}
