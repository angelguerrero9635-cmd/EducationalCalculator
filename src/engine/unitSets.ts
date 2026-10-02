import { holds, type System } from './solve';
import type { Values } from './types';
import { convert, getUnit, unitOf, type Dimension, type UnitSystem } from './units';

/**
 * Formula unit sets (HE-E26): the coherent set a page's relations are written in, as the
 * textbook writes them (σ = 50,000 N ÷ 314.2 mm² = 159.2 MPa, with no 10⁶ in the rule). A page
 * names its set (`ModuleDef.unitSet`); its values' units are the set's, inputs typed in other
 * units are converted into it first, and under US customary a page that names a US set too
 * (kip–in–ksi) is worked directly in that set, with no conversion lines.
 */
export interface UnitSet {
  id: string;
  /** As a page names it: "N–mm–MPa". */
  name: string;
  system: UnitSystem;
  /**
   * One unit per dimension. A temperature unit serves both temperatures and differences (K is
   * a reading and a rise); a length's square, cube and fourth power are implied (mm → mm², mm³,
   * mm⁴) unless the set names another.
   */
  units: readonly string[];
}

const set = (id: string, name: string, system: UnitSystem, units: string[]): UnitSet => ({
  id,
  name,
  system,
  units,
});

export const UNIT_SETS: Readonly<Record<string, UnitSet>> = Object.fromEntries(
  [
    set('SI', 'SI base', 'metric', [
      'm',
      'kg',
      's',
      'N',
      'Pa',
      'J',
      'W',
      'K',
      'mol',
      'm/s',
      'm/s²',
      'kg/m³',
      'N·m',
      'N/m',
      'N/m³',
      'J/kg',
      'J/(kg·K)',
      'W/(m·K)',
      'W/(m²·K)',
      'W/m²',
      'K/m',
      'J/K',
      'Pa·s',
      'm²/s',
      'kg/s',
      'm³/s',
      'mol/s',
      'mol/m³',
      'J/mol',
      'J/(mol·K)',
      'kg·m²',
      'kg·m/s',
      'J·s',
      'rad/s',
      'Hz',
      'V',
      'A',
      'Ω',
      'C',
      'F',
      'H',
      'T',
      'Wb',
      'S',
      'S/m',
      'Ω·m',
      'V/m',
      'A/m',
      'H/m',
      'F/m',
      'm³/s²',
    ]),
    // Solid mechanics and machine design: N, mm, MPa (N/mm²)
    set('N-mm-MPa', 'N–mm–MPa', 'metric', ['N', 'mm', 'MPa', 'N·mm', 'N/mm', 's']),
    // Structures and soils in SI: kN, m, kPa (kN/m²)
    set('kN-m-kPa', 'kN–m–kPa', 'metric', ['kN', 'm', 'kPa', 'kN·m', 'kN/m', 'kN/m³']),
    // US steel and machine design: kip, in, ksi (kip/in²)
    set('kip-in-ksi', 'kip–in–ksi', 'us', ['kip', 'in', 'ksi', 'kip·in', 'kip/in', 's']),
    // US small parts: lbf, in, psi
    set('lbf-in-psi', 'lbf–in–psi', 'us', ['lbf', 'in', 'psi', 'lbf·in', 'lbf/in', 's']),
    // US structures and foundations: kip, ft, ksf
    set('kip-ft-ksf', 'kip–ft–ksf', 'us', ['kip', 'ft', 'ksf', 'kip·ft', 'kip/ft']),
    // Thermodynamics: kJ, kg, K, kPa (kPa·m³ = kJ), kW (kJ/s)
    set('kJ-kg-K', 'kJ–kg–K', 'metric', [
      'kJ',
      'kg',
      'K',
      'kPa',
      'm',
      's',
      'kW',
      'kg/s',
      'kJ/kg',
      'kJ/(kg·K)',
      'kJ/K',
      'm³',
      'kg/m³',
      'kJ/(kmol·K)',
      'kg/kmol',
      'kmol',
    ]),
    // US thermodynamics: Btu, lb, R (°F differences), Btu/h with lb/h
    set('Btu-lb-R', 'Btu–lb–R', 'us', [
      'Btu',
      'lb',
      'R',
      'h',
      'Btu/h',
      'lb/h',
      'Btu/lb',
      'Btu/(lb·R)',
    ]),
  ].map((s) => [s.id, s]),
);

/** What a page declares: one set, or one for each system (N–mm–MPa and kip–in–ksi). */
export type ModuleUnitSet = string | { metric?: string; us?: string };

/** The set a page works in under a system; none under Mixed or for a system it doesn't name. */
export function unitSetFor(
  declared: ModuleUnitSet | undefined,
  system: UnitSystem | 'mixed',
): UnitSet | undefined {
  if (!declared || system === 'mixed') return undefined;
  if (typeof declared === 'string') {
    const one = UNIT_SETS[declared];
    return one?.system === system ? one : undefined;
  }
  const id = declared[system];
  return id ? UNIT_SETS[id] : undefined;
}

/** Every set a page names. */
export function declaredSets(declared: ModuleUnitSet | undefined): UnitSet[] {
  if (!declared) return [];
  const ids = typeof declared === 'string' ? [declared] : [declared.metric, declared.us];
  return ids.flatMap((id) => (id && UNIT_SETS[id] ? [UNIT_SETS[id]] : []));
}

const POWERS: Partial<Record<Dimension, string>> = {
  area: '²',
  volume: '³',
  secondMoment: '⁴',
};

/**
 * The set's unit for a value (by its dimension; a difference reads K, °C, °F or R as one), or
 * undefined when the set has none for it (a count, a ratio).
 */
export function unitInSet(
  s: UnitSet,
  v: { unit?: string; difference?: boolean },
): string | undefined {
  const unit = unitOf(v);
  if (!unit) return undefined;
  const named = s.units.find((id) => getUnit(id, v.difference)?.dimension === unit.dimension);
  if (named) return named;
  const power = POWERS[unit.dimension];
  const length = s.units.find((id) => getUnit(id)?.dimension === 'length');
  if (power && length && getUnit(`${length}${power}`)?.dimension === unit.dimension) {
    return `${length}${power}`;
  }
  return undefined;
}

interface PageLike extends System {
  example: Values;
  unitSet?: ModuleUnitSet;
}

/**
 * What is wrong with a page's unit sets, as sentences for a test: an unknown set, a value whose
 * unit isn't its set's (the relations must be written in one of the sets), or a set the
 * relations don't hold in at the example (they carry a factor of their own, so the set isn't
 * coherent with them).
 */
export function unitSetProblems(page: PageLike): string[] {
  if (!page.unitSet) return [];
  const problems: string[] = [];
  const named =
    typeof page.unitSet === 'string'
      ? [page.unitSet]
      : [page.unitSet.metric, page.unitSet.us].filter((x): x is string => !!x);
  for (const id of named) if (!UNIT_SETS[id]) problems.push(`${page.id}: no unit set "${id}"`);
  const sets = declaredSets(page.unitSet);
  const formula = sets.find((s) =>
    page.variables.every((v) => {
      const inSet = unitInSet(s, v);
      return !inSet || inSet === v.unit;
    }),
  );
  if (sets.length && !formula) {
    const first = sets[0]!;
    const off = page.variables
      .filter((v) => {
        const inSet = unitInSet(first, v);
        return inSet && inSet !== v.unit;
      })
      .map((v) => `${v.id} in ${v.unit} (the set has ${unitInSet(first, v)})`);
    problems.push(`${page.id}: values not written in ${first.name}: ${off.join(', ')}`);
  }
  for (const s of sets) {
    const values = Object.fromEntries(
      Object.entries(page.example).map(([id, x]) => {
        const v = page.variables.find((w) => w.id === id);
        const to = v && unitInSet(s, v);
        return [id, v && to ? convert(x, v.unit!, to, v.difference) : x];
      }),
    );
    const failing = page.relations.filter((r) => !holds(r, values, page.variables));
    if (failing.length) {
      problems.push(
        `${page.id}: the relations don’t hold in ${s.name} (${failing.map((r) => r.id).join(', ')})`,
      );
    }
  }
  return problems;
}
