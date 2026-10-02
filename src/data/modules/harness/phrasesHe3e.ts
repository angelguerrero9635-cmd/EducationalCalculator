/**
 * Step-text phrases for the college demos of round 3, group E (HC70, HC72), spread into PHRASES
 * (`evaluate.ts`): electrons counted off a filled MO diagram or Frost circle, and the smallest
 * ideal angle between electron domains. By the time they run, × is * and − is -. Test-only.
 */
import { diatomicMOs, frost } from '@/components/module/reps/orbitalMoMath';
import { domainAngleOf } from '@/components/module/reps/vseprHe3eMath';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HE3E_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // A second-period diatomic's valence MOs, filled in order.
  [new RegExp(`antibonding electrons of (${NUM})`), (e) => diatomicMOs(e).antibonding],
  [new RegExp(`(?<!anti)bonding electrons of (${NUM})`), (e) => diatomicMOs(e).bonding],
  [new RegExp(`unpaired MO electrons of (${NUM})`), (e) => diatomicMOs(e).unpaired],
  // A Hückel ring's π energy (in β, beyond Nα) and its unpaired electrons.
  [
    new RegExp(`Hückel energy of (${NUM}) electrons in a ring of (${NUM})`),
    (e, n) => frost(n, e).energy,
  ],
  [
    new RegExp(`unpaired ring electrons of (${NUM}) in a ring of (${NUM})`),
    (e, n) => frost(n, e).unpaired,
  ],
  // VSEPR: θ from the number of electron domains.
  [new RegExp(`smallest angle between (${NUM}) domains`), (d) => domainAngleOf(d)],
];
