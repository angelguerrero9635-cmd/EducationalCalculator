/**
 * College Chemistry layout pages (sort, sequence, explore, observe) of every course whose home
 * field is `chemistry`, keyed by course topic, in taxonomy order. The calculators are in
 * `../college/chemistry.ts`. Data only.
 */
import type { LayoutDef } from './types';

export const COLLEGE_CHEMISTRY_LAYOUTS: LayoutDef[] = [
  {
    // General Chemistry I → Atomic structure and periodicity: why first ionization energy rises
    // or falls from one element to the next, the Mg → Al and P → S exceptions included.
    kind: 'sort',
    id: 'he.chemistry.gen-chem-1#0~ionization-order',
    title: 'Ionization energy: rises or falls?',
    use: 'Use this for “Why is the first ionization energy of sulfur lower than that of phosphorus?”',
    assumptions: [
      'First ionization energy is the energy to remove one electron, the easiest one, from a gaseous atom.',
      'Each card goes from the first element to the second; the brackets show the subshell the electron is removed from.',
      'Electrons in one subshell shield each other only a little, so each added proton holds them more tightly.',
    ],
    question: 'Going from the first element to the second, why does the energy change?',
    intro:
      'Across a period the energy rises, except where the electron removed starts a p subshell or is the first to share a p orbital.',
    pickBar: true,
    bins: [
      {
        id: 'proton',
        label: 'Rises: one more proton, same shell',
        why: 'The electron stays in the same shell while the nucleus gains a proton, so it is held more tightly.',
      },
      {
        id: 'shell',
        label: 'Falls: a shell farther out',
        why: 'The electron removed sits in a new shell, farther out and shielded by the inner shells.',
      },
      {
        id: 'subshell',
        label: 'Falls: first electron in a p subshell',
        why: 'A p electron is higher in energy than the filled s subshell below it, so it comes off more easily.',
      },
      {
        id: 'paired',
        label: 'Falls: first paired p electron',
        why: 'The fourth p electron shares an orbital, and the repulsion of its partner makes it easier to remove.',
      },
    ],
    cards: [
      { label: 'Li (2s¹) → Be (2s²)', bin: 'proton' },
      { label: 'Na (3s¹) → Mg (3s²)', bin: 'proton' },
      { label: 'Si (3p²) → P (3p³)', bin: 'proton' },
      { label: 'O (2p⁴) → F (2p⁵)', bin: 'proton' },
      { label: 'Li (2s¹) → Na (3s¹)', bin: 'shell' },
      { label: 'Mg (3s²) → Ca (4s²)', bin: 'shell' },
      { label: 'Be (2s²) → B (2p¹)', bin: 'subshell' },
      { label: 'Mg (3s²) → Al (3p¹)', bin: 'subshell' },
      { label: 'N (2p³) → O (2p⁴)', bin: 'paired' },
      { label: 'P (3p³) → S (3p⁴)', bin: 'paired' },
    ],
  },
];
