/**
 * College gallery demos, round 4, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * Earth and geography (docs/plans/he.earth-geography.md): HC122 `atmosphereLayers` `thickness`
 * (meteorology#0, ~pressure-altitude; EG-P10); HC123 `adiabat` and `saturation` (meteorology#1,
 * ~humidity; EG-P11); HC124 parcel `dry` and `dewLapse` (meteorology#1~lcl; EG-P12); HC125
 * balance `layer` (climatology#0; EG-P13); HC130 `rayDiagram` Snell `speeds`
 * (geophysics#0~critical-angle; EG-P21).
 */
import type { Relation } from '@/engine/types';

import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

/** A relation and its step text, built together. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const st = (expr: string, how: string): StepText => ({ expr, how });

/** A demo module: college pages show 4 figures. */
const demo = (m: Omit<ModuleDef, 'workedFigures'> & { workedFigures?: number }): ModuleDef => ({
  workedFigures: 4,
  ...m,
});

const quantity = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step: number,
  more: Partial<ModuleDef['variables'][number]> = {},
): ModuleDef['variables'][number] => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

/** The earth pages' constants (the plan's "Constants"): g, R_d. */
const G = 9.81;
const RD = 287;

// ── HC122: the hypsometric equation (meteorology#0) and p = p₀e^(−z/H) (~pressure-altitude) ──

const thicknessDemo = (
  id: string,
  title: string,
  use: string,
  [p1, p2, t]: [number, number, number],
) => {
  const h = (RD * t) / G;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Dry air in hydrostatic balance; R_d = 287 J/(kg·K) and g = 9.81 m/s².',
      'T̄ is the layer’s mean temperature, so a warm layer is thicker than a cold one.',
    ],
    variables: [
      quantity('p1', 'p₁', 'Lower pressure', 'hPa', 100, 1050, 0.1),
      quantity('p2', 'p₂', 'Upper pressure', 'hPa', 1, 1050, 0.1),
      quantity('T', 'T̄', 'Mean temperature', 'K', 180, 320, 0.1),
      quantity('H', 'H', 'Scale height', 'm', 5000, 9500, 1),
      quantity('dz', 'Δz', 'Thickness', 'm', 1, 50000, 1),
    ],
    ...rules(
      {
        relation: {
          id: 'H = R_d T̄ ÷ g',
          display: '{H} = 287 × {T} ÷ 9.81',
          vars: ['H', 'T'],
          residual: (v) => v.H! - (RD * v.T!) / G,
          solve: { H: (v) => (RD * v.T!) / G, T: (v) => (G * v.H!) / RD },
        },
        steps: {
          H: st(
            '287 × {T} ÷ 9.81',
            'The scale height: R_d T̄ ÷ g, the height over which p falls to 1 ÷ e.',
          ),
          T: st('{H} × 9.81 ÷ 287', 'Multiply H by g and divide by R_d.'),
        },
      },
      {
        relation: {
          id: 'Δz = H ln(p₁ ÷ p₂)',
          display: '{dz} = {H} × ln({p1} ÷ {p2})',
          vars: ['dz', 'H', 'p1', 'p2'],
          residual: (v) => v.dz! - v.H! * Math.log(v.p1! / v.p2!),
          solve: {
            dz: (v) => (v.p1! > 0 && v.p2! > 0 ? v.H! * Math.log(v.p1! / v.p2!) : undefined),
            H: (v) => div(v.dz!, Math.log(v.p1! / v.p2!)),
            p2: (v) => v.p1! / Math.exp(v.dz! / v.H!),
            p1: (v) => v.p2! * Math.exp(v.dz! / v.H!),
          },
        },
        steps: {
          dz: st(
            '{H} × ln({p1} ÷ {p2})',
            'The hypsometric equation: H times the log of the pressure ratio.',
          ),
          H: st('{dz} ÷ ln({p1} ÷ {p2})', 'Divide the thickness by the log of the ratio.'),
          p2: st('{p1} ÷ e^({dz} ÷ {H})', 'The pressure falls by a factor e for each H climbed.'),
          p1: st('{p2} × e^({dz} ÷ {H})', 'Go back down Δz: multiply by e^(Δz ÷ H).'),
        },
      },
    ),
    example: { p1, p2, T: t, H: h, dz: h * Math.log(p1 / p2) },
    startWith: ['p1', 'p2', 'T'],
    representation: {
      kind: 'atmosphereLayers',
      mode: 'thickness',
      lower: 'p1',
      upper: 'p2',
      temperature: 'T',
      scaleHeight: 'H',
      thickness: 'dz',
      g: G,
      gasConstant: RD,
    },
  });
};

const thickness = thicknessDemo(
  'g.he-atmosphereLayers-thickness',
  'The thickness between two pressure levels',
  'Use this for the thickness of the 1,000 to 500 hPa layer at a mean of 255 K, or the mean temperature a measured thickness gives.',
  [1000, 500, 255],
);

const thicknessDeep = thicknessDemo(
  'g.he-atmosphereLayers-thickness-deep',
  'A warm, deep layer: 1,000 to 100 hPa',
  'Use this for the thickness of the layer from 1,000 to 100 hPa at a warm mean of 300 K: about 20 km.',
  [1000, 100, 300],
);

const pressureAltitude = demo({
  id: 'g.he-atmosphereLayers-thickness-altitude',
  title: 'Pressure at an altitude',
  use: 'Use this for the pressure 1.6 km above a sea-level pressure of 1,013.25 hPa, or the altitude of a pressure.',
  assumptions: [
    'Air at one temperature through the column, so its scale height H stays the same.',
    'The standard atmosphere’s scale height is about 8 km.',
  ],
  variables: [
    quantity('p0', 'p₀', 'Sea-level pressure', 'hPa', 950, 1050, 0.01),
    quantity('z', 'z', 'Altitude', 'km', 0.01, 50, 0.01),
    quantity('H', 'H', 'Scale height', 'km', 6, 9, 0.1),
    quantity('p', 'p', 'Pressure', 'hPa', 0.01, 1050, 0.1),
  ],
  ...rules({
    relation: {
      id: 'p = p₀e^(−z/H)',
      display: '{p} = {p0} × e^(−{z} ÷ {H})',
      vars: ['p', 'p0', 'z', 'H'],
      residual: (v) => v.p! - v.p0! * Math.exp(-v.z! / v.H!),
      solve: {
        p: (v) => v.p0! * Math.exp(-v.z! / v.H!),
        p0: (v) => v.p! * Math.exp(v.z! / v.H!),
        z: (v) => (v.p! > 0 && v.p0! > 0 ? v.H! * Math.log(v.p0! / v.p!) : undefined),
        H: (v) => div(v.z!, Math.log(v.p0! / v.p!)),
      },
    },
    steps: {
      p: st('{p0} × e^(−{z} ÷ {H})', 'The pressure falls by a factor e for each scale height up.'),
      p0: st('{p} × e^({z} ÷ {H})', 'Bring the pressure back down to sea level.'),
      z: st('{H} × ln({p0} ÷ {p})', 'Take the log of the pressure ratio and multiply by H.'),
      H: st('{z} ÷ ln({p0} ÷ {p})', 'Divide the altitude by the log of the ratio.'),
    },
  }),
  example: { p0: 1013.25, z: 1.6, H: 8, p: 1013.25 * Math.exp(-0.2) },
  startWith: ['p0', 'z', 'H'],
  representation: {
    kind: 'atmosphereLayers',
    mode: 'thickness',
    lower: 'p0',
    upper: 'p',
    thickness: 'z',
    scaleHeight: 'H',
    unit: 'km',
  },
});

// ── HC123: potential temperature (meteorology#1) and humidity (~humidity) ──

/** κ = R_d ÷ c_p, the plan's exponent. */
const KAPPA = 0.286;

const adiabatDemo = (id: string, title: string, use: string, [t, p]: [number, number]) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'θ is the temperature the air would have if brought dry and adiabatically to 1,000 hPa.',
      'It stays the same for a parcel rising or sinking without heat or condensation; κ = 0.286.',
    ],
    variables: [
      quantity('T', 'T', 'Temperature', 'K', 180, 330, 0.01),
      quantity('p', 'p', 'Pressure', 'hPa', 10, 1050, 0.1),
      quantity('th', 'θ', 'Potential temperature', 'K', 150, 900, 0.1),
    ],
    ...rules({
      relation: {
        id: 'θ = T(1,000 ÷ p)^κ',
        display: '{th} = {T} × (1000 ÷ {p})^0.286',
        vars: ['th', 'T', 'p'],
        residual: (v) => v.th! - v.T! * (1000 / v.p!) ** KAPPA,
        solve: {
          th: (v) => (v.p! > 0 ? v.T! * (1000 / v.p!) ** KAPPA : undefined),
          T: (v) => v.th! / (1000 / v.p!) ** KAPPA,
          p: (v) => (v.th! > 0 && v.T! > 0 ? 1000 / (v.th! / v.T!) ** (1 / KAPPA) : undefined),
        },
      },
      steps: {
        th: st(
          '{T} × (1000 ÷ {p})^0.286',
          'Bring the parcel down dry to 1,000 hPa: it warms by the pressure ratio to the power κ.',
        ),
        T: st('{th} ÷ (1000 ÷ {p})^0.286', 'Divide θ by the same factor.'),
        p: st(
          '1000 ÷ ({th} ÷ {T})^(1 ÷ 0.286)',
          'The ratio θ ÷ T is (1,000 ÷ p)^κ: undo the power, then divide 1,000 by it.',
        ),
      },
    }),
    example: { T: t, p, th: t * (1000 / p) ** KAPPA },
    startWith: ['T', 'p'],
    representation: {
      kind: 'atmosphereLayers',
      mode: 'adiabat',
      temperature: 'T',
      pressure: 'p',
      theta: 'th',
      kappa: KAPPA,
    },
  });

const adiabat = adiabatDemo(
  'g.he-atmosphereLayers-adiabat',
  'Potential temperature of a parcel',
  'Use this for the potential temperature of air at 263.15 K and 700 hPa, or the temperature a parcel of known θ has at a pressure.',
  [263.15, 700],
);

const adiabatHigh = adiabatDemo(
  'g.he-atmosphereLayers-adiabat-high',
  'Cold air high up: a large θ',
  'Use this for air at 220 K near the tropopause at 200 hPa: brought down dry it would be far warmer than the ground.',
  [220, 200],
);

/** Tetens' saturation vapor pressure at T (°C), hPa. */
const tetens = (t: number) => 6.112 * Math.exp((17.67 * t) / (t + 243.5));
/** The inverse: the temperature (°C) where it is e. */
const tetensInv = (e: number) => {
  const l = Math.log(e / 6.112);
  return (243.5 * l) / (17.67 - l);
};

const saturationDemo = (
  id: string,
  title: string,
  use: string,
  [t, td, p]: [number, number, number],
) => {
  const es = tetens(t);
  const e = tetens(td);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'Tetens’ formula for the saturation vapor pressure over water: 6.112e^(17.67T ÷ (T + 243.5)) hPa.',
      'The air’s vapor pressure e is the saturation value at its dew point; the dew point is never above T.',
    ],
    variables: [
      quantity('T', 'T', 'Temperature', '°C', -40, 50, 0.1),
      quantity('Td', 'T_d', 'Dew point', '°C', -60, 50, 0.1),
      quantity('es', 'eₛ', 'Saturation vapor pressure', 'hPa', 0.01, 130, 0.01),
      quantity('e', 'e', 'Vapor pressure', 'hPa', 0.001, 130, 0.01),
      quantity('RH', 'RH', 'Relative humidity', '%', 0.1, 100, 0.1),
      quantity('p', 'p', 'Pressure', 'hPa', 100, 1050, 0.1),
      quantity('r', 'r', 'Mixing ratio', 'g/kg', 0.001, 200, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'eₛ = 6.112e^(17.67T ÷ (T + 243.5))',
          display: '{es} = 6.112 × e^(17.67 × {T} ÷ ({T} + 243.5))',
          vars: ['es', 'T'],
          residual: (v) => v.es! - tetens(v.T!),
          solve: { es: (v) => tetens(v.T!), T: (v) => (v.es! > 0 ? tetensInv(v.es!) : undefined) },
        },
        steps: {
          es: st(
            '6.112 × e^(17.67 × {T} ÷ ({T} + 243.5))',
            'Tetens’ formula: the most vapor the air can hold at T.',
          ),
          T: st(
            '243.5 × ln({es} ÷ 6.112) ÷ (17.67 − ln({es} ÷ 6.112))',
            'Undo Tetens: take ln(eₛ ÷ 6.112) and solve for T.',
          ),
        },
      },
      {
        relation: {
          id: 'e = 6.112e^(17.67T_d ÷ (T_d + 243.5))',
          display: '{e} = 6.112 × e^(17.67 × {Td} ÷ ({Td} + 243.5))',
          vars: ['e', 'Td'],
          residual: (v) => v.e! - tetens(v.Td!),
          solve: { e: (v) => tetens(v.Td!), Td: (v) => (v.e! > 0 ? tetensInv(v.e!) : undefined) },
        },
        steps: {
          e: st(
            '6.112 × e^(17.67 × {Td} ÷ ({Td} + 243.5))',
            'The air’s vapor pressure is the saturation value at its dew point.',
          ),
          Td: st(
            '243.5 × ln({e} ÷ 6.112) ÷ (17.67 − ln({e} ÷ 6.112))',
            'Undo Tetens for the temperature where e would saturate the air.',
          ),
        },
      },
      {
        relation: {
          id: 'RH = 100e ÷ eₛ',
          display: '{RH} = 100 × {e} ÷ {es}',
          vars: ['RH', 'e', 'es'],
          residual: (v) => v.RH! * v.es! - 100 * v.e!,
          solve: {
            RH: (v) => div(100 * v.e!, v.es!),
            e: (v) => (v.RH! * v.es!) / 100,
            es: (v) => div(100 * v.e!, v.RH!),
          },
        },
        steps: {
          RH: st('100 × {e} ÷ {es}', 'The share of the most vapor the air could hold, in percent.'),
          e: st('{RH} × {es} ÷ 100', 'Take RH percent of eₛ.'),
          es: st('100 × {e} ÷ {RH}', 'Divide e by the share RH ÷ 100.'),
        },
      },
      {
        relation: {
          id: 'r = 622e ÷ (p − e)',
          display: '{r} = 622 × {e} ÷ ({p} − {e})',
          vars: ['r', 'e', 'p'],
          residual: (v) => v.r! * (v.p! - v.e!) - 622 * v.e!,
          solve: {
            r: (v) => (v.p! > v.e! ? (622 * v.e!) / (v.p! - v.e!) : undefined),
            e: (v) => (v.r! * v.p!) / (622 + v.r!),
            p: (v) => div(622 * v.e!, v.r!)! + v.e!,
          },
        },
        steps: {
          r: st(
            '622 × {e} ÷ ({p} − {e})',
            'Grams of vapor per kilogram of dry air: 622e over the dry air’s pressure.',
          ),
          e: st('{r} × {p} ÷ (622 + {r})', 'Solve r(p − e) = 622e for e.'),
          p: st('622 × {e} ÷ {r} + {e}', 'The dry air’s pressure 622e ÷ r, plus the vapor’s.'),
        },
      },
    ),
    example: { T: t, Td: td, es, e, RH: (100 * e) / es, p, r: (622 * e) / (p - e) },
    startWith: ['T', 'Td', 'p'],
    representation: {
      kind: 'atmosphereLayers',
      mode: 'saturation',
      temperature: 'T',
      dewPoint: 'Td',
      saturation: 'es',
      vapor: 'e',
      rh: 'RH',
      pressure: 'p',
      mixing: 'r',
    },
  });
};

const saturation = saturationDemo(
  'g.he-atmosphereLayers-saturation',
  'Saturation vapor pressure, relative humidity and mixing ratio',
  'Use this for air at 25 °C with a dew point of 15 °C at 1,000 hPa: eₛ, e, the relative humidity and the mixing ratio.',
  [25, 15, 1000],
);

const saturationCold = saturationDemo(
  'g.he-atmosphereLayers-saturation-cold',
  'Cold air holds little vapor',
  'Use this for air at −20 °C with a dew point of −25 °C at 850 hPa: a high RH but very little water.',
  [-20, -25, 850],
);

// ── HC124: the lifting condensation level with the page's lapse rates (meteorology#1~lcl) ──

/** The plan's lapse rates: dry 9.8 °C/km, dew point 1.8 °C/km (125 m per °C of spread). */
const DRY = 9.8;
const DEW = 1.8;

const lclDemo = (id: string, title: string, use: string, [t, td]: [number, number]) => {
  const z = (1000 * (t - td)) / (DRY - DEW);
  return demo({
    id,
    title,
    use,
    assumptions: [
      'The parcel cools 9.8 °C per km (dry adiabatic) and its dew point falls 1.8 °C per km.',
      'They meet, and a cloud forms, 125 m up for each °C of spread; the dew point is never above T.',
    ],
    variables: [
      quantity('T', 'T', 'Temperature at the ground', '°C', -30, 50, 0.1),
      quantity('Td', 'T_d', 'Dew point at the ground', '°C', -40, 50, 0.1),
      quantity('s', 'ΔT', 'Spread', '°C', 0, 60, 0.1),
      quantity('z', 'z_LCL', 'Cloud base', 'm', 0, 7500, 1),
      quantity('Tb', 'T_base', 'Temperature at the base', '°C', -80, 50, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'spread = T − T_d',
          display: '{s} = {T} − {Td}',
          vars: ['s', 'T', 'Td'],
          residual: (v) => v.s! - (v.T! - v.Td!),
          solve: {
            s: (v) => (v.T! >= v.Td! ? v.T! - v.Td! : undefined),
            T: (v) => v.Td! + v.s!,
            Td: (v) => v.T! - v.s!,
          },
        },
        steps: {
          s: st('{T} − {Td}', 'How far the air is from saturation.'),
          T: st('{Td} + {s}', 'Add the spread to the dew point.'),
          Td: st('{T} − {s}', 'Take the spread from the temperature.'),
        },
      },
      {
        relation: {
          id: 'z_LCL = 125 m × spread',
          display: '{z} = 125 × {s}',
          vars: ['z', 's'],
          residual: (v) => v.z! - 125 * v.s!,
          solve: { z: (v) => 125 * v.s!, s: (v) => v.z! / 125 },
        },
        steps: {
          z: st(
            '125 × {s}',
            'The two lines close 9.8 − 1.8 = 8 °C per km, so they meet 1,000 ÷ 8 = 125 m up per °C.',
          ),
          s: st('{z} ÷ 125', 'Divide the height by 125 m per °C.'),
        },
      },
      {
        relation: {
          id: 'T_base = T − 9.8 × z_LCL ÷ 1,000',
          display: '{Tb} = {T} − 9.8 × {z} ÷ 1000',
          vars: ['Tb', 'T', 'z'],
          residual: (v) => v.Tb! - (v.T! - (DRY * v.z!) / 1000),
          solve: {
            Tb: (v) => v.T! - (DRY * v.z!) / 1000,
            T: (v) => v.Tb! + (DRY * v.z!) / 1000,
            z: (v) => (1000 * (v.T! - v.Tb!)) / DRY,
          },
        },
        steps: {
          Tb: st('{T} − 9.8 × {z} ÷ 1000', 'The parcel cools 9.8 °C for each km it rises, dry.'),
          T: st('{Tb} + 9.8 × {z} ÷ 1000', 'Add back the cooling on the way up.'),
          z: st('1000 × ({T} − {Tb}) ÷ 9.8', 'The cooling over 9.8 °C per km, in metres.'),
        },
      },
    ),
    example: { T: t, Td: td, s: t - td, z, Tb: t - (DRY * z) / 1000 },
    startWith: ['T', 'Td'],
    representation: {
      kind: 'atmosphereLayers',
      mode: 'parcel',
      temperature: 'T',
      dewPoint: 'Td',
      base: 'z',
      baseUnit: 'm',
      baseTemperature: 'Tb',
      dry: DRY,
      dewLapse: DEW,
    },
  });
};

const lcl = lclDemo(
  'g.he-atmosphereLayers-parcel-lapse',
  'The lifting condensation level',
  'Use this for air at 30 °C with a dew point of 14 °C: the cloud base 2,000 m up and the temperature there.',
  [30, 14],
);

const lclDesert = lclDemo(
  'g.he-atmosphereLayers-parcel-lapse-dry',
  'Dry desert air: a high cloud base',
  'Use this for desert air at 35 °C with a dew point of 5 °C: the clouds form 3,750 m up, below freezing.',
  [35, 5],
);

// ── HC125: the one-layer greenhouse (climatology#0) ──

/** σ, W/(m²·K⁴), the plan's value. */
const SIGMA = 5.67e-8;

const greenhouseDemo = (
  id: string,
  title: string,
  use: string,
  [sun, al, eps]: [number, number, number],
) => {
  const f = (sun * (1 - al)) / 4;
  const te = (f / SIGMA) ** 0.25;
  return demo({
    id,
    title,
    use,
    assumptions: [
      'One atmospheric layer, transparent to sunlight, absorbing a share ε of the ground’s infrared and sending half of it back down.',
      'σ = 5.67 × 10⁻⁸ W/(m²·K⁴); ε = 1 gives Tₛ = 2^(1/4)Tₑ.',
    ],
    variables: [
      quantity('S', 'S', 'Sunlight', 'W/m²', 1, 3000, 1),
      quantity('al', 'α', 'Albedo', undefined, 0, 0.99, 0.01),
      quantity('F', 'F', 'Absorbed sunlight', 'W/m²', 0.01, 750, 0.1),
      quantity('Te', 'Tₑ', 'Balance temperature', 'K', 10, 400, 0.1),
      quantity('eps', 'ε', 'Layer emissivity', undefined, 0, 1, 0.01),
      quantity('Ts', 'Tₛ', 'Surface temperature', 'K', 10, 500, 0.1),
    ],
    ...rules(
      {
        relation: {
          id: 'F = S(1 − α) ÷ 4',
          display: '{F} = {S} × (1 − {al}) ÷ 4',
          vars: ['F', 'S', 'al'],
          residual: (v) => v.F! - (v.S! * (1 - v.al!)) / 4,
          solve: {
            F: (v) => (v.S! * (1 - v.al!)) / 4,
            S: (v) => div(4 * v.F!, 1 - v.al!),
            al: (v) => 1 - div(4 * v.F!, v.S!)!,
          },
        },
        steps: {
          F: st(
            '{S} × (1 − {al}) ÷ 4',
            'The share not reflected, spread over the whole globe (4 times its disk).',
          ),
          S: st('4 × {F} ÷ (1 − {al})', 'Undo the spreading and the reflection.'),
          al: st('1 − 4 × {F} ÷ {S}', 'The share of the sunlight not absorbed.'),
        },
      },
      {
        relation: {
          id: 'Tₑ = (F ÷ σ)^(1/4)',
          display: '{Te} = ({F} ÷ (5.67 × 10⁻⁸))^(1 ÷ 4)',
          vars: ['Te', 'F'],
          residual: (v) => v.Te! - (v.F! / SIGMA) ** 0.25,
          solve: { Te: (v) => (v.F! / SIGMA) ** 0.25, F: (v) => SIGMA * v.Te! ** 4 },
        },
        steps: {
          Te: st(
            '({F} ÷ (5.67 × 10⁻⁸))^(1 ÷ 4)',
            'In balance the planet sends out σTₑ⁴ = F: take the fourth root.',
          ),
          F: st('5.67 × 10⁻⁸ × {Te}^4', 'The infrared a body at Tₑ sends out.'),
        },
      },
      {
        relation: {
          id: 'Tₛ = Tₑ(2 ÷ (2 − ε))^(1/4)',
          display: '{Ts} = {Te} × (2 ÷ (2 − {eps}))^(1 ÷ 4)',
          vars: ['Ts', 'Te', 'eps'],
          residual: (v) => v.Ts! - v.Te! * (2 / (2 - v.eps!)) ** 0.25,
          solve: {
            Ts: (v) => v.Te! * (2 / (2 - v.eps!)) ** 0.25,
            Te: (v) => v.Ts! / (2 / (2 - v.eps!)) ** 0.25,
            eps: (v) => 2 - 2 * (v.Te! / v.Ts!) ** 4,
          },
        },
        steps: {
          Ts: st(
            '{Te} × (2 ÷ (2 − {eps}))^(1 ÷ 4)',
            'The layer sends εG ÷ 2 back down, so the ground must send out 2F ÷ (2 − ε).',
          ),
          Te: st('{Ts} ÷ (2 ÷ (2 − {eps}))^(1 ÷ 4)', 'Divide by the greenhouse factor.'),
          eps: st('2 − 2 × ({Te} ÷ {Ts})^4', 'Solve (Tₛ ÷ Tₑ)⁴ = 2 ÷ (2 − ε) for ε.'),
        },
      },
    ),
    example: { S: sun, al, F: f, Te: te, eps, Ts: te * (2 / (2 - eps)) ** 0.25 },
    startWith: ['S', 'al', 'eps'],
    representation: {
      kind: 'atmosphereLayers',
      mode: 'balance',
      albedo: 'al',
      sunlight: 'S',
      absorbed: 'F',
      temperature: 'Te',
      layer: { emissivity: 'eps', surface: 'Ts' },
    },
  });
};

const greenhouse = greenhouseDemo(
  'g.he-atmosphereLayers-balance-layer',
  'Surface temperature with a one-layer greenhouse',
  'Use this for Earth (1,361 W/m², α = 0.30) under a layer of emissivity 0.78: about 288 K at the ground.',
  [1361, 0.3, 0.78],
);

const greenhouseFull = greenhouseDemo(
  'g.he-atmosphereLayers-balance-layer-opaque',
  'A layer that absorbs all the infrared',
  'Use this for a layer of emissivity 1: the ground warms to 2^(1/4) times the balance temperature.',
  [1361, 0.3, 1],
);

// ── HC130: Snell's law with speeds (geophysics#0~critical-angle) ──

const RAD = Math.PI / 180;
const asind = (x: number) => (Math.abs(x) <= 1 ? Math.asin(x) / RAD : undefined);

const snellDemo = (id: string, title: string, use: string, [v1, v2, i]: [number, number, number]) =>
  demo({
    id,
    title,
    use,
    assumptions: [
      'Flat layers; the ray bends at the boundary by Snell’s law written with speeds.',
      'Into a faster layer, past the critical angle no ray gets through: it is all reflected.',
    ],
    variables: [
      quantity('v1', 'v₁', 'Upper layer speed', 'm/s', 300, 6000, 1),
      quantity('v2', 'v₂', 'Lower layer speed', 'm/s', 300, 8500, 1),
      quantity('i', 'i', 'Incidence angle', '°', 0, 89.9, 0.01),
      quantity('r', 'r', 'Refraction angle', '°', 0, 90, 0.01),
      quantity('ic', 'i_c', 'Critical angle', '°', 0.1, 89.9, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'sin r = (v₂ ÷ v₁) sin i',
          display: 'sin({r}°) = {v2} ÷ {v1} × sin({i}°)',
          vars: ['r', 'v1', 'v2', 'i'],
          residual: (v) => Math.sin(v.r! * RAD) - (v.v2! / v.v1!) * Math.sin(v.i! * RAD),
          solve: {
            r: (v) => asind((v.v2! / v.v1!) * Math.sin(v.i! * RAD)),
            i: (v) => asind((v.v1! / v.v2!) * Math.sin(v.r! * RAD)),
            v2: (v) => div(v.v1! * Math.sin(v.r! * RAD), Math.sin(v.i! * RAD)),
            v1: (v) => div(v.v2! * Math.sin(v.i! * RAD), Math.sin(v.r! * RAD)),
          },
        },
        steps: {
          r: st(
            'sin⁻¹({v2} ÷ {v1} × sin({i}°))',
            'Snell’s law with speeds: the sine of the angle grows with the speed.',
          ),
          i: st('sin⁻¹({v1} ÷ {v2} × sin({r}°))', 'Run Snell’s law back up into the upper layer.'),
          v2: st('{v1} × sin({r}°) ÷ sin({i}°)', 'The speeds are in the ratio of the sines.'),
          v1: st('{v2} × sin({i}°) ÷ sin({r}°)', 'The speeds are in the ratio of the sines.'),
        },
      },
      {
        relation: {
          id: 'sin i_c = v₁ ÷ v₂',
          display: 'sin({ic}°) = {v1} ÷ {v2}',
          vars: ['ic', 'v1', 'v2'],
          residual: (v) => Math.sin(v.ic! * RAD) - v.v1! / v.v2!,
          solve: {
            ic: (v) => (v.v2! > v.v1! ? asind(v.v1! / v.v2!) : undefined),
            v1: (v) => v.v2! * Math.sin(v.ic! * RAD),
            v2: (v) => div(v.v1!, Math.sin(v.ic! * RAD)),
          },
        },
        steps: {
          ic: st(
            'sin⁻¹({v1} ÷ {v2})',
            'At the critical angle the ray runs along the boundary (r = 90°), so sin i_c = v₁ ÷ v₂.',
          ),
          v1: st('{v2} × sin({ic}°)', 'Multiply the lower speed by sin i_c.'),
          v2: st('{v1} ÷ sin({ic}°)', 'Divide the upper speed by sin i_c.'),
        },
      },
    ),
    example: { v1, v2, i, r: asind((v2 / v1) * Math.sin(i * RAD))!, ic: asind(v1 / v2)! },
    startWith: ['v1', 'v2', 'i'],
    representation: {
      kind: 'rayDiagram',
      mode: 'refraction',
      speeds: { v1: 'v1', v2: 'v2' },
      angle: 'i',
      refracted: 'r',
      critical: 'ic',
      media: ['water-soaked sand', 'bedrock'],
    },
  });

const snell = snellDemo(
  'g.he-rayDiagram-speeds',
  'The critical angle; refraction of a seismic ray',
  'Use this for a ray at 10° from 1,500 m/s sediment into 4,500 m/s rock: the refraction angle and the critical angle.',
  [1500, 4500, 10],
);

const snellNear = snellDemo(
  'g.he-rayDiagram-speeds-near-critical',
  'Just under the critical angle',
  'Use this for a ray at 19° into rock three times faster: it bends almost flat along the boundary.',
  [1500, 4500, 19],
);

export const HE4G_GALLERY_MODULES: ModuleDef[] = [
  thickness,
  pressureAltitude,
  thicknessDeep,
  adiabat,
  adiabatHigh,
  saturation,
  saturationCold,
  lcl,
  lclDesert,
  greenhouse,
  greenhouseFull,
  snell,
  snellNear,
];

export const HE4G_GALLERY_LAYOUTS: LayoutDef[] = [];
