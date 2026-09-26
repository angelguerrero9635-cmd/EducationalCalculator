import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'unitCubes' }>;

/**
 * A box filled with unit cubes, drawn in a simple oblique view: `length` cubes across,
 * `width` cubes back, `height` layers up. The bottom layer is shaded so the layers can be
 * counted: length × width in a layer, times the height.
 */
export function UnitCubes({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const dim = (id: string) => Math.min(spec.max, Math.max(0, Math.round(rep.shown(id))));
  const L = dim(spec.length);
  const W = dim(spec.width);
  const H = dim(spec.height);
  const known = [spec.length, spec.width, spec.height].every(rep.known);
  // The caption counts the real box; the drawing stops at `max` cubes a side.
  const real = (id: string) => Math.max(0, Math.round(rep.shown(id)));
  const [rl, rw, rh] = [real(spec.length), real(spec.width), real(spec.height)];
  const layer = rl * rw;
  const two = spec.second;
  const [L2, W2, H2] = two ? [dim(two.length), dim(two.width), dim(two.height)] : [0, 0, 0];
  const known2 = two ? [two.length, two.width, two.height].every(rep.known) : true;
  const across = L + L2;
  const deep = Math.max(W, W2);
  const tall = Math.max(H, H2);

  return (
    <View>
      {/* The canvas is as tall as the box it draws (plus its labels), never a fixed square. */}
      <Canvas
        aspect={(w) => {
          const unit = Math.min((w - 90) / (Math.max(across + deep * 0.5, 2) || 1), 44);
          return (Math.max(tall + deep * 0.28, 1.5) * unit + 44) / w;
        }}
      >
        {({ w, h }) => {
          // Cube size so the whole box (with its depth) fits; depth goes up and right.
          const dx = 0.5;
          const dy = 0.28;
          const unit = Math.min(
            (w - 90) / (Math.max(across + deep * dx, 2) || 1),
            (h - 44) / (Math.max(tall + deep * dy, 1.5) || 1),
            44,
          );
          const x0 = 44;
          const yBase = h - 16;
          const px = (i: number, j: number) => x0 + i * unit + j * unit * dx;
          const py = (j: number, k: number) => yBase - k * unit - j * unit * dy;
          const faces: React.ReactNode[] = [];
          // Draw back to front, bottom to top, so nearer cubes cover farther ones.
          for (let j = deep - 1; j >= 0; j--) {
            for (let k = 0; k < tall; k++) {
              for (let i = 0; i < across; i++) {
                // A cube of the first box, or of the second box beside it.
                const inSecond = i >= L;
                if (inSecond ? j >= W2 || k >= H2 : j >= W || k >= H) continue;
                const bottomLayer = k === 0;
                const fill = bottomLayer
                  ? c.chartHighlight
                  : inSecond
                    ? c.chartSurface
                    : c.chartFill;
                const opacity = bottomLayer ? (inSecond ? 0.3 : 0.55) : 1;
                const X = px(i, j);
                const Y = py(j, k);
                faces.push(
                  <Path
                    key={`t${i}${j}${k}`}
                    d={`M ${X} ${Y - unit} L ${X + unit} ${Y - unit} L ${X + unit + unit * dx} ${Y - unit - unit * dy} L ${X + unit * dx} ${Y - unit - unit * dy} Z`}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  <Path
                    key={`r${i}${j}${k}`}
                    d={`M ${X + unit} ${Y} L ${X + unit} ${Y - unit} L ${X + unit + unit * dx} ${Y - unit - unit * dy} L ${X + unit + unit * dx} ${Y - unit * dy} Z`}
                    fill={c.chartGrid}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                  <Path
                    key={`f${i}${j}${k}`}
                    d={`M ${X} ${Y} L ${X + unit} ${Y} L ${X + unit} ${Y - unit} L ${X} ${Y - unit} Z`}
                    fill={fill}
                    opacity={opacity}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />,
                );
              }
            }
          }
          return (
            <Svg width={w} height={h} opacity={known && known2 ? 1 : 0.4}>
              {faces}
              <ChartText
                x={x0 + (L * unit) / 2}
                y={yBase + 14}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {rep.label(spec.length)}
              </ChartText>
              {two ? (
                <ChartText
                  x={x0 + (L + L2 / 2) * unit}
                  y={yBase + 14}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {rep.label(two.length)}
                </ChartText>
              ) : null}
              <ChartText
                x={x0 + across * unit + (W * unit * dx) / 2 + 10}
                y={yBase - (W * unit * dy) / 2 + 4}
                fontSize={chart.label}
                fontWeight="700"
              >
                {rep.label(spec.width)}
              </ChartText>
              <ChartText
                x={x0 - 6}
                y={yBase - (H * unit) / 2 + 4}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="end"
              >
                {rep.label(spec.height)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {two && known && known2
          ? `First box: ${rl} × ${rw} × ${rh} = ${rep.value(spec.volume, false)} cubes. Second box: ${real(two.length)} × ${real(two.width)} × ${real(two.height)} = ${rep.value(two.volume, false)} cubes. Together: ${rep.value(spec.volume, false)} + ${rep.value(two.volume, false)} = ${spec.total ? rep.value(spec.total, false) : '?'} cubes.`
          : known
            ? `One layer is ${rl} × ${rw} = ${layer} cubes. ${rh} ${rh === 1 ? 'layer' : 'layers'}: ${layer} × ${rh} = ${rep.value(spec.volume, false)} cubes.`
            : 'Type the length, width and height to fill the box.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          spec.length,
          spec.width,
          spec.height,
          ...(two ? [two.length, two.width, two.height] : []),
        ].map((id, _, all) => ({
          var: id,
          steps: [1],
          pin: all.filter((x) => x !== id),
        }))}
      />
    </View>
  );
}
