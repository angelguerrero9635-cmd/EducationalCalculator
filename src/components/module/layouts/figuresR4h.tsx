/**
 * Round-4 explore figures (group H): a textbook cell (animal, plant or bacterium) with the part
 * being read about glowing and the others dimmed. Real things in their materials: jelly
 * cytoplasm, a nucleus with its double membrane and nucleolus, bean mitochondria with folds,
 * chloroplast lenses with their stacks, a watery vacuole and a stiff green wall.
 */
import type { ReactNode } from 'react';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, TopLight, url, usePaintIds } from '../reps/paint';

type CellScene = NonNullable<Scene['cell']>;
type Part = NonNullable<CellScene['part']>;

/** Width kept for the labels on each side of the cell (12 px text, "mitochondria" on the right). */
const LEFT = 70;
const RIGHT = 88;
const GAP = 8;

/** A closed path through points (x, y) around a centre: a blob, drawn with short straight runs. */
function blob(cx: number, cy: number, rx: number, ry: number, wobble: (a: number) => number) {
  const n = 72;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = wobble(a);
    return `${(cx + rx * k * Math.cos(a)).toFixed(1)} ${(cy + ry * k * Math.sin(a)).toFixed(1)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

/** A capsule (rounded rod) path. */
function capsule(x: number, y: number, w: number, h: number) {
  const r = h / 2;
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}

type Label = {
  part: Part;
  lines: string[];
  side: 'left' | 'right';
  /** Label baseline, as a fraction of the canvas height. */
  at: number;
  /** Where the leader touches the part. */
  to: [number, number];
};

export function CellFigure({ cell, c }: { cell: CellScene; c: Palette }) {
  const ids = usePaintIds('jelly', 'nucleus', 'mito', 'chloro', 'vacuole', 'wall');
  const chosen = cell.part;
  const on = (p: Part) => chosen === p;
  // The chosen part glows; the others step back so it stands out.
  const dim = (p: Part) => (chosen && !on(p) ? 0.42 : 1);
  const hl = c.chartHighlight;
  const cyto = cell.type === 'plant' ? c.life : cell.type === 'animal' ? c.organ : c.fat;
  /** A glow under an outline: a wide soft stroke, then the crisp one. */
  const glow = (p: Part, d: string, width = chart.strokeHeavy) =>
    on(p) ? (
      <G key={`glow-${p}-${d.length}`}>
        <Path d={d} fill="none" stroke={hl} strokeWidth={width + 8} strokeOpacity={0.25} />
        <Path d={d} fill="none" stroke={hl} strokeWidth={width} />
      </G>
    ) : null;
  return (
    <Canvas aspect={(w) => cellHeight(w) / w}>
      {({ w, h }) => {
        const cw = Math.min(w - LEFT - RIGHT - 2 * GAP, 300);
        const x0 = (w - (LEFT + RIGHT + 2 * GAP + cw)) / 2;
        const bx = x0 + LEFT + GAP;
        const cellH =
          cell.type === 'bacterium' ? cw * 0.48 : cell.type === 'plant' ? cw * 0.8 : cw * 0.84;
        const by = (h - cellH) / 2;
        const X = (u: number) => bx + u * cw;
        const Y = (v: number) => by + v * cellH;
        const s = Math.min(cw, cellH);
        const art: ReactNode[] = [];
        let labels: Label[] = [];

        /** A bean mitochondrion about 17 % of the cell long, with its folded inner membrane. */
        const mito = (u: number, v: number, rot: number, k: string, len = cw * 0.17) => {
          const x = X(u);
          const y = Y(v);
          const L = len / 2;
          const H = len * 0.27;
          const bean = `M ${x - L} ${y} C ${x - L} ${y - H * 1.3}, ${x - L * 0.2} ${y - H * 0.9}, ${x} ${y - H * 0.8} S ${x + L} ${y - H * 1.4}, ${x + L} ${y} S ${x + L * 0.3} ${y + H * 1.1}, ${x} ${y + H * 0.95} S ${x - L} ${y + H * 1.3}, ${x - L} ${y} Z`;
          const folds = Array.from({ length: 5 }, (_, i) => {
            const fx = x - L * 0.72 + (i * L * 1.44) / 4;
            const up = i % 2 === 0;
            return `M ${fx} ${up ? y - H * 0.75 : y + H * 0.75} L ${fx} ${up ? y + H * 0.2 : y - H * 0.2}`;
          }).join(' ');
          return (
            <G key={k} transform={`rotate(${rot} ${x} ${y})`} opacity={dim('mitochondria')}>
              <Path d={bean} fill={url(ids.mito)} stroke={c.chartInk} strokeWidth={1.2} />
              <Path
                d={folds}
                stroke={c.chartInk}
                strokeOpacity={0.55}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
              {glow('mitochondria', bean, 2.5)}
            </G>
          );
        };

        /** The nucleus: double membrane with pores, grainy DNA, a dark nucleolus. */
        const nucleus = (u: number, v: number, r: number) => {
          const x = X(u);
          const y = Y(v);
          const ring = blob(x, y, r, r * 0.94, (a) => 1 + 0.03 * Math.sin(3 * a + 1));
          return (
            <G key="nucleus" opacity={dim('nucleus')}>
              <Path d={ring} fill={url(ids.nucleus)} stroke={c.chartInk} strokeWidth={1.4} />
              {/* The inner of the two membranes, broken by pores. */}
              <Circle
                cx={x}
                cy={y}
                r={r * 0.86}
                fill="none"
                stroke={c.chartInk}
                strokeOpacity={0.6}
                strokeWidth={1}
                strokeDasharray={`${r * 0.7} ${r * 0.12}`}
              />
              {[0.3, 1.4, 2.2, 3.5, 4.4, 5.3].map((a, i) => (
                <Circle
                  key={i}
                  cx={x + r * 0.5 * Math.cos(a) * (0.6 + (i % 3) * 0.2)}
                  cy={y + r * 0.5 * Math.sin(a) * (0.6 + (i % 3) * 0.2)}
                  r={1.3}
                  fill={c.chartInk}
                  fillOpacity={0.4}
                />
              ))}
              <Circle
                cx={x + r * 0.18}
                cy={y + r * 0.12}
                r={r * 0.32}
                fill={c.purple}
                stroke={c.chartInk}
                strokeOpacity={0.5}
              />
              <Circle
                cx={x + r * 0.18}
                cy={y + r * 0.12}
                r={r * 0.32}
                fill={c.shade}
                fillOpacity={0.3}
              />
              {glow('nucleus', ring)}
            </G>
          );
        };

        /** Tiny ribosome grains scattered through the cytoplasm (not labeled). */
        const grains = (spots: [number, number][]) =>
          spots.map(([u, v], i) => (
            <Circle
              key={`g${i}`}
              cx={X(u)}
              cy={Y(v)}
              r={1.2}
              fill={c.chartInk}
              fillOpacity={0.35}
            />
          ));

        if (cell.type === 'animal') {
          const cx = X(0.5);
          const cy = Y(0.5);
          const edge = blob(
            cx,
            cy,
            cw * 0.48,
            cellH * 0.47,
            (a) => 1 + 0.035 * Math.sin(3 * a + 0.6) + 0.025 * Math.sin(5 * a + 2),
          );
          art.push(
            <G key="cyto" opacity={on('cytoplasm') ? 1 : dim('cytoplasm')}>
              <Path
                d={edge}
                fill={on('cytoplasm') ? hl : cyto}
                fillOpacity={on('cytoplasm') ? 0.3 : 0.55}
              />
              <Path d={edge} fill={url(ids.jelly)} />
              {grains([
                [0.2, 0.52],
                [0.28, 0.25],
                [0.62, 0.2],
                [0.66, 0.5],
                [0.55, 0.78],
                [0.8, 0.46],
                [0.16, 0.66],
                [0.42, 0.86],
              ])}
            </G>,
            <G key="membrane" opacity={dim('membrane')}>
              <Path d={edge} fill="none" stroke={c.organDeep} strokeWidth={2.2} />
            </G>,
            glow('membrane', edge),
            nucleus(0.43, 0.47, s * 0.17),
            mito(0.22, 0.34, -30, 'm1'),
            mito(0.71, 0.27, 18, 'm2'),
            mito(0.73, 0.7, -14, 'm3'),
            mito(0.33, 0.76, 24, 'm4'),
          );
          labels = [
            {
              part: 'membrane',
              lines: ['cell', 'membrane'],
              side: 'left',
              at: 0.2,
              to: [X(0.09), Y(0.24)],
            },
            {
              part: 'nucleus',
              lines: ['nucleus'],
              side: 'left',
              at: 0.52,
              to: [X(0.43) - s * 0.17, Y(0.5)],
            },
            {
              part: 'cytoplasm',
              lines: ['cytoplasm'],
              side: 'left',
              at: 0.8,
              to: [X(0.18), Y(0.62)],
            },
            {
              part: 'mitochondria',
              lines: ['mitochondria'],
              side: 'right',
              at: 0.3,
              to: [X(0.79), Y(0.29)],
            },
          ];
        } else if (cell.type === 'plant') {
          const t = Math.max(6, cw * 0.035);
          const outer = `M ${X(0) + 8} ${Y(0)} H ${X(1) - 8} Q ${X(1)} ${Y(0)} ${X(1)} ${Y(0) + 8} V ${Y(1) - 8} Q ${X(1)} ${Y(1)} ${X(1) - 8} ${Y(1)} H ${X(0) + 8} Q ${X(0)} ${Y(1)} ${X(0)} ${Y(1) - 8} V ${Y(0) + 8} Q ${X(0)} ${Y(0)} ${X(0) + 8} ${Y(0)} Z`;
          const ix = X(0) + t;
          const iy = Y(0) + t;
          const iw = cw - 2 * t;
          const ih = cellH - 2 * t;
          const inner = `M ${ix + 5} ${iy} H ${ix + iw - 5} Q ${ix + iw} ${iy} ${ix + iw} ${iy + 5} V ${iy + ih - 5} Q ${ix + iw} ${iy + ih} ${ix + iw - 5} ${iy + ih} H ${ix + 5} Q ${ix} ${iy + ih} ${ix} ${iy + ih - 5} V ${iy + 5} Q ${ix} ${iy} ${ix + 5} ${iy} Z`;
          const vac = { x: X(0.3), y: Y(0.17), w: cw * 0.58, h: cellH * 0.6 };
          const vacD = blob(
            vac.x + vac.w / 2,
            vac.y + vac.h / 2,
            vac.w / 2,
            vac.h / 2,
            (a) =>
              (1 /
                Math.pow(
                  Math.pow(Math.abs(Math.cos(a)), 4) + Math.pow(Math.abs(Math.sin(a)), 4),
                  0.25,
                )) *
                0.98 +
              0.012 * Math.sin(4 * a),
          );
          art.push(
            <G key="wall" opacity={dim('wall')}>
              <Path d={outer} fill={c.lifeDeep} stroke={c.chartInk} strokeWidth={1.4} />
              <Path d={outer} fill={url(ids.wall)} />
              {/* Fibres in the wall, so it reads as a stiff layer, not a line. */}
              <Path
                d={`M ${X(0) + t / 2} ${Y(0) + 12} V ${Y(1) - 12} M ${X(1) - t / 2} ${Y(0) + 12} V ${Y(1) - 12} M ${X(0) + 12} ${Y(0) + t / 2} H ${X(1) - 12} M ${X(0) + 12} ${Y(1) - t / 2} H ${X(1) - 12}`}
                stroke={c.life}
                strokeOpacity={0.8}
                strokeWidth={1}
                strokeDasharray="6 3"
              />
            </G>,
            glow('wall', outer, chart.strokeHeavy),
            <G key="cyto" opacity={on('cytoplasm') ? 1 : dim('cytoplasm')}>
              <Path d={inner} fill={c.card} />
              <Path
                d={inner}
                fill={on('cytoplasm') ? hl : cyto}
                fillOpacity={on('cytoplasm') ? 0.3 : 0.45}
              />
              <Path d={inner} fill={url(ids.jelly)} />
              {grains([
                [0.14, 0.3],
                [0.2, 0.82],
                [0.1, 0.72],
                [0.6, 0.86],
                [0.94, 0.4],
                [0.5, 0.1],
              ])}
            </G>,
            <G key="membrane" opacity={dim('membrane')}>
              <Path
                d={inner}
                fill="none"
                stroke={c.chartInk}
                strokeOpacity={0.75}
                strokeWidth={1.4}
              />
            </G>,
            glow('membrane', inner, 2.5),
            <G key="vacuole" opacity={dim('vacuole')}>
              <Path
                d={vacD}
                fill={c.water}
                fillOpacity={0.3}
                stroke={c.waterDeep}
                strokeWidth={1.4}
              />
              <Path d={vacD} fill={url(ids.vacuole)} />
              {glow('vacuole', vacD)}
            </G>,
            nucleus(0.155, 0.5, s * 0.12),
          );
          // Chloroplasts lie in the thin cytoplasm along the wall, pushed out by the vacuole.
          const lens = cw * 0.065;
          const chloros: [number, number, number][] = [
            [0.36, 0.085, 0],
            [0.56, 0.085, 0],
            [0.76, 0.085, 0],
            [0.955, 0.3, 90],
            [0.955, 0.62, 90],
            [0.46, 0.9, 0],
            [0.7, 0.9, 0],
            [0.1, 0.18, 0],
          ];
          for (const [u, v, rot] of chloros) {
            const x = X(u);
            const y = Y(v);
            const d = `M ${x - lens} ${y} Q ${x} ${y - lens * 1.05} ${x + lens} ${y} Q ${x} ${y + lens * 1.05} ${x - lens} ${y} Z`;
            art.push(
              <G
                key={`c${u}${v}`}
                transform={`rotate(${rot} ${x} ${y})`}
                opacity={dim('chloroplasts')}
              >
                <Path d={d} fill={url(ids.chloro)} stroke={c.chartInk} strokeWidth={1.1} />
                {[-0.5, 0, 0.5].map((k) => (
                  <Rect
                    key={k}
                    x={x + k * lens - 2.4}
                    y={y - lens * 0.2}
                    width={4.8}
                    height={lens * 0.4}
                    rx={1}
                    fill={c.lifeDeep}
                    stroke={c.chartInk}
                    strokeOpacity={0.5}
                    strokeWidth={0.7}
                  />
                ))}
                {glow('chloroplasts', d, 2.2)}
              </G>,
            );
          }
          art.push(mito(0.885, 0.9, 0, 'm1', cw * 0.12), mito(0.25, 0.36, 90, 'm2', cw * 0.13));
          labels = [
            {
              part: 'wall',
              lines: ['cell wall'],
              side: 'left',
              at: 0.12,
              to: [X(0) + t / 2, Y(0.1)],
            },
            {
              part: 'membrane',
              lines: ['cell', 'membrane'],
              side: 'left',
              at: 0.33,
              to: [ix, Y(0.33)],
            },
            {
              part: 'nucleus',
              lines: ['nucleus'],
              side: 'left',
              at: 0.58,
              to: [X(0.155) - s * 0.12, Y(0.55)],
            },
            {
              part: 'cytoplasm',
              lines: ['cytoplasm'],
              side: 'left',
              at: 0.86,
              to: [X(0.06), Y(0.66)],
            },
            {
              part: 'chloroplasts',
              lines: ['chloroplasts'],
              side: 'right',
              at: 0.14,
              to: [X(0.955), Y(0.3) - lens],
            },
            {
              part: 'vacuole',
              lines: ['vacuole'],
              side: 'right',
              at: 0.48,
              to: [vac.x + vac.w * 0.97, Y(0.47)],
            },
            {
              part: 'mitochondria',
              lines: ['mitochondria'],
              side: 'right',
              at: 0.9,
              to: [X(0.94), Y(0.9)],
            },
          ];
        } else {
          // A rod-shaped bacterium: wall, membrane, cytoplasm and a loose loop of DNA.
          const t = Math.max(6, cw * 0.035);
          const outer = capsule(X(0), Y(0), cw, cellH);
          const inner = capsule(X(0) + t, Y(0) + t, cw - 2 * t, cellH - 2 * t);
          const cx = X(0.5);
          const cy = Y(0.5);
          // A tangled loop of DNA (a closed 3:4 curve), lying loose in the cytoplasm.
          const dna =
            Array.from({ length: 121 }, (_, i) => {
              const a = (i / 120) * Math.PI * 2;
              const x = cx + cw * 0.22 * Math.sin(3 * a + 0.5);
              const y = cy + cellH * 0.24 * Math.sin(4 * a);
              return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join(' ') + ' Z';
          art.push(
            <G key="wall" opacity={dim('wall')}>
              <Path d={outer} fill={c.rock1} stroke={c.chartInk} strokeWidth={1.4} />
              <Path d={outer} fill={url(ids.wall)} />
            </G>,
            glow('wall', outer),
            <G key="cyto" opacity={on('cytoplasm') ? 1 : dim('cytoplasm')}>
              <Path d={inner} fill={c.card} />
              <Path
                d={inner}
                fill={on('cytoplasm') ? hl : cyto}
                fillOpacity={on('cytoplasm') ? 0.3 : 0.55}
              />
              <Path d={inner} fill={url(ids.jelly)} />
              {grains([
                [0.12, 0.4],
                [0.16, 0.62],
                [0.22, 0.3],
                [0.8, 0.35],
                [0.85, 0.6],
                [0.76, 0.7],
                [0.3, 0.74],
                [0.66, 0.26],
              ])}
            </G>,
            <G key="membrane" opacity={dim('membrane')}>
              <Path
                d={inner}
                fill="none"
                stroke={c.chartInk}
                strokeOpacity={0.75}
                strokeWidth={1.4}
              />
            </G>,
            glow('membrane', inner, 2.5),
            <G key="dna" opacity={dim('dna')}>
              <Path
                d={dna}
                fill="none"
                stroke={on('dna') ? hl : c.purple}
                strokeWidth={on('dna') ? 2.6 : 2}
                strokeLinejoin="round"
              />
              {on('dna') ? (
                <Path d={dna} fill="none" stroke={hl} strokeWidth={9} strokeOpacity={0.2} />
              ) : null}
            </G>,
          );
          labels = [
            {
              part: 'wall',
              lines: ['cell wall'],
              side: 'left',
              at: 0.3,
              to: [X(0.12), Y(0) + t * 0.6],
            },
            {
              part: 'membrane',
              lines: ['cell', 'membrane'],
              side: 'left',
              at: 0.64,
              to: [X(0) + t, Y(0.62)],
            },
            {
              part: 'cytoplasm',
              lines: ['cytoplasm'],
              side: 'right',
              at: 0.3,
              to: [X(0.82), Y(0.3)],
            },
            {
              part: 'dna',
              lines: ['DNA, loose:', 'no nucleus'],
              side: 'right',
              at: 0.64,
              to: [cx + cw * 0.22, cy + cellH * 0.238],
            },
          ];
        }

        const tags = labels.map((l) => {
          const lit = on(l.part);
          const ty = h * l.at;
          const tx = l.side === 'left' ? bx - GAP : bx + cw + GAP;
          const anchor = l.side === 'left' ? 'end' : 'start';
          const lineH = chart.label + 2;
          const midY = ty + ((l.lines.length - 1) * lineH) / 2 - chart.label * 0.35;
          const [px, py] = l.to;
          return (
            <G key={l.part}>
              <Line
                x1={tx + (l.side === 'left' ? 3 : -3)}
                y1={midY}
                x2={px}
                y2={py}
                stroke={lit ? hl : c.chartInk}
                strokeOpacity={lit ? 1 : 0.7}
                strokeWidth={lit ? chart.stroke : 1}
              />
              <Circle cx={px} cy={py} r={lit ? 2.6 : 2} fill={lit ? hl : c.chartInk} />
              {l.lines.map((text, i) => (
                <ChartText
                  key={text}
                  x={tx}
                  y={ty + i * lineH}
                  fontSize={chart.label}
                  fontWeight={lit ? '700' : '400'}
                  fill={lit ? hl : c.chartInk}
                  textAnchor={anchor}
                >
                  {text}
                </ChartText>
              ))}
            </G>
          );
        });

        return (
          <Svg width={w} height={h}>
            <Defs>
              <RadialGradient id={ids.jelly} cx="0.38" cy="0.32" r="0.75">
                <Stop offset="0" stopColor={c.shine} stopOpacity={0.5 * c.sheen} />
                <Stop offset="0.55" stopColor={c.shine} stopOpacity={0.08 * c.sheen} />
                <Stop offset="1" stopColor={c.shade} stopOpacity={0.14} />
              </RadialGradient>
              <RadialGradient id={ids.vacuole} cx="0.35" cy="0.3" r="0.8">
                <Stop offset="0" stopColor={c.glassShine} stopOpacity={0.55} />
                <Stop offset="0.5" stopColor={c.glassShine} stopOpacity={0.05} />
                <Stop offset="1" stopColor={c.waterDeep} stopOpacity={0.2} />
              </RadialGradient>
              <Ball id={ids.nucleus} color={c.purple} />
              <Ball id={ids.mito} color={c.orange} />
              <Ball id={ids.chloro} color={c.life} />
              <TopLight id={ids.wall} />
            </Defs>
            {art}
            {tags}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** Canvas height for a width: the tallest cell (the round animal cell) and a margin. */
function cellHeight(w: number) {
  const cw = Math.min(w - LEFT - RIGHT - 2 * GAP, 300);
  return cw * 0.84 + 28;
}
