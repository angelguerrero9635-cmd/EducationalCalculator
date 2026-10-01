import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { GelSpec } from '@/data/modules/typesHsh';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import {
  bandAt,
  GEL_BANDS,
  GEL_LADDER,
  GEL_LANES,
  gelWindow,
  pcrRows,
  sizeAt,
  superscript,
} from './bioModel';
import { Glass, TopLight, url, usePaintIds } from './paint';

/** Text width estimate (as `fitLabel` does). */
const textW = (s: string, size: number) => s.length * size * 0.58;

/**
 * Gel electrophoresis, or PCR (see `GelSpec` in typesHsh.ts). The gel is a real slab, painted:
 * a clear agarose block on its tray, the wells as dark slots at the black (−) end, the red (+)
 * end at the bottom, stained bands. Bands are placed on a log scale of size from the numbers;
 * the ladder's sizes are written beside it. PCR stays flat: a cycle's three steps, then the
 * double strands of each cycle counted exactly.
 */
export function Gel({ spec, calc }: { spec: GelSpec; calc: Calculator }) {
  return spec.pcr ? <Pcr spec={spec} calc={calc} /> : <GelSlab spec={spec} calc={calc} />;
}

const GEL_H = 350;

function GelSlab({ spec, calc }: { spec: GelSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('slab', 'light');
  const start = useRef(0);
  const ladder = spec.ladder === false ? [] : (spec.ladder ?? GEL_LADDER);
  const lanes = (spec.lanes ?? []).slice(0, GEL_LANES).map((l) => ({
    ...l,
    bands: l.bands.slice(0, GEL_BANDS),
  }));
  const size = (b: number | string) => (typeof b === 'number' ? b : rep.val(b));
  const known = (b: number | string) => typeof b === 'number' || rep.known(b);
  const text = (b: number | string) =>
    typeof b === 'number' ? formatNumber(b) : rep.value(b, false);
  const live = gelWindow([...ladder, ...lanes.flatMap((l) => l.bands.map(size))]);
  const win = useFrozen(live);
  const all = [
    ...(ladder.length
      ? [{ label: spec.ladderLabel ?? 'Ladder', bands: ladder, ladder: true }]
      : []),
    ...lanes.map((l) => ({ ...l, ladder: false })),
  ];

  return (
    <View>
      <Canvas aspect={GEL_H / 358}>
        {({ w, h }) => {
          const x0 = ladder.length ? 54 : 8;
          const x1 = w - 6;
          const laneW = (x1 - x0) / Math.max(1, all.length);
          const bandW = Math.min(46, laneW * 0.64);
          const top = 40;
          const bottom = h - 6;
          const wellY = top + 20;
          const y0 = wellY + 16;
          const y1 = bottom - 24;
          const yOf = (bp: number) => y0 + bandAt(bp, win.value) * (y1 - y0);
          const cx = (i: number) => x0 + laneW * (i + 0.5);
          const handles: { id: string; x: number; y: number }[] = [];
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.slab} />
                  <TopLight id={ids.light} />
                </Defs>
                {/* The tray and the clear gel on it, the black − end at the top, red + below. */}
                <Rect
                  x={x0 - 4}
                  y={top - 4}
                  width={x1 - x0 + 8}
                  height={bottom - top + 8}
                  rx={6}
                  fill={c.gelEdge}
                  opacity={0.5}
                />
                <Rect
                  x={x0}
                  y={top}
                  width={x1 - x0}
                  height={bottom - top}
                  rx={3}
                  fill={c.gelSlab}
                  stroke={c.gelEdge}
                  strokeWidth={chart.strokeLight}
                />
                <Rect
                  x={x0}
                  y={top}
                  width={x1 - x0}
                  height={bottom - top}
                  rx={3}
                  fill={url(ids.slab)}
                  opacity={0.45}
                />
                <Rect x={x0} y={top} width={x1 - x0} height={10} fill={c.rubber} />
                <Rect x={x0} y={bottom - 10} width={x1 - x0} height={10} fill={c.mercury} />
                <ChartText
                  x={x1 - 8}
                  y={top + 9}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.snow}
                  textAnchor="end"
                >
                  −
                </ChartText>
                <ChartText
                  x={x1 - 8}
                  y={bottom - 1}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.snow}
                  textAnchor="end"
                >
                  +
                </ChartText>
                {ladder.length ? (
                  <ChartText
                    x={x0 - 8}
                    y={wellY + 6}
                    fontSize={chart.label}
                    fontWeight="700"
                    fill={c.chartMuted}
                    textAnchor="end"
                  >
                    bp
                  </ChartText>
                ) : null}
                {all.map((lane, i) => {
                  const words = lane.label.split(' ');
                  // A long name takes two lines over its lane.
                  const lines =
                    textW(lane.label, chart.label) > laneW - 4 && words.length > 1
                      ? [
                          words.slice(0, Math.ceil(words.length / 2)).join(' '),
                          words.slice(Math.ceil(words.length / 2)).join(' '),
                        ]
                      : [lane.label];
                  // Labels in a lane, top down, pushed apart so none sits on the next.
                  const marks = lane.bands
                    .map((b) => ({ b, y: yOf(size(b)) }))
                    .sort((a, b) => a.y - b.y);
                  // Label baselines placed so far in this lane.
                  const placed: number[] = [];
                  const bandYs = marks.map((m) => m.y);
                  return (
                    <G key={`lane-${i}`}>
                      {lines.map((t, k) => (
                        <ChartText
                          key={k}
                          x={cx(i)}
                          y={top - 22 + k * 14 + (lines.length === 1 ? 10 : 0)}
                          fontSize={chart.label}
                          fontWeight={lane.ladder ? '400' : '700'}
                          textAnchor="middle"
                          fill={lane.ladder ? c.chartMuted : c.chartInk}
                        >
                          {t}
                        </ChartText>
                      ))}
                      <Rect
                        x={cx(i) - bandW / 2}
                        y={wellY - 3}
                        width={bandW}
                        height={6}
                        rx={1.5}
                        fill={c.gelWell}
                      />
                      {marks.map(({ b, y }, k) => {
                        const on = known(b);
                        const drag =
                          !lane.ladder &&
                          !spec.fixed &&
                          typeof b === 'string' &&
                          on &&
                          !rep.variable(b).derived &&
                          // A band worked out from the others (b = L − a) has no handle of its
                          // own: it would only drive the typed band beside it.
                          rep.typed(b);
                        if (drag) handles.push({ id: b, x: cx(i), y });
                        // Ladder sizes sit left of the gel; sample sizes under their bands.
                        // A size goes under its band (clear of a handle), else over it, where
                        // it hits no other band or label in the lane; with no room, the caption
                        // still lists it.
                        const clear = (at: number) =>
                          at - 11 > y0 - 12 &&
                          at < y1 + 16 &&
                          bandYs.every((by, j) => j === k || by < at - 13 || by > at + 5) &&
                          placed.every((p) => Math.abs(p - at) >= 14);
                        const ly = lane.ladder
                          ? undefined
                          : [y + (drag ? 25 : 17), y - (drag ? 14 : 7)].find(clear);
                        if (ly !== undefined) placed.push(ly);
                        return (
                          <G key={`band-${k}`}>
                            <Rect
                              x={cx(i) - bandW / 2}
                              y={y - 2.5}
                              width={bandW}
                              height={5}
                              rx={2}
                              fill={c.gelBand}
                              fillOpacity={on ? (lane.ladder ? 0.7 : 0.95) : 0.2}
                              stroke={on ? 'none' : c.gelBand}
                              strokeWidth={1}
                              strokeDasharray={on ? undefined : chart.dashFine}
                            />
                            {lane.ladder ? (
                              <ChartText
                                x={x0 - 8}
                                y={y + 4}
                                fontSize={chart.label}
                                fill={c.chartMuted}
                                textAnchor="end"
                              >
                                {text(b)}
                              </ChartText>
                            ) : ly === undefined ? null : (
                              <G>
                                <Rect
                                  x={cx(i) - textW(text(b), chart.label) / 2 - 3}
                                  y={ly - 11}
                                  width={textW(text(b), chart.label) + 6}
                                  height={14}
                                  rx={4}
                                  fill={c.gelSlab}
                                  opacity={0.85}
                                />
                                <ChartText
                                  x={cx(i)}
                                  y={ly}
                                  fontSize={chart.label}
                                  fontWeight="700"
                                  textAnchor="middle"
                                  fill={on ? c.chartInk : c.chartMuted}
                                >
                                  {text(b)}
                                </ChartText>
                              </G>
                            )}
                          </G>
                        );
                      })}
                    </G>
                  );
                })}
              </Svg>
              {handles.map((hd) => (
                <DragHandle
                  key={hd.id}
                  testID={`drag-${hd.id}`}
                  x={hd.x}
                  y={hd.y}
                  label={rep.variable(hd.id).name}
                  onStart={() => {
                    start.current = hd.y;
                    win.freeze();
                  }}
                  onEnd={win.release}
                  onMove={(_dx, dy) => {
                    const t = Math.min(1, Math.max(0, (start.current + dy - y0) / (y1 - y0)));
                    calc.set(
                      {
                        ...(spec.keep ? rep.pin(spec.keep) : {}),
                        [hd.id]: rep.snapTo(hd.id, sizeAt(t, win.value)),
                      },
                      rep.slide(hd.id),
                    );
                  }}
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          ...lanes.map((l) => `${l.label}: ${l.bands.map(text).join(' and ')} bp`),
          'Shorter pieces run farther toward +.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}

// ── PCR ──

/** The steps strip and the strand key above the rows. */
const STEP_H = 110;
const ROW_H = 26;

function Pcr({ spec, calc }: { spec: GelSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const pcr = spec.pcr!;
  const num = (x: number | string | undefined, dflt: number) =>
    x === undefined ? dflt : typeof x === 'number' ? x : rep.val(x);
  const shown = (x: number | string | undefined, dflt: number) =>
    x === undefined ? String(dflt) : typeof x === 'number' ? formatNumber(x) : rep.value(x, false);
  const n = Math.max(0, Math.round(num(pcr.cycles, 0)));
  const n0 = Math.max(0, Math.round(num(pcr.start, 1)));
  const rows = pcrRows(n0, n);
  // Rows listed above the last: the drawn cycles, or just the start when too many to draw.
  const listed = Math.max(1, rows.length);
  const more = n > listed - 1;
  const known = typeof pcr.cycles === 'number' || rep.known(pcr.cycles);
  const height = STEP_H + (listed + (more ? 2 : 0)) * ROW_H + 8;
  const copies =
    pcr.copies === undefined
      ? formatNumber(n0 * 2 ** n)
      : typeof pcr.copies === 'number'
        ? formatNumber(pcr.copies)
        : rep.value(pcr.copies, false);

  return (
    <View>
      <Canvas aspect={height / 358}>
        {({ w }) => {
          const panel = (w - 8) / 3;
          const left = 64;
          const right = 78;
          const gap = Math.min(7, (w - left - right) / PCR_GLYPHS);
          const strand = (age: number) => (age === 0 ? c.chartInk : c.chartHighlight);
          const row = (
            k: number,
            cells: [number, number][] | null,
            label: string,
            count: string,
          ) => {
            const y = STEP_H + k * ROW_H + ROW_H / 2;
            return (
              <G key={`row-${k}`}>
                <ChartText x={4} y={y + 4} fontSize={chart.label} fill={c.chartMuted}>
                  {label}
                </ChartText>
                {cells
                  ? cells.map(([a, b], j) => {
                      const x = left + j * gap;
                      return (
                        <G key={j}>
                          <Line
                            x1={x}
                            y1={y - 8}
                            x2={x}
                            y2={y + 8}
                            stroke={strand(a)}
                            strokeWidth={2}
                          />
                          <Line
                            x1={x + 3}
                            y1={y - 8}
                            x2={x + 3}
                            y2={y + 8}
                            stroke={strand(b)}
                            strokeWidth={2}
                          />
                        </G>
                      );
                    })
                  : null}
                <ChartText
                  x={w - 4}
                  y={y + 5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                  fill={known ? c.chartInk : c.chartMuted}
                >
                  {count}
                </ChartText>
              </G>
            );
          };
          return (
            <Svg width={w} height={height}>
              <CycleSteps x={4} width={panel} c={c} />
              {/* The key: an original strand and a newly copied one. */}
              {(
                [
                  [c.chartInk, 'original strand', 8],
                  [c.chartHighlight, 'new strand', w / 2],
                ] as const
              ).map(([color, name, kx]) => (
                <G key={name}>
                  <Line
                    x1={kx}
                    y1={STEP_H - 20}
                    x2={kx + 22}
                    y2={STEP_H - 20}
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <ChartText x={kx + 28} y={STEP_H - 16} fontSize={chart.label} fill={c.chartMuted}>
                    {name}
                  </ChartText>
                </G>
              ))}
              <Line
                x1={4}
                y1={STEP_H - 6}
                x2={w - 4}
                y2={STEP_H - 6}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {rows.length
                ? rows.map((cells, k) =>
                    row(k, cells, k === 0 ? 'Start' : `Cycle ${k}`, formatNumber(n0 * 2 ** k)),
                  )
                : row(0, null, 'Start', formatNumber(n0))}
              {more ? (
                <G>
                  <ChartText
                    x={left + 40}
                    y={STEP_H + listed * ROW_H + ROW_H / 2 + 5}
                    fontSize={chart.emphasis}
                    fill={c.chartMuted}
                    textAnchor="middle"
                  >
                    ⋮
                  </ChartText>
                  {row(listed + 1, null, `Cycle ${shown(pcr.cycles, 0)}`, copies)}
                  <Rect
                    x={left}
                    y={STEP_H + (listed + 1) * ROW_H + 5}
                    width={w - left - right}
                    height={ROW_H - 10}
                    rx={3}
                    fill={c.chartHighlight}
                    opacity={known ? 0.85 : 0.25}
                  />
                </G>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {`${shown(pcr.start, 1)} × 2${known ? superscript(n) : '?'} = ${copies} · Each cycle doubles the copies.`}
      </Caption>
    </View>
  );
}

/** Glyphs a row fits: 32 double strands. */
const PCR_GLYPHS = 32;

/**
 * One cycle's three steps, flat: the strands pulled apart by heat, short primers binding at
 * each strand's end as it cools, and each strand copied from its primer.
 */
function CycleSteps({
  x,
  width,
  c,
}: {
  x: number;
  width: number;
  c: ReturnType<typeof usePalette>;
}) {
  const steps: { name: string; temp: string }[] = [
    { name: 'Separate', temp: '95 °C' },
    { name: 'Primers bind', temp: '55 °C' },
    { name: 'Copy', temp: '72 °C' },
  ];
  const old = c.chartInk;
  const fresh = c.chartHighlight;
  return (
    <G>
      {steps.map((s, i) => {
        const px = x + i * width;
        const a = px + 12;
        const b = px + width - 12;
        const L = (y: number, from: number, to: number, color: string, dash?: boolean) => (
          <Line
            x1={from}
            y1={y}
            x2={to}
            y2={y}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={dash ? '4 3' : undefined}
          />
        );
        const primer = Math.min(18, (b - a) * 0.22);
        return (
          <G key={s.name}>
            <Rect
              x={px + 2}
              y={4}
              width={width - 4}
              height={76}
              rx={8}
              fill={c.chartSurface}
              stroke={c.chartGrid}
            />
            {L(18, a, b, old)}
            {L(38, a, b, old)}
            {i === 1 ? (
              <>
                {L(24, b - primer, b, fresh)}
                {L(32, a, a + primer, fresh)}
              </>
            ) : null}
            {i === 2 ? (
              <>
                {L(24, a + 6, b, fresh)}
                {L(32, a, b - 6, fresh)}
                <Path
                  d={`M ${a + 12} 20 l -6 4 l 6 4 M ${b - 12} 28 l 6 4 l -6 4`}
                  stroke={fresh}
                  strokeWidth={1.5}
                  fill="none"
                />
              </>
            ) : null}
            <ChartText
              x={px + width / 2}
              y={58}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
            >
              {s.name}
            </ChartText>
            <ChartText
              x={px + width / 2}
              y={72}
              fontSize={chart.label}
              fill={c.chartMuted}
              textAnchor="middle"
            >
              {s.temp}
            </ChartText>
          </G>
        );
      })}
    </G>
  );
}
