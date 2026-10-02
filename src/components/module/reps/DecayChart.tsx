/**
 * Radioactive decay (H57, Grades 9–12 chemistry and Earth science): a grid of 100 atoms where
 * the decayed ones have turned to the daughter, as many left as the half-life says (which ones
 * is random, from a fixed seed), and the decay curve with each half-life marked; or a nuclear
 * equation with every mass number over its atomic number and both sums checked.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Polyline } from 'react-native-svg';

import type { DecayChartSpec, Nuclide } from '@/data/modules/typesHsj';
import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber, scientific } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { element } from './chem';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import { DECAY_ORDER, GRID_ATOMS, PARTICLES, atomsLeft, shareLeft } from './decayModel';
import { MathChip } from './hsdText';
import { axisOf, makePlot, PlotFrame } from './hsjPlot';
import { Ball, url, usePaintIds } from './paint';

type Rep = ReturnType<typeof useRep>;
type Decay = Exclude<DecayChartSpec, { mode: 'equation' }>;
type Equation = Extract<DecayChartSpec, { mode: 'equation' }>;

/**
 * A worked-out amount or time as the picture says it, to 3 figures: big times as 4.47 × 10⁹
 * (never 3.2091 × 10⁹), the rest plain (15.3, never 15.2905).
 */
const big = (x: number) =>
  Math.abs(x) >= 1e6
    ? scientific(Number(x.toPrecision(3)))
    : formatNumber(Number(x.toPrecision(3)));

const RAISED: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '.': '·',
};
/** ½ to a power, raised even when it is a decimal: (1/2)²·⁷¹, never (1/2)^2.71. */
const halfTo = (power: string) =>
  `(1/2)${[...power.replace(/,/g, '')].map((ch) => RAISED[ch] ?? ch).join('')}`;

/** A value as the picture says it: past a million, 3 figures in powers of ten (3.21 × 10⁹, never 3,209,219,858). */
const readOf = (rep: Rep) => (x: NumOrVar) =>
  typeof x === 'number'
    ? { value: x, known: true, text: big(x) }
    : {
        value: rep.shown(x),
        known: rep.known(x),
        text:
          rep.known(x) && Math.abs(rep.shown(x)) >= 1e6
            ? scientific(Number(rep.shown(x).toPrecision(3)))
            : rep.value(x, false),
      };

export function DecayChart({ spec, calc }: { spec: DecayChartSpec; calc: Calculator }) {
  const rep = useRep(calc);
  return spec.mode === 'equation' ? (
    <EquationView spec={spec} rep={rep} />
  ) : (
    <DecayView spec={spec} rep={rep} calc={calc} />
  );
}

function DecayView({ spec, rep, calc }: { spec: Decay; rep: Rep; calc: Calculator }) {
  const c = usePalette();
  const read = readOf(rep);
  const ids = usePaintIds('parent', 'daughter');
  const start = useRef(0);
  const [T, t, n0] = [read(spec.halfLife), read(spec.time), read(spec.start)];
  const halves = T.value > 0 ? Math.max(0, t.value) / T.value : 0;
  const left = atomsLeft(t.value, T.value);
  const amount = n0.value * shareLeft(t.value, T.value);
  const alive = new Set(DECAY_ORDER.slice(GRID_ATOMS - left));
  const tUnit = (typeof spec.time === 'string' ? rep.unit(spec.time) : undefined) ?? '';
  const nUnit =
    [spec.start, spec.left]
      .map((v) => (typeof v === 'string' ? rep.unit(v) : undefined))
      .find(Boolean) ?? '';
  const halvesText = formatNumber(Number(halves.toPrecision(3)));
  const halvesWord = `${halvesText} half-li${halves === 1 ? 'fe' : 'ves'}`;
  const pow = halfTo(halvesText);
  const span = Math.max(4, Math.ceil(halves * 1.15));
  const liveX = { lo: 0, hi: T.value * span, step: T.value * (span > 8 ? 2 : 1) };
  const frame = useFrozen(liveX);
  const x = frame.value;
  const y = axisOf(0, n0.value, 4);
  const known = T.known && t.known && n0.known;
  // The half-lives passed (and the atoms left) need the time and the half-life.
  const tOk = T.known && t.known;
  const timeId = typeof spec.time === 'string' ? spec.time : undefined;
  const parent = spec.parent ?? 'parent';
  const daughter = spec.daughter ?? 'daughter';
  const withUnit = (v: string, u: string) => (u === '%' ? `${v}%` : u ? `${v} ${u}` : v);

  return (
    <View>
      <Canvas aspect={1.18}>
        {({ w, h }) => {
          const gap = Math.min(15, (w * 0.46) / 10);
          const g0 = { x: 16 + gap / 2, y: 14 + gap / 2 };
          const gridBottom = 14 + gap * 10;
          const p = makePlot(w, h, x, y, {
            T: gridBottom + 26,
            L: 52,
            R: x.hi >= 1e6 ? 40 : 18,
            B: 42,
          });
          const curve = Array.from({ length: 161 }, (_, k) => (x.hi * k) / 160)
            .map((v) => `${p.sx(v)},${p.sy(n0.value * shareLeft(v, T.value))}`)
            .join(' ');
          const lx = 16 + gap * 10 + 16;
          const tx = Math.min(x.hi, Math.max(0, t.value));
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={ids.parent} color={c.decayParent} />
                  <Ball id={ids.daughter} color={c.decayDaughter} />
                </Defs>
                {/* The grid of 100 atoms: parent atoms still whole, daughters where one decayed. */}
                <G opacity={known ? 1 : 0.4}>
                  {Array.from({ length: GRID_ATOMS }, (_, i) => (
                    <Circle
                      key={i}
                      cx={g0.x + (i % 10) * gap}
                      cy={g0.y + Math.floor(i / 10) * gap}
                      r={gap * 0.4}
                      fill={url(alive.has(i) ? ids.parent : ids.daughter)}
                      stroke={c.chartInk}
                      strokeWidth={0.6}
                    />
                  ))}
                </G>
                <Circle
                  cx={lx + 6}
                  cy={24}
                  r={6}
                  fill={url(ids.parent)}
                  stroke={c.chartInk}
                  strokeWidth={0.6}
                />
                <ChartText x={lx + 18} y={28} fontSize={chart.label} fontWeight="700">
                  {`${parent}: ${tOk ? left : '?'} left`}
                </ChartText>
                <Circle
                  cx={lx + 6}
                  cy={46}
                  r={6}
                  fill={url(ids.daughter)}
                  stroke={c.chartInk}
                  strokeWidth={0.6}
                />
                <ChartText x={lx + 18} y={50} fontSize={chart.label}>
                  {`${daughter}: ${GRID_ATOMS - left} decayed`}
                </ChartText>
                <ChartText x={lx} y={80} fontSize={chart.label} fill={c.chartMuted}>
                  {tOk ? halvesWord : '? half-lives'}
                </ChartText>
                <ChartText x={lx} y={98} fontSize={chart.label} fill={c.chartMuted}>
                  {tOk ? `100 × ${pow} ≈ ${left}` : '100 × ?'}
                </ChartText>
                <ChartText x={lx} y={116} fontSize={chart.label} fill={c.chartMuted}>
                  Which atoms decay is random.
                </ChartText>
                <PlotFrame
                  p={p}
                  xName={withUnit('Time', tUnit ? `(${tUnit})` : '')}
                  yName={withUnit('Left', nUnit ? `(${nUnit})` : '')}
                  // A "?" half-life: the time axis counts half-lives (T, 2T, …), not the
                  // example's days.
                  xText={
                    T.known
                      ? big
                      : (v) => {
                          const k = Math.round(v / T.value);
                          return v === 0 ? '0' : k === 1 ? 'T' : `${formatNumber(k)}T`;
                        }
                  }
                />
                <G opacity={known ? 1 : 0.4}>
                  {/* Each half-life: the amount halves again. */}
                  {Array.from({ length: Math.floor(x.hi / T.value + 1e-9) }, (_, k) => k + 1).map(
                    (k) => (
                      <G key={k}>
                        <Line
                          x1={p.sx(k * T.value)}
                          y1={p.sy(0)}
                          x2={p.sx(k * T.value)}
                          y2={p.sy(n0.value * 0.5 ** k)}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                        <Line
                          x1={p.L}
                          y1={p.sy(n0.value * 0.5 ** k)}
                          x2={p.sx(k * T.value)}
                          y2={p.sy(n0.value * 0.5 ** k)}
                          stroke={c.chartMuted}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                        />
                        <Circle
                          cx={p.sx(k * T.value)}
                          cy={p.sy(n0.value * 0.5 ** k)}
                          r={3}
                          fill={c.chartMuted}
                        />
                      </G>
                    ),
                  )}
                  <Polyline
                    points={curve}
                    fill="none"
                    stroke={c.decayParent}
                    strokeWidth={chart.strokeHeavy}
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={p.sx(tx)}
                    cy={p.sy(amount)}
                    r={6}
                    fill={c.chartHighlight}
                    stroke={c.card}
                    strokeWidth={1.5}
                  />
                  <MathChip
                    x={p.sx(tx) + 12}
                    y={p.sy(amount) - 8}
                    text={known ? withUnit(big(amount), nUnit) : '?'}
                    anchor="start"
                    w={w}
                    h={h}
                  />
                </G>
              </Svg>
              {timeId && !spec.fixed ? (
                <DragHandle
                  testID="drag-time"
                  x={p.sx(tx)}
                  y={p.sy(amount)}
                  label="the time"
                  onStart={() => {
                    start.current = t.value;
                    frame.freeze();
                  }}
                  onMove={(dx) => {
                    const perPx = (x.hi - x.lo) / (w - p.L - p.R);
                    const next = Math.min(x.hi, Math.max(0, start.current + dx * perPx));
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [timeId]: rep.snapTo(timeId, next * rep.factor(timeId)),
                      },
                      rep.slide(timeId),
                    );
                  }}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          // A "?" value: the rule only, never worked with the example's numbers behind it.
          known
            ? `After ${withUnit(t.text, tUnit)}, ${halvesWord} ${halves === 1 ? 'has' : 'have'} passed: ${n0.text} × ${pow} = ${withUnit(big(amount), nUnit)} left.`
            : 'Each half-life, the amount left halves.',
          `In the grid ${tOk ? left : '?'} of ${GRID_ATOMS} ${parent} atoms are left; each half-life, half of those still there decay.`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}

/** A term's numbers and symbol, from a nucleus or a particle. */
function termOf(n: Nuclide, read: ReturnType<typeof readOf>) {
  const count = n.count === undefined ? { value: 1, known: true, text: '1' } : read(n.count);
  if ('particle' in n) {
    const p = PARTICLES[n.particle];
    return {
      mass: { value: p.mass, known: true, text: String(p.mass) },
      atomic: { value: p.atomic, known: true, text: formatNumber(p.atomic) },
      symbol: p.symbol,
      count,
      name: p.name,
    };
  }
  const [mass, atomic] = [read(n.mass), read(n.atomic)];
  const symbol = n.symbol ?? (atomic.known ? element(atomic.value)?.symbol : undefined) ?? '?';
  return { mass, atomic, symbol, count, name: element(atomic.value)?.name ?? symbol };
}

function EquationView({ spec, rep }: { spec: Equation; rep: Rep }) {
  const c = usePalette();
  const read = readOf(rep);
  const left = spec.left.map((n) => termOf(n, read));
  const right = spec.right.map((n) => termOf(n, read));
  const known = [...left, ...right].every((t) => t.mass.known && t.atomic.known && t.count.known);
  const sum = (ts: typeof left, k: 'mass' | 'atomic') =>
    ts.reduce((s, t) => s + t.count.value * t[k].value, 0);
  const sumText = (ts: typeof left, k: 'mass' | 'atomic') =>
    ts
      .map((t) => (t.count.value === 1 ? t[k].text : `${t.count.text} × ${t[k].text}`))
      .join(' + ')
      .replace(/\+ −/g, '− ')
      .replace(/\+ -/g, '− ');
  const ok = (k: 'mass' | 'atomic') => Math.abs(sum(left, k) - sum(right, k)) < 1e-9;
  const size = 24;
  const scriptSize = 13;
  const widthOf = (t: (typeof left)[number]) =>
    (t.count.value !== 1 ? t.count.text.length * 14 + 4 : 0) +
    Math.max(t.mass.text.length, t.atomic.text.length) * scriptSize * 0.6 +
    2 +
    t.symbol.length * size * 0.62;
  const plus = 26;
  const arrow = 40;
  const total =
    left.reduce((s, t) => s + widthOf(t), 0) +
    right.reduce((s, t) => s + widthOf(t), 0) +
    plus * (left.length + right.length - 2) +
    arrow;

  return (
    <View>
      <Canvas aspect={0.46}>
        {({ w, h }) => {
          const k = Math.min(1, (w - 16) / total);
          let x = (w - total * k) / 2;
          const y = h * 0.42;
          const parts: ReactNode[] = [];
          const put = (t: (typeof left)[number], key: string) => {
            if (t.count.value !== 1) {
              parts.push(
                <ChartText
                  key={`${key}c`}
                  x={x}
                  y={y + size * 0.35 * k}
                  fontSize={size * k}
                  fontWeight="700"
                >
                  {t.count.text}
                </ChartText>,
              );
              x += (t.count.text.length * 14 + 4) * k;
            }
            const sw = Math.max(t.mass.text.length, t.atomic.text.length) * scriptSize * 0.6 * k;
            parts.push(
              <ChartText
                key={`${key}m`}
                x={x + sw}
                y={y - 6 * k}
                textAnchor="end"
                fontSize={scriptSize * k}
                fill={c.chartHighlight}
                fontWeight="700"
              >
                {t.mass.text}
              </ChartText>,
              <ChartText
                key={`${key}z`}
                x={x + sw}
                y={y + 16 * k}
                textAnchor="end"
                fontSize={scriptSize * k}
                fill={c.hopBack}
                fontWeight="700"
              >
                {t.atomic.text}
              </ChartText>,
            );
            x += sw + 2 * k;
            parts.push(
              <ChartText
                key={`${key}s`}
                x={x}
                y={y + size * 0.35 * k}
                fontSize={size * k}
                fontWeight="700"
              >
                {t.symbol}
              </ChartText>,
            );
            x += t.symbol.length * size * 0.62 * k;
          };
          const sep = (text: string, width: number, key: string) => {
            parts.push(
              <ChartText
                key={key}
                x={x + (width * k) / 2}
                y={y + size * 0.3 * k}
                textAnchor="middle"
                fontSize={size * k}
              >
                {text}
              </ChartText>,
            );
            x += width * k;
          };
          left.forEach((t, i) => {
            if (i) sep('+', plus, `lp${i}`);
            put(t, `l${i}`);
          });
          sep('→', arrow, 'arrow');
          right.forEach((t, i) => {
            if (i) sep('+', plus, `rp${i}`);
            put(t, `r${i}`);
          });
          return (
            <Svg width={w} height={h}>
              <G opacity={known ? 1 : 0.4}>{parts}</G>
              <ChartText
                x={w / 2}
                y={h * 0.72}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.chartHighlight}
                fontWeight="700"
              >
                {`Mass numbers: ${sumText(left, 'mass')} = ${sumText(right, 'mass')}${known ? (ok('mass') ? '' : '  ✗') : ''}`}
              </ChartText>
              <ChartText
                x={w / 2}
                y={h * 0.72 + 18}
                textAnchor="middle"
                fontSize={chart.label}
                fill={c.hopBack}
                fontWeight="700"
              >
                {`Atomic numbers: ${sumText(left, 'atomic')} = ${sumText(right, 'atomic')}${known ? (ok('atomic') ? '' : '  ✗') : ''}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          'Mass numbers (top) and atomic numbers (bottom) add to the same on both sides.',
          ...[...left, ...right]
            .filter(
              (t) =>
                'name' in t &&
                ['alpha particle', 'beta particle', 'positron', 'gamma ray'].includes(t.name),
            )
            .slice(0, 1)
            .map((t) =>
              t.name === 'alpha particle'
                ? 'An alpha particle is a helium nucleus: 2 protons and 2 neutrons.'
                : t.name === 'beta particle'
                  ? 'A beta particle is an electron: a neutron turned into a proton.'
                  : t.name === 'positron'
                    ? 'A positron is a positive electron: a proton turned into a neutron.'
                    : 'A gamma ray carries energy only: the numbers don’t change.',
            ),
        ].join(' · ')}
      </Caption>
    </View>
  );
}
