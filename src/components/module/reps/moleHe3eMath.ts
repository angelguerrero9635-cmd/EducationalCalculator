/**
 * The sums behind the HC74 pictures: a mole map's solution and gas boxes (n = CV, V = n ÷ C,
 * V = nRT ÷ P) and combustion analysis (moles of C, H and O from the sample and the absorbers'
 * gains, the CₓHᵧO_z formula and its balanced combustion). No drawing, so the harness and the
 * demos use the same numbers.
 */

export const R_LATM = 0.08206;

/** Litres from a volume in its variable's unit (mL or L). */
export const litres = (v: number, unit: string | undefined) => (unit === 'mL' ? v / 1000 : v);

/** A gas's volume: V = nRT ÷ P (L, with T in K, P in atm and R in L·atm/(mol·K)). */
export const gasVolume = (n: number, T: number, P: number, R = R_LATM) => (n * R * T) / P;

export const MOLAR = { co2: 44.01, h2o: 18.02, c: 12.01, h: 1.008, o: 16.0 };

export interface Combustion {
  nC: number;
  nH: number;
  mO: number;
  nO: number;
  hPerC: number;
  oPerC: number;
  /** Whole subscripts, or undefined when no multiplier up to 6 makes the ratios whole. */
  formula?: { x: number; y: number; z: number };
  /** CₓHᵧO_z + a O₂ → b CO₂ + c H₂O, whole and smallest: [compound, O₂, CO₂, H₂O]. */
  equation?: [number, number, number, number];
}

/** The moles of C, H and O in a sample of mass m (g) that gave m_CO₂ and m_H₂O (g). */
export function combustion(
  m: number,
  mCO2: number,
  mH2O: number,
  M: Partial<typeof MOLAR> = {},
): Combustion {
  const k = { ...MOLAR, ...M };
  const nC = mCO2 / k.co2;
  const nH = (2 * mH2O) / k.h2o;
  const mO = m - k.c * nC - k.h * nH;
  const nO = mO / k.o;
  const hPerC = nH / nC;
  const oPerC = nO / nC;
  // O within 1% of the sample's mass is none (a hydrocarbon).
  const o = Math.abs(mO) < 0.01 * m ? 0 : oPerC;
  let formula: Combustion['formula'];
  for (let f = 1; f <= 6 && !formula; f++) {
    const xs = [f, f * hPerC, f * o];
    if (xs.every((x) => Math.abs(x - Math.round(x)) <= 0.05 * f) && Math.round(xs[1]!) > 0)
      formula = { x: f, y: Math.round(xs[1]!), z: Math.round(xs[2]!) };
  }
  return {
    nC,
    nH,
    mO,
    nO,
    hPerC,
    oPerC,
    formula,
    equation: formula ? balance(formula.x, formula.y, formula.z) : undefined,
  };
}

/** CₓHᵧO_z + (x + y/4 − z/2) O₂ → x CO₂ + y/2 H₂O, scaled to whole numbers. */
export function balance(x: number, y: number, z: number): [number, number, number, number] {
  for (const k of [1, 2, 4]) {
    const o2 = k * (x + y / 4 - z / 2);
    const h2o = (k * y) / 2;
    if (Number.isInteger(o2) && Number.isInteger(h2o)) return [k, o2, k * x, h2o];
  }
  return [4, 4 * x + y - 2 * z, 4 * x, 2 * y];
}

/** Atoms of C, H and O on each side of a balanced combustion (equal when it balances). */
export function combustionAtoms(
  [x, y, z]: [number, number, number],
  [a, b, c, d]: [number, number, number, number],
) {
  return {
    before: { C: a * x, H: a * y, O: a * z + 2 * b },
    after: { C: c, H: 2 * d, O: 2 * c + d },
  };
}

/** "CH₂O", "C₆H₁₂O₆" from whole subscripts. */
export function formulaText(x: number, y: number, z: number): string {
  const sub = (n: number) =>
    n === 1 ? '' : String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]!);
  return `C${sub(x)}H${sub(y)}${z ? `O${sub(z)}` : ''}`;
}
