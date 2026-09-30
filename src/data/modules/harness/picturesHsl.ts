/**
 * Picture checks for the Grades 9–12 group L pictures (`typesHsl.ts`, earth and space H71–H80):
 * what each one draws must agree with the values and with the science. Called from `repIssues`
 * in `pictures.ts`. Test-only.
 */
import {
  arrivals,
  atmoTempAt,
  bracketOf,
  depthAt,
  EARTH,
  isobarLevels,
  mantleRay,
  parentLeft,
  PRESSURE_MAP,
  pressureField,
  QUAKE_DEFAULTS,
  SHADOW,
  shipAt,
  tideAt,
  windAt,
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
    case 'oceanProfile': {
      if (rep.mode === 'profile') {
        const d = num(rep.depth);
        if (d === undefined) break;
        if (d <= 0) out.push(`depth ${d} m is not below sea level`);
        // The sonar line ends on the seafloor: the ship sits where the floor is that deep.
        const x = shipAt(d, rep.over);
        if (x !== undefined && !near(depthAt(x), d))
          out.push(`ship over ${depthAt(x)} m, not ${d}`);
      } else {
        const a = num(rep.angle);
        if (a === undefined) break;
        if (a < 0 || a > 180) out.push(`Moon at ${a}°, not 0°–180°`);
        // The high tide points nearer the Moon than the Sun: the Moon's pull is the larger.
        const moon = Math.PI - (a * Math.PI) / 180;
        let best = 0;
        for (let i = 0; i < 3600; i++) {
          const phi = (i * Math.PI) / 1800;
          if (tideAt(phi, moon, Math.PI) > tideAt(best, moon, Math.PI)) best = phi;
        }
        const off = Math.abs(
          ((((best - moon + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI) - Math.PI / 2,
        );
        if (off > Math.PI / 4 + 1e-6) out.push(`the bulge points ${off} rad from the Moon`);
      }
      break;
    }
    case 'atmosphereLayers': {
      if (rep.mode === 'profile') {
        const h = num(rep.altitude);
        const t = num(rep.temperature);
        const g = num(rep.ground, 15);
        if (h !== undefined && (h < 0 || h > 120)) out.push(`altitude ${h} km is off the chart`);
        // The point sits on the drawn temperature line.
        if (
          h !== undefined &&
          t !== undefined &&
          g !== undefined &&
          !near(atmoTempAt(h, g), t, 1e-6)
        )
          out.push(`${t} °C at ${h} km, but the line is at ${atmoTempAt(h, g)} °C`);
      } else {
        const high = num(rep.high);
        const low = num(rep.low);
        if (high === undefined || low === undefined) break;
        if (high <= low) {
          out.push(`the high ${high} hPa is not above the low ${low}`);
          break;
        }
        const levels = isobarLevels(high, low);
        if (levels.length > 16) out.push(`${levels.length} isobars, too many to draw apart`);
        const { hi, lo, s } = PRESSURE_MAP;
        const p = pressureField(high, low, hi, lo, s);
        if (!near(p(...hi), high) || !near(p(...lo), low))
          out.push('the centres are not the typed pressures');
        // Round the low: counterclockwise and inward in the north (clockwise in the south);
        // round the high: the other way, and outward.
        const north = rep.hemisphere !== 'south';
        for (const [c, inward] of [
          [lo, true],
          [hi, false],
        ] as const) {
          const r: [number, number] = [20, 8];
          const w = windAt(p, c[0] + r[0], c[1] + r[1], north);
          const turn = r[0] * w[1] - r[1] * w[0];
          const out_ = r[0] * w[0] + r[1] * w[1];
          if (turn > 0 !== (north === inward))
            out.push(`wind turns the wrong way round the ${inward ? 'low' : 'high'}`);
          if (out_ < 0 !== inward)
            out.push(`wind blows the wrong way across the ${inward ? 'low' : 'high'}'s isobars`);
        }
      }
      break;
    }
    case 'rockLayers': {
      const d = rep.dating;
      const n = d.layers.length;
      if (n < 3 || n > 8) out.push(`${n} layers (3 to 8 are drawn)`);
      const ages = d.layers.map((l) => num(l.age));
      // Superposition: every dated layer is older than the dated layers above it.
      let above: number | undefined;
      ages.forEach((a, i) => {
        if (a === undefined) return;
        if (above !== undefined && a <= above)
          out.push(`layer ${i} (${a}) is not older than above`);
        above = a;
      });
      const intr = d.intrusion;
      const ia = intr ? num(intr.age) : undefined;
      if (intr && (intr.through < 0 || intr.through >= n))
        out.push(`the intrusion reaches layer ${intr.through}, not one of 0–${n - 1}`);
      if (intr && ia !== undefined)
        ages.forEach((a, i) => {
          if (a === undefined) return;
          if (i >= intr.through && ia >= a) out.push(`the intrusion (${ia}) cuts older rock ${a}`);
          if (i < intr.through && ia <= a)
            out.push(`the intrusion (${ia}) is younger than ${a} above it`);
        });
      if (d.bracket !== undefined) {
        if (d.bracket < 0 || d.bracket >= n) out.push(`bracket layer ${d.bracket} is not drawn`);
        const b = bracketOf(ages, d.bracket, intr && { through: intr.through, age: ia });
        if (b.younger !== undefined && b.older !== undefined && b.younger >= b.older)
          out.push(`bracket ${b.younger} to ${b.older} is empty`);
      }
      if (d.sample) {
        const { layer } = d.sample;
        if (layer < -1 || layer >= n || (layer === -1 && !intr))
          out.push(`sample from layer ${layer}, which is not drawn`);
        const p = num(d.sample.parent);
        const hl = num(d.sample.halfLives);
        if (p !== undefined && (p < 0 || p > 100)) out.push(`parent ${p}% is not 0–100`);
        if (p !== undefined && hl !== undefined && !near(p, parentLeft(hl), 1e-4))
          out.push(`parent ${p}% after ${hl} half-lives, not ${parentLeft(hl)}%`);
      }
      break;
    }
  }
  return out;
}
