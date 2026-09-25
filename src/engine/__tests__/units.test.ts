import { MODULES } from '@/data/modules';
import { buildSteps } from '@/data/modules/buildSteps';

import { solve } from '../solve';
import { changeUnits, initialState, setValues } from '../state';
import { linkedUnits, makeUnitContext, unitChoices, unitOptions } from '../unitContext';
import { UNITS, convert, getUnit, unitInSystem } from '../units';

const close = (a: number, b: number, rel = 1e-9) => Math.abs(a - b) <= rel * Math.abs(b);

describe('unit conversions (exact definitions)', () => {
  it.each([
    [1, 'in', 'cm', 2.54],
    [1, 'ft', 'in', 12],
    [1, 'yd', 'ft', 3],
    [1, 'mi', 'ft', 5280],
    [1, 'lb', 'kg', 0.45359237],
    [1, 'lb', 'oz', 16],
    [1, 'ton', 'lb', 2000],
    [1, 'lbf', 'N', 4.4482216152605],
    [1, 'gal', 'in³', 231],
    [1, 'gal', 'fl oz', 128],
    [1, 'mL', 'cm³', 1],
    [60, 'mph', 'ft/s', 88],
    [1, 'hp', 'W', 745.6998715822702],
    [1, 'g/cm³', 'kg/m³', 1000],
    [1, 'g/cm³', 'lb/ft³', 62.42796057614462],
    [1, 'ft²', 'in²', 144],
    [1, 'm²', 'cm²', 10000],
    [1, 'km/h', 'm/s', 1 / 3.6],
    [1, 'kΩ', 'Ω', 1000],
    [250, 'mA', 'A', 0.25],
  ])('%p %s = %p %s', (x, from, to, expected) => {
    expect(close(convert(x, from, to), expected)).toBe(true);
    expect(close(convert(expected, to, from), x)).toBe(true);
  });

  it('refuses to convert between dimensions', () => {
    expect(() => convert(1, 'cm', 'kg')).toThrow();
  });

  it('every metric unit’s US counterpart has the same dimension', () => {
    for (const u of UNITS) {
      if (u.us) expect(getUnit(u.us)?.dimension).toBe(u.dimension);
    }
    expect(unitInSystem('cm', 'us')).toBe('in');
    expect(unitInSystem('V', 'us')).toBe('V');
    // Each US unit maps back to its natural metric unit.
    expect(unitInSystem('in', 'metric')).toBe('cm');
    expect(unitInSystem('oz', 'metric')).toBe('g');
    expect(unitInSystem('lb/ft³', 'metric')).toBe('kg/m³');
    for (const u of UNITS) {
      if (u.metric) expect(getUnit(u.metric)?.dimension).toBe(u.dimension);
    }
  });

  it('module content only uses registered units or fixed labels', () => {
    const fixed = [
      '%',
      'per 1,000',
      'years',
      'cubes',
      'square units',
      '°F',
      'days',
      'hours',
      'cups',
      'feet',
      'inches',
      'meters',
      'centimeters',
      '¢',
      '$',
    ];
    for (const m of MODULES) {
      for (const v of m.variables) {
        if (v.unit)
          expect([v.unit, !!getUnit(v.unit) || fixed.includes(v.unit)]).toEqual([v.unit, true]);
      }
    }
  });
});

const mod = (id: string) => MODULES.find((m) => m.id === id)!;

describe('unit context', () => {
  it('offers US customary only where it differs, and Mixed where both systems have units', () => {
    // Whole-number lesson: Metric or US, no Mixed, and length/area units change together.
    expect(unitOptions(mod('m.3.area').variables)).toEqual({
      systems: ['metric', 'us'],
      metricUnits: true,
      mixed: false,
      linked: true,
    });
    // Middle-school science is metric-only (Mixed still offered).
    const density = mod('s.6.density');
    expect(unitOptions(density.variables, density.unitSystems)).toEqual({
      systems: ['metric'],
      metricUnits: true,
      mixed: true,
      linked: false,
    });
    // Electrical units are shared, so there is no US system and Mixed would add nothing.
    expect(unitOptions(mod('he.engineering.circuits-1#0').variables)).toEqual({
      systems: ['metric'],
      metricUnits: false,
      mixed: false,
      linked: false,
    });
    expect(unitOptions(mod('m.8.linear-functions').variables)).toEqual({
      systems: [],
      metricUnits: false,
      mixed: false,
      linked: false,
    });
  });

  it('lets each value pick a unit within the chosen system', () => {
    const d = mod('he.physics.university-1#0').variables.find((v) => v.id === 'd')!;
    expect(unitChoices(d, 'metric')).toEqual(['mm', 'cm', 'm', 'km']);
    expect(unitChoices(d, 'us')).toEqual(['in', 'ft', 'yd', 'mi']);
    expect(unitChoices(d, 'mixed')).toEqual(['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi']);
    const k = mod('he.physics.university-1#0');
    const ctx = makeUnitContext(k, { system: 'metric', units: { d: 'km' } });
    expect(ctx.display.d).toBe('km');
    expect(ctx.toDisplay('d', 36)).toBeCloseTo(0.036);
    // d in km with v in m/s: the formulas need converting.
    expect(ctx.coherent).toBe(false);
    // A unit from the other system is ignored (falls back to the system default).
    expect(makeUnitContext(k, { system: 'metric', units: { d: 'mi' } }).display.d).toBe('m');
  });

  it('links length, area and volume units in whole-number lessons', () => {
    const area = mod('m.3.area');
    expect(linkedUnits(area.variables, 'l', 'm')).toEqual({ l: 'm', w: 'm', A: 'm²' });
    expect(linkedUnits(area.variables, 'A', 'ft²')).toEqual({ l: 'ft', w: 'ft', A: 'ft²' });
    // Not a lesson: only the chosen value changes.
    const k = mod('he.physics.university-1#0');
    expect(linkedUnits(k.variables, 'd', 'km')).toEqual({ d: 'km' });
    // 4 cm × 3 cm → 4 m × 3 m = 12 m², worked directly in meters.
    const metric = makeUnitContext(area, { system: 'metric' });
    const meters = makeUnitContext(area, { system: 'metric', units: { l: 'm', w: 'm', A: 'm²' } });
    expect(meters.coherent).toBe(true);
    const s = changeUnits(
      meters.system,
      initialState(metric.system, [
        { id: 'l', value: 4 },
        { id: 'w', value: 3 },
      ]),
      metric.system,
    );
    expect(meters.toDisplay('A', s.result.values.A!)).toBeCloseTo(12);
  });

  it('knows when formulas hold directly in the chosen units', () => {
    expect(makeUnitContext(mod('m.3.area'), { system: 'us' }).coherent).toBe(true);
    expect(makeUnitContext(mod('he.physics.university-1#0'), { system: 'us' }).coherent).toBe(true);
    // F = m × a does not hold with lb, ft/s² and lbf.
    expect(makeUnitContext(mod('s.8.newtons-laws'), { system: 'us' }).coherent).toBe(false);
    // Mixed feet and inches for one rectangle: A = l × w needs converting.
    expect(
      makeUnitContext(mod('m.3.area'), { system: 'mixed', units: { l: 'ft', w: 'in', A: 'in²' } })
        .coherent,
    ).toBe(false);
  });

  it('applies ranges and whole-number rules to the shown number', () => {
    const ctx = makeUnitContext(mod('m.3.area'), { system: 'us' });
    const r = solve(ctx.system, [{ id: 'l', value: ctx.fromDisplay('l', 11) }]);
    expect(r.rejected?.reason).toBe('Must be at most 10 in');
    const ok = solve(ctx.system, [
      { id: 'l', value: ctx.fromDisplay('l', 4) },
      { id: 'w', value: ctx.fromDisplay('w', 3) },
    ]);
    expect(ctx.toDisplay('A', ok.values.A!)).toBeCloseTo(12);
  });

  it('switching units keeps physical values, and whole-number lesson values keep their number', () => {
    const m = mod('m.3.area');
    const metric = makeUnitContext(m, { system: 'metric' });
    const us = makeUnitContext(m, { system: 'us' });
    let s = initialState(metric.system, [
      { id: 'l', value: 4 },
      { id: 'w', value: 3 },
    ]);
    s = changeUnits(us.system, s, metric.system);
    expect(us.toDisplay('l', s.result.values.l!)).toBeCloseTo(4); // 4 cm → 4 in
    expect(us.toDisplay('A', s.result.values.A!)).toBeCloseTo(12);
    expect(s.errors.l).toBe('Same number in the new unit (whole-number lesson)');
    // A physical quantity keeps its value: 10 kg stays 10 kg (shown as 22.05 lb).
    const n = mod('s.8.newtons-laws');
    const nMetric = makeUnitContext(n, { system: 'metric' });
    const ns = changeUnits(
      makeUnitContext(n, { system: 'us' }).system,
      initialState(nMetric.system, [
        { id: 'm', value: 10 },
        { id: 'a', value: 2 },
      ]),
      nMetric.system,
    );
    expect(ns.result.values.F).toBeCloseTo(20);
    expect(ns.errors).toEqual({});
  });

  it('physical ranges don’t shrink when a smaller unit is chosen', () => {
    const c = mod('he.engineering.circuits-1#0');
    const ctx = makeUnitContext(c, { system: 'mixed', units: { I: 'mA' } });
    const r = solve(ctx.system, [
      { id: 'V', value: 12 },
      { id: 'R1', value: 2 },
      { id: 'R2', value: 4 },
    ]);
    expect(ctx.toDisplay('I', r.values.I!)).toBeCloseTo(2000);
    const tooBig = solve(ctx.system, [{ id: 'I', value: 2000 }]);
    expect(tooBig.rejected?.reason).toBe('Must be at most 1,000,000 mA');
  });

  it('typing in the shown unit converts to formula units', () => {
    const n = mod('s.8.newtons-laws');
    const ctx = makeUnitContext(n, { system: 'us' });
    let s = initialState(ctx.system, [{ id: 'm', value: ctx.fromDisplay('m', 100) }]);
    s = setValues(ctx.system, s, { a: ctx.fromDisplay('a', 32.174) });
    // 100 lb accelerating at 32.174 ft/s² (1 g) needs 100 lbf.
    expect(ctx.toDisplay('F', s.result.values.F!)).toBeCloseTo(100, 2);
  });
});

describe('step-by-step with units', () => {
  it('never rounds whole-number values once they are converted to formula units', () => {
    const m = mod('m.3.area');
    // (Mixed isn't offered for this lesson, but the step builder must still be right.)
    const ctx = makeUnitContext(m, { system: 'mixed', units: { l: 'ft', w: 'in', A: 'in²' } });
    const r = solve(ctx.system, [
      { id: 'l', value: 30.48 },
      { id: 'w', value: 7.62 },
    ]);
    const w = buildSteps(m, r, ctx);
    expect(w.convertIn[0]).toBe('l = 1 ft = 30.48 cm   (1 ft = 30.48 cm)');
    expect(w.steps[0]!.substituted).toBe('A = 30.48 × 7.62');
  });

  it('works directly in the chosen units when the formulas hold in them', () => {
    const m = mod('m.3.area');
    const ctx = makeUnitContext(m, { system: 'us' });
    const r = solve(ctx.system, [
      { id: 'l', value: ctx.fromDisplay('l', 4) },
      { id: 'w', value: ctx.fromDisplay('w', 3) },
    ]);
    const w = buildSteps(m, r, ctx);
    expect(w.convertIn).toEqual([]);
    expect(w.given.map((q) => q.value)).toEqual(['4 in', '3 in']);
    expect(w.steps[0]).toMatchObject({ substituted: 'A = 4 × 3', result: 'A = 12 in²' });
    expect(w.check).toEqual([{ formula: '4 × 3 = 12', ok: true }]);
  });

  it('converts to formula units first, then converts the answers back', () => {
    const m = mod('s.8.newtons-laws');
    const ctx = makeUnitContext(m, { system: 'us' });
    const r = solve(ctx.system, [
      { id: 'a', value: ctx.fromDisplay('a', 32.174) },
      { id: 'm', value: ctx.fromDisplay('m', 100) },
    ]);
    const w = buildSteps(m, r, ctx);
    expect(w.workingUnits).toBe('N, kg, m/s²');
    expect(w.convertIn).toEqual([
      'a = 32.174 ft/s² = 9.8066 m/s²   (1 m/s² = 3.28084 ft/s²)',
      'm = 100 lb = 45.3592 kg   (1 kg = 2.20462 lb)',
    ]);
    // 32.174 ft/s² is just under one standard g (32.17405 ft/s²), so F is just under 100 lbf.
    expect(w.steps[0]!.result).toBe('F = 444.8215 N');
    expect(w.convertOut).toEqual(['F = 444.8215 N = 99.9998 lbf   (1 lbf = 4.44822 N)']);
  });
});
