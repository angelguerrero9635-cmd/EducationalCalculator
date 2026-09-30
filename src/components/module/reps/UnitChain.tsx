/**
 * Measurement in chemistry (H43): a chain of conversion factors with the cancelled units struck
 * through; a wooden ruler read to one estimated digit, with a close-up of the mark; and trials
 * as dots on a target for accuracy and precision. Chains and targets are flat diagrams; the
 * ruler and the rod on it are drawn in wood and metal.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { UnitChainSpec } from '@/data/modules/typesHsi';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { Sheen, TopLight, url, usePaintIds } from './paint';
import {
  cancelUnits,
  chainValue,
  meanOf,
  percentError,
  placesOf,
  readingText,
  sigFigs,
} from './unitChainMath';
import { WoodStick } from './wood';

type Read = ReturnType<ReturnType<typeof reader>>;

export function UnitChain({ spec, calc }: { spec: UnitChainSpec; calc: Calculator }) {
  if (spec.mode === 'ruler') return <RulerReading spec={spec} calc={calc} />;
  if (spec.mode === 'target') return <Target spec={spec} calc={calc} />;
  return <Chain spec={spec} calc={calc} />;
}

// ─── Chain ───────────────────────────────────────────────────────────────────

const SIZE = chart.emphasis;
const LINE_H = 58;

/** One piece of a chain: a quantity (with a unit on top, and a bottom for a fraction) or a sign. */
interface Piece {
  sign?: string;
  top?: { num: string; unit: string; struck: boolean; faded: boolean };
  bottom?: { num: string; unit: string; struck: boolean };
  lit?: boolean;
}

/** Widths of a number (bold) and its unit (regular), with the gap between them. */
const numWidth = (t: string) => t.length * SIZE * 0.6;
const unitWidth = (t: string) => (t ? UNIT_GAP + t.length * SIZE * 0.56 : 0);
const UNIT_GAP = 4;
const partWidth = (p: { num: string; unit: string }) => numWidth(p.num) + unitWidth(p.unit);
const pieceWidth = (p: Piece) =>
  p.sign
    ? SIZE * 1.4
    : Math.max(p.top ? partWidth(p.top) : 0, p.bottom ? partWidth(p.bottom) : 0) +
      (p.bottom ? 12 : 4);

function Chain({
  spec,
  calc,
}: {
  spec: Extract<UnitChainSpec, { mode: 'chain' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const start = read(spec.start);
  const facs = spec.factors.map((f) => ({ ...f, t: read(f.top), b: read(f.bottom) }));
  const res = read(spec.result);
  const { units, result: resultUnit } = cancelUnits(spec.unit, spec.per, spec.factors);
  const struck = (at: number, top: boolean) =>
    units.find((u) => u.at === at && u.top === top)?.cancelled ?? false;
  const text = (r: Read) => (r.known ? r.text : '?');
  const pieces: Piece[] = [
    {
      top: { num: text(start), unit: spec.unit, struck: struck(-1, true), faded: !start.known },
      ...(spec.per ? { bottom: { num: '1', unit: spec.per, struck: struck(-1, false) } } : {}),
    },
    ...facs.flatMap((f, i): Piece[] => [
      { sign: '×' },
      {
        top: { num: text(f.t), unit: f.topUnit, struck: struck(i, true), faded: !f.t.known },
        bottom: { num: text(f.b), unit: f.bottomUnit, struck: struck(i, false) },
      },
    ]),
    { sign: '=' },
    {
      top: {
        num: text(res),
        unit: resultUnit === '1' ? '' : resultUnit,
        struck: false,
        faded: !res.known,
      },
      lit: true,
    },
  ];
  // Pieces wrap onto more lines when the chain is wider than the canvas; a sign stays with the
  // piece after it.
  const lines = (w: number) => {
    const out: Piece[][] = [[]];
    let used = 0;
    pieces.forEach((p, i) => {
      const next = pieces[i + 1];
      const need = pieceWidth(p) + (p.sign && next ? pieceWidth(next) : 0);
      if (
        used + need > w - 16 &&
        out[out.length - 1]!.length > 0 &&
        (p.sign || !pieces[i - 1]?.sign)
      ) {
        out.push([]);
        used = 0;
      }
      out[out.length - 1]!.push(p);
      used += pieceWidth(p);
    });
    return out;
  };
  const known = start.known && facs.every((f) => f.t.known && f.b.known);
  const value = known
    ? chainValue(
        start.value,
        facs.map((f) => [f.t.value, f.b.value]),
      )
    : undefined;
  const cancelled = [...new Set(units.filter((u) => u.cancelled).map((u) => u.unit))];

  const part = (
    key: string,
    cx: number,
    y: number,
    p: { num: string; unit: string; struck: boolean },
    faded: boolean,
    color = c.chartInk,
  ) => {
    const nw = numWidth(p.num);
    const uw = unitWidth(p.unit);
    const x0 = cx - (nw + uw) / 2;
    return (
      <G key={key} opacity={faded ? 0.45 : 1}>
        <ChartText x={x0} y={y} fontSize={SIZE} fontWeight="700" fill={color}>
          {p.num}
        </ChartText>
        {p.unit ? (
          // Units stay upright: they are not variables.
          <ChartText
            x={x0 + nw + UNIT_GAP}
            y={y}
            fontSize={SIZE}
            fill={p.struck ? c.chartMuted : color}
          >
            {p.unit}
          </ChartText>
        ) : null}
        {p.struck ? (
          <Line
            x1={x0 + nw + UNIT_GAP - 2}
            y1={y + 3}
            x2={x0 + nw + uw + 2}
            y2={y - SIZE + 1}
            stroke={c.unitCancel}
            strokeWidth={chart.stroke}
            strokeLinecap="round"
          />
        ) : null}
      </G>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => (lines(w).length * LINE_H + 8) / w}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            {lines(w).map((line, li) => {
              const total = line.reduce((s, p) => s + pieceWidth(p), 0);
              let x = (w - total) / 2;
              const mid = li * LINE_H + LINE_H / 2 + 4;
              return line.map((p, pi) => {
                const pw = pieceWidth(p);
                const cx = x + pw / 2;
                x += pw;
                const key = `${li}-${pi}`;
                if (p.sign)
                  return (
                    <ChartText
                      key={key}
                      x={cx}
                      y={mid + 6}
                      fontSize={SIZE + 4}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {p.sign}
                    </ChartText>
                  );
                if (!p.bottom)
                  return (
                    <G key={key}>
                      {p.lit ? (
                        <Rect
                          x={cx - pw / 2 - 2}
                          y={mid - SIZE}
                          width={pw + 4}
                          height={SIZE * 2}
                          rx={5}
                          fill={c.chartHighlight}
                          opacity={0.14}
                        />
                      ) : null}
                      {part(
                        key,
                        cx,
                        mid + SIZE * 0.36,
                        p.top!,
                        p.top!.faded,
                        p.lit ? c.chartHighlight : c.chartInk,
                      )}
                    </G>
                  );
                return (
                  <G key={key}>
                    {part(`${key}t`, cx, mid - 7, p.top!, p.top!.faded)}
                    <Line
                      x1={cx - pw / 2 + 3}
                      y1={mid}
                      x2={cx + pw / 2 - 3}
                      y2={mid}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {part(`${key}b`, cx, mid + SIZE + 5, p.bottom, false)}
                  </G>
                );
              });
            })}
          </Svg>
        )}
      </Canvas>
      <Caption>
        {[
          cancelled.length
            ? `Struck through: ${cancelled.join(', ')}, each on a top and a bottom, so they cancel.`
            : 'No units cancel.',
          `The unit left is ${resultUnit === '1' ? 'none: the answer is a pure number' : resultUnit}.`,
          'Each factor is 1 (its top and bottom are the same amount), so the amount does not change.',
          value !== undefined && !res.known
            ? `The chain gives ${formatNumber(value)} ${resultUnit}.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Ruler ───────────────────────────────────────────────────────────────────

function RulerReading({
  spec,
  calc,
}: {
  spec: Extract<UnitChainSpec, { mode: 'ruler' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('wood', 'rod');
  const s = read(spec.start ?? 0);
  const e = read(spec.end);
  const known = s.known && e.known;
  const start = s.value;
  const end = Math.max(start, e.value);
  const div = spec.division;
  const places = placesOf(div);
  const span = spec.span ?? Math.max(5, Math.ceil(end + 0.5));
  const endText = readingText(end, div);
  const startText = readingText(start, div);
  const lengthText = readingText(end - start, div);
  const lower = Math.floor(end / div + 1e-9) * div;
  const upper = lower + div;
  const digit = Math.round(((end - lower) / div) * 10) % 10;
  const figures = sigFigs(lengthText);
  const markText = (x: number) => x.toFixed(places);
  const perUnit = Math.round(1 / div);
  const u = spec.unit;

  return (
    <View>
      <Canvas aspect={(w) => 236 / w}>
        {({ w, h }) => {
          const x0 = 18;
          const x1 = w - 18;
          const px = (x1 - x0) / span;
          const sx = (x: number) => x0 + x * px;
          const rulerY = 58;
          const rulerH = 34;
          const rodY = 38;
          const rodH = 16;
          const a = sx(Math.min(span, start));
          const b = sx(Math.min(span, end));
          // Close-up: one division either side of the pair of marks the rod ends between.
          const zx0 = 36;
          const zx1 = w - 36;
          const zy = 124;
          const zh = h - zy - 6;
          const from = lower - div;
          const to = upper + div;
          const zs = (x: number) => zx0 + ((x - from) * (zx1 - zx0)) / (to - from);
          const ticks = Array.from({ length: Math.round(span / div) + 1 }, (_, k) => k);
          const numberEvery = px >= 22 ? 1 : px >= 10 ? 2 : 5;
          const rod = (x: number, y: number, width: number, height: number, r: number) => (
            <G opacity={known ? 1 : 0.35}>
              <Rect
                x={x}
                y={y}
                width={Math.max(2, width)}
                height={height}
                rx={r}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Rect
                x={x}
                y={y}
                width={Math.max(2, width)}
                height={height}
                rx={r}
                fill={url(ids.rod)}
              />
            </G>
          );
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.wood} />
                <Sheen id={ids.rod} vertical />
              </Defs>
              <WoodStick x0={x0 - 10} x1={x1 + 10} y={rulerY} height={rulerH} lightId={ids.wood} />
              {ticks.map((k) => {
                const x = sx(k * div);
                const major = k % perUnit === 0;
                const half = perUnit % 2 === 0 && k % (perUnit / 2) === 0;
                const unitN = Math.round(k * div);
                return (
                  <G key={k}>
                    <Line
                      x1={x}
                      y1={rulerY}
                      x2={x}
                      y2={rulerY + (major ? 14 : half ? 10 : 6)}
                      stroke={c.coinInk}
                      strokeWidth={major ? 1.3 : 0.8}
                    />
                    {major && unitN % numberEvery === 0 ? (
                      <ChartText
                        x={x}
                        y={rulerY + 28}
                        fontSize={chart.label}
                        fill={c.coinInk}
                        textAnchor="middle"
                      >
                        {String(unitN)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {rod(a, rodY, b - a, rodH, 3)}
              {[a, b].map((x, k) => (
                <Line
                  key={k}
                  x1={x}
                  y1={rodY - 4}
                  x2={x}
                  y2={rulerY + 6}
                  stroke={c.chartHighlight}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
              ))}
              <ChartText x={x0} y={20} fontSize={chart.label} fill={c.chartMuted}>
                {`${u}`}
              </ChartText>
              {/* Where the close-up comes from. */}
              <Rect
                x={sx(from) - 2}
                y={rodY - 6}
                width={(to - from) * px + 4}
                height={rulerY + 20 - rodY + 6}
                rx={3}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={sx(from) - 2}
                y1={rulerY + 20}
                x2={zx0 - 12}
                y2={zy}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              <Line
                x1={sx(to) + 2}
                y1={rulerY + 20}
                x2={zx1 + 12}
                y2={zy}
                stroke={c.chartMuted}
                strokeWidth={1}
                strokeDasharray={chart.dashFine}
              />
              {/* The close-up: the rod's end between two marks, tenths of a division imagined. */}
              <Rect
                x={zx0 - 12}
                y={zy}
                width={zx1 - zx0 + 24}
                height={zh}
                rx={8}
                fill={c.wood}
                stroke={c.woodDark}
              />
              <Rect
                x={zx0 - 12}
                y={zy}
                width={zx1 - zx0 + 24}
                height={zh}
                rx={8}
                fill={url(ids.wood)}
              />
              {rod(zx0 - 12, zy + 8, Math.min(zx1 + 12, zs(end)) - zx0 + 12, 20, 2)}
              {Array.from({ length: 9 }, (_, k) => {
                const x = zs(lower + ((k + 1) * div) / 10);
                return (
                  <Line
                    key={`e${k}`}
                    x1={x}
                    y1={zy + 30}
                    x2={x}
                    y2={zy + 38}
                    stroke={c.coinInk}
                    strokeOpacity={0.55}
                    strokeWidth={0.8}
                  />
                );
              })}
              {[from, lower, upper, to].map((m, k) => (
                <G key={k}>
                  <Line
                    x1={zs(m)}
                    y1={zy + 30}
                    x2={zs(m)}
                    y2={zy + 52}
                    stroke={c.coinInk}
                    strokeWidth={1.6}
                  />
                  <ChartText
                    x={zs(m)}
                    y={zy + 68}
                    fontSize={chart.value}
                    fontWeight={k === 1 || k === 2 ? '700' : '400'}
                    fill={c.coinInk}
                    textAnchor="middle"
                  >
                    {markText(m)}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={zs(end)}
                y1={zy + 4}
                x2={zs(end)}
                y2={zy + 54}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeLight}
              />
              <ChartText
                x={Math.min(zx1 - 20, Math.max(zx0 + 20, zs(end)))}
                y={zy + zh - 8}
                fontSize={chart.emphasis}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="middle"
              >
                {known ? `${endText} ${u}` : '?'}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? [
              `The marks are ${formatNumber(div)} ${u} apart, so ${markText(lower)} ${u} is certain.`,
              `The rod ends about ${digit} tenths of the way to ${markText(upper)}: the estimated digit is ${digit}, so it reads ${endText} ${u}.`,
              start !== 0 || spec.start !== undefined
                ? `Length = ${endText} − ${startText} = ${lengthText} ${u}, ${figures} significant figures.`
                : `Length ${lengthText} ${u}: ${figures} significant figures.`,
            ].join(' · ')
          : 'Type where the rod starts and ends.'}
      </Caption>
    </View>
  );
}

// ─── Target ──────────────────────────────────────────────────────────────────

const RINGS = 4;

function Target({
  spec,
  calc,
}: {
  spec: Extract<UnitChainSpec, { mode: 'target' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const trials = spec.trials.map(read);
  const acc = read(spec.accepted);
  const ring = spec.ring ?? 1;
  const unit = spec.unit ? ` ${spec.unit}` : '';
  const allKnown = trials.every((t) => t.known) && acc.known;
  const xs = trials.map((t) => t.value);
  const mean = meanOf(xs);
  const err = percentError(mean, acc.value);
  const spread = Math.max(...xs) - Math.min(...xs);
  const spreadPct = acc.value === 0 ? 0 : (spread / Math.abs(acc.value)) * 100;
  const accurate = err !== undefined && err <= ring;
  const precise = spreadPct <= ring;
  const fmt = (x: number) => formatNumber(Number(x.toPrecision(4)));
  // Percent off the accepted value, as a signed distance in rings.
  const off = (x: number) =>
    (acc.value === 0 ? 0 : ((x - acc.value) / Math.abs(acc.value)) * 100) / ring;

  const art = (w: number, h: number): ReactNode => {
    const R = Math.min(w - 40, 280, h - 60) / 2;
    const cx = w / 2;
    const cy = R + 8;
    const ringW = R / RINGS;
    const clamp = (d: number) => Math.max(-RINGS - 0.3, Math.min(RINGS + 0.3, d));
    const dots = xs.map((x, i) => {
      const dx = clamp(off(x)) * ringW;
      // Up or down by how far the trial is from the others' mean: a tight set stays tight.
      const dev = clamp(off(x) - off(mean)) * ringW;
      const dy = (i % 2 === 0 ? -1 : 1) * Math.abs(dev) * 0.8 + (i - (xs.length - 1) / 2) * 7;
      return { x: cx + dx, y: cy + dy };
    });
    const mx = cx + clamp(off(mean)) * ringW;
    return (
      <Svg width={w} height={h}>
        {Array.from({ length: RINGS }, (_, k) => RINGS - k).map((k) => (
          <Circle
            key={k}
            cx={cx}
            cy={cy}
            r={k * ringW}
            fill={k === 1 ? c.chartSecond : k % 2 === 0 ? c.chartFill : c.chartSurface}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
        ))}
        <Line
          x1={cx - R - 6}
          y1={cy}
          x2={cx + R + 6}
          y2={cy}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        {[-RINGS, -2, 2, RINGS].map((k) => (
          <ChartText
            key={k}
            x={cx + k * ringW}
            y={cy + R + 22}
            fontSize={chart.label}
            fill={c.chartMuted}
            textAnchor="middle"
          >
            {`${k > 0 ? '+' : '−'}${formatNumber(Math.abs(k) * ring)}%`}
          </ChartText>
        ))}
        <ChartText
          x={cx}
          y={cy + R + 22}
          fontSize={chart.label}
          fill={c.chartInk}
          fontWeight="700"
          textAnchor="middle"
        >
          {`${acc.known ? acc.text : '?'}${unit}`}
        </ChartText>
        <G opacity={allKnown ? 1 : 0.4}>
          <Circle
            cx={mx}
            cy={cy}
            r={9}
            fill="none"
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
          {dots.map((d, i) => (
            <Circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={5.5}
              fill={c.chartHighlight}
              stroke={c.card}
              strokeWidth={1.5}
            />
          ))}
        </G>
        <ChartText x={8} y={cy + R + 40} fontSize={chart.label} fill={c.chartMuted}>
          ← low
        </ChartText>
        <ChartText
          x={w - 8}
          y={cy + R + 40}
          fontSize={chart.label}
          fill={c.chartMuted}
          textAnchor="end"
        >
          high →
        </ChartText>
        <ChartText
          x={cx}
          y={cy + R + 40}
          fontSize={chart.label}
          fill={c.chartInk}
          textAnchor="middle"
        >
          ○ mean
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => (Math.min(w - 40, 280) + 60) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {allKnown && err !== undefined
          ? [
              `Mean = ${fmt(mean)}${unit}; percent error = ${fmt(err)}%.`,
              `Accuracy: the mean is ${accurate ? 'within' : 'outside'} the first ring (${formatNumber(ring)}%), so the trials are ${accurate ? 'accurate' : 'not accurate'}.`,
              `Precision: they spread over ${fmt(spread)}${unit} (${fmt(spreadPct)}%), so they are ${precise ? 'precise' : 'not precise'}.`,
            ].join(' · ')
          : 'Type every trial and the accepted value.'}
      </Caption>
    </View>
  );
}
