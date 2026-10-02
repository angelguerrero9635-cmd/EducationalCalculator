/**
 * Where each part of a passive-circuit schematic goes (HC7, NetSchematic.tsx), per topology, for
 * a canvas `w` px wide: the parts on their wires, the junction dots, the label spots chosen so
 * no two labels meet at phone width (labels of side elements go outside the loop, of top
 * elements above it, mesh arrows high in their mesh), and the canvas height. Pure geometry.
 */
import type { CircuitNet } from '@/data/modules/typesHe1h';

export interface Pt {
  x: number;
  y: number;
}

/** Where a block of label lines goes: its anchor point and how it sits on it. */
export interface Spot {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  /** `center`: lines centred on y; `above`: the last line's baseline at y; `below`: the first's. */
  at: 'center' | 'above' | 'below';
}

/** A part from `a` to `b`: an element (its index), the internal r, a short, the Thévenin V or R. */
export interface Slot {
  el: number | 'r' | 'short' | 'eqV' | 'eqR';
  a: Pt;
  b: Pt;
  spot?: Spot;
  /** Name-only label (the small one-source circuits of `superposition`). */
  nameOnly?: boolean;
  /** Which drawn circuit it belongs to (0 the main one): only the main one shows values. */
  copy?: number;
}

export interface Drawing {
  height: number;
  slots: Slot[];
  wires: Pt[][];
  /** Junction dots; `node` is an index into `net.nodes` when the dot carries its voltage. */
  dots: { p: Pt; node?: number; part?: number; spot?: Spot }[];
  /** Open terminals (a and b), each with its letter. */
  terminals: { p: Pt; letter: string; spot: Spot }[];
  grounds: Pt[];
  /** Mesh (or loop) arrows: centre, the label spot, index into `net.meshes` (or -1). */
  meshes: { c: Pt; spot: Spot; k: number }[];
  texts: { spot: Spot; text: string; muted?: boolean }[];
  /** Dashed boxes (the battery with r inside, the supernode). */
  boxes: { x: number; y: number; w: number; h: number; r?: number }[];
  /** The switch that closes at t = 0, hinge to contact on the top wire. */
  switchAt?: { a: Pt; b: Pt };
  /** The bridge's meter between its two middle nodes. */
  meter?: { c: Pt; spot: Spot };
  /** The spot for a block of extra lines (filter values, V_out, equivalents). */
  extra?: Spot;
}

const LINE = 16;
/** Vertical span of a loop. */
const H = 160;

/**
 * The layout of `net` at width `w`; `above` is the most label lines any part above a top wire
 * carries (it sets the top margin).
 */
export function layoutNet(net: CircuitNet, w: number, above: number): Drawing {
  const X = (f: number) => f * w;
  const T = 26 + LINE * Math.max(1, above);
  const B = T + H;
  const mid = (T + B) / 2;
  const P = (x: number, y: number): Pt => ({ x, y });
  const right = (x: number, y = mid): Spot => ({ x: x + 20, y, anchor: 'start', at: 'center' });
  const left = (x: number, y = mid): Spot => ({ x: x - 20, y, anchor: 'end', at: 'center' });
  const over = (x: number, y = T): Spot => ({ x, y: y - 16, anchor: 'middle', at: 'above' });
  const under = (x: number, y = B): Spot => ({ x, y: y + 24, anchor: 'middle', at: 'below' });
  const nodeSpot = (x: number, y = T): Spot => ({
    x: x + 7,
    y: y + 22,
    anchor: 'start',
    at: 'below',
  });
  const blank: Drawing = {
    height: B + 40,
    slots: [],
    wires: [],
    dots: [],
    terminals: [],
    grounds: [],
    meshes: [],
    texts: [],
    boxes: [],
  };
  const n = net.elements.length;
  const vert = (el: Slot['el'], x: number, spot?: Spot, top = T, bot = B): Slot => ({
    el,
    a: P(x, bot),
    b: P(x, top),
    spot,
  });
  const down = (el: Slot['el'], x: number, spot?: Spot, top = T, bot = B): Slot => ({
    el,
    a: P(x, top),
    b: P(x, bot),
    spot,
  });
  const across = (el: Slot['el'], x1: number, x2: number, y: number, spot?: Spot): Slot => ({
    el,
    a: P(x1, y),
    b: P(x2, y),
    spot,
  });
  const rect = (x1: number, x2: number, top = T, bot = B) => [
    [P(x1, top), P(x2, top)],
    [P(x1, bot), P(x2, bot)],
  ];

  switch (net.topology) {
    case 'series':
    case 'rc':
    case 'rl':
    case 'rlc': {
      const inner = !!net.internal;
      const x0 = X(inner ? 0.3 : 0.28);
      const xr = X(0.68);
      const switched = net.topology !== 'series';
      const s0 = x0 + 14;
      const s1 = x0 + 44;
      const slots: Slot[] = [];
      const wires: Pt[][] = [];
      // Left side: the first element (with r above it inside the battery box).
      if (inner) {
        slots.push(vert(0, x0, left(x0 - 10, T + 120), mid, B));
        slots.push(vert('r', x0, left(x0 - 10, T + 40), T, mid));
      } else slots.push(vert(0, x0, left(x0)));
      const top = n >= 3 ? 1 : -1;
      const side = n >= 3 ? 2 : 1;
      const bottom = n >= 4 ? 3 : -1;
      const tx = switched ? s1 : x0;
      if (top > 0) slots.push(across(top, tx, xr, T, over((tx + xr) / 2)));
      else wires.push([P(tx, T), P(xr, T)]);
      if (switched) wires.push([P(x0, T), P(s0, T)]);
      if (side < n) slots.push(down(side, xr, right(xr)));
      else wires.push([P(xr, T), P(xr, B)]);
      if (bottom > 0) slots.push(across(bottom, xr, x0, B, under((x0 + xr) / 2)));
      else wires.push([P(xr, B), P(x0, B)]);
      const corners = [P(x0, B), P(x0, T), P(xr, T), P(xr, B)];
      const loopCurrent = net.meshes?.[0] ?? net.branches?.[0];
      return {
        ...blank,
        height: B + (bottom > 0 || inner ? 34 + LINE * 2 : 30),
        slots,
        wires,
        // A node's voltage sits at the corner after its element, read inward.
        dots: (net.nodes ?? []).map((_, k) => {
          const c = corners[(k + 1) % 4]!;
          const sx = c.x < (x0 + xr) / 2 ? 1 : -1;
          const sy = c.y < mid ? 1 : -1;
          return {
            p: c,
            node: k,
            spot: {
              x: c.x + 8 * sx,
              y: c.y + 18 * sy,
              anchor: sx > 0 ? 'start' : 'end',
              at: 'center',
            },
          };
        }),
        grounds: net.nodes?.length ? [P(x0, B)] : [],
        meshes: loopCurrent
          ? [
              {
                c: P((x0 + xr) / 2, mid - 12),
                spot: { x: (x0 + xr) / 2, y: mid + 24, anchor: 'middle', at: 'below' },
                k: 0,
              },
            ]
          : [],
        boxes: inner ? [{ x: x0 - 24, y: T + 8, w: 48, h: H - 16, r: 6 }] : [],
        texts: inner
          ? [
              { spot: { x: x0 + 30, y: T + 22, anchor: 'start', at: 'center' }, text: '+' },
              { spot: { x: x0 + 30, y: B - 16, anchor: 'start', at: 'center' }, text: '−' },
            ]
          : [],
        switchAt: switched ? { a: P(s0, T), b: P(s1, T) } : undefined,
        extra: inner || bottom > 0 ? { x: x0, y: B + 26, anchor: 'start', at: 'below' } : undefined,
      };
    }

    case 'parallel': {
      const xs = n >= 4 ? [0.06, 0.3, 0.54, 0.78] : [0.08, 0.4, 0.7];
      const px = xs.slice(0, n).map(X);
      return {
        ...blank,
        slots: px.map((x, i) => (i === 0 ? vert(0, x, right(x)) : down(i, x, right(x)))),
        wires: rect(px[0]!, px[n - 1]!),
        dots: px.slice(1, -1).flatMap((x) => [{ p: P(x, T) }, { p: P(x, B) }]),
        grounds: [P(px[0]!, B)],
      };
    }

    case 'twoNode': {
      const [x0, n1, n2, xi] = [X(0.08), X(0.36), X(0.64), X(0.94)];
      return {
        ...blank,
        slots: [
          vert(0, x0, right(x0)),
          across(1, x0, n1, T, over((x0 + n1) / 2)),
          down(2, n1, right(n1)),
          across(3, n1, n2, T, over((n1 + n2) / 2)),
          down(4, n2, right(n2)),
          vert(5, xi, { x: w - 4, y: T - 12, anchor: 'end', at: 'above' }),
        ],
        wires: [
          [P(n2, T), P(xi, T)],
          [P(x0, B), P(xi, B)],
        ],
        dots: [
          { p: P(n1, T), node: 0, spot: nodeSpot(n1) },
          { p: P(n2, T), node: 1, spot: nodeSpot(n2) },
          { p: P(n1, B) },
          { p: P(n2, B) },
        ],
        grounds: [P((x0 + n1) / 2, B)],
      };
    }

    case 'twoMesh':
    case 'twoLoop': {
      const [x0, xm, xr] = [X(0.27), X(0.5), X(0.73)];
      const loops = net.topology === 'twoLoop';
      const meshSpot = (x: number): Spot => ({ x, y: T + 28, anchor: 'middle', at: 'above' });
      const meshes =
        net.meshes?.length || (loops && net.loops)
          ? [0, 1].map((k) => ({
              c: P(k ? (xm + xr) / 2 : (x0 + xm) / 2, T + 50),
              spot: meshSpot(k ? (xm + xr) / 2 : (x0 + xm) / 2),
              k: loops ? -1 : k,
            }))
          : [];
      const slots = loops
        ? [
            vert(0, x0, left(x0)),
            across(1, x0, xm, T, over((x0 + xm) / 2)),
            vert(2, xr, right(xr)),
            across(3, xr, xm, T, over((xm + xr) / 2)),
            down(4, xm, under(xm)),
          ]
        : [
            vert(0, x0, left(x0)),
            across(1, x0, xm, T, over((x0 + xm) / 2)),
            down(2, xm, under(xm)),
            across(3, xm, xr, T, over((xm + xr) / 2)),
            vert(4, xr, right(xr)),
          ];
      return {
        ...blank,
        slots,
        wires: [[P(x0, B), P(xr, B)]],
        dots: [
          { p: P(xm, T), node: loops ? 0 : undefined, spot: loops ? nodeSpot(xm) : undefined },
          { p: P(xm, B) },
        ],
        grounds: net.nodes?.length ? [P((x0 + xm) / 2, B)] : [],
        height: B + 60,
        meshes,
      };
    }

    case 'supernode': {
      const [x0, n1, n2] = [X(0.12), X(0.4), X(0.74)];
      return {
        ...blank,
        slots: [
          vert(0, x0, right(x0)),
          down(1, n1, right(n1)),
          across(2, n2, n1, T, over((n1 + n2) / 2, T - 14)),
          down(3, n2, right(n2)),
        ],
        wires: [
          [P(x0, T), P(n1, T)],
          [P(x0, B), P(n2, B)],
        ],
        dots: [
          { p: P(n1, T), node: 0, spot: nodeSpot(n1, T + 3) },
          { p: P(n2, T), node: 1, spot: nodeSpot(n2, T + 3) },
          { p: P(n1, B) },
        ],
        boxes: [{ x: n1 - 14, y: T - 18, w: n2 - n1 + 28, h: 52, r: 18 }],
        texts: [
          {
            spot: { x: (n1 + n2) / 2, y: T + 50, anchor: 'middle', at: 'center' },
            text: 'supernode',
            muted: true,
          },
        ],
        grounds: [P((x0 + n1) / 2, B)],
      };
    }

    case 'thevenin': {
      const [x0, n1, ta, xl] = [X(0.08), X(0.4), X(0.58), X(0.72)];
      const H2 = 130;
      const T2 = B + 64 + LINE * Math.max(1, above);
      const B2 = T2 + H2;
      const m2 = (T2 + B2) / 2;
      const eq = !!net.equivalent;
      const slots: Slot[] = [
        vert(0, x0, right(x0)),
        across(1, x0, n1, T, over((x0 + n1) / 2)),
        down(2, n1, right(n1)),
        down(3, xl, right(xl)),
      ];
      const terminals = (top: number, bot: number) => [
        {
          p: P(ta, top),
          letter: 'a',
          spot: { x: ta, y: top - 8, anchor: 'middle', at: 'above' } as Spot,
        },
        {
          p: P(ta, bot),
          letter: 'b',
          spot: { x: ta, y: bot + 18, anchor: 'middle', at: 'below' } as Spot,
        },
      ];
      return {
        ...blank,
        height: eq ? B2 + 34 : B + 34,
        slots: eq
          ? [
              ...slots,
              vert('eqV', x0, right(x0, m2), T2, B2),
              across('eqR', x0, ta, T2, over((x0 + ta) / 2, T2)),
              { el: 3, a: P(xl, T2), b: P(xl, B2), spot: right(xl, m2) },
            ]
          : slots,
        wires: [
          [P(n1, T), P(xl, T)],
          [P(x0, B), P(xl, B)],
          ...(eq
            ? [
                [P(ta, T2), P(xl, T2)],
                [P(x0, B2), P(xl, B2)],
              ]
            : []),
        ],
        dots: [{ p: P(n1, T) }, { p: P(n1, B) }],
        terminals: [...terminals(T, B), ...(eq ? terminals(T2, B2) : [])],
        texts: eq
          ? [
              {
                spot: { x: 6, y: B + 46, anchor: 'start', at: 'center' },
                text: 'Thévenin equivalent, the same load:',
                muted: true,
              },
            ]
          : [],
      };
    }

    case 'norton': {
      const [x0, xm, ta] = [X(0.1), X(0.4), X(0.62)];
      const H2 = 120;
      const T1 = T;
      const B1 = T1 + H2;
      const T2 = B1 + 40 + LINE * Math.max(1, above);
      const B2 = T2 + H2;
      const term = (top: number, bot: number) => [
        {
          p: P(ta, top),
          letter: 'a',
          spot: { x: ta, y: top - 8, anchor: 'middle', at: 'above' } as Spot,
        },
        {
          p: P(ta, bot),
          letter: 'b',
          spot: { x: ta, y: bot + 18, anchor: 'middle', at: 'below' } as Spot,
        },
      ];
      const label = (y: number, text: string) => ({
        spot: { x: ta + 18, y, anchor: 'start', at: 'center' } as Spot,
        text,
        muted: true,
      });
      return {
        ...blank,
        height: B2 + 34,
        slots: [
          vert(0, x0, right(x0, (T1 + B1) / 2), T1, B1),
          across(1, x0, ta, T1, over((x0 + ta) / 2, T1)),
          vert(2, x0, right(x0, (T2 + B2) / 2), T2, B2),
          { ...down(1, xm, right(xm, (T2 + B2) / 2), T2, B2), copy: 1 },
        ],
        wires: [
          [P(x0, B1), P(ta, B1)],
          [P(x0, T2), P(ta, T2)],
          [P(x0, B2), P(ta, B2)],
        ],
        dots: [{ p: P(xm, T2) }, { p: P(xm, B2) }],
        terminals: [...term(T1, B1), ...term(T2, B2)],
        texts: [label((T1 + B1) / 2, 'Thévenin form'), label((T2 + B2) / 2, 'Norton form')],
      };
    }

    case 'superposition': {
      const [x0, n1, xi] = [X(0.08), X(0.42), X(0.76)];
      const hw = w / 2;
      const H2 = 100;
      const T2 = B + 70;
      const B2 = T2 + H2;
      const m2 = (T2 + B2) / 2;
      const slots: Slot[] = [
        vert(0, x0, right(x0)),
        across(1, x0, n1, T, over((x0 + n1) / 2)),
        down(2, n1, right(n1)),
        vert(3, xi, right(xi)),
      ];
      const wires: Pt[][] = [
        [P(n1, T), P(xi, T)],
        [P(x0, B), P(xi, B)],
      ];
      const dots: Drawing['dots'] = [{ p: P(n1, T), node: 0, spot: nodeSpot(n1) }, { p: P(n1, B) }];
      const texts: Drawing['texts'] = [];
      const parts = !!net.parts;
      if (parts)
        [0, 1].forEach((k) => {
          const ox = k * hw;
          const [s, m, c] = [ox + 0.1 * hw, ox + 0.56 * hw, ox + 0.88 * hw];
          const nameRight: Spot = { x: s + 16, y: m2, anchor: 'start', at: 'center' };
          const nameLeft = (x: number): Spot => ({ x: x - 14, y: m2, anchor: 'end', at: 'center' });
          slots.push(
            k === 0
              ? { ...vert(0, s, nameRight, T2, B2), nameOnly: true, copy: 1 }
              : { ...vert('short', s, undefined, T2, B2), copy: 2 },
            {
              ...across(1, s, m, T2, { x: (s + m) / 2, y: T2 - 14, anchor: 'middle', at: 'above' }),
              nameOnly: true,
              copy: 1 + k,
            },
            { ...down(2, m, nameLeft(m), T2, B2), nameOnly: true, copy: 1 + k },
          );
          if (k === 1) slots.push({ ...vert(3, c, nameLeft(c), T2, B2), nameOnly: true, copy: 2 });
          wires.push([P(m, T2), P(k ? c : m, T2)], [P(s, B2), P(k ? c : m, B2)]);
          dots.push({
            p: P(m, T2),
            part: k,
            spot: { x: m + 6, y: T2 - 8, anchor: 'start', at: 'above' },
          });
          texts.push({
            spot: { x: ox + hw / 2, y: T2 - 32, anchor: 'middle', at: 'above' },
            text: k ? 'Iₛ alone (Vₛ shorted)' : 'Vₛ alone (Iₛ open)',
            muted: true,
          });
        });
      return { ...blank, height: parts ? B2 + 30 : B + 30, slots, wires, dots, texts };
    }

    case 'element': {
      const bx = X(0.36);
      return {
        ...blank,
        slots: [down(0, bx, right(bx + 4))],
        dots: [{ p: P(bx, T) }, { p: P(bx, B) }],
        texts: [
          { spot: { x: bx - 26, y: mid - 26, anchor: 'end', at: 'center' }, text: '+' },
          { spot: { x: bx - 26, y: mid + 30, anchor: 'end', at: 'center' }, text: '−' },
        ],
        extra: { x: bx + 16, y: T + 18, anchor: 'start', at: 'center' },
      };
    }

    case 'bridge': {
      const x0 = X(0.06);
      const xc = X(0.6);
      const hx = X(0.2);
      const top = P(xc, T);
      const lft = P(xc - hx, mid);
      const rgt = P(xc + hx, mid);
      const bot = P(xc, B);
      const armSpot = (p: Pt, q: Pt, sx: number, sy: number): Spot => ({
        x: (p.x + q.x) / 2 + 16 * sx,
        y: (p.y + q.y) / 2 + 16 * sy,
        anchor: sx < 0 ? 'end' : 'start',
        at: 'center',
      });
      return {
        ...blank,
        height: B + 30 + LINE * 3,
        slots: [
          vert(0, x0, right(x0)),
          { el: 1, a: top, b: lft, spot: armSpot(top, lft, -1, -1) },
          { el: 2, a: lft, b: bot, spot: armSpot(lft, bot, -1, 1) },
          { el: 3, a: top, b: rgt, spot: armSpot(top, rgt, 1, -1) },
          { el: 4, a: rgt, b: bot, spot: armSpot(rgt, bot, 1, 1) },
        ],
        wires: [
          [P(x0, T), top],
          [P(x0, B), bot],
          [lft, P(xc - 14, mid)],
          [P(xc + 14, mid), rgt],
        ],
        dots: [{ p: top }, { p: lft }, { p: rgt }, { p: bot }],
        meter: { c: P(xc, mid), spot: { x: xc, y: B + 26, anchor: 'middle', at: 'below' } },
      };
    }

    case 'lowpass': {
      const [x0, n1, xo] = [X(0.1), X(0.5), X(0.8)];
      return {
        ...blank,
        height: B + 30 + LINE * 3,
        slots: [
          vert(0, x0, right(x0)),
          across(1, x0, n1, T, over((x0 + n1) / 2)),
          down(2, n1, right(n1)),
        ],
        wires: [
          [P(n1, T), P(xo, T)],
          [P(x0, B), P(xo, B)],
        ],
        dots: [
          { p: P(n1, T), node: 0, spot: { x: xo, y: T - 12, anchor: 'middle', at: 'above' } },
          { p: P(n1, B) },
        ],
        terminals: [
          {
            p: P(xo, T),
            letter: '+',
            spot: { x: xo + 10, y: T + 18, anchor: 'start', at: 'center' },
          },
          {
            p: P(xo, B),
            letter: '−',
            spot: { x: xo + 10, y: B - 12, anchor: 'start', at: 'center' },
          },
        ],
        texts: [
          { spot: { x: xo + 10, y: mid, anchor: 'start', at: 'center' }, text: 'out', muted: true },
        ],
        grounds: [P((x0 + n1) / 2, B)],
        extra: { x: 8, y: B + 30, anchor: 'start', at: 'below' },
      };
    }

    case 'seriesParallel':
    case 'parallelSeries': {
      const sp = net.topology === 'seriesParallel';
      const [x0, xa, xb] = sp ? [X(0.08), X(0.42), X(0.74)] : [X(0.08), X(0.36), X(0.7)];
      return {
        ...blank,
        height: B + 30 + (net.total ? LINE : 0),
        slots: sp
          ? [
              vert(0, x0, right(x0)),
              across(1, x0, xa, T, over((x0 + xa) / 2)),
              down(2, xa, right(xa)),
              down(3, xb, right(xb)),
            ]
          : [
              vert(0, x0, { x: 4, y: T - 12, anchor: 'start', at: 'above' }),
              across(1, xa, xb, T, over((xa + xb) / 2)),
              down(2, xb, right(xb)),
              down(3, xa, right(xa)),
            ],
        wires: sp
          ? [
              [P(xa, T), P(xb, T)],
              [P(x0, B), P(xb, B)],
            ]
          : [
              [P(x0, T), P(xa, T)],
              [P(x0, B), P(xb, B)],
            ],
        dots: [{ p: P(xa, T) }, { p: P(xa, B) }],
        extra: net.total ? { x: w / 2, y: B + 24, anchor: 'middle', at: 'below' } : undefined,
      };
    }
  }
}
