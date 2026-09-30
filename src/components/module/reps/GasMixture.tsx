/**
 * A gas mixture in the piston's cylinder (H108 part 6, `gasPiston` `mixture`): Dalton's law of
 * partial pressures. The glass cylinder, its piston held, holds 24 particles shared among the
 * gases by partial pressure (a gas's share of the pressure is its share of the particles), each
 * gas in its own color and drawn as its molecule (He one ball, O₂ and N₂ two). Beside it, flat,
 * a bar of the partial pressures stacked to the total on a pressure scale.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { GasPistonSpec } from '@/data/modules/typesHsj';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, niceCeil, useRep } from './common';
import { gasSpots } from './gasModel';
import { reader } from './graphKit';
import { niceStep } from './hsdGrid';
import { Ball, Glass, Metal, Sheen, url, usePaintIds } from './paint';

const PARTICLES = 24;

/** Whole particle counts in proportion to `shares`, adding to `total` (largest remainder). */
export function shareParticles(shares: number[], total = PARTICLES): number[] {
  const sum = shares.reduce((a, b) => a + b, 0);
  if (!(sum > 0))
    return shares.map(
      (_, i) => Math.floor(total / shares.length) + (i === 0 ? total % shares.length : 0),
    );
  const raw = shares.map((s) => (s / sum) * total);
  const out = raw.map(Math.floor);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < total - out.reduce((a, b) => a + b, 0); k++) out[order[k]![1]]!++;
  return out;
}

/** One atom or two: "He" and "Ar" are single atoms; "O2", "N2", "H2", "Cl2" are pairs. */
const isPair = (formula: string) => /^[A-Z][a-z]?2$/.test(formula);

export function GasMixture({ spec, calc }: { spec: GasPistonSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('glass', 'sheen', 'rod', 'g0', 'g1', 'g2', 'g3');
  const mix = spec.mixture!;
  const gases = mix.gases.slice(0, 4);
  const colors = [c.gasMixA, c.gasMixB, c.gasMixC, c.gasMixD];
  const ps = gases.map((g) => read(g.pressure));
  const known = ps.every((p) => p.known && p.value >= 0);
  const sum = known ? ps.reduce((a, p) => a + p.value, 0) : 0;
  const ok = known && sum > 0;
  const counts = shareParticles(ok ? ps.map((p) => p.value) : gases.map(() => 1));
  const kinds = counts.flatMap((n, i) => Array.from({ length: n }, () => i));
  const spots = gasSpots(PARTICLES);
  const unit = (typeof gases[0]?.pressure === 'string' && rep.unit(gases[0].pressure)) || 'atm';
  const totalRead = mix.total === undefined ? undefined : read(mix.total);
  const total = totalRead?.known ? totalRead.value : ok ? sum : undefined;
  const pMax = niceCeil(Math.max(ok ? sum : 1, total ?? 0) * 1.12);
  const fmt = (x: number) => formatNumber(Number(x.toPrecision(6)));
  const names = gases.map((g) => subscript(g.formula));

  const art = (w: number, h: number) => {
    const top = 34;
    const bottom = h - 18;
    const cw = Math.min(120, w * 0.34);
    const left = Math.max(14, w * 0.3 - cw / 2);
    const right = left + cw;
    const py = top + 10;
    const barX = w * 0.62;
    const bw = 30;
    const Y = (p: number) => bottom - (p / pMax) * (bottom - top);
    const step = niceStep(pMax / 5);
    const ticks: number[] = [];
    for (let t = 0; t <= pMax + 1e-9; t += step) ticks.push(Number(t.toPrecision(10)));
    // The segments, bottom up, and their labels kept 16 px apart.
    let acc = 0;
    const segs = gases.map((_, i) => {
      const p = ok ? ps[i]!.value : sum / gases.length || 1;
      const s = { i, y0: Y(acc + p), y1: Y(acc) };
      acc += p;
      return s;
    });
    const labelY = segs.map((s) => (s.y0 + s.y1) / 2 + 4);
    for (let k = 1; k < labelY.length; k++) labelY[k] = Math.min(labelY[k]!, labelY[k - 1]! - 16);
    const shift = Math.max(0, top + 14 - labelY[labelY.length - 1]!);
    const ly = labelY.map((y) => y + shift);
    return (
      <Svg width={w} height={h}>
        <Defs>
          <Glass id={ids.glass} />
          <Sheen id={ids.sheen} strength={0.8} />
          <Metal id={ids.rod} light={c.metal} dark={c.metalDark} />
          {gases.map((_, i) => (
            <Ball key={i} id={ids[`g${i}` as 'g0']} color={colors[i]!} />
          ))}
        </Defs>
        {/* The cylinder and its particles. */}
        <G opacity={ok ? 1 : 0.4}>
          <Rect x={left} y={top - 16} width={cw} height={bottom - top + 16} fill={url(ids.glass)} />
          {spots.map((p, k) => {
            const i = kinds[k] ?? 0;
            const x = left + 9 + p.x * (cw - 18);
            const y = py + 9 + p.y * (bottom - py - 18);
            const fill = url(ids[`g${i}` as 'g0']);
            if (!isPair(gases[i]!.formula))
              return <Circle key={k} cx={x} cy={y} r={4.6} fill={fill} />;
            const [dx, dy] = [Math.cos(p.dir) * 3.4, Math.sin(p.dir) * 3.4];
            return (
              <G key={k}>
                <Circle cx={x - dx} cy={y - dy} r={4} fill={fill} />
                <Circle cx={x + dx} cy={y + dy} r={4} fill={fill} />
              </G>
            );
          })}
          <Rect x={left} y={top - 16} width={cw} height={bottom - top + 16} fill={url(ids.sheen)} />
          <Rect
            x={left + 1.5}
            y={py - 13}
            width={cw - 3}
            height={13}
            rx={2}
            fill={url(ids.rod)}
            stroke={c.metalDark}
            strokeWidth={1.2}
          />
          <Rect
            x={(left + right) / 2 - 4}
            y={top - 26}
            width={8}
            height={py - top + 13}
            fill={url(ids.rod)}
          />
          <Path
            d={`M ${left} ${top - 16} L ${left} ${bottom} L ${right} ${bottom} L ${right} ${top - 16}`}
            stroke={c.glassEdge}
            strokeWidth={chart.strokeHeavy}
            fill="none"
            strokeLinejoin="round"
          />
        </G>
        {/* The partial pressures stacked to the total. */}
        <ChartText x={barX - 30} y={top - 18} fontSize={chart.label} fill={c.chartMuted}>
          {unit}
        </ChartText>
        {ticks.map((t) => (
          <G key={t}>
            <Line x1={barX - 5} y1={Y(t)} x2={barX} y2={Y(t)} stroke={c.chartInk} strokeWidth={1} />
            <ChartText
              x={barX - 8}
              y={Y(t) + 4}
              textAnchor="end"
              fontSize={chart.label}
              fill={c.chartMuted}
            >
              {formatNumber(t)}
            </ChartText>
          </G>
        ))}
        <Line x1={barX} y1={top} x2={barX} y2={bottom} stroke={c.chartInk} strokeWidth={1.2} />
        <G opacity={ok ? 1 : 0.4}>
          {segs.map((s) => (
            <G key={s.i}>
              <Rect
                x={barX}
                y={s.y0}
                width={bw}
                height={Math.max(0, s.y1 - s.y0)}
                fill={colors[s.i]}
                stroke={c.paper}
                strokeWidth={1}
              />
              <Line
                x1={barX + bw}
                y1={(s.y0 + s.y1) / 2}
                x2={barX + bw + 8}
                y2={ly[s.i]! - 4}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText x={barX + bw + 11} y={ly[s.i]} fontSize={chart.label} fontWeight="700">
                {`${names[s.i]} ${ps[s.i]!.known ? fmt(ps[s.i]!.value) : '?'}`}
              </ChartText>
            </G>
          ))}
        </G>
        <ChartText
          x={barX + bw / 2}
          y={Math.min(Y(ok ? sum : pMax / 2), bottom) - 8}
          textAnchor="middle"
          fontSize={chart.value}
          fontWeight="700"
          fill={c.chartHighlight}
        >
          {`P = ${total === undefined ? '?' : fmt(total)}`}
        </ChartText>
      </Svg>
    );
  };

  const x = mix.fraction === undefined ? undefined : read(mix.fraction);
  const caption = [
    `Dalton’s law: P = ${ps.map((p) => (p.known ? fmt(p.value) : '?')).join(' + ')} = ${total === undefined ? '?' : fmt(total)} ${unit}.`,
    ok
      ? `Each gas’s share of the particles is its share of the pressure: ${PARTICLES} drawn, ${counts.map((n, i) => `${n} ${names[i]}`).join(', ')}${counts.some((n, i) => Math.abs(n - (ps[i]!.value / sum) * PARTICLES) > 1e-9) ? ' (rounded)' : ''}.`
      : 'Type every partial pressure to share out the particles.',
    ...(x
      ? [
          `${names[0]}’s mole fraction = ${ps[0]!.known ? fmt(ps[0]!.value) : '?'}/${total === undefined ? '?' : fmt(total)} = ${x.known ? fmt(x.value) : '?'}.`,
        ]
      : []),
  ].join(' · ');

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, 290 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{caption}</Caption>
    </View>
  );
}
