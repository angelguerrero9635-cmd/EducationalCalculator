import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/** A value a picture lets the student change, and how: the slider beside the picture. */
export interface StepperItem {
  var: string;
  /** Step sizes in the shown unit, e.g. [1] or [1, 10]; the slider snaps to the smallest. */
  steps: number[];
  /** Values held fixed while this one changes (so the change flows to the total). */
  pin: string[];
  /** Where a "?" box starts when the slider is first moved (shown units); default its smallest value. */
  from?: number;
  /** The slider's range when it isn't the value's own range (a clock's hours: 1–12). */
  wrap?: [number, number];
  /** Values the slider jumps over (a shape can't have 1 or 2 sides: 0 → 3). */
  skip?: number[];
  /** Shown before the label to tie the slider to the picture, e.g. "●" for solid counters. */
  marker?: string;
}

interface StepperRegistry {
  items: StepperItem[];
  register: (items: StepperItem[]) => void;
}

const StepperContext = createContext<StepperRegistry | undefined>(undefined);

/**
 * A picture declares which values it lets the student change (`Steppers`); the module page
 * draws a vertical slider for each one next to the picture.
 */
export function StepperProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StepperItem[]>([]);
  const register = useCallback((next: StepperItem[]) => {
    setItems((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);
  const value = useMemo(() => ({ items, register }), [items, register]);
  return <StepperContext.Provider value={value}>{children}</StepperContext.Provider>;
}

export const useStepperRegistry = () => useContext(StepperContext);
