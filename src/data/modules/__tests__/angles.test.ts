/**
 * Angles on a page (HE-E19): the helpers in `angles.ts` give steps the harness passes, on
 * test-only pages from the plans: a resultant's direction in any quadrant, an oscillator's
 * phase in radians, a traverse course's latitude and departure from a DMS azimuth and its
 * bearing back, a slope reading at 4°30′00″, a polygon's angle misclosure in seconds, and an
 * angle typed in degrees for a rule in radians.
 */
import { buildSteps } from '@/data/modules/buildSteps';
import { acosD, asinD, atan2D, azimuthD, cosD, sinD } from '@/engine/angles';
import { formatNumber, parseNumber } from '@/engine/format';
import { solve } from '@/engine/solve';
import type { Values } from '@/engine/types';
import { makeUnitContext, unitChoices, type UnitChoice } from '@/engine/unitContext';

import { angleFormVariable, angleVariable, atan2Rule, bearingRule } from '../angles';
import { checkAngleLines } from '../harness/angles';
import { evaluate, plainWalkthrough, setAngleUnit, shownClose } from '../harness/evaluate';
import type { ModuleDef } from '../types';
import { joinRules } from '../written';

afterEach(() => setAngleUnit('radians'));

/** The number an answer ends at: a DMS angle, a bearing, or a plain number. */
function answer(result: string): number {
  const rhs = result
    .split(' = ')
    .pop()!
    .replace(/ (?:m|N|rad|m\/s)$/, '');
  const n = parseNumber(rhs);
  if (typeof n === 'number') return n;
  return Number(/^-?[\d.]+/.exec(rhs.replace('−', '-'))?.[0]);
}

/** Walks a page from its example (or `given`) and checks what the sampling harness checks. */
function walk(m: ModuleDef, given?: Values, choice: UnitChoice = { system: 'metric' }) {
  setAngleUnit(m.variables.some((v) => v.unit === '°') ? 'degrees' : 'radians');
  const units = makeUnitContext(m, choice);
  const start = given ?? Object.fromEntries(m.startWith.map((id) => [id, m.example[id]!]));
  const res = solve(
    units.system,
    Object.entries(start).map(([id, value]) => ({ id, value })),
  );
  const w = plainWalkthrough(buildSteps(m, res, units));
  expect(w.missing).toEqual([]);
  for (const s of w.steps) {
    expect(checkAngleLines(s.lines)).toEqual([]);
    const line = s.substituted ?? s.rearranged!;
    const x = evaluate(line.slice(line.indexOf(' = ') + 3));
    expect([s.id, line, x !== undefined && shownClose(x, answer(s.result))]).toEqual([
      s.id,
      line,
      true,
    ]);
  }
  for (const k of w.check) {
    expect([k.formula, k.ok]).toEqual([k.formula, true]);
    const [l, r] = k.formula.split(' = ').map((t) => evaluate(t));
    expect([k.formula, shownClose(l!, r!)]).toEqual([k.formula, true]);
  }
  return { w, res };
}

const len = (id: string, symbol: string, name: string, extra = {}) => ({
  id,
  symbol,
  name,
  unit: 'm',
  min: -100000,
  max: 100000,
  ...extra,
});

describe('atan2 on a page', () => {
  // A resultant from its parts: R = √(Rx² + Ry²), β = atan2(Ry, Rx).
  const page: ModuleDef = {
    id: 'he.engineering.statics#0~resultant',
    title: 'Resultant of forces',
    assumptions: ['Angles from the +x axis, counterclockwise.'],
    variables: [
      { id: 'Rx', symbol: 'R_x', name: 'x part', unit: 'N', min: -1e6, max: 1e6 },
      { id: 'Ry', symbol: 'R_y', name: 'y part', unit: 'N', min: -1e6, max: 1e6 },
      { id: 'R', symbol: 'R', name: 'Resultant', unit: 'N', min: 0, max: 2e6, derived: true },
      { ...angleVariable('b', 'β', 'Direction', { min: -180, max: 180 }), derived: true },
    ],
    ...joinRules(
      {
        relations: [
          {
            id: 'R = √(Rx² + Ry²)',
            display: '{R} = √({Rx}² + {Ry}²)',
            vars: ['R', 'Rx', 'Ry'],
            residual: (v) => v.R! - Math.hypot(v.Rx!, v.Ry!),
            solve: { R: (v) => Math.hypot(v.Rx!, v.Ry!), Rx: () => undefined, Ry: () => undefined },
          },
        ],
        steps: {
          'R = √(Rx² + Ry²)': {
            R: { expr: '√({Rx}² + {Ry}²)', how: 'The parts are the legs of a right triangle.' },
          },
        },
      },
      atan2Rule({ target: 'b', y: 'Ry', x: 'Rx', symbol: 'β' }),
    ),
    example: { Rx: 129.29, Ry: 229.29, R: Math.hypot(129.29, 229.29), b: atan2D(229.29, 129.29)! },
    startWith: ['Rx', 'Ry'],
    representation: { kind: 'none' },
  };

  it('works the plan’s example and every quadrant', () => {
    const { w } = walk(page);
    const b = w.steps.find((s) => s.id === 'b')!;
    expect(b.substituted).toBe('β = atan2(229.29, 129.29)');
    expect(b.lines).toContain('(129.29, 229.29) is in quadrant I: tan⁻¹ gives the angle as it is');
    for (const [Rx, Ry] of [
      [-50, 120],
      [-50, -120],
      [50, -120],
      [0, 80],
      [-30, 0],
    ]) {
      const r = walk(page, { Rx: Rx!, Ry: Ry! });
      expect(r.res.values.b).toBeCloseTo(Math.atan2(Ry!, Rx!) / (Math.PI / 180), 9);
    }
    const q2 = walk(page, { Rx: -50, Ry: 120 }).w.steps.find((s) => s.id === 'b')!;
    expect(q2.lines).toEqual(
      expect.arrayContaining([
        '(-50, 120) is in quadrant II: add 180°',
        'β = tan⁻¹(120 ÷ (-50)) + 180° = -67.3801° + 180° = 112.6199°',
      ]),
    );
  });

  it('is never worked backward from the angle', () => {
    const r = solve(page, [
      { id: 'b', value: 30 },
      { id: 'R', value: 10 },
    ]);
    expect(r.values.Rx).toBeUndefined();
  });

  // SHM: φ = atan2(−v₀/ω, x₀), in radians.
  it('gives a phase in radians', () => {
    const shm: ModuleDef = {
      id: 'he.physics.university-1#5',
      title: 'Oscillations',
      assumptions: ['φ is in radians.'],
      variables: [
        { id: 'x0', symbol: 'x₀', name: 'Start position', unit: 'm', min: -10, max: 10 },
        { id: 'v0', symbol: 'v₀', name: 'Start velocity', unit: 'm/s', min: -100, max: 100 },
        { id: 'w', symbol: 'ω', name: 'Angular frequency', unit: 'rad/s', min: 0.01, max: 1000 },
        { id: 'q', symbol: 'q', name: '−v₀ ÷ ω', unit: 'm', min: -100, max: 100, derived: true },
        { ...angleVariable('p', 'φ', 'Phase', { unit: 'rad' }), derived: true },
      ],
      ...joinRules(
        {
          relations: [
            {
              id: 'q = −v₀ ÷ ω',
              display: '{q} = −{v0} ÷ {w}',
              vars: ['q', 'v0', 'w'],
              residual: (v) => v.q! + v.v0! / v.w!,
              solve: { q: (v) => -v.v0! / v.w!, v0: () => undefined, w: () => undefined },
            },
          ],
          steps: {
            'q = −v₀ ÷ ω': { q: { expr: '−{v0} ÷ {w}', how: 'The start velocity over ω.' } },
          },
        },
        atan2Rule({ target: 'p', y: 'q', x: 'x0', symbol: 'φ', unit: 'rad' }),
      ),
      example: { x0: 0.03, v0: 0.4, w: 10, q: -0.04, p: Math.atan2(-0.04, 0.03) },
      startWith: ['x0', 'v0', 'w'],
      representation: { kind: 'none' },
    };
    const { w } = walk(shm);
    const p = w.steps.find((s) => s.id === 'p')!;
    expect(p.result).toBe('φ = -0.9273 rad');
    expect(p.lines).toContain('φ = tan⁻¹(-0.04 ÷ 0.03) = -0.9273 rad');
    walk(shm, { x0: -0.03, v0: 0.4, w: 10 });
  });
});

describe('DMS and bearings on a page', () => {
  const traverse: ModuleDef = {
    id: 'he.engineering.surveying#2',
    title: 'Latitude and departure',
    assumptions: ['Azimuth clockwise from north; north and east are +.'],
    variables: [
      angleFormVariable('a', 'α', 'Azimuth', 'dm'),
      len('L', 'L', 'Length', { min: 0 }),
      len('lat', 'lat', 'Latitude', { derived: true }),
      len('dep', 'dep', 'Departure', { derived: true }),
    ],
    relations: [
      {
        id: 'lat = L cos α',
        display: '{lat} = {L} × cos({a})',
        vars: ['lat', 'L', 'a'],
        residual: (v) => v.lat! - v.L! * cosD(v.a!),
        solve: { lat: (v) => v.L! * cosD(v.a!) },
      },
      {
        id: 'dep = L sin α',
        display: '{dep} = {L} × sin({a})',
        vars: ['dep', 'L', 'a'],
        residual: (v) => v.dep! - v.L! * sinD(v.a!),
        solve: { dep: (v) => v.L! * sinD(v.a!) },
      },
    ],
    steps: {
      'lat = L cos α': { lat: { expr: '{L} × cos({a})', how: 'The north part of the course.' } },
      'dep = L sin α': { dep: { expr: '{L} × sin({a})', how: 'The east part of the course.' } },
    },
    example: { a: 52, L: 120, lat: 120 * cosD(52), dep: 120 * sinD(52) },
    startWith: ['a', 'L'],
    representation: { kind: 'none' },
  };

  it('reads a DMS azimuth into the steps and the boxes', () => {
    const { w } = walk(traverse, { a: 52 + 10 / 60, L: 120 });
    expect(w.given.find((q) => q.symbol === 'α')!.value).toBe('52°10′');
    const lat = w.steps.find((s) => s.id === 'lat')!;
    expect(lat.substituted).toBe('lat = 120 × cos(52°10′)');
    expect(formatNumber(4.5, traverse.variables[0]!)).toBe('4°30′');
    expect(parseNumber('52°10′')).toBeCloseTo(52 + 10 / 60, 12);
    // no unit menu (the text carries its marks)
    expect(unitChoices(traverse.variables[0]!, 'metric', traverse.variables)).toEqual([]);
  });

  it('gives the bearing back from latitude and departure', () => {
    const back: ModuleDef = {
      id: 'he.engineering.surveying#2~bearing',
      title: 'Bearing of a course',
      assumptions: ['North and east are +.'],
      variables: [
        len('dep', 'dep', 'Departure'),
        len('lat', 'lat', 'Latitude'),
        { ...angleFormVariable('a', 'β', 'Bearing', 'bearing'), derived: true },
      ],
      ...bearingRule({
        target: 'a',
        east: 'dep',
        north: 'lat',
        symbol: 'β',
        bearing: 'dms',
        show: (x) => formatNumber(x, { decimals: 2 }),
      }),
      example: { dep: 94.56, lat: 73.88, a: azimuthD(94.56, 73.88)! },
      startWith: ['dep', 'lat'],
      representation: { kind: 'none' },
    };
    const { w } = walk(back);
    expect(w.steps[0]!.result).toBe('β = N 51°59′58″ E');
    for (const [dep, lat] of [
      [-0.6, -0.4],
      [30, -40],
      [-30, 40],
      [0, -5],
    ]) {
      walk(back, { dep: dep!, lat: lat! });
    }
    expect(walk(back, { dep: -0.6, lat: -0.4 }).w.steps[0]!.result).toBe('β = S 56°18′36″ W');
  });

  it('works a slope reading at 4°30′00″ forward and back', () => {
    const slope: ModuleDef = {
      id: 'he.engineering.surveying#0',
      title: 'Slope distance',
      assumptions: ['α from horizontal.'],
      variables: [
        len('S', 'S', 'Slope distance', { min: 0 }),
        angleFormVariable('a', 'α', 'Vertical angle', 'dms', { min: -90, max: 90 }),
        len('H', 'H', 'Horizontal distance', { min: 0 }),
        len('V', 'V', 'Vertical distance'),
      ],
      relations: [
        {
          id: 'H = S cos α',
          display: '{H} = {S} × cos({a})',
          vars: ['H', 'S', 'a'],
          residual: (v) => v.H! - v.S! * cosD(v.a!),
          solve: { H: (v) => v.S! * cosD(v.a!), a: (v) => acosD(v.H! / v.S!) },
        },
        {
          id: 'V = S sin α',
          display: '{V} = {S} × sin({a})',
          vars: ['V', 'S', 'a'],
          residual: (v) => v.V! - v.S! * sinD(v.a!),
          solve: { V: (v) => v.S! * sinD(v.a!), a: (v) => asinD(v.V! / v.S!) },
        },
      ],
      steps: {
        'H = S cos α': {
          H: { expr: '{S} × cos({a})', how: 'The horizontal leg is next to α.' },
          a: { expr: 'cos⁻¹({H} ÷ {S})', how: 'Undo the cosine.' },
        },
        'V = S sin α': {
          V: { expr: '{S} × sin({a})', how: 'The vertical leg is across from α.' },
        },
      },
      example: { S: 245.3, a: 4.5, H: 245.3 * cosD(4.5), V: 245.3 * sinD(4.5) },
      startWith: ['S', 'a'],
      representation: { kind: 'none' },
    };
    const { w } = walk(slope);
    expect(w.steps.find((s) => s.id === 'H')!.substituted).toBe('H = 245.3 × cos(4°30′00″)');
    const back = walk(slope, { S: 245.3, H: 244.54 }).w;
    expect(back.steps.find((s) => s.id === 'a')!.result).toMatch(/^α = 4°3\d′\d\d″$/);
  });

  it('closes a polygon’s angles in seconds', () => {
    const closure: ModuleDef = {
      id: 'he.engineering.surveying#0~angle-closure',
      title: 'Angle misclosure',
      assumptions: ['The misclosure is spread equally.'],
      variables: [
        { id: 'n', symbol: 'n', name: 'Sides', min: 3, max: 20, integer: true },
        angleFormVariable('M', 'ΣM', 'Measured sum', 'dms', { min: 0, max: 3600 }),
        { ...angleFormVariable('R', 'ΣR', 'Required sum', 'dms', { max: 3600 }), derived: true },
        { ...angleFormVariable('e', 'e', 'Misclosure', 'dms'), derived: true },
        { ...angleFormVariable('c', 'c', 'Correction per angle', 'dms'), derived: true },
      ],
      relations: [
        {
          id: 'ΣR = (n − 2) × 180°',
          display: '{R} = ({n} − 2) × 180',
          vars: ['R', 'n'],
          residual: (v) => v.R! - (v.n! - 2) * 180,
          solve: { R: (v) => (v.n! - 2) * 180, n: () => undefined },
        },
        {
          id: 'e = ΣM − ΣR',
          display: '{e} = {M} − {R}',
          vars: ['e', 'M', 'R'],
          residual: (v) => v.e! - (v.M! - v.R!),
          solve: { e: (v) => v.M! - v.R! },
        },
        {
          id: 'c = −e ÷ n',
          display: '{c} = −{e} ÷ {n}',
          vars: ['c', 'e', 'n'],
          residual: (v) => v.c! + v.e! / v.n!,
          solve: { c: (v) => -v.e! / v.n! },
        },
      ],
      steps: {
        'ΣR = (n − 2) × 180°': { R: { expr: '({n} − 2) × 180', how: 'A polygon’s angle sum.' } },
        'e = ΣM − ΣR': { e: { expr: '{M} − {R}', how: 'What the angles miss by.' } },
        'c = −e ÷ n': { c: { expr: '−{e} ÷ {n}', how: 'Spread back over the angles.' } },
      },
      example: { n: 5, M: 540 + 25 / 3600, R: 540, e: 25 / 3600, c: -5 / 3600 },
      startWith: ['n', 'M'],
      representation: { kind: 'none' },
    };
    const { w } = walk(closure);
    expect(w.steps.find((s) => s.id === 'e')!.substituted).toBe('e = 540°00′25″ − 540°00′00″');
    expect(w.steps.find((s) => s.id === 'c')!.result).toBe('c = -0°00′05″');
  });
});

describe('angle units on a page', () => {
  it('converts an angle typed in degrees for a rule in radians, and back', () => {
    const arc: ModuleDef = {
      id: 'he.math.calc-2#5',
      title: 'Arc length',
      assumptions: ['θ in radians in the rule.'],
      variables: [
        len('r', 'r', 'Radius', { min: 0 }),
        angleVariable('t', 'θ', 'Angle', {
          unit: 'rad',
          min: 0,
          max: 7,
          units: ['rad', '°', 'grad'],
        }),
        len('s', 's', 'Arc length', { min: 0 }),
      ],
      relations: [
        {
          id: 's = rθ',
          display: '{s} = {r} × {t}',
          vars: ['s', 'r', 't'],
          residual: (v) => v.s! - v.r! * v.t!,
          solve: { s: (v) => v.r! * v.t!, t: (v) => v.s! / v.r!, r: (v) => v.s! / v.t! },
        },
      ],
      steps: {
        's = rθ': {
          s: { expr: '{r} × {t}', how: 'Radius times the angle in radians.' },
          t: { expr: '{s} ÷ {r}', how: 'Arc over radius.' },
        },
      },
      example: { r: 2, t: Math.PI / 4, s: Math.PI / 2 },
      startWith: ['r', 't'],
      representation: { kind: 'none' },
    };
    expect(unitChoices(arc.variables[1]!, 'metric', arc.variables)).toEqual(['°', 'rad', 'grad']);
    const { w } = walk(arc, undefined, { system: 'metric', units: { t: '°' } });
    expect(w.convertIn).toEqual(['θ = 45° = 0.7854 rad   (180° = π rad)']);
    const g = walk(arc, { r: 2, s: Math.PI / 2 }, { system: 'metric', units: { t: 'grad' } }).w;
    expect(g.convertOut).toEqual(['θ = 0.7854 rad = 50 grad   (π rad = 200 grad)']);
  });
});
