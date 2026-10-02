/**
 * Step-text phrases for the Grade 9 science pages, spread into PHRASES (`evaluate.ts`). By the
 * time they run, × is *, − is -, superscripts are powers and a bracket around one number is
 * gone. Test-only.
 */
import { CODON_TABLE } from '@/components/module/reps/dnaMath';

/** The amino acids and Stop as s.9.biotechnology~substitution codes them, 1 to 21. */
const AMINO = [...new Set(Object.values(CODON_TABLE))].sort((x, y) =>
  x === 'Stop' ? 1 : y === 'Stop' ? -1 : x.localeCompare(y),
);
const STOP = AMINO.indexOf('Stop') + 1;
const EFFECTS = ['silent', 'missense', 'nonsense'];

export const S9_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // A substitution (s.9.biotechnology~substitution): an mRNA codon's amino acid, the amino
  // acids and the kind of change, read as the page's codes.
  ...Object.entries(CODON_TABLE).map(([codon, aa]): [RegExp, () => number] => [
    new RegExp(`amino acid of mRNA codon ${codon}`),
    () => AMINO.indexOf(aa) + 1,
  ]),
  ...AMINO.map((aa, i): [RegExp, () => number] => [
    new RegExp(`(?<![A-Za-z])${aa}(?![A-Za-z])`),
    () => i + 1,
  ]),
  ...EFFECTS.map((e, i): [RegExp, () => number] => [
    new RegExp(`(?<![A-Za-z])${e}(?![A-Za-z])`),
    () => i + 1,
  ]),
  [/kind of change from \(?(\d+)\)? to \(?(\d+)\)?/, (a, n) => (a === n ? 1 : n === STOP ? 3 : 2)],
];
