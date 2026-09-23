import { useCallback, useMemo, useState } from 'react';

import type { ModuleDef } from '@/data/modules';
import type { SolveResult } from '@/engine/solve';
import { initialState, setValues, type CalcState } from '@/engine/state';
import type { Values } from '@/engine/types';

export interface Calculator {
  module: ModuleDef;
  /** Every value currently known (entered or calculated). */
  values: Values;
  /** Full solver result, including how each value was found. */
  result: SolveResult;
  status: (id: string) => 'given' | 'derived' | 'unknown';
  errors: Record<string, string>;
  unknownCount: number;
  /** Sets one or more variables as the newest input; `undefined` clears. */
  set: (updates: Record<string, number | undefined>) => void;
  clear: () => void;
  showExample: () => void;
}

const exampleState = (m: ModuleDef): CalcState =>
  initialState(
    m,
    m.startWith.map((id) => ({ id, value: m.example[id]! })),
  );

/** Shared state for a module's formula inputs and its table/chart/diagram. */
export function useCalculator(module: ModuleDef): Calculator {
  const [state, setState] = useState(() => exampleState(module));

  const set = useCallback(
    (updates: Record<string, number | undefined>) => setState((s) => setValues(module, s, updates)),
    [module],
  );

  return useMemo(() => {
    const given = new Set(state.given.map((g) => g.id));
    const { values, unknown } = state.result;
    return {
      module,
      values,
      result: state.result,
      status: (id) => (given.has(id) ? 'given' : id in values ? 'derived' : 'unknown'),
      errors: state.errors,
      unknownCount: unknown.length,
      set,
      clear: () => setState(initialState(module)),
      showExample: () => setState(exampleState(module)),
    };
  }, [module, state, set]);
}
