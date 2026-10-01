/**
 * Grades 9–12 round 2 gallery demos (group H2C: physics (H102); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { Relation, Values, VariableDef } from '@/engine/types';

import { atLeast } from './helpers';
import type { LayoutDef } from './layouts';
import type { ModuleDef, StepText } from './types';

// ─── Helpers (the Grade 11 file's, kept here so a demo promotes as it is) ────

/** A relation and its step text, built together so a demo lists both from one place. */
interface Rule {
  relation: Relation;
  steps: Record<string, StepText>;
}

/** Gathers rules into a module's `relations` and `steps`. */
const rules = (...rs: Rule[]) => ({
  relations: rs.map((r) => r.relation),
  steps: Object.fromEntries(rs.map((r) => [r.relation.id, r.steps])),
});

type Solve = (v: Values) => number | number[] | undefined;

/**
 * A rule from its display, its residual and, per variable, how to solve for it with the step
 * text: `[solve, expr, how]`. A variable given `undefined` is solved numerically, with no step;
 * one given `null` is never worked out from this rule.
 */
const rule = (
  id: string,
  display: string,
  residual: (v: Values) => number,
  parts: Record<string, [Solve, string, string] | undefined | null>,
): Rule => ({
  relation: {
    id,
    display,
    vars: [
      ...new Set([...Object.keys(parts), ...[...display.matchAll(/\{(\w+)\}/g)].map((x) => x[1]!)]),
    ],
    residual,
    solve: Object.fromEntries(
      Object.entries(parts).flatMap(([k, p]) =>
        p ? [[k, p[0]]] : p === null ? [[k, () => undefined]] : [],
      ),
    ) as Relation['solve'],
  },
  steps: Object.fromEntries(
    Object.entries(parts).flatMap(([k, p]) => (p ? [[k, { expr: p[1], how: p[2] }]] : [])),
  ),
});

/** A measured value with its unit and range. */
const q = (
  id: string,
  symbol: string,
  name: string,
  unit: string | undefined,
  min: number,
  max: number,
  step = 0.1,
  extra: Partial<VariableDef> = {},
): VariableDef => ({ id, symbol, name, ...(unit ? { unit } : {}), min, max, step, ...extra });

/** Division that gives undefined for a zero divisor (the solver then skips it). */
const div = (a: number, b: number) => (Math.abs(b) < 1e-12 ? undefined : a / b);

// ─── H102.4 motionGraph `strobe: 'vertical'`: a dropped stone ────────────────

const G_EARTH = 9.8;

const freeFall: ModuleDef = (() => {
  const t = 3;
  return {
    id: 'g.s11-kinematics-1d-free-fall-vertical',
    title: 'Free fall, the strobe stood up',
    use: 'Use this for “A stone falls from rest for 3 s. How far does it fall, and how fast is it going?”',
    unitSystems: ['metric'],
    assumptions: [
      'Dropped from rest, so it starts at v₀ = 0.',
      'Air resistance is ignored: every object falls with a = −9.8 m/s², whatever its mass.',
      'Up is +, so the velocity is negative on the way down; the drop d is how far it fell.',
    ],
    variables: [
      q('a', 'a', 'Acceleration of gravity', 'm/s²', -50, 50, 0.1, { derived: true }),
      q('t', 't', 'Time', 's', 0.01, 30, 0.01),
      q('v', 'v', 'Velocity (− is down)', 'm/s', -300, 0, 0.01, { derived: true }),
      q('d', 'd', 'Drop', 'm', 0, 5000, 0.01),
    ],
    ...rules(
      rule('a = −9.8', '{a} = −9.8', (x) => x.a! + G_EARTH, {
        a: [
          (x) => -G_EARTH + 0 * (x.a ?? 0),
          '−9.8',
          'Near Earth’s surface gravity speeds a falling object up by 9.8 m/s each second, downward.',
        ],
      }),
      rule('v = at', '{v} = {a} × {t}', (x) => x.v! - x.a! * x.t!, {
        v: [
          (x) => x.a! * x.t!,
          '{a} × {t}',
          'From rest, the velocity is the acceleration times the time.',
        ],
      }),
      rule('d = ½gt²', '{d} = ½ × 9.8 × {t}²', (x) => x.d! - 0.5 * G_EARTH * x.t! * x.t!, {
        d: [
          (x) => 0.5 * G_EARTH * x.t! * x.t!,
          '½ × 9.8 × {t}²',
          'From rest the drop is ½gt²: it grows with the square of the time.',
        ],
        t: [
          (x) => (x.d! >= 0 ? Math.sqrt((2 * x.d!) / G_EARTH) : undefined),
          '√(2 × {d}/9.8)',
          'Undo ½gt²: double the drop, divide by g, take the square root.',
        ],
      }),
    ),
    example: { a: -G_EARTH, t, v: -G_EARTH * t, d: 0.5 * G_EARTH * t * t },
    startWith: ['t'],
    representation: {
      kind: 'motionGraph',
      graph: 'speed',
      time: 't',
      acceleration: 'a',
      speed: 'v',
      start: 0,
      kinematics: { view: 'velocity', strobe: 'vertical' },
    },
    pictureLabels: ['d'],
  };
})();

// ─── H102.10b charges: the field at a point between two charges ─────────────

const K_E = 8.99e9;

const pointField: ModuleDef = (() => {
  const [a, b, r, x] = [3, -1, 0.4, 0.1];
  const E = (K_E * a * 1e-6) / (x * x) - (K_E * b * 1e-6) / ((r - x) * (r - x));
  return {
    id: 'g.s11-electrostatics-point-field',
    title: 'The field at a point between two charges',
    use: 'Use this for “+3 μC and −1 μC are 0.4 m apart. What is the field 0.1 m from the +3 μC charge, on the line between them?”',
    unitSystems: ['metric'],
    assumptions: [
      'The point is on the line between the charges, x from q₁; + is toward q₂.',
      'Each charge’s field points away from it if +, toward it if −, and the two fields add.',
      'E = kq₁/x² − kq₂/(r − x)², with k = 8.99 × 10⁹ N·m²/C² and the charges in μC × 10⁻⁶.',
    ],
    variables: [
      q('a', 'q₁', 'First charge', 'μC', -1000, 1000, 0.01),
      q('b', 'q₂', 'Second charge', 'μC', -1000, 1000, 0.01),
      q('r', 'r', 'Distance between the charges', 'm', 0.001, 100, 0.001),
      q('x', 'x', 'Distance of the point from q₁', 'm', 0.0001, 100, 0.0001),
      q('E', 'E', 'Field at the point (+ toward q₂)', 'N/C', -1e15, 1e15, 0.01, {
        scientific: true,
      }),
    ],
    ...rules(
      { relation: atLeast('r', 'x'), steps: {} },
      rule(
        'E = kq₁/x² − kq₂/(r − x)²',
        '{E} = 8.99 × 10⁹ × {a} × 10⁻⁶/{x}² − 8.99 × 10⁹ × {b} × 10⁻⁶/({r} − {x})²',
        (v) =>
          v.E! -
          ((K_E * v.a! * 1e-6) / (v.x! * v.x!) -
            (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))),
        {
          E: [
            (v) =>
              v.x! > 0 && v.r! > v.x!
                ? (K_E * v.a! * 1e-6) / (v.x! * v.x!) -
                  (K_E * v.b! * 1e-6) / ((v.r! - v.x!) * (v.r! - v.x!))
                : undefined,
            '8.99 × 10⁹ × {a} × 10⁻⁶/({x}²) − 8.99 × 10⁹ × {b} × 10⁻⁶/(({r} − {x})²)',
            'For + charges, q₁’s part points toward q₂ and q₂’s points back toward q₁: subtract it.',
          ],
          a: null,
          b: null,
          r: null,
          x: null,
        },
      ),
    ),
    example: { a, b, r, x, E },
    startWith: ['a', 'b', 'r', 'x'],
    representation: {
      kind: 'charges',
      charges: ['a', 'b'],
      distance: 'r',
      point: 'x',
      field: 'E',
    },
  };
})();

// ─── H102.11 photoelectric: photons free electrons above a threshold ─────────

const photoelectric: ModuleDef = (() => {
  const [lam, phi] = [250, 2.3];
  return {
    id: 'g.s11-modern-physics-photoelectric',
    title: 'The photoelectric effect',
    use: 'Use this for “Light of 250 nm falls on a metal with a work function of 2.3 eV. What is the most kinetic energy an electron can leave with? What is the threshold wavelength?”',
    unitSystems: ['metric'],
    assumptions: [
      'Light comes in photons of E = hc/λ = 1240/λ eV, with λ in nm.',
      'One photon frees at most one electron; the work function φ is the least energy that takes.',
      'Below the threshold wavelength λ₀ = 1240/φ no electron leaves, however bright the light.',
    ],
    variables: [
      q('l', 'λ', 'Wavelength of the light', 'nm', 10, 2000, 0.1, { units: ['nm'] }),
      q('E', 'E', 'Photon energy', 'eV', 0.62, 124, 0.001),
      q('p', 'φ', 'Work function of the metal', 'eV', 0.5, 10, 0.01),
      q('K', 'Kₘₐₓ', 'Greatest kinetic energy of an electron', 'eV', 0, 124, 0.001),
      q('z', 'λ₀', 'Threshold wavelength', 'nm', 124, 2480, 0.1, { units: ['nm'] }),
    ],
    ...rules(
      rule('E = 1240/λ', '{E} = 1240/{l}', (x) => x.E! * x.l! - 1240, {
        E: [(x) => div(1240, x.l!), '1240/{l}', 'hc in eV·nm over the wavelength in nm.'],
        l: [(x) => div(1240, x.E!), '1240/{E}', 'The wavelength whose photons carry E.'],
      }),
      rule('Kₘₐₓ = E − φ', '{K} = {E} − {p}', (x) => x.K! - (x.E! - x.p!), {
        K: [
          (x) => x.E! - x.p!,
          '{E} − {p}',
          'What is left of the photon’s energy after freeing the electron.',
        ],
        E: [
          (x) => x.K! + x.p!,
          '{K} + {p}',
          'The photon paid the work function and the kinetic energy.',
        ],
        p: [
          (x) => x.E! - x.K!,
          '{E} − {K}',
          'The part of the photon’s energy that freed the electron.',
        ],
      }),
      rule('λ₀ = 1240/φ', '{z} = 1240/{p}', (x) => x.z! * x.p! - 1240, {
        z: [(x) => div(1240, x.p!), '1240/{p}', 'The wavelength whose photons carry just φ.'],
        p: [
          (x) => div(1240, x.z!),
          '1240/{z}',
          'A photon at the threshold carries just the work function.',
        ],
      }),
    ),
    example: { l: lam, E: 1240 / lam, p: phi, K: 1240 / lam - phi, z: 1240 / phi },
    startWith: ['l', 'p'],
    representation: {
      kind: 'photoelectric',
      wavelength: 'l',
      workFunction: 'p',
      energy: 'E',
      kinetic: 'K',
      threshold: 'z',
    },
  };
})();

// ─── H102.12 lightClock: time dilation and length contraction ────────────────

const relativity: ModuleDef = (() => {
  const [b, t0, L0] = [0.6, 10, 100];
  const g = 1 / Math.sqrt(1 - b * b);
  return {
    id: 'g.s11-modern-physics-relativity',
    title: 'Moving clocks run slow',
    use: 'Use this for “A spaceship passes at 0.6c. A clock on board ticks 10 s. How long does that take as we see it? How long is the 100 m ship to us?”',
    unitSystems: ['metric'],
    assumptions: [
      'Light moves at c for every observer, however they move.',
      'γ = 1/√(1 − β²), with β = v/c. It is 1 at rest and grows without limit near c.',
      'Δt₀ and L₀ are measured beside the clock or rod; moving past us, Δt = γΔt₀ and L = L₀/γ.',
    ],
    variables: [
      q('b', 'β', 'Speed as a fraction of c', undefined, 0, 0.99, 0.001),
      q('g', 'γ', 'Lorentz factor', undefined, 1, 7.09, 0.0001),
      q('s', 'Δt₀', 'Time on the moving clock', 's', 0.001, 1e9, 0.001),
      q('t', 'Δt', 'Time as we measure it', 's', 0.001, 1e11, 0.001),
      q('L', 'L₀', 'Length at rest', 'm', 0.001, 1e9, 0.001),
      q('m', 'L', 'Length as we measure it moving', 'm', 0.0001, 1e9, 0.0001),
    ],
    ...rules(
      rule(
        'γ = 1/√(1 − β²)',
        '{g} = 1/√(1 − {b}²)',
        (x) => x.g! * Math.sqrt(Math.max(0, 1 - x.b! * x.b!)) - 1,
        {
          g: [
            (x) => (x.b! < 1 ? 1 / Math.sqrt(1 - x.b! * x.b!) : undefined),
            '1/√(1 − {b}²)',
            'The Lorentz factor for this speed.',
          ],
          b: [
            (x) => (x.g! >= 1 ? Math.sqrt(1 - 1 / (x.g! * x.g!)) : undefined),
            '√(1 − 1/({g}²))',
            'Undo γ: 1 − β² = 1/γ².',
          ],
        },
      ),
      rule('Δt = γΔt₀', '{t} = {g} × {s}', (x) => x.t! - x.g! * x.s!, {
        t: [(x) => x.g! * x.s!, '{g} × {s}', 'The moving clock’s tick, stretched by γ.'],
        s: [(x) => div(x.t!, x.g!), '{t}/{g}', 'The time on the moving clock itself.'],
        g: [(x) => div(x.t!, x.s!), '{t}/{s}', 'How many times longer we measure it.'],
      }),
      rule('L = L₀/γ', '{m} = {L}/{g}', (x) => x.m! * x.g! - x.L!, {
        m: [(x) => div(x.L!, x.g!), '{L}/{g}', 'Shorter along the motion by γ.'],
        L: [(x) => x.m! * x.g!, '{m} × {g}', 'The length at rest is γ times longer.'],
        g: [(x) => div(x.L!, x.m!), '{L}/{m}', 'How many times shorter it looks.'],
      }),
    ),
    example: { b, g, s: t0, t: g * t0, L: L0, m: L0 / g },
    startWith: ['b', 's', 'L'],
    representation: {
      kind: 'lightClock',
      speed: 'b',
      gamma: 'g',
      proper: 's',
      dilated: 't',
      length: 'L',
      contracted: 'm',
    },
  };
})();

export const HS2C_GALLERY_MODULES: ModuleDef[] = [freeFall, pointField, photoelectric, relativity];

// ─── H102.5 card figure `strobe`: sorting motion diagrams ───────────────────

const motionDiagrams: LayoutDef = {
  kind: 'sort',
  id: 'g.s11-kinematics-1d-motion-diagrams',
  title: 'Reading a motion diagram',
  use: 'Use this for “A strobe photo shows a runner every second. Is the runner speeding up, slowing down or steady?”',
  assumptions: [
    'Each dot is where the object is, one second apart; the open dot is the first.',
    'Equal gaps in equal times mean constant velocity; growing gaps, speeding up; shrinking gaps, slowing down.',
    'The arrow is the way it moves: the gaps tell the speed whichever way that is.',
  ],
  question: 'How is it moving?',
  bins: [
    {
      id: 'steady',
      label: 'Constant velocity',
      why: 'The gaps are equal: the same distance every second.',
    },
    { id: 'faster', label: 'Speeding up', why: 'Each gap is longer than the one before.' },
    { id: 'slower', label: 'Slowing down', why: 'Each gap is shorter than the one before.' },
  ],
  cards: [
    {
      label: 'Gaps of 2 m each second',
      bin: 'steady',
      figure: { kind: 'strobe', gaps: [2, 2, 2, 2] },
    },
    {
      label: 'Gaps of 1, 3, 5 and 7 m',
      bin: 'faster',
      figure: { kind: 'strobe', gaps: [1, 3, 5, 7] },
    },
    {
      label: 'Gaps of 8, 6, 4 and 2 m',
      bin: 'slower',
      figure: { kind: 'strobe', gaps: [8, 6, 4, 2] },
    },
    {
      label: 'Gaps of 5 m each second, moving left',
      bin: 'steady',
      figure: { kind: 'strobe', gaps: [5, 5, 5, 5], dir: 'left' },
    },
    {
      label: 'Gaps growing as it moves left',
      bin: 'faster',
      figure: { kind: 'strobe', gaps: [2, 4, 6, 8], dir: 'left' },
    },
    {
      label: 'A ball rolling up a ramp',
      bin: 'slower',
      figure: { kind: 'strobe', gaps: [7, 5, 3, 1.5], ramp: true },
    },
  ],
};

export const HS2C_GALLERY_LAYOUTS: LayoutDef[] = [motionDiagrams];
