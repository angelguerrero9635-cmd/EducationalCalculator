/**
 * An enthalpy ladder (H101 part 5), flat: an enthalpy axis, each level a line at its enthalpy to
 * scale with its name above it, and the steps between levels as arrows (down: heat given off,
 * up: heat taken in), each with its ΔH on a chip. The total ΔH is the lit arrow on the right. A
 * step used backwards (Hess's law) keeps a faded dashed arrow for the equation as given, with
 * the opposite sign. Levels and steps not known yet are dashed with "?".
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { ladderLevels, type EnergyLadderSpec, type LadderStep } from '@/data/modules/typesHs2d';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { arrowHead } from './graphKit';

const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const TOP = 42;
const BOTTOM = 18;

export function EnergyLadder({ spec, calc }: { spec: EnergyLadderSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const unit = spec.unit ?? 'kJ';
  const knownVal = (x: NumOrVar) =>
    typeof x === 'number' ? x : rep.known(x) ? rep.shown(x) : undefined;
  // Positions use every value (a "?" draws at the example's, faded); texts only known ones.
  const anyVal = (x: NumOrVar) => (typeof x === 'number' ? x : rep.shown(x));
  const known = ladderLevels(spec, knownVal);
  const drawn = ladderLevels(spec, anyVal).map((v) => v ?? 0);
  const steps = spec.steps.map((s, i) => ({
    ...s,
    name: s.label ?? `ΔH${SUBS[i + 1] ?? ''}`,
    total: false,
  }));
  const total = spec.total ? { ...spec.total, name: spec.total.label ?? 'ΔH', total: true } : null;
  const arrows = [...steps, ...(total ? [total] : [])];
  const signed = (x: number) => (x > 0 ? `+${formatNumber(x)}` : formatNumber(x));
  const stepValue = (s: LadderStep) => {
    const v = s.value === undefined ? undefined : knownVal(s.value);
    if (v !== undefined) return v;
    const [a, b] = [known[s.from], known[s.to]];
    return a === undefined || b === undefined ? undefined : b - a;
  };
  const text = (x: number | undefined) => (x === undefined ? '?' : `${signed(x)} ${unit}`);
  const lo = Math.min(...drawn);
  const hi = Math.max(...drawn);

  const art = (w: number, h: number): ReactNode => {
    const span = h - TOP - BOTTOM;
    const y = (v: number) => TOP + (hi === lo ? span / 2 : ((hi - v) / (hi - lo)) * span);
    const left = 16;
    const labelW = Math.min(140, w * 0.38);
    const colW = (w - labelW - 8) / Math.max(1, arrows.length);
    const colX = (j: number) => labelW + (j + 0.5) * colW;
    // Each level's line runs from the axis to past the last arrow that touches it.
    const lineEnd = spec.levels.map((_, i) =>
      Math.max(
        labelW,
        ...arrows.flatMap((a, j) => (a.from === i || a.to === i ? [colX(j) + 16] : [])),
      ),
    );
    // Names sit just above their lines, nudged apart when two levels are close.
    const order = spec.levels.map((_, i) => i).sort((a, b) => y(drawn[a]!) - y(drawn[b]!));
    const nameY: number[] = [];
    let last = -Infinity;
    for (const i of order) {
      const ny = Math.max(y(drawn[i]!) - 5, last + 15);
      nameY[i] = ny;
      last = ny;
    }
    const parts: ReactNode[] = [];
    spec.levels.forEach((l, i) => {
      const k = known[i] !== undefined;
      const ly = y(drawn[i]!);
      parts.push(
        <G key={`l${i}`}>
          <Line
            x1={left}
            y1={ly}
            x2={lineEnd[i]}
            y2={ly}
            stroke={k ? c.chartInk : c.chartMuted}
            strokeWidth={chart.strokeHeavy}
            strokeDasharray={k ? undefined : chart.dash}
            strokeLinecap="round"
          />
          {nameY[i]! > ly - 5 ? (
            <Rect
              x={left + 2}
              y={nameY[i]! - 12}
              width={Math.min(labelW - left - 4, l.name.length * 7.6 + 4)}
              height={15}
              rx={3}
              fill={c.card}
              opacity={0.9}
            />
          ) : null}
          <ChartText
            x={left + 4}
            y={nameY[i]}
            fontSize={chart.label}
            fontWeight="600"
            fill={k ? c.chartInk : c.chartMuted}
          >
            {`${l.name}${k ? '' : ' (?)'}`}
          </ChartText>
        </G>,
      );
    });
    arrows.forEach((a, j) => {
      const x = colX(j);
      const [ya, yb] = [y(drawn[a.from]!), y(drawn[a.to]!)];
      const v = stepValue(a);
      const color = a.total ? c.chartHighlight : v === undefined ? c.chartMuted : c.chartInk;
      const dir = yb >= ya ? 1 : -1;
      const len = Math.abs(yb - ya);
      if (a.flipped) {
        // The equation as given: the other way, faded and dashed, beside the reversed arrow.
        const gx = x - 11;
        parts.push(
          <G key={`g${j}`} opacity={0.45}>
            <Line
              x1={gx}
              y1={yb - dir * 2}
              x2={gx}
              y2={ya + dir * 8}
              stroke={c.chartMuted}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dashFine}
            />
            <Path d={arrowHead(gx, ya + dir * 1, 0, -dir, 7)} fill={c.chartMuted} />
          </G>,
        );
      }
      parts.push(
        <G key={`a${j}`}>
          <Line
            x1={x}
            y1={ya + dir * 2}
            x2={x}
            y2={yb - dir * 8}
            stroke={color}
            strokeWidth={a.total ? chart.strokeHeavy : chart.stroke}
            strokeDasharray={v === undefined ? chart.dashFine : undefined}
          />
          <Path d={arrowHead(x, yb - dir * 1, 0, dir, 9)} fill={color} />
        </G>,
      );
      // The step's name and ΔH on a chip: over the arrow's middle, or beside a short arrow.
      const lines = [a.name, text(v), ...(a.flipped ? ['sign flipped'] : [])];
      const cw = Math.min(colW - 4, Math.max(...lines.map((t) => t.length)) * 7.2 + 8);
      const ch = lines.length * 14 + 4;
      const mid = (ya + yb) / 2;
      const beside = len < ch + 16;
      const cx = beside ? Math.max(cw / 2 + 1, x - 6 - cw / 2) : x;
      const cy = beside
        ? Math.max(ch / 2, Math.min(h - ch / 2, Math.max(ya, yb) + ch / 2 + 4))
        : mid;
      parts.push(
        <G key={`c${j}`}>
          <Rect
            x={cx - cw / 2}
            y={cy - ch / 2}
            width={cw}
            height={ch}
            rx={4}
            fill={c.card}
            stroke={a.total ? c.chartHighlight : c.chartGrid}
            strokeWidth={1}
          />
          {lines.map((t, k) => (
            <ChartText
              key={k}
              x={cx}
              y={cy - ch / 2 + 15 + k * 14}
              fontSize={chart.label}
              fontWeight={k === 0 ? '700' : '400'}
              textAnchor="middle"
              fill={k === 0 && a.total ? c.chartHighlight : k === 2 ? c.chartMuted : c.chartInk}
            >
              {t}
            </ChartText>
          ))}
        </G>,
      );
    });
    return (
      <Svg width={w} height={h}>
        <Line x1={6} y1={h - 6} x2={6} y2={14} stroke={c.chartMuted} strokeWidth={1.5} />
        <Path d={arrowHead(6, 6, 0, -1, 8)} fill={c.chartMuted} />
        <ChartText x={16} y={14} fontSize={chart.label} fill={c.chartMuted}>
          {`H (${unit})`}
        </ChartText>
        {parts}
      </Svg>
    );
  };

  const name = (i: number) => spec.levels[i]?.name ?? '?';
  const lines = [
    ...steps.map((s) => {
      const v = stepValue(s);
      return `${s.name}: ${name(s.from)} → ${name(s.to)}, ${text(v)}${
        s.flipped && v !== undefined
          ? ` (the equation reversed, so ${signed(-v)} became ${signed(v)})`
          : ''
      }`;
    }),
  ];
  if (total) {
    const v = stepValue(total);
    // Steps that chain from the total's start to its end add up to it (Hess's law).
    let at = total.from;
    const chain: typeof steps = [];
    for (const s of steps)
      if (s.from === at) {
        chain.push(s);
        at = s.to;
      }
    const vals = chain.map(stepValue);
    if (at === total.to && chain.length > 1)
      lines.push(
        `${total.name} = ${chain.map((s) => s.name).join(' + ')} = ${vals
          .map((x) => (x === undefined ? '?' : x < 0 ? `(${formatNumber(x)})` : formatNumber(x)))
          .join(' + ')} = ${text(v)}`,
      );
    else {
      const [a, b] = [known[total.from], known[total.to]];
      lines.push(
        `${total.name} = ${name(total.to)} − (${name(total.from)}) = ${
          b === undefined ? '?' : formatNumber(b)
        } − (${a === undefined ? '?' : formatNumber(a)}) = ${text(v)}`,
      );
    }
    if (v !== undefined)
      lines.push(
        v < 0
          ? 'Down the ladder: heat is given off (exothermic).'
          : 'Up the ladder: heat is taken in (endothermic).',
      );
  }
  return (
    <View>
      <Canvas aspect={(w) => Math.min(1.05, 330 / w)}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
