import { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, {
  ClipPath,
  Defs,
  G,
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'plot' }>;
const SAMPLES = 120;

/** A tick spacing of 1, 2 or 5 × 10ⁿ giving about 5 ticks. */
export function niceStep(range: number): number {
  const raw = range / 5;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

const ticks = (min: number, max: number) => {
  const step = niceStep(max - min);
  const out: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step)
    out.push(Number(t.toFixed(10)));
  return out;
};

export function Plot({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const { module, values } = calc;
  const pinned = rep.pin(spec.params);
  const paramsKnown = spec.params.every(rep.known);

  // Curve: y at each sampled x, with the parameters held at their current values.
  const curve = (() => {
    if (!paramsKnown) return [];
    const givens = Object.entries(pinned).map(([id, value]) => ({ id, value }));
    return Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const x = spec.x.min + ((spec.x.max - spec.x.min) * i) / SAMPLES;
      const y = solve(module, [...givens, { id: spec.x.var, value: x }]).values[spec.y.var];
      return { x, y };
    });
  })();

  const px = values[spec.x.var];
  const py = values[spec.y.var];
  const slope = spec.tangentSlope ? values[spec.tangentSlope] : undefined;
  const xVar = rep.variable(spec.x.var);
  const yVar = rep.variable(spec.y.var);

  return (
    <>
      <Canvas aspect={0.75}>
        {({ w, h }) => {
          const L = 44;
          const R = 12;
          const T = 24;
          const B = 34;
          const xScale = (w - L - R) / (spec.x.max - spec.x.min);
          const yScale = (h - T - B) / (spec.y.max - spec.y.min);
          const sx = (x: number) => L + (x - spec.x.min) * xScale;
          const sy = (y: number) => h - B - (y - spec.y.min) * yScale;
          const axisY = sy(Math.min(spec.y.max, Math.max(spec.y.min, 0)));
          const axisX = sx(Math.min(spec.x.max, Math.max(spec.x.min, 0)));

          let d = '';
          let pen = false;
          for (const p of curve) {
            if (p.y === undefined || !Number.isFinite(p.y)) {
              pen = false;
              continue;
            }
            d += `${pen ? 'L' : 'M'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)} `;
            pen = true;
          }

          let shade = '';
          if (spec.shadeToPoint && px !== undefined) {
            const pts = curve.filter((p) => p.y !== undefined && p.x <= px);
            if (pts.length > 1) {
              shade =
                `M ${sx(pts[0]!.x)} ${sy(0)} ` +
                pts.map((p) => `L ${sx(p.x)} ${sy(p.y!)}`).join(' ') +
                ` L ${sx(pts[pts.length - 1]!.x)} ${sy(0)} Z`;
            }
          }

          const hx = px === undefined ? undefined : Math.min(w - R, Math.max(L, sx(px)));
          const hy = py === undefined ? undefined : Math.min(h - B, Math.max(T, sy(py)));

          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id="plot-area">
                    <Rect x={L} y={T} width={w - L - R} height={h - T - B} />
                  </ClipPath>
                </Defs>
                <Rect
                  x={L}
                  y={T}
                  width={w - L - R}
                  height={h - T - B}
                  fill="none"
                  stroke={c.border}
                />
                {ticks(spec.x.min, spec.x.max).map((t) => (
                  <G key={`x${t}`}>
                    <Line x1={sx(t)} y1={T} x2={sx(t)} y2={h - B} stroke={c.surface} />
                    <SvgText
                      x={sx(t)}
                      y={h - B + 14}
                      fontSize={10}
                      fill={c.textMuted}
                      textAnchor="middle"
                    >
                      {formatNumber(t)}
                    </SvgText>
                  </G>
                ))}
                {ticks(spec.y.min, spec.y.max).map((t) => (
                  <G key={`y${t}`}>
                    <Line x1={L} y1={sy(t)} x2={w - R} y2={sy(t)} stroke={c.surface} />
                    <SvgText
                      x={L - 6}
                      y={sy(t) + 3}
                      fontSize={10}
                      fill={c.textMuted}
                      textAnchor="end"
                    >
                      {formatNumber(t)}
                    </SvgText>
                  </G>
                ))}
                <Line x1={L} y1={axisY} x2={w - R} y2={axisY} stroke={c.textMuted} />
                <Line x1={axisX} y1={T} x2={axisX} y2={h - B} stroke={c.textMuted} />
                <SvgText x={w - R} y={h - 4} fontSize={11} fill={c.text} textAnchor="end">
                  {spec.x.label ?? xVar.symbol}
                </SvgText>
                <SvgText x={4} y={12} fontSize={11} fill={c.text}>
                  {spec.y.label ?? yVar.symbol}
                </SvgText>
                <G clipPath="url(#plot-area)">
                  {shade ? <Path d={shade} fill={c.placeholder} /> : null}
                  {d ? <Path d={d} stroke={c.text} strokeWidth={2} fill="none" /> : null}
                  {slope !== undefined && px !== undefined && py !== undefined ? (
                    <Line
                      x1={sx(spec.x.min)}
                      y1={sy(py + slope * (spec.x.min - px))}
                      x2={sx(spec.x.max)}
                      y2={sy(py + slope * (spec.x.max - px))}
                      stroke={c.textMuted}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                    />
                  ) : null}
                  {px !== undefined && py !== undefined ? (
                    <>
                      <Line
                        x1={sx(px)}
                        y1={sy(py)}
                        x2={sx(px)}
                        y2={axisY}
                        stroke={c.textMuted}
                        strokeDasharray="3 3"
                      />
                      <Line
                        x1={sx(px)}
                        y1={sy(py)}
                        x2={axisX}
                        y2={sy(py)}
                        stroke={c.textMuted}
                        strokeDasharray="3 3"
                      />
                      <Circle cx={sx(px)} cy={sy(py)} r={5} fill={c.text} />
                    </>
                  ) : null}
                </G>
              </Svg>
              {hx !== undefined && hy !== undefined ? (
                <DragHandle
                  testID="drag-point"
                  x={hx}
                  y={hy}
                  label={xVar.name}
                  onStart={() => (start.current = px ?? 0)}
                  onMove={(dx) =>
                    calc.set({
                      ...pinned,
                      [spec.x.var]: rep.snapTo(spec.x.var, start.current + dx / xScale),
                    })
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {[spec.x.var, spec.y.var, ...(spec.tangentSlope ? [spec.tangentSlope] : []), ...spec.params]
          .map((id) => rep.label(id))
          .join('   ·   ')}
      </Text>
      {!paramsKnown ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {`Enter ${spec.params.map((id) => rep.variable(id).symbol).join(' and ')} to draw the graph.`}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: font.caption + 1,
    textAlign: 'center',
    marginTop: space.sm,
    paddingHorizontal: space.lg,
  },
});
