import { G, Line, Path, Rect } from 'react-native-svg';

import type { MohsScene } from '@/data/modules/typesHsl';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { Board } from './earthKit';
import { MOHS, MOHS_TOOLS } from './earthMath';

const ROW = 26;
const TOP = 34;
const H = TOP + ROW * 10 + 6;
/** Where the bars start and how long the longest is (rank bars, absolute bars). */
const BAR_X = 146;
const RANK_W = 110;
const ABS_W = 196;

/** Middle of a hardness's row; between rows for 2.5 and the like (10 at the top). */
const yOf = (h: number) => TOP + (10 - h) * ROW + ROW / 2;

/**
 * The Mohs hardness scale as a ladder, hardest at the top: each mineral's rank, a small faceted
 * gem in its usual color, its name and a bar. The scratch tests (fingernail 2.5, copper coin 3.5,
 * glass 5.5, steel file 6.5) are dashed lines across at their hardness. A scene lights one
 * mineral, shades an unknown's range between two hardnesses, or turns the bars to absolute
 * hardness, where diamond's bar is 15 times quartz's though its rank is only 3 more.
 */
export function MohsFigure({ mohs }: { mohs: MohsScene }) {
  const c = usePalette();
  const gem = [
    c.mineralTalc,
    c.mineralHalite,
    c.mineralCalcite,
    c.mineralFluorite,
    c.mineralApatite,
    c.mineralFeldspar,
    c.mineralQuartz,
    c.mineralTopaz,
    c.mineralCorundum,
    c.mineralQuartz,
  ];
  const abs = !!mohs.absolute;
  const range = mohs.between ? [...mohs.between].sort((a, b) => a - b) : undefined;
  return (
    <Board height={H}>
      <ChartText x={16} y={20} fontSize={chart.label} fontWeight="700" textAnchor="middle">
        Rank
      </ChartText>
      <ChartText x={58} y={20} fontSize={chart.label} fontWeight="700">
        Mineral
      </ChartText>
      <ChartText x={BAR_X} y={20} fontSize={chart.label} fontWeight="700">
        {abs ? 'Absolute hardness' : 'Hardness'}
      </ChartText>
      {range ? (
        <G>
          <Rect
            x={4}
            y={yOf(range[1]!)}
            width={258}
            height={yOf(range[0]!) - yOf(range[1]!)}
            fill={c.chartHighlight}
            opacity={0.14}
          />
          <Path
            d={`M 262 ${yOf(range[1]!)} H 4 M 262 ${yOf(range[0]!)} H 4`}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
        </G>
      ) : null}
      {MOHS.map((m, i) => {
        const y = yOf(m.rank);
        const lit = mohs.lit === m.rank;
        const len = abs ? Math.max(1.5, (m.absolute / 1500) * ABS_W) : (m.rank / 10) * RANK_W;
        const g = 7;
        return (
          <G key={m.name}>
            {lit ? (
              <Rect
                x={2}
                y={y - ROW / 2 + 1}
                width={356}
                height={ROW - 2}
                rx={6}
                fill={c.chartHighlight}
                opacity={0.18}
              />
            ) : null}
            <ChartText
              x={16}
              y={y + 4.5}
              fontSize={chart.value}
              fontWeight="700"
              textAnchor="middle"
            >
              {m.rank}
            </ChartText>
            {/* A faceted gem: crown and pavilion, lit on the left. */}
            <Path
              d={`M ${40 - g} ${y - 2} L ${40 - g / 2} ${y - g + 1} L ${40 + g / 2} ${y - g + 1} L ${40 + g} ${y - 2} L 40 ${y + g} Z`}
              fill={gem[i]}
              stroke={c.chartInk}
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
            <Path
              d={`M ${40 - g} ${y - 2} H ${40 + g} M ${40 - g / 2} ${y - 2} L 40 ${y + g} L ${40 + g / 2} ${y - 2}`}
              stroke={c.chartInk}
              strokeWidth={0.5}
              opacity={0.6}
              fill="none"
            />
            <Path
              d={`M ${40 - g} ${y - 2} L ${40 - g / 2} ${y - g + 1} L ${40 - g / 4} ${y - 2} Z`}
              fill={c.shine}
              opacity={0.6}
            />
            <ChartText x={58} y={y + 4.5} fontSize={chart.value} fontWeight={lit ? '700' : '500'}>
              {m.name}
            </ChartText>
            <Rect
              x={BAR_X}
              y={y - 6}
              width={len}
              height={12}
              rx={2}
              fill={lit ? c.chartHighlight : c.chartFill}
              stroke={lit ? c.chartHighlight : c.chartGrid}
            />
            {abs ? (
              <ChartText x={BAR_X + len + 5} y={y + 4.5} fontSize={chart.label} fill={c.chartMuted}>
                {m.absolute.toLocaleString('en-US')}
              </ChartText>
            ) : null}
          </G>
        );
      })}
      {abs
        ? null
        : MOHS_TOOLS.map((t) => {
            const y = yOf(t.hardness);
            return (
              <G key={t.name}>
                <Line
                  x1={BAR_X - 4}
                  y1={y}
                  x2={264}
                  y2={y}
                  stroke={c.chartInk}
                  strokeWidth={1}
                  strokeDasharray={chart.dashFine}
                />
                <ChartText x={268} y={y + 4} fontSize={chart.label} fill={c.chartInk}>
                  {`${t.name} ${t.hardness}`}
                </ChartText>
              </G>
            );
          })}
    </Board>
  );
}
