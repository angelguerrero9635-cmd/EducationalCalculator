import { useRef } from 'react';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { LitRect, TopLight, usePaintIds } from './paint';
import { bracket, fitScale } from './Tape';

type Spec = Extract<Representation, { kind: 'tape'; equation: unknown }>;

/** A piece of the bar, in the equation's units from the bar's start. */
interface Piece {
  from: number;
  to: number;
  kind: 'x' | 'q' | 'xq';
  /** First piece of a group (a heavier line before it). */
  group: boolean;
}

const fmt = (x: number) => formatNumber(x);
/** "+ 5" or "− 5". */
const signed = (q: number) => (q < 0 ? `− ${fmt(-q)}` : `+ ${fmt(q)}`);

/**
 * An equation as a tape (Grade 7): px + q = r is p boxes of x and a box of q, together as
 * long as r (bracketed above). A negative q is a piece of the boxes past r, shaded and taken
 * off. `grouped`, p(x + q) = r, is p equal groups of x and q, or of one box "x − 15". Drag the
 * bar's end to change the total; the unknown follows.
 */
export function TapeEquation({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light');
  const rep = useRep(calc);
  const start = useRef(0);
  const { times, unknown, plus, total, grouped } = spec.equation;
  const letter = rep.words ? '?' : rep.variable(unknown).symbol;
  const knownAll = [times, plus, total].every(rep.known);
  const p = rep.known(times) ? Math.max(1, Math.round(rep.shown(times))) : 1;
  const q = rep.known(plus) ? rep.shown(plus) : 0;
  const r = rep.known(total) ? rep.shown(total) : undefined;
  const xKnown = rep.known(unknown);
  // The box length: the unknown when known; otherwise what the other values make it (the
  // drawing only, never a number), or the example's.
  const fromRest = knownAll && r !== undefined ? (grouped ? r / p - q : (r - q) / p) : undefined;
  const x = xKnown ? rep.shown(unknown) : (fromRest ?? rep.shown(unknown));
  const box = grouped ? x + q : x;
  const drawable = x > 0 && box > 0;

  // The pieces of the bar and how far it runs.
  const pieces: Piece[] = [];
  if (drawable) {
    let at = 0;
    for (let g = 0; g < p; g++) {
      if (grouped && q < 0) {
        pieces.push({ from: at, to: at + box, kind: 'xq', group: true });
        at += box;
        continue;
      }
      pieces.push({ from: at, to: at + x, kind: 'x', group: true });
      at += x;
      if (grouped && q > 0) {
        pieces.push({ from: at, to: at + q, kind: 'q', group: false });
        at += q;
      }
    }
    if (!grouped && q > 0) {
      pieces.push({ from: at, to: at + q, kind: 'q', group: false });
      at += q;
    }
  }
  const barEnd = pieces.length ? pieces[pieces.length - 1]!.to : 0;
  // Taken off: the boxes run past the total by −q.
  const cut = !grouped && q < 0 && drawable ? { from: barEnd + q, to: barEnd } : undefined;
  const totalAt = r ?? (cut ? cut.from : barEnd);
  const fit = useFrozen(fitScale(Math.max(barEnd, totalAt)));

  // The equation, the numbers put in, and the check.
  const P = rep.known(times) ? (p === 1 ? '' : fmt(p)) : '?';
  const Q = rep.known(plus) ? signed(q) : '+ ?';
  const R = r === undefined ? '?' : fmt(r);
  const lines = [grouped ? `${P}(${letter} ${Q}) = ${R}` : `${P}${letter} ${Q} = ${R}`];
  if (xKnown && knownAll) {
    const X = fmt(x);
    const qs = q < 0 ? `− ${fmt(-q)}` : `+ ${fmt(q)}`;
    lines.push(
      grouped
        ? `${fmt(p)} × (${X} ${qs}) = ${fmt(p)} × ${fmt(x + q)} = ${fmt(p * (x + q))}`
        : `${fmt(p)} × ${X} ${qs} = ${fmt(p * x)} ${qs} = ${fmt(p * x + q)}`,
    );
  }
  if (!drawable && knownAll) lines.push(`A box would be ${fmt(box)} long: the tape can’t show it.`);

  return (
    <>
      <Canvas aspect={(w) => (cut ? 142 : 114) / w}>
        {({ w, h }) => {
          const left = 12;
          const scale = (w - left - 16) / fit.value;
          const X = (v: number) => left + v * scale;
          const y = 40;
          const barH = 34;
          const pieceText = (k: Piece['kind']) =>
            k === 'x' ? letter : k === 'q' ? fmt(Math.abs(q)) : `${letter} − ${fmt(-q)}`;
          const firstX = pieces.find((pc) => pc.kind === 'x');
          // p(x − 15): the first group bracketed with its value.
          const firstGroup = pieces.find((pc) => pc.kind === 'xq');
          const groupLabel = `${pieceText('xq')} = ${xKnown ? fmt(box) : '?'}`;
          const xLabel = rep.label(unknown);
          const totalLabel = rep.label(total);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={paint.light} />
                </Defs>
                {/* The total, bracketed over the bar. */}
                {drawable ? (
                  <G opacity={r === undefined ? 0.4 : 1}>
                    <Path d={bracket(X(0), X(totalAt), 28, -1)} stroke={c.chartInk} fill="none" />
                    <ChartText
                      {...fitLabel((X(0) + X(totalAt)) / 2, totalLabel, chart.label, w)}
                      y={14}
                      fontWeight="700"
                    >
                      {totalLabel}
                    </ChartText>
                  </G>
                ) : null}
                {pieces.map((pc, i) => (
                  <LitRect
                    key={i}
                    lightId={paint.light}
                    x={X(pc.from)}
                    y={y}
                    width={Math.max(1, (pc.to - pc.from) * scale)}
                    height={barH}
                    fill={pc.kind === 'q' ? c.chartSecond : c.chartHighlight}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                    opacity={xKnown || pc.kind === 'q' ? 1 : 0.55}
                  />
                ))}
                {/* Heavier lines between groups. */}
                {grouped
                  ? pieces
                      .filter((pc, i) => pc.group && i > 0)
                      .map((pc, i) => (
                        <Line
                          key={`g${i}`}
                          x1={X(pc.from)}
                          y1={y - 5}
                          x2={X(pc.from)}
                          y2={y + barH + 5}
                          stroke={c.chartInk}
                          strokeWidth={chart.strokeHeavy}
                        />
                      ))
                  : null}
                {pieces.map((pc, i) => {
                  const t = pieceText(pc.kind);
                  const wide = (pc.to - pc.from) * scale;
                  return wide >= t.length * chart.label * 0.62 + 6 ? (
                    <ChartText
                      key={`t${i}`}
                      x={X((pc.from + pc.to) / 2)}
                      y={y + barH / 2 + 5}
                      fontWeight="700"
                      fontStyle={pc.kind === 'x' ? 'italic' : 'normal'}
                      textAnchor="middle"
                      fill={pc.kind === 'q' ? c.coinInk : c.onChartHighlight}
                    >
                      {t}
                    </ChartText>
                  ) : null;
                })}
                {/* The piece taken off past the total: shaded over, with its bracket. */}
                {cut ? (
                  <G>
                    <Rect
                      x={X(cut.from)}
                      y={y}
                      width={(cut.to - cut.from) * scale}
                      height={barH}
                      fill={c.chartSurface}
                      opacity={0.75}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dashFine}
                    />
                    <Path
                      d={Array.from(
                        { length: Math.ceil(((cut.to - cut.from) * scale) / 8) + 4 },
                        (_, k) => {
                          const x0 = X(cut.from) + k * 8 - barH;
                          const lo = Math.max(X(cut.from), x0);
                          const hi = Math.min(X(cut.to), x0 + barH);
                          return hi > lo
                            ? `M ${lo} ${y + barH - (lo - x0)} L ${hi} ${y + barH - (hi - x0)}`
                            : '';
                        },
                      ).join(' ')}
                      stroke={c.chartMuted}
                      strokeWidth={1}
                    />
                    <Path
                      d={bracket(X(cut.from), X(cut.to), y + barH + 38, 1)}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel(
                        (X(cut.from) + X(cut.to)) / 2,
                        `take off ${fmt(-q)}`,
                        chart.small,
                        w,
                      )}
                      y={y + barH + 60}
                      fontSize={chart.small}
                    >
                      {`take off ${fmt(-q)}`}
                    </ChartText>
                  </G>
                ) : null}
                {/* One box bracketed under the bar: the unknown. */}
                {firstX ? (
                  <G>
                    <Path
                      d={bracket(X(firstX.from), X(firstX.from + x), y + barH + 8, 1)}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel(
                        (X(firstX.from) + X(firstX.from + x)) / 2,
                        xLabel,
                        chart.label,
                        w,
                      )}
                      y={y + barH + 30}
                      fontWeight="700"
                      fill={xKnown ? c.chartInk : c.chartMuted}
                    >
                      {xLabel}
                    </ChartText>
                  </G>
                ) : null}
                {firstGroup ? (
                  <G>
                    <Path
                      d={bracket(X(firstGroup.from), X(firstGroup.to), y + barH + 8, 1)}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <ChartText
                      {...fitLabel(
                        (X(firstGroup.from) + X(firstGroup.to)) / 2,
                        groupLabel,
                        chart.label,
                        w,
                      )}
                      y={y + barH + 30}
                      fontWeight="700"
                      fill={xKnown ? c.chartInk : c.chartMuted}
                    >
                      {groupLabel}
                    </ChartText>
                  </G>
                ) : null}
              </Svg>
              {drawable && r !== undefined ? (
                <DragHandle
                  testID={`drag-${total}`}
                  // On the total's bracket, clear of the boxes' letters.
                  x={X(r)}
                  y={26}
                  label={rep.variable(total).name}
                  onStart={() => {
                    start.current = r;
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin([times, plus]),
                        [total]: rep.snapTo(
                          total,
                          (start.current + dx / scale) * rep.factor(total),
                        ),
                      },
                      rep.slide(total),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </>
  );
}
