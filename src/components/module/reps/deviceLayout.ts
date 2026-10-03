/**
 * Where each part of a semiconductor schematic goes (HC39, DeviceSchematic.tsx), per circuit,
 * drawn for a 358 px phone and stretched sideways on a wider one: the diode loop, the zener
 * regulator, the bridge rectifier with its wave under it, the divider-biased BJT, the
 * common-source MOSFET and the hybrid-π model. Pure geometry, like ampLayout.ts.
 */
import type { DeviceCircuit } from '@/data/modules/typesHe2d';

import { rippleWave } from './deviceMath';
import {
  devGeom,
  emptySch,
  frame,
  type Lab,
  type Pt,
  type Sch,
  type SymKind,
  type Tone,
} from './he2dSch';

export type DeviceRole =
  | 'p0'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'p4'
  | 'current'
  | 'vr'
  | 'power'
  | 'zener'
  | 'load'
  | 'peak'
  | 'ripple'
  | 'dc'
  | 'freq'
  | 'base'
  | 'vce'
  | 'overdrive'
  | 'gm'
  | 'rpi'
  | 'rp'
  | 'gain'
  | 'input'
  | 'output'
  | 'xName'
  | 'yName';

export type DeviceTexts = Partial<Record<DeviceRole, string>>;

/** What the drawing reads besides the texts, in SI (undefined while "?"). */
export interface DeviceNums {
  /** Signs of the currents drawn as arrows: the loop's, the zener's, the load's, the collector's. */
  loop?: number;
  zener?: number;
  load?: number;
  /** The BJT is in its active region (drawn solid; faded when saturated). */
  active?: boolean;
  /** The bridge's wave: peak, ripple, ripple frequency, the dc level. */
  vp?: number;
  vr?: number;
  fr?: number;
  vdc?: number;
}

const BASE = 358;

export function layoutDevice(kind: DeviceCircuit, w: number, t: DeviceTexts, n: DeviceNums): Sch {
  const k = w / BASE;
  const X = (x: number) => x * k;
  const s = emptySch(200);
  const P = (x: number, y: number): Pt => ({ x, y });
  const wire = (...pts: Pt[]) => s.wires.push(pts);
  const sym = (kd: SymKind, a: Pt, b: Pt) => s.syms.push({ kind: kd, a, b });
  const lab = (
    role: DeviceRole,
    x: number,
    y: number,
    anchor: Lab['anchor'] = 'middle',
    tone?: Tone,
    plain?: boolean,
  ) => {
    const text = t[role];
    if (text) s.labels.push({ x, y, anchor, text, tone, plain });
  };
  /** An arrow on a part's lead, on the side the current leaves by (sign along a → b). */
  const flow = (a: Pt, b: Pt, sign: number | undefined, half = 20) => {
    if (!sign) return;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    const tt = sign > 0 ? (len + half) / 2 + (len / 2 - half) / 2 : (len - half) / 4;
    const d = sign > 0 ? u : { x: -u.x, y: -u.y };
    s.arrows.push({
      p: { x: a.x + u.x * tt + d.x * 5, y: a.y + u.y * tt + d.y * 5 },
      dx: d.x,
      dy: d.y,
      tone: 'hi',
    });
  };

  switch (kind) {
    case 'diodeR': {
      const [x0, x1, top, bot] = [X(80), X(250), 50, 190];
      sym('V', P(x0, bot), P(x0, top));
      sym('R', P(x0, top), P(x1, top));
      sym('D', P(x1, top), P(x1, bot));
      wire(P(x1, bot), P(x0, bot));
      s.grounds.push(P(x0, bot));
      lab('p0', x0 - 20, (top + bot) / 2 + 4, 'end');
      lab('p2', (x0 + x1) / 2, top - 16);
      lab('vr', (x0 + x1) / 2, top + 30);
      lab('p1', x1 + 20, 112, 'start');
      lab('power', x1 + 20, 130, 'start');
      flow(P(x0, top), P(x1, top), n.loop);
      lab('current', (x0 + x1) / 2, 150, 'middle', 'hi');
      s.height = 218;
      return s;
    }

    case 'zener': {
      const [x0, xz, xl, top, bot] = [X(40), X(180), X(300), 50, 190];
      sym('V', P(x0, bot), P(x0, top));
      sym('R', P(x0, top), P(xz, top));
      sym('Z', P(xz, bot), P(xz, top));
      sym('R', P(xl, top), P(xl, bot));
      wire(P(xz, top), P(xl, top));
      wire(P(xl, bot), P(x0, bot));
      s.dots.push(P(xz, top), P(xz, bot));
      s.grounds.push(P(x0, bot));
      lab('p0', x0 + 22, 112, 'start');
      lab('p2', (x0 + xz) / 2, top - 16);
      lab('p1', xz + 18, 112, 'start');
      lab('zener', xz + 18, 130, 'start', 'hi');
      lab('load', xl + 18, 124, 'start');
      lab('current', (xz + xl) / 2, top - 16, 'middle', 'hi');
      lab('power', (x0 + xl) / 2, bot + 34);
      flow(P(x0, top), P(xz, top), n.loop);
      flow(P(xz, bot), P(xz, top), n.zener === undefined ? undefined : -n.zener, 9);
      flow(P(xl, top), P(xl, bot), n.load);
      s.height = 236;
      return s;
    }

    case 'bridge': {
      const xs = X(34);
      const T = P(X(120), 44);
      const B = P(X(120), 188);
      const L = P(X(70), 116);
      const R = P(X(170), 116);
      const [xp, xc, xl, bot] = [X(220), X(258), X(320), 222];
      sym('Vac', P(xs, B.y), P(xs, T.y));
      wire(P(xs, T.y), T);
      wire(P(xs, B.y), B);
      sym('D', T, R);
      sym('D', B, R);
      sym('D', L, T);
      sym('D', L, B);
      // + from the right corner, − from the left (hopping the source's lower wire).
      wire(R, P(xp, R.y), P(xp, T.y), P(xl, T.y));
      const hop = Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.PI * i) / 8;
        return P(L.x + 6 * Math.cos(a), B.y + 6 * Math.sin(a));
      });
      wire(L, P(L.x, B.y - 6), ...hop, P(L.x, bot), P(xl, bot));
      sym('C', P(xc, bot), P(xc, T.y));
      sym('R', P(xl, T.y), P(xl, bot));
      s.dots.push(P(xc, T.y), P(xc, bot), T, B, L, R);
      s.dots.push(P(xl, T.y));
      lab('p0', X(8), T.y - 14, 'start');
      lab('p2', xc, bot + 22);
      lab('p1', xl, bot + 40);
      wavePlot(bot + 52);
      return s;
    }

    case 'bjtDivider': {
      const [xd, top, bot, by] = [X(90), 34, 254, 144];
      const d = { kind: 'npn' as const, x: X(200), y: by, faded: n.active === false };
      s.devices.push(d);
      const g = devGeom(d);
      wire(P(X(40), top), P(X(320), top));
      wire(P(X(40), bot), P(X(320), bot));
      s.grounds.push(P(X(150), bot));
      sym('R', P(xd, top), P(xd, by));
      sym('R', P(xd, by), P(xd, bot));
      wire(P(xd, by), g.gate);
      sym('R', P(g.top.x, top), g.top);
      sym('R', g.bottom, P(g.bottom.x, bot));
      s.dots.push(P(xd, top), P(xd, bot), P(xd, by), P(g.top.x, top), P(g.top.x, bot));
      lab('p0', X(8), top - 10, 'start');
      lab('p1', xd - 14, 92, 'end');
      lab('p2', xd - 14, 202, 'end');
      lab('base', xd + 8, by - 8, 'start');
      lab('p3', g.top.x + 16, 70, 'start');
      lab('p4', g.bottom.x + 16, 216, 'start');
      lab('current', g.top.x + 24, by - 6, 'start', 'hi');
      lab('vce', g.top.x + 24, by + 12, 'start');
      if (n.active) flow(P(g.top.x, top), g.top, 1);
      s.height = bot + 26;
      return s;
    }

    case 'mosfetCS': {
      const [top, by] = [34, 140];
      const d = { kind: 'nmos' as const, x: X(200), y: by };
      s.devices.push(d);
      const g = devGeom(d);
      const dy = 106;
      wire(P(X(120), top), P(X(320), top));
      sym('R', P(g.top.x, top), P(g.top.x, dy));
      wire(P(g.top.x, dy), g.top);
      wire(P(g.top.x, dy), P(X(330), dy));
      s.terminals.push(P(X(330), dy));
      s.dots.push(P(g.top.x, top), P(g.top.x, dy));
      wire(g.bottom, P(g.bottom.x, g.bottom.y + 6));
      s.grounds.push(P(g.bottom.x, g.bottom.y + 6));
      s.terminals.push(P(X(40), by));
      wire(P(X(40), by), g.gate);
      lab('p1', X(120), top - 10, 'start');
      lab('input', X(32), by - 14, 'start');
      lab('output', w - 4, dy - 14, 'end');
      lab('gain', w - 4, dy - 32, 'end');
      lab('p0', g.top.x - 16, 74, 'end');
      lab('current', g.top.x + 24, by + 8, 'start', 'hi');
      lab('overdrive', g.top.x + 24, by + 26, 'start');
      lab('gm', g.top.x + 24, by + 44, 'start');
      if (n.loop) flow(P(g.top.x, top), P(g.top.x, dy), n.loop);
      s.height = 212;
      return s;
    }

    case 'hybridPi': {
      const [top, bot] = [70, 176];
      const [xb, xg, xc, xl] = [X(110), X(190), X(256), X(326)];
      s.terminals.push(P(X(24), top), P(X(24), bot));
      wire(P(X(24), top), P(xb, top));
      wire(P(X(24), bot), P(xl, bot));
      sym('R', P(xb, top), P(xb, bot));
      sym('G', P(xg, top), P(xg, bot));
      wire(P(xg, top), P(xl, top));
      sym('R', P(xc, top), P(xc, bot));
      sym('R', P(xl, top), P(xl, bot));
      s.dots.push(P(xb, top), P(xb, bot), P(xg, bot), P(xc, top), P(xc, bot));
      s.grounds.push(P((xb + xg) / 2, bot));
      s.labels.push(
        { x: xb + 16, y: top + 26, anchor: 'start', text: '+', tone: 'muted', plain: true },
        { x: xb + 16, y: bot - 14, anchor: 'start', text: '−', tone: 'muted', plain: true },
        {
          x: xb + 16,
          y: (top + bot) / 2 + 4,
          anchor: 'start',
          text: 'v_π',
          tone: 'muted',
          plain: true,
        },
      );
      lab('rpi', xb - 14, (top + bot) / 2 + 4, 'end');
      lab('gm', xg, top - 16);
      lab('rp', w - 4, top - 16, 'end');
      lab('gain', w - 4, top - 34, 'end');
      lab('p0', xc, bot + 26);
      lab('p1', xl, bot + 44);
      s.height = bot + 56;
      return s;
    }
  }
  return s;

  /** The rectified wave: the bare |sin| dashed, the capacitor's voltage with its ripple. */
  function wavePlot(top: number) {
    const box = { x: X(40), y: top + 12, w: w - X(40) - 28, h: 66 };
    s.height = box.y + box.h + 56;
    const { vp, vr, fr, vdc } = n;
    const yAxis = box.x;
    s.strokes.push(
      {
        pts: [P(yAxis, box.y + box.h), P(box.x + box.w, box.y + box.h)],
        tone: 'muted',
        width: 1.5,
      },
      { pts: [P(yAxis, box.y + box.h), P(yAxis, box.y)], tone: 'muted', width: 1.5 },
    );
    s.arrows.push({ p: P(box.x + box.w + 6, box.y + box.h), dx: 1, dy: 0, tone: 'muted' });
    s.arrows.push({ p: P(yAxis, box.y - 6), dx: 0, dy: -1, tone: 'muted' });
    lab('xName', box.x + box.w + 6, box.y + box.h - 8, 'end', 'muted', true);
    lab('yName', yAxis + 8, box.y + 2, 'start', 'muted', true);
    lab('peak', X(8), box.y + box.h + 22, 'start');
    lab('ripple', w - 4, box.y + box.h + 22, 'end');
    lab('dc', X(8), box.y + box.h + 40, 'start');
    lab('freq', w - 4, box.y + box.h + 40, 'end');
    if (vp === undefined || fr === undefined || vp <= 0 || fr <= 0) return;
    const periods = 3;
    const f = frame(box, [0, periods / fr], [0, vp * 1.15]);
    const bare = Array.from({ length: 121 }, (_, i) => {
      const tt = (periods / fr) * (i / 120);
      return f.P(tt, vp * Math.abs(Math.sin(Math.PI * fr * tt)));
    });
    s.strokes.push({ pts: bare, tone: 'muted', dash: true, width: 1.5 });
    if (vr !== undefined) {
      const { pts } = rippleWave(vp, vr, fr, periods);
      s.strokes.push({ pts: pts.map(([x, y]) => f.P(x, y)), tone: 'hi', width: 2.5 });
    }
    if (vdc !== undefined)
      s.strokes.push({
        pts: [f.P(0, vdc), f.P(periods / fr, vdc)],
        tone: 'ink',
        dash: true,
        width: 1.5,
      });
  }
}
