import { holds, type System } from './solve';
import type { Values, VariableDef } from './types';
import { convert, getUnit, unitInSystem, unitsOf, type UnitSystem } from './units';

/** Whole-module unit choice: one system for every variable, or "mixed" per variable. */
export type UnitChoice =
  { system: UnitSystem } | { system: 'mixed'; units: Record<string, string> };

export interface UnitOptions {
  /** Systems that give a distinct set of units for this module ("metric" always first). */
  systems: UnitSystem[];
  /** True when the module's units are metric-specific (so "Metric" is the right label). */
  metricUnits: boolean;
  /**
   * True when at least one variable can be shown in more than one unit, and no variable with a
   * unit is a whole-number lesson value.
   */
  mixed: boolean;
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
    // Whole-number lessons (e.g. Grade 3 area) don't offer Mixed: mixing units needs
    // conversions and fractions those lessons deliberately avoid.
    mixed:
      !convertible.some((v) => v.integer) &&
      convertible.some((v) => unitsOf(getUnit(v.unit)!.dimension).length > 1),
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
      if (choice.system === 'mixed') {
        const picked = getUnit(choice.units[v.id]);
        shown = picked && picked.dimension === unit.dimension ? picked.id : v.unit;
      } else {
        shown = unitInSystem(v.unit!, choice.system);
      }
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
