/**
 * College gallery demos, round 3, group L (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC68 `rayDiagram` `singleSlit`, `grating`, `thinFilm`: university-3#1 (docs/plans/he.physics.md,
 * P15). HC69 `phaseSpace`: classical-mechanics#0, #1 (P20). HC93 `wave` `em` and `line`:
 * electromagnetism#3 (P25) and engineering electromagnetics#0, #2
 * (docs/plans/he.electrical-computer.md, P11).
 */
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

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

const DEG = Math.PI / 180;
const div = (a: number, b: number) => (b === 0 || !Number.isFinite(b) ? undefined : a / b);
const asinDeg = (x: number) => (Math.abs(x) > 1 ? undefined : Math.asin(x) / DEG);
const acosDeg = (x: number) => (Math.abs(x) > 1 ? undefined : Math.acos(x) / DEG);
const root = (x: number) => (x < 0 ? undefined : Math.sqrt(x));
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
  more: Partial<VariableDef> = {},
): VariableDef => ({
  id,
  symbol,
  name,
  ...(unit ? { unit, units: [unit] } : {}),
  min,
  max,
  step,
  ...more,
});

const whole = (id: string, symbol: string, name: string, min: number, max: number) =>
  quantity(id, symbol, name, undefined, min, max, 1, { integer: true });

// ── HC68: a single slit (university-3#1~single-slit) ──

const slitDemo = (id: string, title: string, lam: number, a: number, L: number) => {
  const th = Math.asin(lam / (a * 1e6)) / DEG;
  return demo({
    id,
    title,
    use: 'Use this for the angle of the first dark fringe behind one slit and the width of the central bright band.',
    assumptions: [
      'One wavelength; the screen is far from the slit, so the rays to a point are parallel.',
      'Dark fringes where a sin θ = mλ (m = 1, 2, …); the central band runs between the first two.',
    ],
    variables: [
      quantity('lam', 'λ', 'Wavelength', 'nm', 100, 2000, 1),
      quantity('a', 'a', 'Slit width', 'mm', 0.0001, 10, 0.001),
      quantity('L', 'L', 'Screen distance', 'm', 0.01, 100, 0.01),
      quantity('th', 'θ₁', 'First dark fringe angle', '°', 0.0001, 89.99, 0.0001),
      quantity('w', 'w', 'Central band width', 'mm', 0.0001, 1e6, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'a sin θ₁ = λ',
          display: '{a} × 10⁶ × sin({th}°) = {lam}',
          vars: ['a', 'lam', 'th'],
          residual: (x) => x.a! * 1e6 * Math.sin(x.th! * DEG) - x.lam!,
          solve: {
            th: (x) => asinDeg(x.lam! / (x.a! * 1e6)),
            lam: (x) => x.a! * 1e6 * Math.sin(x.th! * DEG),
            a: (x) => div(x.lam!, 1e6 * Math.sin(x.th! * DEG)),
          },
          message: (x) =>
            x.lam! >= x.a! * 1e6
              ? 'The slit is no wider than the wavelength: there is no dark fringe.'
              : undefined,
        },
        steps: {
          th: st(
            'sin⁻¹({lam} ÷ ({a} × 10⁶))',
            'λ in nm over a in mm is λ ÷ (a × 10⁶): take the inverse sine.',
          ),
          lam: st('{a} × 10⁶ × sin({th}°)', 'Multiply the slit width (in nm) by sin θ₁.'),
          a: st('{lam} ÷ (10⁶ × sin({th}°))', 'Divide λ by sin θ₁, then turn nm into mm.'),
        },
      },
      {
        relation: {
          id: 'w = 2L tan θ₁',
          display: '{w} = 2000 × {L} × tan({th}°)',
          vars: ['w', 'L', 'th'],
          residual: (x) => x.w! - 2000 * x.L! * Math.tan(x.th! * DEG),
          solve: {
            w: (x) => 2000 * x.L! * Math.tan(x.th! * DEG),
            L: (x) => div(x.w!, 2000 * Math.tan(x.th! * DEG)),
            th: (x) => Math.atan(x.w! / (2000 * x.L!)) / DEG,
          },
        },
        steps: {
          w: st(
            '2 × {L} × tan({th}°) × 1000',
            'Twice the distance to the first dark fringe, in mm.',
          ),
          L: st('{w} ÷ (2000 × tan({th}°))', 'Divide w (in mm) by 2 tan θ₁ and by 1000 mm per m.'),
          th: st('tan⁻¹({w} ÷ (2000 × {L}))', 'Half the band over the distance is tan θ₁.'),
        },
      },
    ),
    example: { lam, a, L, th, w: 2000 * L * Math.tan(th * DEG) },
    startWith: ['lam', 'a', 'L'],
    representation: {
      kind: 'rayDiagram',
      mode: 'singleSlit',
      wavelength: 'lam',
      width: 'a',
      screen: 'L',
      angle: 'th',
      central: 'w',
    },
  });
};

const singleSlit = slitDemo(
  'g.he-rayDiagram-single-slit',
  'One slit: the first dark fringe and the central band',
  500,
  0.1,
  1.5,
);
const singleSlitNarrow = slitDemo(
  'g.he-rayDiagram-single-slit-narrow',
  'A slit four wavelengths wide: the light spreads far',
  500,
  0.002,
  1.5,
);

// ── HC68: a grating (university-3#1~grating) ──

const gratingDemo = (id: string, title: string, N: number, lam: number, m: number) => {
  const d = 1000 / N;
  return demo({
    id,
    title,
    use: 'Use this for a grating’s line spacing, the angle of each bright order and the highest order seen.',
    assumptions: [
      'Light falls square on the grating; bright orders where d sin θ = mλ.',
      'An order needs sin θ < 1, so the highest is the whole part of d ÷ λ.',
    ],
    variables: [
      quantity('N', 'N', 'Lines per millimetre', 'lines/mm', 1, 5000, 1),
      quantity('d', 'd', 'Line spacing', 'μm', 0.2, 1000, 0.0001),
      quantity('lam', 'λ', 'Wavelength', 'nm', 100, 2000, 1),
      whole('m', 'm', 'Order', -20, 20),
      quantity('th', 'θ', 'Angle of the order', '°', -89.99, 89.99, 0.01),
      { ...whole('mmax', 'm_max', 'Highest order', 0, 10000), derived: true },
    ],
    ...rules(
      {
        relation: {
          id: 'd = 1 ÷ N',
          display: '{d} = 1000 ÷ {N}',
          vars: ['d', 'N'],
          residual: (x) => x.d! * x.N! - 1000,
          solve: { d: (x) => div(1000, x.N!), N: (x) => div(1000, x.d!) },
        },
        steps: {
          d: st('1000 ÷ {N}', '1 mm is 1000 μm: share it among the lines.'),
          N: st('1000 ÷ {d}', 'How many spacings fit in 1000 μm.'),
        },
      },
      {
        relation: {
          id: 'd sin θ = mλ',
          display: '1000 × {d} × sin({th}°) = {m} × {lam}',
          vars: ['d', 'th', 'm', 'lam'],
          residual: (x) => x.d! * 1000 * Math.sin(x.th! * DEG) - x.m! * x.lam!,
          solve: {
            th: (x) => asinDeg((x.m! * x.lam!) / (1000 * x.d!)),
            lam: (x) => div(1000 * x.d! * Math.sin(x.th! * DEG), x.m!),
          },
          message: (x) =>
            Math.abs(x.m! * x.lam!) >= 1000 * x.d!
              ? 'This order needs sin θ past 1: the grating sends no beam there.'
              : undefined,
        },
        steps: {
          th: st(
            'sin⁻¹({m} × {lam} ÷ (1000 × {d}))',
            'sin θ = mλ ÷ d, with d in nm (1000 nm per μm).',
          ),
          lam: st('1000 × {d} × sin({th}°) ÷ {m}', 'λ = d sin θ ÷ m, d turned to nm.'),
        },
      },
      {
        relation: {
          id: 'm_max = ⌊d ÷ λ⌋',
          display: '{mmax} = ⌊1000 × {d} ÷ {lam}⌋',
          vars: ['mmax', 'd', 'lam'],
          residual: (x) => x.mmax! - Math.floor((1000 * x.d!) / x.lam! + 1e-9),
          solve: { mmax: (x) => Math.floor((1000 * x.d!) / x.lam! + 1e-9) },
        },
        steps: {
          mmax: st(
            '⌊1000 × {d} ÷ {lam}⌋',
            'The whole part of d ÷ λ (d in nm): one more would need sin θ ≥ 1.',
          ),
        },
      },
    ),
    example: {
      N,
      d,
      lam,
      m,
      th: Math.asin((m * lam) / (1000 * d)) / DEG,
      mmax: Math.floor((1000 * d) / lam + 1e-9),
    },
    startWith: ['N', 'lam', 'm'],
    representation: {
      kind: 'rayDiagram',
      mode: 'grating',
      wavelength: 'lam',
      lines: 'N',
      spacing: 'd',
      order: 'm',
      angle: 'th',
      highest: 'mmax',
    },
  });
};

const grating = gratingDemo(
  'g.he-rayDiagram-grating',
  'A grating of 600 lines/mm: every order of green light',
  600,
  500,
  2,
);
const gratingFine = gratingDemo(
  'g.he-rayDiagram-grating-fine',
  'A fine grating and red light: only the first order fits',
  1200,
  700,
  1,
);

// ── HC68: a thin film (university-3#1~thin-film) ──

const filmDemo = (
  id: string,
  title: string,
  n: number,
  t: number,
  m: number,
  flips: 'one' | 'both',
  below?: number,
) => {
  const half = flips === 'one';
  const k = half ? m + 0.5 : m;
  return demo({
    id,
    title,
    use: half
      ? 'Use this for the color a thin film in air reflects most strongly, or the least thickness for a color.'
      : 'Use this for a coating on glass, where both reflections flip, and the color it reflects most.',
    assumptions: half
      ? [
          'Light falls nearly square on a film in air: only the top reflection flips by half a wave.',
          'Bright when 2nt = (m + ½)λ; with both or neither flipping it is 2nt = mλ.',
        ]
      : [
          'The coating’s index is between air’s and the glass’s, so both reflections flip and cancel.',
          'Bright when 2nt = mλ (m = 1, 2, …); with one flip it would be 2nt = (m + ½)λ.',
        ],
    variables: [
      quantity('n', 'n', 'Film index', undefined, 1, 3, 0.01),
      quantity('t', 't', 'Thickness', 'nm', 1, 100000, 0.1),
      whole('m', 'm', 'Order', half ? 0 : 1, 10),
      quantity('lam', 'λ', 'Reflected bright wavelength', 'nm', 10, 1e6, 0.1),
    ],
    ...rules({
      relation: {
        id: half ? '2nt = (m + ½)λ' : '2nt = mλ',
        display: half ? '2 × {n} × {t} = ({m} + ½) × {lam}' : '2 × {n} × {t} = {m} × {lam}',
        vars: ['n', 't', 'm', 'lam'],
        residual: (x) => 2 * x.n! * x.t! - (half ? x.m! + 0.5 : x.m!) * x.lam!,
        solve: {
          lam: (x) => div(2 * x.n! * x.t!, half ? x.m! + 0.5 : x.m!),
          t: (x) => div((half ? x.m! + 0.5 : x.m!) * x.lam!, 2 * x.n!),
          n: (x) => div((half ? x.m! + 0.5 : x.m!) * x.lam!, 2 * x.t!),
        },
      },
      steps: half
        ? {
            lam: st('2 × {n} × {t} ÷ ({m} + ½)', 'The extra path 2nt holds m + ½ wavelengths.'),
            t: st('({m} + ½) × {lam} ÷ (2 × {n})', 'Divide m + ½ wavelengths by 2n.'),
            n: st('({m} + ½) × {lam} ÷ (2 × {t})', 'Divide m + ½ wavelengths by 2t.'),
          }
        : {
            lam: st('2 × {n} × {t} ÷ {m}', 'The extra path 2nt holds m whole wavelengths.'),
            t: st('{m} × {lam} ÷ (2 × {n})', 'Divide m wavelengths by 2n.'),
            n: st('{m} × {lam} ÷ (2 × {t})', 'Divide m wavelengths by 2t.'),
          },
    }),
    example: { n, t, m, lam: (2 * n * t) / k },
    startWith: ['n', 't', 'm'],
    representation: {
      kind: 'rayDiagram',
      mode: 'thinFilm',
      index: 'n',
      thickness: 't',
      order: 'm',
      wavelength: 'lam',
      flips,
      ...(below !== undefined ? { below } : {}),
    },
  });
};

const thinFilm = filmDemo(
  'g.he-rayDiagram-thin-film',
  'A soap film 100 nm thick: the color it reflects',
  1.33,
  100,
  0,
  'one',
);
const thinFilmCoating = filmDemo(
  'g.he-rayDiagram-thin-film-coating',
  'A coating on glass: both reflections flip',
  1.38,
  400,
  2,
  'both',
  1.52,
);

// ── HC69: the oscillator in phase space (classical-mechanics#1) ──

const oscDemo = (id: string, title: string, m: number, k: number, x: number, p: number) => {
  const H = (p * p) / (2 * m) + 0.5 * k * x * x;
  const w = Math.sqrt(k / m);
  return demo({
    id,
    title,
    use: 'Use this for a harmonic oscillator’s energy, Hamilton’s equations at a point and the area of its phase-space ellipse.',
    assumptions: [
      'H = p² ÷ 2m + ½kx² is the total energy and is conserved, so the point stays on one ellipse.',
      'Hamilton’s equations give the flow: ẋ = ∂H/∂p, ṗ = −∂H/∂x; the half-widths are √(2H ÷ k) and √(2mH).',
    ],
    variables: [
      quantity('m', 'm', 'Mass', 'kg', 0.001, 1000, 0.001),
      quantity('k', 'k', 'Spring constant', 'N/m', 0.001, 10000, 0.001),
      quantity('x', 'x', 'Position', 'm', -100, 100, 0.001),
      quantity('p', 'p', 'Momentum', 'kg·m/s', -1000, 1000, 0.001),
      quantity('H', 'H', 'Energy', 'J', 0, 1e9, 0.001),
      quantity('xd', 'ẋ', 'Velocity', 'm/s', -1e6, 1e6, 0.001),
      quantity('pd', 'ṗ', 'Force', 'N', -1e9, 1e9, 0.001),
      quantity('w', 'ω', 'Angular frequency', 'rad/s', 0.0001, 1e5, 0.0001),
      quantity('A', '𝒜', 'Phase-space area', 'J·s', 0, 1e13, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'H = p² ÷ 2m + ½kx²',
          display: '{H} = {p}² ÷ (2 × {m}) + ½ × {k} × {x}²',
          vars: ['H', 'p', 'm', 'k', 'x'],
          residual: (v) => v.H! - v.p! ** 2 / (2 * v.m!) - 0.5 * v.k! * v.x! ** 2,
          solve: {
            H: (v) => v.p! ** 2 / (2 * v.m!) + 0.5 * v.k! * v.x! ** 2,
            k: (v) => div(2 * (v.H! - v.p! ** 2 / (2 * v.m!)), v.x! ** 2),
          },
        },
        steps: {
          H: st(
            '{p}² ÷ (2 × {m}) + ½ × {k} × {x}²',
            'Kinetic energy p² ÷ 2m plus the spring’s ½kx².',
          ),
          k: st(
            '2 × ({H} − {p}² ÷ (2 × {m})) ÷ {x}²',
            'Take the kinetic part from H; the rest is ½kx².',
          ),
        },
      },
      {
        relation: {
          id: 'ẋ = ∂H/∂p',
          display: '{xd} = {p} ÷ {m}',
          vars: ['xd', 'p', 'm'],
          residual: (v) => v.xd! * v.m! - v.p!,
          solve: {
            xd: (v) => div(v.p!, v.m!),
            p: (v) => v.xd! * v.m!,
            m: (v) => div(v.p!, v.xd!),
          },
        },
        steps: {
          xd: st('{p} ÷ {m}', '∂H/∂p of p² ÷ 2m is p ÷ m.'),
          p: st('{xd} × {m}', 'Momentum is mass times velocity: p = mẋ.'),
          m: st('{p} ÷ {xd}', 'Divide the momentum by the velocity.'),
        },
      },
      {
        relation: {
          id: 'ṗ = −∂H/∂x',
          display: '{pd} = −{k} × {x}',
          vars: ['pd', 'k', 'x'],
          residual: (v) => v.pd! + v.k! * v.x!,
          solve: { pd: (v) => -v.k! * v.x!, x: (v) => div(-v.pd!, v.k!) },
        },
        steps: {
          pd: st('−{k} × {x}', '∂H/∂x of ½kx² is kx; ṗ is its negative.'),
          x: st('−{pd} ÷ {k}', 'The spring’s pull −kx is ṗ: x = −ṗ ÷ k.'),
        },
      },
      {
        relation: {
          id: 'ω = √(k ÷ m)',
          display: '{w} = √({k} ÷ {m})',
          vars: ['w', 'k', 'm'],
          residual: (v) => v.w! ** 2 * v.m! - v.k!,
          solve: {
            w: (v) => root(v.k! / v.m!),
            k: (v) => v.w! ** 2 * v.m!,
            m: (v) => div(v.k!, v.w! ** 2),
          },
        },
        steps: {
          w: st('√({k} ÷ {m})', 'The oscillator’s angular frequency.'),
          k: st('{w}² × {m}', 'Solve ω² = k ÷ m for the spring constant.'),
          m: st('{k} ÷ {w}²', 'Solve ω² = k ÷ m for the mass.'),
        },
      },
      {
        relation: {
          id: '𝒜 = 2πH ÷ ω',
          display: '{A} = 2π × {H} ÷ {w}',
          vars: ['A', 'H', 'w'],
          residual: (v) => v.A! * v.w! - 2 * Math.PI * v.H!,
          solve: {
            A: (v) => div(2 * Math.PI * v.H!, v.w!),
            H: (v) => (v.A! * v.w!) / (2 * Math.PI),
            w: (v) => div(2 * Math.PI * v.H!, v.A!),
          },
        },
        steps: {
          A: st('2π × {H} ÷ {w}', 'The ellipse’s area π × √(2H ÷ k) × √(2mH) is 2πH ÷ ω.'),
          H: st('{A} × {w} ÷ (2π)', 'Solve 𝒜 = 2πH ÷ ω for the energy.'),
          w: st('2π × {H} ÷ {A}', 'Solve 𝒜 = 2πH ÷ ω for the angular frequency.'),
        },
      },
    ),
    example: { m, k, x, p, H, xd: p / m, pd: -k * x, w, A: (2 * Math.PI * H) / w },
    startWith: ['m', 'k', 'x', 'p'],
    representation: {
      kind: 'phaseSpace',
      system: 'oscillator',
      mass: 'm',
      spring: 'k',
      position: 'x',
      momentum: 'p',
      energy: 'H',
      velocity: 'xd',
      force: 'pd',
      omega: 'w',
      area: 'A',
    },
  });
};

const oscillator = oscDemo(
  'g.he-phaseSpace-oscillator',
  'A 2 kg oscillator in phase space: H, the flow and the area',
  2,
  8,
  0.5,
  2,
);
const oscillatorStiff = oscDemo(
  'g.he-phaseSpace-oscillator-stiff',
  'A light mass on a stiff spring, left of center and moving right',
  0.05,
  200,
  -0.1,
  0.3,
);

// ── HC69: the pendulum's phase portrait (classical-mechanics#1~pendulum-phase) ──

const pendDemo = (id: string, title: string, m: number, L: number, w0: number, g: number) => {
  const E = 0.5 * m * L * L * w0 * w0;
  return demo({
    id,
    title,
    use: 'Use this for whether a pendulum swings or goes over the top, and how far it swings.',
    assumptions: [
      'A point mass on a light rigid rod, no friction; θ is measured from the bottom.',
      'E is the energy above the bottom; the separatrix E_s = 2mgL just reaches the top.',
    ],
    variables: [
      quantity('m', 'm', 'Mass', 'kg', 0.001, 1000, 0.001),
      quantity('L', 'L', 'Length', 'm', 0.01, 100, 0.01),
      quantity('w0', 'ω₀', 'Speed at the bottom', 'rad/s', 0.001, 1000, 0.001),
      quantity('g', 'g', 'Gravity', 'm/s²', 0.1, 100, 0.01),
      quantity('E', 'E', 'Energy', 'J', 0.0001, 1e9, 0.001),
      quantity('Es', 'E_s', 'Separatrix energy', 'J', 0.0001, 1e9, 0.001),
      quantity('thm', 'θ_max', 'Largest angle', '°', 0.0001, 180, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'E = ½mL²ω₀²',
          display: '{E} = ½ × {m} × {L}² × {w0}²',
          vars: ['E', 'm', 'L', 'w0'],
          residual: (v) => v.E! - 0.5 * v.m! * v.L! ** 2 * v.w0! ** 2,
          solve: {
            E: (v) => 0.5 * v.m! * v.L! ** 2 * v.w0! ** 2,
            w0: (v) => root((2 * v.E!) / (v.m! * v.L! ** 2)),
          },
        },
        steps: {
          E: st('½ × {m} × {L}² × {w0}²', 'All kinetic at the bottom: ½Iω² with I = mL².'),
          w0: st('√(2 × {E} ÷ ({m} × {L}²))', 'Solve ½mL²ω₀² = E for ω₀.'),
        },
      },
      {
        relation: {
          id: 'E_s = 2mgL',
          display: '{Es} = 2 × {m} × {g} × {L}',
          vars: ['Es', 'm', 'g', 'L'],
          residual: (v) => v.Es! - 2 * v.m! * v.g! * v.L!,
          solve: { Es: (v) => 2 * v.m! * v.g! * v.L! },
        },
        steps: { Es: st('2 × {m} × {g} × {L}', 'The energy to lift the bob 2L, to the top.') },
      },
      {
        relation: {
          id: 'cos θ_max = 1 − E ÷ mgL',
          display: 'cos({thm}°) = 1 − {E} ÷ ({m} × {g} × {L})',
          vars: ['thm', 'E', 'm', 'g', 'L'],
          residual: (v) => Math.cos(v.thm! * DEG) - 1 + v.E! / (v.m! * v.g! * v.L!),
          solve: {
            thm: (v) => acosDeg(1 - v.E! / (v.m! * v.g! * v.L!)),
            E: (v) => v.m! * v.g! * v.L! * (1 - Math.cos(v.thm! * DEG)),
          },
          message: (v) =>
            v.E! >= 2 * v.m! * v.g! * v.L!
              ? 'E is at least E_s: the pendulum goes over the top, so there is no largest angle.'
              : undefined,
        },
        steps: {
          thm: st(
            'cos⁻¹(1 − {E} ÷ ({m} × {g} × {L}))',
            'At θ_max all of E is height: mgL(1 − cos θ).',
          ),
          E: st('{m} × {g} × {L} × (1 − cos({thm}°))', 'The height gained, mgL(1 − cos θ_max).'),
        },
      },
    ),
    example: {
      m,
      L,
      w0,
      g,
      E,
      Es: 2 * m * g * L,
      thm: Math.acos(1 - E / (m * g * L)) / DEG,
    },
    startWith: ['m', 'L', 'w0', 'g'],
    representation: {
      kind: 'phaseSpace',
      system: 'pendulum',
      mass: 'm',
      length: 'L',
      speed: 'w0',
      g: 'g',
      energy: 'E',
      separatrix: 'Es',
      amplitude: 'thm',
    },
  });
};

const pendulum = pendDemo(
  'g.he-phaseSpace-pendulum',
  'A pendulum’s phase portrait: a swing of 106°',
  1,
  1,
  5,
  9.8,
);
const pendulumNearTop = pendDemo(
  'g.he-phaseSpace-pendulum-near-top',
  'Just under the separatrix: a swing of 164°',
  1,
  1,
  6.2,
  9.8,
);

// ── HC69: a bead on a spinning hoop (classical-mechanics#0~bead-hoop) ──

const hoopDemo = (id: string, title: string, R: number, w: number, g: number) => {
  const wc = Math.sqrt(g / R);
  const th0 = w > wc ? Math.acos(g / (w * w * R)) / DEG : 0;
  const Om = w > wc ? w * Math.sin(th0 * DEG) : Math.sqrt(wc * wc - w * w);
  const above = (v: Values) => v.w! > v.wc!;
  return demo({
    id,
    title,
    use: 'Use this for where a bead rests on a hoop spun about its vertical diameter and how fast it rocks about that point.',
    assumptions: [
      'The hoop spins at a steady ω; the bead slides without friction; θ is from the bottom.',
      'U_eff = mgR(1 − cos θ) − ½mω²R² sin² θ: the bead rests at its minimum, off the bottom only when ω > ω_c.',
    ],
    variables: [
      quantity('R', 'R', 'Hoop radius', 'm', 0.01, 100, 0.01),
      quantity('w', 'ω', 'Spin', 'rad/s', 0.01, 1000, 0.01),
      quantity('g', 'g', 'Gravity', 'm/s²', 0.1, 100, 0.01),
      quantity('wc', 'ω_c', 'Critical spin', 'rad/s', 0.01, 1000, 0.001),
      quantity('th0', 'θ₀', 'Resting angle', '°', 0, 90, 0.01),
      quantity('Om', 'Ω', 'Small-oscillation frequency', 'rad/s', 0, 1000, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'ω_c = √(g ÷ R)',
          display: '{wc} = √({g} ÷ {R})',
          vars: ['wc', 'g', 'R'],
          residual: (v) => v.wc! ** 2 * v.R! - v.g!,
          solve: { wc: (v) => root(v.g! / v.R!), R: (v) => div(v.g!, v.wc! ** 2) },
        },
        steps: {
          wc: st('√({g} ÷ {R})', 'Below this spin the bottom stays the lowest point of U_eff.'),
          R: st('{g} ÷ {wc}²', 'Solve ω_c² = g ÷ R for the radius.'),
        },
      },
      {
        relation: {
          id: 'cos θ₀ = ω_c² ÷ ω²',
          display: 'cos({th0}°) = {wc}² ÷ {w}²',
          vars: ['th0', 'wc', 'w'],
          residual: (v) => (above(v) ? Math.cos(v.th0! * DEG) - v.wc! ** 2 / v.w! ** 2 : v.th0!),
          solve: {
            th0: (v) => (above(v) ? acosDeg(v.wc! ** 2 / v.w! ** 2) : 0),
            wc: (v) => (v.th0! > 0 ? v.w! * Math.sqrt(Math.cos(v.th0! * DEG)) : undefined),
          },
          check: (v) =>
            above(v)
              ? `cos(${formatNumber(v.th0!)}°) = ${formatNumber(v.wc!)}² ÷ ${formatNumber(v.w!)}²`
              : `${formatNumber(v.th0!)} = 0`,
        },
        steps: {
          th0: {
            expr: (v) => (above(v) ? 'cos⁻¹({wc}² ÷ {w}²)' : '0'),
            how: (v) =>
              above(v)
                ? 'Above ω_c, dU_eff/dθ = 0 off the bottom where cos θ₀ = g ÷ ω²R = ω_c² ÷ ω².'
                : 'At or below ω_c the bottom is the minimum: θ₀ = 0.',
          },
          wc: st('{w} × √(cos({th0}°))', 'Solve cos θ₀ = ω_c² ÷ ω² for the critical spin.'),
        },
      },
      {
        relation: {
          id: 'Ω',
          display: '{Om} = √({w}² − {wc}⁴ ÷ {w}²)',
          vars: ['Om', 'w', 'wc'],
          // Above ω_c: Ω = ω sin θ₀ with sin² θ₀ = 1 − (ω_c ÷ ω)⁴. Below: √(ω_c² − ω²).
          residual: (v) =>
            above(v)
              ? v.Om! ** 2 - (v.w! ** 2 - v.wc! ** 4 / v.w! ** 2)
              : v.Om! ** 2 - (v.wc! ** 2 - v.w! ** 2),
          solve: {
            Om: (v) =>
              above(v) ? root(v.w! ** 2 - v.wc! ** 4 / v.w! ** 2) : root(v.wc! ** 2 - v.w! ** 2),
          },
          check: (v) =>
            above(v)
              ? `${formatNumber(v.Om!)} = √(${formatNumber(v.w!)}² − ${formatNumber(v.wc!)}⁴ ÷ ${formatNumber(v.w!)}²)`
              : `${formatNumber(v.Om!)} = √(${formatNumber(v.wc!)}² − ${formatNumber(v.w!)}²)`,
        },
        steps: {
          Om: {
            expr: (v) => (above(v) ? '√({w}² − {wc}⁴ ÷ {w}²)' : '√({wc}² − {w}²)'),
            how: (v) =>
              above(v)
                ? 'Above ω_c the bead rocks about θ₀ at Ω = ω sin θ₀, and sin² θ₀ = 1 − (ω_c ÷ ω)⁴.'
                : 'Below ω_c it rocks about the bottom at Ω = √(ω_c² − ω²).',
          },
        },
      },
    ),
    example: { R, w, g, wc, th0, Om },
    startWith: ['R', 'w', 'g'],
    representation: {
      kind: 'phaseSpace',
      system: 'hoop',
      radius: 'R',
      spin: 'w',
      g: 'g',
      critical: 'wc',
      angle: 'th0',
      frequency: 'Om',
    },
  });
};

const hoop = hoopDemo(
  'g.he-phaseSpace-hoop',
  'A bead on a hoop spun at 10 rad/s: where it rests',
  0.2,
  10,
  9.8,
);
const hoopNearCritical = hoopDemo(
  'g.he-phaseSpace-hoop-near-critical',
  'Just above the critical spin: the bead sits low on the hoop',
  0.2,
  7.5,
  9.8,
);

// ── HC93: a plane wave's fields (electromagnetism#3) ──

/** The physics pages' c and ε₀ (the page's own constants, shown in its steps). */
const C_P = 2.998e8;
const EPS_P = 8.854e-12;

const emSun = (() => {
  const I = 1361;
  const E0 = Math.sqrt((2 * I) / (C_P * EPS_P));
  return demo({
    id: 'g.he-wave-em',
    title: 'Sunlight at Earth: E₀, B₀ and the light’s pressure',
    use: 'Use this for a plane wave’s field amplitudes from its intensity, and its push on an absorber or a mirror.',
    assumptions: [
      'In vacuum, E ⟂ B ⟂ the direction of travel; c = 2.998 × 10⁸ m/s, ε₀ = 8.854 × 10⁻¹² F/m.',
      'I is the time-averaged Poynting vector, S = E × B ÷ μ₀.',
    ],
    variables: [
      // Each range sits inside what the one before allows, so no value can push another out.
      quantity('E0', 'E₀', 'Field amplitude', 'V/m', 1e-4, 1e9, 0.01),
      quantity('I', 'I', 'Intensity', 'W/m²', 1e-6, 1e12, 0.01),
      quantity('B0', 'B₀', 'Magnetic amplitude', 'μT', 1e-4, 9e4, 0.001),
      quantity('Pa', 'P_a', 'Pressure on an absorber', 'μPa', 1e-8, 3e9, 0.001),
      quantity('Pr', 'P_r', 'Pressure on a mirror', 'μPa', 2e-8, 6e9, 0.001),
    ],
    ...rules(
      {
        relation: {
          id: 'I = ½cε₀E₀²',
          display: '{I} = ½ × 2.998 × 10⁸ × 8.854 × 10⁻¹² × {E0}²',
          vars: ['I', 'E0'],
          residual: (v) => v.I! - 0.5 * C_P * EPS_P * v.E0! ** 2,
          solve: {
            I: (v) => 0.5 * C_P * EPS_P * v.E0! ** 2,
            E0: (v) => root((2 * v.I!) / (C_P * EPS_P)),
          },
        },
        steps: {
          I: st('½ × 2.998 × 10⁸ × 8.854 × 10⁻¹² × {E0}²', 'The time-averaged Poynting vector.'),
          E0: st('√(2 × {I} ÷ (2.998 × 10⁸ × 8.854 × 10⁻¹²))', 'Solve I = ½cε₀E₀² for E₀.'),
        },
      },
      {
        relation: {
          id: 'B₀ = E₀ ÷ c',
          display: '{B0} = {E0} ÷ (2.998 × 10⁸) × 10⁶',
          vars: ['B0', 'E0'],
          residual: (v) => v.B0! * 1e-6 * C_P - v.E0!,
          solve: { B0: (v) => (v.E0! / C_P) * 1e6, E0: (v) => v.B0! * 1e-6 * C_P },
        },
        steps: {
          B0: st('{E0} ÷ (2.998 × 10⁸) × 10⁶', 'Divide by c, then write tesla in μT.'),
          E0: st('{B0} × 10⁻⁶ × 2.998 × 10⁸', 'Turn μT into T and multiply by c.'),
        },
      },
      {
        relation: {
          id: 'P_a = I ÷ c',
          display: '{Pa} = {I} ÷ (2.998 × 10⁸) × 10⁶',
          vars: ['Pa', 'I'],
          residual: (v) => v.Pa! * 1e-6 * C_P - v.I!,
          solve: { Pa: (v) => (v.I! / C_P) * 1e6, I: (v) => v.Pa! * 1e-6 * C_P },
        },
        steps: {
          Pa: st(
            '{I} ÷ (2.998 × 10⁸) × 10⁶',
            'An absorber takes the light’s momentum: I ÷ c, in μPa.',
          ),
          I: st('{Pa} × 10⁻⁶ × 2.998 × 10⁸', 'Turn μPa into Pa and multiply by c.'),
        },
      },
      {
        relation: {
          id: 'P_r = 2I ÷ c',
          display: '{Pr} = 2 × {I} ÷ (2.998 × 10⁸) × 10⁶',
          vars: ['Pr', 'I'],
          residual: (v) => v.Pr! * 1e-6 * C_P - 2 * v.I!,
          solve: { Pr: (v) => ((2 * v.I!) / C_P) * 1e6 },
        },
        steps: {
          Pr: st('2 × {I} ÷ (2.998 × 10⁸) × 10⁶', 'A mirror sends the light back: twice the push.'),
        },
      },
    ),
    example: {
      I,
      E0,
      B0: (E0 / C_P) * 1e6,
      Pa: (I / C_P) * 1e6,
      Pr: ((2 * I) / C_P) * 1e6,
    },
    startWith: ['I'],
    representation: {
      kind: 'wave',
      em: { amplitude: 'E0', magnetic: 'B0', intensity: 'I' },
    },
  });
})();

// ── HC93: a plane wave in a dielectric (engineering electromagnetics#2) ──

/** The engineering pages' c and η₀. */
const C_E = 3e8;
const ETA0_E = 376.7;

const emDielectric = (() => {
  const [f, er, E0] = [3, 4, 10];
  const v = C_E / Math.sqrt(er);
  const eta = ETA0_E / Math.sqrt(er);
  return demo({
    id: 'g.he-wave-em-dielectric',
    title: 'A 3 GHz wave in a dielectric: λ, η, H₀ and S',
    use: 'Use this for a plane wave in a dielectric (3 GHz with ε_r = 4, say): its speed, λ, η, H₀ and power density.',
    assumptions: [
      'A uniform plane wave in a lossless, nonmagnetic medium (μ_r = 1).',
      'c = 3 × 10⁸ m/s and η₀ = 376.7 Ω in vacuum; E and H are in step and square to each other.',
    ],
    variables: [
      quantity('f', 'f', 'Frequency', 'GHz', 1e-9, 1e6, 0.001),
      quantity('er', 'ε_r', 'Relative permittivity', undefined, 1, 100, 0.01),
      quantity('v', 'v', 'Speed', 'm/s', 1e6, 3e8, 1, { scientific: true }),
      quantity('lam', 'λ', 'Wavelength', 'cm', 1e-6, 1e12, 0.001),
      quantity('eta', 'η', 'Wave impedance', 'Ω', 1, 400, 0.01),
      quantity('E0', 'E₀', 'E amplitude', 'V/m', 1e-9, 1e9, 0.01),
      quantity('H0', 'H₀', 'H amplitude', 'mA/m', 1e-9, 1e12, 0.01),
      quantity('S', 'S', 'Power density', 'W/m²', 1e-12, 1e12, 0.0001),
    ],
    ...rules(
      {
        relation: {
          id: 'v = c ÷ √ε_r',
          display: '{v} = 3 × 10⁸ ÷ √({er})',
          vars: ['v', 'er'],
          residual: (x) => x.v! * Math.sqrt(x.er!) - C_E,
          solve: { v: (x) => C_E / Math.sqrt(x.er!), er: (x) => (C_E / x.v!) ** 2 },
        },
        steps: {
          v: st('3 × 10⁸ ÷ √({er})', 'Light slows by √ε_r in the medium.'),
          er: st('(3 × 10⁸ ÷ {v})²', 'Square how many times slower than c it travels.'),
        },
      },
      {
        relation: {
          id: 'λ = v ÷ f',
          display: '{lam} = {v} ÷ ({f} × 10⁹) × 100',
          vars: ['lam', 'v', 'f'],
          residual: (x) => x.lam! * 1e-2 * x.f! * 1e9 - x.v!,
          solve: {
            lam: (x) => div(x.v!, x.f! * 1e9 * 1e-2),
            f: (x) => div(x.v!, x.lam! * 1e-2 * 1e9),
          },
        },
        steps: {
          lam: st('{v} ÷ ({f} × 10⁹) × 100', 'f in Hz; λ = v ÷ f in m, then in cm.'),
          f: st('{v} ÷ ({lam} ÷ 100) ÷ 10⁹', 'f = v ÷ λ (λ in m), in GHz.'),
        },
      },
      {
        relation: {
          id: 'η = η₀ ÷ √ε_r',
          display: '{eta} = 376.7 ÷ √({er})',
          vars: ['eta', 'er'],
          residual: (x) => x.eta! * Math.sqrt(x.er!) - ETA0_E,
          solve: { eta: (x) => ETA0_E / Math.sqrt(x.er!) },
        },
        steps: { eta: st('376.7 ÷ √({er})', 'The vacuum’s η₀ = 376.7 Ω, smaller by √ε_r.') },
      },
      {
        relation: {
          id: 'H₀ = E₀ ÷ η',
          display: '{H0} = {E0} ÷ {eta} × 1000',
          vars: ['H0', 'E0', 'eta'],
          residual: (x) => x.H0! * 1e-3 * x.eta! - x.E0!,
          solve: { H0: (x) => div(x.E0! * 1e3, x.eta!), E0: (x) => x.H0! * 1e-3 * x.eta! },
        },
        steps: {
          H0: st('{E0} ÷ {eta} × 1000', 'H₀ = E₀ ÷ η in A/m, then in mA/m.'),
          E0: st('{H0} ÷ 1000 × {eta}', 'E₀ = ηH₀, with H₀ turned into A/m.'),
        },
      },
      {
        relation: {
          id: 'S = E₀² ÷ 2η',
          display: '{S} = {E0}² ÷ (2 × {eta})',
          vars: ['S', 'E0', 'eta'],
          residual: (x) => x.S! * 2 * x.eta! - x.E0! ** 2,
          solve: { S: (x) => div(x.E0! ** 2, 2 * x.eta!), E0: (x) => root(2 * x.eta! * x.S!) },
        },
        steps: {
          S: st('{E0}² ÷ (2 × {eta})', 'The time-averaged power density.'),
          E0: st('√(2 × {eta} × {S})', 'Solve S = E₀² ÷ 2η for E₀.'),
        },
      },
    ),
    example: {
      f,
      er,
      v,
      lam: (v / (f * 1e9)) * 100,
      eta,
      E0,
      H0: (E0 / eta) * 1e3,
      S: (E0 * E0) / (2 * eta),
    },
    startWith: ['f', 'er', 'E0'],
    representation: {
      kind: 'wave',
      em: {
        field: 'H',
        amplitude: 'E0',
        magnetic: 'H0',
        wavelength: 'lam',
        speed: 'v',
        impedance: 'eta',
        intensity: 'S',
      },
    },
  });
})();

// ── HC93: a standing wave on a line (engineering electromagnetics#0) ──

const lineDemo = (id: string, title: string, z0: number, rl: number) => {
  const G = (rl - z0) / (rl + z0);
  const a = Math.abs(G);
  return demo({
    id,
    title,
    use: 'Use this for a line ending in a resistive load (50 Ω into 100 Ω, say): Γ, the VSWR, the return loss and the power reflected.',
    assumptions: [
      'A lossless line and a resistive load; Γ = 0 means matched, +1 open and −1 shorted.',
      'The wave sent and the wave reflected add to a standing wave: V_max = 1 + |Γ|, V_min = 1 − |Γ| (per |V⁺|).',
    ],
    variables: [
      quantity('Z0', 'Z₀', 'Line impedance', 'Ω', 1, 1000, 0.1),
      quantity('RLd', 'R_L', 'Load', 'Ω', 0.001, 1e6, 0.1),
      quantity('G', 'Γ', 'Reflection coefficient', undefined, -1, 1, 0.0001),
      quantity('S', 'VSWR', 'Standing-wave ratio', undefined, 1, 1e6, 0.001),
      quantity('RL', 'RL', 'Return loss', 'dB', 0.0001, 200, 0.01),
      quantity('sh', 'share', 'Power reflected', '%', 0.0001, 100, 0.01),
    ],
    ...rules(
      {
        relation: {
          id: 'Γ = (R_L − Z₀) ÷ (R_L + Z₀)',
          display: '{G} = ({RLd} − {Z0}) ÷ ({RLd} + {Z0})',
          vars: ['G', 'RLd', 'Z0'],
          residual: (x) => x.G! * (x.RLd! + x.Z0!) - (x.RLd! - x.Z0!),
          solve: {
            G: (x) => div(x.RLd! - x.Z0!, x.RLd! + x.Z0!),
            RLd: (x) => div(x.Z0! * (1 + x.G!), 1 - x.G!),
            Z0: (x) => div(x.RLd! * (1 - x.G!), 1 + x.G!),
          },
        },
        steps: {
          G: st('({RLd} − {Z0}) ÷ ({RLd} + {Z0})', 'The share of the voltage wave sent back.'),
          RLd: st('{Z0} × (1 + {G}) ÷ (1 − {G})', 'Solve for the load.'),
          Z0: st('{RLd} × (1 − {G}) ÷ (1 + {G})', 'Solve for the line.'),
        },
      },
      {
        relation: {
          id: 'VSWR = (1 + |Γ|) ÷ (1 − |Γ|)',
          display: '{S} = (1 + |{G}|) ÷ (1 − |{G}|)',
          vars: ['S', 'G'],
          residual: (x) => x.S! * (1 - Math.abs(x.G!)) - (1 + Math.abs(x.G!)),
          solve: { S: (x) => div(1 + Math.abs(x.G!), 1 - Math.abs(x.G!)) },
        },
        steps: { S: st('(1 + |{G}|) ÷ (1 − |{G}|)', 'V_max ÷ V_min on the line.') },
      },
      {
        relation: {
          id: 'RL = −20 log₁₀|Γ|',
          display: '{RL} = −20 × log₁₀(|{G}|)',
          vars: ['RL', 'G'],
          residual: (x) => x.RL! + 20 * Math.log10(Math.abs(x.G!)),
          solve: { RL: (x) => (x.G === 0 ? undefined : -20 * Math.log10(Math.abs(x.G!))) },
        },
        steps: {
          RL: st('−20 × log₁₀(|{G}|)', 'How far below the sent wave the reflection is, in dB.'),
        },
      },
      {
        relation: {
          id: 'share = Γ²',
          display: '{sh} = 100 × {G}²',
          vars: ['sh', 'G'],
          residual: (x) => x.sh! - 100 * x.G! ** 2,
          solve: { sh: (x) => 100 * x.G! ** 2 },
        },
        steps: {
          sh: st('100 × {G}²', 'Power goes as the square of the voltage: Γ², as a percent.'),
        },
      },
    ),
    example: {
      Z0: z0,
      RLd: rl,
      G,
      S: (1 + a) / (1 - a),
      RL: -20 * Math.log10(a),
      sh: 100 * G * G,
    },
    startWith: ['Z0', 'RLd'],
    representation: {
      kind: 'wave',
      line: {
        gamma: 'G',
        vswr: 'S',
        impedance: 'Z0',
        load: 'RLd',
        returnLoss: 'RL',
        share: 'sh',
      },
    },
  });
};

const lineMismatch = lineDemo(
  'g.he-wave-line',
  'A 50 Ω line into 100 Ω: Γ, the VSWR and the standing wave',
  50,
  100,
);
const lineLowLoad = lineDemo(
  'g.he-wave-line-low-load',
  'A 50 Ω line into 5 Ω: a minimum at the load, VSWR 10',
  50,
  5,
);

export const HE3L_GALLERY_MODULES: ModuleDef[] = [
  singleSlit,
  singleSlitNarrow,
  grating,
  gratingFine,
  thinFilm,
  thinFilmCoating,
  oscillator,
  oscillatorStiff,
  pendulum,
  pendulumNearTop,
  hoop,
  hoopNearCritical,
  emSun,
  emDielectric,
  lineMismatch,
  lineLowLoad,
];

export const HE3L_GALLERY_LAYOUTS: LayoutDef[] = [];
