import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Arrow } from './figures';

/**
 * Explore figures for Grade 6 science (docs/MODULE_GUIDE.md, "Module layouts"): a cell, the
 * body's systems, the water cycle, weather fronts, plate boundaries, the continents over time
 * and the rock cycle. Each draws one scene; the scene's lines say what to notice. Shapes are
 * drawn in the text color with the scene's part in the highlight, so nothing depends on color.
 */

/** A label with a leader line from (x, y) to the text at (tx, ty). */
function Tag({
  x,
  y,
  tx,
  ty,
  text,
  on,
  c,
  anchor = 'start',
}: {
  x: number;
  y: number;
  tx: number;
  ty: number;
  text: string;
  on: boolean;
  c: Palette;
  anchor?: 'start' | 'end' | 'middle';
}) {
  return (
    <G>
      <Line
        x1={x}
        y1={y}
        x2={tx + (anchor === 'end' ? 4 : anchor === 'start' ? -4 : 0)}
        y2={ty - 4}
        stroke={on ? c.chartHighlight : c.chartMuted}
        strokeWidth={on ? chart.stroke : 1}
      />
      <ChartText
        x={tx}
        y={ty}
        fontSize={chart.small}
        fontWeight={on ? '700' : '400'}
        fill={on ? c.chartHighlight : c.chartInk}
        textAnchor={anchor}
      >
        {text}
      </ChartText>
    </G>
  );
}

// ── The cell ──

export function CellFigure6({ cell, c }: { cell: NonNullable<Scene['cell']>; c: Palette }) {
  const on = (part: string) => cell.part === part;
  const ink = (part: string) => (on(part) ? c.chartHighlight : c.chartInk);
  const width = (part: string) => (on(part) ? chart.strokeHeavy : chart.strokeLight);
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        const cw = w * 0.56;
        const ch = h * 0.72;
        const x0 = 14;
        const y0 = (h - ch) / 2;
        const cx = x0 + cw / 2;
        const cy = y0 + ch / 2;
        const lx = x0 + cw + 18;
        const parts: ReactNode[] = [];
        const tags: ReactNode[] = [];
        const tag = (part: string, text: string, x: number, y: number, row: number) =>
          tags.push(
            <Tag
              key={part}
              x={x}
              y={y}
              tx={lx}
              ty={y0 + 10 + row * (ch / 6.5)}
              text={text}
              on={on(part)}
              c={c}
            />,
          );
        const mito = (x: number, y: number, k: string) => (
          <G key={k}>
            <Ellipse
              cx={x}
              cy={y}
              rx={12}
              ry={6}
              fill={c.chartSurface}
              stroke={ink('mitochondria')}
              strokeWidth={width('mitochondria')}
            />
            <Path
              d={`M ${x - 8} ${y} l 3 -3 l 3 5 l 3 -5 l 3 5 l 3 -3`}
              stroke={ink('mitochondria')}
              strokeWidth={1}
              fill="none"
            />
          </G>
        );
        if (cell.type === 'bacterium') {
          const bw = cw * 0.8;
          const bh = ch * 0.4;
          const bx = x0 + (cw - bw) / 2;
          const by = cy - bh / 2;
          parts.push(
            <Rect
              key="wall"
              x={bx - 6}
              y={by - 6}
              width={bw + 12}
              height={bh + 12}
              rx={(bh + 12) / 2}
              fill="none"
              stroke={ink('wall')}
              strokeWidth={on('wall') ? chart.strokeHeavy : chart.stroke * 1.5}
            />,
            <Rect
              key="membrane"
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx={bh / 2}
              fill={on('cytoplasm') ? c.chartHighlight : c.chartFill}
              fillOpacity={on('cytoplasm') ? 0.25 : 1}
              stroke={ink('membrane')}
              strokeWidth={width('membrane')}
            />,
            <Path
              key="dna"
              d={`M ${cx - bw * 0.25} ${cy} q 10 -14 20 0 t 20 0 t 20 0 t 20 0`}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />,
          );
          tag('wall', 'cell wall', bx + bw * 0.8, by - 6, 0);
          tag('membrane', 'cell membrane', bx + bw * 0.9, by + bh * 0.3, 1);
          tag('cytoplasm', 'cytoplasm', bx + bw * 0.75, by + bh * 0.75, 3);
          tag('dna', 'DNA, loose: no nucleus', cx + 10, cy - 4, 4);
        } else {
          const plant = cell.type === 'plant';
          parts.push(
            plant ? (
              <Rect
                key="wall"
                x={x0}
                y={y0}
                width={cw}
                height={ch}
                rx={4}
                fill="none"
                stroke={ink('wall')}
                strokeWidth={on('wall') ? chart.strokeHeavy * 1.5 : chart.stroke * 2}
              />
            ) : null,
            plant ? (
              <Rect
                key="membrane"
                x={x0 + 7}
                y={y0 + 7}
                width={cw - 14}
                height={ch - 14}
                rx={4}
                fill={on('cytoplasm') ? c.chartHighlight : c.chartFill}
                fillOpacity={on('cytoplasm') ? 0.25 : 1}
                stroke={ink('membrane')}
                strokeWidth={width('membrane')}
              />
            ) : (
              <Ellipse
                key="membrane"
                cx={cx}
                cy={cy}
                rx={cw / 2 - 4}
                ry={ch / 2 - 4}
                fill={on('cytoplasm') ? c.chartHighlight : c.chartFill}
                fillOpacity={on('cytoplasm') ? 0.25 : 1}
                stroke={ink('membrane')}
                strokeWidth={width('membrane')}
              />
            ),
            plant ? (
              <Rect
                key="vacuole"
                x={cx - cw * 0.22}
                y={y0 + ch * 0.2}
                width={cw * 0.42}
                height={ch * 0.55}
                rx={14}
                fill={c.chartSurface}
                stroke={ink('vacuole')}
                strokeWidth={width('vacuole')}
              />
            ) : null,
            <Circle
              key="nucleus"
              cx={plant ? x0 + cw * 0.8 : cx - cw * 0.08}
              cy={plant ? y0 + ch * 0.28 : cy - ch * 0.05}
              r={Math.min(cw, ch) * 0.11}
              fill={on('nucleus') ? c.chartHighlight : c.chartInk}
              fillOpacity={on('nucleus') ? 0.5 : 0.25}
              stroke={ink('nucleus')}
              strokeWidth={width('nucleus')}
            />,
            mito(
              plant ? x0 + cw * 0.18 : cx + cw * 0.2,
              plant ? y0 + ch * 0.8 : cy + ch * 0.2,
              'm1',
            ),
            mito(
              plant ? x0 + cw * 0.82 : cx - cw * 0.25,
              plant ? y0 + ch * 0.8 : cy + ch * 0.25,
              'm2',
            ),
          );
          if (plant) {
            for (const [fx, fy] of [
              [0.14, 0.25],
              [0.14, 0.5],
              [0.84, 0.55],
              [0.5, 0.88],
            ] as const) {
              parts.push(
                <G key={`ch${fx}${fy}`}>
                  <Ellipse
                    cx={x0 + cw * fx}
                    cy={y0 + ch * fy}
                    rx={10}
                    ry={6}
                    fill={on('chloroplasts') ? c.chartHighlight : c.chartSurface}
                    fillOpacity={on('chloroplasts') ? 0.45 : 1}
                    stroke={ink('chloroplasts')}
                    strokeWidth={width('chloroplasts')}
                  />
                  {/* Stacked lines inside, so a chloroplast is known by its pattern. */}
                  <Line
                    x1={x0 + cw * fx - 5}
                    y1={y0 + ch * fy - 1.5}
                    x2={x0 + cw * fx + 5}
                    y2={y0 + ch * fy - 1.5}
                    stroke={ink('chloroplasts')}
                    strokeWidth={1}
                  />
                  <Line
                    x1={x0 + cw * fx - 5}
                    y1={y0 + ch * fy + 1.5}
                    x2={x0 + cw * fx + 5}
                    y2={y0 + ch * fy + 1.5}
                    stroke={ink('chloroplasts')}
                    strokeWidth={1}
                  />
                </G>,
              );
            }
          }
          if (plant) tag('wall', 'cell wall', x0 + cw, y0 + ch * 0.1, 0);
          tag('membrane', 'cell membrane', plant ? x0 + cw - 7 : cx + cw * 0.45, y0 + ch * 0.25, 1);
          tag(
            'nucleus',
            'nucleus',
            plant ? x0 + cw * 0.86 : cx,
            plant ? y0 + ch * 0.28 : cy - ch * 0.05,
            2,
          );
          tag('cytoplasm', 'cytoplasm', plant ? x0 + cw * 0.7 : cx + cw * 0.3, cy, 3);
          tag(
            'mitochondria',
            'mitochondria',
            plant ? x0 + cw * 0.86 : cx + cw * 0.28,
            plant ? y0 + ch * 0.8 : cy + ch * 0.2,
            4,
          );
          if (plant) {
            tag('vacuole', 'vacuole', cx + cw * 0.2, y0 + ch * 0.5, 5);
            tag('chloroplasts', 'chloroplasts', x0 + cw * 0.9, y0 + ch * 0.55, 6);
          }
        }
        return (
          <Svg width={w} height={h}>
            {parts}
            {tags}
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── Body systems ──

const SYSTEM_NAMES: Record<string, string> = {
  circulatory: 'circulatory',
  respiratory: 'respiratory',
  digestive: 'digestive',
  nervous: 'nervous',
  muscular: 'muscles',
  skeletal: 'bones',
  excretory: 'excretory',
};

export function BodyFigure({ body, c }: { body: NonNullable<Scene['body']>; c: Palette }) {
  const lit = (s: string) => body.systems.includes(s as never);
  const stroke = (s: string) => (lit(s) ? c.chartHighlight : c.chartMuted);
  const op = (s: string) => (lit(s) ? 1 : 0.25);
  return (
    <Canvas aspect={0.9}>
      {({ w, h }) => {
        const cx = w * 0.4;
        const u = Math.min(w * 0.8, h) / 100;
        const X = (x: number) => cx + x * u;
        const Y = (y: number) => 6 + y * u;
        const heart = `M ${X(4)} ${Y(30)} c ${-3 * u} ${-4 * u} ${-8 * u} 0 ${-3 * u} ${5 * u} l ${3 * u} ${3 * u} l ${3 * u} ${-3 * u} c ${5 * u} ${-5 * u} 0 ${-9 * u} ${-3 * u} ${-5 * u} z`;
        const listed = Object.keys(SYSTEM_NAMES).filter(lit);
        return (
          <Svg width={w} height={h}>
            {/* The body outline. */}
            <Circle
              cx={X(0)}
              cy={Y(9)}
              r={8 * u}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Path
              d={`M ${X(-12)} ${Y(19)} L ${X(12)} ${Y(19)} L ${X(10)} ${Y(55)} L ${X(-10)} ${Y(55)} Z`}
              fill="none"
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Path
              d={`M ${X(-12)} ${Y(20)} L ${X(-20)} ${Y(50)} M ${X(12)} ${Y(20)} L ${X(20)} ${Y(50)} M ${X(-6)} ${Y(55)} L ${X(-8)} ${Y(92)} M ${X(6)} ${Y(55)} L ${X(8)} ${Y(92)}`}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
              fill="none"
            />
            {/* Bones: a spine and long bones, drawn thin. */}
            <G opacity={op('skeletal')}>
              <Path
                d={`M ${X(0)} ${Y(17)} L ${X(0)} ${Y(55)} M ${X(-6)} ${Y(58)} L ${X(-7.5)} ${Y(90)} M ${X(6)} ${Y(58)} L ${X(7.5)} ${Y(90)} M ${X(-13)} ${Y(22)} L ${X(-19)} ${Y(48)} M ${X(13)} ${Y(22)} L ${X(19)} ${Y(48)}`}
                stroke={stroke('skeletal')}
                strokeWidth={lit('skeletal') ? 3 : 2}
                strokeDasharray="6 2"
                fill="none"
              />
            </G>
            {/* Muscles: thick bands on the upper arm and thigh. */}
            <G opacity={op('muscular')}>
              <Path
                d={`M ${X(-14)} ${Y(24)} L ${X(-17)} ${Y(36)} M ${X(14)} ${Y(24)} L ${X(17)} ${Y(36)} M ${X(-7)} ${Y(60)} L ${X(-7.5)} ${Y(74)} M ${X(7)} ${Y(60)} L ${X(7.5)} ${Y(74)}`}
                stroke={stroke('muscular')}
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            </G>
            {/* Nervous: brain, spinal cord and nerves to the limbs. */}
            <G opacity={op('nervous')}>
              <Ellipse
                cx={X(0)}
                cy={Y(7)}
                rx={5 * u}
                ry={4 * u}
                fill={lit('nervous') ? c.chartHighlight : 'none'}
                fillOpacity={0.3}
                stroke={stroke('nervous')}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${X(1.5)} ${Y(12)} L ${X(1.5)} ${Y(52)} M ${X(1.5)} ${Y(24)} L ${X(18)} ${Y(46)} M ${X(1.5)} ${Y(24)} L ${X(-18)} ${Y(46)} M ${X(1.5)} ${Y(52)} L ${X(7)} ${Y(88)} M ${X(1.5)} ${Y(52)} L ${X(-7)} ${Y(88)}`}
                stroke={stroke('nervous')}
                strokeWidth={1.25}
                fill="none"
              />
            </G>
            {/* Respiratory: windpipe and two lungs. */}
            <G opacity={op('respiratory')}>
              <Line
                x1={X(0)}
                y1={Y(16)}
                x2={X(0)}
                y2={Y(24)}
                stroke={stroke('respiratory')}
                strokeWidth={2}
              />
              <Ellipse
                cx={X(-5.5)}
                cy={Y(31)}
                rx={4.5 * u}
                ry={7 * u}
                fill={lit('respiratory') ? c.chartHighlight : 'none'}
                fillOpacity={0.2}
                stroke={stroke('respiratory')}
                strokeWidth={chart.stroke}
              />
              <Ellipse
                cx={X(5.5)}
                cy={Y(31)}
                rx={4.5 * u}
                ry={7 * u}
                fill={lit('respiratory') ? c.chartHighlight : 'none'}
                fillOpacity={0.2}
                stroke={stroke('respiratory')}
                strokeWidth={chart.stroke}
              />
            </G>
            {/* Circulatory: the heart and a loop of vessels. */}
            <G opacity={op('circulatory')}>
              <Path
                d={heart}
                fill={lit('circulatory') ? c.chartHighlight : 'none'}
                fillOpacity={0.5}
                stroke={stroke('circulatory')}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${X(2)} ${Y(28)} C ${X(22)} ${Y(30)} ${X(22)} ${Y(70)} ${X(6)} ${Y(86)} M ${X(0)} ${Y(30)} C ${X(-20)} ${Y(32)} ${X(-22)} ${Y(70)} ${X(-6)} ${Y(86)}`}
                stroke={stroke('circulatory')}
                strokeWidth={1.25}
                strokeDasharray="4 2"
                fill="none"
              />
            </G>
            {/* Digestive: stomach and a coil of intestine. */}
            <G opacity={op('digestive')}>
              <Path
                d={`M ${X(-2)} ${Y(37)} q ${8 * u} ${-2 * u} ${6 * u} ${6 * u} q ${-3 * u} ${4 * u} ${-9 * u} ${1 * u}`}
                fill={lit('digestive') ? c.chartHighlight : 'none'}
                fillOpacity={0.3}
                stroke={stroke('digestive')}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${X(-6)} ${Y(46)} q ${4 * u} ${-2 * u} ${8 * u} 0 q ${3 * u} ${2 * u} 0 ${3 * u} q ${-5 * u} ${1 * u} ${-8 * u} 0 q ${-2 * u} ${2 * u} ${2 * u} ${3 * u} q ${4 * u} ${1 * u} ${7 * u} 0`}
                stroke={stroke('digestive')}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
            </G>
            {/* Excretory: two kidneys low in the back. */}
            <G opacity={op('excretory')}>
              <Ellipse
                cx={X(-6)}
                cy={Y(41)}
                rx={2 * u}
                ry={3 * u}
                fill={lit('excretory') ? c.chartHighlight : 'none'}
                fillOpacity={0.5}
                stroke={stroke('excretory')}
                strokeWidth={chart.stroke}
              />
              <Ellipse
                cx={X(6)}
                cy={Y(41)}
                rx={2 * u}
                ry={3 * u}
                fill={lit('excretory') ? c.chartHighlight : 'none'}
                fillOpacity={0.5}
                stroke={stroke('excretory')}
                strokeWidth={chart.stroke}
              />
            </G>
            {listed.map((s, i) => (
              <ChartText
                key={s}
                x={w - 10}
                y={20 + i * 18}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="end"
              >
                {SYSTEM_NAMES[s]!}
              </ChartText>
            ))}
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── The water cycle ──

export function WaterCycleFigure({ water, c }: { water: NonNullable<Scene['water']>; c: Palette }) {
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        const ground = h * 0.66;
        const sea = w * 0.34;
        const cloud = { x: w * 0.5, y: h * 0.16 };
        const peak = { x: w * 0.82, y: h * 0.3 };
        const on = (p: string) => water.process === p;
        const arrow = (
          p: string,
          x1: number,
          y1: number,
          x2: number,
          y2: number,
          label: string,
        ) => (
          <G key={p} opacity={on(p) ? 1 : 0.3}>
            <Arrow
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              c={c}
              heavy={on(p)}
              color={on(p) ? c.chartHighlight : c.chartMuted}
              dashed={!on(p)}
            />
            {on(p) ? (
              <ChartText
                x={(x1 + x2) / 2 + 6}
                y={(y1 + y2) / 2}
                fontSize={chart.label}
                fontWeight="700"
                fill={c.chartHighlight}
              >
                {label}
              </ChartText>
            ) : null}
          </G>
        );
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={ground} fill={c.chartDay} />
            {/* Sun, cloud, ocean, mountain with snow, tree, soil and groundwater. */}
            <Circle
              cx={w * 0.1}
              cy={h * 0.12}
              r={16}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
            <Path
              d={`M ${cloud.x - 40} ${cloud.y + 10} q 0 -18 18 -16 q 8 -16 26 -8 q 20 -6 22 12 q 14 2 10 12 z`}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Rect
              x={0}
              y={ground}
              width={sea}
              height={h - ground}
              fill={c.chartHighlight}
              fillOpacity={0.25}
            />
            <Rect x={sea} y={ground} width={w - sea} height={h - ground} fill={c.chartFill} />
            <Rect
              x={sea}
              y={h - (h - ground) * 0.35}
              width={w - sea}
              height={(h - ground) * 0.35}
              fill={c.chartHighlight}
              fillOpacity={0.12}
            />
            <ChartText
              x={w - 6}
              y={h - 6}
              fontSize={chart.tiny}
              fill={c.chartMuted}
              textAnchor="end"
            >
              groundwater
            </ChartText>
            <ChartText x={6} y={h - 6} fontSize={chart.tiny} fill={c.chartMuted}>
              ocean
            </ChartText>
            <Path
              d={`M ${w * 0.6} ${ground} L ${peak.x} ${peak.y} L ${w} ${ground} Z`}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            <Path
              d={`M ${peak.x - 16} ${peak.y + 20} L ${peak.x} ${peak.y} L ${peak.x + 16} ${peak.y + 20} Z`}
              fill={c.chartSurface}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <Path
              d={`M ${w * 0.66} ${ground} Q ${w * 0.5} ${ground - 4} ${sea} ${ground}`}
              stroke={c.chartHighlight}
              strokeWidth={3}
              fill="none"
            />
            <Line
              x1={w * 0.46}
              y1={ground}
              x2={w * 0.46}
              y2={ground - 24}
              stroke={c.chartInk}
              strokeWidth={3}
            />
            <Circle
              cx={w * 0.46}
              cy={ground - 30}
              r={11}
              fill={c.chartFill}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
            {arrow('evaporation', sea * 0.5, ground - 6, cloud.x - 44, cloud.y + 18, 'evaporation')}
            {arrow(
              'transpiration',
              w * 0.46,
              ground - 44,
              cloud.x - 6,
              cloud.y + 24,
              'transpiration',
            )}
            {arrow(
              'condensation',
              cloud.x - 70,
              cloud.y + 30,
              cloud.x - 44,
              cloud.y + 12,
              'condensation',
            )}
            {arrow(
              'precipitation',
              cloud.x + 10,
              cloud.y + 22,
              cloud.x + 10,
              ground - 40,
              'precipitation',
            )}
            {arrow('runoff', w * 0.66, ground - 10, sea + 10, ground - 10, 'runoff')}
            {arrow(
              'infiltration',
              w * 0.56,
              ground + 6,
              w * 0.56,
              h - (h - ground) * 0.3,
              'infiltration',
            )}
            {arrow('melting', peak.x + 8, peak.y + 22, peak.x + 18, ground - 8, 'melting')}
            {water.driver ? (
              <G>
                <Rect x={w - 104} y={8} width={96} height={24} rx={12} fill={c.chartHighlight} />
                <ChartText
                  x={w - 56}
                  y={24}
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.onChartHighlight}
                  textAnchor="middle"
                >
                  {water.driver === 'sun' ? 'Driven by the sun' : 'Driven by gravity'}
                </ChartText>
              </G>
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── Weather fronts ──

export function FrontFigure({ front, c }: { front: NonNullable<Scene['front']>; c: Palette }) {
  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const ground = h - 24;
        if (front.air) {
          // One column of air over a high (sinking, clear) or a low (rising, clouds).
          const low = front.air === 'low';
          const cx = w / 2;
          return (
            <Svg width={w} height={h}>
              <Line
                x1={0}
                y1={ground}
                x2={w}
                y2={ground}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {[-50, 0, 50].map((dx) => (
                <Arrow
                  key={dx}
                  x1={cx + dx}
                  y1={low ? ground - 20 : 50}
                  x2={cx + dx}
                  y2={low ? 70 : ground - 20}
                  c={c}
                  color={c.chartHighlight}
                />
              ))}
              {low ? (
                <Path
                  d={`M ${cx - 80} 56 q 0 -26 26 -22 q 14 -22 40 -10 q 30 -10 34 16 q 22 4 14 22 z`}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              ) : (
                <Circle
                  cx={w - 40}
                  cy={36}
                  r={16}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
              )}
              <ChartText
                x={cx}
                y={ground + 18}
                fontSize={chart.emphasis}
                fontWeight="700"
                fill={c.chartInk}
                textAnchor="middle"
              >
                {low ? 'L  low pressure' : 'H  high pressure'}
              </ChartText>
            </Svg>
          );
        }
        // A side view: cold air (dense, low) meets warm air; the front is their boundary.
        const type = front.type ?? 'cold';
        const fx = w * 0.5;
        const boundary =
          type === 'cold'
            ? `M ${fx} ${ground} Q ${fx + 20} ${h * 0.45} ${fx + 70} ${h * 0.25}`
            : type === 'warm'
              ? `M ${fx - 120} ${ground} L ${fx + 110} ${h * 0.35}`
              : `M ${fx} ${ground} L ${fx + 6} ${h * 0.25}`;
        const cold =
          type === 'cold'
            ? `${boundary} L ${w} ${h * 0.25} L ${w} ${ground} Z`
            : type === 'warm'
              ? `${boundary} L ${w} ${h * 0.35} L ${w} ${ground} Z`
              : `${boundary} L ${w} ${h * 0.25} L ${w} ${ground} Z`;
        return (
          <Svg width={w} height={h}>
            <Rect
              x={0}
              y={0}
              width={w}
              height={ground}
              fill={c.chartHighlight}
              fillOpacity={0.12}
            />
            <Path d={cold} fill={c.chartFill} stroke={c.chartInk} strokeWidth={chart.stroke} />
            <ChartText
              x={w - 10}
              y={ground - 12}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="end"
              fill={c.chartInk}
            >
              cold, dense air
            </ChartText>
            <ChartText
              x={10}
              y={ground - 12}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartInk}
            >
              warm air
            </ChartText>
            {type === 'cold' ? (
              <G>
                <Arrow
                  x1={w - 30}
                  y1={ground - 40}
                  x2={fx + 40}
                  y2={ground - 40}
                  c={c}
                  color={c.chartInk}
                />
                <Arrow
                  x1={fx - 10}
                  y1={ground - 30}
                  x2={fx + 10}
                  y2={h * 0.3}
                  c={c}
                  color={c.chartHighlight}
                  heavy
                />
                <Path
                  d={`M ${fx - 40} ${h * 0.28} l 0 -${h * 0.18} q 30 -20 60 0 l 0 ${h * 0.18} z`}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
              </G>
            ) : type === 'warm' ? (
              <G>
                <Arrow
                  x1={20}
                  y1={ground - 36}
                  x2={fx + 60}
                  y2={h * 0.42}
                  c={c}
                  color={c.chartHighlight}
                  heavy
                />
                {[0, 1, 2].map((i) => (
                  <Rect
                    key={i}
                    x={fx - 40 + i * 50}
                    y={h * 0.14 + i * 10}
                    width={80}
                    height={10}
                    rx={5}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={1}
                  />
                ))}
              </G>
            ) : (
              <G>
                <Arrow
                  x1={fx - 60}
                  y1={ground - 50}
                  x2={fx - 20}
                  y2={ground - 50}
                  c={c}
                  color={c.chartInk}
                />
                <Arrow
                  x1={fx + 70}
                  y1={ground - 50}
                  x2={fx + 30}
                  y2={ground - 50}
                  c={c}
                  color={c.chartInk}
                />
                <Rect
                  x={fx - 60}
                  y={h * 0.12}
                  width={130}
                  height={16}
                  rx={8}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
              </G>
            )}
            <Line
              x1={0}
              y1={ground}
              x2={w}
              y2={ground}
              stroke={c.chartInk}
              strokeWidth={chart.stroke}
            />
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── Plate boundaries ──

export function PlatesFigure({ plates, c }: { plates: NonNullable<Scene['plates']>; c: Palette }) {
  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const top = h * 0.38;
        const crust = 18;
        const mid = w / 2;
        const out: ReactNode[] = [];
        const block = (x1: number, x2: number, k: string, thick = crust, y = top) => (
          <Rect
            key={k}
            x={x1}
            y={y}
            width={x2 - x1}
            height={thick}
            fill={c.chartFill}
            stroke={c.chartInk}
            strokeWidth={chart.strokeLight}
          />
        );
        // The mantle below.
        out.push(
          <Rect
            key="mantle"
            x={0}
            y={top + crust}
            width={w}
            height={h - top - crust}
            fill={c.chartHighlight}
            fillOpacity={0.1}
          />,
        );
        out.push(
          <ChartText key="mt" x={8} y={h - 8} fontSize={chart.tiny} fill={c.chartMuted}>
            mantle
          </ChartText>,
        );
        switch (plates.boundary) {
          case 'divergent':
          case 'rift': {
            const gap = plates.boundary === 'rift' ? 10 : 16;
            out.push(
              block(0, mid - gap, 'l', plates.boundary === 'rift' ? 30 : crust),
              block(mid + gap, w, 'r', plates.boundary === 'rift' ? 30 : crust),
            );
            if (plates.boundary === 'rift') {
              out.push(
                <Path
                  key="v"
                  d={`M ${mid - 40} ${top} L ${mid - gap} ${top + 16} L ${mid + gap} ${top + 16} L ${mid + 40} ${top}`}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />,
              );
            } else {
              out.push(
                <Path
                  key="ridge"
                  d={`M ${mid - 40} ${top} L ${mid} ${top - 16} L ${mid + 40} ${top}`}
                  fill={c.chartFill}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />,
              );
            }
            out.push(
              <Arrow
                key="ml"
                x1={mid - 30}
                y1={top - 30}
                x2={mid - 90}
                y2={top - 30}
                c={c}
                color={c.chartInk}
              />,
              <Arrow
                key="mr"
                x1={mid + 30}
                y1={top - 30}
                x2={mid + 90}
                y2={top - 30}
                c={c}
                color={c.chartInk}
              />,
              <Arrow
                key="up"
                x1={mid}
                y1={h - 20}
                x2={mid}
                y2={top + 20}
                c={c}
                color={c.chartHighlight}
                heavy
              />,
            );
            if (plates.ages) {
              [1, 2, 3].forEach((i) => {
                for (const side of [-1, 1]) {
                  out.push(
                    <Line
                      key={`a${i}${side}`}
                      x1={mid + side * (gap + i * 34)}
                      y1={top}
                      x2={mid + side * (gap + i * 34)}
                      y2={top + crust}
                      stroke={c.chartInk}
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />,
                  );
                }
              });
              out.push(
                <ChartText
                  key="old1"
                  x={mid - gap - 110}
                  y={top + crust + 14}
                  fontSize={chart.tiny}
                  fill={c.chartInk}
                  textAnchor="middle"
                >
                  older
                </ChartText>,
                <ChartText
                  key="old2"
                  x={mid + gap + 110}
                  y={top + crust + 14}
                  fontSize={chart.tiny}
                  fill={c.chartInk}
                  textAnchor="middle"
                >
                  older
                </ChartText>,
                <ChartText
                  key="new"
                  x={mid}
                  y={top + crust + 14}
                  fontSize={chart.tiny}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  textAnchor="middle"
                >
                  new
                </ChartText>,
              );
            }
            break;
          }
          case 'subduction':
            out.push(
              block(0, mid, 'ocean', crust * 0.7, top + 8),
              <Path
                key="dive"
                d={`M ${mid} ${top + 8} L ${mid + 90} ${h - 10} L ${mid + 70} ${h - 10} L ${mid - 6} ${top + 8 + crust * 0.7}`}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />,
              block(mid, w, 'land', 34, top - 10),
              <Path
                key="volc"
                d={`M ${mid + 60} ${top - 10} L ${mid + 85} ${top - 50} L ${mid + 110} ${top - 10} Z`}
                fill={c.chartSurface}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />,
              <Arrow
                key="rise"
                x1={mid + 80}
                y1={h - 30}
                x2={mid + 85}
                y2={top - 44}
                c={c}
                color={c.chartHighlight}
                dashed
              />,
              <Arrow
                key="push"
                x1={40}
                y1={top - 12}
                x2={mid - 40}
                y2={top - 12}
                c={c}
                color={c.chartInk}
              />,
              <ChartText key="o" x={20} y={top + crust + 8} fontSize={chart.tiny} fill={c.chartInk}>
                ocean plate
              </ChartText>,
              <ChartText
                key="c"
                x={w - 10}
                y={top + 36}
                fontSize={chart.tiny}
                fill={c.chartInk}
                textAnchor="end"
              >
                continent
              </ChartText>,
            );
            break;
          case 'collision':
            out.push(
              block(0, mid - 4, 'l', 32, top - 6),
              block(mid + 4, w, 'r', 32, top - 6),
              <Path
                key="mtn"
                d={`M ${mid - 70} ${top - 6} L ${mid - 30} ${top - 50} L ${mid} ${top - 70} L ${mid + 30} ${top - 46} L ${mid + 70} ${top - 6} Z`}
                fill={c.chartFill}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />,
              <Arrow
                key="l"
                x1={20}
                y1={top - 24}
                x2={mid - 80}
                y2={top - 24}
                c={c}
                color={c.chartInk}
              />,
              <Arrow
                key="r"
                x1={w - 20}
                y1={top - 24}
                x2={mid + 80}
                y2={top - 24}
                c={c}
                color={c.chartInk}
              />,
            );
            break;
          case 'transform':
            // A top view: two blocks sliding past, a fence broken where they meet.
            out.length = 0;
            out.push(
              <Rect
                key="a"
                x={20}
                y={20}
                width={w - 40}
                height={h / 2 - 24}
                fill={c.chartFill}
                stroke={c.chartInk}
              />,
              <Rect
                key="b"
                x={20}
                y={h / 2 + 4}
                width={w - 40}
                height={h / 2 - 24}
                fill={c.chartSurface}
                stroke={c.chartInk}
              />,
              <Line
                key="f1"
                x1={mid - 20}
                y1={30}
                x2={mid - 20}
                y2={h / 2 - 4}
                stroke={c.chartHighlight}
                strokeWidth={3}
              />,
              <Line
                key="f2"
                x1={mid + 20}
                y1={h / 2 + 4}
                x2={mid + 20}
                y2={h - 30}
                stroke={c.chartHighlight}
                strokeWidth={3}
              />,
              <Arrow
                key="ar"
                x1={mid - 90}
                y1={h / 4}
                x2={mid - 150}
                y2={h / 4}
                c={c}
                color={c.chartInk}
              />,
              <Arrow
                key="br"
                x1={mid + 90}
                y1={(3 * h) / 4}
                x2={mid + 150}
                y2={(3 * h) / 4}
                c={c}
                color={c.chartInk}
              />,
              <ChartText
                key="t"
                x={mid}
                y={h / 2 + 2}
                fontSize={chart.tiny}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                fault
              </ChartText>,
            );
            break;
        }
        if (plates.mantle && plates.boundary !== 'transform') {
          out.push(
            <Path
              key="loop1"
              d={`M ${mid - 10} ${h - 12} C ${mid - 60} ${h - 12} ${mid - 140} ${h - 20} ${mid - 140} ${top + crust + 30} C ${mid - 140} ${top + crust + 10} ${mid - 60} ${top + crust + 8} ${mid - 20} ${top + crust + 8}`}
              stroke={c.chartHighlight}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dash}
              fill="none"
            />,
            <Path
              key="loop2"
              d={`M ${mid + 10} ${h - 12} C ${mid + 60} ${h - 12} ${mid + 140} ${h - 20} ${mid + 140} ${top + crust + 30} C ${mid + 140} ${top + crust + 10} ${mid + 60} ${top + crust + 8} ${mid + 20} ${top + crust + 8}`}
              stroke={c.chartHighlight}
              strokeWidth={chart.strokeLight}
              strokeDasharray={chart.dash}
              fill="none"
            />,
          );
        }
        return (
          <Svg width={w} height={h}>
            {out}
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── Continents over time ──

/** Continent outlines in a 0–100 box (drawn in-house, simplified), and where each sits by age. */
const LANDS: Record<string, string> = {
  na: 'M 0 0 L 16 -2 L 22 6 L 16 16 L 10 24 L 4 18 L -2 8 Z',
  sa: 'M 4 0 L 12 2 L 14 10 L 10 22 L 6 26 L 4 16 L 0 6 Z',
  af: 'M 0 0 L 12 -2 L 18 6 L 16 16 L 10 24 L 6 16 L 0 8 Z',
  eu: 'M 0 0 L 30 -4 L 40 4 L 34 14 L 18 16 L 6 10 Z',
  in: 'M 0 0 L 6 0 L 4 8 Z',
  au: 'M 0 0 L 10 -1 L 12 6 L 4 8 L -1 4 Z',
  an: 'M 0 0 L 30 0 L 26 6 L 4 6 Z',
};
const PLACES: Record<number, Record<string, [number, number]>> = {
  250: {
    na: [30, 22],
    sa: [36, 46],
    af: [46, 38],
    eu: [48, 12],
    in: [56, 56],
    au: [58, 64],
    an: [42, 70],
  },
  150: {
    na: [24, 20],
    sa: [34, 48],
    af: [46, 38],
    eu: [50, 12],
    in: [60, 54],
    au: [62, 70],
    an: [44, 80],
  },
  0: {
    na: [8, 16],
    sa: [24, 52],
    af: [48, 40],
    eu: [50, 12],
    in: [74, 34],
    au: [82, 62],
    an: [36, 88],
  },
};

export function ContinentsFigure({
  continents,
  c,
}: {
  continents: NonNullable<Scene['continents']>;
  c: Palette;
}) {
  const places = PLACES[continents.age]!;
  return (
    <Canvas aspect={0.6}>
      {({ w, h }) => {
        const k = Math.min(w, h / 0.6) / 100;
        const ox = (w - 100 * k) / 2;
        const oy = 4;
        const at = (id: string) => places[id]!;
        const clue = continents.clue;
        return (
          <Svg width={w} height={h}>
            <Rect x={0} y={0} width={w} height={h} fill={c.chartHighlight} fillOpacity={0.08} />
            {Object.entries(LANDS).map(([id, d]) => {
              const [x, y] = at(id);
              const lit =
                (clue === 'fossils' && (id === 'sa' || id === 'af')) ||
                (clue === 'rocks' && (id === 'na' || id === 'eu')) ||
                (clue === 'shapes' && (id === 'sa' || id === 'af'));
              return (
                <Path
                  key={id}
                  d={d}
                  transform={`translate(${ox + x * k} ${oy + y * k}) scale(${k})`}
                  fill={lit ? c.chartHighlight : c.chartFill}
                  fillOpacity={lit ? 0.4 : 1}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight / k}
                />
              );
            })}
            {clue === 'fossils' ? (
              <Ellipse
                cx={ox + (at('sa')[0] + 12) * k}
                cy={oy + (at('sa')[1] + 6) * k}
                rx={10 * k}
                ry={4 * k}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeDasharray={chart.dash}
              />
            ) : null}
            {clue === 'rocks' ? (
              <Line
                x1={ox + (at('na')[0] + 14) * k}
                y1={oy + (at('na')[1] + 6) * k}
                x2={ox + (at('eu')[0] + 8) * k}
                y2={oy + (at('eu')[1] + 6) * k}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
                strokeDasharray={chart.dash}
              />
            ) : null}
            <ChartText
              x={w - 8}
              y={h - 8}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartInk}
              textAnchor="end"
            >
              {continents.age === 0 ? 'today' : `${continents.age} million years ago`}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}

// ── The rock cycle ──

const ROCK_BOXES = {
  magma: { x: 0.5, y: 0.86, text: 'Magma' },
  igneous: { x: 0.16, y: 0.5, text: 'Igneous rock' },
  sediment: { x: 0.5, y: 0.13, text: 'Sediment' },
  sedimentary: { x: 0.84, y: 0.36, text: 'Sedimentary rock' },
  metamorphic: { x: 0.84, y: 0.66, text: 'Metamorphic rock' },
} as const;
type RockBox = keyof typeof ROCK_BOXES;
const ROCK_STEPS: Record<string, { from: RockBox; to: RockBox; heat: boolean }[]> = {
  melting: [{ from: 'metamorphic', to: 'magma', heat: true }],
  cooling: [{ from: 'magma', to: 'igneous', heat: true }],
  weathering: [
    { from: 'igneous', to: 'sediment', heat: false },
    { from: 'metamorphic', to: 'sediment', heat: false },
  ],
  deposition: [{ from: 'sediment', to: 'sedimentary', heat: false }],
  metamorphism: [
    { from: 'sedimentary', to: 'metamorphic', heat: true },
    { from: 'igneous', to: 'metamorphic', heat: true },
  ],
  uplift: [
    { from: 'metamorphic', to: 'sediment', heat: true },
    { from: 'igneous', to: 'sediment', heat: true },
  ],
};

export function RockCycleFigure({ rock, c }: { rock: NonNullable<Scene['rock']>; c: Palette }) {
  const lit = ROCK_STEPS[rock.process] ?? [];
  const all = Object.values(ROCK_STEPS).flat();
  return (
    <Canvas aspect={0.8}>
      {({ w, h }) => {
        const bw = Math.min(118, w * 0.3);
        const bh = 30;
        const pos = (b: RockBox) => ({ x: ROCK_BOXES[b].x * w, y: ROCK_BOXES[b].y * h });
        const edge = (from: RockBox, to: RockBox) => {
          const a = pos(from);
          const b = pos(to);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l = Math.hypot(dx, dy) || 1;
          // Leave the boxes: step out along the line until clear of each box.
          const out = (p: { x: number; y: number }, s: number) => {
            const t =
              Math.min(bw / 2 / Math.abs(dx / l || 1e-9), bh / 2 / Math.abs(dy / l || 1e-9)) + 6;
            return { x: p.x + (s * dx * t) / l, y: p.y + (s * dy * t) / l };
          };
          return [out(a, 1), out(b, -1)] as const;
        };
        const heat = lit.some((s) => s.heat);
        return (
          <Svg width={w} height={h}>
            {all.map((s, i) => {
              const [p, q] = edge(s.from, s.to);
              const on = lit.some((l) => l.from === s.from && l.to === s.to);
              return on ? null : (
                <Arrow
                  key={`a${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  c={c}
                  color={c.chartMuted}
                  dashed
                />
              );
            })}
            {lit.map((s, i) => {
              const [p, q] = edge(s.from, s.to);
              return (
                <Arrow
                  key={`l${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  c={c}
                  color={c.chartHighlight}
                  heavy
                />
              );
            })}
            {(Object.keys(ROCK_BOXES) as RockBox[]).map((b) => {
              const p = pos(b);
              return (
                <G key={b}>
                  <Rect
                    x={p.x - bw / 2}
                    y={p.y - bh / 2}
                    width={bw}
                    height={bh}
                    rx={8}
                    fill={c.chartSurface}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={p.x}
                    y={p.y + 4}
                    fontSize={chart.small}
                    fontWeight="700"
                    fill={c.chartInk}
                    textAnchor="middle"
                  >
                    {ROCK_BOXES[b].text}
                  </ChartText>
                </G>
              );
            })}
            {lit.length ? (
              <G>
                <Rect
                  x={w / 2 - 70}
                  y={h / 2 - 12}
                  width={140}
                  height={24}
                  rx={12}
                  fill={c.chartHighlight}
                />
                <ChartText
                  x={w / 2}
                  y={h / 2 + 4}
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.onChartHighlight}
                  textAnchor="middle"
                >
                  {heat ? 'Earth’s inner heat' : 'Sun and gravity'}
                </ChartText>
              </G>
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}
