/**
 * Picture specs for Grade 8 physical and space science: the electromagnetic spectrum, circuits
 * with bulbs, an electromagnet and an orbit (kept apart from `types.ts` so that file's union
 * only lists them). Every string is a variable id.
 */
import type { MixedCircuit } from './typesHsk';

/**
 * The electromagnetic spectrum as a band from radio (long waves, left) to gamma rays (short,
 * right) on a powers-of-ten scale, a wave above it whose crests close up to the right, and the
 * visible part opened up under it in rainbow order (red 700 nm to violet 400 nm). The
 * `wavelength` is marked on the band (and on the rainbow when it is visible light) and drags
 * along it; the caption names its kind of wave and works speed = wavelength × frequency.
 */
export interface SpectrumSpec {
  kind: 'spectrum';
  wavelength: string;
  /** Meters in one of the wavelength's units (1e-9 when the lesson counts nanometers). Default 1. */
  meters?: number;
  frequency?: string;
  /**
   * The wave's speed: a variable, or a fixed number in m/s (light: 300,000,000); with the
   * frequency, the caption works speed = wavelength × frequency.
   */
  speed?: string | number;
}

/**
 * A battery lighting bulbs through copper wires, a switch and an ammeter. `wiring: 'series'`
 * puts the bulbs in one loop (the same current through each); `'parallel'` gives each bulb its
 * own branch across the battery (each branch's current, added at the meter). Bulbs glow by the
 * power each one gets. Drag the battery up or down to change its voltage; tap the switch.
 */
export interface CircuitSpec {
  kind: 'circuit';
  wiring: 'series' | 'parallel';
  /** The battery's voltage (V). */
  voltage: string;
  /** Each bulb's resistance (Ω), 1 to 4 bulbs; or one id with `count` copies of that bulb. */
  bulbs: string[];
  /** How many copies of `bulbs[0]` (1–4), a variable. */
  count?: string;
  /** The ammeter's reading: the current out of the battery (A). */
  current: string;
  /** Parallel: each branch's current, one per bulb. */
  branches?: string[];
  /** A 0–1 value: 1 closes the switch, 0 opens it (the current is then 0). Tap it to flip. */
  switch?: string;
  /** Grades 9–12 (H68): three resistors in series-parallel (`typesHsk.ts`); `bulbs` is then []. */
  mixed?: MixedCircuit;
}

/**
 * An electromagnet: copper wire wound `turns` times round an iron nail, a battery driving
 * `current` through it, field lines round the nail (more for a stronger magnet) and its N (red)
 * and S (blue) ends; `clips` hang from its tip. Strength follows turns × current (amp-turns).
 * Drag the coil's end to wind more turns, the battery to change the current.
 */
export interface ElectromagnetSpec {
  kind: 'electromagnet';
  turns: string;
  current: string;
  /** Turns × current (amp-turns), when the lesson names it. */
  strength?: string;
  /** Paper clips the nail picks up (whole, up to 24). */
  clips?: string;
}

/** The planets (and Earth's moon) the space pictures draw, in their own colors. */
export type PlanetName =
  'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

/**
 * The sun, a planet on its orbit `distance` from the sun, and (with `moon`) a moon going round
 * the planet. The sun's pull on the planet is an arrow toward the sun, as long as `pull`; the
 * planet's motion is a dashed arrow along the orbit. `pull` is in units of the pull on Earth
 * (1 at 1 AU for 1 Earth mass), so pull = mass ÷ distance² (mass 1 when there is none).
 * Drag the planet in or out.
 */
export interface OrbitSpec {
  kind: 'orbit';
  /** From the sun, in AU (Earth is at 1). */
  distance: string;
  pull: string;
  /** The planet's mass in Earth masses. */
  mass?: string;
  /** Which planet is drawn (default Earth). */
  planet?: PlanetName;
  moon?: boolean;
}

export type Physics8Spec = SpectrumSpec | CircuitSpec | ElectromagnetSpec | OrbitSpec;

/** Every variable id one of these pictures refers to. */
export function physics8SpecVars(r: Physics8Spec): string[] {
  const ids = (...xs: (string | undefined)[]) => xs.filter((x): x is string => !!x);
  switch (r.kind) {
    case 'spectrum':
      return ids(r.wavelength, r.frequency, typeof r.speed === 'string' ? r.speed : undefined);
    case 'circuit':
      return ids(r.voltage, ...r.bulbs, r.count, r.current, ...(r.branches ?? []), r.switch);
    case 'electromagnet':
      return ids(r.turns, r.current, r.strength, r.clips);
    case 'orbit':
      return ids(r.distance, r.pull, r.mass);
  }
}
