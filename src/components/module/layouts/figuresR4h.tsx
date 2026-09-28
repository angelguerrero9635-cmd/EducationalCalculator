/**
 * Round-4 explore figures (group H): a textbook cell (animal, plant or bacterium) with the part
 * being read about glowing and the others dimmed. Real things in their materials: jelly
 * cytoplasm, a nucleus with its double membrane and nucleolus, bean mitochondria with folds,
 * chloroplast lenses with their stacks, a watery vacuole and a stiff green wall.
 */
import type { ReactNode } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { chart, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, Deepen, Glass, Sheen, TopLight, url, usePaintIds } from '../reps/paint';

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

// ── Particles in a jar or a syringe ──

/** Fixed jitter so the same scene always draws the same picture. */
const JITTER = [
  0.3, -0.4, 0.1, 0.45, -0.2, 0.35, -0.45, 0.05, 0.25, -0.3, 0.4, -0.1, 0.15, -0.35, 0.2, -0.25,
];

/** Where the ten gas particles sit, as fractions of the room inside (scattered, no row or line). */
const GAS_SPOTS: readonly (readonly [number, number])[] = [
  [0.08, 0.15],
  [0.55, 0.05],
  [0.9, 0.3],
  [0.3, 0.4],
  [0.7, 0.55],
  [0.12, 0.7],
  [0.45, 0.8],
  [0.95, 0.85],
  [0.25, 0.98],
  [0.62, 0.28],
];

/** The way each gas particle is flying (degrees, y down), fixed so the scene never changes. */
const GAS_HEADINGS = [-35, 160, 110, -150, 20, -80, 200, -120, 45, -10];

/**
 * Particles in a closed glass jar: a lattice block that only wiggles (solid, 40 particles), a
 * crowd under a meniscus sliding about (liquid, 32), ten far apart flying in straight lines
 * (gas). Squeezed air is the ten gas particles in a syringe pushed to half its room. Sugar in
 * water is the liquid with every third particle sugar, named in a key.
 */
export function Particles({ state, c }: { state: NonNullable<Scene['particles']>; c: Palette }) {
  const ids = usePaintIds('glass', 'water', 'main', 'other', 'lid', 'rod');
  const squeezed = !!state.squeezed;
  const main = squeezed ? c.silverDark : c.waterDeep;
  return (
    <Canvas aspect={0.66}>
      {({ w, h }) => {
        // Smaller in the squeezed syringe, so ten particles fit its half-room without touching.
        const r = squeezed ? 7 : 8.5;
        const dots: { x: number; y: number; other: boolean; k: number }[] = [];
        const marks: ReactNode[] = [];
        const captionY = h - 8;
        let vessel: ReactNode;
        let front: ReactNode = null;
        let liquid: ReactNode = null;

        /** An arrow from a particle heading `deg`, `len` long: a gas particle's straight flight. */
        const flight = (x: number, y: number, deg: number, len: number, k: number) => {
          const t = (deg * Math.PI) / 180;
          const [dx, dy] = [Math.cos(t), Math.sin(t)];
          const x1 = x + dx * (r + 2);
          const y1 = y + dy * (r + 2);
          const x2 = x1 + dx * len;
          const y2 = y1 + dy * len;
          const head = `M ${x2 - dx * 6 - dy * 3.5} ${y2 - dy * 6 + dx * 3.5} L ${x2} ${y2} L ${x2 - dx * 6 + dy * 3.5} ${y2 - dy * 6 - dx * 3.5}`;
          return (
            <G key={`f${k}`}>
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c.chartInk}
                strokeOpacity={0.6}
                strokeWidth={1.5}
                strokeDasharray="4 2.5"
              />
              <Path
                d={head}
                fill="none"
                stroke={c.chartInk}
                strokeOpacity={0.7}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          );
        };

        if (squeezed) {
          // A syringe on its side, nozzle capped, the plunger pushed in to half the barrel.
          const bx0 = w / 2 - 138;
          const bx1 = w / 2 + 88;
          const cy = (h - 26) / 2 + 8;
          const bh = 84;
          const by = cy - bh / 2;
          const px = bx0 + (bx1 - bx0) * 0.5;
          const room = { x: bx0 + 3, y: by + 4, w: px - bx0 - 5, h: bh - 8 };
          GAS_SPOTS.forEach(([fx, fy], k) =>
            dots.push({
              x: room.x + r + 1 + (room.w - 2 * r - 2) * fx,
              y: room.y + r + 1 + (room.h - 2 * r - 2) * fy,
              other: false,
              k,
            }),
          );
          const rodEnd = bx1 + 36;
          vessel = (
            <G>
              <Ellipse cx={w / 2} cy={by + bh + 22} rx={150} ry={5} fill={c.shadow} />
              {/* Nozzle and its rubber cap: no air gets out. */}
              <Rect
                x={bx0 - 18}
                y={cy - 6}
                width={18}
                height={12}
                fill={url(ids.glass)}
                stroke={c.glassEdge}
                strokeWidth={1.5}
              />
              <Rect
                x={bx0 - 30}
                y={cy - 9}
                width={14}
                height={18}
                rx={4}
                fill={c.rubber}
                stroke={c.glassEdge}
              />
              {/* Barrel. */}
              <Rect
                x={bx0}
                y={by}
                width={bx1 - bx0}
                height={bh}
                rx={6}
                fill={url(ids.glass)}
                stroke={c.glassEdge}
                strokeWidth={2}
              />
              {Array.from({ length: 11 }, (_, i) => (
                <Line
                  key={`t${i}`}
                  x1={bx0 + 12 + i * ((bx1 - bx0 - 24) / 10)}
                  y1={by}
                  x2={bx0 + 12 + i * ((bx1 - bx0 - 24) / 10)}
                  y2={by + (i % 5 === 0 ? 12 : 7)}
                  stroke={c.glassEdge}
                  strokeWidth={1.2}
                />
              ))}
              {/* Finger grips at the barrel's end. */}
              <Rect
                x={bx1 - 2}
                y={by - 12}
                width={7}
                height={bh + 24}
                rx={3}
                fill={url(ids.glass)}
                stroke={c.glassEdge}
                strokeWidth={1.5}
              />
            </G>
          );
          front = (
            <G>
              {/* The plunger: a rubber stopper on a metal rod, pushed in. */}
              <Rect
                x={px + 8}
                y={cy - 6}
                width={rodEnd - px - 8}
                height={12}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Rect x={px + 8} y={cy - 6} width={rodEnd - px - 8} height={12} fill={url(ids.rod)} />
              <Rect
                x={px}
                y={by + 2}
                width={10}
                height={bh - 4}
                rx={2}
                fill={c.rubber}
                stroke={c.glassEdge}
              />
              <Rect
                x={rodEnd}
                y={cy - 26}
                width={8}
                height={52}
                rx={3}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Rect x={rodEnd} y={cy - 26} width={8} height={52} rx={3} fill={url(ids.rod)} />
              {/* The push. */}
              <Path
                d={`M ${rodEnd + 42} ${cy} H ${rodEnd + 14}`}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Path
                d={`M ${rodEnd + 21} ${cy - 5} L ${rodEnd + 13} ${cy} L ${rodEnd + 21} ${cy + 5}`}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ChartText
                x={rodEnd + 28}
                y={cy - 10}
                fontSize={chart.value}
                fontWeight="700"
                fill={c.chartHighlight}
                textAnchor="middle"
              >
                push
              </ChartText>
              {/* Glass in front: a bright streak along the barrel. */}
              <Rect
                x={bx0 + 4}
                y={by + 7}
                width={bx1 - bx0 - 8}
                height={4}
                rx={2}
                fill={c.glassShine}
                fillOpacity={0.4}
              />
            </G>
          );
        } else {
          // A closed glass jar with a screw lid, standing on the table.
          const jw = Math.min(w * 0.62, 240);
          const x0 = w / 2 - jw / 2;
          const lidH = 14;
          const y0 = 8 + lidH;
          const bottom = h - 34;
          const jh = bottom - y0;
          const inner = { x: x0 + 5, y: y0 + 4, w: jw - 10, bottom: bottom - 5 };
          if (state.state === 'solid') {
            const cols = 8;
            const rows = 5;
            const gap = 2 * r + 1;
            for (let i = 0; i < rows; i++)
              for (let j = 0; j < cols; j++)
                dots.push({
                  x: w / 2 + (j - (cols - 1) / 2) * gap,
                  y: inner.bottom - r - 1 - i * gap,
                  other: state.mixed ? (i + j) % 3 === 0 : false,
                  k: i * cols + j,
                });
            // Tiny wiggle arcs at the block's edges: the particles shake in place.
            for (const d of dots) {
              const col = d.k % cols;
              const side = col === 0 ? -1 : col === cols - 1 ? 1 : 0;
              const topRow = d.k >= (rows - 1) * cols;
              if (side === 0 && !(topRow && col % 2 === 1)) continue;
              const ax = d.x + side * (r + 3);
              const ay = side ? d.y : d.y - r - 3;
              marks.push(
                <Path
                  key={`w${d.k}`}
                  d={
                    side
                      ? `M ${ax} ${ay - 4} Q ${ax + side * 3} ${ay} ${ax} ${ay + 4}`
                      : `M ${ax - 4} ${ay} Q ${ax} ${ay - 3} ${ax + 4} ${ay}`
                  }
                  fill="none"
                  stroke={c.chartInk}
                  strokeOpacity={0.6}
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />,
              );
            }
          } else if (state.state === 'liquid') {
            const cols = 8;
            const rows = 4;
            const gap = 2 * r + 5;
            for (let i = 0; i < rows; i++)
              for (let j = 0; j < cols; j++) {
                const k = i * cols + j;
                dots.push({
                  x: w / 2 + (j - (cols - 1) / 2) * gap + JITTER[k % 16]! * 5,
                  y: inner.bottom - r - 3 - i * gap + JITTER[(k + 5) % 16]! * 4,
                  other: state.mixed ? (i + j) % 3 === 0 : false,
                  k,
                });
              }
            // Water to just over the top row, with a meniscus curving up at the glass.
            const level = inner.bottom - rows * gap - 2;
            const lx0 = inner.x;
            const lx1 = inner.x + inner.w;
            const surface = `M ${lx0} ${level - 5} Q ${lx0 + 4} ${level} ${lx0 + 16} ${level} H ${lx1 - 16} Q ${lx1 - 4} ${level} ${lx1} ${level - 5}`;
            liquid = (
              <G>
                <Path
                  d={`${surface} V ${inner.bottom - 12} Q ${lx1} ${inner.bottom} ${lx1 - 12} ${inner.bottom} H ${lx0 + 12} Q ${lx0} ${inner.bottom} ${lx0} ${inner.bottom - 12} Z`}
                  fill={url(ids.water)}
                  fillOpacity={0.45}
                />
                <Path d={surface} fill="none" stroke={c.waterDeep} strokeWidth={1.5} />
              </G>
            );
            // Short tails: the particles slide past each other.
            for (const d of dots) {
              if (d.k % 3 !== 1) continue;
              const dir = d.k % 2 ? 1 : -1;
              marks.push(
                <Path
                  key={`s${d.k}`}
                  d={`M ${d.x - dir * (r + 2)} ${d.y - 2} q ${-dir * 4} 2 ${-dir * 9} 0 M ${d.x - dir * (r + 2)} ${d.y + 3} q ${-dir * 3} 2 ${-dir * 6} 0`}
                  fill="none"
                  stroke={c.chartInk}
                  strokeOpacity={0.55}
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />,
              );
            }
          } else {
            const room = {
              x: inner.x + 4,
              y: inner.y + 6,
              w: inner.w - 8,
              h: inner.bottom - inner.y - 10,
            };
            GAS_SPOTS.forEach(([fx, fy], k) =>
              dots.push({
                x: room.x + r + 14 + (room.w - 2 * r - 28) * fx,
                y: room.y + r + 2 + (room.h - 2 * r - 4) * fy,
                other: state.mixed ? k % 3 === 0 : false,
                k,
              }),
            );
          }
          vessel = (
            <G>
              <Ellipse cx={w / 2 + 3} cy={bottom + 2} rx={jw * 0.56} ry={5} fill={c.shadow} />
              <Path
                d={`M ${x0} ${y0} H ${x0 + jw} V ${bottom - 18} Q ${x0 + jw} ${bottom} ${x0 + jw - 18} ${bottom} H ${x0 + 18} Q ${x0} ${bottom} ${x0} ${bottom - 18} Z`}
                fill={url(ids.glass)}
                stroke={c.glassEdge}
                strokeWidth={2}
              />
              {/* The screw thread under the lid. */}
              <Line
                x1={x0}
                y1={y0 + 6}
                x2={x0 + jw}
                y2={y0 + 6}
                stroke={c.glassEdge}
                strokeWidth={1}
              />
            </G>
          );
          front = (
            <G>
              {/* Glass in front: a bright streak down the left of the jar. */}
              <Rect
                x={x0 + 9}
                y={y0 + 14}
                width={5}
                height={jh - 40}
                rx={2.5}
                fill={c.glassShine}
                fillOpacity={0.4}
              />
              {/* The metal lid, ridged at the edge. */}
              <Rect
                x={x0 - 4}
                y={y0 - lidH}
                width={jw + 8}
                height={lidH}
                rx={3}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Rect
                x={x0 - 4}
                y={y0 - lidH}
                width={jw + 8}
                height={lidH}
                rx={3}
                fill={url(ids.lid)}
              />
              {Array.from({ length: Math.floor(jw / 8) }, (_, i) => (
                <Line
                  key={`r${i}`}
                  x1={x0 + 2 + i * 8}
                  y1={y0 - lidH + 3}
                  x2={x0 + 2 + i * 8}
                  y2={y0 - 3}
                  stroke={c.metalDark}
                  strokeOpacity={0.45}
                />
              ))}
            </G>
          );
        }
        // Gas: every particle flies in a straight line until it hits another or the wall.
        // (Squeezed air has no room to draw the flights: the crowding is the point.)
        if (state.state === 'gas' && !squeezed)
          for (const d of dots) marks.push(flight(d.x, d.y, GAS_HEADINGS[d.k]!, 18, d.k));

        const caption = squeezed
          ? 'the same particles in less room'
          : state.mixed
            ? 'two kinds of particles, mixed'
            : state.state === 'solid'
              ? 'packed tight, only wiggling'
              : state.state === 'liquid'
                ? 'close, sliding past each other'
                : 'far apart, flying about';
        return (
          <Svg width={w} height={h}>
            <Defs>
              <Glass id={ids.glass} />
              <Deepen id={ids.water} from={c.waterTop} to={c.water} />
              <Ball id={ids.main} color={main} />
              <Ball id={ids.other} color={c.chartSecond} />
              <Sheen id={ids.lid} />
              <Sheen id={ids.rod} vertical />
            </Defs>
            {vessel}
            {liquid}
            {marks}
            {dots.map((d, i) => (
              <Circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={r}
                fill={url(d.other ? ids.other : ids.main)}
                stroke={c.chartInk}
                strokeOpacity={0.7}
                strokeWidth={1}
              />
            ))}
            {front}
            {state.mixed ? (
              <G>
                {/* The key: which particles are sugar. */}
                {[
                  ['water', ids.main],
                  ['sugar', ids.other],
                ].map(([name, id], i) => (
                  <G key={name}>
                    <Circle
                      cx={12}
                      cy={40 + i * 22}
                      r={6.5}
                      fill={url(id!)}
                      stroke={c.chartInk}
                      strokeOpacity={0.7}
                    />
                    <ChartText x={23} y={44 + i * 22} fontSize={chart.label}>
                      {name}
                    </ChartText>
                  </G>
                ))}
              </G>
            ) : null}
            <ChartText x={w / 2} y={captionY} fontSize={chart.value} textAnchor="middle">
              {caption}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
