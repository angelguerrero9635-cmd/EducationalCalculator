import { holds, solve } from '@/engine/solve';
import { resolveItem } from '@/data/selectors';

import { MODULES } from '..';
import type { ModuleDef, Representation } from '../types';

/** Every variable id a representation refers to. */
function representationVars(r: Representation): string[] {
  switch (r.kind) {
    case 'numberLine':
      return [r.start, r.jump, r.end];
    case 'bars':
      return [...r.bars.map((b) => b.var), ...(r.total ? [r.total] : [])];
    case 'rectangle':
      return [r.length, r.width, ...(r.inside ? [r.inside] : [])];
    case 'grid100':
      return [r.percent, ...(r.caption ? [r.caption.part, r.caption.whole] : [])];
    case 'circle':
      return [r.radius, r.diameter, r.circumference, r.area].filter((v): v is string => !!v);
    case 'rightTriangle':
      return [r.a, r.b, r.c];
    case 'plot':
      return [r.x.var, r.y.var, ...r.params, ...(r.tangentSlope ? [r.tangentSlope] : [])];
    case 'table':
      return [r.sweep, r.output, ...r.params];
    case 'force':
      return [r.force, r.mass, r.acceleration];
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
