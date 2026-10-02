/**
 * Physical constants (HE-E9): one registry for every page, step line and picture, so no page
 * types its own 8.314 or 9.8. `value` is the number a page computes with and prints (the
 * textbook's rounding: R = 8.314 J/(mol·K)); `precise` is the CODATA 2018 or IAU value behind
 * it, where they differ. Units are registry symbols (`units.ts`) or fixed labels.
 *
 * g depends on the page (the owner's decision, 2026-10-02): 9.81 m/s² on every college page,
 * 9.8 m/s² on K–12 pages. Read it with `gFor(pageId)` or `constant('g', pageId)`.
 */

export interface Constant {
  id: ConstantId;
  /** As the steps write it: "R", "k_B", "ε₀". */
  symbol: string;
  name: string;
  /** The value pages compute with and print. */
  value: number;
  unit: string;
  /** The number as a step line prints it ("6.674 × 10⁻¹¹", "96,485"). */
  shown: string;
  /** The full CODATA or IAU value, when `value` rounds it. */
  precise?: number;
  /** Exact by the definition of the SI (c, h, e, k_B, N_A). */
  exact?: boolean;
  /** When it holds only under a condition ("at 25 °C", "for dry air"). */
  condition?: string;
}

export type ConstantId =
  | 'g'
  | 'g0'
  | 'G'
  | 'c'
  | 'h'
  | 'hbar'
  | 'kB'
  | 'NA'
  | 'R'
  | 'RLatm'
  | 'F'
  | 'e'
  | 'eps0'
  | 'mu0'
  | 'ke'
  | 'me'
  | 'mp'
  | 'mn'
  | 'u'
  | 'sigma'
  | 'RH'
  | 'Rinf'
  | 'a0'
  | 'Kw'
  | 'nernst25'
  | 'nernst37'
  | 'VT300'
  | 'GMEarth'
  | 'MEarth'
  | 'REarthMean'
  | 'REarthEquator'
  | 'MSun'
  | 'GMSun'
  | 'AU'
  | 'gammaAir'
  | 'RAir'
  | 'atm'
  | 'T0'
  | 'Vm';

/** g on a K–12 page (Grades K–12 keep 9.8) and on a college page. */
export const G_K12 = 9.8;
export const G_COLLEGE = 9.81;

/** True for a college page (`he.<field>.<course>…`). */
export const isCollegePage = (pageId: string | undefined) => !!pageId?.startsWith('he.');

/** The g a page uses: 9.81 m/s² on college pages, 9.8 m/s² on K–12 pages. */
export const gFor = (pageId: string | undefined) => (isCollegePage(pageId) ? G_COLLEGE : G_K12);

const c = (
  id: ConstantId,
  symbol: string,
  name: string,
  value: number,
  unit: string,
  shown: string,
  more: Partial<Constant> = {},
): Constant => ({ id, symbol, name, value, unit, shown, ...more });

const LIST: Constant[] = [
  // g is per page (`constant('g', pageId)`); this entry is the college value.
  c('g', 'g', 'gravitational acceleration', G_COLLEGE, 'm/s²', '9.81', {
    precise: 9.80665,
    condition: 'near Earth’s surface',
  }),
  c('g0', 'g₀', 'standard gravity', 9.80665, 'm/s²', '9.80665', { exact: true }),
  c('G', 'G', 'gravitational constant', 6.674e-11, 'N·m²/kg²', '6.674 × 10⁻¹¹', {
    precise: 6.6743e-11,
  }),
  c('c', 'c', 'speed of light', 2.998e8, 'm/s', '2.998 × 10⁸', {
    precise: 299792458,
    exact: true,
  }),
  c('h', 'h', 'Planck constant', 6.626e-34, 'J·s', '6.626 × 10⁻³⁴', {
    precise: 6.62607015e-34,
    exact: true,
  }),
  c('hbar', 'ħ', 'reduced Planck constant', 1.055e-34, 'J·s', '1.055 × 10⁻³⁴', {
    precise: 1.054571817e-34,
  }),
  c('kB', 'k_B', 'Boltzmann constant', 1.381e-23, 'J/K', '1.381 × 10⁻²³', {
    precise: 1.380649e-23,
    exact: true,
  }),
  c('NA', 'N_A', 'Avogadro constant', 6.022e23, 'mol⁻¹', '6.022 × 10²³', {
    precise: 6.02214076e23,
    exact: true,
  }),
  c('R', 'R', 'gas constant', 8.314, 'J/(mol·K)', '8.314', { precise: 8.314462618 }),
  c('RLatm', 'R', 'gas constant', 0.08206, 'L·atm/(mol·K)', '0.08206', {
    precise: 0.082057366,
  }),
  c('F', 'F', 'Faraday constant', 96485, 'C/mol', '96,485', { precise: 96485.33212 }),
  c('e', 'e', 'elementary charge', 1.602e-19, 'C', '1.602 × 10⁻¹⁹', {
    precise: 1.602176634e-19,
    exact: true,
  }),
  c('eps0', 'ε₀', 'vacuum permittivity', 8.854e-12, 'F/m', '8.854 × 10⁻¹²', {
    precise: 8.8541878128e-12,
  }),
  c('mu0', 'μ₀', 'vacuum permeability', 4 * Math.PI * 1e-7, 'H/m', '4π × 10⁻⁷', {
    precise: 1.25663706212e-6,
  }),
  c('ke', 'k', 'Coulomb constant', 8.99e9, 'N·m²/C²', '8.99 × 10⁹', { precise: 8.9875517923e9 }),
  c('me', 'mₑ', 'electron mass', 9.109e-31, 'kg', '9.109 × 10⁻³¹', { precise: 9.1093837015e-31 }),
  c('mp', 'mₚ', 'proton mass', 1.673e-27, 'kg', '1.673 × 10⁻²⁷', { precise: 1.67262192369e-27 }),
  c('mn', 'mₙ', 'neutron mass', 1.675e-27, 'kg', '1.675 × 10⁻²⁷', { precise: 1.67492749804e-27 }),
  c('u', 'u', 'atomic mass unit', 1.661e-27, 'kg', '1.661 × 10⁻²⁷', {
    precise: 1.6605390666e-27,
  }),
  c('sigma', 'σ', 'Stefan–Boltzmann constant', 5.67e-8, 'W/(m²·K⁴)', '5.67 × 10⁻⁸', {
    precise: 5.670374419e-8,
  }),
  // The hydrogen energy constant chemistry calls R_H (13.6 eV); physics' Rydberg R∞ is in m⁻¹.
  c('RH', 'R_H', 'Rydberg energy', 2.179e-18, 'J', '2.179 × 10⁻¹⁸', {
    precise: 2.179872361e-18,
  }),
  c('Rinf', 'R_∞', 'Rydberg constant', 1.097e7, 'm⁻¹', '1.097 × 10⁷', {
    precise: 1.097373156816e7,
  }),
  c('a0', 'a₀', 'Bohr radius', 5.292e-11, 'm', '5.292 × 10⁻¹¹', { precise: 5.29177210903e-11 }),
  c('Kw', 'K_w', 'water ion product', 1.0e-14, '', '1.0 × 10⁻¹⁴', { condition: 'at 25 °C' }),
  c('nernst25', '2.303RT/F', 'Nernst slope', 0.05916, 'V', '0.05916', { condition: 'at 25 °C' }),
  c('nernst37', '2.303RT/F', 'Nernst slope', 0.0615, 'V', '0.0615', { condition: 'at 37 °C' }),
  c('VT300', 'V_T', 'thermal voltage', 0.02585, 'V', '0.02585', { condition: 'at 300 K' }),
  c('GMEarth', 'GM', 'Earth’s gravitational parameter', 3.986e14, 'm³/s²', '3.986 × 10¹⁴', {
    precise: 3.986004418e14,
  }),
  c('MEarth', 'M_E', 'Earth’s mass', 5.972e24, 'kg', '5.972 × 10²⁴', { precise: 5.9722e24 }),
  // Earth's radius: a page names the one it uses in an assumption (decision 1).
  c('REarthMean', 'R_E', 'Earth’s mean radius', 6.371e6, 'm', '6,371,000', {
    condition: 'mean radius',
  }),
  c('REarthEquator', 'R_E', 'Earth’s equatorial radius', 6.378e6, 'm', '6,378,000', {
    precise: 6.378137e6,
    condition: 'equatorial radius (orbit pages)',
  }),
  c('MSun', 'M☉', 'Sun’s mass', 1.989e30, 'kg', '1.989 × 10³⁰', { precise: 1.98847e30 }),
  c('GMSun', 'GM☉', 'Sun’s gravitational parameter', 1.327e20, 'm³/s²', '1.327 × 10²⁰', {
    precise: 1.32712440018e20,
  }),
  c('AU', 'AU', 'astronomical unit', 1.496e11, 'm', '1.496 × 10¹¹', {
    precise: 1.495978707e11,
    exact: true,
  }),
  c('gammaAir', 'γ', 'heat capacity ratio of air', 1.4, '', '1.4', { condition: 'for dry air' }),
  c('RAir', 'R', 'gas constant of air', 287, 'J/(kg·K)', '287', {
    precise: 287.05,
    condition: 'for dry air',
  }),
  c('atm', 'P_atm', 'standard atmosphere', 101325, 'Pa', '101,325', { exact: true }),
  c('T0', 'T₀', 'zero degrees Celsius', 273.15, 'K', '273.15', { exact: true }),
  c('Vm', 'V_m', 'molar volume of a gas', 22.41, 'L/mol', '22.41', {
    precise: 22.413969,
    condition: 'at 0 °C and 1 atm',
  }),
];

export const CONSTANTS: Readonly<Record<ConstantId, Constant>> = Object.fromEntries(
  LIST.map((x) => [x.id, x]),
) as Record<ConstantId, Constant>;

/** A constant as a page reads it: g is 9.81 on a college page and 9.8 on a K–12 page. */
export function constant(id: ConstantId, pageId?: string): Constant {
  const k = CONSTANTS[id];
  if (id !== 'g' || isCollegePage(pageId)) return k;
  return { ...k, value: G_K12, shown: '9.8' };
}

/** The value a page computes with: `value('R')` is 8.314, `value('g', 's.8.x')` is 9.8. */
export const valueOf = (id: ConstantId, pageId?: string) => constant(id, pageId).value;

/** The step line that states a constant: "R = 8.314 J/(mol·K)", "g = 9.81 m/s²". */
export function constantLine(id: ConstantId, pageId?: string): string {
  const k = constant(id, pageId);
  return `${k.symbol} = ${k.shown}${k.unit ? ` ${k.unit}` : ''}`;
}

/** "6.674 × 10⁻¹¹" or "96,485" back to a number. */
function parseShown(text: string): number | undefined {
  const sup: Record<string, string> = {
    '⁻': '-',
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
  };
  const m = /^(4π|[\d,.]+)(?: × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?$/.exec(text.trim());
  if (!m) return undefined;
  const mantissa = m[1] === '4π' ? 4 * Math.PI : Number(m[1]!.replace(/,/g, ''));
  const exp = m[2] ? Number([...m[2]].map((ch) => sup[ch]).join('')) : 0;
  return mantissa * 10 ** exp;
}

/**
 * The constant a step line states ("R = 8.314 J/(mol·K)"), for the harness to check against
 * the registry; undefined when the line states none, or a number the registry doesn't hold.
 */
export function readConstant(line: string, pageId?: string): Constant | undefined {
  const m = /^\s*(\S+) = (.+?)(?: ([^\d\s×,.][^=]*))?\s*$/.exec(line);
  if (!m) return undefined;
  const n = parseShown(m[2]!);
  if (n === undefined) return undefined;
  return LIST.map((k) => constant(k.id, pageId)).find(
    (k) =>
      k.symbol === m[1] &&
      (k.unit || undefined) === (m[3]?.trim() || undefined) &&
      Math.abs(n - k.value) <= 1e-9 * Math.abs(k.value),
  );
}
