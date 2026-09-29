/**
 * Step-text phrases for the Grades 9–12 chemistry pages of group I, spread into PHRASES
 * (`evaluate.ts`). By the time they run, × is *, − is - and superscripts are powers. Test-only.
 */
import { trendValue } from '@/components/module/reps/chemTrends';
import { configuration, unpaired, valenceOf } from '@/components/module/reps/electrons';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HSI_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The electrons in an atom's outer shell, from its ground-state configuration.
  [new RegExp(`valence electrons of Z = (${NUM})`), (z) => valenceOf(configuration(z))],
  // Unpaired electrons in the orbital boxes of an atom, or of an ion with e electrons.
  [
    new RegExp(`unpaired electrons of Z = (${NUM}) with (${NUM}) electrons`),
    (z, e) => unpaired(configuration(z, e)),
  ],
  [new RegExp(`unpaired electrons of Z = (${NUM})`), (z) => unpaired(configuration(z))],
  // Periodic-trend values, looked up by atomic number.
  [new RegExp(`atomic radius of Z = (${NUM})`), (z) => trendValue('radius', z) ?? NaN],
  [new RegExp(`ionization energy of Z = (${NUM})`), (z) => trendValue('ionization', z) ?? NaN],
  [
    new RegExp(`electronegativity of Z = (${NUM})`),
    (z) => trendValue('electronegativity', z) ?? NaN,
  ],
];
