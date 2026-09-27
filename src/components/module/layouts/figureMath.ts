/**
 * Plain helpers shared by layout figures and the harness (no React Native here, so the data
 * tests can import them): which parts a drawn `parts` figure has, and an observe figure's
 * scale ticks.
 */

export type PartsDrawingKind = 'plant' | 'animal' | 'body';

/** The parts each drawing has, by the name a page gives them (any capitals). */
export const DRAWN_PARTS: Record<PartsDrawingKind, readonly string[]> = {
  plant: ['flower', 'leaves', 'stem', 'roots'],
  animal: ['eyes', 'ears', 'fur', 'claws', 'shell'],
  body: ['brain', 'heart', 'lungs', 'stomach', 'bones', 'skin'],
};

/** The drawn part a page's part name means ("Leaves" → leaves). */
export const drawnPart = (name: string) => name.trim().toLowerCase();

/** Tick spacing for a scale from 0 to `max` over `px` pixels: labels, and marks between. */
export function scaleTicks(max: number, px: number): { label: number; mark: number } {
  const label = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find((k) => k * px >= 16) ?? 1000;
  const mark = [1, 2, 5, 10, 20, 50].find((k) => label % k === 0 && k * px >= 4) ?? label;
  return { label, mark: Math.min(mark, max) };
}
