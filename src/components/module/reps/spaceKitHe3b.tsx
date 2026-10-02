/**
 * HC46, HC47 (college round 3, group B): the `vectorDiagram` `space` camera as a kit — the view
 * from above and to one side (`viewOf`), fitted to every point the drawing holds and held while
 * the turn handle is dragged, the turn handle, labels on chips with italic letters and
 * subscripts (f_x) kept apart, and the x, y, z axes through the origin over a floor grid. Flat.
 */
import { type ReactElement, useRef, useState } from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText, DragHandle } from './common';
import { arrowHead } from './graphKit';
import { Ital, textW } from './he1dText';
import { niceStep } from './hsdGrid';
import { short } from './hsdKit';
import { type V3, viewOf } from './vectorSpace';

export const TILT_HE3B = 22;

interface Fit {
  k: number;
  ox: number;
  oy: number;
}

/** A camera: screen points of scene points, and their depth (toward the reader). */
export interface Cam {
  P: (p: V3) => { x: number; y: number };
  depth: (p: V3) => number;
  turn: number;
}

/** The turn state, the fit that holds while turning, and the handle. */
export function useSpaceTurn(start = 32) {
  const [turn, setTurn] = useState(start);
  const begin = useRef(start);
  const [held, setHeld] = useState<Fit | null>(null);
  const next = useRef<Fit | null>(null);
  return {
    turn,
    /** The camera for a W × H canvas fitted to `pts` (held while the view is turned). */
    camera(W: number, H: number, pts: V3[], bottom = 18, tilt = TILT_HE3B): Cam {
      const fit = (t: number): Fit => {
        const ps = pts.map(viewOf(t, tilt));
        const xs = ps.map((p) => p.x);
        const ys = ps.map((p) => p.y);
        const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
        const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
        const m = 26;
        const k = Math.min((W - 2 * m) / (x1 - x0 || 1), (H - 2 * m - bottom) / (y1 - y0 || 1));
        return {
          k,
          ox: W / 2 - ((x0 + x1) / 2) * k,
          oy: m + y1 * k + (H - 2 * m - bottom - (y1 - y0) * k) / 2,
        };
      };
      const f = held ?? fit(turn);
      next.current = f;
      const view = viewOf(turn, tilt);
      return {
        P: (p) => {
          const q = view(p);
          return { x: f.ox + q.x * f.k, y: f.oy - q.y * f.k };
        },
        depth: (p) => view(p).depth,
        turn,
      };
    },
    /** The turn handle (after the Svg; its track is `TurnTrack`). */
    handle(W: number, H: number) {
      return (
        <DragHandle
          testID="drag-turn"
          x={W - 30}
          y={H - 22}
          label="the view (turn it about z)"
          onStart={() => {
            begin.current = turn;
            setHeld(next.current);
          }}
          onMove={(dx) => setTurn(begin.current - dx * 0.6)}
          onEnd={() => setHeld(null)}
        />
      );
    },
  };
}

/** The turn handle's track: an arc with arrows both ways round it (inside the Svg). */
export function TurnTrack({ W, H }: { W: number; H: number }) {
  const c = usePalette();
  return (
    <G>
      <Path
        d={`M ${W - 52} ${H - 14} A 28 10 0 0 0 ${W - 8} ${H - 14}`}
        stroke={c.chartMuted}
        strokeWidth={1.5}
        fill="none"
      />
      <Path d={arrowHead(W - 52, H - 14, -1, 1.2, 7)} fill={c.chartMuted} />
      <Path d={arrowHead(W - 8, H - 14, 1, 1.2, 7)} fill={c.chartMuted} />
    </G>
  );
}

/** The box a chip takes. */
export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const plain = (s: string) => s.replace(/_/g, '');

/** A label on a card-coloured chip: lone letters italic, "f_x" with x lowered. */
export function SubChip({
  x,
  y,
  text,
  color,
  anchor = 'middle',
  size = chart.label,
  opacity = 1,
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  opacity?: number;
}) {
  const c = usePalette();
  const tw = textW(plain(text), size) + 6;
  const left = anchor === 'start' ? x - 3 : anchor === 'end' ? x - tw + 3 : x - tw / 2;
  return (
    <G opacity={opacity}>
      <Rect
        x={left}
        y={y - size + 1}
        width={tw}
        height={size + 5}
        rx={3}
        fill={c.card}
        opacity={0.9}
      />
      <ChartText
        x={left + tw / 2}
        y={y}
        textAnchor="middle"
        fontSize={size}
        fontWeight="700"
        fill={color}
      >
        <Ital text={text} size={size} />
      </ChartText>
    </G>
  );
}

/**
 * Labels kept apart and inside a W × H canvas: each tries a few spots round its anchor, away
 * along `out`, and takes the one that overlaps least. `block` reserves a box (a dot, a handle).
 */
export function labeler(W: number, H: number) {
  const placed: Box[] = [];
  const boxOf = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end') => {
    const tw = textW(plain(text), chart.label) + 6;
    const left = anchor === 'start' ? x - 3 : anchor === 'end' ? x - tw + 3 : x - tw / 2;
    return { left, right: left + tw, top: y - chart.label + 1, bottom: y + 5 };
  };
  const overlap = (a: Box, b: Box) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return {
    placed,
    block(b: Box) {
      placed.push(b);
    },
    label(
      at: { x: number; y: number },
      out: { x: number; y: number },
      text: string,
      color: string,
      key: string,
      gap = 12,
    ): ReactElement {
      const len = Math.hypot(out.x, out.y) || 1;
      const [ux, uy] = [out.x / len, out.y / len];
      const tries = [0, 45, -45, 90, -90, 135, -135, 180].flatMap((deg) =>
        [1, 1.8].map((far) => {
          const a = (deg * Math.PI) / 180;
          const dx = ux * Math.cos(a) - uy * Math.sin(a);
          const dy = ux * Math.sin(a) + uy * Math.cos(a);
          const anchor: 'start' | 'middle' | 'end' =
            dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
          const x = at.x + dx * gap * far;
          const y = at.y + dy * (gap + 2) * far + 4;
          const box = boxOf(x, y, text, anchor);
          const clash = placed.reduce((n, b) => n + overlap(b, box), 0);
          const outside =
            Math.max(0, -box.left) +
            Math.max(0, box.right - W) +
            Math.max(0, -box.top) +
            Math.max(0, box.bottom - (H - 2));
          return {
            x,
            y,
            anchor,
            box,
            score: clash * 3 + outside * 60 + Math.abs(deg) * 0.4 + (far - 1) * 30,
          };
        }),
      );
      const best = tries.reduce((a, b) => (b.score < a.score ? b : a));
      placed.push(best.box);
      return (
        <SubChip key={key} x={best.x} y={best.y} text={text} color={color} anchor={best.anchor} />
      );
    },
  };
}

/** The axes' lengths and the floor's corner for a set of points (axes through the origin). */
export function axesPlan(pts: V3[]) {
  const reach = Math.max(1, ...pts.flatMap((p) => p.map(Math.abs)));
  const step = niceStep(reach / 5);
  const Ls = [0, 1, 2].map((i) =>
    Math.max(2 * step, Math.ceil((Math.max(0, ...pts.map((p) => p[i]!)) * 1.12) / step) * step),
  );
  const lows = [0, 1, 2].map((i) => Math.min(0, ...pts.map((p) => p[i]!)));
  const floorLo = lows.map((x) => Math.floor(x / step) * step);
  const ends: V3[] = [
    [Ls[0]!, 0, 0],
    [0, Ls[1]!, 0],
    [0, 0, Ls[2]!],
  ];
  return {
    step,
    Ls,
    floorLo,
    ends,
    /** Every point the fit must hold. */
    all: [...pts, ...ends, [floorLo[0]!, floorLo[1]!, floorLo[2]!] as V3],
  };
}

/** The floor grid and the x, y, z axes with their arrows, ticks and last tick's value. */
export function SpaceAxes({
  plan,
  cam,
  lab,
}: {
  plan: ReturnType<typeof axesPlan>;
  cam: Cam;
  lab: ReturnType<typeof labeler>;
}) {
  const c = usePalette();
  const { P } = cam;
  const { step, Ls, floorLo, ends } = plan;
  const O = P([0, 0, 0]);
  const seg = (a: V3, b: V3, key: string) => {
    const [p, q] = [P(a), P(b)];
    return (
      <Line key={key} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={c.chartGrid} strokeWidth={1} />
    );
  };
  const floor: ReactElement[] = [];
  const [Lx, Ly] = [Ls[0]! - step, Ls[1]! - step];
  for (let x = floorLo[0]!; x <= Lx + 1e-9; x += step)
    floor.push(seg([x, floorLo[1]!, 0], [x, Ly, 0], `fx${x}`));
  for (let y = floorLo[1]!; y <= Ly + 1e-9; y += step)
    floor.push(seg([floorLo[0]!, y, 0], [Lx, y, 0], `fy${y}`));
  const axes = (['x', 'y', 'z'] as const).map((name, i) => {
    const end = ends[i]!;
    const back: V3 = [0, 0, 0];
    back[i] = floorLo[i]! < 0 ? floorLo[i]! : -step * 0.6;
    const [p, q] = [P(back), P(end)];
    const ticks: ReactElement[] = [];
    for (let t = step; t < Ls[i]! - 1e-9; t += step) {
      const at: V3 = [0, 0, 0];
      at[i] = t;
      const m = P(at);
      ticks.push(<Circle key={`t${name}${t}`} cx={m.x} cy={m.y} r={2} fill={c.chartInk} />);
    }
    const tip = { x: q.x - O.x, y: q.y - O.y };
    const last: V3 = [0, 0, 0];
    last[i] = Ls[i]! - step;
    return (
      <G key={name}>
        <Line
          x1={p.x}
          y1={p.y}
          x2={O.x}
          y2={O.y}
          stroke={c.chartMuted}
          strokeWidth={1}
          strokeDasharray={chart.dashFine}
        />
        <Line
          x1={O.x}
          y1={O.y}
          x2={q.x}
          y2={q.y}
          stroke={c.chartInk}
          strokeWidth={chart.strokeLight}
        />
        <Path d={arrowHead(q.x, q.y, q.x - O.x, q.y - O.y, 9)} fill={c.chartInk} />
        {ticks}
        {lab.label(q, tip, name, c.chartInk, `n${name}`)}
        {Ls[i]! - step > 0
          ? lab.label(
              P(last),
              { x: tip.y, y: -tip.x },
              short(Ls[i]! - step),
              c.chartMuted,
              `v${name}`,
            )
          : null}
      </G>
    );
  });
  return (
    <G>
      {floor}
      {axes}
    </G>
  );
}

/** A polygon's path through screen points. */
export const polyPath = (ps: { x: number; y: number }[]) =>
  `${ps.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} Z`;
/** An open path through screen points. */
export const linePath = (ps: { x: number; y: number }[]) =>
  ps.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
