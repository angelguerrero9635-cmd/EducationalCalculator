import { holds, type System } from './solve';
import type { Values, VariableDef } from './types';
import { convert, getUnit, unitInSystem, unitsOf, type UnitSystem } from './units';

/**
 * Unit choice: a system (metric, US customary, or mixed = any unit), plus optional per-variable
 * units within it (e.g. metric with d in km). A per-variable unit that doesn't belong to the
 * system is ignored, and the system's default unit is used.
 */
export interface UnitChoice {
  system: UnitSystem | 'mixed';
  units?: Record<string, string>;
}

/**
 * The units a variable can be shown in under a system ("mixed" = all units of its kind). With
 * the module's `variables`, a whole-number lesson that measures lengths offers only the
 * matching squares and cubes for its areas and volumes (cm² and cm³, never liters).
 */
export function unitChoices(
  variable: VariableDef,
  system: UnitChoice['system'],
  variables?: readonly VariableDef[],
): string[] {
  const unit = getUnit(variable.unit);
  if (!unit) return [];
  const cubes =
    (unit.dimension === 'area' || unit.dimension === 'volume') &&
    variables?.some((v) => v.integer && getUnit(v.unit)) &&
    variables.some((v) => getUnit(v.unit)?.dimension === 'length');
  return unitsOf(unit.dimension)
    .filter((u) => system === 'mixed' || u.system === system || u.system === 'both')
    .filter((u) => !cubes || LENGTHS.some((l) => u.id === `${l}²` || u.id === `${l}³`))
    .map((u) => u.id);
}

/** Lengths with their matching area and volume units (cm → cm², cm³). */
const LENGTHS = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];

/**
 * For whole-number lessons, units change together: picking a length unit for one value sets
 * every length, area and volume to match (m → m, m², m³), and picking any other unit sets every
 * value of the same kind (g → kg for every mass), so a lesson never mixes units. Returns the per-variable units to apply, or just the one change otherwise.
 */
export function linkedUnits(
  variables: readonly VariableDef[],
  id: string,
  unitId: string,
): Record<string, string> {
  const lesson = variables.some((v) => v.integer && getUnit(v.unit));
  const picked = getUnit(unitId);
  const family = ['length', 'area', 'volume'];
  if (!lesson || !picked) return { [id]: unitId };
  const length = LENGTHS.find((l) => l === unitId || `${l}²` === unitId || `${l}³` === unitId);
  if (!family.includes(picked.dimension) || !length) {
    // Masses, liters, …: every value of the same kind takes the picked unit (g → kg for all).
    return Object.fromEntries(
      variables
        .filter((v) => v.id === id || getUnit(v.unit)?.dimension === picked.dimension)
        .map((v) => [v.id, unitId]),
    );
  }
  const out: Record<string, string> = {};
  for (const v of variables) {
    const d = getUnit(v.unit)?.dimension;
    const candidate =
      d === 'length' ? length : d === 'area' ? `${length}²` : d === 'volume' ? `${length}³` : null;
    if (candidate && getUnit(candidate)) out[v.id] = candidate;
  }
  return out;
}

export interface UnitOptions {
  /** Systems that give a distinct set of units for this module ("metric" always first). */
  systems: UnitSystem[];
  /** True when the module's units are metric-specific (so "Metric" is the right label). */
  metricUnits: boolean;
  /**
   * True when some value has both metric and US units, and no value with a unit is a
   * whole-number lesson value (mixing systems needs fractions those lessons avoid).
   */
  mixed: boolean;
  /** True for whole-number lessons: length, area and volume units change together. */
  linked: boolean;
}

/**
 * Which unit choices make sense for a module's variables. `allowed` limits the whole-module
 * systems offered (e.g. metric only for middle-school science, which uses SI); Mixed still
 * lets students pick any unit per value.
 */
export function unitOptions(
  variables: readonly VariableDef[],
  allowed: readonly UnitSystem[] = ['metric', 'us'],
): UnitOptions {
  const convertible = variables.filter((v) => getUnit(v.unit));
  const differsInUs = convertible.some(
    (v) => unitInSystem(v.unit!, 'us') !== unitInSystem(v.unit!, 'metric'),
  );
  return {
    metricUnits: differsInUs,
    systems: convertible.length
      ? differsInUs && allowed.includes('us')
        ? ['metric', 'us']
        : ['metric']
      : [],
    // Mixed (any unit, from either system) only adds something when a value has both metric
    // and US units; whole-number lessons (e.g. Grade 3 area) don't offer it.
    mixed:
      !convertible.some((v) => v.integer) &&
      convertible.some((v) => {
        const all = unitsOf(getUnit(v.unit)!.dimension);
        return all.some((u) => u.system === 'metric') && all.some((u) => u.system === 'us');
      }),
    linked: convertible.some((v) => v.integer),
  };
}

export interface UnitContext {
  choice: UnitChoice;
  /** The unit each variable is shown in (undefined when it has none). */
  display: Record<string, string | undefined>;
  /** Canonical (formula) value → shown value, and back. */
  toDisplay: (id: string, x: number) => number;
  fromDisplay: (id: string, x: number) => number;
  /** How many formula units one shown unit equals (1 when they match). */
  factor: (id: string) => number;
  /**
   * The module's system for these units. Physical ranges stay physical (messages show them in
   * the shown unit); whole-number lesson values keep their rules on the shown number, so
   * "whole numbers 0–10" means 0–10 in whatever unit is shown.
   */
  system: System;
  /** True when every formula holds as written in the shown units (no conversion needed). */
  coherent: boolean;
}

interface ModuleLike extends System {
  example: Values;
}

export function makeUnitContext(module: ModuleLike, choice: UnitChoice): UnitContext {
  const display: Record<string, string | undefined> = {};
  const factors: Record<string, number> = {};
  for (const v of module.variables) {
    const unit = getUnit(v.unit);
    let shown = v.unit;
    if (unit) {
      const picked = choice.units?.[v.id];
      shown =
        picked && unitChoices(v, choice.system, module.variables).includes(picked)
          ? picked
          : choice.system === 'mixed'
            ? v.unit
            : unitInSystem(v.unit!, choice.system);
    }
    display[v.id] = shown;
    factors[v.id] = unit && shown ? convert(1, shown, v.unit!) : 1;
  }

  const factor = (id: string) => factors[id] ?? 1;
  const toDisplay = (id: string, x: number) => x / factor(id);
  const fromDisplay = (id: string, x: number) => x * factor(id);

  const system: System = {
    relations: module.relations,
    variables: module.variables.map((v) => {
      const f = factor(v.id);
      if (f === 1) return v;
      const lesson = v.integer;
      return {
        ...v,
        min: v.min === undefined ? undefined : lesson ? v.min * f : v.min,
        max: v.max === undefined ? undefined : lesson ? v.max * f : v.max,
        unitFactor: f,
        displayUnit: display[v.id],
      };
    }),
  };

  const shownExample = Object.fromEntries(
    Object.entries(module.example).map(([id, x]) => [id, toDisplay(id, x)]),
  );
  const coherent = module.relations.every((r) => holds(r, shownExample));

  return { choice, display, toDisplay, fromDisplay, factor, system, coherent };
}
