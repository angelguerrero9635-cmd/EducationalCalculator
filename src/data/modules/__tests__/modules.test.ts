import { holds, solve } from '@/engine/solve';
import { initialState, setValues } from '@/engine/state';
import { makeUnitContext } from '@/engine/unitContext';
import { getUnit } from '@/engine/units';
import { resolveItem } from '@/data/selectors';

import { getModule, moduleOwner, MODULES, TESTED_MODULES } from '..';
import { buildSteps } from '../buildSteps';
import type { ModuleDef, Representation } from '../types';

/** Every variable id a representation refers to. */
function representationVars(r: Representation): string[] {
  switch (r.kind) {
    case 'numberLine':
      return [r.start, r.jump, r.end];
    case 'tenFrame':
      return [r.first, r.second, r.total].filter((v): v is string => typeof v === 'string');
    case 'hundredChart':
      return [
        r.value,
        ...(r.marks ?? []),
        ...(r.tens ? [r.tens.count] : []),
        ...(r.multiplesOf ? [r.multiplesOf] : []),
      ];
    case 'compareRows':
      return [r.a, r.b, ...(r.difference ? [r.difference] : [])];
    case 'polygon':
      return [
        ...(r.sides ? [r.sides] : []),
        ...(r.corners ? [r.corners] : []),
        ...(r.sideValues ?? []),
        ...(r.around ? [r.around] : []),
      ];
    case 'balance':
      return [...r.left, ...r.right, ...(r.takeAway ? [r.takeAway] : [])];
    case 'baseTen':
      return [
        ...r.groups,
        ...(r.total ? [r.total] : []),
        ...(r.words ? [r.words] : []),
        ...r.controls.map((c) => c.var),
      ];
    case 'unitTiles':
      return [r.count, r.size, r.total].filter((v): v is string => typeof v === 'string');
    case 'clock':
      return [r.hour, r.minute];
    case 'partition':
      return [r.parts, r.shaded, ...(r.control ? [r.control] : [])];
    case 'skipCount':
      return [r.step, r.count, r.total, ...(r.start ? [r.start] : [])].filter(
        (v): v is string => typeof v === 'string',
      );
    case 'tape':
      return 'compare' in r
        ? [...r.compare, r.difference, ...(r.times ? [r.times] : [])]
        : [
            ...r.parts,
            ...(typeof r.total === 'string' ? [r.total] : []),
            ...(r.groups ? [r.groups] : []),
          ];
    case 'linePlot':
      return [...r.points.map((p) => p.var), ...(r.start ? [r.start] : [])];
    case 'pairs':
      return [r.value];
    case 'hops':
      return [
        r.start,
        ...r.hops.flatMap((x) => (typeof x.sign === 'string' ? [x.var, x.sign] : [x.var])),
        r.end,
      ];
    case 'numberBond':
      return [r.whole, ...r.parts].filter((v): v is string => typeof v === 'string');
    case 'patternBlocks':
      return [r.trapezoids, r.rhombuses, r.triangles];
    case 'lineUp':
      return [r.count, r.position, r.before, r.after];
    case 'equalGroups':
      return [r.groups, r.each, r.total];
    case 'prism':
      return [r.sides, r.faces, r.edges, r.corners];
    case 'solid':
      return [r.flat, r.curved];
    case 'dotSet':
      return [r.count];
    case 'tally':
      return [...r.rows, ...(r.total ? [r.total] : [])];
    case 'coinRow':
      return [r.value, r.count, r.total];
    case 'partnerList':
      return [r.total, r.ways];
    case 'array':
      return [
        r.rows,
        r.columns,
        r.total,
        ...(r.split
          ? [r.split.first, r.split.second, r.split.firstTotal, r.split.secondTotal]
          : []),
      ];
    case 'rounding':
      return [r.value, r.lower, r.upper, r.rounded, ...(typeof r.to === 'string' ? [r.to] : [])];
    case 'fractionLine':
      return [
        r.numerator,
        r.denominator,
        ...(r.parts ?? []),
        ...(r.copies ? [r.copies] : []),
        ...(r.second ? [r.second.numerator, r.second.denominator] : []),
      ];
    case 'fractionBars':
      return [...r.rows.flatMap((x) => [x.num, x.den]), ...r.controls];
    case 'timeline':
      return [r.startHour, r.startMinute, r.minutes, r.endHour, r.endMinute];
    case 'scale':
      return [
        ...(r.items ?? []),
        ...(r.count ? [r.count] : []),
        ...(r.each ? [r.each] : []),
        r.total,
      ];
    case 'beaker':
      return [...r.parts, r.total];
    case 'quadrilateral':
      return [r.first, r.second, r.rightAngles];
    case 'rectilinear':
      return [
        ...[r.left, r.right, r.cut].flatMap((p) => (p ? [p.width, p.height, p.area] : [])),
        r.total,
      ];
    case 'areaModel':
      if ('factors' in r) return [...r.factors, r.total];
      if ('divide' in r) {
        const d = r.divide;
        return [d.dividend, d.divisor, d.quotient, ...(d.remainder ? [d.remainder] : [])];
      }
      return [...r.top, ...r.side, ...r.parts.flat(), r.total];
    case 'angles':
      return [...r.parts, r.whole, ...(r.sliders ?? [])];
    case 'doubleNumberLine':
      return [r.top, r.bottom, r.per];
    case 'coordinatePlane':
      return [
        r.x,
        r.y,
        ...(r.second ? [r.second.x, r.second.y] : []),
        ...(r.slope ? [r.slope] : []),
        ...(r.trail
          ? [r.trail.across, r.trail.up].filter((v): v is string => typeof v === 'string')
          : []),
      ];
    case 'boxPlot':
      return [r.min, r.q1, r.median, r.q3, r.max];
    case 'pieChart':
      return [...r.parts, ...(r.total ? [r.total] : [])];
    case 'fractionArea':
      return [
        r.first.num,
        r.first.den,
        r.second.num,
        r.second.den,
        ...(r.product ? [r.product.num, r.product.den] : []),
      ];
    case 'unitCubes':
      return [
        r.length,
        r.width,
        r.height,
        r.volume,
        ...(r.second ? [r.second.length, r.second.width, r.second.height, r.second.volume] : []),
        ...(r.total ? [r.total] : []),
      ];
    case 'placeValueChart':
      return [r.value, ...[r.highlight, r.from, r.compare].filter((v): v is string => !!v)];
    case 'factorPairs':
      return [r.value, ...[r.first, r.second, r.count].filter((v): v is string => !!v)];
    case 'shareWholes':
      return [r.wholes, r.people, ...(r.each ? [r.each] : [])];
    case 'factorTree':
      return [r.value, ...(r.count ? [r.count] : [])];
    case 'protractor':
      return [r.angle, ...(r.other ? [r.other] : [])];
    case 'wave':
      return [
        ...(r.amplitude ? [r.amplitude] : []),
        ...(typeof r.extent === 'string' ? [r.extent] : []),
        r.wavelength,
        ...(r.frequency ? [r.frequency] : []),
      ];
    case 'punnettSquare':
      return [r.first, r.second, r.dominant, ...(r.recessive ? [r.recessive] : [])];
    case 'ruler':
      return [
        ...r.lengths,
        ...[r.difference, r.from, r.to].filter((v): v is string => typeof v === 'string'),
      ];
    case 'coins':
      return [...r.coins.map((c) => c.var), r.total];
    case 'cubeTrains':
      return [...r.rows.flat(2), r.total];
    case 'bars':
      return [
        ...r.bars.map((b) => b.var),
        ...(r.total ? [r.total] : []),
        ...(typeof r.scale === 'string' ? [r.scale] : []),
      ];
    case 'pictureGraph':
      return [
        ...r.columns.map((b) => b.var),
        ...(r.total ? [r.total] : []),
        ...(r.key ? [r.key] : []),
      ];
    case 'waterfall':
      return [...r.items.map((b) => b.var), r.total, ...(r.caption ?? [])];
    case 'rectangle':
      return [r.length, r.width, ...(r.inside ? [r.inside] : []), ...(r.around ? [r.around] : [])];
    case 'grid100':
      return [
        r.percent,
        ...(r.caption ? [r.caption.part, r.caption.whole] : []),
        ...(r.second ? [r.second] : []),
        ...(r.wholes ? [r.wholes] : []),
      ];
    case 'circle':
      return [r.radius, r.diameter, r.circumference, r.area].filter((v): v is string => !!v);
    case 'rightTriangle':
      return [r.a, r.b, r.c];
    case 'plot':
      return [
        r.x.var,
        r.y.var,
        ...r.params,
        ...[r.tangentSlope, r.slopeTriangle, r.intercept].filter((v): v is string => !!v),
      ];
    case 'table':
      return [r.sweep, r.output, ...r.params];
    case 'thermometers':
      return [...r.items, ...(r.difference ? [r.difference] : [])];
    case 'rockLayers':
      return [...r.fossils, r.difference];
    case 'pushes':
      return [r.right, r.left, r.extra];
    case 'force':
      return [r.force, r.mass, r.acceleration];
    case 'seriesCircuit':
      return [r.source, r.current, ...r.resistors.flatMap((x) => [x.r, x.v])];
  }
}

function subsets<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [first, ...rest] = items as [T, ...T[]];
  return [...subsets(rest, k - 1).map((s) => [first, ...s]), ...subsets(rest, k)];
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * (1 + Math.abs(b));

describe.each(TESTED_MODULES.map((m) => [m.id, m] as [string, ModuleDef]))('module %s', (_, m) => {
  const ids = m.variables.map((v) => v.id);

  // The picture gallery's demonstrations (g.*) have no skill and carry their own title.
  const gallery = m.id.startsWith('g.');

  it('belongs to a skill or course topic in the taxonomy', () => {
    if (gallery) return;
    expect(resolveItem(moduleOwner(m.id))).toBeDefined();
    // Extra modules for a skill need a title for the switcher.
    if (m.id.includes('~')) expect(m.title).toBeTruthy();
  });

  it('labels only its own values under the picture', () => {
    const ids = new Set(m.variables.map((v) => v.id));
    for (const id of m.pictureLabels ?? []) expect([id, ids.has(id)]).toEqual([id, true]);
  });

  it('says what it is for, when it is a problem type', () => {
    if (m.id.includes('~'))
      expect([m.id, (m.use ?? '').startsWith('Use this')]).toEqual([m.id, true]);
  });

  it('has a title only when it is a problem type (main lessons use the skill title)', () => {
    if (gallery) return;
    expect(m.id.includes('~') ? !!m.title : m.title === undefined).toBe(true);
  });

  it('has assumptions, unique variables and relations over declared variables', () => {
    expect(m.assumptions.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(m.relations.length).toBeGreaterThan(0);
    for (const r of m.relations) {
      expect(r.vars.filter((v) => !ids.includes(v))).toEqual([]);
      const inTemplate = [...r.display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
      expect([...new Set(inTemplate)].sort()).toEqual([...r.vars, ...(r.shows ?? [])].sort());
      expect((r.shows ?? []).filter((v) => !ids.includes(v) || r.vars.includes(v))).toEqual([]);
    }
    expect(representationVars(m.representation).filter((v) => !ids.includes(v))).toEqual([]);
  });

  it('draws a hundred chart big enough for every mark on it', () => {
    const r = m.representation;
    if (r.kind !== 'hundredChart') return;
    const vmax = (id: string) => m.variables.find((v) => v.id === id)?.max ?? 0;
    for (const id of [r.value, ...(r.marks ?? [])]) {
      expect([id, vmax(id) <= r.max]).toEqual([id, true]);
    }
  });

  it('uses a directional difference for a rise, a loss or how much farther (not "apart")', () => {
    // "apart" has no direction: a rise from 120 to 50 would come out as 70. Use `minus`.
    const directional = /\b(rise|lost|loss|worn|escaped|gain|farther|dropped)\b/i;
    const wrong = m.relations
      .filter((r) => r.id.endsWith(' apart'))
      .map((r) => m.variables.find((v) => v.id === r.vars[0]))
      .filter((v) => v && directional.test(v.name))
      .map((v) => v!.name);
    expect(wrong).toEqual([]);
  });

  it('connects every value through the formulas (else it is two lessons: split it)', () => {
    const free = new Set(m.standalone?.vars ?? []);
    if (m.standalone) expect(m.standalone.why.length).toBeGreaterThan(10);
    const parent = new Map(ids.map((id) => [id, id]));
    const find = (x: string): string => (parent.get(x) === x ? x : find(parent.get(x)!));
    for (const r of m.relations) {
      for (const v of r.vars.slice(1)) parent.set(find(v), find(r.vars[0]!));
    }
    const groups = new Set(ids.filter((id) => !free.has(id)).map(find));
    expect([...groups].map((g) => ids.filter((id) => find(id) === g))).toHaveLength(1);
  });

  it('has a worked example that satisfies every relation and range', () => {
    expect(Object.keys(m.example).sort()).toEqual([...ids].sort());
    for (const r of m.relations) expect(holds(r, m.example)).toBe(true);
    const result = solve(
      m,
      m.variables.map((v) => ({ id: v.id, value: m.example[v.id]! })),
    );
    expect(result.rejected).toBeUndefined();
    expect(result.dropped.length + result.given.length).toBe(ids.length);
  });

  it('has no zero example values for variables with units (keeps the unit check meaningful)', () => {
    // The "formulas hold in these units" check uses the example; a 0 would pass any unit.
    for (const v of m.variables) {
      if (getUnit(v.unit)) expect([v.id, m.example[v.id]]).not.toEqual([v.id, 0]);
    }
  });

  it('rearrangements agree with the relation', () => {
    for (const r of m.relations) {
      for (const [id, fn] of Object.entries(r.solve ?? {})) {
        // `() => undefined` marks a value the relation can't determine (e.g. n from its tens).
        if (fn!.length === 0) continue;
        const others = { ...m.example };
        delete others[id];
        const out = fn!(others);
        const candidates = out === undefined ? [] : Array.isArray(out) ? out : [out];
        expect(candidates.some((x) => close(x, m.example[id]!))).toBe(true);
      }
    }
  });

  it('opens with the example filled in from `startWith`', () => {
    const result = solve(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );
    expect(result.unknown).toEqual([]);
    for (const id of ids) expect(close(result.values[id]!, m.example[id]!)).toBe(true);
  });

  it('any combination of inputs gives values consistent with the example', () => {
    const typable = ids.filter((id) => !m.variables.find((v) => v.id === id)?.derived);
    for (const combo of subsets(typable, m.startWith.length)) {
      const result = solve(
        m,
        combo.map((id) => ({ id, value: m.example[id]! })),
        m.example,
      );
      expect(result.rejected).toBeUndefined();
      for (const [id, x] of Object.entries(result.values)) {
        expect([id, close(x, m.example[id]!)]).toEqual([id, true]);
      }
    }
  });
});

it('module ids are unique', () => {
  expect(new Set(MODULES.map((m) => m.id)).size).toBe(MODULES.length);
});

describe.each(TESTED_MODULES.map((m) => [m.id, m] as [string, ModuleDef]))(
  'steps for %s',
  (_, m) => {
    it('explain every rearrangement, using only that relation’s variables', () => {
      expect(Object.keys(m.steps).sort()).toEqual(m.relations.map((r) => r.id).sort());
      for (const r of m.relations) {
        const texts = m.steps[r.id]!;
        const solvable = Object.entries(r.solve ?? {}).filter(([, fn]) => fn!.length > 0);
        expect(Object.keys(texts).sort()).toEqual(solvable.map(([id]) => id).sort());
        for (const text of Object.values(texts)) {
          const how = typeof text.how === 'function' ? text.how(m.example) : text.how;
          const expr = typeof text.expr === 'function' ? text.expr(m.example) : text.expr;
          expect(how.length).toBeGreaterThan(10);
          const used = [...expr.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!);
          expect(used.filter((id) => !r.vars.includes(id))).toEqual([]);
        }
      }
    });

    it('walk from the opening values to every other value, and the check balances', () => {
      const result = solve(
        m,
        m.startWith.map((id) => ({ id, value: m.example[id]! })),
      );
      const w = buildSteps(m, result);
      expect(w.given.map((q) => q.id)).toEqual(m.startWith);
      expect([...w.steps.map((s) => s.id), ...m.startWith].sort()).toEqual(
        m.variables.map((v) => v.id).sort(),
      );
      for (const s of w.steps) {
        expect(s.rearranged).toBeDefined();
        expect(s.substituted ?? '').not.toContain('?');
      }
      expect(w.missing).toEqual([]);
      expect(w.check.length).toBe(m.relations.length);
      expect(w.check.every((c) => c.ok)).toBe(true);
    });
  },
);

it('writes the number sentence with ? for the number found (K–2 steps)', () => {
  const m = MODULES.find((x) => x.id === 'm.K.add-sub-10')!;
  const w = buildSteps(
    m,
    solve(m, [
      { id: 'b', value: 4 },
      { id: 'c', value: 7 },
    ]),
  );
  expect(w.steps[0]!.sentence).toMatch(/\?/);
  expect(w.steps[0]!.sentence).toContain('4');
  expect(w.steps[0]!.sentence).toContain('7');
  // K–2: names, never letters, in what the student reads.
  expect(w.band).toBe('early');
  expect(w.steps[0]!.lead).toEqual({ sentence: w.steps[0]!.sentence });
  expect(w.steps[0]!.heading).toBe('Find first group');
  expect(w.steps[0]!.answer).toBe('First group: 3');
  expect(w.given.map((q) => q.label)).toEqual(['Second group: 4', 'In all: 7']);
});

it('builds readable steps (area example)', () => {
  const m = MODULES.find((x) => x.id === 'm.3.area')!;
  const w = buildSteps(
    m,
    solve(m, [
      { id: 'A', value: 12 },
      { id: 'l', value: 4 },
    ]),
  );
  expect(w.given.map((q) => `${q.symbol} = ${q.value}`)).toEqual(['A = 12 cm²', 'l = 4 cm']);
  expect(w.steps).toEqual([
    {
      id: 'w',
      title: 'Find width (w)',
      formula: 'l × w = A',
      sentence: '4 × ? = 12',
      how: 'Each row has as many squares as the length. Divide to find how many rows.',
      rearranged: 'w = A ÷ l',
      substituted: 'w = 12 ÷ 4',
      work: ['Think: 4 × ? = 12', 'Count by 4s to 12: 4, 8, 12 → 3'],
      result: 'w = 3 cm',
      // Grade 3: the number sentence first, then the rule in words; no letters before Grade 6.
      heading: 'Find width',
      lead: { sentence: '4 × ? = 12', formula: 'Length × width = area' },
      lines: ['Width = 12 ÷ 4', 'Think: 4 × ? = 12', 'Count by 4s to 12: 4, 8, 12 → 3'],
      writtenAfter: 1,
      answer: 'Width = 3 cm',
    },
  ]);
  expect(w.given.map((q) => q.label)).toEqual(['Area: 12 cm²', 'Length: 4 cm']);
  expect(w.check).toEqual([{ formula: '4 × 3 = 12', ok: true }]);
});

describe('written work and simplifying, by grade', () => {
  const byId = (id: string) => MODULES.find((m) => m.id === id)!;
  const steps = (id: string, given: Record<string, number>) => {
    const m = byId(id);
    return buildSteps(
      m,
      solve(
        m,
        Object.entries(given).map(([k, value]) => ({ id: k, value })),
      ),
    ).steps;
  };

  it('Grade 2: the column sum sits under the question, the jumps stay', () => {
    const [s] = steps('m.2.add-sub-100-fluency', { a: 38, b: 25 });
    expect(s!.written?.says).toBe('38 + 25 = 63');
    // "38 + 25" under "38 + 25 = ?" only echoed the question.
    expect(s!.lines).toEqual(['38 + 20 = 58', '58 + 2 = 60', '60 + 3 = 63']);
    expect(s!.writtenAfter).toBe(0);
  });

  it('Grade 4: the long-division bracket, partial products, and no running totals', () => {
    const [q, m, r] = steps('m.4.long-division', { n: 743, d: 6 });
    expect(q!.written?.says).toBe('743 ÷ 6 = 123 remainder 5');
    expect(q!.written?.rows[0]!.map((c) => c.text)).toEqual(['', '', '1', '2', '3']);
    expect(m!.written?.says).toBe('123 × 6 = 738');
    // A difference under 10 is counted up, not set out in columns.
    expect(r!.written).toBeUndefined();
    const [n] = steps('m.4.multi-digit-multiply~three-digit', { a: 234, b: 6 }).slice(-1);
    expect(n!.written?.says).toBe('1200 + 180 + 24 = 1404');
    // The sentence "1,200 + 180 + 24 = ?" already says it: no echo line under it.
    expect(n!.lines).toEqual([]);
  });

  it('Grade 8 and college: one stage per line under the formula, no grids', () => {
    const [c] = steps('m.8.pythagorean', { a: 3, b: 4 });
    expect(c!.written).toBeUndefined();
    expect(c!.lines).toEqual(['c = √(a² + b²)', 'c = √(3² + 4²)', 'c = √(9 + 16)', 'c = √25']);
  });

  it('a step with its own work lines is left alone; a module can refuse a grid', () => {
    const [L] = steps('m.2.money~change', { T: 100, P: 65 });
    expect(L!.written).toBeUndefined();
    const [w] = steps('m.3.area', { A: 12, l: 4 });
    expect(w!.lines.some((l) => l.startsWith('w = 3'))).toBe(false);
  });
});

it('lists what is still missing', () => {
  const m = MODULES.find((x) => x.id === 'm.3.area')!;
  const w = buildSteps(m, solve(m, [{ id: 'l', value: 4 }]));
  expect(w.steps).toEqual([]);
  expect(w.missing.map((q) => q.symbol)).toEqual(['w', 'A']);
});

describe('regressions found in review', () => {
  const byId = (id: string) => MODULES.find((m) => m.id === id)!;
  const open = (m: ModuleDef) =>
    initialState(
      m,
      m.startWith.map((id) => ({ id, value: m.example[id]! })),
    );

  it('population: typing RNI recalculates the population instead of clearing it', () => {
    const m = byId('he.geography.human-geography#0');
    const s = setValues(m, open(m), { RNI: 1 });
    expect(s.errors).toEqual({});
    expect(s.result.values.Pop).toBeCloseTo(200000);
    expect(s.result.values.CBR).toBeCloseTo(30);
    expect(s.result.values.CDR).toBeCloseTo(20);
  });

  it('population: a tiny growth rate gives a long doubling time without clearing inputs', () => {
    const m = byId('he.geography.human-geography#0');
    const s = setValues(m, open(m), { D: 4000, B: 4001 });
    expect(s.result.cleared).toEqual([]);
    expect(s.result.values.Td).toBeCloseTo(350000);
  });

  it('derivatives: impossible slopes and values are reported, not silently accepted', () => {
    const m = byId('he.math.calc-1#1');
    // n = 1 makes f′ = c everywhere, so typing f′ = 5 must change c.
    let s = setValues(m, open(m), { n: 1 });
    s = setValues(m, s, { m: 5 });
    expect(s.result.values.c).toBeCloseTo(5);
    // n = 0 makes f = c everywhere, so typing f(x) = 4 must change c.
    s = setValues(m, open(m), { n: 0 });
    s = setValues(m, s, { y: 4 });
    expect(s.result.values.c).toBeCloseTo(4);
  });
});

describe('Math K–2', () => {
  it('a difference is never negative, and the steps subtract the smaller from the larger', () => {
    const m = getModule('m.K.compare-10')!;
    const result = solve(m, [
      { id: 'a', value: 4 },
      { id: 'b', value: 7 },
    ]);
    expect(result.values.d).toBe(3);
    const step = buildSteps(m, result).steps.find((s) => s.id === 'd')!;
    expect(step.substituted).toBe('d = 7 − 4');
  });

  it('a digit alone leaves the number unknown instead of guessing', () => {
    const m = getModule('m.1.tens-ones')!;
    const result = solve(m, [{ id: 't', value: 6 }]);
    expect(result.values.n).toBeUndefined();
  });
});

it('the check uses the same units and numbers as the steps (lengths in inches)', () => {
  const m = getModule('m.2.standard-length')!;
  const ctx = makeUnitContext(m, { system: 'us' });
  const result = solve(
    ctx.system,
    m.startWith.map((id) => ({ id, value: ctx.fromDisplay(id, m.example[id]!) })),
  );
  const w = buildSteps(m, result, ctx);
  expect(w.steps.map((s) => s.result)).toEqual(['d = 4 in']);
  expect(w.check.map((c) => c.formula)).toEqual(['12 − 8 = 4']);
});
