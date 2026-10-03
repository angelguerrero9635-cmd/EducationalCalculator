/**
 * HC185 (`typesHe4n.ts`): the `stateDiagram` explore figure. State bubbles in the page's fixed
 * layout (Moore: “S3/1”; Mealy arrows “1/0”), arrows curved apart when two states point at each
 * other, self-loops where the page puts them, and an entry arrow into the start state. A scene's
 * input is replayed: the state reached is lit and heavy, the last arrow taken heavy in the
 * highlight (so neither reads by colour alone), and under the diagram the input tape carries the
 * state and the output after each bit read. Flat.
 */
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import type { FsmArrow, StateDiagramFigure, StateDiagramScene } from '@/data/modules/typesHe4n';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { fsmReplay } from '../reps/he4nMath';

const R = 22;
const MX = 78;
const TOP = 80;
const DH = 262;
const CELL = 30;
const TAPE_ROW = 22;

/** Where everything sits for a canvas `w` wide. */
export function stateLayout(f: StateDiagramFigure, w: number) {
  const px = (x: number) => MX + x * (w - 2 * MX);
  const py = (y: number) => TOP + y * (DH - TOP - 40);
  const len = Math.max((f.tape ?? '').length, 1);
  const tapeW = 56 + (len + 1) * CELL;
  const tapeX = Math.max(4, (w - tapeW) / 2);
  return { px, py, tapeX, tapeY: DH + 6, h: DH + 6 + 3 * TAPE_ROW + 8 };
}

type Pt = [number, number];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const norm = (a: Pt): Pt => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};

/** An arrowhead at `tip` pointing along `dir`. */
const head = (tip: Pt, dir: Pt, s = 9) => {
  const [dx, dy] = norm(dir);
  const bx = tip[0] - dx * s;
  const by = tip[1] - dy * s;
  return `M${tip[0]},${tip[1]} L${bx - dy * s * 0.45},${by + dx * s * 0.45} L${bx + dy * s * 0.45},${by - dx * s * 0.45} Z`;
};

/** An arrow's curve, head, and label point. */
export function arrowGeometry(
  f: StateDiagramFigure,
  a: FsmArrow,
  at: (name: string) => Pt,
): { d: string; tip: Pt; dir: Pt; label: Pt } {
  const A = at(a.from);
  const B = at(a.to);
  if (a.from === a.to) {
    const st = f.states.find((s) => s.name === a.from)!;
    const ang = ((st.loop ?? 270) * Math.PI) / 180;
    const sp = 0.45;
    const p1: Pt = [A[0] + R * Math.cos(ang - sp), A[1] + R * Math.sin(ang - sp)];
    const p2: Pt = [A[0] + R * Math.cos(ang + sp), A[1] + R * Math.sin(ang + sp)];
    const k = 2.5 * R;
    const c1: Pt = [A[0] + k * Math.cos(ang - 0.6), A[1] + k * Math.sin(ang - 0.6)];
    const c2: Pt = [A[0] + k * Math.cos(ang + 0.6), A[1] + k * Math.sin(ang + 0.6)];
    const out = R + 0.75 * (k - R) * Math.cos(0.6) + 12;
    return {
      d: `M${p1[0]},${p1[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`,
      tip: p2,
      dir: sub(p2, c2),
      label: [A[0] + out * Math.cos(ang), A[1] + out * Math.sin(ang) + 4.5],
    };
  }
  const back = f.arrows.some((b) => b.from === a.to && b.to === a.from);
  const bend = a.bend ?? (back ? 0.2 : 0);
  const d = sub(B, A);
  const L = Math.hypot(d[0], d[1]);
  const n: Pt = [-d[1] / L, d[0] / L];
  const mid: Pt = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const c: Pt = [mid[0] + n[0] * bend * L, mid[1] + n[1] * bend * L];
  const u0 = norm(sub(c, A));
  const u1 = norm(sub(c, B));
  const s: Pt = [A[0] + u0[0] * R, A[1] + u0[1] * R];
  const e: Pt = [B[0] + u1[0] * (R + 1), B[1] + u1[1] * (R + 1)];
  const onCurve: Pt = [
    0.25 * s[0] + 0.5 * c[0] + 0.25 * e[0],
    0.25 * s[1] + 0.5 * c[1] + 0.25 * e[1],
  ];
  const side = bend < 0 ? -1 : 1;
  return {
    d: `M${s[0]},${s[1]} Q${c[0]},${c[1]} ${e[0]},${e[1]}`,
    tip: e,
    dir: sub(e, c),
    label: [onCurve[0] + n[0] * 11 * side, onCurve[1] + n[1] * 11 * side + 4],
  };
}

export function StateDiagramFigureView({
  figure,
  scene,
}: {
  figure: StateDiagramFigure;
  scene: StateDiagramScene;
}) {
  return (
    <Canvas aspect={(w) => stateLayout(figure, w).h / w}>
      {({ w, h }) => (
        <Svg width={w} height={h}>
          <Drawing f={figure} scene={scene} w={w} />
        </Svg>
      )}
    </Canvas>
  );
}

function Drawing({ f, scene, w }: { f: StateDiagramFigure; scene: StateDiagramScene; w: number }) {
  const c = usePalette();
  const L = stateLayout(f, w);
  const at = (name: string): Pt => {
    const s = f.states.find((x) => x.name === name)!;
    return [L.px(s.x), L.py(s.y)];
  };
  const steps = fsmReplay(f, scene.input);
  const last = steps[steps.length - 1];
  const now = steps.length ? last?.state : f.start;
  const lastArrow = last?.arrow;
  const label = (a: FsmArrow) => (f.machine === 'mealy' ? `${a.input}/${a.output ?? ''}` : a.input);
  const start = at(f.start);
  const tape = f.tape ?? scene.input;
  const cellX = (k: number) => L.tapeX + 56 + k * CELL;
  return (
    <G>
      {/* The entry arrow into the start state, from below. */}
      <Path
        d={`M${start[0]},${start[1] + R + 26} L${start[0]},${start[1] + R + 9}`}
        stroke={c.chartInk}
        strokeWidth={chart.strokeLight}
      />
      <Path d={head([start[0], start[1] + R + 1], [0, -1])} fill={c.chartInk} />
      <ChartText x={start[0] + 6} y={start[1] + R + 26} fontSize={chart.label} fill={c.chartMuted}>
        start
      </ChartText>
      {f.arrows.map((a, i) => {
        const g = arrowGeometry(f, a, at);
        const lit = a === lastArrow;
        const ink = lit ? c.chartHighlight : c.chartInk;
        return (
          <G key={`a${i}`}>
            <Path
              d={g.d}
              fill="none"
              stroke={ink}
              strokeWidth={lit ? chart.strokeHeavy : chart.strokeLight}
            />
            <Path d={head(g.tip, g.dir, lit ? 11 : 9)} fill={ink} />
          </G>
        );
      })}
      {f.arrows.map((a, i) => {
        const g = arrowGeometry(f, a, at);
        const lit = a === lastArrow;
        return (
          <ChartText
            key={`l${i}`}
            x={g.label[0]}
            y={g.label[1]}
            textAnchor="middle"
            fontSize={chart.value}
            fontWeight="700"
            fill={lit ? c.chartHighlight : c.chartInk}
            halo
          >
            {label(a)}
          </ChartText>
        );
      })}
      {f.states.map((s) => {
        const [x, y] = at(s.name);
        const lit = s.name === now;
        return (
          <G key={s.name}>
            <Circle
              cx={x}
              cy={y}
              r={R}
              fill={lit ? c.chartHighlight : c.chartSurface}
              stroke={lit ? c.chartHighlight : c.chartInk}
              strokeWidth={lit ? chart.strokeHeavy : chart.stroke}
            />
            {lit ? (
              <Circle
                cx={x}
                cy={y}
                r={R + 4}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={1.5}
              />
            ) : null}
            <ChartText
              x={x}
              y={y + 4.5}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={lit ? c.onChartHighlight : c.chartInk}
            >
              {f.machine === 'moore' && s.output !== undefined ? `${s.name}/${s.output}` : s.name}
            </ChartText>
          </G>
        );
      })}
      {/* The tape: each bit, the state after it and the output. */}
      {['input', 'state', 'output'].map((name, r) => (
        <ChartText
          key={name}
          x={L.tapeX + 50}
          y={L.tapeY + r * TAPE_ROW + 15}
          textAnchor="end"
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartMuted}
        >
          {name}
        </ChartText>
      ))}
      <ChartText
        x={cellX(0) + CELL / 2}
        y={L.tapeY + TAPE_ROW + 15}
        textAnchor="middle"
        fontSize={chart.label}
        fill={c.chartInk}
      >
        {f.start}
      </ChartText>
      {[...tape].map((bit, k) => {
        const st = steps[k];
        const read = k < steps.length;
        const isLast = k === steps.length - 1;
        const x = cellX(k + 1);
        return (
          <G key={k}>
            <Rect
              x={x + 1}
              y={L.tapeY + 1}
              width={CELL - 2}
              height={TAPE_ROW - 2}
              rx={3}
              fill={isLast ? c.chartHighlight : read ? c.chartFill : c.chartSurface}
              stroke={isLast ? c.chartHighlight : c.chartGrid}
              strokeWidth={1}
              strokeDasharray={read ? undefined : chart.dashFine}
            />
            <ChartText
              x={x + CELL / 2}
              y={L.tapeY + 15}
              textAnchor="middle"
              fontSize={chart.value}
              fontWeight="700"
              fill={isLast ? c.onChartHighlight : read ? c.chartInk : c.chartMuted}
            >
              {bit}
            </ChartText>
            {read && st ? (
              <G>
                <ChartText
                  x={x + CELL / 2}
                  y={L.tapeY + TAPE_ROW + 15}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight={isLast ? '700' : '400'}
                  fill={c.chartInk}
                >
                  {st.state ?? '–'}
                </ChartText>
                <ChartText
                  x={x + CELL / 2}
                  y={L.tapeY + 2 * TAPE_ROW + 15}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontWeight={st.output === '1' ? '700' : '400'}
                  fill={st.output === '1' ? c.chartInk : c.chartMuted}
                >
                  {st.output ?? ''}
                </ChartText>
              </G>
            ) : null}
          </G>
        );
      })}
    </G>
  );
}
