/**
 * Arithmetic behind the `unitChain` pictures (H43), kept apart from the drawing so the harness
 * checks the same numbers: which units cancel in a chain of conversion factors, the value it
 * gives, significant figures of a reading, and the mean and percent error of trials.
 */

/** Where a unit sits in a chain: the start's top or bottom, or a factor's (index from 0). */
export interface ChainUnit {
  unit: string;
  /** -1 for the given quantity, else the factor's index. */
  at: number;
  top: boolean;
  cancelled: boolean;
}

/**
 * Units on the tops and bottoms of a chain, each cancelled against the first uncancelled equal
 * unit on the other side, in chain order. What is left makes the answer's unit.
 */
export function cancelUnits(
  unit: string,
  per: string | undefined,
  factors: { topUnit: string; bottomUnit: string }[],
): { units: ChainUnit[]; result: string } {
  const units: ChainUnit[] = [
    { unit, at: -1, top: true, cancelled: false },
    ...(per ? [{ unit: per, at: -1, top: false, cancelled: false }] : []),
    ...factors.flatMap((f, i) => [
      { unit: f.topUnit, at: i, top: true, cancelled: false },
      { unit: f.bottomUnit, at: i, top: false, cancelled: false },
    ]),
  ];
  for (const u of units) {
    if (u.cancelled) continue;
    const other = units.find((o) => !o.cancelled && o.top !== u.top && o.unit === u.unit);
    if (other) {
      u.cancelled = true;
      other.cancelled = true;
    }
  }
  const left = (top: boolean) => units.filter((u) => u.top === top && !u.cancelled);
  const tops = left(true).map((u) => u.unit);
  const bottoms = left(false).map((u) => u.unit);
  const result =
    (tops.length ? tops.join('·') : '1') + (bottoms.length ? `/${bottoms.join('·')}` : '');
  return { units, result };
}

/** The value a chain gives: start × top₁/bottom₁ × top₂/bottom₂ …, or undefined on a 0 bottom. */
export function chainValue(start: number, factors: [number, number][]): number | undefined {
  let x = start;
  for (const [t, b] of factors) {
    if (b === 0) return undefined;
    x = (x * t) / b;
  }
  return x;
}

/** Decimal places of a division such as 0.1 (1) or 0.05 (2); 0 for whole numbers. */
export function placesOf(division: number): number {
  for (let d = 0; d < 8; d++)
    if (Math.abs(division * 10 ** d - Math.round(division * 10 ** d)) < 1e-9) return d;
  return 8;
}

/** A ruler reading written to one place past the smallest division (3.47 on a 0.1 cm ruler). */
export const readingText = (reading: number, division: number) =>
  reading.toFixed(placesOf(division) + 1);

/** Significant figures in a number as written ("0.0470" → 3, "3.47" → 3, "12.0" → 3). */
export function sigFigs(text: string): number {
  const digits = text.replace(/^[−-]/, '').replace(/,/g, '');
  const noDot = digits.replace('.', '');
  const lead = noDot.replace(/^0+/, '');
  if (lead === '') return 1;
  // Without a decimal point, trailing zeros are not counted (1200 → 2).
  return digits.includes('.') ? lead.length : lead.replace(/0+$/, '').length;
}

export const meanOf = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

/** Percent error of a mean against the accepted value: |mean − accepted| ÷ accepted × 100. */
export const percentError = (mean: number, accepted: number) =>
  accepted === 0 ? undefined : (Math.abs(mean - accepted) / Math.abs(accepted)) * 100;
