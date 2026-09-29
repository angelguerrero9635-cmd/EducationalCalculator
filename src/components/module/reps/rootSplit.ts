/**
 * A root simplified from its prime factors (H28, FactorTreeHsf.tsx), shared with the harness:
 * each run of `index` equal primes comes out as one. Plain math, no drawing.
 */

export interface RootSplit {
  /** Index ranges [from, to) of the foot primes, one per group that comes out. */
  groups: [number, number][];
  /** The prime each group brings out. */
  out: number[];
  /** Indices of the primes left under the root. */
  left: number[];
  outside: number;
  inside: number;
}

/** Groups the sorted primes into runs of `index` equal primes. */
export function rootSplit(primes: number[], index: 2 | 3): RootSplit {
  const groups: [number, number][] = [];
  const out: number[] = [];
  const left: number[] = [];
  let i = 0;
  while (i < primes.length) {
    const p = primes[i]!;
    let j = i;
    while (j < primes.length && primes[j] === p) j++;
    const whole = Math.floor((j - i) / index);
    for (let g = 0; g < whole; g++) {
      groups.push([i + g * index, i + (g + 1) * index]);
      out.push(p);
    }
    for (let k = i + whole * index; k < j; k++) left.push(k);
    i = j;
  }
  return {
    groups,
    out,
    left,
    outside: out.reduce((a, b) => a * b, 1),
    inside: left.reduce((a, k) => a * primes[k]!, 1),
  };
}

/** The radical sign: "√" for a square root, "∛" for a cube root. */
export const radical = (index: 2 | 3) => (index === 3 ? '∛' : '√');

/** "6√2", "6" (a perfect power), "√30" (nothing comes out). */
export function rootText(outside: number, inside: number, index: 2 | 3) {
  if (inside === 1) return String(outside);
  return `${outside === 1 ? '' : outside}${radical(index)}${inside}`;
}
