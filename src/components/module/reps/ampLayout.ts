/**
 * Where each part of an op-amp schematic goes (HC18, OpAmpSchematic.tsx), per circuit, for a
 * canvas `w` px wide: drawn for a 358 px phone and stretched sideways on a wider one. Labels go
 * where no wire runs (resistor values above their bodies, the output's values under its wire,
 * the rails at their stubs); the integrator's ramp and the Schmitt loop are small plots under
 * the circuit. Pure geometry: the texts and numbers come in, a drawing list (he2dSch.ts) goes out.
 */
import type { AmpCircuit } from '@/data/modules/typesHe2d';

import {
  ampGeom,
  emptySch,
  frame,
  type Lab,
  type OpAmp,
  type Pt,
  type Sch,
  type SymKind,
  type Tone,
} from './he2dSch';

/** The label texts a circuit can show, by role (undefined: no label). */
export type AmpTexts = Partial<
  Record<
    | 'vin0'
    | 'vin1'
    | 'rin0'
    | 'rin1'
    | 'rf'
    | 'rg'
    | 'c'
    | 'vout'
    | 'gain'
    | 'railTop'
    | 'railBot'
    | 'v0'
    | 'time'
    | 'cutoff'
    | 'db'
    | 'thPlus'
    | 'thMinus'
    | 'width'
    | 'hum'
    | 'r2'
    | 'xName'
    | 'yName',
    string
  >
>;

/** The numbers the plots and current arrows need, in SI (undefined while "?"). */
export interface AmpNums {
  /** The sign of the input current (+1 left to right through the input resistor). */
  flow?: number;
  /** Integrator: v₀, the output at t, and t. */
  v0?: number;
  vout?: number;
  time?: number;
  /** Schmitt: the rail, the threshold and the input. */
  rail?: number;
  threshold?: number;
  vin?: number;
}

const BASE = 358;

export function layoutAmp(
  kind: AmpCircuit,
  w: number,
  t: AmpTexts,
  n: AmpNums,
  rails: boolean,
): Sch {
  const k = w / BASE;
  const X = (x: number) => x * k;
  const s = emptySch(200);
  const P = (x: number, y: number): Pt => ({ x, y });
  const wire = (...pts: Pt[]) => s.wires.push(pts);
  const sym = (kd: SymKind, a: Pt, b: Pt) => s.syms.push({ kind: kd, a, b });
  const lab = (
    role: keyof AmpTexts,
    x: number,
    y: number,
    anchor: Lab['anchor'] = 'middle',
    tone?: Tone,
    plain?: boolean,
  ) => {
    const text = t[role];
    if (text) s.labels.push({ x, y, anchor, text, tone, plain });
  };
  const amp = (a: OpAmp) => {
    s.amps.push(a);
    const g = ampGeom(a);
    if (a.rails) {
      lab('railTop', g.railTop[1]!.x, g.railTop[1]!.y - 6);
      lab('railBot', g.railBot[1]!.x, g.railBot[1]!.y + 16);
    }
    return g;
  };
  /** An arrow on a part's lead, on the side the current leaves by. */
  const flowArrow = (a: Pt, b: Pt, sign: number | undefined) => {
    if (!sign) return;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    const tt = sign > 0 ? (3 * len) / 4 + 5 : len / 4 - 5;
    const d = sign > 0 ? u : { x: -u.x, y: -u.y };
    s.arrows.push({
      p: { x: a.x + u.x * tt + d.x * 5, y: a.y + u.y * tt + d.y * 5 },
      dx: d.x,
      dy: d.y,
      tone: 'hi',
    });
  };
  const outEnd = w - 20;
  /** The output wire to its terminal, the feedback joining it at `fx`. */
  const output = (from: Pt, fx: number) => {
    wire(from, P(outEnd, from.y));
    s.terminals.push(P(outEnd, from.y));
    s.dots.push(P(fx, from.y));
  };

  switch (kind) {
    case 'inverting':
    case 'integrator':
    case 'activeLowPass': {
      const low = kind === 'activeLowPass';
      const ay = low ? 152 : 120;
      const g = amp({ x: X(190), y: ay, plusTop: false, rails });
      const my = g.minus.y;
      const nx = X(160);
      const fx = g.out.x + 30;
      // Input: terminal, R_in, the − node.
      s.terminals.push(P(X(16), my));
      const rin = [P(X(16), my), P(X(150), my)] as const;
      sym('R', ...rin);
      wire(P(X(150), my), g.minus);
      s.dots.push(P(nx, my));
      lab('vin0', X(8), my + 24, 'start');
      lab('rin0', (rin[0].x + rin[1].x) / 2, my - 16);
      flowArrow(...rin, n.flow);
      // Feedback rows: R_f, or C, or C over R_f.
      const rows: [SymKind, keyof AmpTexts, number][] = low
        ? [
            ['C', 'c', 40],
            ['R', 'rf', 92],
          ]
        : [[kind === 'integrator' ? 'C' : 'R', kind === 'integrator' ? 'c' : 'rf', 52]];
      const topY = rows[0]![2];
      wire(P(nx, my), P(nx, topY));
      wire(P(fx, topY), P(fx, ay));
      for (const [kd, role, y] of rows) {
        sym(kd, P(nx, y), P(fx, y));
        lab(role, (nx + fx) / 2, y - (kd === 'C' ? 20 : 16));
        if (y !== topY) s.dots.push(P(nx, y), P(fx, y));
        // The DC current runs through the resistor (the capacitor takes none at DC).
        if (kd === 'R' || kind === 'integrator') flowArrow(P(nx, y), P(fx, y), n.flow);
      }
      // + to ground.
      wire(g.plus, P(X(165), g.plus.y), P(X(165), g.plus.y + 12));
      s.grounds.push(P(X(165), g.plus.y + 12));
      output(g.out, fx);
      lab('vout', w - 4, ay + 22, 'end', 'hi');
      lab('gain', w - 4, ay + 40, 'end');
      lab('cutoff', w - 4, ay + 58, 'end');
      lab('db', w - 4, ay + 76, 'end');
      s.height = ay + (low ? 86 : 60);
      if (kind === 'integrator') rampPlot(ay + 64);
      return s;
    }

    case 'nonInverting': {
      const ay = 110;
      const g = amp({ x: X(190), y: ay, plusTop: true, rails });
      const nx = X(160);
      const fx = g.out.x + 30;
      s.terminals.push(P(X(16), g.plus.y));
      wire(P(X(16), g.plus.y), g.plus);
      lab('vin0', X(8), g.plus.y - 16, 'start');
      wire(g.minus, P(nx, g.minus.y), P(nx, 170));
      s.dots.push(P(nx, 170));
      sym('R', P(nx, 170), P(fx, 170));
      wire(P(fx, 170), P(fx, ay));
      lab('rf', (nx + fx) / 2, 194);
      sym('R', P(nx, 170), P(nx, 236));
      s.grounds.push(P(nx, 236));
      lab('rg', nx - 14, 207, 'end');
      output(g.out, fx);
      lab('vout', w - 4, ay - 12, 'end', 'hi');
      lab('gain', w - 4, ay - 30, 'end');
      s.height = 256;
      return s;
    }

    case 'summing': {
      const ay = 148;
      const g = amp({ x: X(200), y: ay, plusTop: false, rails });
      const nx = X(165);
      const fx = g.out.x + 30;
      wire(P(nx, 30), P(nx, g.minus.y), g.minus);
      sym('R', P(nx, 30), P(fx, 30));
      wire(P(fx, 30), P(fx, ay));
      lab('rf', (nx + fx) / 2, 14);
      flowArrow(P(nx, 30), P(fx, 30), n.flow);
      [74, g.minus.y].forEach((y, i) => {
        s.terminals.push(P(X(16), y));
        sym('R', P(X(16), y), P(nx, y));
        s.dots.push(P(nx, y));
        lab(i ? 'vin1' : 'vin0', X(8), y + 20, 'start');
        lab(i ? 'rin1' : 'rin0', (X(16) + nx) / 2, y - 16);
      });
      wire(g.plus, P(X(182), g.plus.y), P(X(182), g.plus.y + 12));
      s.grounds.push(P(X(182), g.plus.y + 12));
      output(g.out, fx);
      lab('vout', w - 4, ay + 22, 'end', 'hi');
      s.height = 204;
      return s;
    }

    case 'difference': {
      const ay = 120;
      const g = amp({ x: X(210), y: ay, plusTop: false, rails });
      const fx = g.out.x + 30;
      const mx = X(175);
      const px = X(185);
      s.terminals.push(P(X(16), g.minus.y), P(X(16), g.plus.y));
      wire(P(X(16), g.minus.y), P(X(70), g.minus.y));
      sym('R', P(X(70), g.minus.y), P(mx, g.minus.y));
      wire(P(mx, g.minus.y), g.minus);
      s.dots.push(P(mx, g.minus.y));
      wire(P(mx, g.minus.y), P(mx, 50));
      sym('R', P(mx, 50), P(fx, 50));
      wire(P(fx, 50), P(fx, ay));
      wire(P(X(16), g.plus.y), P(X(70), g.plus.y));
      sym('R', P(X(70), g.plus.y), P(px, g.plus.y));
      wire(P(px, g.plus.y), g.plus);
      s.dots.push(P(px, g.plus.y));
      sym('R', P(px, g.plus.y), P(px, 210));
      s.grounds.push(P(px, 210));
      lab('vin0', X(8), g.minus.y - 16, 'start');
      lab('vin1', X(8), g.plus.y - 16, 'start');
      lab('rin0', (X(70) + mx) / 2, g.minus.y - 16);
      lab('rin1', (X(70) + px) / 2, g.plus.y + 26);
      lab('rf', (mx + fx) / 2, 34);
      lab('r2', px - 14, 186, 'end');
      output(g.out, fx);
      lab('vout', w - 4, ay + 22, 'end', 'hi');
      lab('gain', w - 4, ay + 40, 'end');
      s.height = 230;
      return s;
    }

    case 'schmitt': {
      const ay = 100;
      const g = amp({ x: X(190), y: ay, plusTop: false, rails });
      const jx = X(160);
      const fx = g.out.x + 30;
      s.terminals.push(P(X(16), g.minus.y));
      wire(P(X(16), g.minus.y), g.minus);
      lab('vin0', X(8), g.minus.y - 16, 'start');
      wire(g.plus, P(jx, g.plus.y), P(jx, 160));
      s.dots.push(P(jx, 160));
      sym('R', P(jx, 160), P(fx, 160));
      wire(P(fx, 160), P(fx, ay));
      lab('rf', (jx + fx) / 2, 184);
      sym('R', P(jx, 160), P(jx, 220));
      s.grounds.push(P(jx, 220));
      lab('rin0', jx - 14, 194, 'end');
      output(g.out, fx);
      lab('vout', w - 4, ay - 12, 'end', 'hi');
      loopPlot(254);
      return s;
    }

    case 'instrumentation': {
      const a1 = amp({ x: X(108), y: 46, plusTop: true, rails: false, name: 'A₁' });
      const a2 = amp({ x: X(108), y: 230, plusTop: false, rails: false, name: 'A₂' });
      const cx = a1.out.x + 20;
      // The gain chain: R, R_g, R between the buffers' outputs.
      wire(a1.out, P(cx, a1.out.y));
      wire(a2.out, P(cx, a2.out.y));
      sym('R', P(cx, a1.out.y), P(cx, 108));
      sym('R', P(cx, 108), P(cx, 168));
      sym('R', P(cx, 168), P(cx, a2.out.y));
      s.dots.push(P(cx, a1.out.y), P(cx, 108), P(cx, 168), P(cx, a2.out.y));
      const bx = X(94);
      wire(P(cx, 108), P(bx, 108), P(bx, a1.minus.y), a1.minus);
      wire(P(cx, 168), P(bx, 168), P(bx, a2.minus.y), a2.minus);
      lab('rf', cx - 14, 92, 'end');
      lab('rg', cx - 14, 142, 'end');
      lab('rf', cx - 14, 194, 'end');
      // The difference stage: four equal R₂, unity gain.
      const a3 = amp({ x: X(262), y: 138, plusTop: false, rails, name: 'A₃' });
      const jx = a3.minus.x - 16;
      const fx = a3.out.x + 10;
      sym('R', P(cx, a1.out.y), P(jx, a1.out.y));
      wire(P(jx, a1.out.y), P(jx, a3.minus.y), a3.minus);
      sym('R', P(jx, 86), P(fx, 86));
      s.dots.push(P(jx, 86));
      wire(P(fx, 86), P(fx, a3.out.y));
      sym('R', P(cx, a2.out.y), P(jx, a2.out.y));
      wire(P(jx, a2.out.y), P(jx, a3.plus.y), a3.plus);
      const gx = Math.min(w - 40, jx + 66);
      // The fourth R₂ to ground: a lead past the resistor and down, then the ground.
      sym('R', P(jx, 222), P(gx - 10, 222));
      wire(P(gx - 10, 222), P(gx, 222), P(gx, 232));
      s.dots.push(P(jx, 222));
      s.grounds.push(P(gx, 232));
      wire(a3.out, P(w - 10, a3.out.y));
      s.terminals.push(P(w - 10, a3.out.y));
      s.dots.push(P(fx, a3.out.y));
      lab('r2', (cx + jx) / 2, a1.out.y - 14);
      lab('r2', (jx + fx) / 2, 72);
      lab('r2', (cx + jx) / 2, a2.out.y + 24);
      lab('r2', (jx + gx - 10) / 2, 246);
      // The electrodes: V_d between the inputs, V_cm from ground to the lower one.
      const ex = X(40);
      wire(P(ex, a1.plus.y), a1.plus);
      wire(P(ex, a2.plus.y), a2.plus);
      sym('V', P(ex, a2.plus.y), P(ex, a1.plus.y));
      lab('vin0', ex + 20, 160, 'start');
      const cmx = X(72);
      s.dots.push(P(cmx, a2.plus.y));
      sym('V', P(cmx, 300), P(cmx, a2.plus.y));
      s.grounds.push(P(cmx, 300));
      lab('vin1', cmx + 20, 280, 'start');
      lab('gain', w - 4, 20, 'end');
      lab('vout', w - 4, a3.out.y + 48, 'end', 'hi');
      lab('hum', w - 4, a3.out.y + 66, 'end', 'hi');
      s.height = 322;
      return s;
    }
  }
  return s;

  /** The integrator's output against time: v₀ at 0, a straight ramp to v_out at t. */
  function rampPlot(top: number) {
    const box = { x: X(56), y: top + 14, w: w - X(56) - 40, h: 86 };
    s.height = box.y + box.h + 34;
    const { v0 = 0, vout, time } = n;
    const ys = [0, v0, ...(vout === undefined ? [] : [vout])];
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo || Math.abs(v0) || 1) * 0.15;
    const tEnd = (time ?? 1) * 1.25;
    const f = frame(box, [0, tEnd], [lo - pad, hi + pad]);
    s.strokes.push(
      { pts: [f.P(0, 0), f.P(tEnd, 0)], tone: 'muted', width: 1.5 },
      { pts: [P(box.x, box.y), P(box.x, box.y + box.h)], tone: 'muted', width: 1.5 },
    );
    s.arrows.push({ p: P(box.x + box.w + 6, f.Y(0)), dx: 1, dy: 0, tone: 'muted' });
    s.arrows.push({ p: P(box.x, box.y - 6), dx: 0, dy: -1, tone: 'muted' });
    lab(
      'xName',
      box.x + box.w + 8,
      f.Y(0) + (vout !== undefined && vout > 0 ? 20 : -10),
      'end',
      'muted',
      true,
    );
    lab('yName', box.x + 8, box.y + 2, 'start', 'muted', true);
    lab('v0', box.x - 6, f.Y(v0) + 4, 'end');
    if (time === undefined || vout === undefined) return;
    const end = f.P(time, vout);
    s.strokes.push({ pts: [f.P(0, v0), end], tone: 'hi', width: 2.5 });
    s.strokes.push({ pts: [end, f.P(time, 0)], tone: 'muted', dash: true, width: 1.5 });
    s.points.push({ p: end, tone: 'hi' });
    lab('time', end.x, f.Y(0) + (vout < 0 ? -8 : 18), 'middle');
  }

  /** The Schmitt loop: v_out against vᵢₙ, the switching edges at ±V_TH with their arrows. */
  function loopPlot(top: number) {
    const box = { x: X(64), y: top, w: w - X(64) - 24, h: 120 };
    s.height = box.y + box.h + 22;
    const { rail, threshold: th, vin } = n;
    const R = rail ?? 1;
    const span = Math.max(2 * (th ?? R / 4), vin === undefined ? 0 : Math.abs(vin) * 1.2, 1e-9);
    const f = frame(box, [-span, span], [-1.3 * R, 1.3 * R]);
    const yAxis = box.x;
    s.strokes.push(
      { pts: [f.P(-span, 0), f.P(span, 0)], tone: 'muted', width: 1.5 },
      { pts: [P(yAxis, box.y + box.h), P(yAxis, box.y)], tone: 'muted', width: 1.5 },
    );
    s.arrows.push({ p: P(box.x + box.w + 6, f.Y(0)), dx: 1, dy: 0, tone: 'muted' });
    s.arrows.push({ p: P(yAxis, box.y - 6), dx: 0, dy: -1, tone: 'muted' });
    lab('xName', box.x + box.w + 6, f.Y(0) + 16, 'end', 'muted', true);
    lab('yName', yAxis + 8, box.y + 4, 'start', 'muted', true);
    if (rail === undefined || th === undefined) return;
    // Ticks at the rails on the axis, their values to the left.
    for (const v of [R, -R])
      s.strokes.push({ pts: [P(yAxis - 4, f.Y(v)), P(yAxis + 4, f.Y(v))], tone: 'muted' });
    lab('railTop', yAxis - 8, f.Y(R) + 4, 'end');
    lab('railBot', yAxis - 8, f.Y(-R) + 4, 'end');
    const hiLine = [f.P(-span, R), f.P(th, R), f.P(th, -R)];
    const loLine = [f.P(span, -R), f.P(-th, -R), f.P(-th, R)];
    s.strokes.push(
      { pts: hiLine, tone: 'hi', width: 2.5 },
      { pts: loLine, tone: 'hi', width: 2.5 },
    );
    // Rising input runs right along the top and drops at +V_TH; falling runs left and jumps at −V_TH.
    s.arrows.push(
      { p: f.P(-span / 2 + span / 8, R), dx: 1, dy: 0, tone: 'hi' },
      { p: P(f.X(th), f.Y(0) + 22), dx: 0, dy: 1, tone: 'hi' },
      { p: f.P(span / 2 - span / 8, -R), dx: -1, dy: 0, tone: 'hi' },
      { p: P(f.X(-th), f.Y(0) - 22), dx: 0, dy: -1, tone: 'hi' },
    );
    // Each threshold on the far side of the axis from its edge's arrow; the width under the loop.
    lab('thPlus', f.X(th) + 6, f.Y(0) - 6, 'start');
    lab('thMinus', f.X(-th) - 6, f.Y(0) + 16, 'end');
    lab('width', f.X(0), f.Y(-R) + 18);
    if (vin !== undefined) {
      const out = vin > th ? -R : R;
      s.points.push({ p: f.P(Math.max(-span, Math.min(span, vin)), out), tone: 'hi' });
    }
  }
}
