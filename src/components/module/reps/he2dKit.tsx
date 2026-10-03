/**
 * Draws a schematic's drawing list (he2dSch.ts) for the op-amp and semiconductor circuits
 * (HC18, HC39): round 1's part symbols and ground (NetSchematic.tsx) for R, C and the sources,
 * and here the op-amp triangle with its rails, the diode, the zener, the dependent current
 * source, the npn and the n-channel MOSFET, and the labels (a symbol in italics, subscripts
 * lowered). Flat, in the chart inks.
 */
import { Fragment } from 'react';
import Svg, { Circle, G, Line, Path, TSpan } from 'react-native-svg';

import type { CircuitNet } from '@/data/modules/typesHe1h';
import { subscriptRuns } from '@/engine/subscripts';
import { chart, usePalette } from '@/theme';

import { ChartText } from './common';
import { arrowHead } from './graphKit';
import {
  SIZE,
  ampGeom,
  devGeom,
  labBox,
  type Device3,
  type Lab,
  type OpAmp,
  type Pt,
  type Sch,
  type Sym,
  type Tone,
} from './he2dSch';
import { Ground, Part } from './NetSchematic';

const DC_NET: CircuitNet = { topology: 'series', elements: [{ kind: 'V' }] };

/** The whole drawing list at width `w`. */
export function SchView({ s, w }: { s: Sch; w: number }) {
  const c = usePalette();
  const ink = (t?: Tone) =>
    t === 'hi' ? c.chartHighlight : t === 'muted' ? c.chartMuted : c.chartInk;
  return (
    <Svg width={w} height={s.height}>
      {s.strokes.map((st, i) => (
        <Path
          key={`s${i}`}
          d={st.pts.map((p, j) => `${j ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}
          stroke={ink(st.tone)}
          strokeWidth={st.width ?? chart.stroke}
          strokeDasharray={st.dash ? chart.dash : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {s.wires.map((pts, i) => (
        <Path
          key={`w${i}`}
          d={pts.map((p, j) => `${j ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      {s.syms.map((p, i) => (
        <SymPart key={`p${i}`} p={p} />
      ))}
      {s.amps.map((a, i) => (
        <OpAmpSym key={`a${i}`} a={a} />
      ))}
      {s.devices.map((d, i) => (
        <Transistor key={`t${i}`} d={d} />
      ))}
      {s.dots.map((p, i) => (
        <Circle key={`d${i}`} cx={p.x} cy={p.y} r={3.5} fill={c.chartInk} />
      ))}
      {s.points.map((p, i) => (
        <Circle
          key={`m${i}`}
          cx={p.p.x}
          cy={p.p.y}
          r={5}
          fill={ink(p.tone)}
          stroke={c.card}
          strokeWidth={1.5}
        />
      ))}
      {s.terminals.map((p, i) => (
        <Circle
          key={`o${i}`}
          cx={p.x}
          cy={p.y}
          r={4.5}
          fill={c.card}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
      ))}
      {s.grounds.map((p, i) => (
        <Ground key={`g${i}`} p={p} />
      ))}
      {s.arrows.map((a, i) => (
        <Path key={`r${i}`} d={arrowHead(a.p.x, a.p.y, a.dx, a.dy, 10)} fill={ink(a.tone)} />
      ))}
      {s.labels.map((l, i) => (
        <Label key={`l${i}`} l={l} w={w} color={ink(l.tone)} />
      ))}
    </Svg>
  );
}

/** One label line: the symbol before " = " in italics, subscripts lowered, on a card halo. */
export function Label({ l, w, color }: { l: Lab; w: number; color: string }) {
  const c = usePalette();
  const b = labBox(l, w);
  const cut = l.plain ? -1 : l.text.indexOf(' = ');
  const pieces = cut > 0 ? [l.text.slice(0, cut), l.text.slice(cut)] : ['', l.text];
  const drop = SIZE * 0.3;
  let down = false;
  const spans = pieces.flatMap((piece, k) =>
    subscriptRuns(piece).map((r, i) => {
      const dy = r.sub && !down ? drop : !r.sub && down ? -drop : 0;
      down = !!r.sub;
      return (
        <TSpan
          key={`${k}-${i}`}
          dy={dy}
          fontSize={r.sub ? SIZE * 0.72 : SIZE}
          fontStyle={k === 0 && !r.sub ? 'italic' : 'normal'}
        >
          {r.s}
        </TSpan>
      );
    }),
  );
  return (
    <ChartText
      x={b.x}
      y={l.y}
      textAnchor={l.anchor}
      fontSize={SIZE}
      fontWeight="600"
      fill={color}
      halo={c.card}
    >
      {spans.map((s, i) => (
        <Fragment key={i}>{s}</Fragment>
      ))}
    </ChartText>
  );
}

/** A part: round 1's symbols for R, C and the sources; the diode, zener and g_m source here. */
function SymPart({ p }: { p: Sym }) {
  const c = usePalette();
  if (p.kind === 'R' || p.kind === 'C' || p.kind === 'V' || p.kind === 'I')
    return (
      <Part slot={{ el: 0, a: p.a, b: p.b }} net={{ ...DC_NET, elements: [{ kind: p.kind }] }} />
    );
  if (p.kind === 'Vac')
    return (
      <Part
        slot={{ el: 0, a: p.a, b: p.b }}
        net={{ topology: 'lowpass', elements: [{ kind: 'V' }] }}
      />
    );
  const { a, b } = p;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const nv = { x: -u.y, y: u.x };
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const at = (t: number, s = 0): Pt => ({
    x: m.x + u.x * t + nv.x * s,
    y: m.y + u.y * t + nv.y * s,
  });
  const half = p.kind === 'G' ? 14 : 9;
  const stroke = { stroke: c.chartInk, strokeWidth: chart.stroke, fill: 'none' as const };
  const pts = (...q: Pt[]) => q.map((r, i) => `${i ? 'L' : 'M'} ${r.x} ${r.y}`).join(' ');
  const lead = (
    <Path d={`${pts(a, at(-half))} ${pts(at(half), b)}`} {...stroke} strokeLinecap="round" />
  );
  if (p.kind === 'G') {
    // A diamond with an arrow along the current's direction (a dependent source).
    return (
      <G>
        {lead}
        <Path
          d={`${pts(at(-half), at(0, half), at(half), at(0, -half))} Z`}
          {...stroke}
          fill={c.card}
          strokeLinejoin="round"
        />
        <Line x1={at(-7).x} y1={at(-7).y} x2={at(3).x} y2={at(3).y} {...stroke} />
        <Path d={arrowHead(at(8).x, at(8).y, u.x, u.y, 7)} fill={c.chartInk} />
      </G>
    );
  }
  // A diode: the triangle points from anode (a) to cathode (b), the bar at the cathode.
  const bar =
    p.kind === 'Z'
      ? pts(at(half - 4, -12), at(half, -9), at(half, 9), at(half + 4, 12))
      : pts(at(half, -9), at(half, 9));
  return (
    <G>
      {lead}
      <Path
        d={`${pts(at(-half, -9), at(half, 0), at(-half, 9))} Z`}
        {...stroke}
        fill={c.chartInk}
        strokeLinejoin="round"
      />
      <Path d={bar} {...stroke} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

/** The op-amp triangle with − and + at its inputs and the rail stubs (+ on top). */
function OpAmpSym({ a }: { a: OpAmp }) {
  const c = usePalette();
  const g = ampGeom(a);
  const stroke = { stroke: c.chartInk, strokeWidth: chart.stroke };
  const sign = (p: Pt, plus: boolean) => (
    <Path
      d={
        plus ? `M ${p.x + 5} ${p.y} h 9 M ${p.x + 9.5} ${p.y - 4.5} v 9` : `M ${p.x + 5} ${p.y} h 9`
      }
      {...stroke}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  );
  const stub = (q: Pt[]) => (
    <Path
      d={`M ${q[0]!.x} ${q[0]!.y} L ${q[1]!.x} ${q[1]!.y} M ${q[1]!.x - 5} ${q[1]!.y} h 10`}
      {...stroke}
      strokeWidth={chart.strokeLight}
      strokeLinecap="round"
    />
  );
  return (
    <G>
      {a.rails ? (
        <>
          {stub(g.railTop)}
          {stub(g.railBot)}
        </>
      ) : null}
      <Path
        d={`M ${g.tri[0]!.x} ${g.tri[0]!.y} L ${g.tri[1]!.x} ${g.tri[1]!.y} L ${g.tri[2]!.x} ${g.tri[2]!.y} Z`}
        {...stroke}
        fill={c.card}
        strokeLinejoin="round"
      />
      {sign(g.minus, false)}
      {sign(g.plus, true)}
      {a.name ? (
        <ChartText
          x={a.x + 34}
          y={a.y + 4}
          textAnchor="middle"
          fontSize={chart.label}
          fill={c.chartMuted}
        >
          {a.name}
        </ChartText>
      ) : null}
    </G>
  );
}

/** An npn (the emitter arrow pointing out) or an n-channel MOSFET (the arrow pointing in). */
function Transistor({ d }: { d: Device3 }) {
  const c = usePalette();
  const g = devGeom(d);
  const stroke = {
    stroke: c.chartInk,
    strokeWidth: chart.stroke,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const { x, y } = d;
  const body =
    d.kind === 'npn' ? (
      <>
        <Path d={`M ${g.gate.x} ${y} H ${x - 8}`} {...stroke} />
        <Path d={`M ${x - 8} ${y - 13} V ${y + 13}`} {...stroke} strokeWidth={3} />
        <Path d={`M ${x - 8} ${y - 6} L ${x + 8} ${y - 16} V ${g.top.y}`} {...stroke} />
        <Path d={`M ${x - 8} ${y + 6} L ${x + 8} ${y + 16} V ${g.bottom.y}`} {...stroke} />
        <Path d={arrowHead(x + 7, y + 15.4, 16, 10, 8)} fill={c.chartInk} />
        <Circle cx={x + 1} cy={y} r={19} {...stroke} strokeWidth={chart.strokeLight} />
      </>
    ) : (
      <>
        <Path d={`M ${g.gate.x} ${y} H ${x - 13}`} {...stroke} />
        <Path d={`M ${x - 13} ${y - 13} V ${y + 13}`} {...stroke} />
        {[-12, 0, 12].map((o) => (
          <Path key={o} d={`M ${x - 7} ${y + o - 5} V ${y + o + 5}`} {...stroke} strokeWidth={3} />
        ))}
        <Path d={`M ${x - 7} ${y - 12} H ${x + 8} V ${g.top.y}`} {...stroke} />
        <Path d={`M ${x - 7} ${y + 12} H ${x + 8} V ${g.bottom.y}`} {...stroke} />
        <Path d={`M ${x + 8} ${y} V ${y + 12} M ${x + 8} ${y} H ${x - 2}`} {...stroke} />
        <Path d={arrowHead(x - 6, y, -1, 0, 8)} fill={c.chartInk} />
      </>
    );
  return <G opacity={d.faded ? 0.45 : 1}>{body}</G>;
}
