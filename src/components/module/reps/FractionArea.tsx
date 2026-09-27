import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'fractionArea' }>;

/**
 * A fraction of a fraction as an area: one whole (a square) cut into columns for the first
 * fraction and rows for the second. The first fraction's columns are shaded one way, the
 * second's rows the other; the overlap, counted in small pieces, is the product. With `wholes`,
 * a fraction past one (10/3) is a block of unit squares, each cut the same way.
 */
export function FractionArea({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const b = Math.max(1, Math.round(rep.shown(spec.first.den)));
  const d = Math.max(1, Math.round(rep.shown(spec.second.den)));
  // `wholes`: a fraction past one is a block of unit squares, up to `wholes` a side.
  const most = Math.max(1, spec.wholes ?? 1);
  const a = Math.min(b * most, Math.max(0, Math.round(rep.shown(spec.first.num))));
  const cc = Math.min(d * most, Math.max(0, Math.round(rep.shown(spec.second.num))));
  const known = [spec.first.num, spec.first.den, spec.second.num, spec.second.den].every(rep.known);
  const overlap = a * cc;
  const pieces = b * d;
  // Whole squares across (for the first fraction) and down (for the second).
  const cols = Math.max(1, Math.ceil(a / b));
  const rows = Math.max(1, Math.ceil(cc / d));
  const block = cols > 1 || rows > 1;
  /** The side of one unit square: the block fits the width, and a tall block stays on screen. */
  const unitOf = (w: number) =>
    block ? Math.min((w - 72) / cols, (0.9 * w) / rows, w * 0.78 - 24) : 0;
  const mixed =
    overlap >= pieces
      ? ` = ${Math.floor(overlap / pieces)}${overlap % pieces ? ` ${overlap % pieces}/${pieces}` : ''}`
      : '';

  return (
    <View>
      <Canvas aspect={block ? (w) => (rows * unitOf(w) + 32) / w : 0.78}>
        {({ w, h }) => {
          const size = block ? unitOf(w) : Math.min(w - 72, h - 24);
          const width = cols * size;
          const height = rows * size;
          const x0 = (w - width) / 2;
          const y0 = 8;
          const cw = size / b;
          const rh = size / d;
          const across = `${rep.value(spec.first.num, false)}/${rep.value(spec.first.den, false)} across`;
          // A block's inner whole-square borders are heavier than its outline and piece lines.
          const piece = block ? 1 : chart.strokeLight;
          const edge = (i: number, last: number) =>
            block && i > 0 && i < last ? chart.strokeHeavy : chart.stroke;
          const under = fitLabel(x0 + (a * cw) / 2, across, chart.label, w);
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Rect x={x0} y={y0} width={width} height={height} fill={c.chartSurface} />
              {/* The first fraction: `a` of `b` columns. */}
              <Rect x={x0} y={y0} width={a * cw} height={height} fill={c.chartFill} />
              {/* The second fraction: `cc` of `d` rows, over the columns. */}
              <Rect
                x={x0}
                y={y0}
                width={width}
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
              {/* Piece lines; a whole square's border is heavier. */}
              {Array.from({ length: cols * b + 1 }, (_, i) => (
                <Line
                  key={`c${i}`}
                  x1={x0 + i * cw}
                  y1={y0}
                  x2={x0 + i * cw}
                  y2={y0 + height}
                  stroke={c.chartInk}
                  strokeWidth={i % b === 0 ? edge(i, cols * b) : piece}
                />
              ))}
              {Array.from({ length: rows * d + 1 }, (_, i) => (
                <Line
                  key={`r${i}`}
                  x1={x0}
                  y1={y0 + i * rh}
                  x2={x0 + width}
                  y2={y0 + i * rh}
                  stroke={c.chartInk}
                  strokeWidth={i % d === 0 ? edge(i, rows * d) : piece}
                />
              ))}
              <ChartText
                x={under.x}
                y={y0 + height + 16}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor={under.textAnchor}
              >
                {across}
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
        {known && block
          ? `${a}/${b} across and ${cc}/${d} down cover ${overlap} small pieces, ${pieces} to a whole square: ${overlap}/${pieces}${mixed}.${spec.product ? ` The product is ${rep.value(spec.product.num, false)}/${rep.value(spec.product.den, false)}.` : ''}`
          : known
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
