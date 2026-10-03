/**
 * Explore figure `symmetryElements` (HC113, `typesHe4d.ts`): a molecule in 3-D, its atoms lit
 * balls in the classroom colours, and one symmetry element drawn flat over it: an axis Cₙ
 * (dashed, a turn arrow round it), a mirror plane σ (a clear pane), the centre i (the atom pairs
 * it swaps joined through it) or an improper axis Sₙ (the axis and a pane across it).
 */
import type { ReactElement } from 'react';
import Svg, { Circle, Defs, G, Line, Path, Polygon } from 'react-native-svg';

import type { SymmetryScene } from '@/data/modules/typesHe4d';
import { chart, usePalette } from '@/theme';

import { atomRadius } from '../reps/chem';
import { Canvas, ChartText } from '../reps/common';
import { AtomBall, useAtomPaint } from '../reps/MoleculeArt';
import {
  cross,
  imageOf,
  norm,
  SYMMETRY_MOLECULES,
  view,
  type SymElement,
  type Vec,
} from '../reps/symmetryMath';

const H = 280;

/** Two unit vectors across a unit direction d. */
function across(d: Vec): [Vec, Vec] {
  const t: Vec = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(d, t));
  return [u, norm(cross(d, u))];
}

/** What the element does, in a few words. */
export function elementDoes(e: SymElement): string {
  switch (e.kind) {
    case 'C':
      return e.n ? `${e.name}: a turn of ${360 / e.n}°` : `${e.name}: a turn of any angle`;
    case 'σ':
      return `${e.name}: a reflection in the pane`;
    case 'i':
      return 'i: every atom through the centre to the far side';
    default:
      return `${e.name}: a turn of ${360 / e.n!}°, then a reflection across`;
  }
}

export function SymmetryFigure({ scene }: { scene: SymmetryScene }) {
  const c = usePalette();
  const paint = useAtomPaint();
  const m3 = SYMMETRY_MOLECULES[scene.molecule]!;
  const e = scene.element ? m3.elements.find((x) => x.id === scene.element) : undefined;
  const reach = Math.max(...m3.atoms.map((a) => Math.hypot(...a.p))) + 0.45;
  return (
    <Canvas aspect={(w) => H / w}>
      {({ w, h }) => {
        // One scale for the molecule and its element, the reach of both inside the canvas.
        const top = 28;
        const bottom = h - 30;
        const k = Math.min((w - 60) / (2.3 * reach), (bottom - top - 12) / (2.3 * reach));
        const cx = w / 2;
        const cy = (top + bottom) / 2;
        // The molecule's centre (its central atom, or the middle of a chain) at the canvas centre.
        const [ox, oy] = [cx, cy];
        const P = (v: Vec) => {
          const p = view(v);
          return { x: ox + p.x * k, y: oy + p.y * k, z: p.z };
        };
        const O = P([0, 0, 0]);
        const under: ReactElement[] = [];
        const parts: ReactElement[] = [];
        let label: { x: number; y: number } | undefined;
        if (e && (e.kind === 'C' || e.kind === 'S')) {
          const d = norm(e.axis!);
          const a = P([d[0] * reach * 1.15, d[1] * reach * 1.15, d[2] * reach * 1.15]);
          const b = P([-d[0] * reach * 1.15, -d[1] * reach * 1.15, -d[2] * reach * 1.15]);
          const hi = a.y <= b.y ? a : b;
          label = { x: hi.x, y: hi.y };
          under.push(
            <Line
              key="axis"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={c.he4dAxis}
              strokeWidth={2.5}
              strokeDasharray={chart.dash}
            />,
          );
          // The turn: an arc round the axis near its upper end, an arrowhead at its end.
          const [u, v] = across(d);
          const s = hi === a ? 1 : -1;
          const at: Vec = [
            d[0] * reach * 0.98 * s,
            d[1] * reach * 0.98 * s,
            d[2] * reach * 0.98 * s,
          ];
          const pts = Array.from({ length: 25 }, (_, i) => {
            const t = (i / 24) * 1.6 * Math.PI;
            const r = 0.32;
            return P([
              at[0] + r * (Math.cos(t) * u[0] + Math.sin(t) * v[0]),
              at[1] + r * (Math.cos(t) * u[1] + Math.sin(t) * v[1]),
              at[2] + r * (Math.cos(t) * u[2] + Math.sin(t) * v[2]),
            ]);
          });
          const end = pts[pts.length - 1]!;
          const prev = pts[pts.length - 3]!;
          const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
          parts.push(
            <G key="turn">
              <Path
                d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={c.he4dAxis}
                strokeWidth={2}
              />
              <Path
                d={`M ${end.x + 7 * Math.cos(ang)} ${end.y + 7 * Math.sin(ang)} L ${end.x + 6 * Math.cos(ang + 2.4)} ${end.y + 6 * Math.sin(ang + 2.4)} L ${end.x + 6 * Math.cos(ang - 2.4)} ${end.y + 6 * Math.sin(ang - 2.4)} Z`}
                fill={c.he4dAxis}
              />
            </G>,
          );
        }
        const pane = (n: Vec, size: number, key: string) => {
          const [u, v] = across(norm(n));
          const corners = [
            [1, 1],
            [1, -1],
            [-1, -1],
            [-1, 1],
          ].map(([p, q]) =>
            P([
              size * (p! * u[0] + q! * v[0]),
              size * (p! * u[1] + q! * v[1]),
              size * (p! * u[2] + q! * v[2]),
            ]),
          );
          return {
            el: (
              <Polygon
                key={key}
                points={corners.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={c.he4dPlane}
                fillOpacity={0.22}
                stroke={c.he4dPlane}
                strokeWidth={1.6}
              />
            ),
            corners,
          };
        };
        const behind: ReactElement[] = [];
        if (e && e.kind === 'σ') {
          const p = pane(e.normal!, reach * 0.8, 'pane');
          behind.push(p.el);
          const left = p.corners.reduce((a, b) => (b.y < a.y ? b : a));
          label = { x: left.x, y: left.y };
        }
        if (e && e.kind === 'S') behind.push(pane(e.axis!, reach * 0.6, 'pane').el);
        if (e && e.kind === 'i') {
          const img = imageOf(m3, e);
          m3.atoms.forEach((a, i) => {
            const j = img[i]!;
            if (j > i) {
              const p = P(a.p);
              const q = P(m3.atoms[j]!.p);
              under.push(
                <Line
                  key={`i${i}`}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke={c.he4dInversion}
                  strokeWidth={1.8}
                  strokeDasharray={chart.dashFine}
                />,
              );
            }
          });
          const mid = m3.atoms.find((a) => Math.hypot(...a.p) < 1e-9);
          parts.push(
            mid ? (
              <Circle
                key="centre"
                cx={O.x}
                cy={O.y}
                r={atomRadius(mid.el) * k * 0.6 + 4}
                fill="none"
                stroke={c.he4dInversion}
                strokeWidth={2.5}
                strokeDasharray={chart.dashFine}
              />
            ) : (
              <Circle key="centre" cx={O.x} cy={O.y} r={5} fill={c.he4dInversion} />
            ),
          );
          label = { x: O.x, y: O.y + (mid ? atomRadius(mid.el) * k * 0.6 + 26 : 24) };
        }
        const color =
          e?.kind === 'σ' ? c.he4dPlane : e?.kind === 'i' ? c.he4dInversion : c.he4dAxis;
        const lx = label ? Math.min(w - 24, Math.max(24, label.x)) : 0;
        const ly = label ? Math.min(bottom, Math.max(top + 4, label.y - 6)) : 0;
        return (
          <Svg width={w} height={h}>
            <Defs>{paint.defs}</Defs>
            <ChartText
              x={w / 2}
              y={18}
              textAnchor="middle"
              fontSize={chart.emphasis}
              fontWeight="700"
            >
              {`${m3.formula} · ${m3.group}`}
            </ChartText>
            {behind}
            {under}
            {m3.bonds.map(([i, j, order], n) => {
              const a = P(m3.atoms[i]!.p);
              const b = P(m3.atoms[j]!.p);
              const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
              const [nx, ny] = [-(b.y - a.y) / len, (b.x - a.x) / len];
              const offs = order === 1 ? [0] : order === 2 ? [-3, 3] : [-5, 0, 5];
              return (
                <G key={`b${n}`}>
                  {offs.map((o) => (
                    <Line
                      key={o}
                      x1={a.x + nx * o}
                      y1={a.y + ny * o}
                      x2={b.x + nx * o}
                      y2={b.y + ny * o}
                      stroke={c.atomBond}
                      strokeWidth={order === 1 ? 4 : 2.5}
                      strokeLinecap="round"
                    />
                  ))}
                </G>
              );
            })}
            {m3.atoms
              .map((a, i) => ({ el: a.el, i, ...P(a.p) }))
              .sort((p, q) => p.z - q.z)
              .map((a) => (
                <AtomBall
                  key={`a${a.i}`}
                  el={a.el}
                  cx={a.x}
                  cy={a.y}
                  r={atomRadius(a.el) * k * 0.6}
                  ids={paint.ids}
                />
              ))}
            {parts}
            {e && label ? (
              <ChartText
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize={chart.emphasis}
                fontWeight="700"
                fill={color}
                halo
              >
                {e.name}
              </ChartText>
            ) : null}
            <ChartText
              x={w / 2}
              y={h - 8}
              textAnchor="middle"
              fill={e ? color : c.chartMuted}
              fontWeight="700"
            >
              {e ? elementDoes(e) : m3.name}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
