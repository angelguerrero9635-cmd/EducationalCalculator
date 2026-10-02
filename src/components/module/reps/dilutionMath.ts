/**
 * HC80 `dilutionSeries` (round 3, group G): the sums shared by the picture and its harness
 * check. Dilutions are written as their reciprocals (1:10 is 10).
 */
import { seeded } from './statMath';

/** The most tubes a row draws, and the most colonies a plate draws one by one. */
export const MAX_TUBES = 10;
export const MAX_COLONIES = 300;

/** Tube k's dilution (from 1) as 1:n: the first tube's, times the factor for each tube after. */
export const tubeDilution = (k: number, first: number, factor: number) => first * factor ** (k - 1);

/** The tube a dilution (a fraction, 10⁻⁶) comes from, or undefined when none in the row does. */
export function tubeOf(dilution: number, first: number, factor: number): number | undefined {
  if (!(dilution > 0)) return undefined;
  const n = 1 / dilution;
  if (factor === 1) return Math.abs(n - first) < 1e-9 * n ? 1 : undefined;
  const k = 1 + Math.log(n / first) / Math.log(factor);
  const r = Math.round(k);
  return Math.abs(k - r) < 1e-6 && r >= 1 && r <= MAX_TUBES ? r : undefined;
}

/** CFU/mL: colonies ÷ (dilution × volume plated). */
export const cfuOf = (colonies: number, dilution: number, volume: number) =>
  colonies / (dilution * volume);

/** Colony places in the unit disc (a seeded scatter, the same for the same count). */
export function colonySpots(count: number, seed = 31): [number, number][] {
  const rand = seeded(seed);
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(rand()) * 0.9;
    const t = rand() * 2 * Math.PI;
    out.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  return out;
}
