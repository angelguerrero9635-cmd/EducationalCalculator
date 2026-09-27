/**
 * Explore figures and a card figure for Grade 7–8 chemistry: ball-and-stick molecules (one
 * big with its atoms named, or many in a box as a solid, liquid or gas, before and after an
 * arrow), boxes for the three states with the changes between them, and the periodic table.
 * Molecules are lit balls in the classroom colors; boxes, arrows and the table stay flat.
 */
import type { ReactElement } from 'react';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { MoleculeItem, PhaseChange, Scene } from '@/data/modules/layouts';
import { chart, usePalette } from '@/theme';

import {
  atomRadius,
  atomicNumber,
  elementName,
  extentOf,
  moleculeOf,
  subscript,
  turned,
} from '../reps/chem';
import { Canvas, ChartText, fitLabel } from '../reps/common';
import { arrowHead } from '../reps/graphKit';
import { MoleculeArt, fitScale, useAtomPaint, type AtomIds } from '../reps/MoleculeArt';
import { Ball, usePaintIds, url } from '../reps/paint';
import { TableArt, tableSize } from '../reps/PeriodicTable';

type State = 'solid' | 'liquid' | 'gas';

/** Fixed turns for molecules in a liquid or gas, so a scene always draws the same. */
const TURNS = [0, 35, -50, 90, 20, -25, 140, 65, -80, 110, -15, 50, 170, -120, 75, -60];
const JITTER = [0.1, -0.12, 0.05, 0.14, -0.08, 0.12, -0.14, 0.02, 0.08, -0.1, 0.13, -0.04];

/** Every particle of the items, the kinds taking turns so a mixture is mixed. */
function particles(items: MoleculeItem[]): string[] {
  const left = items.map((i) => Math.max(0, Math.round(i.count ?? 1)));
  const out: string[] = [];
  while (left.some((n) => n > 0)) {
    items.forEach((it, k) => {
      if (left[k]! > 0) {
        out.push(it.formula);
        left[k]!--;
      }
    });
  }
  return out;
}

/** The size (bond lengths) of the biggest molecule among some formulas. */
const unitOf = (formulas: string[]) =>
  Math.max(
    1,
    ...[...new Set(formulas)].map((f) => {
      const [x0, y0, x1, y1] = extentOf(moleculeOf(f));
      return Math.max(x1 - x0, y1 - y0);
    }),
  );

/** The biggest square cell size that gives at least `slots` cells in a bw × bh box. */
function cellFor(slots: number, bw: number, bh: number) {
  for (let s = Math.min(bw, bh); s > 4; s -= 0.5) {
    if (Math.floor(bw / s) * Math.floor(bh / s) >= slots) return s;
  }
  return 4;
}

interface Placed {
  formula: string;
  x: number;
  y: number;
  turn: number;
}

/**
 * Where each particle sits in a box: a solid in rows from the floor, a liquid close and
 * jumbled from the floor, a gas spread over the whole box. The bond length is the one a
 * liquid of `sizeFor` particles would take, so a box before and after match.
 */
function pack(
  formulas: string[],
  state: State | undefined,
  box: { x: number; y: number; w: number; h: number },
  sizeFor = formulas.length,
): { scale: number; placed: Placed[] } {
  const n = formulas.length;
  const u = unitOf(formulas);
  const tight = cellFor(Math.max(1, sizeFor), box.w, box.h);
  const scale = Math.min(26, (tight * 0.86) / u);
  if (state === 'solid' || state === 'liquid') {
    const s = state === 'solid' ? Math.min(tight, u * scale * 1.08) : tight;
    const cols = Math.max(1, Math.floor(box.w / s));
    const x0 = box.x + (box.w - cols * s) / 2;
    return {
      scale,
      placed: formulas.map((formula, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const j = state === 'liquid' ? JITTER[i % JITTER.length]! * s : 0;
        return {
          formula,
          x: x0 + (col + 0.5) * s + j,
          y: box.y + box.h - (row + 0.5) * s - (state === 'liquid' ? j * 0.6 : 0),
          turn: state === 'liquid' ? TURNS[i % TURNS.length]! : 0,
        };
      }),
    };
  }
  // A gas (or no state): slots over the whole box, taken far apart.
  const slots = Math.max(n, Math.ceil(n * (state === 'gas' ? 2.2 : 1.6)));
  const s = cellFor(slots, box.w, box.h);
  const cols = Math.max(1, Math.floor(box.w / s));
  const rows = Math.max(1, Math.floor(box.h / s));
  const total = cols * rows;
  const used = new Set<number>();
  const x0 = box.x + (box.w - cols * s) / 2;
  const y0 = box.y + (box.h - rows * s) / 2;
  return {
    scale: Math.min(scale, (s * 0.9) / u),
    placed: formulas.map((formula, i) => {
      // Across by the golden ratio, down in even steps: spread over the whole box.
      const fx = ((i + 0.5) * 0.618034 + 0.13) % 1;
      const fy = (i + 0.5) / n;
      let k = Math.min(rows - 1, Math.floor(fy * rows)) * cols + Math.floor(fx * cols);
      while (used.has(k)) k = (k + 1) % total;
      used.add(k);
      const j = JITTER[i % JITTER.length]! * s;
      return {
        formula,
        x: x0 + ((k % cols) + 0.5) * s + j,
        y: y0 + (Math.floor(k / cols) + 0.5) * s - j,
        turn: TURNS[i % TURNS.length]!,
      };
    }),
  };
}

/**
 * Particles drawn: molecules, or plain lit balls when there is no formula, each kept inside
 * `bounds`; a moving one trails two short lines.
 */
function Particles({
  placed,
  scale,
  ids,
  ball,
  bounds,
  moving,
}: {
  placed: Placed[];
  scale: number;
  ids: AtomIds;
  ball: string;
  bounds: { x: number; y: number; w: number; h: number };
  moving?: boolean;
}) {
  const c = usePalette();
  return (
    <G>
      {placed.map((p, i) => {
        const m = p.formula ? turned(moleculeOf(p.formula), p.turn) : undefined;
        const [x0, y0, x1, y1] = m ? extentOf(m) : [-0.42, -0.42, 0.42, 0.42];
        const [hw, hh] = [((x1 - x0) / 2) * scale, ((y1 - y0) / 2) * scale];
        const x = Math.min(bounds.x + bounds.w - hw, Math.max(bounds.x + hw, p.x));
        const y = Math.min(bounds.y + bounds.h - hh, Math.max(bounds.y + hh, p.y));
        const a = ((TURNS[(i + 3) % TURNS.length]! + 200) * Math.PI) / 180;
        const r = Math.max(hw, hh);
        return (
          <G key={i}>
            {moving
              ? [-0.3, 0.3].map((d) => (
                  <Line
                    key={d}
                    x1={x + Math.cos(a + d) * (r + 2)}
                    y1={y + Math.sin(a + d) * (r + 2)}
                    x2={x + Math.cos(a + d) * (r + 8)}
                    y2={y + Math.sin(a + d) * (r + 8)}
                    stroke={c.chartMuted}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                  />
                ))
              : null}
            {m ? (
              <MoleculeArt molecule={m} cx={x} cy={y} scale={scale} ids={ids} />
            ) : (
              <Circle
                cx={x}
                cy={y}
                r={scale * 0.42}
                fill={url(ball)}
                stroke={c.chartInk}
                strokeWidth={0.8}
              />
            )}
          </G>
        );
      })}
    </G>
  );
}

/** "3 H₂O, 2 O₂": what a box holds. */
const contents = (items: MoleculeItem[]) =>
  items
    .map((i) => `${(i.count ?? 1) === 1 ? '' : `${i.count} `}${subscript(i.formula)}`)
    .join(', ');

/**
 * Molecules (Grade 7). One molecule alone: drawn big, one atom of each element named with a
 * leader line, the formula under it. Otherwise the molecules in a box, packed as the scene's
 * state, what the box holds under it; with `after`, a second box behind an arrow.
 */
export function MoleculesFigure({ scene }: { scene: NonNullable<Scene['molecules']> }) {
  const c = usePalette();
  const paint = useAtomPaint();
  const ids = usePaintIds('ball');
  const single =
    scene.items.length === 1 && (scene.items[0]!.count ?? 1) === 1 && !scene.state && !scene.after;
  if (single) {
    const formula = scene.items[0]!.formula;
    return (
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const scale = Math.min(70, fitScale(formula, w * 0.5, h - 70));
          const cx = w / 2;
          const cy = (h - 34) / 2 + 6;
          const m = moleculeOf(formula);
          const [x0, y0, x1, y1] = extentOf(m);
          const ox = cx - ((x0 + x1) / 2) * scale;
          const oy = cy - ((y0 + y1) / 2) * scale;
          // One atom of each element named: the one farthest out, its label on a short line
          // in the direction with the most room (clear of the other atoms and labels).
          const balls = m.atoms.map((a) => ({
            x: ox + a.x * scale,
            y: oy + a.y * scale,
            r: atomRadius(a.el) * scale,
          }));
          const taken: { x: number; y: number }[] = [];
          const named = [...new Set(m.atoms.map((a) => a.el))].map((el) => {
            const i = m.atoms
              .map((a, k) => ({ a, k }))
              .filter(({ a }) => a.el === el)
              .reduce((best, cur) =>
                Math.hypot(cur.a.x, cur.a.y) > Math.hypot(best.a.x, best.a.y) + 1e-9 ? cur : best,
              ).k;
            const { x: ax, y: ay, r } = balls[i]!;
            const text = elementName(el);
            const room = (t: number) => {
              const [lx, ly] = [ax + Math.cos(t) * (r + 26), ay + Math.sin(t) * (r + 26)];
              const clearOfBalls = Math.min(
                ...balls.filter((_, k) => k !== i).map((q) => Math.hypot(lx - q.x, ly - q.y) - q.r),
                99,
              );
              const clearOfLabels = Math.min(
                ...taken.map((q) => Math.hypot(lx - q.x, ly - q.y) - 40),
                99,
              );
              const inside = lx > 30 && lx < w - 30 && ly > 12 && ly < h - 40 ? 0 : -50;
              return Math.min(clearOfBalls, clearOfLabels) + inside;
            };
            const t = [-90, -135, -45, 180, 0, 135, 45, 90]
              .map((d) => (d * Math.PI) / 180)
              .reduce((best, cur) => (room(cur) > room(best) + 0.5 ? cur : best));
            const [dx, dy] = [Math.cos(t), Math.sin(t)];
            const [lx, ly] = [ax + dx * (r + 18), ay + dy * (r + 18)];
            taken.push({ x: lx, y: ly });
            const anchor: 'start' | 'middle' | 'end' =
              dx < -0.3 ? 'end' : dx > 0.3 ? 'start' : 'middle';
            return { el, ax, ay, r, dx, dy, lx, ly, text, anchor };
          });
          return (
            <Svg width={w} height={h}>
              <Defs>{paint.defs}</Defs>
              <MoleculeArt formula={formula} cx={cx} cy={cy} scale={scale} ids={paint.ids} />
              {named.map((n) => (
                <G key={n.el}>
                  <Line
                    x1={n.ax + n.dx * (n.r + 3)}
                    y1={n.ay + n.dy * (n.r + 3)}
                    x2={n.lx}
                    y2={n.ly}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                  <ChartText
                    {...fitLabel(
                      n.lx + (n.anchor === 'middle' ? 0 : n.dx > 0 ? 3 : -3),
                      n.text,
                      chart.value,
                      w,
                      n.anchor,
                      3,
                    )}
                    y={n.ly + (n.anchor !== 'middle' ? 4.5 : n.dy < 0 ? -4 : 14)}
                    fontSize={chart.value}
                    fontWeight="600"
                  >
                    {n.text}
                  </ChartText>
                </G>
              ))}
              <ChartText
                x={w / 2}
                y={h - 10}
                fontSize={chart.emphasis + 4}
                fontWeight="700"
                textAnchor="middle"
              >
                {subscript(formula)}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
    );
  }
  const before = particles(scene.items);
  const after = scene.after ? particles(scene.after) : undefined;
  return (
    <Canvas aspect={after ? 0.62 : 0.66}>
      {({ w, h }) => {
        const arrowW = after ? 34 : 0;
        const bw = after ? (w - arrowW - 8) / 2 : Math.min(w - 8, 300);
        const bh = h - 34;
        const boxes = [
          { x: after ? 4 : (w - bw) / 2, y: 4, w: bw, h: bh },
          ...(after ? [{ x: 4 + bw + arrowW, y: 4, w: bw, h: bh }] : []),
        ];
        const most = Math.max(before.length, after?.length ?? 0);
        const packs = [
          pack(before, scene.state, inset(boxes[0]!), most),
          ...(after ? [pack(after, scene.afterState ?? scene.state, inset(boxes[1]!), most)] : []),
        ];
        // One size in both boxes.
        const scale = Math.min(...packs.map((p) => p.scale));
        const labels = [contents(scene.items), ...(scene.after ? [contents(scene.after)] : [])];
        return (
          <Svg width={w} height={h}>
            <Defs>
              {paint.defs}
              <Ball id={ids.ball} color={c.chartHighlight} />
            </Defs>
            {boxes.map((b, k) => (
              <G key={k}>
                <Rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={4}
                  fill={c.chartSurface}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Particles
                  placed={packs[k]!.placed}
                  scale={scale}
                  ids={paint.ids}
                  ball={ids.ball}
                  bounds={inset(b, 3)}
                  moving={(k === 0 ? scene.state : (scene.afterState ?? scene.state)) === 'gas'}
                />
                <ChartText
                  {...fitLabel(b.x + b.w / 2, labels[k]!, chart.value, w)}
                  y={h - 10}
                  fontSize={chart.value}
                  fontWeight="700"
                >
                  {labels[k]!}
                </ChartText>
              </G>
            ))}
            {after ? (
              <G>
                <Line
                  x1={4 + bw + 6}
                  y1={4 + bh / 2}
                  x2={4 + bw + arrowW - 8}
                  y2={4 + bh / 2}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Path d={arrowHead(4 + bw + arrowW - 4, 4 + bh / 2, 1, 0, 9)} fill={c.chartInk} />
              </G>
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

const inset = (b: { x: number; y: number; w: number; h: number }, k = 6) => ({
  x: b.x + k,
  y: b.y + k,
  w: b.w - 2 * k,
  h: b.h - 2 * k,
});

/** Which boxes each change joins (0 solid, 1 liquid, 2 gas) and whether it runs over the top. */
const CHANGES: Record<PhaseChange, { from: number; to: number; over: boolean }> = {
  melting: { from: 0, to: 1, over: true },
  freezing: { from: 1, to: 0, over: false },
  boiling: { from: 1, to: 2, over: true },
  evaporation: { from: 1, to: 2, over: true },
  condensation: { from: 2, to: 1, over: false },
  sublimation: { from: 0, to: 2, over: true },
  deposition: { from: 2, to: 0, over: false },
};

/**
 * Solid, liquid and gas as three boxes of the same particles (packed in rows, close and
 * jumbled, far apart and moving), the changes between them as curved arrows: melting and
 * boiling over the boxes, freezing and condensation under them. The scene lights a state and
 * a change; sublimation and deposition, which skip the liquid, are drawn only when lit.
 */
export function PhasesFigure({ phase }: { phase: NonNullable<Scene['phase']> }) {
  const c = usePalette();
  const paint = useAtomPaint();
  const ids = usePaintIds('ball');
  const skip = phase.change === 'sublimation' || phase.change === 'deposition';
  const counts = [6, 6, 4];
  const states: State[] = ['solid', 'liquid', 'gas'];
  const shown: PhaseChange[] = [
    'melting',
    phase.change === 'evaporation' ? 'evaporation' : 'boiling',
    'freezing',
    'condensation',
    ...(skip ? [phase.change!] : []),
  ];
  return (
    <Canvas aspect={(w) => (skip ? 266 : 222) / w}>
      {({ w, h }) => {
        const gap = 22;
        const bw = Math.min(120, (w - 8 - 2 * gap) / 3);
        const x0 = (w - 3 * bw - 2 * gap) / 2;
        const top = skip ? 86 : 42;
        const bh = Math.min(96, bw * 0.85);
        const boxAt = (k: number) => ({ x: x0 + k * (bw + gap), y: top, w: bw, h: bh });
        const packs = states.map((s, k) =>
          pack(Array<string>(counts[k]!).fill(phase.formula ?? ''), s, inset(boxAt(k), 5), 6),
        );
        const scale = Math.min(...packs.map((p) => p.scale));
        const arcs: ReactElement[] = shown.map((ch) => {
          const { from, to, over } = CHANGES[ch];
          const lit = ch === phase.change;
          const a = boxAt(from);
          const b = boxAt(to);
          const far = Math.abs(to - from) === 2;
          const xa = a.x + a.w / 2 + (to > from ? 1 : -1) * (far ? 0 : a.w * 0.22);
          const xb = b.x + b.w / 2 + (to > from ? -1 : 1) * (far ? 0 : b.w * 0.22);
          const y = over ? top - 3 : top + bh + 20;
          const lift = far ? 92 : 26;
          const cy = over ? y - lift : y + lift;
          const mx = (xa + xb) / 2;
          // The label sits at the top (or bottom) of the curve.
          const peak = (y + cy) / 2;
          const color = lit ? c.chartHighlight : c.chartMuted;
          return (
            <G key={ch}>
              <Path
                d={`M ${xa} ${y} Q ${mx} ${cy} ${xb} ${y}`}
                fill="none"
                stroke={color}
                strokeWidth={lit ? chart.strokeHeavy : chart.strokeLight}
              />
              <Path d={arrowHead(xb, y, xb - mx, y - cy, lit ? 10 : 8)} fill={color} />
              <ChartText
                {...fitLabel(mx, ch, chart.label, w)}
                y={over ? peak - 5 : peak + 14}
                fontSize={chart.label}
                fontWeight={lit ? '700' : '400'}
                fill={lit ? c.chartHighlight : c.chartInk}
              >
                {ch}
              </ChartText>
            </G>
          );
        });
        return (
          <Svg width={w} height={h}>
            <Defs>
              {paint.defs}
              <Ball id={ids.ball} color={c.chartHighlight} />
            </Defs>
            {arcs}
            {states.map((s, k) => {
              const b = boxAt(k);
              const lit = s === phase.state;
              return (
                <G key={s}>
                  <Rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    rx={4}
                    fill={c.chartSurface}
                    stroke={lit ? c.chartHighlight : c.chartInk}
                    strokeWidth={lit ? chart.strokeHeavy : chart.strokeLight}
                  />
                  <Particles
                    placed={packs[k]!.placed}
                    scale={scale}
                    ids={paint.ids}
                    ball={ids.ball}
                    bounds={inset(b, 3)}
                    moving={s === 'gas'}
                  />
                  <ChartText
                    x={b.x + b.w / 2}
                    y={top + bh + 15}
                    fontSize={chart.value}
                    fontWeight={lit ? '700' : '400'}
                    textAnchor="middle"
                    fill={lit ? c.chartHighlight : c.chartInk}
                  >
                    {s}
                  </ChartText>
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** An element given by atomic number or symbol. */
const zOf = (e: number | string | undefined) =>
  e === undefined ? undefined : typeof e === 'number' ? e : atomicNumber(e);

/** The periodic table with the scene's element, group, period or ringed elements lit. */
export function PeriodicTableFigure({ elements }: { elements: NonNullable<Scene['elements']> }) {
  return (
    <Canvas aspect={(w) => tableSize(w, elements.families).h / w}>
      {({ w }) => (
        <TableArt
          w={w}
          lit={zOf(elements.element)}
          group={elements.group}
          period={elements.period}
          ring={(elements.ring ?? []).map(zOf).filter((z): z is number => z !== undefined)}
          families={elements.families}
        />
      )}
    </Canvas>
  );
}

/** A molecule on a sort card: `w` × `h`, lit balls and sticks. */
export function MoleculeCard({ formula, w, h }: { formula: string; w: number; h: number }) {
  const paint = useAtomPaint();
  return (
    <G>
      <Defs>{paint.defs}</Defs>
      <MoleculeArt
        formula={formula}
        cx={w / 2}
        cy={h / 2}
        scale={Math.min(
          moleculeOf(formula).atoms.length === 1 ? 34 : 22,
          fitScale(formula, w - 6, h - 6),
        )}
        ids={paint.ids}
        symbols
      />
    </G>
  );
}
