/**
 * HC64 bit fields: the arithmetic the picture and the harness share (the fields' widths and
 * bit numbers, a word's bits).
 */
import type { BitField } from '@/data/modules/typesHe3d';
import type { NumOrVar } from '@/data/modules/typesGraphs';

export interface PlacedField {
  name: string;
  bits: number;
  /** Bit numbers at its edges (the MSB side first): bits − 1 + lo down to lo. */
  hi: number;
  lo: number;
}

/**
 * The fields drawn, MSB side first, with their widths and bit numbers; undefined when a width
 * is unknown. A `rest` field takes what the others leave of the word.
 */
export function placeFields(
  fields: BitField[],
  word: number,
  get: (x: NumOrVar) => number | undefined,
): PlacedField[] | undefined {
  const shown = fields.filter((f) => {
    if (!f.when) return true;
    const n = get(f.when.count);
    return n !== undefined && n >= f.when.nth;
  });
  const widths = shown.map((f) => (f.rest ? undefined : f.bits === undefined ? 0 : get(f.bits)));
  if (shown.some((f, i) => !f.rest && widths[i] === undefined)) return undefined;
  const fixed = widths.reduce<number>((s, b) => s + (b ?? 0), 0);
  const rests = shown.filter((f) => f.rest).length;
  const each = rests ? (word - fixed) / rests : 0;
  let top = word;
  return shown.map((f, i) => {
    const bits = f.rest ? each : widths[i]!;
    const placed = { name: f.name, bits, hi: top - 1, lo: top - bits };
    top -= bits;
    return placed;
  });
}

/** A whole number's `n` bits, MSB first. */
export function bitsOf(value: number, n: number): (0 | 1)[] {
  const out: (0 | 1)[] = [];
  // (exact to 2⁵³: a page's values stay well inside that)
  let v = Math.max(0, Math.round(value));
  for (let i = 0; i < n; i++) {
    out.unshift((v % 2) as 0 | 1);
    v = Math.floor(v / 2);
  }
  return out;
}

/** Four octets as one 32-bit number. */
export const fromOctets = (o: number[]) => o.reduce((s, x) => s * 256 + x, 0);
