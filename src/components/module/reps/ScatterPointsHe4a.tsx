/**
 * HC97 (M-P13): `scatter` `pointsFrom`. Reads the page's value group as points and hands them,
 * with the axes grown to hold them, to Scatter (line of fit, residuals, least squares as before).
 */
import type { Representation } from '@/data/modules';

import type { Calculator } from '../useCalculator';
import { useRep } from './common';
import { Scatter } from './Scatter';
import { axisFor, pointsOf } from './scatterHe4a';

type Spec = Exclude<Extract<Representation, { kind: 'scatter' }>, { classes: unknown }>;

export function ScatterPointsHe4a({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const rep = useRep(calc);
  const get = (id: string) => (rep.known(id) ? rep.val(id) : undefined);
  const points = pointsOf(spec.pointsFrom!, calc.module.variables, get);
  return (
    <Scatter
      spec={{
        ...spec,
        points,
        x: axisFor(
          spec.x,
          points.map((p) => p[0]),
        ),
        y: axisFor(
          spec.y,
          points.map((p) => p[1]),
        ),
      }}
      calc={calc}
    />
  );
}
