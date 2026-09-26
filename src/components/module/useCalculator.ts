import { useCallback, useMemo, useRef, useState } from 'react';

import type { ModuleDef } from '@/data/modules';
import type { SolveResult } from '@/engine/solve';
import { changeUnits, initialState, setValues, typeValue, type CalcState } from '@/engine/state';
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
  /** 'example' while the untouched example is showing (typing starts a fresh problem). */
  status: (id: string) => 'given' | 'example' | 'derived' | 'unknown';
  /** True while the module shows its untouched example. */
  isExample: boolean;
  errors: Record<string, string>;
  unknownCount: number;
  /**
   * Sets one or more variables (formula units) as the newest input; `undefined` clears.
   * With `slide`, a value that doesn't fit with the others held still moves back toward
   * where it was, one step at a time, and stops at the last value that fits (a slider or a
   * handle goes as far as it can).
   */
  set: (
    updates: Record<string, number | undefined>,
    options?: { slide?: { id: string; step: number } },
  ) => void;
  /** Whether `set(updates)` would be taken as it is (nothing rejected or cleared). */
  fits: (updates: Record<string, number | undefined>) => boolean;
  /**
   * Typing in a box: `startTyping` when it gets focus, `endTyping` when it loses it. While a
   * box is being typed in, each keystroke is worked out from the values as they were at
   * focus, so a half-typed number ("1" on the way to "12") can't clear the student's other
   * numbers.
   */
  startTyping: () => void;
  endTyping: () => void;
  /** Sets a variable from a number in its shown unit. */
  setShown: (id: string, shown: number | undefined) => void;
  clear: () => void;
  showExample: () => void;
  /** Units: the current choice, conversions, and which choices this module offers. */
  units: UnitContext;
  unitOptions: UnitOptions;
  setUnits: (choice: UnitChoice) => void;
}

/** True when an update's own values didn't all fit: the newest rejected, or one cleared. */
const misfits = (c: CalcState, ids: string[]) =>
  (!!c.result.rejected && ids.includes(c.result.rejected.id)) ||
  c.result.cleared.some((id) => ids.includes(id));

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

/** Where "Clear all" starts: nothing, or the module's `clearTo` values (e.g. coins at 0). */
const clearGivens = (m: ModuleDef) =>
  Object.entries(m.clearTo ?? {}).map(([id, value]) => ({ id, value: value! }));

/** Shared state for a module's formula inputs, units, table/chart/diagram and steps. */
export function useCalculator(module: ModuleDef): Calculator {
  const [defaultSystem] = useUnitsPref();
  const options = useMemo(() => unitOptions(module.variables, module.unitSystems), [module]);

  const [state, setState] = useState<{ choice: UnitChoice; calc: CalcState }>(() => {
    const choice: UnitChoice = {
      system: options.systems.includes(defaultSystem) ? defaultSystem : 'metric',
    };
    const ctx = makeUnitContext(module, choice);
    return {
      choice,
      calc: initialState(ctx.system, exampleGivens(module, ctx), { example: true }),
    };
  });

  const units = useMemo(() => makeUnitContext(module, state.choice), [module, state.choice]);
  /** The values when the box being typed in got focus (see `startTyping`). */
  const typingFrom = useRef<CalcState | null>(null);

  const set = useCallback(
    (
      updates: Record<string, number | undefined>,
      options?: { slide?: { id: string; step: number } },
    ) =>
      setState((s) => {
        const system = makeUnitContext(module, s.choice).system;
        const ids = Object.keys(updates);
        // A slider or a drag sends a value with the others it holds still. If that doesn't
        // fit (10 − 30 left; a product no top and bottom can make), the value is not
        // taken and nothing goes blank.
        const misfit = (c: CalcState) => misfits(c, ids);
        let next = setValues(system, s.calc, updates);
        const slide = options?.slide;
        const target = slide ? updates[slide.id] : undefined;
        const from = slide ? s.calc.result.values[slide.id] : undefined;
        if (misfit(next) && slide && target !== undefined && from !== undefined && slide.step > 0) {
          // The nearest value that fits, one step out at a time on both sides of the
          // target (the side toward the old value first), within the variable's range: a
          // count of parts lands on the next divisor, a product on the next product.
          const v = system.variables.find((x) => x.id === slide.id);
          const inRange = (x: number) =>
            (v?.min === undefined || x >= v.min - 1e-9) &&
            (v?.max === undefined || x <= v.max + 1e-9);
          const first = target > from ? -1 : 1;
          for (let k = 1; k <= 400; k++) {
            for (const dir of [first, -first]) {
              const x = target + dir * k * slide.step;
              if (!inRange(x)) continue;
              const trial = setValues(system, s.calc, { ...updates, [slide.id]: x });
              if (!misfit(trial)) return { ...s, calc: trial };
            }
            if (!inRange(target - k * slide.step) && !inRange(target + k * slide.step)) break;
          }
        }
        if (misfit(next)) {
          const lost = next.result.cleared.filter((id) => ids.includes(id));
          const names = lost.map(
            (id) => system.variables.find((v) => v.id === id)?.name.toLowerCase() ?? id,
          );
          const reason =
            next.result.rejected?.reason ?? `Doesn’t fit with ${names.join(' and ')} as it is`;
          next = {
            ...s.calc,
            errors: { ...s.calc.errors, ...Object.fromEntries(ids.map((id) => [id, reason])) },
          };
        }
        return { ...s, calc: next };
      }),
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
      fits: (updates) => !misfits(setValues(units.system, calc, updates), Object.keys(updates)),
      status: (id) =>
        given.has(id) ? (calc.example ? 'example' : 'given') : id in values ? 'derived' : 'unknown',
      isExample: !!calc.example,
      errors: calc.errors,
      unknownCount: unknown.length,
      set,
      // Typing: on the untouched example this starts a fresh problem (see typeValue).
      startTyping: () => {
        typingFrom.current = state.calc;
      },
      endTyping: () => {
        typingFrom.current = null;
      },
      setShown: (id, shown) =>
        setState((s) => ({
          ...s,
          calc: typeValue(
            makeUnitContext(module, s.choice).system,
            typingFrom.current ?? s.calc,
            id,
            shown === undefined ? undefined : units.fromDisplay(id, shown),
            clearGivens(module),
          ),
        })),
      clear: () =>
        setState((s) => ({ ...s, calc: initialState(units.system, clearGivens(module)) })),
      showExample: () =>
        setState((s) => ({
          ...s,
          calc: initialState(units.system, exampleGivens(module, units), { example: true }),
        })),
      units,
      unitOptions: options,
      setUnits,
    };
  }, [module, state, set, setUnits, units, options]);
}
