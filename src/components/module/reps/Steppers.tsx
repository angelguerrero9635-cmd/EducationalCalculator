import { useEffect } from 'react';

import type { Calculator } from '../useCalculator';
import { useStepperRegistry, type StepperItem } from '../stepperContext';

export type { StepperItem } from '../stepperContext';

/**
 * The values a picture lets the student change. They are drawn as vertical sliders beside
 * the picture (`Sliders`, placed by the module page), not inside it; this component only
 * registers what each slider does.
 */
export function Steppers({ items }: { calc: Calculator; items: StepperItem[] }) {
  const registry = useStepperRegistry();
  const register = registry?.register;
  const key = JSON.stringify(items);
  useEffect(() => {
    register?.(items);
    // `key` is the items' content; a new array with the same content registers nothing new.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, register]);
  return null;
}
