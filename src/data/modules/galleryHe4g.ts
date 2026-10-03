/**
 * College gallery demos, round 4, group G (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * Earth and geography (docs/plans/he.earth-geography.md): HC122 `atmosphereLayers` `thickness`
 * (meteorology#0, ~pressure-altitude; EG-P10).
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

export const HE4G_GALLERY_MODULES: ModuleDef[] = [thickness, pressureAltitude, thicknessDeep];

export const HE4G_GALLERY_LAYOUTS: LayoutDef[] = [];
