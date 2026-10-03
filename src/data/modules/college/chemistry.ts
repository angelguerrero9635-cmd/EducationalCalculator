/**
 * College Chemistry: the calculator modules of every course whose home field is `chemistry`,
 * keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>` after it),
 * in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are in
 * `../layouts/collegeChemistry.ts`. Rules: docs/MODULE_GUIDE.md; plan: docs/plans/he.chemistry.md.
 */
import { valueOf } from '@/engine/constants';
import { formatNumber } from '@/engine/format';

import type { ModuleDef } from '../types';

import { derive, rel, rels, rule, V } from './shared';

// The constants as the steps print them (src/engine/constants.ts).
const H = valueOf('h'); // 6.626 × 10⁻³⁴ J·s
const C = valueOf('c'); // 2.998 × 10⁸ m/s
const NA = valueOf('NA'); // 6.022 × 10²³ mol⁻¹
const E_CHARGE = valueOf('e'); // 1.602 × 10⁻¹⁹ C
const RINF = valueOf('Rinf'); // 1.097 × 10⁷ m⁻¹

// Wavelengths 10 nm to 100 μm; the other ranges follow from them, so every chain meets.
const F_MIN = C / 1e-4;
const F_MAX = C / 1e-8;

/** 1/n₁² − 1/n₂² for a drop from n₂ to n₁. */
const levelGap = (upper: number, lower: number) => 1 / (lower * lower) - 1 / (upper * upper);

/**
 * The level n with 1/n² = x: a whole number when a typed wavelength is a true line (within
 * its 4 figures), otherwise the fraction, which the whole-number rule then refuses.
 */
const level = (x: number) => {
  if (!(x > 0)) return [NaN];
  const n = 1 / Math.sqrt(x);
  return Math.abs(n - Math.round(n)) < 0.002 * n ? Math.round(n) : n;
};

/** A hydrogen line's wavelength in nm (Rydberg, R in m⁻¹). */
const rydbergNm = (upper: number, lower: number) => 1e9 / (RINF * levelGap(upper, lower));

export const COLLEGE_CHEMISTRY_MODULES: ModuleDef[] = [
  {
    // General Chemistry I → Atomic structure and periodicity: a hydrogen line, λ to kJ/mol.
    id: 'he.chemistry.gen-chem-1#0',
    use: 'Use this for “Find the wavelength and energy of the photon when hydrogen’s electron drops from n = 4 to n = 2.”',
    assumptions: [
      'One electron only (hydrogen). The electron drops from n₂ to a lower n₁, and one photon carries the difference.',
      'n₁ names the series: 1 Lyman (ultraviolet), 2 Balmer (visible), 3 Paschen (infrared).',
      'R_H = 1.097 × 10⁷ m⁻¹, c = 2.998 × 10⁸ m/s, h = 6.626 × 10⁻³⁴ J·s, N_A = 6.022 × 10²³ mol⁻¹.',
    ],
    variables: [
      V('u', 'n₂', 'Upper level', { min: 2, max: 8, step: 1, integer: true }),
      V('l', 'n₁', 'Lower level', { min: 1, max: 7, step: 1, integer: true }),
      V('w', 'λ', 'Wavelength', { unit: 'nm', min: 10, max: 100000, step: 0.1, figures: 4 }),
      V('f', 'ν', 'Frequency', { unit: 'Hz', min: F_MIN, max: F_MAX, scientific: true }),
      V('E', 'E', 'Photon energy', { unit: 'J', min: H * F_MIN, max: H * F_MAX, scientific: true }),
      V('Em', 'E_m', 'Energy per mole of photons', {
        unit: 'kJ/mol',
        min: (H * F_MIN * NA) / 1000,
        max: (H * F_MAX * NA) / 1000,
        step: 0.1,
        figures: 4,
      }),
      V('Ev', 'E_eV', 'Photon energy in electronvolts', {
        unit: 'eV',
        min: (H * F_MIN) / E_CHARGE,
        max: (H * F_MAX) / E_CHARGE,
        step: 0.001,
        figures: 4,
        derived: true,
      }),
    ],
    ...rels(
      rule(
        'n₂ > n₁',
        'The upper level {u} is above the lower level {l}',
        ['u', 'l'],
        (v) => v.u! > v.l!,
        'The electron drops from a higher level: n₂ must be above n₁.',
      ),
      rel(
        '1/λ = R_H(1/n₁² − 1/n₂²)',
        '{w} = 10⁹ ÷ (1.097 × 10⁷ × (1 ÷ {l}² − 1 ÷ {u}²))',
        ['w', 'u', 'l'],
        (v) => v.w! / rydbergNm(v.u!, v.l!) - 1,
        {
          w: [
            (v) => (v.u! > v.l! ? rydbergNm(v.u!, v.l!) : undefined),
            '10⁹ ÷ (1.097 × 10⁷ × (1 ÷ {l}² − 1 ÷ {u}²))',
            'Rydberg: 1/λ = R_H(1/n₁² − 1/n₂²) gives λ in meters; × 10⁹ turns it into nanometers.',
          ],
          u: [
            (v) => level(1 / (v.l! * v.l!) - 1e9 / (RINF * v.w!)),
            '1 ÷ √(1 ÷ {l}² − 10⁹ ÷ (1.097 × 10⁷ × {w}))',
            'Take 1/λ ÷ R_H from 1/n₁² to leave 1/n₂², then take the root of its reciprocal.',
          ],
          l: [
            (v) => level(1 / (v.u! * v.u!) + 1e9 / (RINF * v.w!)),
            '1 ÷ √(1 ÷ {u}² + 10⁹ ÷ (1.097 × 10⁷ × {w}))',
            'Add 1/λ ÷ R_H to 1/n₂² to get 1/n₁², then take the root of its reciprocal.',
          ],
        },
      ),
      rel(
        'ν = c/λ',
        '{f} = 2.998 × 10⁸ ÷ ({w} × 10⁻⁹)',
        ['f', 'w'],
        // In nm, never flat: as a ratio it reads as the constant −1 at small probe values.
        (v) => v.w! - C / v.f! / 1e-9,
        {
          f: [
            (v) => C / (v.w! * 1e-9),
            '2.998 × 10⁸ ÷ ({w} × 10⁻⁹)',
            'Light travels at c = λν: divide c by the wavelength in meters.',
          ],
          w: [
            (v) => C / v.f! / 1e-9,
            '2.998 × 10⁸ ÷ {f} × 10⁹',
            'Divide c by the frequency for meters, then × 10⁹ for nanometers.',
          ],
        },
      ),
      rel('E = hν', '{E} = 6.626 × 10⁻³⁴ × {f}', ['f', 'E'], (v) => v.E! / (H * v.f!) - 1, {
        E: [
          (v) => H * v.f!,
          '6.626 × 10⁻³⁴ × {f}',
          'One photon carries Planck’s constant times ν.',
        ],
        f: [(v) => v.E! / H, '{E} ÷ (6.626 × 10⁻³⁴)', 'Divide the energy by Planck’s constant.'],
      }),
      rel(
        'E_m = E·N_A ÷ 1000',
        '{Em} = {E} × 6.022 × 10²³ ÷ 1000',
        ['E', 'Em'],
        (v) => v.Em! / ((v.E! * NA) / 1000) - 1,
        {
          Em: [
            (v) => (v.E! * NA) / 1000,
            '{E} × 6.022 × 10²³ ÷ 1000',
            'A mole of photons is N_A of them; ÷ 1000 turns J into kJ.',
          ],
          E: [
            (v) => (v.Em! * 1000) / NA,
            '{Em} × 1000 ÷ (6.022 × 10²³)',
            'Turn kJ into J, then share it among N_A photons.',
          ],
        },
      ),
      derive(
        'E_eV = E ÷ e',
        '{Ev} = {E} ÷ (1.602 × 10⁻¹⁹)',
        'Ev',
        ['E'],
        (v) => v.E! / E_CHARGE,
        '{E} ÷ (1.602 × 10⁻¹⁹)',
        (v) =>
          `One electronvolt is 1.602 × 10⁻¹⁹ J. It is the gap between the levels: 13.6 eV × (1/n₁² − 1/n₂²)${v.u !== undefined && v.l !== undefined && v.u > v.l ? ` = ${formatNumber(13.6 * levelGap(v.u, v.l))} eV` : ''}.`,
      ),
    ),
    example: (() => {
      const w = rydbergNm(4, 2);
      const f = C / (w * 1e-9);
      const E = H * f;
      return { u: 4, l: 2, w, f, E, Em: (E * NA) / 1000, Ev: E / E_CHARGE };
    })(),
    startWith: ['u', 'l'],
    representation: {
      kind: 'orbitalDiagram',
      mode: 'ladder',
      upper: 'u',
      lower: 'l',
      energy: 'Ev',
      wavelength: 'w',
      levels: 8,
    },
  },
];
