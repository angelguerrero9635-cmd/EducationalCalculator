/**
 * H109 `gel` explore figure: gel electrophoresis of fixed samples, for DNA fingerprinting. The
 * slab is painted as the calculator's `gel` picture is (a clear agarose block on its tray, the
 * wells at the black − end, the red + end below) and every band sits on the same log scale of
 * size, set from all the figure's lanes so a scene change never moves a band. A scene picks the
 * lanes, rings some, and compares one lane's bands with the rest: dashed lines across the gel at
 * its bands, the bands of other lanes at the same size lit, the matches counted in the caption.
 * With `parents`, each of the child's bands takes the color of the parent it matches (maternal
 * red, paternal blue), and a band found in neither is ringed with a "?".
 */
import { Defs, G, Line, Rect } from 'react-native-svg';

import { type GelScene, type Hs3dFigure, sameBand } from '@/data/modules/typesHs3d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import { bandAt, GEL_LADDER } from '../reps/bioModel';
import { Caption, ChartText } from '../reps/common';
import { Glass, url, usePaintIds } from '../reps/paint';
import { BOARD_W, Board, textW } from './earthKit';
import { gelCaption, gelFigureWindow, gelSceneLanes, parentOf } from './gelFigureMath';

type GelFig = Extract<Hs3dFigure, { kind: 'gel' }>;

const H = 340;
const TOP = 40;
const BOTTOM = H - 6;
const WELL_Y = TOP + 20;
const Y0 = WELL_Y + 16;
const Y1 = BOTTOM - 22;

export function GelFigure({ figure, scene }: { figure: GelFig; scene: GelScene }) {
  const c = usePalette();
  const ids = usePaintIds('slab');
  const ladder = figure.ladder === false ? [] : (figure.ladder ?? GEL_LADDER);
  const win = gelFigureWindow(figure);
  const lanes = gelSceneLanes(figure, scene);
  const all = [
    ...(ladder.length ? [{ label: 'Ladder', bands: ladder, ladder: true }] : []),
    ...lanes.map((l) => ({ ...l, ladder: false })),
  ];
  const x0 = ladder.length ? 54 : 8;
  const x1 = BOARD_W - 6;
  const laneW = (x1 - x0) / Math.max(1, all.length);
  const bandW = Math.min(44, laneW * 0.64);
  const cx = (i: number) => x0 + laneW * (i + 0.5);
  const yOf = (bp: number) => Y0 + bandAt(bp, win) * (Y1 - Y0);
  const ref = lanes.find((l) => l.label === scene.compare);
  const [mother, father] = scene.parents ?? [];
  const mom = lanes.find((l) => l.label === mother);
  const dad = lanes.find((l) => l.label === father);
  const lit = new Set(scene.lit ?? []);

  /** A band's color: by parent in a family scene, lit when it matches the compared lane. */
  const bandColor = (lane: string, bp: number): string | undefined => {
    if (!ref) return undefined;
    if (mom && dad) {
      if (lane === ref.label) {
        const p = parentOf(bp, mom.bands, dad.bands);
        return p === 'mother' ? c.bioMaternal : p === 'father' ? c.bioPaternal : undefined;
      }
      const inChild = ref.bands.some((b) => sameBand(b, bp));
      if (!inChild) return undefined;
      if (lane === mother) return c.bioMaternal;
      // The father's band lights only where the mother's can't explain the child's.
      if (lane === father)
        return mom.bands.some((b) => sameBand(b, bp)) ? undefined : c.bioPaternal;
      return undefined;
    }
    return lane !== ref.label && ref.bands.some((b) => sameBand(b, bp))
      ? c.chartHighlight
      : undefined;
  };

  return (
    <>
      <Board height={H}>
        <Defs>
          <Glass id={ids.slab} />
        </Defs>
        <Rect
          x={x0 - 4}
          y={TOP - 4}
          width={x1 - x0 + 8}
          height={BOTTOM - TOP + 8}
          rx={6}
          fill={c.gelEdge}
          opacity={0.5}
        />
        <Rect
          x={x0}
          y={TOP}
          width={x1 - x0}
          height={BOTTOM - TOP}
          rx={3}
          fill={c.gelSlab}
          stroke={c.gelEdge}
          strokeWidth={chart.strokeLight}
        />
        <Rect
          x={x0}
          y={TOP}
          width={x1 - x0}
          height={BOTTOM - TOP}
          rx={3}
          fill={url(ids.slab)}
          opacity={0.45}
        />
        <Rect x={x0} y={TOP} width={x1 - x0} height={10} fill={c.rubber} />
        <Rect x={x0} y={BOTTOM - 10} width={x1 - x0} height={10} fill={c.mercury} />
        <ChartText
          x={x1 - 8}
          y={TOP + 9}
          fontSize={chart.value}
          fontWeight="700"
          fill={c.snow}
          textAnchor="end"
        >
          −
        </ChartText>
        <ChartText
          x={x1 - 8}
          y={BOTTOM - 1}
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
            y={WELL_Y + 6}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartMuted}
            textAnchor="end"
          >
            bp
          </ChartText>
        ) : null}
        {/* The compared lane's bands as dashed lines across the gel. */}
        {ref
          ? ref.bands.map((bp, k) => (
              <Line
                key={`cmp-${k}`}
                x1={x0 + 2}
                x2={x1 - 2}
                y1={yOf(bp)}
                y2={yOf(bp)}
                stroke={bandColor(ref.label, bp) ?? c.chartHighlight}
                strokeWidth={1.2}
                strokeDasharray={chart.dashFine}
                opacity={0.9}
              />
            ))
          : null}
        {all.map((lane, i) => (
          <Lane
            key={lane.label}
            label={lane.label}
            bands={lane.bands}
            ladder={lane.ladder}
            x={cx(i)}
            laneW={laneW}
            bandW={bandW}
            yOf={yOf}
            ringed={lit.has(lane.label)}
            colorOf={(bp) => (lane.ladder ? undefined : bandColor(lane.label, bp))}
            unknown={(bp) =>
              !!(mom && dad && ref && lane.label === ref.label) &&
              parentOf(bp, mom.bands, dad.bands) === undefined
            }
            ladderX={x0 - 8}
            c={c}
          />
        ))}
      </Board>
      <Caption>{gelCaption(lanes, scene)}</Caption>
    </>
  );
}

function Lane({
  label,
  bands,
  ladder,
  x,
  laneW,
  bandW,
  yOf,
  ringed,
  colorOf,
  unknown,
  ladderX,
  c,
}: {
  label: string;
  bands: number[];
  ladder: boolean;
  x: number;
  laneW: number;
  bandW: number;
  yOf: (bp: number) => number;
  ringed: boolean;
  colorOf: (bp: number) => string | undefined;
  unknown: (bp: number) => boolean;
  ladderX: number;
  c: Palette;
}) {
  const words = label.split(' ');
  const lines =
    textW(label, chart.label, true) > laneW - 2 && words.length > 1
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(' '),
          words.slice(Math.ceil(words.length / 2)).join(' '),
        ]
      : [label];
  return (
    <G>
      {ringed ? (
        <Rect
          x={x - laneW / 2 + 2}
          y={TOP + 12}
          width={laneW - 4}
          height={BOTTOM - TOP - 24}
          rx={5}
          fill="none"
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
        />
      ) : null}
      {lines.map((t, k) => (
        <ChartText
          key={k}
          x={x}
          y={TOP - 22 + k * 14 + (lines.length === 1 ? 10 : 0)}
          fontSize={chart.label}
          fontWeight={ladder ? '400' : '700'}
          textAnchor="middle"
          fill={ringed ? c.chartHighlight : ladder ? c.chartMuted : c.chartInk}
        >
          {t}
        </ChartText>
      ))}
      <Rect x={x - bandW / 2} y={WELL_Y - 3} width={bandW} height={6} rx={1.5} fill={c.gelWell} />
      {bands.map((bp, k) => {
        const y = yOf(bp);
        const color = colorOf(bp);
        const odd = unknown(bp);
        return (
          <G key={k}>
            <Rect
              x={x - bandW / 2}
              y={y - (color ? 3 : 2.5)}
              width={bandW}
              height={color ? 6 : 5}
              rx={2}
              fill={color ?? c.gelBand}
              fillOpacity={ladder ? 0.7 : 0.95}
            />
            {odd ? (
              <G>
                <Rect
                  x={x - bandW / 2 - 4}
                  y={y - 8}
                  width={bandW + 8}
                  height={16}
                  rx={5}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  strokeDasharray={chart.dashFine}
                />
                <ChartText
                  x={x + bandW / 2 + 6}
                  y={y + 5}
                  fontSize={chart.value}
                  fontWeight="800"
                  fill={c.chartHighlight}
                >
                  ?
                </ChartText>
              </G>
            ) : null}
            {ladder ? (
              <ChartText
                x={ladderX}
                y={y + 4}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="end"
              >
                {formatNumber(bp)}
              </ChartText>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}
