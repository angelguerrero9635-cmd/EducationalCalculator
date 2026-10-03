/**
 * Explore figure `orthographic` (HC169, `typesHe4l.ts` OrthoScene): one stepped block with a
 * hole through its base, drawn as engineering graphics are: in a glass box, the box unfolded,
 * the three views (third or first angle) with one lit, hidden edges dashed, centre lines in
 * long-short dashes, and the isometric view on its 120° axes. The views are flat line work;
 * the isometric block has flat shaded faces, lit from the top left.
 */
import type { ReactNode } from 'react';
import Svg, { Circle, G, Line, Polygon, Rect } from 'react-native-svg';

import type { OrthoScene } from '@/data/modules/typesHe4l';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

const H = 290;
/** The block, in mm: a base 60 × 40 × 15, a step 30 × 40 × 20 on its left, a Ø12 hole. */
const B = { w: 60, d: 40, h: 15, stepW: 30, top: 35, hx: 45, hy: 20, hr: 6 };
/** Line styles: visible thick, hidden dashed, centre long-short. */
const CENTER_DASH = '12 3 3 3';
const HIDDEN_DASH = '5 3';

type Seg = [number, number, number, number];
interface View {
  /** Outline and visible edges, hidden edges, centre lines, circles (cx, cy, r), size. */
  visible: Seg[];
  hidden: Seg[];
  center: Seg[];
  circles: [number, number, number][];
  w: number;
  h: number;
}

/** The three views in view coordinates (x right, y down from the view's top left). */
function views(angle: 'third' | 'first'): { front: View; top: View; right: View } {
  const { w, d, h, stepW, top, hx, hy, hr } = B;
  // Front: x across, height up (y = top − z).
  const fz = (z: number) => top - z;
  const front: View = {
    visible: [
      [0, fz(0), w, fz(0)],
      [w, fz(0), w, fz(h)],
      [w, fz(h), stepW, fz(h)],
      [stepW, fz(h), stepW, fz(top)],
      [stepW, fz(top), 0, fz(top)],
      [0, fz(top), 0, fz(0)],
    ],
    hidden: [
      [hx - hr, fz(0), hx - hr, fz(h)],
      [hx + hr, fz(0), hx + hr, fz(h)],
    ],
    center: [[hx, fz(0) + 4, hx, fz(h) - 4]],
    circles: [],
    w,
    h: top,
  };
  // Top: x across, depth; third angle puts the front edge (y = 0) at the bottom of the view.
  const ty = (y: number) => (angle === 'third' ? d - y : y);
  const topV: View = {
    visible: [
      [0, 0, w, 0],
      [w, 0, w, d],
      [w, d, 0, d],
      [0, d, 0, 0],
      [stepW, 0, stepW, d],
    ],
    hidden: [],
    center: [
      [hx - hr - 4, ty(hy), hx + hr + 4, ty(hy)],
      [hx, ty(hy) - hr - 4, hx, ty(hy) + hr + 4],
    ],
    circles: [[hx, ty(hy), hr]],
    w,
    h: d,
  };
  // Right side: depth across (the front edge toward the front view), height up.
  const ry = (y: number) => (angle === 'third' ? y : d - y);
  const right: View = {
    visible: [
      [0, fz(0), d, fz(0)],
      [d, fz(0), d, fz(top)],
      [d, fz(top), 0, fz(top)],
      [0, fz(top), 0, fz(0)],
      [0, fz(h), d, fz(h)],
    ],
    hidden: [
      [ry(hy - hr), fz(0), ry(hy - hr), fz(h)],
      [ry(hy + hr), fz(0), ry(hy + hr), fz(h)],
    ],
    center: [[ry(hy), fz(0) + 4, ry(hy), fz(h) - 4]],
    circles: [],
    w: d,
    h: top,
  };
  return { front, top: topV, right };
}

/** Isometric: x down-right, depth up-right, height up (screen units of mm). */
const iso = (x: number, y: number, z: number): [number, number] => [
  (x + y) * Math.cos(Math.PI / 6),
  (x - y) * 0.5 - z,
];

export function OrthographicFigure({ scene }: { scene: OrthoScene }) {
  const c = usePalette();
  const angle = scene.angle ?? 'third';
  const v = scene.view;
  return (
    <Canvas aspect={(w) => H / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          {v === 'box' || v === 'isometric' ? isometric(w, h) : threeViews(w, h)}
        </Svg>
      )}
    </Canvas>
  );

  function drawView(
    view: View,
    ox: number,
    oy: number,
    s: number,
    lit: boolean,
    key: string,
  ): ReactNode {
    const fade = v === 'front' || v === 'top' || v === 'right' ? (lit ? 1 : 0.35) : 1;
    const X = (x: number) => ox + x * s;
    const Y = (y: number) => oy + y * s;
    const hiddenLit = v === 'hidden';
    const centerLit = v === 'center';
    return (
      <G key={key} opacity={fade}>
        {lit && (v === 'front' || v === 'top' || v === 'right') ? (
          <Rect
            x={X(0) - 8}
            y={Y(0) - 8}
            width={view.w * s + 16}
            height={view.h * s + 16}
            rx={6}
            fill={c.he4lViewLit}
          />
        ) : null}
        {view.visible.map(([x1, y1, x2, y2], i) => (
          <Line
            key={`v${i}`}
            x1={X(x1)}
            y1={Y(y1)}
            x2={X(x2)}
            y2={Y(y2)}
            stroke={c.chartInk}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        ))}
        {view.circles.map(([cx, cy, r], i) => (
          <Circle
            key={`o${i}`}
            cx={X(cx)}
            cy={Y(cy)}
            r={r * s}
            fill="none"
            stroke={c.chartInk}
            strokeWidth={2.2}
          />
        ))}
        {view.hidden.map(([x1, y1, x2, y2], i) => (
          <Line
            key={`h${i}`}
            x1={X(x1)}
            y1={Y(y1)}
            x2={X(x2)}
            y2={Y(y2)}
            stroke={hiddenLit ? c.he4lHidden : c.chartInk}
            strokeWidth={hiddenLit ? 2.2 : 1.3}
            strokeDasharray={HIDDEN_DASH}
          />
        ))}
        {view.center.map(([x1, y1, x2, y2], i) => (
          <Line
            key={`c${i}`}
            x1={X(x1)}
            y1={Y(y1)}
            x2={X(x2)}
            y2={Y(y2)}
            stroke={centerLit ? c.he4lCenter : c.chartMuted}
            strokeWidth={centerLit ? 1.8 : 1}
            strokeDasharray={CENTER_DASH}
          />
        ))}
      </G>
    );
  }

  function threeViews(w: number, h: number): ReactNode {
    const { front, top, right } = views(angle);
    const gap = 14;
    const totalW = front.w + gap + right.w;
    const totalH = top.h + gap + front.h;
    const s = Math.min((w - 40) / totalW, (h - 62) / totalH);
    const ox = (w - totalW * s) / 2;
    const oy = 28;
    // Third angle: top above the front, right view to the right. First: top below, right left.
    const third = angle === 'third';
    const fx = third ? ox : ox + (right.w + gap) * s;
    const fy = third ? oy + (top.h + gap) * s : oy;
    const tx = fx;
    const tyy = third ? oy : oy + (front.h + gap) * s;
    const rx = third ? fx + (front.w + gap) * s : ox;
    const ry = fy;
    const label = (x: number, y: number, text: string, lit: boolean) => (
      <ChartText
        x={x}
        y={y}
        textAnchor="middle"
        fontWeight="700"
        fill={lit ? c.he4lViewInk : c.chartMuted}
        halo
      >
        {text}
      </ChartText>
    );
    // Projection lines: the front's widths up (or down) to the top view, its heights across.
    const proj: Seg[] = [
      ...[0, B.stepW, B.hx, B.w].map((x): Seg => [
        fx + x * s,
        third ? fy - 4 : fy + front.h * s + 4,
        fx + x * s,
        third ? tyy + top.h * s + 4 : tyy - 4,
      ]),
      ...[0, B.top - B.h, B.top].map((y): Seg => [
        third ? fx + front.w * s + 4 : rx + right.w * s + 4,
        fy + y * s,
        third ? rx - 4 : fx - 4,
        fy + y * s,
      ]),
    ];
    const hinge = v === 'unfold';
    return (
      <G>
        {proj.map(([x1, y1, x2, y2], i) => (
          <Line
            key={`p${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={c.chartGrid}
            strokeWidth={1}
          />
        ))}
        {hinge ? (
          <G>
            {/* The glass box opened flat: each pane's edge, the hinges dashed. */}
            {[
              [fx - 8, fy - 8, front.w * s + 16, front.h * s + 16],
              [tx - 8, tyy - 8, top.w * s + 16, top.h * s + 16],
              [rx - 8, ry - 8, right.w * s + 16, right.h * s + 16],
            ].map(([x, y, ww, hh], i) => (
              <Rect
                key={`g${i}`}
                x={x}
                y={y}
                width={ww}
                height={hh}
                fill={c.glass}
                opacity={0.5}
                stroke={c.glassEdge}
                strokeWidth={1.2}
              />
            ))}
            <Line
              x1={fx - 8}
              y1={third ? fy - gap * s * 0.5 : fy + front.h * s + gap * s * 0.5}
              x2={fx + front.w * s + 8}
              y2={third ? fy - gap * s * 0.5 : fy + front.h * s + gap * s * 0.5}
              stroke={c.he4lHinge}
              strokeWidth={2}
              strokeDasharray={chart.dash}
            />
            <Line
              x1={third ? fx + front.w * s + (gap * s) / 2 : fx - (gap * s) / 2}
              y1={fy - 8}
              x2={third ? fx + front.w * s + (gap * s) / 2 : fx - (gap * s) / 2}
              y2={fy + front.h * s + 8}
              stroke={c.he4lHinge}
              strokeWidth={2}
              strokeDasharray={chart.dash}
            />
          </G>
        ) : null}
        {drawView(front, fx, fy, s, v === 'front', 'front')}
        {drawView(top, tx, tyy, s, v === 'top', 'top')}
        {drawView(right, rx, ry, s, v === 'right', 'right')}
        {label(fx + (front.w * s) / 2, fy + front.h * s + 22, 'FRONT', v === 'front')}
        {label(tx + (top.w * s) / 2, third ? tyy - 12 : tyy + top.h * s + 22, 'TOP', v === 'top')}
        {label(rx + (right.w * s) / 2, ry + right.h * s + 22, 'RIGHT SIDE', v === 'right')}
        <ChartText x={w - 6} y={14} textAnchor="end" fill={c.chartMuted}>
          {third ? 'third angle' : 'first angle'}
        </ChartText>
      </G>
    );
  }

  function isometric(w: number, h: number): ReactNode {
    const { w: W, d: D, h: Hb, stepW, top, hx, hy, hr } = B;
    const pad = v === 'box' ? 6 : 0;
    const corners: [number, number, number][] = [
      [-pad, -pad, -pad],
      [W + pad, D + pad, top + pad],
      [W + pad, -pad, -pad],
      [-pad, D + pad, top + pad],
      [-pad, -pad, top + pad],
      [W + pad, D + pad, -pad],
    ];
    const pts = corners.map(([x, y, z]) => iso(x, y, z));
    const minU = Math.min(...pts.map((p) => p[0]));
    const maxU = Math.max(...pts.map((p) => p[0]));
    const minV = Math.min(...pts.map((p) => p[1]));
    const maxV = Math.max(...pts.map((p) => p[1]));
    const s = Math.min((w - 40) / (maxU - minU), (h - 50) / (maxV - minV));
    const ox = (w - (maxU - minU) * s) / 2 - minU * s;
    const oy = 20 - minV * s;
    const P = (x: number, y: number, z: number) => {
      const [u, vv] = iso(x, y, z);
      return `${(ox + u * s).toFixed(1)},${(oy + vv * s).toFixed(1)}`;
    };
    const poly = (ps: [number, number, number][]) => ps.map((p) => P(...p)).join(' ');
    const face = (ps: [number, number, number][], fill: string, key: string) => (
      <Polygon
        key={key}
        points={poly(ps)}
        fill={fill}
        stroke={c.chartInk}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    );
    const hole = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * 2 * Math.PI;
      return P(hx + hr * Math.cos(a), hy + hr * Math.sin(a), Hb);
    }).join(' ');
    // The axes start at the near bottom corner (W, 0, 0) and run along its three edges.
    const [u0, v0] = iso(W, 0, 0);
    const axisEnd = (dx: number, dy: number, dz: number, len: number) => {
      const [u, vv] = iso(W + dx * len, dy * len, dz * len);
      return { x: ox + u * s, y: oy + vv * s, x0: ox + u0 * s, y0: oy + v0 * s };
    };
    const box = v === 'box';
    const glass = (ps: [number, number, number][], key: string) => (
      <Polygon
        key={key}
        points={poly(ps)}
        fill={c.glass}
        opacity={0.35}
        stroke={c.glassEdge}
        strokeWidth={1.2}
      />
    );
    const e = pad;
    return (
      <G>
        {box ? (
          <G>
            {/* The back panes of the glass box. */}
            {glass(
              [
                [-e, D + e, -e],
                [W + e, D + e, -e],
                [W + e, D + e, top + e],
                [-e, D + e, top + e],
              ],
              'gb',
            )}
            {glass(
              [
                [-e, -e, -e],
                [-e, D + e, -e],
                [-e, D + e, top + e],
                [-e, -e, top + e],
              ],
              'gl',
            )}
          </G>
        ) : null}
        {/* The block: the base's top (with the hole), the step's top and side, then the fronts. */}
        {face(
          [
            [stepW, 0, Hb],
            [W, 0, Hb],
            [W, D, Hb],
            [stepW, D, Hb],
          ],
          c.he4lIsoTop,
          'bt',
        )}
        <Polygon points={hole} fill={c.he4lIsoHole} stroke={c.chartInk} strokeWidth={1.4} />
        {face(
          [
            [0, 0, top],
            [stepW, 0, top],
            [stepW, D, top],
            [0, D, top],
          ],
          c.he4lIsoTop,
          'st',
        )}
        {face(
          [
            [stepW, 0, Hb],
            [stepW, D, Hb],
            [stepW, D, top],
            [stepW, 0, top],
          ],
          c.he4lIsoSide,
          'ss',
        )}
        {face(
          [
            [W, 0, 0],
            [W, D, 0],
            [W, D, Hb],
            [W, 0, Hb],
          ],
          c.he4lIsoSide,
          'bs',
        )}
        {face(
          [
            [0, 0, 0],
            [W, 0, 0],
            [W, 0, Hb],
            [stepW, 0, Hb],
            [stepW, 0, top],
            [0, 0, top],
          ],
          c.he4lIsoFront,
          'fr',
        )}
        {box ? (
          <G>
            {/* The front, top and right panes: each view is what shows through one. */}
            {glass(
              [
                [-e, -e, -e],
                [W + e, -e, -e],
                [W + e, -e, top + e],
                [-e, -e, top + e],
              ],
              'gf',
            )}
            {glass(
              [
                [-e, -e, top + e],
                [W + e, -e, top + e],
                [W + e, D + e, top + e],
                [-e, D + e, top + e],
              ],
              'gt',
            )}
            {glass(
              [
                [W + e, -e, -e],
                [W + e, D + e, -e],
                [W + e, D + e, top + e],
                [W + e, -e, top + e],
              ],
              'gr',
            )}
            <ChartText x={w / 2} y={h - 8} textAnchor="middle" fill={c.chartMuted}>
              front pane, top pane, right pane
            </ChartText>
          </G>
        ) : (
          <G>
            {/* The isometric axes from the near bottom corner, 120° apart. */}
            {(
              [
                [-1, 0, 0, 'x'],
                [0, 1, 0, 'y'],
                [0, 0, 1, 'z'],
              ] as const
            ).map(([dx, dy, dz, name]) => {
              const a = axisEnd(dx, dy, dz, dz ? 50 : dx ? 74 : 54);
              const b = axisEnd(dx, dy, dz, 0);
              return (
                <G key={name}>
                  <Line
                    x1={b.x0}
                    y1={b.y0}
                    x2={a.x}
                    y2={a.y}
                    stroke={c.he4lCenter}
                    strokeWidth={1.4}
                    strokeDasharray={chart.dash}
                  />
                  <Circle cx={a.x} cy={a.y} r={2.5} fill={c.he4lCenter} />
                </G>
              );
            })}
            <ChartText x={w - 6} y={h - 8} textAnchor="end" fill={c.he4lCenter} fontWeight="700">
              axes 120° apart
            </ChartText>
          </G>
        )}
      </G>
    );
  }
}
