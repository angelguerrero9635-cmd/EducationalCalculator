/**
 * Step-text phrases for the Grade 10 science pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { trendValue } from '@/components/module/reps/chemTrends';
import { configuration, unpaired, valenceOf } from '@/components/module/reps/electrons';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const S10_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The smallest of three amounts (an empirical formula's moles).
  [new RegExp(`smallest of (${NUM}), (${NUM}) and (${NUM})`), (a, b, c) => Math.min(a, b, c)],
  // A hydrocarbon's fuel coefficient: 2 when its hydrogens are not a multiple of 4.
  [new RegExp(`1 if (${NUM}) is a multiple of 4, else 2`), (y) => (y % 4 === 0 ? 1 : 2)],
  // Electrons of an element (by atomic number), from its ground-state configuration.
  [
    new RegExp(`unpaired electrons of element (${NUM}) with (${NUM}) electrons`),
    (z, e) => unpaired(configuration(z, e)),
  ],
  [new RegExp(`unpaired electrons of element (${NUM})`), (z) => unpaired(configuration(z))],
  [new RegExp(`valence electrons of element (${NUM})`), (z) => valenceOf(configuration(z))],
  // Periodic-trend values, looked up by atomic number.
  [new RegExp(`atomic radius of element (${NUM})`), (z) => trendValue('radius', z) ?? NaN],
  [new RegExp(`ionization energy of element (${NUM})`), (z) => trendValue('ionization', z) ?? NaN],
  [
    new RegExp(`electronegativity of element (${NUM})`),
    (z) => trendValue('electronegativity', z) ?? NaN,
  ],
];
