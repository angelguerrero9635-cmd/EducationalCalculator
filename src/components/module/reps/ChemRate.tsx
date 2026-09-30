/**
 * An average reaction rate (H108 part 4, `chemDiagram` mode `rate`), flat like a graph: a
 * reactant's concentration against time through two readings, and the secant through them.
 * The curve is drawn first-order through both readings for its shape (it falls fastest at the
 * start); the secant's run Δt and rise Δ[A] are a dashed triangle, and its slope is −rate.
 */
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramHs3eSpec } from '@/data/modules/typesHs3e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { reader } from './graphKit';
import { niceStep } from './hsdGrid';
import { url, usePaintIds } from './paint';

type Spec = Extract<ChemDiagramHs3eSpec, { mode: 'rate' }>;

/** A value as printed: 4 significant figures, a true minus. */
const sig = (x: number) => formatNumber(Number(x.toPrecision(4)));

export function ChemRate({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('plot');
  const [r1, r2] = spec.times.map((t) => read(t));
  const [c1, c2] = spec.concentrations.map((x) => read(x));
  const typed = [r1, r2, c1, c2].every((r) => r!.known);
  const ok =
    typed && r2!.value > r1!.value && c1!.value > 0 && c2!.value > 0 && c2!.value <= c1!.value;
  // While a reading is "?" (or they don't fit), a stand-in pair draws faded.
  const [t1, t2, a1, a2] = ok ? [r1!.value, r2!.value, c1!.value, c2!.value] : [30, 120, 1.2, 0.75];
  const dt = t2 - t1;
  const k = Math.log(a1 / a2) / dt;
  const conc = (t: number) => a1 * Math.exp(-k * (t - t1));
  const tUnit = (typeof spec.times[0] === 'string' && rep.unit(spec.times[0])) || 's';
  const cUnit =
    (typeof spec.concentrations[0] === 'string' && rep.unit(spec.concentrations[0])) || 'mol/L';
  const name = spec.species ?? 'A';
  const xStep = niceStep((1.9 * dt) / 5);
  const xLo = Math.max(0, Math.floor((t1 - 0.6 * dt) / xStep) * xStep);
  const xHi = Math.ceil((t2 + 0.35 * dt) / xStep) * xStep;
  const yTop = Math.min(conc(xLo), a1 * 1.6) * 1.08;
  const yStep = niceStep(yTop / 4);
  const yHi = Math.ceil(yTop / yStep - 1e-9) * yStep;
  const rateVal = spec.rate !== undefined ? read(spec.rate) : undefined;
  const rate = rateVal?.known ? rateVal.value : ok ? (a1 - a2) / dt : undefined;
  const dA = a2 - a1;

  const art = (w: number, h: number) => {
    const pl = 50;
    const pr = w - 14;
    const pt = 22;
    const pb = h - 44;
    const X = (t: number) => pl + ((t - xLo) / (xHi - xLo)) * (pr - pl);
    const Y = (a: number) => pb - (a / yHi) * (pb - pt);
    const curve: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const t = xLo + ((xHi - xLo) * i) / 80;
      const a = conc(t);
      if (a > yHi) continue;
      curve.push(`${curve.length ? 'L' : 'M'} ${X(t)} ${Y(a)}`);
    }
    const slope = dA / dt;
    const [s0, s1] = [t1 - 0.25 * dt, t2 + 0.25 * dt];
    const xTicks: number[] = [];
    for (let t = xLo; t <= xHi + 1e-9; t += xStep) xTicks.push(Number(t.toPrecision(10)));
    const yTicks: number[] = [];
    for (let a = 0; a <= yHi + 1e-12; a += yStep) yTicks.push(Number(a.toPrecision(10)));
    const lit = c.chartHighlight;
    const chip = `rate = ${rate === undefined ? '?' : sig(rate)} ${cUnit.replace('/L', '/(L·')}${tUnit})`;
    const chipAt = fitLabel(pr, chip, chart.value, w, 'end');
    return (
      <Svg width={w} height={h}>
        <Defs>
          <ClipPath id={ids.plot}>
            <Rect x={pl} y={pt} width={pr - pl} height={pb - pt} />
          </ClipPath>
        </Defs>
        {yTicks.map((a) => (
          <G key={`y${a}`}>
            <Line x1={pl} y1={Y(a)} x2={pr} y2={Y(a)} stroke={c.chartGrid} strokeWidth={1} />
            <ChartText
              x={pl - 5}
              y={Y(a) + 4}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {formatNumber(a)}
            </ChartText>
          </G>
        ))}
        {xTicks.map((t) => (
          <G key={`x${t}`}>
            <Line x1={X(t)} y1={pb} x2={X(t)} y2={pb + 4} stroke={c.chartInk} strokeWidth={1} />
            <ChartText
              x={X(t)}
              y={pb + 17}
              textAnchor="middle"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {formatNumber(t)}
            </ChartText>
          </G>
        ))}
        <Line x1={pl} y1={pt} x2={pl} y2={pb} stroke={c.chartInk} strokeWidth={1.2} />
        <Line x1={pl} y1={pb} x2={pr} y2={pb} stroke={c.chartInk} strokeWidth={1.2} />
        <ChartText x={pl - 44} y={pt - 8} fontSize={chart.label} fill={c.chartMuted}>
          {`[${name}] (${cUnit})`}
        </ChartText>
        <ChartText
          x={(pl + pr) / 2}
          y={h - 8}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {`Time t (${tUnit})`}
        </ChartText>
        <G opacity={ok ? 1 : 0.35} clipPath={url(ids.plot)}>
          <Path d={curve.join(' ')} stroke={c.chartInk} strokeWidth={chart.stroke} fill="none" />
          {/* The secant through the two readings, a little past each. */}
          <Line
            x1={X(s0)}
            y1={Y(a1 + slope * (s0 - t1))}
            x2={X(s1)}
            y2={Y(a1 + slope * (s1 - t1))}
            stroke={lit}
            strokeWidth={chart.stroke}
          />
          {/* Run and rise. */}
          <Line
            x1={X(t1)}
            y1={Y(a1)}
            x2={X(t2)}
            y2={Y(a1)}
            stroke={c.chartSecond}
            strokeWidth={1.6}
            strokeDasharray={chart.dash}
          />
          <Line
            x1={X(t2)}
            y1={Y(a1)}
            x2={X(t2)}
            y2={Y(a2)}
            stroke={c.chartSecond}
            strokeWidth={1.6}
            strokeDasharray={chart.dash}
          />
        </G>
        <G opacity={ok ? 1 : 0.35}>
          <ChartText
            x={(X(t1) + X(t2)) / 2}
            y={Y(a1) - 7}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
          >
            {`Δt = ${ok ? sig(dt) : '?'}`}
          </ChartText>
          <ChartText
            x={X(t2) + 6}
            y={(Y(a1) + Y(a2)) / 2 + 4}
            fontSize={chart.label}
            fontWeight="700"
          >
            {`Δ[${name}] = ${ok ? sig(dA) : '?'}`}
          </ChartText>
          {[
            [t1, a1],
            [t2, a2],
          ].map(([t, a], i) => (
            <Circle
              key={i}
              cx={X(t!)}
              cy={Y(a!)}
              r={4.5}
              fill={lit}
              stroke={c.paper}
              strokeWidth={1.2}
            />
          ))}
        </G>
        <ChartText
          x={chipAt.x}
          y={pt + 4}
          textAnchor={chipAt.textAnchor}
          fontSize={chart.value}
          fontWeight="700"
          fill={lit}
        >
          {chip}
        </ChartText>
      </Svg>
    );
  };

  const caption = ok
    ? [
        `The curve (drawn first-order, for its shape) falls fastest at the start.`,
        `The secant through (${sig(t1)} ${tUnit}, ${sig(a1)} ${cUnit}) and (${sig(t2)} ${tUnit}, ${sig(a2)} ${cUnit}) has slope Δ[${name}]/Δt = ${sig(dA)}/${sig(dt)} = ${sig(dA / dt)}.`,
        `The average rate is −Δ[${name}]/Δt = ${rate === undefined ? '?' : sig(rate)} ${cUnit} each ${tUnit}.`,
      ].join(' · ')
    : typed
      ? `The readings need a later second time and a concentration that falls: [${name}]₂ ≤ [${name}]₁. A stand-in curve is drawn faded.`
      : 'Type the two readings to draw the curve through them and its secant.';

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.85, 300 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
