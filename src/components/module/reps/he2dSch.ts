/**
 * The drawing list behind the op-amp and semiconductor schematics (HC18, HC39): parts on their
 * wires, op-amp triangles, transistors, label lines and the small plots under a circuit, as
 * plain data, so the layouts (ampLayout.ts, deviceLayout.ts) are pure geometry and a test can
 * check them for overlaps. Drawn by he2dKit.tsx with round 1's part symbols (NetSchematic.tsx).
 */
import { subscriptRuns } from '@/engine/subscripts';

export interface Pt {
  x: number;
  y: number;
}

/** R, C and the sources as round 1 draws them; D a diode, Z a zener, G a dependent current source. */
export type SymKind = 'R' | 'C' | 'V' | 'Vac' | 'I' | 'D' | 'Z' | 'G';

/** A part from `a` to `b` (a source's + and a diode's cathode toward `b`). */
export interface Sym {
  kind: SymKind;
  a: Pt;
  b: Pt;
}

/** An op-amp: its left edge `x`, centre line `y`; which input is on top; rail stubs or not. */
export interface OpAmp {
  x: number;
  y: number;
  plusTop: boolean;
  rails: boolean;
  /** A name inside (A₁, A₂, A₃). */
  name?: string;
}

/** A transistor: its body centre, base or gate lead to the left, collector or drain on top. */
export interface Device3 {
  kind: 'npn' | 'nmos';
  x: number;
  y: number;
  /** Drawn faded with the reason in the caption (a BJT out of the active region). */
  faded?: boolean;
}

export type Tone = 'ink' | 'hi' | 'muted';

/** One line of text, `y` its baseline. A symbol before " = " is set in italics. */
export interface Lab {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  text: string;
  tone?: Tone;
  /** No italic symbol (a word, an axis name). */
  plain?: boolean;
}

/** A line of a plot (an axis, a curve, a dashed level). */
export interface Stroke {
  pts: Pt[];
  tone?: Tone;
  dash?: boolean;
  width?: number;
}

/** An arrowhead at `p` pointing along (dx, dy). */
export interface Arrow {
  p: Pt;
  dx: number;
  dy: number;
  tone?: Tone;
}

export interface Sch {
  height: number;
  syms: Sym[];
  wires: Pt[][];
  dots: Pt[];
  grounds: Pt[];
  terminals: Pt[];
  amps: OpAmp[];
  devices: Device3[];
  labels: Lab[];
  strokes: Stroke[];
  arrows: Arrow[];
  /** Marked points (a plot's point at the page's values). */
  points: { p: Pt; tone?: Tone }[];
}

export const emptySch = (height: number): Sch => ({
  height,
  syms: [],
  wires: [],
  dots: [],
  grounds: [],
  terminals: [],
  amps: [],
  devices: [],
  labels: [],
  strokes: [],
  arrows: [],
  points: [],
});

/** Label text size (chart.label). */
export const SIZE = 12;

/** A text's width at `size`: subscripts count smaller. */
export function textWidth(text: string, size = SIZE): number {
  return subscriptRuns(text).reduce(
    (sum, r) => sum + [...r.s].length * size * (r.sub ? 0.45 : 0.6),
    0,
  );
}

/** Where a label lands in a canvas `w` wide (slid in from an edge) and the box it takes. */
export function labBox(l: Lab, w: number) {
  const width = textWidth(l.text);
  const left0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - width : l.x - width / 2;
  const left = Math.max(3, Math.min(w - 3 - width, left0));
  const x = l.anchor === 'start' ? left : l.anchor === 'end' ? left + width : left + width / 2;
  return { x, left, right: left + width, top: l.y - SIZE * 0.78, bottom: l.y + SIZE * 0.22 };
}

/** The op-amp's geometry: its inputs, output, triangle and rail stubs. */
export function ampGeom(a: OpAmp) {
  const L = 60;
  const H = 32;
  const top = { x: a.x, y: a.y - 16 };
  const bot = { x: a.x, y: a.y + 16 };
  const sx = a.x + 24;
  const edge = H - (24 * H) / L;
  return {
    minus: a.plusTop ? bot : top,
    plus: a.plusTop ? top : bot,
    out: { x: a.x + L, y: a.y },
    tri: [
      { x: a.x, y: a.y - H },
      { x: a.x + L, y: a.y },
      { x: a.x, y: a.y + H },
    ],
    railTop: [
      { x: sx, y: a.y - edge },
      { x: sx, y: a.y - edge - 10 },
    ],
    railBot: [
      { x: sx, y: a.y + edge },
      { x: sx, y: a.y + edge + 10 },
    ],
  };
}

/** A transistor's leads: base or gate (left), collector or drain (top), emitter or source (bottom). */
export function devGeom(d: Device3) {
  return {
    gate: { x: d.x - 24, y: d.y },
    top: { x: d.x + 8, y: d.y - 30 },
    bottom: { x: d.x + 8, y: d.y + 30 },
  };
}

/** A small plot frame: maps (x, y) in data units to the canvas. */
export function frame(
  box: { x: number; y: number; w: number; h: number },
  xr: [number, number],
  yr: [number, number],
) {
  const X = (v: number) => box.x + ((v - xr[0]) / (xr[1] - xr[0] || 1)) * box.w;
  const Y = (v: number) => box.y + box.h - ((v - yr[0]) / (yr[1] - yr[0] || 1)) * box.h;
  return { X, Y, P: (x: number, y: number): Pt => ({ x: X(x), y: Y(y) }) };
}

/** Pairs of labels that overlap, and labels cut off at the canvas edges (for tests). */
export function labelClashes(s: Sch, w: number): string[] {
  const out: string[] = [];
  const boxes = s.labels.map((l) => ({ l, b: labBox(l, w) }));
  boxes.forEach(({ l, b }, i) => {
    if (b.left < 0 || b.right > w || b.top < 0 || b.bottom > s.height)
      out.push(`"${l.text}" is cut off`);
    for (const { l: m, b: c } of boxes.slice(i + 1))
      if (b.left < c.right && c.left < b.right && b.top < c.bottom && c.top < b.bottom)
        out.push(`"${l.text}" overlaps "${m.text}"`);
  });
  return out;
}

/** Labels that sit on a wire, a part or an op-amp (for tests). */
export function labelsOnLines(s: Sch, w: number): string[] {
  const out: string[] = [];
  const segs: [Pt, Pt, string][] = [];
  s.wires.forEach((p) => p.slice(1).forEach((q, i) => segs.push([p[i]!, q, 'a wire'])));
  s.syms.forEach((p) => segs.push([p.a, p.b, `part ${p.kind}`]));
  s.strokes.forEach((p) => p.pts.slice(1).forEach((q, i) => segs.push([p.pts[i]!, q, 'a line'])));
  s.amps.forEach((a) => {
    const g = ampGeom(a);
    segs.push([g.tri[0]!, g.tri[1]!, 'an op-amp'], [g.tri[1]!, g.tri[2]!, 'an op-amp']);
    segs.push([g.tri[0]!, g.tri[2]!, 'an op-amp']);
    if (a.rails)
      segs.push([g.railTop[0]!, g.railTop[1]!, 'a rail'], [g.railBot[0]!, g.railBot[1]!, 'a rail']);
  });
  s.devices.forEach((d) => {
    const [l, r, t, b] = [d.x - 22, d.x + 10, d.y - 20, d.y + 20];
    segs.push(
      [{ x: l, y: t }, { x: r, y: t }, 'a transistor'],
      [{ x: l, y: b }, { x: r, y: b }, 'a transistor'],
      [{ x: l, y: t }, { x: l, y: b }, 'a transistor'],
      [{ x: r, y: t }, { x: r, y: b }, 'a transistor'],
    );
  });
  for (const l of s.labels) {
    const b = labBox(l, w);
    const box = { left: b.left + 1, right: b.right - 1, top: b.top + 1, bottom: b.bottom - 1 };
    for (const [p, q, what] of segs) {
      // A part's body is wider than its wire: pad parts by their half-width.
      const pad = what.startsWith('part') ? 7 : 0;
      if (segmentHitsBox(p, q, box, pad)) {
        out.push(`"${l.text}" sits on ${what}`);
        break;
      }
    }
  }
  return out;
}

function segmentHitsBox(
  p: Pt,
  q: Pt,
  b: { left: number; right: number; top: number; bottom: number },
  pad: number,
) {
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const x = p.x + ((q.x - p.x) * i) / n;
    const y = p.y + ((q.y - p.y) * i) / n;
    if (x > b.left - pad && x < b.right + pad && y > b.top - pad && y < b.bottom + pad) return true;
  }
  return false;
}
