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
  {
    // General Chemistry II → Kinetics: which rate law a mechanism gives, from its slow step.
    kind: 'sort',
    id: 'he.chemistry.gen-chem-2#0~mechanism',
    title: 'Rate law from a mechanism',
    use: 'Use this for “The slow step is NO₂ + NO₂ → NO₃ + NO, then NO₃ + CO → NO₂ + CO₂ is fast. What rate law fits?”',
    assumptions: [
      'The slowest step limits the rate, so the rate law is the rate law of that step alone.',
      'An elementary step’s rate law comes from its reactants: each one’s order is its coefficient in that step.',
      'Every slow step here comes first, so its reactants are all starting materials, never intermediates.',
      'With real species, the first reactant named in the slow step plays A and the second plays B.',
    ],
    question: 'Which rate law does each mechanism give?',
    intro:
      'The slow step sets the rate: its reactants, counted by their coefficients, give the rate law.',
    pickBar: true,
    bins: [
      {
        id: 'aa',
        label: 'rate = k[A]²',
        why: 'Two particles of A collide in the slow step, so the rate goes up four times when [A] doubles.',
      },
      {
        id: 'ab',
        label: 'rate = k[A][B]',
        why: 'One A and one B collide in the slow step, so the rate is first order in each.',
      },
      {
        id: 'a',
        label: 'rate = k[A]',
        why: 'A alone reacts in the slow step; B joins only in a fast step after it, so B is not in the rate law.',
      },
    ],
    cards: [
      { label: 'slow: A + A → C + D; fast: D + B → A + E', bin: 'aa' },
      { label: 'one step: 2A → C', bin: 'aa' },
      { label: 'slow: NO₂ + NO₂ → NO₃ + NO; fast: NO₃ + CO → NO₂ + CO₂', bin: 'aa' },
      { label: 'slow: A + B → C; fast: C + A → D', bin: 'ab' },
      { label: 'one step: A + B → C', bin: 'ab' },
      { label: 'one step: NO + O₃ → NO₂ + O₂', bin: 'ab' },
      { label: 'slow: A → C + D; fast: C + B → E', bin: 'a' },
      { label: 'slow: A → C; fast: C + B → D', bin: 'a' },
      {
        label: 'slow: (CH₃)₃CBr → (CH₃)₃C⁺ + Br⁻; fast: (CH₃)₃C⁺ + OH⁻ → (CH₃)₃COH',
        bin: 'a',
      },
    ],
  },
];
