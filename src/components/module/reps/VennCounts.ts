/**
 * H97: the words for a Venn diagram of counts (`venn` `chances` with `counts`): each region's
 * count, the union by the addition rule, and the shaded region as a count and as a chance.
 */
import type { VennChances } from '@/data/modules/typesHse';
import { formatNumber } from '@/engine/format';

import { shadedChance, vennRegions } from './stats';

/** A share of the total as a count: 0.35 of 40 is 14. */
export const countText = (x: number, total: number) =>
  formatNumber(Math.round(x * total * 1e9) / 1e9);

/** The caption: the regions, the union, and the shaded count over the total. */
export function countsCaption(
  spec: VennChances,
  known: boolean,
  valid: boolean,
  a: number,
  b: number,
  both: number,
  total: number,
): string {
  const [nA, nB] = spec.names ?? ['A', 'B'];
  if (!known) return 'Type the counts to fill the diagram.';
  if (!valid)
    return `These can't all be true: both is at most the smaller of ${nA} and ${nB}, and ${nA} or ${nB} is at most the total.`;
  const n = (x: number) => countText(x, total);
  const r = vennRegions(a, b, both);
  /** A chance as a decimal: exact to 3 places, else after ≈. */
  const dec = (p: number) => {
    const d = Number(p.toFixed(3));
    return `${Math.abs(d - p) < 1e-12 ? '=' : '≈'} ${formatNumber(d)}`;
  };
  const parts = [
    // One line each: "= 7" never wraps alone onto a line of its own.
    `${nA} only ${n(a)} − ${n(both)} = ${n(r.aOnly)}`,
    `${nB} only ${n(b)} − ${n(both)} = ${n(r.bOnly)}`,
    `${nA} or ${nB}: ${n(a)} + ${n(b)} − ${n(both)} = ${n(r.union)} of ${n(1)}`,
  ];
  const shade = spec.shade;
  if (shade) {
    const p = shadedChance(shade, a, b, both);
    const what = {
      and: `${nA} and ${nB}`,
      or: `${nA} or ${nB}`,
      notA: `not ${nA}`,
      aOnly: `${nA} and not ${nB}`,
      neither: 'neither',
    }[shade];
    if (shade === 'neither')
      parts.push(`Neither: ${n(1)} − ${n(r.union)} = ${n(r.neither)}, outside both circles`);
    if (shade === 'notA') parts.push(`Not ${nA}: ${n(1)} − ${n(a)} = ${n(1 - a)}`);
    parts.push(`Shaded: P(${what}) = ${n(p)}/${n(1)} ${dec(p)}`);
    if (shade === 'and' && a > 0)
      parts.push(
        `P(${nB} | ${nA}) = ${n(both)}/${n(a)} ${dec(both / a)}: of the ${n(a)} in ${nA}, ${n(both)} are in ${nB}`,
      );
  }
  return parts.join(' · ');
}
