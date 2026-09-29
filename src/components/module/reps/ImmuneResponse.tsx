import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { ImmuneResponseSpec } from '@/data/modules/typesHsh';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, niceCeil, useRep } from './common';
import { antibodyAt, IMMUNE_DEFAULTS } from './bioModel';

const H = 260;
const LEFT = 60;
const TOP = 40;
const BOTTOM = 42;

/** A tick step of 1, 2 or 5 × 10ⁿ giving at most `most` steps over `span`. */
const tickStep = (span: number, most: number) => {
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

/**
 * Antibody levels after a first and a second exposure (see `ImmuneResponseSpec`), flat like
 * every chart: days across, the level up, each exposure an arrow down onto the day axis, the
 * first response in the highlight and the second in its own color, each peak dotted with its
 * level and joined to both axes.
 */
export function ImmuneResponse({ spec, calc }: { spec: ImmuneResponseSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = (x: number | string | undefined, d: number) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const text = (x: number | string | undefined, d: number) =>
    x === undefined
      ? formatNumber(d)
      : typeof x === 'number'
        ? formatNumber(x)
        : rep.value(x, false);
  const r = {
    first: Math.max(0, num(spec.first, 1)),
    second: Math.max(0, num(spec.second, 10)),
    firstDays: Math.max(0.5, num(spec.firstDays, IMMUNE_DEFAULTS.firstDays)),
    secondDays: Math.max(0.5, num(spec.secondDays, IMMUNE_DEFAULTS.secondDays)),
    secondAt: Math.max(1, num(spec.secondAt, IMMUNE_DEFAULTS.secondAt)),
  };
  const all = [spec.first, spec.second, spec.firstDays, spec.secondDays, spec.secondAt].every(
    known,
  );
  const xStep = tickStep(r.secondAt + r.secondDays * 4, 7);
  const xMax = Math.ceil((r.secondAt + r.secondDays * 4) / xStep) * xStep;
  const yMax = niceCeil(Math.max(r.first, r.second) * 1.15);
  const yStep = tickStep(yMax, 5);

  return (
    <View>
      <Canvas aspect={H / 358}>
        {({ w, h }) => {
          const right = w - 10;
          const base = h - BOTTOM;
          const X = (t: number) => LEFT + (t / xMax) * (right - LEFT);
          const Y = (v: number) => base - (v / yMax) * (base - TOP);
          const path = (t0: number, t1: number) => {
            const pts: string[] = [];
            for (let t = t0; t <= t1 + 1e-9; t += xMax / 400) {
              pts.push(
                `${pts.length ? 'L' : 'M'} ${X(t).toFixed(1)} ${Y(antibodyAt(t, r)).toFixed(1)}`,
              );
            }
            return pts.join(' ');
          };
          const peaks = [
            {
              t: r.firstDays,
              v: r.first,
              color: c.chartHighlight,
              label: text(spec.first, 1),
              on: known(spec.first) && known(spec.firstDays),
            },
            {
              t: r.secondAt + r.secondDays,
              v: r.second,
              color: c.antibodySecond,
              label: text(spec.second, 10),
              on: known(spec.second) && known(spec.secondDays) && known(spec.secondAt),
            },
          ];
          const xTicks = Array.from({ length: Math.round(xMax / xStep) + 1 }, (_, i) => i * xStep);
          const yTicks = Array.from(
            { length: Math.floor(yMax / yStep + 1e-9) + 1 },
            (_, i) => i * yStep,
          );
          const exposure = (t: number, label: string, color: string) => {
            const fit = fitLabel(X(t), label, chart.label, w, 'middle');
            return (
              <G key={label}>
                <Line
                  x1={X(t)}
                  y1={TOP - 12}
                  x2={X(t)}
                  y2={base}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <Path
                  d={`M ${X(t) - 5} ${TOP - 16} L ${X(t)} ${TOP - 8} L ${X(t) + 5} ${TOP - 16} Z`}
                  fill={color}
                />
                <ChartText
                  x={fit.x}
                  y={TOP - 22}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor={fit.textAnchor}
                  fill={color}
                >
                  {label}
                </ChartText>
              </G>
            );
          };
          return (
            <Svg width={w} height={h}>
              {yTicks.map((v) => (
                <G key={`y${v}`}>
                  <Line
                    x1={LEFT}
                    y1={Y(v)}
                    x2={right}
                    y2={Y(v)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                  <ChartText
                    x={LEFT - 6}
                    y={Y(v) + 4}
                    fontSize={chart.label}
                    textAnchor="end"
                    fill={c.chartMuted}
                  >
                    {formatNumber(v)}
                  </ChartText>
                </G>
              ))}
              {xTicks.map((t) => (
                <ChartText
                  key={`x${t}`}
                  x={X(t)}
                  y={base + 16}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {formatNumber(t)}
                </ChartText>
              ))}
              <Line
                x1={LEFT}
                y1={base}
                x2={right}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <Line
                x1={LEFT}
                y1={TOP - 6}
                x2={LEFT}
                y2={base}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
              <ChartText
                x={(LEFT + right) / 2}
                y={h - 6}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                Days after the first exposure
              </ChartText>
              <ChartText
                x={12}
                y={(TOP + base) / 2}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
                transform={`rotate(-90 12 ${(TOP + base) / 2})`}
              >
                {spec.axis ?? 'Antibody level'}
              </ChartText>
              {exposure(0, '1st exposure', c.chartHighlight)}
              {exposure(r.secondAt, '2nd exposure', c.antibodySecond)}
              <G opacity={all ? 1 : 0.35}>
                <Path
                  d={path(0, r.secondAt)}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                  strokeLinejoin="round"
                />
                <Path
                  d={path(r.secondAt, xMax)}
                  stroke={c.antibodySecond}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                  strokeLinejoin="round"
                />
              </G>
              {peaks.map((p, i) => {
                const fit = fitLabel(X(p.t) + 8, p.label, chart.value, w, 'start');
                return (
                  <G key={i} opacity={p.on ? 1 : 0.35}>
                    <Line
                      x1={LEFT}
                      y1={Y(p.v)}
                      x2={X(p.t)}
                      y2={Y(p.v)}
                      stroke={p.color}
                      strokeWidth={1}
                      strokeDasharray={chart.dash}
                    />
                    <Line
                      x1={X(p.t)}
                      y1={Y(p.v)}
                      x2={X(p.t)}
                      y2={base}
                      stroke={p.color}
                      strokeWidth={1}
                      strokeDasharray={chart.dash}
                    />
                    <Circle
                      cx={X(p.t)}
                      cy={Y(p.v)}
                      r={5}
                      fill={p.color}
                      stroke={c.card}
                      strokeWidth={1.5}
                    />
                    <ChartText
                      x={fit.x}
                      y={Y(p.v) - 7}
                      fontSize={chart.value}
                      fontWeight="700"
                      textAnchor={fit.textAnchor}
                      fill={p.color}
                    >
                      {p.on ? p.label : '?'}
                    </ChartText>
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {all
          ? `${text(spec.second, 10)} ÷ ${text(spec.first, 1)} = ${formatNumber(Number((r.second / r.first).toFixed(4)))} · First peak ${text(spec.firstDays, IMMUNE_DEFAULTS.firstDays)} days after exposure; second peak ${text(spec.secondDays, IMMUNE_DEFAULTS.secondDays)} days after.`
          : 'Type both peaks and their days to draw the responses.'}
      </Caption>
    </View>
  );
}
