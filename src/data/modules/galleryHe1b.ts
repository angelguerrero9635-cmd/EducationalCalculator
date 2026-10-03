/**
 * College gallery demos, round 1, group B (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC3 `section` (ME-P3 in docs/plans/he.mechanical.md, ACC-P6 in
 * docs/plans/he.aero-civil-chemical.md): centroids, second moments, the stress blocks, an RC
 * beam's Whitney block, RC columns and a closed thin-walled cell.
 */
import type { Values, VariableDef } from '@/engine/types';
import { getUnit } from '@/engine/units';

import type { LayoutDef } from './layouts';
import type { ModuleDef, Representation, StepText } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const div = (a: number, b: number) => (b === 0 ? undefined : a / b);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));
const root4 = (x: number) => (x < 0 ? undefined : x ** 0.25);

type Fn = (x: Values) => number | number[] | undefined;
/** One rearrangement: how to find the value, its expression and why. */
type Way = [fn: Fn, expr: string, how: string];

interface Rule {
  id: string;
  display: string;
  vars: string[];
  residual: (x: Values) => number;
  /** Rearrangements; a variable listed as `null` is one this rule can't give alone. */
  ways: Record<string, Way | null>;
}

/** A module from its rules: the relations and their step text together. */
function demo(m: {
  id: string;
  title: string;
  use: string;
  assumptions: string[];
  variables: VariableDef[];
  rules: Rule[];
  example: Values;
  startWith: string[];
  representation: Representation;
  pictureLabels?: string[];
  us?: boolean;
}): ModuleDef {
  const steps: Record<string, Record<string, StepText>> = {};
  const relations = m.rules.map((r) => {
    steps[r.id] = {};
    const solve: Record<string, Fn> = {};
    for (const [id, way] of Object.entries(r.ways)) {
      if (!way) {
        solve[id] = () => undefined;
        continue;
      }
      solve[id] = way[0];
      steps[r.id]![id] = { expr: way[1], how: way[2] };
    }
    return { id: r.id, display: r.display, vars: r.vars, residual: r.residual, solve };
  });
  return {
    id: m.id,
    title: m.title,
    use: m.use,
    assumptions: m.assumptions,
    // Each value keeps the unit the page writes it in (no km or mi menus on a section).
    variables: m.variables.map((v) => (getUnit(v.unit) ? { ...v, units: [v.unit!] } : v)),
    relations,
    steps,
    example: m.example,
    startWith: m.startWith,
    representation: m.representation,
    unitSystems: [m.us ? 'us' : 'metric'],
    ...(m.pictureLabels ? { pictureLabels: m.pictureLabels } : {}),
  };
}

/** A length in mm (or another unit). */
const len = (
  id: string,
  symbol: string,
  name: string,
  unit = 'mm',
  max = 5000,
  min = 0.1,
): VariableDef => ({ id, symbol, name, unit, min, max, step: unit === 'mm' ? 1 : 0.1 });
const plain = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  more: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, ...more });
const big = (id: string, symbol: string, name: string, unit: string, max = 1e15): VariableDef => ({
  id,
  symbol,
  name,
  unit,
  min: 0.001,
  max,
  scientific: true,
});

/** A product rule a = b × c, every way round. */
function product(id: string, a: string, b: string, c: string, what: string): Rule {
  return {
    id,
    display: `{${a}} = {${b}} × {${c}}`,
    vars: [a, b, c],
    residual: (x) => x[a]! - x[b]! * x[c]!,
    ways: {
      [a]: [(x) => x[b]! * x[c]!, `{${b}} × {${c}}`, `Multiply: ${what}.`],
      [b]: [(x) => div(x[a]!, x[c]!), `{${a}} ÷ {${c}}`, `Divide both sides by the other factor.`],
      [c]: [(x) => div(x[a]!, x[b]!), `{${a}} ÷ {${b}}`, `Divide both sides by the other factor.`],
    },
  };
}

// ─── Statics: centroids (he.engineering.statics#2) ───────────────────────────

const yOfT = (x: Values) => div(x.A1! * (x.hw! + x.tf! / 2) + (x.A2! * x.hw!) / 2, x.A1! + x.A2!);

const tee = demo({
  id: 'g.he-section-tee',
  title: 'Centroid of a T-section',
  use: 'Use this for “A T-beam has a 100 × 20 mm flange on an 80 × 20 mm web. How high is its centroid?”',
  assumptions: [
    'The T is two rectangles: the flange on top of the web, both centered on one vertical line.',
    'ȳ is measured up from the bottom of the web (the reference axis).',
    'Each rectangle’s area acts at its own center, so ȳ = ΣAy ÷ ΣA.',
  ],
  variables: [
    len('bf', 'b_f', 'Flange width'),
    len('tf', 't_f', 'Flange thickness'),
    len('hw', 'h_w', 'Web height'),
    len('tw', 't_w', 'Web thickness'),
    plain('A1', 'A₁', 'Flange area', 'mm²', 0.01, 1e8),
    plain('A2', 'A₂', 'Web area', 'mm²', 0.01, 1e8),
    plain('y', 'ȳ', 'Centroid height from the bottom', 'mm', 0, 1e4),
  ],
  rules: [
    product('A₁ = b_f t_f', 'A1', 'bf', 'tf', 'the flange is b_f wide and t_f thick'),
    product('A₂ = t_w h_w', 'A2', 'tw', 'hw', 'the web is t_w wide and h_w tall'),
    {
      id: 'ȳ = ΣAy ÷ ΣA',
      display: '{y} = ({A1} × ({hw} + {tf} ÷ 2) + {A2} × {hw} ÷ 2) ÷ ({A1} + {A2})',
      vars: ['y', 'A1', 'A2', 'hw', 'tf'],
      residual: (x) => x.y! * (x.A1! + x.A2!) - x.A1! * (x.hw! + x.tf! / 2) - (x.A2! * x.hw!) / 2,
      ways: {
        y: [
          yOfT,
          '({A1} × ({hw} + {tf} ÷ 2) + {A2} × {hw} ÷ 2) ÷ ({A1} + {A2})',
          'Each area times the height of its own center (the flange’s at h_w + t_f ÷ 2, the web’s at h_w ÷ 2), added, then divided by the whole area.',
        ],
        A1: [
          (x) => div(x.A2! * (x.hw! / 2 - x.y!), x.y! - x.hw! - x.tf! / 2),
          '{A2} × ({hw} ÷ 2 − {y}) ÷ ({y} − {hw} − {tf} ÷ 2)',
          'Multiply out ȳ(A₁ + A₂), gather the A₁ terms on one side, and divide by what multiplies A₁.',
        ],
        A2: [
          (x) => div(x.A1! * (x.y! - x.hw! - x.tf! / 2), x.hw! / 2 - x.y!),
          '{A1} × ({y} − {hw} − {tf} ÷ 2) ÷ ({hw} ÷ 2 − {y})',
          'Multiply out ȳ(A₁ + A₂), gather the A₂ terms on one side, and divide by what multiplies A₂.',
        ],
        hw: [
          (x) => div(x.y! * (x.A1! + x.A2!) - (x.A1! * x.tf!) / 2, x.A1! + x.A2! / 2),
          '({y} × ({A1} + {A2}) − {A1} × {tf} ÷ 2) ÷ ({A1} + {A2} ÷ 2)',
          'Multiply out both sides; h_w appears as A₁h_w + A₂h_w ÷ 2, so divide by A₁ + A₂ ÷ 2.',
        ],
        tf: [
          (x) => div(2 * (x.y! * (x.A1! + x.A2!) - x.A1! * x.hw! - (x.A2! * x.hw!) / 2), x.A1!),
          '2 × ({y} × ({A1} + {A2}) − {A1} × {hw} − {A2} × {hw} ÷ 2) ÷ {A1}',
          'Multiply out both sides, keep the A₁t_f ÷ 2 term alone, then multiply by 2 and divide by A₁.',
        ],
      },
    },
  ],
  example: { bf: 100, tf: 20, hw: 80, tw: 20, A1: 2000, A2: 1600, y: 244000 / 3600 },
  startWith: ['bf', 'tf', 'hw', 'tw'],
  representation: {
    kind: 'section',
    shape: 'tee',
    bf: 'bf',
    tf: 'tf',
    hw: 'hw',
    tw: 'tw',
    centroid: { y: 'y' },
  },
  pictureLabels: ['A1', 'A2'],
});

const xOfHole = (x: Values) => div((x.Ap! * x.b!) / 2 - x.Ah! * x.xh!, x.Ap! - x.Ah!);

const hole = demo({
  id: 'g.he-section-hole',
  title: 'Centroid of a plate with a hole',
  use: 'Use this for “A 200 × 100 mm plate has a 40 mm hole centered 150 mm from its left edge. Where is the centroid?”',
  assumptions: [
    'The hole is a negative area: the plate’s area minus the hole’s, and the plate’s moment minus the hole’s.',
    'x̄ is measured from the left edge; the hole sits at mid-height, so ȳ stays at h ÷ 2.',
  ],
  variables: [
    len('b', 'w', 'Plate width'),
    len('h', 'h', 'Plate height'),
    len('dh', 'd', 'Hole diameter'),
    len('xh', 'x_h', 'Hole center from the left edge'),
    plain('Ap', 'A₁', 'Plate area', 'mm²', 0.01, 1e8),
    plain('Ah', 'A₂', 'Hole area', 'mm²', 0.01, 1e8),
    plain('x', 'x̄', 'Centroid from the left edge', 'mm', -1e4, 1e4),
  ],
  rules: [
    product('A₁ = wh', 'Ap', 'b', 'h', 'the plate is w wide and h high'),
    {
      id: 'A₂ = πd² ÷ 4',
      display: '{Ah} = π × {dh}² ÷ 4',
      vars: ['Ah', 'dh'],
      residual: (x) => x.Ah! - (Math.PI * x.dh! ** 2) / 4,
      ways: {
        Ah: [
          (x) => (Math.PI * x.dh! ** 2) / 4,
          'π × {dh}² ÷ 4',
          'A circle’s area is π times its diameter squared, divided by 4.',
        ],
        dh: [
          (x) => root((4 * x.Ah!) / Math.PI),
          '√(4 × {Ah} ÷ π)',
          'Multiply by 4, divide by π, then take the square root.',
        ],
      },
    },
    {
      id: 'x̄ = ΣAx ÷ ΣA',
      display: '{x} = ({Ap} × {b} ÷ 2 − {Ah} × {xh}) ÷ ({Ap} − {Ah})',
      vars: ['x', 'Ap', 'b', 'Ah', 'xh'],
      residual: (x) => x.x! * (x.Ap! - x.Ah!) - (x.Ap! * x.b!) / 2 + x.Ah! * x.xh!,
      ways: {
        x: [
          xOfHole,
          '({Ap} × {b} ÷ 2 − {Ah} × {xh}) ÷ ({Ap} − {Ah})',
          'The plate’s moment about the left edge minus the hole’s, divided by the area left.',
        ],
        Ap: [
          (x) => div(x.Ah! * (x.x! - x.xh!), x.x! - x.b! / 2),
          '{Ah} × ({x} − {xh}) ÷ ({x} − {b} ÷ 2)',
          'Multiply out x̄(A₁ − A₂), gather the A₁ terms, and divide by what multiplies A₁.',
        ],
        Ah: [
          (x) => div(x.Ap! * (x.b! / 2 - x.x!), x.xh! - x.x!),
          '{Ap} × ({b} ÷ 2 − {x}) ÷ ({xh} − {x})',
          'Multiply out x̄(A₁ − A₂), gather the A₂ terms, and divide by what multiplies A₂.',
        ],
        b: [
          (x) => div(2 * (x.x! * (x.Ap! - x.Ah!) + x.Ah! * x.xh!), x.Ap!),
          '2 × ({x} × ({Ap} − {Ah}) + {Ah} × {xh}) ÷ {Ap}',
          'Add the hole’s moment to x̄ times the area left, then multiply by 2 and divide by A₁.',
        ],
        xh: [
          (x) => div((x.Ap! * x.b!) / 2 - x.x! * (x.Ap! - x.Ah!), x.Ah!),
          '({Ap} × {b} ÷ 2 − {x} × ({Ap} − {Ah})) ÷ {Ah}',
          'The hole’s moment is the plate’s minus the whole section’s; divide it by the hole’s area.',
        ],
      },
    },
  ],
  example: (() => {
    const Ap = 20000;
    const Ah = Math.PI * 400;
    return { b: 200, h: 100, dh: 40, xh: 150, Ap, Ah, x: (Ap * 100 - Ah * 150) / (Ap - Ah) };
  })(),
  startWith: ['b', 'h', 'dh', 'xh'],
  representation: {
    kind: 'section',
    shape: 'hole',
    b: 'b',
    h: 'h',
    hole: { d: 'dh', x: 'xh' },
    centroid: { x: 'x' },
  },
  pictureLabels: ['Ap', 'Ah'],
});

const yOfL = (x: Values) => div(x.t! * (x.h! ** 2 + x.b! * x.t! - x.t! ** 2), 2 * x.A!);
const xOfL = (x: Values) => div(x.t! * (x.h! * x.t! + x.b! ** 2 - x.t! ** 2), 2 * x.A!);

const angle = demo({
  id: 'g.he-section-angle',
  title: 'Centroid of an angle',
  use: 'Use this for “Where is the centroid of a 100 × 75 × 10 mm angle?”',
  assumptions: [
    'The L is two rectangles: the vertical leg h × t and the rest of the bottom leg (b − t) × t.',
    'x̄ and ȳ are measured from the outside corner, along the bottom and up the back.',
  ],
  variables: [
    len('b', 'b', 'Bottom leg length'),
    len('h', 'h', 'Upright leg length'),
    len('t', 't', 'Leg thickness'),
    plain('A', 'A', 'Area', 'mm²', 0.01, 1e8),
    plain('x', 'x̄', 'Centroid from the back', 'mm', 0, 1e4),
    plain('y', 'ȳ', 'Centroid from the bottom', 'mm', 0, 1e4),
  ],
  rules: [
    {
      id: 'A = t(b + h − t)',
      display: '{A} = {t} × ({b} + {h} − {t})',
      vars: ['A', 't', 'b', 'h'],
      residual: (x) => x.A! - x.t! * (x.b! + x.h! - x.t!),
      ways: {
        A: [
          (x) => x.t! * (x.b! + x.h! - x.t!),
          '{t} × ({b} + {h} − {t})',
          'Two legs t thick, less the corner square counted twice.',
        ],
        b: [
          (x) => div(x.A!, x.t!)! - x.h! + x.t!,
          '{A} ÷ {t} − {h} + {t}',
          'Divide by t, then take away h and add t back.',
        ],
        h: [
          (x) => div(x.A!, x.t!)! - x.b! + x.t!,
          '{A} ÷ {t} − {b} + {t}',
          'Divide by t, then take away b and add t back.',
        ],
        t: null,
      },
    },
    {
      id: 'x̄ = ΣAx ÷ ΣA',
      display: '{x} = {t} × ({h} × {t} + {b}² − {t}²) ÷ (2 × {A})',
      vars: ['x', 't', 'h', 'b', 'A'],
      residual: (x) => 2 * x.A! * x.x! - x.t! * (x.h! * x.t! + x.b! ** 2 - x.t! ** 2),
      ways: {
        x: [
          xOfL,
          '{t} × ({h} × {t} + {b}² − {t}²) ÷ (2 × {A})',
          'The upright leg’s moment ht × t ÷ 2 plus the bottom leg’s (b − t)t × (b + t) ÷ 2, divided by A.',
        ],
        A: [
          (x) => div(x.t! * (x.h! * x.t! + x.b! ** 2 - x.t! ** 2), 2 * x.x!),
          '{t} × ({h} × {t} + {b}² − {t}²) ÷ (2 × {x})',
          'Swap A and x̄: divide the moment by 2x̄.',
        ],
        h: [
          (x) => div((2 * x.A! * x.x!) / x.t! - x.b! ** 2 + x.t! ** 2, x.t!),
          '(2 × {A} × {x} ÷ {t} − {b}² + {t}²) ÷ {t}',
          'Multiply by 2A, divide by t, take away b² − t², then divide by t.',
        ],
        b: null,
        t: null,
      },
    },
    {
      id: 'ȳ = ΣAy ÷ ΣA',
      display: '{y} = {t} × ({h}² + {b} × {t} − {t}²) ÷ (2 × {A})',
      vars: ['y', 't', 'h', 'b', 'A'],
      residual: (x) => 2 * x.A! * x.y! - x.t! * (x.h! ** 2 + x.b! * x.t! - x.t! ** 2),
      ways: {
        y: [
          yOfL,
          '{t} × ({h}² + {b} × {t} − {t}²) ÷ (2 × {A})',
          'The upright leg’s moment ht × h ÷ 2 plus the bottom leg’s (b − t)t × t ÷ 2, divided by A.',
        ],
        A: [
          (x) => div(x.t! * (x.h! ** 2 + x.b! * x.t! - x.t! ** 2), 2 * x.y!),
          '{t} × ({h}² + {b} × {t} − {t}²) ÷ (2 × {y})',
          'Swap A and ȳ: divide the moment by 2ȳ.',
        ],
        b: [
          (x) => div((2 * x.A! * x.y!) / x.t! - x.h! ** 2 + x.t! ** 2, x.t!),
          '(2 × {A} × {y} ÷ {t} − {h}² + {t}²) ÷ {t}',
          'Multiply by 2A, divide by t, take away h² − t², then divide by t.',
        ],
        h: null,
        t: null,
      },
    },
  ],
  example: (() => {
    const [b, h, t] = [100, 75, 10];
    const A = t * (b + h - t);
    return { b, h, t, A, x: xOfL({ b, h, t, A })!, y: yOfL({ b, h, t, A })! };
  })(),
  startWith: ['b', 'h', 't'],
  representation: {
    kind: 'section',
    shape: 'angle',
    b: 'b',
    h: 'h',
    t: 't',
    area: 'A',
    centroid: { x: 'x', y: 'y' },
  },
});

// ─── Statics: moments of inertia (he.engineering.statics#3) ──────────────────

const parallel = demo({
  id: 'g.he-section-parallel',
  title: 'A rectangle about a parallel axis',
  use: 'Use this for “Find I of a 50 × 100 mm rectangle about an axis 150 mm from its centroid.”',
  assumptions: [
    'd is measured from the centroidal axis to the parallel axis x′.',
    'The parallel-axis theorem only adds to Ī: I = Ī + Ad² is never less than Ī.',
  ],
  variables: [
    len('b', 'b', 'Width'),
    len('h', 'h', 'Height'),
    len('d', 'd', 'Axis offset from the centroid', 'mm', 1e4),
    plain('A', 'A', 'Area', 'mm²', 0.01, 1e8),
    big('Ib', 'Ī', 'I about the centroidal axis', 'mm⁴'),
    big('I', 'I', 'I about the parallel axis', 'mm⁴'),
  ],
  rules: [
    product('A = bh', 'A', 'b', 'h', 'width times height'),
    {
      id: 'Ī = bh³ ÷ 12',
      display: '{Ib} = {b} × {h}³ ÷ 12',
      vars: ['Ib', 'b', 'h'],
      residual: (x) => x.Ib! - (x.b! * x.h! ** 3) / 12,
      ways: {
        Ib: [
          (x) => (x.b! * x.h! ** 3) / 12,
          '{b} × {h}³ ÷ 12',
          'A rectangle about its own centroidal axis: bh³ ÷ 12.',
        ],
        b: [
          (x) => div(12 * x.Ib!, x.h! ** 3),
          '12 × {Ib} ÷ {h}³',
          'Multiply by 12 and divide by h³.',
        ],
        h: [
          (x) => Math.cbrt((12 * x.Ib!) / x.b!),
          '∛(12 × {Ib} ÷ {b})',
          'Multiply by 12, divide by b, then take the cube root.',
        ],
      },
    },
    {
      id: 'I = Ī + Ad²',
      display: '{I} = {Ib} + {A} × {d}²',
      vars: ['I', 'Ib', 'A', 'd'],
      residual: (x) => x.I! - x.Ib! - x.A! * x.d! ** 2,
      ways: {
        I: [
          (x) => x.Ib! + x.A! * x.d! ** 2,
          '{Ib} + {A} × {d}²',
          'The parallel-axis theorem: add the area times the offset squared.',
        ],
        Ib: [(x) => x.I! - x.A! * x.d! ** 2, '{I} − {A} × {d}²', 'Take Ad² away from I.'],
        A: [
          (x) => div(x.I! - x.Ib!, x.d! ** 2),
          '({I} − {Ib}) ÷ {d}²',
          'Take Ī away from I, then divide by d².',
        ],
        d: [
          (x) => root(div(x.I! - x.Ib!, x.A!) ?? NaN),
          '√(({I} − {Ib}) ÷ {A})',
          'Take Ī away from I, divide by A, then take the square root.',
        ],
      },
    },
  ],
  example: { b: 50, h: 100, d: 150, A: 5000, Ib: 50e6 / 12, I: 50e6 / 12 + 5000 * 22500 },
  startWith: ['b', 'h', 'd'],
  representation: {
    kind: 'section',
    shape: 'rectangle',
    b: 'b',
    h: 'h',
    area: 'A',
    inertia: 'Ib',
    axis: { d: 'd', inertia: 'I' },
  },
});

const yOfComposite = (x: Values) =>
  div(
    x.bf! * x.tf! * (x.hw! + x.tf! / 2) + (x.tw! * x.hw! ** 2) / 2,
    x.bf! * x.tf! + x.tw! * x.hw!,
  );
const iOfComposite = (x: Values) =>
  (x.bf! * x.tf! ** 3) / 12 +
  x.bf! * x.tf! * x.d1! ** 2 +
  (x.tw! * x.hw! ** 3) / 12 +
  x.tw! * x.hw! * x.d2! ** 2;

const composite = demo({
  id: 'g.he-section-composite',
  title: 'I of a T-section about its centroid',
  use: 'Use this for “Find I about the centroid of a T with a 100 × 20 mm flange on an 80 × 20 mm web.”',
  assumptions: [
    'The T is two rectangles; each adds its own bh³ ÷ 12 and its area times d² (the parallel-axis theorem).',
    'd₁ and d₂ run from the section’s centroid to each part’s, up positive.',
  ],
  variables: [
    len('bf', 'b_f', 'Flange width'),
    len('tf', 't_f', 'Flange thickness'),
    len('hw', 'h_w', 'Web height'),
    len('tw', 't_w', 'Web thickness'),
    plain('y', 'ȳ', 'Centroid height from the bottom', 'mm', 0, 1e4),
    plain('d1', 'd₁', 'Flange offset from the centroid', 'mm', -1e4, 1e4),
    plain('d2', 'd₂', 'Web offset from the centroid', 'mm', -1e4, 1e4),
    big('I', 'I', 'I about the centroid', 'mm⁴'),
  ],
  rules: [
    {
      id: 'ȳ = ΣAy ÷ ΣA',
      display:
        '{y} = ({bf} × {tf} × ({hw} + {tf} ÷ 2) + {tw} × {hw}² ÷ 2) ÷ ({bf} × {tf} + {tw} × {hw})',
      vars: ['y', 'bf', 'tf', 'hw', 'tw'],
      residual: (x) =>
        x.y! * (x.bf! * x.tf! + x.tw! * x.hw!) -
        x.bf! * x.tf! * (x.hw! + x.tf! / 2) -
        (x.tw! * x.hw! ** 2) / 2,
      ways: {
        y: [
          yOfComposite,
          '({bf} × {tf} × ({hw} + {tf} ÷ 2) + {tw} × {hw}² ÷ 2) ÷ ({bf} × {tf} + {tw} × {hw})',
          'Each part’s area times the height of its center, added, divided by the whole area.',
        ],
        bf: [
          (x) => div(x.tw! * x.hw! * (x.hw! / 2 - x.y!), x.tf! * (x.y! - x.hw! - x.tf! / 2)),
          '{tw} × {hw} × ({hw} ÷ 2 − {y}) ÷ ({tf} × ({y} − {hw} − {tf} ÷ 2))',
          'Gather the b_f terms on one side, then divide by what multiplies b_f.',
        ],
        tw: [
          (x) => div(x.bf! * x.tf! * (x.y! - x.hw! - x.tf! / 2), x.hw! * (x.hw! / 2 - x.y!)),
          '{bf} × {tf} × ({y} − {hw} − {tf} ÷ 2) ÷ ({hw} × ({hw} ÷ 2 − {y}))',
          'Gather the t_w terms on one side, then divide by what multiplies t_w.',
        ],
        tf: null,
        hw: null,
      },
    },
    {
      id: 'd₁ = h_w + t_f ÷ 2 − ȳ',
      display: '{d1} = {hw} + {tf} ÷ 2 − {y}',
      vars: ['d1', 'hw', 'tf', 'y'],
      residual: (x) => x.d1! - x.hw! - x.tf! / 2 + x.y!,
      ways: {
        d1: [
          (x) => x.hw! + x.tf! / 2 - x.y!,
          '{hw} + {tf} ÷ 2 − {y}',
          'The flange’s center is at h_w + t_f ÷ 2; take away ȳ.',
        ],
        hw: [
          (x) => x.d1! - x.tf! / 2 + x.y!,
          '{d1} − {tf} ÷ 2 + {y}',
          'Add ȳ and take away t_f ÷ 2.',
        ],
        tf: [
          (x) => 2 * (x.d1! - x.hw! + x.y!),
          '2 × ({d1} − {hw} + {y})',
          'Add ȳ, take away h_w, then double.',
        ],
        y: [
          (x) => x.hw! + x.tf! / 2 - x.d1!,
          '{hw} + {tf} ÷ 2 − {d1}',
          'Take d₁ away from the flange center’s height.',
        ],
      },
    },
    {
      id: 'd₂ = h_w ÷ 2 − ȳ',
      display: '{d2} = {hw} ÷ 2 − {y}',
      vars: ['d2', 'hw', 'y'],
      residual: (x) => x.d2! - x.hw! / 2 + x.y!,
      ways: {
        d2: [
          (x) => x.hw! / 2 - x.y!,
          '{hw} ÷ 2 − {y}',
          'The web’s center is at h_w ÷ 2; take away ȳ.',
        ],
        hw: [(x) => 2 * (x.d2! + x.y!), '2 × ({d2} + {y})', 'Add ȳ, then double.'],
        y: [
          (x) => x.hw! / 2 - x.d2!,
          '{hw} ÷ 2 − {d2}',
          'Take d₂ away from the web center’s height.',
        ],
      },
    },
    {
      id: 'I = Σ(Ī + Ad²)',
      display:
        '{I} = {bf} × {tf}³ ÷ 12 + {bf} × {tf} × {d1}² + {tw} × {hw}³ ÷ 12 + {tw} × {hw} × {d2}²',
      vars: ['I', 'bf', 'tf', 'd1', 'tw', 'hw', 'd2'],
      residual: (x) => x.I! - iOfComposite(x),
      ways: {
        I: [
          iOfComposite,
          '{bf} × {tf}³ ÷ 12 + {bf} × {tf} × {d1}² + {tw} × {hw}³ ÷ 12 + {tw} × {hw} × {d2}²',
          'Each rectangle about its own center, bh³ ÷ 12, plus its area times its offset squared, for both parts.',
        ],
        bf: [
          (x) =>
            div(
              x.I! - (x.tw! * x.hw! ** 3) / 12 - x.tw! * x.hw! * x.d2! ** 2,
              x.tf! ** 3 / 12 + x.tf! * x.d1! ** 2,
            ),
          '({I} − {tw} × {hw}³ ÷ 12 − {tw} × {hw} × {d2}²) ÷ ({tf}³ ÷ 12 + {tf} × {d1}²)',
          'Take the web’s part away from I, then divide by what multiplies b_f.',
        ],
        tw: [
          (x) =>
            div(
              x.I! - (x.bf! * x.tf! ** 3) / 12 - x.bf! * x.tf! * x.d1! ** 2,
              x.hw! ** 3 / 12 + x.hw! * x.d2! ** 2,
            ),
          '({I} − {bf} × {tf}³ ÷ 12 − {bf} × {tf} × {d1}²) ÷ ({hw}³ ÷ 12 + {hw} × {d2}²)',
          'Take the flange’s part away from I, then divide by what multiplies t_w.',
        ],
        tf: null,
        hw: null,
        d1: null,
        d2: null,
      },
    },
  ],
  example: (() => {
    const base = { bf: 100, tf: 20, hw: 80, tw: 20 };
    const y = yOfComposite(base)!;
    const d1 = 90 - y;
    const d2 = 40 - y;
    return { ...base, y, d1, d2, I: iOfComposite({ ...base, d1, d2 }) };
  })(),
  startWith: ['bf', 'tf', 'hw', 'tw'],
  representation: {
    kind: 'section',
    shape: 'tee',
    bf: 'bf',
    tf: 'tf',
    hw: 'hw',
    tw: 'tw',
    centroid: { y: 'y' },
    inertia: 'I',
    parts: { d: ['d1', 'd2'] },
  },
});

const jOf = (x: Values) => (Math.PI * (x.d! ** 4 - x.di! ** 4)) / 32;

const polar = demo({
  id: 'g.he-section-polar',
  title: 'Polar moment of a tube',
  use: 'Use this for “Find J for a tube 60 mm outside and 40 mm inside.”',
  assumptions: ['J is about the tube’s center; a solid shaft has dᵢ = 0.'],
  variables: [
    len('d', 'd_o', 'Outside diameter'),
    plain('di', 'd_i', 'Inside diameter', 'mm', 0.1, 5000, { step: 1 }),
    big('J', 'J', 'Polar moment of area', 'mm⁴'),
  ],
  rules: [
    {
      id: 'J = π(d_o⁴ − d_i⁴) ÷ 32',
      display: '{J} = π × ({d}⁴ − {di}⁴) ÷ 32',
      vars: ['J', 'd', 'di'],
      residual: (x) => x.J! - jOf(x),
      ways: {
        J: [jOf, 'π × ({d}⁴ − {di}⁴) ÷ 32', 'A solid round’s πd⁴ ÷ 32, less the bore’s.'],
        d: [
          (x) => root4((32 * x.J!) / Math.PI + x.di! ** 4),
          '∜(32 × {J} ÷ π + {di}⁴)',
          'Multiply by 32, divide by π, add dᵢ⁴, then take the fourth root.',
        ],
        di: [
          (x) => root4(x.d! ** 4 - (32 * x.J!) / Math.PI),
          '∜({d}⁴ − 32 × {J} ÷ π)',
          'Take 32J ÷ π away from dₒ⁴, then take the fourth root.',
        ],
      },
    },
  ],
  example: { d: 60, di: 40, J: jOf({ d: 60, di: 40 }) },
  startWith: ['d', 'di'],
  representation: { kind: 'section', shape: 'tube', d: 'd', di: 'di', polar: 'J' },
});

const gyration = demo({
  id: 'g.he-section-gyration',
  title: 'Radius of gyration of a bar',
  use: 'Use this for “A 20 × 100 mm bar: how far from its axis would all its area sit for the same I?”',
  assumptions: ['k is about the horizontal centroidal axis: k = √(Ī ÷ A).'],
  variables: [
    len('b', 'b', 'Width'),
    len('h', 'h', 'Height'),
    plain('A', 'A', 'Area', 'mm²', 0.01, 1e8),
    big('Ib', 'Ī', 'I about the centroidal axis', 'mm⁴'),
    len('k', 'k', 'Radius of gyration', 'mm', 1e4, 0.01),
  ],
  rules: [
    product('A = bh', 'A', 'b', 'h', 'width times height'),
    {
      id: 'Ī = bh³ ÷ 12',
      display: '{Ib} = {b} × {h}³ ÷ 12',
      vars: ['Ib', 'b', 'h'],
      residual: (x) => x.Ib! - (x.b! * x.h! ** 3) / 12,
      ways: {
        Ib: [
          (x) => (x.b! * x.h! ** 3) / 12,
          '{b} × {h}³ ÷ 12',
          'A rectangle about its own centroidal axis: bh³ ÷ 12.',
        ],
        b: [
          (x) => div(12 * x.Ib!, x.h! ** 3),
          '12 × {Ib} ÷ {h}³',
          'Multiply by 12 and divide by h³.',
        ],
        h: [
          (x) => Math.cbrt((12 * x.Ib!) / x.b!),
          '∛(12 × {Ib} ÷ {b})',
          'Multiply by 12, divide by b, then take the cube root.',
        ],
      },
    },
    {
      id: 'k = √(Ī ÷ A)',
      display: '{k} = √({Ib} ÷ {A})',
      vars: ['k', 'Ib', 'A'],
      residual: (x) => x.k! ** 2 * x.A! - x.Ib!,
      ways: {
        k: [
          (x) => root(x.Ib! / x.A!),
          '√({Ib} ÷ {A})',
          'Divide I by the area, then take the square root.',
        ],
        Ib: [(x) => x.k! ** 2 * x.A!, '{k}² × {A}', 'Square k and multiply by the area.'],
        A: [(x) => div(x.Ib!, x.k! ** 2), '{Ib} ÷ {k}²', 'Divide I by k squared.'],
      },
    },
  ],
  example: { b: 20, h: 100, A: 2000, Ib: 20e6 / 12, k: Math.sqrt(20e6 / 12 / 2000) },
  startWith: ['b', 'h'],
  representation: {
    kind: 'section',
    shape: 'rectangle',
    b: 'b',
    h: 'h',
    area: 'A',
    inertia: 'Ib',
    gyration: 'k',
  },
});

// ─── Mechanics of materials: stress blocks ───────────────────────────────────

const bending = demo({
  id: 'g.he-section-bending',
  title: 'Bending stress in a rectangle',
  use: 'Use this for “A 100 × 200 mm beam carries 20 kN·m. What is the largest bending stress?”',
  assumptions: [
    'Plane sections stay plane and the beam stays elastic, so σ grows in a straight line from zero at the neutral axis.',
    'M in kN·m is M × 10⁶ N·mm, so σ = Mc ÷ I comes out in MPa (N/mm²).',
  ],
  variables: [
    plain('M', 'M', 'Bending moment', 'kN·m', 0.001, 1e5),
    len('b', 'b', 'Width'),
    len('h', 'h', 'Depth'),
    big('I', 'I', 'Second moment of area', 'mm⁴'),
    len('c', 'c', 'Neutral axis to the far edge', 'mm', 5000, 0.05),
    plain('s', 'σ_max', 'Largest bending stress', 'MPa', 0.001, 1e6),
  ],
  rules: [
    {
      id: 'I = bh³ ÷ 12',
      display: '{I} = {b} × {h}³ ÷ 12',
      vars: ['I', 'b', 'h'],
      residual: (x) => x.I! - (x.b! * x.h! ** 3) / 12,
      ways: {
        I: [
          (x) => (x.b! * x.h! ** 3) / 12,
          '{b} × {h}³ ÷ 12',
          'A rectangle about its centroidal axis: bh³ ÷ 12.',
        ],
        b: [
          (x) => div(12 * x.I!, x.h! ** 3),
          '12 × {I} ÷ {h}³',
          'Multiply by 12 and divide by h³.',
        ],
        h: [
          (x) => Math.cbrt((12 * x.I!) / x.b!),
          '∛(12 × {I} ÷ {b})',
          'Multiply by 12, divide by b, then take the cube root.',
        ],
      },
    },
    {
      id: 'c = h ÷ 2',
      display: '{c} = {h} ÷ 2',
      vars: ['c', 'h'],
      residual: (x) => x.c! - x.h! / 2,
      ways: {
        c: [
          (x) => x.h! / 2,
          '{h} ÷ 2',
          'The neutral axis is at mid-depth, so the far edge is half the depth away.',
        ],
        h: [
          (x) => 2 * x.c!,
          '2 × {c}',
          'The depth is twice the distance from the neutral axis to the edge.',
        ],
      },
    },
    {
      id: 'σ = Mc ÷ I',
      display: '{s} = {M} × 10⁶ × {c} ÷ {I}',
      vars: ['s', 'M', 'c', 'I'],
      residual: (x) => x.s! * x.I! - x.M! * 1e6 * x.c!,
      ways: {
        s: [
          (x) => div(x.M! * 1e6 * x.c!, x.I!),
          '{M} × 10⁶ × {c} ÷ {I}',
          'The flexure formula, with M turned into N·mm.',
        ],
        M: [
          (x) => div(x.s! * x.I!, 1e6 * x.c!),
          '{s} × {I} ÷ (10⁶ × {c})',
          'Multiply σ by I, then divide by c and by 10⁶ to get kN·m.',
        ],
        c: [
          (x) => div(x.s! * x.I!, 1e6 * x.M!),
          '{s} × {I} ÷ (10⁶ × {M})',
          'Multiply σ by I, then divide by M in N·mm.',
        ],
        I: [(x) => div(x.M! * 1e6 * x.c!, x.s!), '{M} × 10⁶ × {c} ÷ {s}', 'Swap σ and I.'],
      },
    },
  ],
  example: { M: 20, b: 100, h: 200, I: 2e10 / 300, c: 100, s: 30 },
  startWith: ['M', 'b', 'h'],
  representation: {
    kind: 'section',
    shape: 'rectangle',
    b: 'b',
    h: 'h',
    inertia: 'I',
    stress: 'bending',
    edge: 's',
    load: 'M',
  },
  pictureLabels: ['c'],
});

const shearStress = demo({
  id: 'g.he-section-shear',
  title: 'Shear stress at the neutral axis',
  use: 'Use this for “A 100 × 200 mm beam carries 30 kN of shear. What is the largest shear stress?”',
  assumptions: [
    'τ = VQ ÷ (It) in a rectangle is a parabola, largest at the neutral axis: τ_max = 1.5V ÷ A.',
    'V in kN is V × 1000 N, so τ comes out in MPa (N/mm²).',
  ],
  variables: [
    plain('V', 'V', 'Shear force', 'kN', 0.001, 1e5),
    len('b', 'b', 'Width'),
    len('h', 'h', 'Depth'),
    plain('A', 'A', 'Area', 'mm²', 0.01, 1e8),
    plain('tau', 'τ_max', 'Largest shear stress', 'MPa', 0.0001, 1e6),
  ],
  rules: [
    product('A = bh', 'A', 'b', 'h', 'width times depth'),
    {
      id: 'τ_max = 1.5V ÷ A',
      display: '{tau} = 1.5 × {V} × 1000 ÷ {A}',
      vars: ['tau', 'V', 'A'],
      residual: (x) => x.tau! * x.A! - 1500 * x.V!,
      ways: {
        tau: [
          (x) => div(1500 * x.V!, x.A!),
          '1.5 × {V} × 1000 ÷ {A}',
          'One and a half times the average shear V ÷ A, with V in newtons.',
        ],
        V: [
          (x) => (x.tau! * x.A!) / 1500,
          '{tau} × {A} ÷ (1.5 × 1000)',
          'Multiply τ by A, then divide by 1.5 and by 1000 to get kN.',
        ],
        A: [(x) => div(1500 * x.V!, x.tau!), '1.5 × {V} × 1000 ÷ {tau}', 'Swap A and τ.'],
      },
    },
  ],
  example: { V: 30, b: 100, h: 200, A: 20000, tau: 2.25 },
  startWith: ['V', 'b', 'h'],
  representation: {
    kind: 'section',
    shape: 'rectangle',
    b: 'b',
    h: 'h',
    area: 'A',
    stress: 'shear',
    edge: 'tau',
    load: 'V',
  },
});

const plastic = demo({
  id: 'g.he-section-plastic',
  title: 'Yield and plastic moments of a rectangle',
  use: 'Use this for “A 50 × 100 mm steel bar yields at 250 MPa. Find M_Y, M_p and the shape factor.”',
  assumptions: [
    'Elastic–perfectly plastic steel: σ never passes σ_Y.',
    'S = bh² ÷ 6 at first yield; Z = bh² ÷ 4 when the whole section has yielded.',
    'σ_Y in MPa times mm³ gives N·mm; divide by 10⁶ for kN·m.',
  ],
  variables: [
    len('b', 'b', 'Width'),
    len('h', 'h', 'Depth'),
    plain('sY', 'σ_Y', 'Yield stress', 'MPa', 1, 5000),
    plain('S', 'S', 'Elastic section modulus', 'mm³', 0.01, 1e12),
    plain('Z', 'Z', 'Plastic section modulus', 'mm³', 0.01, 1e12),
    plain('MY', 'M_Y', 'Moment at first yield', 'kN·m', 1e-6, 1e6),
    plain('Mp', 'M_p', 'Plastic moment', 'kN·m', 1e-6, 1e6),
    plain('f', 'f', 'Shape factor', undefined, 0.5, 10),
  ],
  rules: [
    {
      id: 'S = bh² ÷ 6',
      display: '{S} = {b} × {h}² ÷ 6',
      vars: ['S', 'b', 'h'],
      residual: (x) => x.S! - (x.b! * x.h! ** 2) / 6,
      ways: {
        S: [
          (x) => (x.b! * x.h! ** 2) / 6,
          '{b} × {h}² ÷ 6',
          'I ÷ c for a rectangle: bh³ ÷ 12 over h ÷ 2.',
        ],
        b: [(x) => div(6 * x.S!, x.h! ** 2), '6 × {S} ÷ {h}²', 'Multiply by 6 and divide by h².'],
        h: [
          (x) => root((6 * x.S!) / x.b!),
          '√(6 × {S} ÷ {b})',
          'Multiply by 6, divide by b, then take the square root.',
        ],
      },
    },
    {
      id: 'Z = bh² ÷ 4',
      display: '{Z} = {b} × {h}² ÷ 4',
      vars: ['Z', 'b', 'h'],
      residual: (x) => x.Z! - (x.b! * x.h! ** 2) / 4,
      ways: {
        Z: [
          (x) => (x.b! * x.h! ** 2) / 4,
          '{b} × {h}² ÷ 4',
          'Each half, b × h ÷ 2, acts h ÷ 4 from the axis: twice bh ÷ 2 × h ÷ 4.',
        ],
        b: [(x) => div(4 * x.Z!, x.h! ** 2), '4 × {Z} ÷ {h}²', 'Multiply by 4 and divide by h².'],
        h: [
          (x) => root((4 * x.Z!) / x.b!),
          '√(4 × {Z} ÷ {b})',
          'Multiply by 4, divide by b, then take the square root.',
        ],
      },
    },
    {
      id: 'M_Y = σ_YS',
      display: '{MY} = {sY} × {S} ÷ 10⁶',
      vars: ['MY', 'sY', 'S'],
      residual: (x) => x.MY! * 1e6 - x.sY! * x.S!,
      ways: {
        MY: [
          (x) => (x.sY! * x.S!) / 1e6,
          '{sY} × {S} ÷ 10⁶',
          'The edge reaches σ_Y: M = σ_YS, in N·mm, then ÷ 10⁶ for kN·m.',
        ],
        sY: [
          (x) => div(x.MY! * 1e6, x.S!),
          '{MY} × 10⁶ ÷ {S}',
          'Turn M_Y into N·mm and divide by S.',
        ],
        S: [
          (x) => div(x.MY! * 1e6, x.sY!),
          '{MY} × 10⁶ ÷ {sY}',
          'Turn M_Y into N·mm and divide by σ_Y.',
        ],
      },
    },
    {
      id: 'M_p = σ_YZ',
      display: '{Mp} = {sY} × {Z} ÷ 10⁶',
      vars: ['Mp', 'sY', 'Z'],
      residual: (x) => x.Mp! * 1e6 - x.sY! * x.Z!,
      ways: {
        Mp: [
          (x) => (x.sY! * x.Z!) / 1e6,
          '{sY} × {Z} ÷ 10⁶',
          'Every fiber at σ_Y: M = σ_YZ, in N·mm, then ÷ 10⁶ for kN·m.',
        ],
        sY: [
          (x) => div(x.Mp! * 1e6, x.Z!),
          '{Mp} × 10⁶ ÷ {Z}',
          'Turn M_p into N·mm and divide by Z.',
        ],
        Z: [
          (x) => div(x.Mp! * 1e6, x.sY!),
          '{Mp} × 10⁶ ÷ {sY}',
          'Turn M_p into N·mm and divide by σ_Y.',
        ],
      },
    },
    {
      id: 'f = M_p ÷ M_Y',
      display: '{f} = {Mp} ÷ {MY}',
      vars: ['f', 'Mp', 'MY'],
      residual: (x) => x.f! * x.MY! - x.Mp!,
      ways: {
        f: [
          (x) => div(x.Mp!, x.MY!),
          '{Mp} ÷ {MY}',
          'How much more moment the section takes after first yield.',
        ],
        Mp: [(x) => x.f! * x.MY!, '{f} × {MY}', 'Multiply M_Y by the shape factor.'],
        MY: [(x) => div(x.Mp!, x.f!), '{Mp} ÷ {f}', 'Divide M_p by the shape factor.'],
      },
    },
  ],
  example: {
    b: 50,
    h: 100,
    sY: 250,
    S: 500000 / 6,
    Z: 125000,
    MY: (250 * 500000) / 6 / 1e6,
    Mp: 31.25,
    f: 1.5,
  },
  startWith: ['b', 'h', 'sY'],
  representation: {
    kind: 'section',
    shape: 'rectangle',
    b: 'b',
    h: 'h',
    stress: 'plastic',
    edge: 'sY',
    load: 'Mp',
  },
  pictureLabels: ['S', 'Z', 'MY', 'f'],
});

const tauOfTube = (x: Values) => div(1000 * x.T! * x.d!, 2 * x.J!);

const torsion = demo({
  id: 'g.he-section-torsion',
  title: 'Shear stress in a hollow shaft',
  use: 'Use this for “A 60/40 mm tube carries 2 kN·m of torque. What is the largest shear stress?”',
  assumptions: [
    'Elastic torsion of a round shaft: τ grows in a straight line from zero at the center to τ_max at the surface.',
    'T in N·m is T × 1000 N·mm, so τ = Tr ÷ J comes out in MPa.',
  ],
  variables: [
    plain('T', 'T', 'Torque', 'N·m', 0.001, 1e8),
    len('d', 'd_o', 'Outside diameter'),
    plain('di', 'd_i', 'Inside diameter', 'mm', 0.1, 5000, { step: 1 }),
    big('J', 'J', 'Polar moment of area', 'mm⁴'),
    plain('tau', 'τ_max', 'Largest shear stress', 'MPa', 0.0001, 1e6),
  ],
  rules: [
    {
      id: 'J = π(d_o⁴ − d_i⁴) ÷ 32',
      display: '{J} = π × ({d}⁴ − {di}⁴) ÷ 32',
      vars: ['J', 'd', 'di'],
      residual: (x) => x.J! - jOf(x),
      ways: {
        J: [jOf, 'π × ({d}⁴ − {di}⁴) ÷ 32', 'A solid round’s πd⁴ ÷ 32, less the bore’s.'],
        d: [
          (x) => root4((32 * x.J!) / Math.PI + x.di! ** 4),
          '∜(32 × {J} ÷ π + {di}⁴)',
          'Multiply by 32, divide by π, add dᵢ⁴, then take the fourth root.',
        ],
        di: [
          (x) => root4(x.d! ** 4 - (32 * x.J!) / Math.PI),
          '∜({d}⁴ − 32 × {J} ÷ π)',
          'Take 32J ÷ π away from dₒ⁴, then take the fourth root.',
        ],
      },
    },
    {
      id: 'τ_max = T(d_o ÷ 2) ÷ J',
      display: '{tau} = 1000 × {T} × {d} ÷ (2 × {J})',
      vars: ['tau', 'T', 'd', 'J'],
      residual: (x) => 2 * x.tau! * x.J! - 1000 * x.T! * x.d!,
      ways: {
        tau: [
          tauOfTube,
          '1000 × {T} × {d} ÷ (2 × {J})',
          'The torsion formula Tr ÷ J at the surface, r = dₒ ÷ 2, with T in N·mm.',
        ],
        T: [
          (x) => div(2 * x.tau! * x.J!, 1000 * x.d!),
          '2 × {tau} × {J} ÷ (1000 × {d})',
          'Multiply τ by 2J, then divide by dₒ and by 1000 to get N·m.',
        ],
        J: [
          (x) => div(1000 * x.T! * x.d!, 2 * x.tau!),
          '1000 × {T} × {d} ÷ (2 × {tau})',
          'Swap J and τ.',
        ],
        d: [
          (x) => div(2 * x.tau! * x.J!, 1000 * x.T!),
          '2 × {tau} × {J} ÷ (1000 × {T})',
          'Multiply τ by 2J, then divide by T in N·mm.',
        ],
      },
    },
  ],
  example: (() => {
    const base = { T: 2000, d: 60, di: 40 };
    const J = jOf(base);
    return { ...base, J, tau: tauOfTube({ ...base, J })! };
  })(),
  startWith: ['T', 'd', 'di'],
  representation: {
    kind: 'section',
    shape: 'tube',
    d: 'd',
    di: 'di',
    polar: 'J',
    stress: 'torsion',
    edge: 'tau',
    load: 'T',
  },
});

/** Thin-walled hoop and axial stress: σ_h = pr ÷ t, σ_a = pr ÷ (2t), as a page writes it. */
function hoopRules(p: string, factor: number, factorText: string): Rule[] {
  const k = factor;
  const kx = factorText ? ` × ${factorText}` : '';
  return [
    {
      id: 'σ_h = pr ÷ t',
      display: `{sh} = {${p}} × {r}${kx} ÷ {t}`,
      vars: ['sh', p, 'r', 't'],
      residual: (x) => x.sh! * x.t! - k * x[p]! * x.r!,
      ways: {
        sh: [
          (x) => div(k * x[p]! * x.r!, x.t!),
          `{${p}} × {r}${kx} ÷ {t}`,
          'Pressure on the inside, held by two walls t thick: σ_h = pr ÷ t.',
        ],
        [p]: [
          (x) => div(x.sh! * x.t!, k * x.r!),
          `{sh} × {t} ÷ ({r}${kx})`,
          'Multiply σ_h by t, then divide by r.',
        ],
        r: [
          (x) => div(x.sh! * x.t!, k * x[p]!),
          `{sh} × {t} ÷ ({${p}}${kx})`,
          'Multiply σ_h by t, then divide by the pressure.',
        ],
        t: [(x) => div(k * x[p]! * x.r!, x.sh!), `{${p}} × {r}${kx} ÷ {sh}`, 'Swap t and σ_h.'],
      },
    },
    {
      id: 'σ_a = σ_h ÷ 2',
      display: '{sa} = {sh} ÷ 2',
      vars: ['sa', 'sh'],
      residual: (x) => 2 * x.sa! - x.sh!,
      ways: {
        sa: [
          (x) => x.sh! / 2,
          '{sh} ÷ 2',
          'The end caps’ pressure, πr²p, spread round the wall 2πrt: half of σ_h.',
        ],
        sh: [(x) => 2 * x.sa!, '2 × {sa}', 'Double σ_a.'],
      },
    },
  ];
}

const vessel = demo({
  id: 'g.he-section-vessel',
  title: 'Hoop and axial stress in a thin vessel',
  use: 'Use this for “A tank 500 mm in radius with a 10 mm wall holds 2 MPa. Find the hoop and axial stress.”',
  assumptions: [
    'Thin wall: r ÷ t is 10 or more, so the stress is even across the wall.',
    'MPa × mm ÷ mm stays MPa.',
  ],
  variables: [
    plain('p', 'p', 'Inside pressure', 'MPa', 0.001, 1000),
    len('r', 'r', 'Radius'),
    len('t', 't', 'Wall thickness', 'mm', 500, 0.01),
    plain('sh', 'σ_h', 'Hoop stress', 'MPa', 0.0001, 1e6),
    plain('sa', 'σ_a', 'Axial stress', 'MPa', 0.0001, 1e6),
  ],
  rules: hoopRules('p', 1, ''),
  example: { p: 2, r: 500, t: 10, sh: 100, sa: 50 },
  startWith: ['p', 'r', 't'],
  representation: {
    kind: 'section',
    shape: 'cylinder',
    r: 'r',
    t: 't',
    stress: 'hoop',
    edge: 'sh',
    axial: 'sa',
    load: 'p',
  },
});

const lame = (x: Values) => div(x.p! * (x.ri! ** 2 + x.ro! ** 2), x.ro! ** 2 - x.ri! ** 2);

const thick = demo({
  id: 'g.he-section-thick',
  title: 'Hoop stress at the bore of a thick cylinder',
  use: 'Use this for “A cylinder 50 mm inside and 100 mm outside in radius holds 50 MPa. What is the hoop stress at the bore?”',
  assumptions: [
    'Lamé: open ends, inside pressure only, the material elastic.',
    'σ_θ is largest at the bore, σ_θ = p(rᵢ² + rₒ²) ÷ (rₒ² − rᵢ²), and falls across the wall.',
  ],
  variables: [
    plain('p', 'p', 'Inside pressure', 'MPa', 0.001, 5000),
    len('ri', 'r_i', 'Inside radius'),
    len('ro', 'r_o', 'Outside radius'),
    plain('s', 'σ_θ', 'Hoop stress at the bore', 'MPa', 0.0001, 1e6),
  ],
  rules: [
    {
      id: 'σ_θ = p(r_i² + r_o²) ÷ (r_o² − r_i²)',
      display: '{s} = {p} × ({ri}² + {ro}²) ÷ ({ro}² − {ri}²)',
      vars: ['s', 'p', 'ri', 'ro'],
      residual: (x) => x.s! * (x.ro! ** 2 - x.ri! ** 2) - x.p! * (x.ri! ** 2 + x.ro! ** 2),
      ways: {
        s: [lame, '{p} × ({ri}² + {ro}²) ÷ ({ro}² − {ri}²)', 'Lamé’s hoop stress at r = rᵢ.'],
        p: [
          (x) => div(x.s! * (x.ro! ** 2 - x.ri! ** 2), x.ri! ** 2 + x.ro! ** 2),
          '{s} × ({ro}² − {ri}²) ÷ ({ri}² + {ro}²)',
          'Multiply σ_θ by rₒ² − rᵢ², then divide by rᵢ² + rₒ².',
        ],
        ro: [
          (x) => (x.s! > x.p! ? x.ri! * Math.sqrt((x.s! + x.p!) / (x.s! - x.p!)) : undefined),
          '{ri} × √(({s} + {p}) ÷ ({s} − {p}))',
          'Gather the rₒ² terms: rₒ²(σ_θ − p) = rᵢ²(σ_θ + p); divide and take the square root.',
        ],
        ri: [
          (x) => (x.s! > x.p! ? x.ro! * Math.sqrt((x.s! - x.p!) / (x.s! + x.p!)) : undefined),
          '{ro} × √(({s} − {p}) ÷ ({s} + {p}))',
          'Gather the rᵢ² terms: rᵢ²(σ_θ + p) = rₒ²(σ_θ − p); divide and take the square root.',
        ],
      },
    },
  ],
  example: { p: 50, ri: 50, ro: 100, s: (50 * 12500) / 7500 },
  startWith: ['p', 'ri', 'ro'],
  representation: {
    kind: 'section',
    shape: 'cylinder',
    r: 'ri',
    ro: 'ro',
    stress: 'hoop',
    thick: true,
    edge: 's',
    load: 'p',
  },
});

// ─── Aerospace structures: thin-walled sections ──────────────────────────────

const cabin = demo({
  id: 'g.he-section-cabin',
  title: 'Skin stress in a pressurized fuselage',
  use: 'Use this for “A fuselage 2 m in radius with 1.6 mm skin is pressurized to 60 kPa. Find the hoop and axial stress.”',
  assumptions: [
    'A thin cylinder: the skin is far thinner than the radius, so the stress is even through it.',
    'kPa × m ÷ mm is MPa (1000 Pa × 1 m ÷ 0.001 m = 10⁶ Pa).',
  ],
  variables: [
    plain('dp', 'Δp', 'Pressure difference', 'kPa', 0.01, 1e4),
    len('r', 'r', 'Fuselage radius', 'm', 100, 0.01),
    len('t', 't', 'Skin thickness', 'mm', 100, 0.01),
    plain('sh', 'σ_h', 'Hoop stress', 'MPa', 0.0001, 1e6),
    plain('sa', 'σ_a', 'Axial stress', 'MPa', 0.0001, 1e6),
  ],
  rules: hoopRules('dp', 1, ''),
  example: { dp: 60, r: 2, t: 1.6, sh: 75, sa: 37.5 },
  startWith: ['dp', 'r', 't'],
  representation: {
    kind: 'section',
    shape: 'cylinder',
    r: 'r',
    t: 't',
    stress: 'hoop',
    edge: 'sh',
    axial: 'sa',
    load: 'dp',
  },
});

const box = demo({
  id: 'g.he-section-box',
  title: 'Shear flow in a closed box under torque',
  use: 'Use this for “A 0.4 × 0.2 m box with 2 mm walls carries 10 kN·m of torque. Find the shear flow and the shear stress.”',
  assumptions: [
    'Bredt–Batho: one closed cell, the wall the same thickness all round.',
    'Sizes run to the wall’s mid-line, so A_m is the area inside it.',
    'kN/m ÷ mm is MPa, so τ = q ÷ t needs no other factor.',
  ],
  variables: [
    plain('T', 'T', 'Torque', 'kN·m', 0.001, 1e5),
    len('b', 'b', 'Width', 'm', 100, 0.001),
    len('h', 'h', 'Height', 'm', 100, 0.001),
    len('t', 't', 'Wall thickness', 'mm', 100, 0.01),
    plain('Am', 'A_m', 'Area inside the mid-line', 'm²', 1e-6, 1e4),
    plain('q', 'q', 'Shear flow', 'kN/m', 1e-6, 1e8),
    plain('tau', 'τ', 'Shear stress in the wall', 'MPa', 1e-6, 1e8),
  ],
  rules: [
    product('A_m = bh', 'Am', 'b', 'h', 'the mid-line box is b wide and h high'),
    {
      id: 'q = T ÷ (2A_m)',
      display: '{q} = {T} ÷ (2 × {Am})',
      vars: ['q', 'T', 'Am'],
      residual: (x) => 2 * x.q! * x.Am! - x.T!,
      ways: {
        q: [
          (x) => div(x.T!, 2 * x.Am!),
          '{T} ÷ (2 × {Am})',
          'Each bit of wall pushes q along it; round the cell they add up to a torque of 2A_m q.',
        ],
        T: [(x) => 2 * x.q! * x.Am!, '2 × {q} × {Am}', 'Multiply q by twice the enclosed area.'],
        Am: [
          (x) => div(x.T!, 2 * x.q!),
          '{T} ÷ (2 × {q})',
          'Divide the torque by twice the shear flow.',
        ],
      },
    },
    {
      id: 'τ = q ÷ t',
      display: '{tau} = {q} ÷ {t}',
      vars: ['tau', 'q', 't'],
      residual: (x) => x.tau! * x.t! - x.q!,
      ways: {
        tau: [
          (x) => div(x.q!, x.t!),
          '{q} ÷ {t}',
          'Shear flow is force per length of wall; spread it through the wall’s thickness.',
        ],
        q: [(x) => x.tau! * x.t!, '{tau} × {t}', 'Multiply τ by the wall’s thickness.'],
        t: [(x) => div(x.q!, x.tau!), '{q} ÷ {tau}', 'Divide q by τ.'],
      },
    },
  ],
  example: { T: 10, b: 0.4, h: 0.2, t: 2, Am: 0.08, q: 62.5, tau: 31.25 },
  startWith: ['T', 'b', 'h', 't'],
  representation: {
    kind: 'section',
    shape: 'box',
    b: 'b',
    h: 'h',
    t: 't',
    thinWalled: true,
    area: 'Am',
    q: 'q',
    torque: 'T',
    tau: 'tau',
  },
  pictureLabels: ['tau'],
});

// ─── Steel design: W-shapes (US units) ───────────────────────────────────────

const w18 = { bf: 7.5, tf: 0.57 };

const web = demo({
  id: 'g.he-section-web',
  title: 'Shear strength of a W-shape’s web',
  use: 'Use this for “What shear can a W18×50 of 50 ksi steel carry?”',
  assumptions: [
    'A rolled I-shape with h ÷ t_w ≤ 2.24√(E ÷ F_y): the web yields in shear, and φ = 1.',
    'The web’s area is the whole depth times its thickness, A_w = d t_w.',
  ],
  variables: [
    len('d', 'd', 'Depth', 'in', 100, 1),
    len('tw', 't_w', 'Web thickness', 'in', 10, 0.05),
    plain('Aw', 'A_w', 'Web area', 'in²', 0.01, 1000),
    plain('Fy', 'F_y', 'Yield stress', 'ksi', 1, 200),
    plain('V', 'φV_n', 'Design shear strength', 'kips', 0.01, 1e5),
  ],
  rules: [
    product('A_w = dt_w', 'Aw', 'd', 'tw', 'the web runs the whole depth, t_w thick'),
    {
      id: 'φV_n = 0.6F_yA_w',
      display: '{V} = 0.6 × {Fy} × {Aw}',
      vars: ['V', 'Fy', 'Aw'],
      residual: (x) => x.V! - 0.6 * x.Fy! * x.Aw!,
      ways: {
        V: [
          (x) => 0.6 * x.Fy! * x.Aw!,
          '0.6 × {Fy} × {Aw}',
          'Steel yields in shear at about 0.6F_y; multiply by the web’s area (φ = 1).',
        ],
        Fy: [
          (x) => div(x.V!, 0.6 * x.Aw!),
          '{V} ÷ (0.6 × {Aw})',
          'Divide by 0.6 and by the web’s area.',
        ],
        Aw: [(x) => div(x.V!, 0.6 * x.Fy!), '{V} ÷ (0.6 × {Fy})', 'Divide by 0.6 and by F_y.'],
      },
    },
  ],
  example: { d: 18, tw: 0.355, Aw: 18 * 0.355, Fy: 50, V: 0.6 * 50 * 18 * 0.355 },
  startWith: ['d', 'tw', 'Fy'],
  representation: {
    kind: 'section',
    shape: 'wide',
    unit: 'in',
    d: 'd',
    tw: 'tw',
    ...w18,
    web: 'Aw',
  },
  pictureLabels: ['Fy', 'V'],
  us: true,
});

const zOfW = (x: Values) => x.bf! * x.tf! * (x.d! - x.tf!) + (x.tw! * (x.d! - 2 * x.tf!) ** 2) / 4;

const wPlastic = demo({
  id: 'g.he-section-wide-plastic',
  title: 'Plastic moment of a W-shape',
  use: 'Use this for “Find φM_p for a braced W18×50 of 50 ksi steel.”',
  assumptions: [
    'Compact and braced (L_b ≤ L_p), so the whole section yields: φM_p = 0.9F_yZ.',
    'Z from the flanges and web as rectangles; the fillets where they meet are left out, so Z is a little low.',
    'kip·in ÷ 12 is kip·ft.',
  ],
  variables: [
    len('d', 'd', 'Depth', 'in', 100, 1),
    len('bf', 'b_f', 'Flange width', 'in', 100, 1),
    len('tf', 't_f', 'Flange thickness', 'in', 10, 0.05),
    len('tw', 't_w', 'Web thickness', 'in', 10, 0.05),
    plain('Z', 'Z_x', 'Plastic section modulus', 'in³', 0.01, 1e5),
    plain('Fy', 'F_y', 'Yield stress', 'ksi', 1, 200),
    plain('M', 'φM_p', 'Design plastic moment', 'kip·ft', 0.01, 1e6),
  ],
  rules: [
    {
      id: 'Z = b_ft_f(d − t_f) + t_w(d − 2t_f)² ÷ 4',
      display: '{Z} = {bf} × {tf} × ({d} − {tf}) + {tw} × ({d} − 2 × {tf})² ÷ 4',
      vars: ['Z', 'bf', 'tf', 'd', 'tw'],
      residual: (x) => x.Z! - zOfW(x),
      ways: {
        Z: [
          zOfW,
          '{bf} × {tf} × ({d} − {tf}) + {tw} × ({d} − 2 × {tf})² ÷ 4',
          'Each flange’s area times its distance from the axis, twice, plus the web’s two halves.',
        ],
        bf: [
          (x) => div(x.Z! - (x.tw! * (x.d! - 2 * x.tf!) ** 2) / 4, x.tf! * (x.d! - x.tf!)),
          '({Z} − {tw} × ({d} − 2 × {tf})² ÷ 4) ÷ ({tf} × ({d} − {tf}))',
          'Take the web’s part away, then divide by t_f(d − t_f).',
        ],
        tw: [
          (x) => div(4 * (x.Z! - x.bf! * x.tf! * (x.d! - x.tf!)), (x.d! - 2 * x.tf!) ** 2),
          '4 × ({Z} − {bf} × {tf} × ({d} − {tf})) ÷ ({d} − 2 × {tf})²',
          'Take the flanges’ part away, multiply by 4 and divide by the web’s height squared.',
        ],
        d: null,
        tf: null,
      },
    },
    {
      id: 'φM_p = 0.9F_yZ',
      display: '{M} = 0.9 × {Fy} × {Z} ÷ 12',
      vars: ['M', 'Fy', 'Z'],
      residual: (x) => 12 * x.M! - 0.9 * x.Fy! * x.Z!,
      ways: {
        M: [
          (x) => (0.9 * x.Fy! * x.Z!) / 12,
          '0.9 × {Fy} × {Z} ÷ 12',
          'Every fiber at F_y gives F_yZ in kip·in; φ = 0.9, and ÷ 12 for kip·ft.',
        ],
        Fy: [
          (x) => div(12 * x.M!, 0.9 * x.Z!),
          '12 × {M} ÷ (0.9 × {Z})',
          'Turn φM_p into kip·in, then divide by 0.9Z.',
        ],
        Z: [
          (x) => div(12 * x.M!, 0.9 * x.Fy!),
          '12 × {M} ÷ (0.9 × {Fy})',
          'Turn φM_p into kip·in, then divide by 0.9F_y.',
        ],
      },
    },
  ],
  example: (() => {
    const base = { d: 18, tw: 0.355, ...w18 };
    const Z = zOfW(base);
    return { ...base, Z, Fy: 50, M: (0.9 * 50 * Z) / 12 };
  })(),
  startWith: ['d', 'bf', 'tf', 'tw', 'Fy'],
  representation: {
    kind: 'section',
    shape: 'wide',
    d: 'd',
    bf: 'bf',
    tf: 'tf',
    tw: 'tw',
    stress: 'plastic',
    edge: 'Fy',
    load: 'M',
  },
  pictureLabels: ['Z'],
  us: true,
});

// ─── Concrete design (US units, ACI 318-19) ──────────────────────────────────

/** Bar areas (in²), #3 to #11. */
const BAR_AREAS = [0.11, 0.2, 0.31, 0.44, 0.6, 0.79, 1, 1.27, 1.56];

const flexureRules = (): Rule[] => [
  product('A_s = nA_b', 'As', 'n', 'Ab', 'n bars of A_b each'),
  {
    id: 'a = A_sf_y ÷ (0.85f′_cb)',
    display: '{a} = {As} × {fy} ÷ (0.85 × {fc} × {b})',
    vars: ['a', 'As', 'fy', 'fc', 'b'],
    residual: (x) => x.a! * 0.85 * x.fc! * x.b! - x.As! * x.fy!,
    ways: {
      a: [
        (x) => div(x.As! * x.fy!, 0.85 * x.fc! * x.b!),
        '{As} × {fy} ÷ (0.85 × {fc} × {b})',
        'The steel’s pull A_sf_y equals the concrete block’s push 0.85f′_c × ab.',
      ],
      As: [
        (x) => div(x.a! * 0.85 * x.fc! * x.b!, x.fy!),
        '{a} × 0.85 × {fc} × {b} ÷ {fy}',
        'The block’s push, divided by f_y.',
      ],
      fy: [
        (x) => div(x.a! * 0.85 * x.fc! * x.b!, x.As!),
        '{a} × 0.85 × {fc} × {b} ÷ {As}',
        'The block’s push, divided by A_s.',
      ],
      fc: [
        (x) => div(x.As! * x.fy!, 0.85 * x.a! * x.b!),
        '{As} × {fy} ÷ (0.85 × {a} × {b})',
        'The steel’s pull, divided by 0.85ab.',
      ],
      b: [
        (x) => div(x.As! * x.fy!, 0.85 * x.fc! * x.a!),
        '{As} × {fy} ÷ (0.85 × {fc} × {a})',
        'The steel’s pull, divided by 0.85f′_c a.',
      ],
    },
  },
  {
    id: 'a = β₁c',
    display: '{a} = 0.85 × {c}',
    vars: ['a', 'c'],
    residual: (x) => x.a! - 0.85 * x.c!,
    ways: {
      a: [
        (x) => 0.85 * x.c!,
        '0.85 × {c}',
        'The block is β₁ = 0.85 of the depth to the neutral axis.',
      ],
      c: [(x) => x.a! / 0.85, '{a} ÷ 0.85', 'Divide the block’s depth by β₁ = 0.85.'],
    },
  },
  {
    id: 'ε_t = 0.003(d − c) ÷ c',
    display: '{et} = 0.003 × ({d} − {c}) ÷ {c}',
    vars: ['et', 'd', 'c'],
    residual: (x) => x.et! * x.c! - 0.003 * (x.d! - x.c!),
    ways: {
      et: [
        (x) => div(0.003 * (x.d! - x.c!), x.c!),
        '0.003 × ({d} − {c}) ÷ {c}',
        'The strain line runs from 0.003 at the top through zero at c; at the bars it is 0.003(d − c) ÷ c.',
      ],
      d: [
        (x) => x.c! * (1 + x.et! / 0.003),
        '{c} × (1 + {et} ÷ 0.003)',
        'Similar triangles: d − c is ε_t ÷ 0.003 of c.',
      ],
      c: [
        (x) => div(0.003 * x.d!, x.et! + 0.003),
        '0.003 × {d} ÷ ({et} + 0.003)',
        'Similar triangles: c is 0.003 ÷ (ε_t + 0.003) of d.',
      ],
    },
  },
  {
    id: 'φM_n = 0.9A_sf_y(d − a ÷ 2)',
    display: '{Mn} = 0.9 × {As} × {fy} × ({d} − {a} ÷ 2) ÷ 12',
    vars: ['Mn', 'As', 'fy', 'd', 'a'],
    residual: (x) => 12 * x.Mn! - 0.9 * x.As! * x.fy! * (x.d! - x.a! / 2),
    ways: {
      Mn: [
        (x) => (0.9 * x.As! * x.fy! * (x.d! - x.a! / 2)) / 12,
        '0.9 × {As} × {fy} × ({d} − {a} ÷ 2) ÷ 12',
        'The pull A_sf_y times its lever arm d − a ÷ 2, φ = 0.9, ÷ 12 for kip·ft.',
      ],
      As: [
        (x) => div(12 * x.Mn!, 0.9 * x.fy! * (x.d! - x.a! / 2)),
        '12 × {Mn} ÷ (0.9 × {fy} × ({d} − {a} ÷ 2))',
        'Turn φM_n into kip·in, divide by 0.9f_y and the lever arm.',
      ],
      fy: [
        (x) => div(12 * x.Mn!, 0.9 * x.As! * (x.d! - x.a! / 2)),
        '12 × {Mn} ÷ (0.9 × {As} × ({d} − {a} ÷ 2))',
        'Turn φM_n into kip·in, divide by 0.9A_s and the lever arm.',
      ],
      d: [
        (x) => div(12 * x.Mn!, 0.9 * x.As! * x.fy!)! + x.a! / 2,
        '12 × {Mn} ÷ (0.9 × {As} × {fy}) + {a} ÷ 2',
        'The lever arm is 12φM_n ÷ (0.9A_sf_y); add a ÷ 2.',
      ],
      a: [
        (x) => 2 * (x.d! - div(12 * x.Mn!, 0.9 * x.As! * x.fy!)!),
        '2 × ({d} − 12 × {Mn} ÷ (0.9 × {As} × {fy}))',
        'Take the lever arm away from d, then double.',
      ],
    },
  },
];

const flexureVars = (): VariableDef[] => [
  len('b', 'b', 'Beam width', 'in', 100, 4),
  len('d', 'd', 'Depth to the bars', 'in', 100, 4),
  plain('n', 'n', 'Number of bars', undefined, 1, 12, { integer: true }),
  plain('Ab', 'A_b', 'Area of one bar', 'in²', 0.11, 1.56, { allowed: BAR_AREAS }),
  plain('As', 'A_s', 'Steel area', 'in²', 0.01, 100),
  plain('fc', 'f′_c', 'Concrete strength', 'ksi', 2.5, 4, { step: 0.5 }),
  plain('fy', 'f_y', 'Steel yield stress', 'ksi', 40, 100),
  len('a', 'a', 'Depth of the stress block', 'in', 100, 0.01),
  len('c', 'c', 'Depth to the neutral axis', 'in', 100, 0.01),
  plain('et', 'ε_t', 'Strain in the steel', undefined, 1e-6, 1),
  plain('Mn', 'φM_n', 'Design moment strength', 'kip·ft', 0.01, 1e6),
];

const flexureExample = (b: number, d: number, n: number, Ab: number, fc = 4, fy = 60) => {
  const As = n * Ab;
  const a = (As * fy) / (0.85 * fc * b);
  const c = a / 0.85;
  return {
    b,
    d,
    n,
    Ab,
    As,
    fc,
    fy,
    a,
    c,
    et: (0.003 * (d - c)) / c,
    Mn: (0.9 * As * fy * (d - a / 2)) / 12,
  };
};

const WHITNEY: Representation = {
  kind: 'section',
  shape: 'rc',
  b: 'b',
  d: 'd',
  bars: 'n',
  barArea: 'Ab',
  steel: 'As',
  whitney: true,
  a: 'a',
  c: 'c',
  epsT: 'et',
  fc: 'fc',
  beta1: 0.85,
};

const flexureAssumptions = [
  'Plane sections stay plane; the concrete crushes at a strain of 0.003; the steel has yielded.',
  'f′_c up to 4 ksi, so β₁ = 0.85; φ = 0.9 only while ε_t ≥ 0.005 (tension-controlled).',
  'kip·in ÷ 12 is kip·ft.',
];

const whitney = demo({
  id: 'g.he-section-whitney',
  title: 'Flexural strength of a reinforced concrete beam',
  use: 'Use this for “A 12 in beam, d = 20 in, has 3 #8 bars (4 ksi concrete, 60 ksi steel). What is φM_n?”',
  assumptions: flexureAssumptions,
  variables: flexureVars(),
  rules: flexureRules(),
  example: flexureExample(12, 20, 3, 0.79),
  startWith: ['b', 'd', 'n', 'Ab', 'fc', 'fy'],
  representation: WHITNEY,
  us: true,
});

const whitneyEdge = demo({
  id: 'g.he-section-whitney-edge',
  title: 'A beam just tension-controlled',
  use: 'Use this for “Is a 12 in beam, d = 20 in, with 4 #9 bars still tension-controlled?”',
  assumptions: flexureAssumptions,
  variables: flexureVars(),
  rules: flexureRules(),
  example: flexureExample(12, 20, 4, 1),
  startWith: ['b', 'd', 'n', 'Ab', 'fc', 'fy'],
  representation: WHITNEY,
  us: true,
});

const vcOf = (x: Values) => (2 * Math.sqrt(x.fc!) * x.b! * x.d!) / 1000;

const stirrups = demo({
  id: 'g.he-section-stirrups',
  title: 'Stirrup spacing for a factored shear',
  use: 'Use this for “A 12 × 20 in beam (4000 psi) carries V_u = 50 kips. How far apart can #3 stirrups be?”',
  assumptions: [
    'Normal-weight concrete (λ = 1) and vertical stirrups, two legs each.',
    'V_c = 2√f′_c b_wd uses f′_c in psi and gives pounds; ÷ 1000 for kips.',
    'The spacing is also at most d ÷ 2.',
  ],
  variables: [
    len('b', 'b_w', 'Web width', 'in', 100, 4),
    len('d', 'd', 'Depth to the bars', 'in', 100, 4),
    plain('fc', 'f′_c', 'Concrete strength', 'psi', 2500, 10000),
    plain('Vc', 'V_c', 'Concrete shear strength', 'kips', 0.01, 1e4),
    plain('Vu', 'V_u', 'Factored shear', 'kips', 0.01, 1e4),
    plain('Vs', 'V_s', 'Shear the stirrups carry', 'kips', 0.01, 1e4),
    plain('Av', 'A_v', 'Area of both stirrup legs', 'in²', 0.01, 10),
    plain('fyt', 'f_yt', 'Stirrup yield stress', 'ksi', 40, 80),
    len('s', 's', 'Stirrup spacing', 'in', 100, 0.1),
  ],
  rules: [
    {
      id: 'V_c = 2√f′_c b_wd',
      display: '{Vc} = 2 × √{fc} × {b} × {d} ÷ 1000',
      vars: ['Vc', 'fc', 'b', 'd'],
      residual: (x) => x.Vc! - vcOf(x),
      ways: {
        Vc: [
          vcOf,
          '2 × √{fc} × {b} × {d} ÷ 1000',
          'The concrete’s share: 2√f′_c (psi) on the web’s area, in pounds, ÷ 1000 for kips.',
        ],
        fc: [
          (x) => (div(1000 * x.Vc!, 2 * x.b! * x.d!) ?? NaN) ** 2,
          '(1000 × {Vc} ÷ (2 × {b} × {d}))²',
          'Turn V_c into pounds, divide by 2b_wd, then square.',
        ],
        b: [
          (x) => div(1000 * x.Vc!, 2 * Math.sqrt(x.fc!) * x.d!),
          '1000 × {Vc} ÷ (2 × √{fc} × {d})',
          'Turn V_c into pounds and divide by 2√f′_c d.',
        ],
        d: [
          (x) => div(1000 * x.Vc!, 2 * Math.sqrt(x.fc!) * x.b!),
          '1000 × {Vc} ÷ (2 × √{fc} × {b})',
          'Turn V_c into pounds and divide by 2√f′_c b_w.',
        ],
      },
    },
    {
      id: 'V_s = V_u ÷ 0.75 − V_c',
      display: '{Vs} = {Vu} ÷ 0.75 − {Vc}',
      vars: ['Vs', 'Vu', 'Vc'],
      residual: (x) => x.Vs! - x.Vu! / 0.75 + x.Vc!,
      ways: {
        Vs: [
          (x) => x.Vu! / 0.75 - x.Vc!,
          '{Vu} ÷ 0.75 − {Vc}',
          'The strength needed is V_u ÷ φ (φ = 0.75); the stirrups carry what the concrete doesn’t.',
        ],
        Vu: [
          (x) => 0.75 * (x.Vs! + x.Vc!),
          '0.75 × ({Vs} + {Vc})',
          'Add the two shares, then multiply by φ = 0.75.',
        ],
        Vc: [
          (x) => x.Vu! / 0.75 - x.Vs!,
          '{Vu} ÷ 0.75 − {Vs}',
          'Take the stirrups’ share away from V_u ÷ 0.75.',
        ],
      },
    },
    {
      id: 's = A_vf_ytd ÷ V_s',
      display: '{s} = {Av} × {fyt} × {d} ÷ {Vs}',
      vars: ['s', 'Av', 'fyt', 'd', 'Vs'],
      residual: (x) => x.s! * x.Vs! - x.Av! * x.fyt! * x.d!,
      ways: {
        s: [
          (x) => div(x.Av! * x.fyt! * x.d!, x.Vs!),
          '{Av} × {fyt} × {d} ÷ {Vs}',
          'Each stirrup carries A_vf_yt; a 45° crack d long crosses d ÷ s of them.',
        ],
        Av: [
          (x) => div(x.s! * x.Vs!, x.fyt! * x.d!),
          '{s} × {Vs} ÷ ({fyt} × {d})',
          'Multiply s by V_s, then divide by f_yt d.',
        ],
        fyt: [
          (x) => div(x.s! * x.Vs!, x.Av! * x.d!),
          '{s} × {Vs} ÷ ({Av} × {d})',
          'Multiply s by V_s, then divide by A_v d.',
        ],
        d: [
          (x) => div(x.s! * x.Vs!, x.Av! * x.fyt!),
          '{s} × {Vs} ÷ ({Av} × {fyt})',
          'Multiply s by V_s, then divide by A_vf_yt.',
        ],
        Vs: [
          (x) => div(x.Av! * x.fyt! * x.d!, x.s!),
          '{Av} × {fyt} × {d} ÷ {s}',
          'Swap V_s and s.',
        ],
      },
    },
  ],
  example: (() => {
    const base = { b: 12, d: 20, fc: 4000, Vu: 50, Av: 0.22, fyt: 60 };
    const Vc = vcOf(base);
    const Vs = 50 / 0.75 - Vc;
    return { ...base, Vc, Vs, s: (0.22 * 60 * 20) / Vs };
  })(),
  startWith: ['b', 'd', 'fc', 'Vu', 'Av', 'fyt'],
  representation: {
    kind: 'section',
    shape: 'rc',
    unit: 'in',
    b: 'b',
    d: 'd',
    bars: 3,
    barSize: 8,
    stirrup: 'Av',
  },
  pictureLabels: ['fc', 'Vc', 'Vu', 'Vs', 'fyt', 's'],
  us: true,
});

const columnRules = (phi: number, phiText: string, kind: string): Rule[] => [
  {
    id: 'A_g = h²',
    display: '{Ag} = {h}²',
    vars: ['Ag', 'h'],
    residual: (x) => x.Ag! - x.h! ** 2,
    ways: {
      Ag: [(x) => x.h! ** 2, '{h}²', 'A square column: side times side.'],
      h: [(x) => root(x.Ag!), '√{Ag}', 'Take the square root of the area.'],
    },
  },
  product('A_st = nA_b', 'Ast', 'n', 'Ab', 'n bars of A_b each'),
  {
    id: 'P₀ = 0.85f′_c(A_g − A_st) + f_yA_st',
    display: '{P0} = 0.85 × {fc} × ({Ag} − {Ast}) + {fy} × {Ast}',
    vars: ['P0', 'fc', 'Ag', 'Ast', 'fy'],
    residual: (x) => x.P0! - 0.85 * x.fc! * (x.Ag! - x.Ast!) - x.fy! * x.Ast!,
    ways: {
      P0: [
        (x) => 0.85 * x.fc! * (x.Ag! - x.Ast!) + x.fy! * x.Ast!,
        '0.85 × {fc} × ({Ag} − {Ast}) + {fy} × {Ast}',
        'The concrete at 0.85f′_c on its own area, plus the steel at f_y.',
      ],
      fc: [
        (x) => div(x.P0! - x.fy! * x.Ast!, 0.85 * (x.Ag! - x.Ast!)),
        '({P0} − {fy} × {Ast}) ÷ (0.85 × ({Ag} − {Ast}))',
        'Take the steel’s share away, then divide by 0.85 times the concrete’s area.',
      ],
      Ag: [
        (x) => div(x.P0! - x.fy! * x.Ast!, 0.85 * x.fc!)! + x.Ast!,
        '({P0} − {fy} × {Ast}) ÷ (0.85 × {fc}) + {Ast}',
        'The concrete’s area from its share, plus the steel’s.',
      ],
      fy: [
        (x) => div(x.P0! - 0.85 * x.fc! * (x.Ag! - x.Ast!), x.Ast!),
        '({P0} − 0.85 × {fc} × ({Ag} − {Ast})) ÷ {Ast}',
        'Take the concrete’s share away, then divide by A_st.',
      ],
      Ast: [
        (x) => div(x.P0! - 0.85 * x.fc! * x.Ag!, x.fy! - 0.85 * x.fc!),
        '({P0} − 0.85 × {fc} × {Ag}) ÷ ({fy} − 0.85 × {fc})',
        'Multiply out; A_st appears as (f_y − 0.85f′_c)A_st, so divide by that.',
      ],
    },
  },
  {
    id: `φP_n,max = ${phiText}P₀`,
    display: `{Pn} = ${phiText} × {P0}`,
    vars: ['Pn', 'P0'],
    residual: (x) => x.Pn! - phi * x.P0!,
    ways: {
      Pn: [(x) => phi * x.P0!, `${phiText} × {P0}`, `A ${kind} column: the cap and φ together.`],
      P0: [(x) => x.Pn! / phi, `{Pn} ÷ (${phiText})`, 'Divide by the cap and φ.'],
    },
  },
  {
    id: 'ρ_g = A_st ÷ A_g',
    display: '{rho} = 100 × {Ast} ÷ {Ag}',
    vars: ['rho', 'Ast', 'Ag'],
    residual: (x) => x.rho! * x.Ag! - 100 * x.Ast!,
    ways: {
      rho: [
        (x) => div(100 * x.Ast!, x.Ag!),
        '100 × {Ast} ÷ {Ag}',
        'The steel’s share of the area, as a percent; it must be from 1% to 8%.',
      ],
      Ast: [(x) => (x.rho! * x.Ag!) / 100, '{rho} × {Ag} ÷ 100', 'Take that percent of the area.'],
      Ag: [
        (x) => div(100 * x.Ast!, x.rho!),
        '100 × {Ast} ÷ {rho}',
        'Divide the steel area by the percent, times 100.',
      ],
    },
  },
];

const columnVars = (): VariableDef[] => [
  len('h', 'h', 'Column width', 'in', 100, 8),
  plain('Ag', 'A_g', 'Gross area', 'in²', 1, 1e4),
  plain('n', 'n', 'Number of bars', undefined, 4, 24, { integer: true }),
  plain('Ab', 'A_b', 'Area of one bar', 'in²', 0.11, 1.56, { allowed: BAR_AREAS }),
  plain('Ast', 'A_st', 'Steel area', 'in²', 0.01, 1000),
  plain('fc', 'f′_c', 'Concrete strength', 'ksi', 2.5, 12, { step: 0.5 }),
  plain('fy', 'f_y', 'Steel yield stress', 'ksi', 40, 100),
  plain('P0', 'P₀', 'Squash load', 'kips', 0.01, 1e6),
  plain('Pn', 'φP_n,max', 'Design axial strength', 'kips', 0.01, 1e6),
  plain('rho', 'ρ_g', 'Steel ratio', '%', 0.01, 100),
];

const columnExample = (phi: number) => {
  const [h, n, Ab, fc, fy] = [16, 8, 0.79, 5, 60];
  const Ag = h * h;
  const Ast = n * Ab;
  const P0 = 0.85 * fc * (Ag - Ast) + fy * Ast;
  return { h, Ag, n, Ab, Ast, fc, fy, P0, Pn: phi * P0, rho: (100 * Ast) / Ag };
};

const COLUMN: Representation = {
  kind: 'section',
  shape: 'rc',
  b: 'h',
  h: 'h',
  layout: 'perimeter',
  bars: 'n',
  barArea: 'Ab',
  steel: 'Ast',
  area: 'Ag',
};

const columnAssumptions = (tie: string) => [
  `A short ${tie} column, loaded nearly through its center.`,
  'The cap (0.80 tied, 0.85 spiral) covers a small accidental eccentricity.',
];

const tied = demo({
  id: 'g.he-section-column',
  title: 'Axial strength of a tied column',
  use: 'Use this for “A 16 in square tied column has 8 #8 bars (5 ksi, 60 ksi). What is φP_n,max?”',
  assumptions: [...columnAssumptions('tied'), 'φ = 0.65 for a tied column.'],
  variables: columnVars(),
  rules: columnRules(0.8 * 0.65, '0.80 × 0.65', 'tied'),
  example: columnExample(0.8 * 0.65),
  startWith: ['h', 'n', 'Ab', 'fc', 'fy'],
  representation: COLUMN,
  pictureLabels: ['fc', 'fy', 'P0', 'Pn', 'rho'],
  us: true,
});

const spiral = demo({
  id: 'g.he-section-spiral',
  title: 'Axial strength of a spiral column',
  use: 'Use this for “The same 16 in column with 8 #8 bars, now with a spiral. What is φP_n,max?”',
  assumptions: [...columnAssumptions('spiral'), 'φ = 0.75 for a spiral column.'],
  variables: columnVars(),
  rules: columnRules(0.85 * 0.75, '0.85 × 0.75', 'spiral'),
  example: columnExample(0.85 * 0.75),
  startWith: ['h', 'n', 'Ab', 'fc', 'fy'],
  representation: { ...COLUMN, tie: 'spiral' },
  pictureLabels: ['fc', 'fy', 'P0', 'Pn', 'rho'],
  us: true,
});

export const HE1B_GALLERY_MODULES: ModuleDef[] = [
  tee,
  hole,
  angle,
  parallel,
  composite,
  polar,
  gyration,
  bending,
  shearStress,
  plastic,
  torsion,
  vessel,
  thick,
  cabin,
  box,
  web,
  wPlastic,
  whitney,
  whitneyEdge,
  stirrups,
  tied,
  spiral,
];

export const HE1B_GALLERY_LAYOUTS: LayoutDef[] = [];
