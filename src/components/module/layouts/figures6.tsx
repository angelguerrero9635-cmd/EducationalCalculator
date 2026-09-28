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
  // Cytoplasm tinted as a stained slide shows it (green plant, pink animal, tan bacterium);
  // the part being read about still turns the highlight.
  const cyto = cell.type === 'plant' ? c.life : cell.type === 'animal' ? c.rock6 : c.chartSecond;
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
              fill={on('cytoplasm') ? c.chartHighlight : cyto}
              fillOpacity={on('cytoplasm') ? 0.25 : 0.35}
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
                fill={on('cytoplasm') ? c.chartHighlight : cyto}
                fillOpacity={on('cytoplasm') ? 0.25 : 0.35}
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
                fill={on('cytoplasm') ? c.chartHighlight : cyto}
                fillOpacity={on('cytoplasm') ? 0.25 : 0.35}
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
                    fill={on('chloroplasts') ? c.chartHighlight : c.lifeDeep}
                    fillOpacity={on('chloroplasts') ? 0.45 : 0.8}
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
          tag(
            'cytoplasm',
            'cytoplasm',
            plant ? x0 + cw * 0.76 : cx + cw * 0.3,
            plant ? y0 + ch * 0.68 : cy,
            plant ? 5 : 3,
          );
          tag(
            'mitochondria',
            'mitochondria',
            plant ? x0 + cw * 0.86 : cx + cw * 0.28,
            plant ? y0 + ch * 0.8 : cy + ch * 0.2,
            plant ? 6 : 4,
          );
          if (plant) {
            tag('vacuole', 'vacuole', cx + cw * 0.2, y0 + ch * 0.45, 3);
            tag('chloroplasts', 'chloroplasts', x0 + cw * 0.9, y0 + ch * 0.55, 4);
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

// ── The rock cycle ──

const ROCK_BOXES = {
  magma: { x: 0.5, y: 0.86, text: 'Magma' },
  igneous: { x: 0.16, y: 0.5, text: 'Igneous rock' },
  surface: { x: 0.16, y: 0.13, text: 'Rock at the surface' },
  sediment: { x: 0.6, y: 0.13, text: 'Sediment' },
  sedimentary: { x: 0.84, y: 0.36, text: 'Sedimentary rock' },
  metamorphic: { x: 0.84, y: 0.66, text: 'Metamorphic rock' },
} as const;
type RockBox = keyof typeof ROCK_BOXES;
const ROCK_STEPS: Record<string, { from: RockBox; to: RockBox; heat: boolean }[]> = {
  // Any rock buried deep enough melts.
  melting: [
    { from: 'metamorphic', to: 'magma', heat: true },
    { from: 'sedimentary', to: 'magma', heat: true },
    { from: 'igneous', to: 'magma', heat: true },
  ],
  cooling: [{ from: 'magma', to: 'igneous', heat: true }],
  // Rock at the surface breaks down; uplift is its own step that brings buried rock up.
  weathering: [{ from: 'surface', to: 'sediment', heat: false }],
  deposition: [{ from: 'sediment', to: 'sedimentary', heat: false }],
  metamorphism: [
    { from: 'sedimentary', to: 'metamorphic', heat: true },
    { from: 'igneous', to: 'metamorphic', heat: true },
  ],
  uplift: [
    { from: 'igneous', to: 'surface', heat: true },
    { from: 'metamorphic', to: 'surface', heat: true },
    { from: 'sedimentary', to: 'surface', heat: true },
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
                {/* The driver sits in a corner, not among the boxes. */}
                <Rect x={6} y={h - 30} width={140} height={24} rx={12} fill={c.chartHighlight} />
                <ChartText
                  x={76}
                  y={h - 14}
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
