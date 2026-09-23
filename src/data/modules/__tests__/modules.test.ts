import { holds, solve } from '@/engine/solve';
import { initialState, setValues } from '@/engine/state';
import { resolveItem } from '@/data/selectors';

import { MODULES } from '..';
import { buildSteps } from '../buildSteps';
import type { ModuleDef, Representation } from '../types';

/** Every variable id a representation refers to. */
function representationVars(r: Representation): string[] {
  switch (r.kind) {
    case 'numberLine':
      return [r.start, r.jump, r.end];
    case 'tenFrame':
      return [r.first, r.second, r.total];
    case 'bars':
      return [...r.bars.map((b) => b.var), ...(r.total ? [r.total] : [])];
    case 'pictureGraph':
      return [...r.columns.map((b) => b.var), ...(r.total ? [r.total] : [])];
    case 'waterfall':
      return [...r.items.map((b) => b.var), r.total, ...(r.caption ?? [])];
    case 'rectangle':
      return [r.length, r.width, ...(r.inside ? [r.inside] : [])];
    case 'grid100':
      return [r.percent, ...(r.caption ? [r.caption.part, r.caption.whole] : [])];
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

describe.each(MODULES.map((m) => [m.id, m] as [string, ModuleDef]))('module %s', (_, m) => {
  const ids = m.variables.map((v) => v.id);

  it('belongs to a skill or course topic in the taxonomy', () => {
    expect(resolveItem(m.id)).toBeDefined();
  });

  it('has assumptions, unique variables and relations over declared variables', () => {
    expect(m.assumptions.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(m.relations.length).toBeGreaterThan(0);
    for (const r of m.relations) {
      expect(r.vars.filter((v) => !ids.includes(v))).toEqual([]);
      const inTemplate = [...r.display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
      expect([...new Set(inTemplate)].sort()).toEqual([...r.vars].sort());
    }
    expect(representationVars(m.representation).filter((v) => !ids.includes(v))).toEqual([]);
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

  it('rearrangements agree with the relation', () => {
    for (const r of m.relations) {
      for (const [id, fn] of Object.entries(r.solve ?? {})) {
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
    for (const combo of subsets(ids, m.startWith.length)) {
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

describe.each(MODULES.map((m) => [m.id, m] as [string, ModuleDef]))('steps for %s', (_, m) => {
  it('explain every rearrangement, using only that relation’s variables', () => {
    expect(Object.keys(m.steps).sort()).toEqual(m.relations.map((r) => r.id).sort());
    for (const r of m.relations) {
      const texts = m.steps[r.id]!;
      expect(Object.keys(texts).sort()).toEqual(Object.keys(r.solve ?? {}).sort());
      for (const { expr, how } of Object.values(texts)) {
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
      expect(s.substituted).not.toContain('?');
    }
    expect(w.missing).toEqual([]);
    expect(w.check.length).toBe(m.relations.length);
    expect(w.check.every((c) => c.ok)).toBe(true);
  });
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
      formula: 'A = l × w',
      how: 'Each row has l squares. Divide to find how many rows.',
      rearranged: 'w = A ÷ l',
      substituted: 'w = 12 ÷ 4',
      result: 'w = 3 cm',
    },
  ]);
  expect(w.check).toEqual([{ formula: '12 = 4 × 3', ok: true }]);
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
