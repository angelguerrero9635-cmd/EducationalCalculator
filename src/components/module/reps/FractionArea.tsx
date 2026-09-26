import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionArea' }>;

/**
 * A fraction of a fraction as an area: one whole (a square) cut into columns for the first
 * fraction and rows for the second. The first fraction's columns are shaded one way, the
 * second's rows the other; the overlap, counted in small pieces, is the product.
 */
export function FractionArea({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const b = Math.max(1, Math.round(rep.shown(spec.first.den)));
  const d = Math.max(1, Math.round(rep.shown(spec.second.den)));
  const a = Math.min(b, Math.max(0, Math.round(rep.shown(spec.first.num))));
  const cc = Math.min(d, Math.max(0, Math.round(rep.shown(spec.second.num))));
  const known = [spec.first.num, spec.first.den, spec.second.num, spec.second.den].every(rep.known);
  const overlap = a * cc;
  const pieces = b * d;

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => {
          const size = Math.min(w - 72, h - 24);
          const x0 = (w - size) / 2;
          const y0 = 8;
          const cw = size / b;
          const rh = size / d;
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Rect x={x0} y={y0} width={size} height={size} fill={c.chartSurface} />
              {/* The first fraction: `a` of `b` columns. */}
              <Rect x={x0} y={y0} width={a * cw} height={size} fill={c.chartFill} />
              {/* The second fraction: `cc` of `d` rows, over the columns. */}
              <Rect
                x={x0}
                y={y0}
                width={size}
                height={cc * rh}
                fill={c.chartHighlight}
                opacity={0.35}
              />
              {/* The overlap: the product. */}
              <Rect
                x={x0}
                y={y0}
                width={a * cw}
                height={cc * rh}
                fill={c.chartHighlight}
                opacity={0.75}
              />
              {Array.from({ length: b + 1 }, (_, i) => (
                <Line
                  key={`c${i}`}
                  x1={x0 + i * cw}
                  y1={y0}
                  x2={x0 + i * cw}
                  y2={y0 + size}
                  stroke={c.chartInk}
                  strokeWidth={i === 0 || i === b ? chart.stroke : chart.strokeLight}
                />
              ))}
              {Array.from({ length: d + 1 }, (_, i) => (
                <Line
                  key={`r${i}`}
                  x1={x0}
                  y1={y0 + i * rh}
                  x2={x0 + size}
                  y2={y0 + i * rh}
                  stroke={c.chartInk}
                  strokeWidth={i === 0 || i === d ? chart.stroke : chart.strokeLight}
                />
              ))}
              <ChartText
                x={x0 + (a * cw) / 2}
                y={y0 + size + 16}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {`${rep.value(spec.first.num, false)}/${rep.value(spec.first.den, false)} across`}
              </ChartText>
              <ChartText
                x={x0 - 6}
                y={y0 + (cc * rh) / 2 + 4}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="end"
              >
                {`${rep.value(spec.second.num, false)}/${rep.value(spec.second.den, false)}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? `${a}/${b} of the columns and ${cc}/${d} of the rows overlap in ${overlap} of the ${pieces} small pieces: ${overlap}/${pieces}.${spec.product ? ` The product is ${rep.value(spec.product.num, false)}/${rep.value(spec.product.den, false)}.` : ''}`
          : 'Type both fractions to shade the square.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[spec.first.num, spec.first.den, spec.second.num, spec.second.den].map(
          (id, _, all) => ({ var: id, steps: [1], pin: all.filter((x) => x !== id) }),
        )}
      />
    </View>
  );
}
