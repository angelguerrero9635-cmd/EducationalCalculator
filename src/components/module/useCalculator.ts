import { useCallback, useMemo, useState } from 'react';

import type { ModuleDef } from '@/data/modules';
import type { SolveResult } from '@/engine/solve';
import { changeUnits, initialState, setValues, type CalcState } from '@/engine/state';
import type { Values } from '@/engine/types';
import {
  makeUnitContext,
  unitOptions,
  type UnitChoice,
  type UnitContext,
  type UnitOptions,
} from '@/engine/unitContext';
import { useUnitsPref } from '@/state';

export interface Calculator {
  module: ModuleDef;
  /** Every value currently known, in formula units. */
  values: Values;
  /** Full solver result, including how each value was found. */
  result: SolveResult;
  status: (id: string) => 'given' | 'derived' | 'unknown';
  errors: Record<string, string>;
  unknownCount: number;
  /** Sets one or more variables (formula units) as the newest input; `undefined` clears. */
  set: (updates: Record<string, number | undefined>) => void;
  /** Sets a variable from a number in its shown unit. */
  setShown: (id: string, shown: number | undefined) => void;
  clear: () => void;
  showExample: () => void;
  /** Units: the current choice, conversions, and which choices this module offers. */
  units: UnitContext;
  unitOptions: UnitOptions;
  setUnits: (choice: UnitChoice) => void;
}

/**
 * The example's opening inputs. Whole-number lesson values (e.g. Grade 3 side lengths) keep
 * their numbers in any unit (4 cm or 4 in); physical quantities are converted.
 */
const exampleGivens = (m: ModuleDef, ctx: UnitContext) =>
  m.startWith.map((id) => {
    const v = m.variables.find((x) => x.id === id)!;
    const x = m.example[id]!;
    return { id, value: v.integer ? ctx.fromDisplay(id, x) : x };
  });

/** Shared state for a module's formula inputs, units, table/chart/diagram and steps. */
export function useCalculator(module: ModuleDef): Calculator {
  const [defaultSystem] = useUnitsPref();
  const options = useMemo(() => unitOptions(module.variables, module.unitSystems), [module]);

  const [state, setState] = useState<{ choice: UnitChoice; calc: CalcState }>(() => {
    const choice: UnitChoice = {
      system: options.systems.includes(defaultSystem) ? defaultSystem : 'metric',
    };
    const ctx = makeUnitContext(module, choice);
    return { choice, calc: initialState(ctx.system, exampleGivens(module, ctx)) };
  });

  const units = useMemo(() => makeUnitContext(module, state.choice), [module, state.choice]);

  const set = useCallback(
    (updates: Record<string, number | undefined>) =>
      setState((s) => ({
        ...s,
        calc: setValues(makeUnitContext(module, s.choice).system, s.calc, updates),
      })),
    [module],
  );

  const setUnits = useCallback(
    (choice: UnitChoice) =>
      setState((s) => ({
        choice,
        calc: changeUnits(
          makeUnitContext(module, choice).system,
          s.calc,
          makeUnitContext(module, s.choice).system,
        ),
      })),
    [module],
  );

  return useMemo(() => {
    const calc: CalcState = state.calc;
    const given = new Set(calc.given.map((g) => g.id));
    const { values, unknown } = calc.result;
    return {
      module,
      values,
      result: calc.result,
      status: (id) => (given.has(id) ? 'given' : id in values ? 'derived' : 'unknown'),
      errors: calc.errors,
      unknownCount: unknown.length,
      set,
      setShown: (id, shown) =>
        set({ [id]: shown === undefined ? undefined : units.fromDisplay(id, shown) }),
      clear: () => setState((s) => ({ ...s, calc: initialState(units.system) })),
      showExample: () =>
        setState((s) => ({ ...s, calc: initialState(units.system, exampleGivens(module, units)) })),
      units,
      unitOptions: options,
      setUnits,
    };
  }, [module, state, set, setUnits, units, options]);
}
