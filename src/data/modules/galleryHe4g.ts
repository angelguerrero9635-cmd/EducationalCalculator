/**
 * College gallery demos, round 4, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * Earth and geography (docs/plans/he.earth-geography.md): HC122 `atmosphereLayers` `thickness`
 * (meteorology#0, ~pressure-altitude; EG-P10); HC123 `adiabat` and `saturation` (meteorology#1,
 * ~humidity; EG-P11).
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

export const HE4G_GALLERY_MODULES: ModuleDef[] = [
  thickness,
  pressureAltitude,
  thicknessDeep,
  adiabat,
  adiabatHigh,
  saturation,
  saturationCold,
];

export const HE4G_GALLERY_LAYOUTS: LayoutDef[] = [];
