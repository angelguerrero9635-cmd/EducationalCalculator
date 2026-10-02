import { MODULES } from '@/data/modules';
import { buildSteps } from '@/data/modules/buildSteps';

import { solve } from '../solve';
import { changeUnits, initialState, setValues } from '../state';
import { linkedUnits, makeUnitContext, unitChoices, unitOptions } from '../unitContext';
import {
  TEMPERATURE_DIFFERENCES,
  UNITS,
  convert,
  getUnit,
  offsetRule,
  unitInSystem,
} from '../units';

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
      'bp',
      'per day',
      'mol/kg',
      'J/(mol·K)',
      'mol/(L·s)',
      'g/L',
      'people',
      'people per km²',
      'minutes',
      'R⊕',
      'M☉',
      'per 1,000',
      'years',
      'cubes',
      'square units',
      'cubic units',
      'units',
      '°F',
      '°C',
      'eighths of an inch',
      '×',
      'µm',
      'g/mL',
      'beats per minute',
      'days',
      'hours',
      'seconds',
      '°',
      'drops',
      'cups',
      'liters',
      'feet',
      'inches',
      'meters',
      'centimeters',
      '¢',
      '$',
      '°C/min',
      'ppm',
      'ppm/yr',
      'L/min',
      'kcal',
      'J',
      'V',
      'A',
      'Ω',
      'Hz',
      'nm',
      'AU',
      'Earth masses',
      'Earth years',
      'N/kg',
      'amp-turns',
      'turns',
      'clips',
      'mL/h',
      'V/m',
      'u',
      'MeV',
      // Grades 9–12 science labels (no conversion offered)
      'mol/L',
      'g/mol',
      'μC',
      'kJ/mol',
      'pm',
      'kg·m/s',
      'dB',
      'Wb',
      'W/m²',
      'T',
      'N/m',
      'N/C',
      'L☉',
      'R☉',
      'Mpc',
      'million light-years',
      'km/s per Mpc',
      'billion years',
      'million years',
      'g/kg',
      'hPa per 100 km',
      'kg/s',
      // s.11 rotation, oscillations, electric potential
      'N·m',
      'rpm',
      'rad',
      'rad/s',
      'rad/s²',
      'kg·m²',
      'e',
      'μF',
      'pF',
      'pC',
      // s.11 and s.12 pages that waited on pictures
      'C',
      'mm/yr',
      'm³/s',
      'billion barrels',
      'billion barrels a year',
      '″',
      'pc',
      'light-years',
      // s.9 pyramid of biomass (dry mass per square meter)
      'g/m²',
    ];
    const unknown = new Set(
      MODULES.flatMap((m) =>
        m.variables.flatMap((v) =>
          v.unit && !getUnit(v.unit) && !fixed.includes(v.unit) ? [`${m.id}: ${v.unit}`] : [],
        ),
      ),
    );
    expect([...unknown]).toEqual([]);
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
    // Middle-school science is metric-only: no US system and no Mixed.
    const density = mod('s.6.density');
    expect(unitOptions(density.variables, density.unitSystems)).toEqual({
      systems: ['metric'],
      metricUnits: true,
      mixed: false,
      linked: false,
    });
    // Electrical units are shared, so there is no US system and Mixed would add nothing; the
    // resistances (and voltages) are read in one unit together.
    expect(unitOptions(mod('he.engineering.circuits-1#0').variables)).toEqual({
      systems: ['metric'],
      metricUnits: false,
      mixed: false,
      linked: true,
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

  it('converts charge and capacitance, offered only where a value lists them', () => {
    expect(close(convert(4, 'μC', 'C'), 4e-6)).toBe(true);
    expect(close(convert(1062, 'pC', 'nC'), 1.062)).toBe(true);
    expect(close(convert(470, 'μF', 'F'), 4.7e-4)).toBe(true);
    const q = { id: 'q', symbol: 'q', name: 'Charge', unit: 'μC' };
    expect(unitChoices(q, 'metric')).toEqual([]);
    expect(unitChoices({ ...q, units: ['nC', 'μC', 'C'] }, 'metric')).toEqual(['nC', 'μC', 'C']);
  });

  it('shows a value first in `shownIn`, the unit picked from the menu winning', () => {
    const page = mod('s.11.electric-potential~parallel-plate');
    const ctx = makeUnitContext(page, { system: 'metric' });
    expect(ctx.display.d).toBe('mm');
    expect(ctx.toDisplay('d', 0.001)).toBeCloseTo(1);
    expect(makeUnitContext(page, { system: 'metric', units: { d: 'm' } }).display.d).toBe('m');
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
    const r = solve(ctx.system, [{ id: 'l', value: ctx.fromDisplay('l', 13) }]);
    expect(r.rejected?.reason).toBe('Must be at most 12 in');
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
    // Grade 3 names the value in words (letters stand for numbers from Grade 6).
    expect(w.convertIn[0]).toBe('Length = 1 ft = 30.48 cm   (1 ft = 30.48 cm)');
    // Grade 3: the sentence carries the numbers (no echo line "A = 30.48 × 7.62" under it).
    expect(w.steps[0]!.sentence).toBe('30.48 × 7.62 = ?');
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
    expect(w.steps[0]).toMatchObject({ sentence: '4 × 3 = ?', result: 'A = 12 in²' });
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

it('offers only squares and cubes of lengths for areas and volumes in whole-number lessons', () => {
  const l = { id: 'l', symbol: 'l', name: 'Length', unit: 'cm', integer: true };
  const V = { id: 'V', symbol: 'V', name: 'Volume', unit: 'cm³', integer: true };
  expect(unitChoices(V, 'metric', [l, V])).toEqual(['mm³', 'cm³', 'm³', 'km³']);
  expect(unitChoices(V, 'us', [l, V])).toEqual(['in³', 'ft³', 'yd³', 'mi³']);
  // A liquid-volume lesson (no lengths) keeps its liters.
  expect(unitChoices(V, 'metric', [V])).toContain('L');
});

describe('Grades 9–12 units', () => {
  it.each([
    [0, '°C', 'K', 273.15],
    [212, '°F', '°C', 100],
    [-40, '°C', '°F', -40],
    [300, 'K', '°C', 26.85],
    [1, 'atm', 'mmHg', 760],
    [1, 'atm', 'kPa', 101.325],
    [1013.25, 'hPa', 'atm', 1],
    [1, 'kcal', 'kJ', 4.184],
    [2500, 'mmol', 'mol', 2.5],
    [4.184, 'J/(g·°C)', 'J/(kg·°C)', 4184],
    [4.6, 'Ga', 'Ma', 4600],
    [30, 'km/s', 'm/s', 30000],
  ])('%p %s = %p %s', (x, from, to, y) => {
    expect(close(convert(x, from, to), y)).toBe(true);
  });

  it('offers a temperature, pressure or energy menu only on a value that lists its units', () => {
    const T = { id: 'T', symbol: 'T', name: 'Temperature', unit: '°C' };
    const P = { id: 'P', symbol: 'P', name: 'Pressure', unit: 'atm' };
    // A K–8 page writing °C as a label keeps it: no menu, no Units dropdown.
    expect(unitChoices(T, 'metric', [T])).toEqual([]);
    expect(unitOptions([T]).systems).toEqual([]);
    expect(unitChoices({ ...T, units: ['°C', 'K'] }, 'metric', [T])).toEqual(['K', '°C']);
    expect(unitChoices({ ...P, units: ['atm', 'kPa', 'mmHg'] }, 'metric', [P])).toEqual([
      'kPa',
      'atm',
      'mmHg',
    ]);
  });
});

describe('college units (HE-E5)', () => {
  it.each([
    [1, 'MPa', 'N/mm²', 1],
    [1, 'ksi', 'MPa', 6.894757293168361],
    [1, 'GPa', 'MPa', 1000],
    [1, 'kPa·m³', 'kJ', 1],
    [1, 'kip·ft', 'kN·m', 1.3558179483314003],
    [1, 'lbf·ft', 'N·m', 1.3558179483314003],
    [1, 'in⁴', 'mm⁴', 416231.4256],
    [1, 'Btu/lb', 'kJ/kg', 2.326],
    [1, 'Btu/(lb·°F)', 'kJ/(kg·K)', 4.1868],
    [1, 'Btu/(h·ft·°F)', 'W/(m·K)', 1.730734666],
    [1, 'Btu/(h·ft²·°F)', 'W/(m²·K)', 5.678263341],
    [3000, 'rpm', 'rad/s', 100 * Math.PI],
    [2.4, 'GHz', 'Hz', 2.4e9],
    [1, 'cP', 'Pa·s', 1e-3],
    [1, 'MGD', 'm³/s', 0.043812636],
    [1, 'Sv', 'm³/s', 1e6],
    [100, 'kmol/h', 'mol/s', 27.777777778],
    [1, 'M', 'mM', 1000],
    [250, 'μM', 'mM', 0.25],
    [1, 'mg/L', 'μg/L', 1000],
    [1, 'kcal/mol', 'kJ/mol', 4.184],
    [1, 'L·atm/(mol·K)', 'J/(mol·K)', 101.325],
    [1, 'L/(mol·min)', 'M⁻¹s⁻¹', 1 / 60],
    [1, 'cm⁻¹', 'm⁻¹', 100],
    [1, 'kDa', 'Da', 1000],
    [1, 'Da', 'u', 1],
    [1, 'Å', 'nm', 0.1],
    [1, 'μm', 'mm', 1e-3],
    [1, 'mGal', 'm/s²', 1e-5],
    [1, 'Ω·cm', 'Ω·m', 0.01],
    [1, 'KiB', 'B', 1024],
    [1, 'kB', 'B', 1000],
    [1, 'B', 'bit', 8],
    [1, 'Gb/s', 'MB/s', 125],
    [1, 'N/C', 'V/m', 1],
    [1, 'G', 'μT', 100],
    [1, 'Ci', 'MBq', 37000],
    [60, 'dpm/g', 'Bq/g', 1],
    [1, 'ksf', 'psf', 1000],
    [1, 'pc/mi/ln', 'pc/km/ln', 1 / 1.609344],
    [1, 'days', 'h', 24],
    [1, 'm/day', 'mm/h', 1000 / 24],
    [1, 'yr', 's', 31557600],
    [1, 'Myr', 's', 3.15576e13],
    [1, 'MPa√m', 'ksi√in', 0.910048],
    [1, 'R', 'K', 5 / 9],
  ])('%p %s = %p %s', (x, from, to, y) => {
    expect(close(convert(x, from, to), y, 1e-6)).toBe(true);
    expect(close(convert(y, to, from), x, 1e-6)).toBe(true);
  });

  it('keeps logarithmic, apparent and reactive units out of the linear ones', () => {
    expect(() => convert(1, 'dBm', 'mW')).toThrow();
    expect(() => convert(1, 'dB', 'dBm')).toThrow();
    expect(() => convert(1, 'VA', 'W')).toThrow();
    expect(() => convert(1, 'var', 'VA')).toThrow();
    expect(() => convert(1, 'Hz', 'rad/s')).toThrow();
    expect(() => convert(1, 'N·m', 'J')).toThrow();
    expect(() => convert(1, 'mSv', 'mGy')).toThrow();
    // dBm and dBW differ by 30; dBi and dBd by 2.15.
    expect(convert(30, 'dBm', 'dBW')).toBeCloseTo(0);
    expect(convert(0, 'dBd', 'dBi')).toBeCloseTo(2.15);
  });

  it('gives every unit one id, and US counterparts of the same dimension', () => {
    const ids = UNITS.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const x of TEMPERATURE_DIFFERENCES) {
      if (x.us) expect(getUnit(x.us, true)?.dimension).toBe('temperatureDifference');
      if (x.metric) expect(getUnit(x.metric, true)?.dimension).toBe('temperatureDifference');
    }
  });

  it('never offers a college unit on a K–12 page: μm, Hz and g/mol stay labels', () => {
    const d = { id: 'd', symbol: 'd', name: 'Length', unit: 'cm' };
    expect(unitChoices(d, 'metric')).toEqual(['mm', 'cm', 'm', 'km']);
    const w = { id: 'w', symbol: 'λ', name: 'Wavelength', unit: 'nm' };
    expect(unitChoices(w, 'metric')).toEqual([]);
    // Listing the value's own unit alone (a gallery demo) is still a label.
    expect(unitChoices({ ...w, units: ['nm'] }, 'metric')).toEqual([]);
    expect(unitOptions([{ ...w, units: ['nm'] }]).systems).toEqual([]);
    // A college value listing its units gets the menu.
    expect(unitChoices({ ...w, units: ['nm', 'μm', 'Å'] }, 'metric')).toEqual(['μm', 'nm', 'Å']);
    const days = { id: 't', symbol: 't', name: 'Time', unit: 'days' };
    const page = { id: 's.x', relations: [], variables: [days], example: {} };
    expect(makeUnitContext(page, { system: 'us' }).display.t).toBe('days');
  });

  it('switches a college value between metric and US units where it lists both', () => {
    const s = { id: 's', symbol: 'σ', name: 'Stress', unit: 'MPa', units: ['MPa', 'ksi'] };
    expect(unitChoices(s, 'metric')).toEqual(['MPa']);
    expect(unitChoices(s, 'us')).toEqual(['ksi']);
    expect(unitOptions([s]).systems).toEqual(['metric', 'us']);
    const page = { id: 'he.x', relations: [], variables: [s], example: {} };
    const ctx = makeUnitContext(page, { system: 'us' });
    expect(ctx.display.s).toBe('ksi');
    expect(ctx.toDisplay('s', 250)).toBeCloseTo(36.26, 2);
  });
});

describe('temperature differences (ΔT)', () => {
  it('converts a difference by the factor alone, a reading with the offset', () => {
    // A rise of 10 °C is a rise of 10 K and of 18 °F (and 18 R).
    expect(convert(10, '°C', 'K', true)).toBeCloseTo(10);
    expect(convert(10, '°C', '°F', true)).toBeCloseTo(18);
    expect(convert(18, '°F', 'K', true)).toBeCloseTo(10);
    expect(convert(18, 'R', '°F', true)).toBeCloseTo(18);
    // A reading of 10 °C is 283.15 K and 50 °F.
    expect(convert(10, '°C', 'K')).toBeCloseTo(283.15);
    expect(convert(10, '°C', '°F')).toBeCloseTo(50);
    expect(convert(491.67, 'R', '°C')).toBeCloseTo(0);
    expect(getUnit('K', true)?.dimension).toBe('temperatureDifference');
    expect(getUnit('K')?.dimension).toBe('temperature');
    // Non-temperature units read the same with the flag.
    expect(getUnit('kJ/(kg·K)', true)?.dimension).toBe('specificHeat');
  });

  it('shows a ΔT in °F or R under US customary, and works the steps without an offset', () => {
    const dT = {
      id: 'dT',
      symbol: 'ΔT',
      name: 'Temperature rise',
      unit: 'K',
      units: ['K', '°C', '°F', 'R'],
      difference: true,
    };
    expect(unitChoices(dT, 'metric')).toEqual(['K', '°C']);
    expect(unitChoices(dT, 'us')).toEqual(['°F', 'R']);
    expect(unitInSystem('°C', 'us', true)).toBe('°F');
    const page = { id: 'he.x', relations: [], variables: [dT], example: { dT: 10 } };
    const us = makeUnitContext(page, { system: 'us' });
    expect(us.display.dT).toBe('°F');
    expect(us.toDisplay('dT', 10)).toBeCloseTo(18);
    expect(us.fromDisplay('dT', 18)).toBeCloseTo(10);
    const c = makeUnitContext(page, { system: 'metric', units: { dT: '°C' } });
    expect(c.toDisplay('dT', 10)).toBeCloseTo(10);
    // The conversion line states a factor, never "K = °C + 273.15".
    expect(offsetRule('°C', 'K', true)).toBeUndefined();
    expect(offsetRule('°C', 'K')).toBe('K = °C + 273.15');
    expect(offsetRule('R', '°F')).toBe('R = °F + 459.67');
  });
});
