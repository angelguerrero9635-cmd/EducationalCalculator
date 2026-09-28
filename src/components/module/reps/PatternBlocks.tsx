import { View } from 'react-native';
import Svg, { Circle, Defs, G, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { TopLight, url, usePaintIds } from './paint';
import { Canvas, ChartText, nowrap, useRep, Caption } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'patternBlocks' }>;
type Pt = [number, number];

/** The piece tray under the hexagon: its height, and each piece's size there. */
const TRAY_H = 64;
const TRAY_R = 26;

/** Points pulled in toward their middle by `d` px (near enough for these small convex pieces). */
function inset(pts: Pt[], d: number): Pt[] {
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const reach = pts.reduce((s, p) => s + Math.hypot(p[0] - mx, p[1] - my), 0) / pts.length;
  const k = Math.max(0, 1 - d / reach);
  return pts.map(([x, y]) => [mx + (x - mx) * k, my + (y - my) * k]);
}
const join = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

/**
 * A hexagon filled with pattern blocks. The hexagon is 6 triangle slices around its center; a
 * trapezoid covers 3 slices in a row, a rhombus 2, a triangle 1. The target hexagon is a dashed
 * slot; blocks, in matte classroom plastic (red trapezoid, blue rhombus, green triangle) with a
 * light bevel, snap in around it in that order with thin dark seams. Slices left empty stay
 * dashed. A tray underneath shows each kind of block with how many are used.
 */
export function PatternBlocks({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const n = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const blocks = [
    ...Array<number>(n(spec.trapezoids)).fill(3),
    ...Array<number>(n(spec.rhombuses)).fill(2),
    ...Array<number>(n(spec.triangles)).fill(1),
  ];
  const fills: Record<number, string> = { 3: c.blockRed, 2: c.blockBlue, 1: c.blockGreen };
  const paint = usePaintIds('light');
  // K–2 blocks carry no letters: the fill shows the kind of block.
  const letters: Record<number, string> = rep.early
    ? { 3: '', 2: '', 1: '' }
    : {
        3: rep.variable(spec.trapezoids).symbol,
        2: rep.variable(spec.rhombuses).symbol,
        1: rep.variable(spec.triangles).symbol,
      };
  const ids = [spec.trapezoids, spec.rhombuses, spec.triangles];

  /** One block: matte fill, a soft light from above, a 1 px lighter bevel and a thin seam. */
  const block = (pts: Pt[], k: number, key: string | number, opacity = 1) => (
    <G key={key} opacity={opacity}>
      <Polygon points={join(pts)} fill={fills[k]} />
      <Polygon points={join(pts)} fill={url(paint.light)} />
      <Polygon
        points={join(inset(pts, 2.2))}
        fill="none"
        stroke={c.edgeLight}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <Polygon
        points={join(pts)}
        fill="none"
        stroke={c.chartInk}
        strokeOpacity={0.7}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </G>
  );

  return (
    <View>
      <Canvas aspect={(w) => (2 * Math.min(112, w * 0.3) + 26 + TRAY_H) / w}>
        {({ w, h }) => {
          const r = Math.min(112, w * 0.3);
          const cx = w / 2;
          const cy = r + 12;
          const v = (i: number): Pt => {
            const t = (Math.PI / 3) * i - Math.PI / 2;
            return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
          };
          const hex = Array.from({ length: 6 }, (_, i) => v(i));
          let at = 0;
          const shapes = blocks.map((k, j) => {
            const pts: Pt[] = [[cx, cy], ...Array.from({ length: k + 1 }, (_, i) => v(at + i))];
            // The label sits in the middle of the block's slices, 55% of the way out.
            const mid = (Math.PI / 3) * (at + k / 2) - Math.PI / 2;
            const lx = cx + r * 0.55 * Math.cos(mid);
            const ly = cy + r * 0.55 * Math.sin(mid);
            at += k;
            // Past the whole hexagon: too many blocks (drawn faded, the formulas say why).
            const over = at > 6;
            return (
              <G key={j}>
                {block(pts, k, 'b', over ? 0.3 : 1)}
                {letters[k] ? (
                  <ChartText
                    x={lx}
                    y={ly + 6}
                    fontSize={chart.value}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={c.onBlock}
                  >
                    {letters[k]}
                  </ChartText>
                ) : null}
              </G>
            );
          });
          const empty = Array.from({ length: Math.max(0, 6 - at) }, (_, i) => (
            <Polygon
              key={`e${i}`}
              points={join([[cx, cy], v(at + i), v(at + i + 1)])}
              fill="none"
              stroke={c.chartGrid}
              strokeDasharray={chart.dashFine}
            />
          ));

          // The tray: one of each block, with how many the hexagon uses.
          const ty = h - TRAY_H / 2 - 4;
          const tray = [3, 2, 1].map((k, i) => {
            const x = w / 2 + (i - 1) * Math.min(110, w / 3.2);
            // Each block standing on its long side, the way it sits in a tray.
            const s = TRAY_R;
            const hh = (s * Math.sqrt(3)) / 2;
            const shape: Pt[] =
              k === 3
                ? [
                    [-s, hh / 2],
                    [s, hh / 2],
                    [s / 2, -hh / 2],
                    [-s / 2, -hh / 2],
                  ]
                : k === 2
                  ? [
                      [-s * 0.75, hh / 2],
                      [s * 0.25, hh / 2],
                      [s * 0.75, -hh / 2],
                      [-s * 0.25, -hh / 2],
                    ]
                  : [
                      [-s / 2, hh / 2],
                      [s / 2, hh / 2],
                      [0, -hh / 2],
                    ];
            const pts = shape.map(([px, py]) => [x - 6 + px, ty + 2 + py] as Pt);
            const count = n(ids[i]!);
            // The count badge at the block's top right.
            const bx = x - 6 + (k === 3 ? s : k === 2 ? s * 0.75 : s / 2) + 10;
            return (
              <G key={k}>
                {block(pts, k, 'p', count > 0 ? 1 : 0.4)}
                <Circle
                  cx={bx}
                  cy={ty - 14}
                  r={11}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                />
                <ChartText
                  x={bx}
                  y={ty - 14 + chart.value * 0.36}
                  textAnchor="middle"
                  fontSize={chart.value}
                  fontWeight="800"
                >
                  {rep.known(ids[i]!) ? String(count) : '?'}
                </ChartText>
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} strength={0.45} />
              </Defs>
              {/* The blocks' shadow on the table, then the dashed slot they fill. */}
              <Polygon
                points={join(hex.map(([x, y]) => [x + 2, y + 4] as Pt))}
                fill={c.shadow}
                opacity={at > 0 ? 1 : 0}
              />
              <Polygon
                points={join(hex)}
                fill={c.chartSurface}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
                strokeLinejoin="round"
              />
              {empty}
              {shapes}
              {tray}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {ids.map((id) => nowrap(`${rep.variable(id).name}: ${rep.label(id)}`)).join('   ·   ')}
      </Caption>
      <Steppers
        calc={calc}
        // Changing a block lets the triangles take up the difference (the hexagon stays full);
        // changing the triangles lets the trapezoids stay and the rhombuses change.
        items={[
          { var: spec.trapezoids, steps: [1], pin: [spec.rhombuses] },
          { var: spec.rhombuses, steps: [1], pin: [spec.trapezoids] },
          { var: spec.triangles, steps: [1], pin: [spec.trapezoids] },
        ]}
      />
    </View>
  );
}
