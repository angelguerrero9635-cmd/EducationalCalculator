import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

/**
 * Explore figures for Grade 6 science (docs/MODULE_GUIDE.md, "Module layouts"): the cell. Each
 * draws one scene; the scene's lines say what to notice. Shapes are drawn in the text color with
 * the scene's part in the highlight, so nothing depends on color. (The body's systems, the water
 * cycle, fronts, plates, continents and the rock cycle have their own files since round 4.)
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
