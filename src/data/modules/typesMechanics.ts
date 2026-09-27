/**
 * Picture specs for Grade 8 motion, forces and energy (kept apart from `types.ts` so that
 * file's union only lists them). A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

/**
 * A motion graph with time across. `graph: 'distance'`: distance against time, a straight line
 * whose slope is the speed (d = start + v × t). `graph: 'speed'`: speed against time, a line
 * whose slope is the acceleration (v = start + a × t), the area under it the distance. The
 * run and rise are marked on the line; drag its end (the time) and its middle (the slope).
 * A strip above the graph dots the object's position each second: evenly spaced at a steady
 * speed, spreading out as it speeds up.
 */
export type MotionGraphSpec = {
  kind: 'motionGraph';
  time: string;
  /** Smallest time and value the axes show (grow to fit), in the shown units. */
  extent?: { time: number; value: number };
  /** `false` leaves out the strip of positions. */
  strip?: boolean;
} & (
  | {
      graph: 'distance';
      speed: string;
      distance: string;
      /** Distance from the start line at time 0 (default 0). */
      start?: NumOrVar;
      /**
       * Fixed legs of the trip after the student's leg, each `time` long at `speed` (0 stands
       * still, a negative speed walks back), drawn thinner with their speed on them.
       */
      then?: { time: number; speed: number }[];
    }
  | {
      graph: 'speed';
      acceleration: string;
      /** The speed at the end of the time. */
      speed: string;
      /** The speed at time 0 (default 0). */
      start?: NumOrVar;
      /** The distance covered: the area under the line, shaded. */
      distance?: string;
    }
);

/**
 * Two skaters (simple figures, one in a blue helmet, one in red) palm to palm on smooth ice:
 * each push comes in a pair, the same `force` on each skater the opposite way, and each
 * speeds up by force ÷ its own mass (the lighter one more). Drag either force arrow's tip.
 */
export interface SkatersSpec {
  kind: 'skaters';
  force: NumOrVar;
  masses: [NumOrVar, NumOrVar];
  accelerations?: [string, string];
  /** Default ['A', 'B']. */
  names?: [string, string];
}

/**
 * A roller coaster car on its track, or a pendulum bob on its string, at `height` above the
 * lowest point, with bars for its potential and kinetic energy and their sum (the total stays
 * the same as they trade). Drag the car along the track or the bob along its swing.
 */
export interface EnergyTrackSpec {
  kind: 'energyTrack';
  track: 'coaster' | 'pendulum';
  height: string;
  potential: string;
  kinetic: string;
  total?: NumOrVar;
  /** The release height: the top of the first hill, or where the bob is let go. */
  top?: NumOrVar;
  mass?: NumOrVar;
  speed?: string;
  /** Gravity's pull per kilogram in the captions (default 9.8 N/kg). */
  g?: number;
}

export type MechanicsSpec = MotionGraphSpec | SkatersSpec | EnergyTrackSpec;

/** The variable ids a spec above names (for the module tests). */
export function mechanicsSpecVars(r: MechanicsSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'motionGraph':
      return r.graph === 'distance'
        ? ids(r.time, r.speed, r.distance, r.start)
        : ids(r.time, r.acceleration, r.speed, r.start, r.distance);
    case 'skaters':
      return ids(r.force, ...r.masses, ...(r.accelerations ?? []));
    case 'energyTrack':
      return ids(r.height, r.potential, r.kinetic, r.total, r.top, r.mass, r.speed);
  }
}
