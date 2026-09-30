/**
 * The chemistry behind the galvanic cell figure (H56), shared with its harness check: standard
 * reduction potentials at 25 °C (the values chemistry references tabulate), each metal's ion
 * charge, and which electrode is the anode.
 */
import type { CellMetal } from '@/data/modules/typesHsj';

export const CELL_METALS: Record<CellMetal, { name: string; charge: number; potential: number }> = {
  Mg: { name: 'Magnesium', charge: 2, potential: -2.37 },
  Al: { name: 'Aluminum', charge: 3, potential: -1.66 },
  Zn: { name: 'Zinc', charge: 2, potential: -0.76 },
  Fe: { name: 'Iron', charge: 2, potential: -0.44 },
  Ni: { name: 'Nickel', charge: 2, potential: -0.25 },
  Pb: { name: 'Lead', charge: 2, potential: -0.13 },
  Cu: { name: 'Copper', charge: 2, potential: 0.34 },
  Ag: { name: 'Silver', charge: 1, potential: 0.8 },
};

const SUPER: Record<string, string> = { '1': '', '2': '²', '3': '³' };

/** The metal's ion: Zn²⁺, Ag⁺, Al³⁺. */
export const ionOf = (m: CellMetal) => `${m}${SUPER[String(CELL_METALS[m].charge)]}⁺`;

/**
 * The cell two metals make: the anode is the one with the lower reduction potential (it gives
 * up electrons), E° = E°cathode − E°anode. `undefined` when both are the same metal.
 */
export function cellOf(metals: [CellMetal, CellMetal]) {
  const [a, b] = metals;
  if (a === b) return undefined;
  const leftIsAnode = CELL_METALS[a].potential < CELL_METALS[b].potential;
  const anode = leftIsAnode ? a : b;
  const cathode = leftIsAnode ? b : a;
  const voltage = CELL_METALS[cathode].potential - CELL_METALS[anode].potential;
  const na = CELL_METALS[anode].charge;
  const nc = CELL_METALS[cathode].charge;
  const e = (n: number) => (n === 1 ? 'e⁻' : `${n}e⁻`);
  return {
    anode,
    cathode,
    leftIsAnode,
    voltage: Number(voltage.toFixed(2)),
    oxidation: `${anode} → ${ionOf(anode)} + ${e(na)}`,
    reduction: `${ionOf(cathode)} + ${e(nc)} → ${cathode}`,
  };
}
