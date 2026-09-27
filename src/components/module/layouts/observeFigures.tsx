/**
 * Observe-page figures (like ShadowStick): a picture of the column tapped last, drawn to scale
 * from its value, above the chart. A thermometer, a plant beside a ruler, a ramp and a sliding
 * cup, a flashlight and its lit circle, and an open cup of water.
 */
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { Torch } from '../reps/Flashlights';
import { scaleTicks } from './figureMath';
import { Canvas, ChartText, fitLabel } from '../reps/common';
import {
  Ball,
  Deepen,
  FloorShadow,
  Glass,
  LitRect,
  Sheen,
  TopLight,
  url,
  usePaintIds,
} from '../reps/paint';

/** A measuring scale's marks from 0 to max along a vertical line, labels to one side. */
function VScale({
  x,
  y0,
  px,
  max,
  side,
  unit,
}: {
  x: number;
  y0: number;
  px: number;
  max: number;
  side: 'left' | 'right';
  unit?: string;
}) {
  const c = usePalette();
  const { label, mark } = scaleTicks(max, px);
  const dir = side === 'left' ? -1 : 1;
  return (
    <G>
      {Array.from({ length: Math.floor(max / mark) + 1 }, (_, i) => {
        const v = i * mark;
        const y = y0 - v * px;
        const big = v % label === 0;
        return (
          <G key={i}>
            <Line
              x1={x}
              y1={y}
              x2={x + dir * (big ? 8 : 4)}
              y2={y}
              stroke={c.chartInk}
              strokeWidth={big ? 1.2 : 0.8}
            />
            {big ? (
              <ChartText
                x={x + dir * 11}
                y={y + 4}
                fontSize={chart.tiny}
                textAnchor={side === 'left' ? 'end' : 'start'}
              >
                {v === max && unit ? `${v} ${unit}` : String(v)}
              </ChartText>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

interface Common {
  value: number;
  max: number;
  unit: string;
  column: string;
}

/** One thermometer from 0 to `max`, filled to the tapped column's temperature. */
export function ThermometerFigure({ value, max, unit, column }: Common) {
  const c = usePalette();
  const ids = usePaintIds('glass', 'bulb', 'liquid');
  return (
    <Canvas aspect={0.62}>
      {({ w, h }) => {
        const x = Math.round(w * 0.42);
        const top = 20;
        const bulbY = h - 26;
        const zero = bulbY - 22;
        const px = (zero - top - 6) / Math.max(max, 1);
        const level = zero - Math.min(value, max) * px;
        const reading = `${value} ${unit}`;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Glass id={ids.glass} />
              <Ball id={ids.bulb} color={c.mercury} />
              <Sheen id={ids.liquid} />
            </Defs>
            {/* The glass tube and bulb, the red liquid up to the reading. */}
            <Rect
              x={x - 9}
              y={top - 8}
              width={18}
              height={bulbY - top}
              rx={9}
              fill={url(ids.glass)}
              stroke={c.glassEdge}
              strokeWidth={1.5}
            />
            <Rect x={x - 3.5} y={level} width={7} height={bulbY - level} fill={c.mercury} />
            <Rect x={x - 3.5} y={level} width={7} height={bulbY - level} fill={url(ids.liquid)} />
            <Circle
              cx={x}
              cy={bulbY}
              r={15}
              fill={url(ids.bulb)}
              stroke={c.glassEdge}
              strokeWidth={1.5}
            />
            <VScale x={x - 12} y0={zero} px={px} max={max} side="left" />
            {/* The reading: a pointer from the liquid's top. */}
            <Line
              x1={x + 12}
              y1={level}
              x2={x + 40}
              y2={level}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <ChartText x={x + 46} y={level + 5} fontSize={chart.emphasis} fontWeight="700">
              {reading}
            </ChartText>
            <ChartText x={w - 6} y={16} fontSize={chart.label} fontWeight="700" textAnchor="end">
              {column}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** A plant in a pot beside a centimeter ruler from the soil, as tall as the tapped week's height. */
export function PlantHeightFigure({ value, max, unit, column }: Common) {
  const c = usePalette();
  const ids = usePaintIds('wood', 'light', 'leaf');
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        const soil = h - 44;
        const top = 18;
        const px = (soil - top) / Math.max(max, 1);
        const x = Math.round(w * 0.38);
        const rx = x + 58;
        const tipY = soil - Math.min(value, max) * px;
        const height = soil - tipY;
        // Leaf pairs up the stem, one every 22 px or so, the top one smallest.
        const pairs = Math.max(0, Math.floor((height - 8) / 22));
        const leaf = (y: number, dir: 1 | -1, size: number) =>
          `M ${x} ${y} C ${x + dir * size * 0.5} ${y - size * 0.55} ${x + dir * size * 1.1} ${y - size * 0.35} ${x + dir * size * 1.3} ${y - size * 0.1} C ${x + dir * size} ${y + size * 0.25} ${x + dir * size * 0.4} ${y + size * 0.2} ${x} ${y} Z`;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.wood} />
              <TopLight id={ids.light} />
              <Sheen id={ids.leaf} />
            </Defs>
            {/* The pot and its soil. */}
            <Path
              d={`M ${x - 30} ${soil - 4} H ${x + 30} L ${x + 24} ${h - 8} H ${x - 24} Z`}
              fill={c.rock4}
              stroke={c.soilDark}
              strokeWidth={1.5}
            />
            <Path
              d={`M ${x - 30} ${soil - 4} H ${x + 30} L ${x + 24} ${h - 8} H ${x - 24} Z`}
              fill={url(ids.light)}
            />
            <Rect
              x={x - 33}
              y={soil - 6}
              width={66}
              height={8}
              rx={2}
              fill={c.rock4}
              stroke={c.soilDark}
              strokeWidth={1.5}
            />
            <Rect x={x - 28} y={soil - 3} width={56} height={4} fill={c.soil} />
            <FloorShadow cx={x} cy={h - 7} rx={30} ry={3} />
            {/* The plant: a stem up to the measured height, leaves in pairs. */}
            {height > 0 ? (
              <>
                <Line
                  x1={x}
                  y1={soil}
                  x2={x}
                  y2={tipY}
                  stroke={c.lifeDeep}
                  strokeWidth={3.2}
                  strokeLinecap="round"
                />
                {Array.from({ length: pairs }, (_, i) => {
                  const y = soil - 14 - i * 22;
                  const size = Math.max(9, 18 - i * 1.2);
                  return (
                    <G key={i}>
                      {[1, -1].map((dir) => (
                        <G key={dir}>
                          <Path
                            d={leaf(y - (dir > 0 ? 0 : 6), dir as 1 | -1, size)}
                            fill={c.life}
                            stroke={c.lifeDeep}
                            strokeWidth={1}
                          />
                        </G>
                      ))}
                    </G>
                  );
                })}
                <Path d={leaf(tipY + 1, 1, 6)} fill={c.life} stroke={c.lifeDeep} strokeWidth={1} />
                <Path d={leaf(tipY + 1, -1, 6)} fill={c.life} stroke={c.lifeDeep} strokeWidth={1} />
              </>
            ) : null}
            {/* The ruler, 0 at the soil. */}
            <Rect
              x={rx}
              y={top - 8}
              width={24}
              height={soil - top + 12}
              fill={c.wood}
              stroke={c.woodDark}
            />
            <Rect x={rx} y={top - 8} width={24} height={soil - top + 12} fill={url(ids.wood)} />
            <VScale x={rx} y0={soil} px={px} max={max} side="right" />
            {/* From the plant's top across to the ruler. */}
            <Line
              x1={x + 4}
              y1={tipY}
              x2={rx + 10}
              y2={tipY}
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
              strokeDasharray={chart.dashFine}
            />
            <ChartText x={rx + 30} y={tipY + 4} fontSize={chart.emphasis} fontWeight="700">
              {`${value} ${unit}`}
            </ChartText>
            <ChartText x={8} y={16} fontSize={chart.label} fontWeight="700">
              {column}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * A ramp raised to the release height, the marble at its top, and the cup at its foot slid
 * the recorded distance (its start dashed), both to one scale in centimeters.
 */
export function RampFigure({
  value,
  max,
  unit,
  height,
  heights,
}: Common & { height: number; heights: number[] }) {
  const c = usePalette();
  const ids = usePaintIds('wood', 'light', 'marble');
  const tallest = Math.max(...heights, 1);
  const board = tallest * 1.6;
  const run = (hgt: number) => Math.sqrt(Math.max(0, board * board - hgt * hgt));
  const longest = Math.max(...heights.map(run));
  const scaleAt = (w: number) => (w - 60) / (longest + max);
  return (
    // As tall as the highest ramp needs at this width's scale, with room for the labels.
    <Canvas aspect={(w) => (Math.min(scaleAt(w), 5) * tallest + 80) / w}>
      {({ w, h }) => {
        const floor = h - 40;
        const cupW = 20;
        const px = Math.min(scaleAt(w), 5);
        const foot = 16 + longest * px;
        const topX = foot - run(height) * px;
        const topY = floor - height * px;
        const cup0 = foot + 3;
        const cup1 = cup0 + value * px;
        const cupPath = (x: number) =>
          `M ${x} ${floor} L ${x + 3} ${floor - 22} H ${x + cupW - 3} L ${x + cupW} ${floor} Z`;
        const ang = Math.atan2(topY - floor, topX - foot);
        const marble = {
          x: topX + 9 * Math.cos(ang) + 7 * Math.sin(ang),
          y: topY + 9 * Math.sin(ang) - 7 * Math.cos(ang),
        };
        const dist = `${value} ${unit}`;
        const distLabel = fitLabel((cup0 + cup1) / 2 + cupW / 2, dist, chart.small, w);
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.wood} vertical />
              <TopLight id={ids.light} />
              <Ball id={ids.marble} color={c.blockBlue} />
            </Defs>
            <Line
              x1={0}
              y1={floor}
              x2={w}
              y2={floor}
              stroke={c.chartGrid}
              strokeWidth={chart.stroke}
            />
            {/* The blocks holding the ramp's top at the release height. */}
            <LitRect
              x={topX - 12}
              y={topY + 2}
              width={16}
              height={floor - topY - 2}
              fill={c.wood}
              stroke={c.woodDark}
              lightId={ids.light}
            />
            {/* The ramp: a board from the top down to the floor. */}
            <Path
              d={`M ${topX - 4} ${topY} L ${foot} ${floor} L ${foot} ${floor - 4} L ${topX - 4} ${topY - 4} Z`}
              fill={c.wood}
              stroke={c.woodDark}
              strokeWidth={1}
            />
            <Circle
              cx={marble.x}
              cy={marble.y}
              r={6}
              fill={url(ids.marble)}
              stroke={c.chartInk}
              strokeWidth={0.8}
            />
            {/* The release height, measured beside the blocks. */}
            <Line
              x1={topX - 20}
              y1={topY}
              x2={topX - 20}
              y2={floor}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Line x1={topX - 24} y1={topY} x2={topX - 16} y2={topY} stroke={c.chartInk} />
            <ChartText
              x={Math.max(4, topX - 26)}
              y={topY - 18}
              fontSize={chart.small}
              fontWeight="700"
              textAnchor={topX - 26 < 30 ? 'start' : 'middle'}
            >
              {`${height} cm high`}
            </ChartText>
            {/* The cup: where it stood (dashed) and where it stopped. */}
            <Path
              d={cupPath(cup0)}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={1.2}
              strokeDasharray={chart.dashFine}
            />
            <FloorShadow cx={cup1 + cupW / 2} cy={floor} rx={12} ry={2.5} />
            <Path d={cupPath(cup1)} fill={c.cupLight} stroke={c.chartInk} strokeWidth={1.2} />
            <Path d={cupPath(cup1)} fill={url(ids.light)} />
            {value > 0 ? (
              <>
                <Line
                  x1={cup0 + cupW / 2}
                  y1={floor + 14}
                  x2={cup1 + cupW / 2}
                  y2={floor + 14}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line
                  x1={cup0 + cupW / 2}
                  y1={floor + 9}
                  x2={cup0 + cupW / 2}
                  y2={floor + 19}
                  stroke={c.chartInk}
                />
                <Line
                  x1={cup1 + cupW / 2}
                  y1={floor + 9}
                  x2={cup1 + cupW / 2}
                  y2={floor + 19}
                  stroke={c.chartInk}
                />
              </>
            ) : null}
            <ChartText
              x={distLabel.x}
              y={floor + 32}
              fontSize={chart.small}
              fontWeight="700"
              textAnchor={distLabel.textAnchor}
            >
              {`slid ${dist}`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * A flashlight the tapped distance from a wall, seen from the side, its beam lighting a
 * stretch of the wall as wide as the value; beside it, the lit circle face on, measured.
 */
export function FlashlightFigure({
  value,
  max,
  unit,
  distance,
  distances,
}: Common & { distance: number; distances: number[] }) {
  const c = usePalette();
  const ids = usePaintIds('body');
  const far = Math.max(...distances, 1);
  return (
    <Canvas aspect={0.56}>
      {({ w, h }) => {
        const px = Math.min((w - 48 - 44 - 30) / (far + max), (h - 58) / Math.max(max, 1));
        const cy = 18 + (max * px) / 2;
        const wall = 44 + far * px + 6;
        const lens = wall - distance * px;
        const half = (Math.min(value, max) * px) / 2;
        const face = { x: wall + 22 + (max * px) / 2, y: cy };
        const size = `${value} ${unit}`;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Sheen id={ids.body} vertical />
            </Defs>
            {/* The beam from the lens to the wall. */}
            <Path
              d={`M ${lens} ${cy - 5} L ${wall} ${cy - half} L ${wall} ${cy + half} L ${lens} ${cy + 5} Z`}
              fill={c.sunDisk}
              opacity={0.4}
            />
            {/* The wall, edge on, lit where the beam lands. */}
            <Rect
              x={wall}
              y={10}
              width={8}
              height={max * px + 16}
              fill={c.paper}
              stroke={c.chartGrid}
            />
            <Line
              x1={wall}
              y1={cy - half}
              x2={wall}
              y2={cy + half}
              stroke={c.sunDisk}
              strokeWidth={4}
            />
            <Torch x={lens} y={cy} c={c} sheen={ids.body} />
            {/* The distance from the lens to the wall. */}
            <Line
              x1={lens}
              y1={h - 30}
              x2={wall}
              y2={h - 30}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Line x1={lens} y1={h - 35} x2={lens} y2={h - 25} stroke={c.chartInk} />
            <Line x1={wall} y1={h - 35} x2={wall} y2={h - 25} stroke={c.chartInk} />
            <ChartText
              {...fitLabel((lens + wall) / 2, `${distance} cm away`, chart.small, w)}
              y={h - 12}
              fontSize={chart.small}
              fontWeight="700"
            >
              {`${distance} cm away`}
            </ChartText>
            {/* The lit circle on the wall, face on, and its width. */}
            <Circle
              cx={face.x}
              cy={face.y}
              r={(max * px) / 2 + 6}
              fill={c.paper}
              stroke={c.chartGrid}
            />
            <Circle cx={face.x} cy={face.y} r={Math.max(1, half)} fill={c.sunDisk} opacity={0.85} />
            <Line
              x1={face.x - half}
              y1={h - 30}
              x2={face.x + half}
              y2={h - 30}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Line
              x1={face.x - half}
              y1={h - 35}
              x2={face.x - half}
              y2={h - 25}
              stroke={c.chartInk}
            />
            <Line
              x1={face.x + half}
              y1={h - 35}
              x2={face.x + half}
              y2={h - 25}
              stroke={c.chartInk}
            />
            <Line
              x1={face.x - half}
              y1={face.y}
              x2={face.x - half}
              y2={h - 35}
              stroke={c.chartMuted}
              strokeWidth={0.8}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={face.x + half}
              y1={face.y}
              x2={face.x + half}
              y2={h - 35}
              stroke={c.chartMuted}
              strokeWidth={0.8}
              strokeDasharray={chart.dashFine}
            />
            <ChartText
              {...fitLabel(face.x, `${size} across`, chart.small, w)}
              y={h - 12}
              fontSize={chart.small}
              fontWeight="700"
            >
              {`${size} across`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

/**
 * An open cup `max` tall with the water at the tapped column's level, a ruler beside it, and
 * a dashed line at the first column's level.
 */
export function CupFigure({
  value,
  max,
  unit,
  column,
  first,
  firstColumn,
}: Common & { first: number; firstColumn: string }) {
  const c = usePalette();
  const ids = usePaintIds('glass', 'water');
  return (
    <Canvas aspect={0.62}>
      {({ w, h }) => {
        const bottom = h - 16;
        const top = 22;
        const px = (bottom - top) / Math.max(max, 1);
        const x = Math.round(w * 0.36);
        const cw = 96;
        const level = bottom - Math.min(value, max) * px;
        const mark = bottom - Math.min(first, max) * px;
        const same = value === first;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Glass id={ids.glass} />
              <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
            </Defs>
            <FloorShadow cx={x + cw / 2} cy={bottom + 2} rx={cw / 2 + 6} ry={3} />
            {/* The water, then the clear cup over it. */}
            {value > 0 ? (
              <>
                <Rect
                  x={x + 2}
                  y={level}
                  width={cw - 4}
                  height={bottom - level}
                  fill={url(ids.water)}
                  opacity={0.9}
                />
                <Rect x={x + 2} y={level} width={cw - 4} height={3} fill={c.waterTop} />
              </>
            ) : null}
            <Rect
              x={x}
              y={top}
              width={cw}
              height={bottom - top}
              fill={url(ids.glass)}
              opacity={0.5}
            />
            <Path
              d={`M ${x} ${top} V ${bottom} H ${x + cw} V ${top}`}
              fill="none"
              stroke={c.glassEdge}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <VScale x={x - 6} y0={bottom} px={px} max={max} side="left" unit={unit} />
            {/* The first day's level, dashed. */}
            {same ? null : (
              <>
                <Line
                  x1={x - 4}
                  y1={mark}
                  x2={x + cw + 14}
                  y2={mark}
                  stroke={c.chartMuted}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                />
                <ChartText
                  x={x + cw + 18}
                  y={mark + (mark < level ? -2 : 12)}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  {`${firstColumn}: ${first} ${unit}`}
                </ChartText>
              </>
            )}
            <Line
              x1={x + cw - 2}
              y1={level}
              x2={x + cw + 14}
              y2={level}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <ChartText
              x={x + cw + 18}
              y={level + (same || mark < level ? 14 : -4)}
              fontSize={chart.emphasis}
              fontWeight="700"
            >
              {`${column}: ${value} ${unit}`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
