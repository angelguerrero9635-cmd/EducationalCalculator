import { TESTED_MODULES } from '@/data/modules';
import { buildSteps } from '@/data/modules/buildSteps';
import type { ModuleDef } from '@/data/modules/types';

import { solve } from '../solve';
import type { Relation, VariableDef } from '../types';
import { makeUnitContext, unitOptions } from '../unitContext';
import { UNIT_SETS, unitInSet, unitSetFor, unitSetProblems } from '../unitSets';
import { getUnit } from '../units';

const stress: Relation = {
  id: 'stress',
  display: 'σ = F ÷ A',
  vars: ['s', 'F', 'A'],
  residual: (v) => v.s! * v.A! - v.F!,
  solve: { s: (v) => v.F! / v.A!, F: (v) => v.s! * v.A!, A: (v) => v.F! / v.s! },
};

const vars = (units: [string, string, string]): VariableDef[] => [
  { id: 'F', symbol: 'F', name: 'Axial force', unit: units[0], min: 0 },
  { id: 'A', symbol: 'A', name: 'Area', unit: units[1], min: 0 },
  { id: 's', symbol: 'σ', name: 'Normal stress', unit: units[2] },
];

const page = (unitSet: ModuleDef['unitSet'], units: [string, string, string]) => ({
  id: 'he.engineering.mechanics-of-materials#0',
  relations: [stress],
  variables: vars(units),
  example: { F: 50000, A: 314.2, s: 50000 / 314.2 },
  unitSet,
});

describe('formula unit sets (HE-E26)', () => {
  it('gives one unit per dimension in every set', () => {
    for (const s of Object.values(UNIT_SETS)) {
      const dims = s.units.map((id) => getUnit(id)?.dimension);
      expect(dims.every(Boolean)).toBe(true);
      expect(new Set(dims).size).toBe(dims.length);
    }
  });

  it('finds a value’s unit in a set, with squares and fourth powers of its length', () => {
    const set = UNIT_SETS['N-mm-MPa']!;
    expect(unitInSet(set, { unit: 'm²' })).toBe('mm²');
    expect(unitInSet(set, { unit: 'in⁴' })).toBe('mm⁴');
    expect(unitInSet(set, { unit: 'kN·m' })).toBe('N·mm');
    expect(unitInSet(set, { unit: 'kg' })).toBeUndefined();
    // A temperature difference reads the set's K as a difference.
    const thermo = UNIT_SETS['kJ-kg-K']!;
    expect(unitInSet(thermo, { unit: '°C', difference: true })).toBe('K');
    expect(unitInSet(UNIT_SETS['Btu-lb-R']!, { unit: 'K', difference: true })).toBe('R');
  });

  it('works a US page in kip–in–ksi directly, with no conversion lines', () => {
    const p = page({ metric: 'N-mm-MPa', us: 'kip-in-ksi' }, ['N', 'mm²', 'MPa']);
    expect(unitSetProblems(p)).toEqual([]);
    expect(unitSetFor(p.unitSet, 'us')?.name).toBe('kip–in–ksi');
    expect(unitSetFor(p.unitSet, 'mixed')).toBeUndefined();
    expect(unitOptions(p.variables, undefined, p.unitSet).systems).toEqual(['metric', 'us']);
    const us = makeUnitContext(p, { system: 'us' });
    expect(us.display).toEqual({ F: 'kip', A: 'in²', s: 'ksi' });
    expect(us.coherent).toBe(true);
    const r = solve(us.system, [
      { id: 'F', value: us.fromDisplay('F', 11.24) },
      { id: 'A', value: us.fromDisplay('A', 0.487) },
    ]);
    expect(us.toDisplay('s', r.values.s!)).toBeCloseTo(11.24 / 0.487, 6);
    const w = buildSteps({ ...p, title: 'Stress', steps: {} } as unknown as ModuleDef, r, us);
    expect(w.convertIn).toEqual([]);
    expect(w.given.map((g) => g.value)).toEqual(['11.24 kip', '0.487 in²']);
  });

  it('converts inputs typed in other units into the set first', () => {
    const p = page('N-mm-MPa', ['N', 'mm²', 'MPa']);
    const ctx = makeUnitContext(p, { system: 'metric', units: { F: 'kN' } });
    expect(ctx.display).toEqual({ F: 'kN', A: 'mm²', s: 'MPa' });
    expect(ctx.coherent).toBe(false);
    expect(ctx.fromDisplay('F', 50)).toBeCloseTo(50000);
    // With no US set, US customary shows lbf, in² and ksi and converts into the set.
    expect(unitOptions(p.variables, undefined, p.unitSet).systems).toEqual(['metric', 'us']);
    expect(makeUnitContext(p, { system: 'us' }).coherent).toBe(false);
  });

  it('reports a value not written in its set, and a set the relations don’t hold in', () => {
    expect(unitSetProblems(page('N-mm-MPa', ['N', 'mm²', 'Pa']))).toEqual([
      'he.engineering.mechanics-of-materials#0: values not written in N–mm–MPa: s in Pa (the set has MPa)',
      'he.engineering.mechanics-of-materials#0: the relations don’t hold in N–mm–MPa (stress)',
    ]);
    expect(unitSetProblems(page('N–mm–MPa', ['N', 'mm²', 'MPa']))[0]).toBe(
      'he.engineering.mechanics-of-materials#0: no unit set "N–mm–MPa"',
    );
  });

  it('holds every page that names a set to it', () => {
    const problems = TESTED_MODULES.filter((m) => m.unitSet).flatMap(unitSetProblems);
    expect(problems).toEqual([]);
  });
});
