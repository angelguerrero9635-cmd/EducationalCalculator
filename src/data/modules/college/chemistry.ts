/**
 * College Chemistry: the calculator modules of every course whose home field is `chemistry`,
 * keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>` after it),
 * in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are in
 * `../layouts/collegeChemistry.ts`. Rules: docs/MODULE_GUIDE.md; plan: docs/plans/he.chemistry.md.
 */
import { domainAngleOf } from '@/components/module/reps/vseprHe3eMath';
import { rootRule } from '@/engine/cases';
import { valueOf } from '@/engine/constants';
import { formatNumber } from '@/engine/format';
import type { Values } from '@/engine/types';

import type { ModuleDef } from '../types';

import { derive, exact, rel, rels, rule, V } from './shared';

// The constants as the steps print them (src/engine/constants.ts).
const H = valueOf('h'); // 6.626 × 10⁻³⁴ J·s
const C = valueOf('c'); // 2.998 × 10⁸ m/s
const NA = valueOf('NA'); // 6.022 × 10²³ mol⁻¹
const E_CHARGE = valueOf('e'); // 1.602 × 10⁻¹⁹ C
const RINF = valueOf('Rinf'); // 1.097 × 10⁷ m⁻¹
const R_LATM = 0.08206; // L·atm/(mol·K)
const R_J = valueOf('R'); // 8.314 J/(mol·K)
const HE_KG = 0.004003; // helium's molar mass, kg/mol

// Wavelengths 10 nm to 100 μm; the other ranges follow from them, so every chain meets.
const F_MIN = C / 1e-4;
const F_MAX = C / 1e-8;

/** A figure-only relation (never shown or stepped). */
const hide = <R extends { relation: { hidden?: boolean } }>(r: R): R => ({
  ...r,
  relation: { ...r.relation, hidden: true },
});

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
  {
    // A moving mass's wavelength: p = mv, λ = h ÷ p (slow next to light).
    id: 'he.chemistry.gen-chem-1#0~de-broglie',
    title: 'The de Broglie wavelength of a moving mass',
    // As the data are given (2.00 × 10⁶ m/s): 0.364 nm, 1.14 × 10⁻³⁴ m.
    workedFigures: 3,
    use: 'Use this for “Find the de Broglie wavelength of an electron moving at 2.00 × 10⁶ m/s.”',
    assumptions: [
      'The speed is below a tenth of light’s, so p = mv holds without relativity.',
      'Any moving mass has a wavelength λ = h ÷ p, but a ball’s is far too small to see or measure.',
      'An electron’s mass is 9.109 × 10⁻³¹ kg; h = 6.626 × 10⁻³⁴ J·s.',
    ],
    variables: [
      V('m', 'm', 'Mass', {
        unit: 'kg',
        units: ['kg', 'g'],
        min: 1e-31,
        max: 10,
        scientific: true,
      }),
      V('v', 'v', 'Speed', {
        unit: 'm/s',
        units: ['m/s', 'km/s'],
        min: 0.01,
        max: 3e7,
        figures: 4,
      }),
      V('p', 'p', 'Momentum', { unit: 'kg·m/s', min: 1e-33, max: 3e8, scientific: true }),
      // In picometers, so the drawn wave (one period per λ) reads on plain ticks, not π's.
      V('w', 'λ', 'Wavelength', {
        unit: 'pm',
        units: ['nm', 'pm'],
        shownIn: 'pm',
        min: (H / 3e8) * 1e12,
        max: (H / 1e-33) * 1e12,
        scientific: true,
      }),
      // Figure-only: 2π ÷ λ, so one period of the sine is λ. A wave under 1 pm (a ball's) is
      // far too fine to draw, so it is left unknown and the graph waits.
      V('k', 'k', 'Wavenumber', { min: 0, max: 2 * Math.PI, derived: true, hidden: true }),
    ],
    ...rels(
      rel('p = mv', '{p} = {m} × {v}', ['p', 'm', 'v'], (v) => v.p! - v.m! * v.v!, {
        p: [(v) => v.m! * v.v!, '{m} × {v}', 'Momentum is mass times speed.'],
        m: [(v) => v.p! / v.v!, '{p} ÷ {v}', 'Divide the momentum by the speed.'],
        v: [(v) => v.p! / v.m!, '{p} ÷ {m}', 'Divide the momentum by the mass.'],
      }),
      rel(
        'λ = h/p',
        '{w} = 6.626 × 10⁻³⁴ ÷ {p} × 10¹²',
        ['w', 'p'],
        (v) => v.w! - (H / v.p!) * 1e12,
        {
          w: [
            (v) => (H / v.p!) * 1e12,
            '6.626 × 10⁻³⁴ ÷ {p} × 10¹²',
            'de Broglie: Planck’s constant over the momentum is λ in meters; × 10¹² turns it into picometers.',
          ],
          p: [
            (v) => (H / v.w!) * 1e12,
            '6.626 × 10⁻³⁴ ÷ {w} × 10¹²',
            'Turn λ = h ÷ p around: p = h ÷ λ, with λ in meters (pm × 10⁻¹²).',
          ],
        },
      ),
      hide(
        rel('k = 2π/λ', '{k} = 2π ÷ {w}', ['k', 'w'], (v) => v.k! - (2 * Math.PI) / v.w!, {
          k: [(v) => (v.w! >= 1 ? (2 * Math.PI) / v.w! : undefined), '2π ÷ {w}', ''],
        }),
      ),
    ),
    example: (() => {
      const m = valueOf('me');
      const p = m * 2e6;
      const w = (H / p) * 1e12;
      return { m, v: 2e6, p, w, k: (2 * Math.PI) / w };
    })(),
    startWith: ['m', 'v'],
    representation: {
      kind: 'functionGraph',
      family: 'sin',
      b: 'k',
      name: 'ψ',
      input: 'x',
      shows: { period: 'w' },
      marks: ['period'],
      xMin: 0,
      axes: { x: 'Position x', y: 'Wave ψ' },
      unitsOf: { x: 'w' },
    },
  },
  {
    // Heisenberg: the least spread in speed for a mass held to Δx (the equality, "at least").
    id: 'he.chemistry.gen-chem-1#0~uncertainty',
    title: 'The least uncertainty in speed',
    // As the data are given (0.100 nm): 5.79 × 10⁵ m/s.
    workedFigures: 3,
    use: 'Use this for “An electron is located to within 0.100 nm. What is the least uncertainty in its speed?”',
    assumptions: [
      'Heisenberg: Δx·Δp ≥ h ÷ (4π). The page works the equality, so Δp and Δv are the least uncertainties possible.',
      'The speed stays well below light’s, so p = mv and the spread in momentum is Δp = mΔv.',
      'An electron’s mass is 9.109 × 10⁻³¹ kg; h = 6.626 × 10⁻³⁴ J·s.',
    ],
    variables: [
      V('m', 'm', 'Mass', {
        unit: 'kg',
        units: ['kg', 'g'],
        min: 9e-31,
        max: 10,
        scientific: true,
      }),
      V('x', 'Δx', 'Position uncertainty', {
        unit: 'nm',
        units: ['m', 'nm', 'pm'],
        min: 0.01,
        max: 1e10,
        figures: 4,
      }),
      V('p', 'Δp', 'Least momentum uncertainty', {
        unit: 'kg·m/s',
        min: H / (4 * Math.PI * 10),
        max: H / (4 * Math.PI * 1e-11),
        scientific: true,
      }),
      V('v', 'Δv', 'Least speed uncertainty', {
        unit: 'm/s',
        units: ['m/s', 'km/s'],
        min: H / (4 * Math.PI * 10) / 10,
        max: H / (4 * Math.PI * 1e-11) / 9e-31,
        scientific: true,
      }),
    ],
    ...rels(
      rel(
        'Δx·Δp = h/(4π)',
        '{p} = (6.626 × 10⁻³⁴) ÷ (4π × {x} × 10⁻⁹)',
        ['p', 'x'],
        (v) => v.x! - (H / (4 * Math.PI * v.p!)) * 1e9,
        {
          p: [
            (v) => H / (4 * Math.PI * v.x! * 1e-9),
            '(6.626 × 10⁻³⁴) ÷ (4π × {x} × 10⁻⁹)',
            'Heisenberg at its limit: Δp = h ÷ (4πΔx), with Δx in meters (nm × 10⁻⁹).',
          ],
          x: [
            (v) => (H / (4 * Math.PI * v.p!)) * 1e9,
            '(6.626 × 10⁻³⁴) ÷ (4π × {p}) × 10⁹',
            'Turn it around: Δx = h ÷ (4πΔp) in meters; × 10⁹ turns it into nanometers.',
          ],
        },
      ),
      rel('Δv = Δp/m', '{v} = {p} ÷ {m}', ['v', 'p', 'm'], (v) => v.p! - v.m! * v.v!, {
        v: [
          (v) => v.p! / v.m!,
          '{p} ÷ {m}',
          'Δp = mΔv, so divide the momentum spread by the mass.',
        ],
        p: [
          (v) => v.m! * v.v!,
          '{m} × {v}',
          'The momentum spread is the mass times the speed spread.',
        ],
        m: [(v) => v.p! / v.v!, '{p} ÷ {v}', 'Divide the momentum spread by the speed spread.'],
      }),
    ),
    example: (() => {
      const m = valueOf('me');
      const x = 0.1;
      const p = H / (4 * Math.PI * x * 1e-9);
      return { m, x, p, v: p / m };
    })(),
    startWith: ['m', 'x'],
    unitSystems: ['metric'],
    representation: { kind: 'none' },
  },
  {
    // Slater's rules for an s or p electron: the shielding S, then Z_eff = Z − S.
    id: 'he.chemistry.gen-chem-1#0~zeff',
    title: 'Effective nuclear charge (Slater’s rules)',
    use: 'Use this for “Use Slater’s rules to find the effective nuclear charge on a 2p electron of nitrogen.”',
    assumptions: [
      'Slater’s rules for one s or p electron with n ≥ 2: each other electron in its (ns, np) group shields 0.35, each in shell n − 1 shields 0.85, each deeper one 1.00.',
      'Shell n − 1 counts all its s, p and d electrons. A 1s electron’s partner shields 0.30, and d and f electrons follow other rules.',
      'A higher Z_eff pulls the electron closer and holds it harder, so radii shrink and ionization energies rise across a period.',
    ],
    variables: [
      V('Z', 'Z', 'Atomic number', { min: 3, max: 36, step: 1, integer: true }),
      V('a', 'a', 'Other electrons in its (ns, np) group', {
        min: 0,
        max: 7,
        step: 1,
        integer: true,
      }),
      V('b', 'b', 'Electrons in shell n − 1', { min: 0, max: 18, step: 1, integer: true }),
      V('c', 'c', 'Electrons in deeper shells', { min: 0, max: 28, step: 1, integer: true }),
      V('S', 'S', 'Shielding constant', { min: 0, max: 35, step: 0.01 }),
      V('Zf', 'Z_eff', 'Effective nuclear charge', { min: 0.5, max: 36, step: 0.01 }),
    ],
    ...rels(
      rule(
        'a + b + c < Z',
        'The other electrons {a} + {b} + {c} are fewer than the protons {Z}',
        ['a', 'b', 'c', 'Z'],
        (v) => v.a! + v.b! + v.c! < v.Z!,
        'The shielding electrons are the atom’s others: a + b + c is at most Z − 1.',
      ),
      rel(
        'S = 0.35a + 0.85b + 1.00c',
        '{S} = 0.35 × {a} + 0.85 × {b} + 1.00 × {c}',
        ['S', 'a', 'b', 'c'],
        (v) => v.S! - (0.35 * v.a! + 0.85 * v.b! + v.c!),
        {
          S: [
            (v) => exact(0.35 * v.a! + 0.85 * v.b! + v.c!),
            '0.35 × {a} + 0.85 × {b} + 1.00 × {c}',
            'Slater: weight each group’s electrons by how well they shield, then add.',
          ],
        },
      ),
      rel('Z_eff = Z − S', '{Zf} = {Z} − {S}', ['Zf', 'Z', 'S'], (v) => v.Zf! - (v.Z! - v.S!), {
        Zf: [
          (v) => exact(v.Z! - v.S!),
          '{Z} − {S}',
          'The electron feels the protons less the charge the others screen off.',
        ],
        S: [
          (v) => exact(v.Z! - v.Zf!),
          '{Z} − {Zf}',
          'The shielding is what the protons lose: Z − Z_eff.',
        ],
        Z: [(v) => exact(v.Zf! + v.S!), '{Zf} + {S}', 'Add the shielding back to Z_eff.'],
      }),
    ),
    example: { Z: 7, a: 4, b: 2, c: 0, S: 3.1, Zf: 3.9 },
    startWith: ['Z', 'a', 'b', 'c'],
    sliders: true,
    representation: { kind: 'orbitalDiagram', mode: 'boxes', element: 'Z' },
  },
  {
    // General Chemistry I → Stoichiometry: combustion analysis, the moles of C, H and O.
    id: 'he.chemistry.gen-chem-1#1',
    use: 'Use this for “A 0.2500 g sample of a compound of C, H and O burns to 0.3664 g of CO₂ and 0.1500 g of H₂O. Find its empirical formula.”',
    assumptions: [
      'All the C ends in CO₂ and all the H in H₂O. O is what is left of the sample’s mass, since the O₂ it burns in can’t be told apart.',
      'Molar masses: CO₂ 44.01, H₂O 18.02, C 12.01, H 1.008 and O 16.00 g/mol.',
      'Ratios within 0.05 of a whole number round; otherwise multiply them all by 2, 3 … until they are whole (1.33 × 3 = 4).',
    ],
    variables: [
      V('m', 'm', 'Sample mass', {
        unit: 'g',
        units: ['g'],
        min: 0.001,
        max: 100,
        step: 0.0001,
        figures: 4,
      }),
      V('mc', 'm_CO₂', 'CO₂ mass', {
        unit: 'g',
        units: ['g'],
        min: 0.0001,
        max: 400,
        step: 0.0001,
        figures: 4,
      }),
      V('mh', 'm_H2O', 'H₂O mass', {
        unit: 'g',
        units: ['g'],
        min: 0.0001,
        max: 200,
        step: 0.0001,
        figures: 4,
      }),
      V('nC', 'n_C', 'Moles of C', { unit: 'mol', min: 1e-6, max: 10, step: 0.000001, figures: 4 }),
      V('nH', 'n_H', 'Moles of H', { unit: 'mol', min: 1e-6, max: 25, step: 0.000001, figures: 4 }),
      V('mO', 'm_O', 'Mass of O', {
        unit: 'g',
        units: ['g'],
        min: 0,
        max: 100,
        step: 0.0001,
        figures: 4,
      }),
      V('nO', 'n_O', 'Moles of O', { unit: 'mol', min: 0, max: 7, step: 0.000001, figures: 4 }),
      V('rH', 'r_H', 'H per C', { min: 0, max: 10, step: 0.01, figures: 3 }),
      V('rO', 'r_O', 'O per C', { min: 0, max: 10, step: 0.01, figures: 3 }),
    ],
    ...rels(
      rule(
        '12.01n_C + 1.008n_H ≤ m',
        'The C and H, 12.01 × {nC} + 1.008 × {nH}, weigh no more than the sample {m}',
        ['nC', 'nH', 'm'],
        (v) => 12.01 * v.nC! + 1.008 * v.nH! <= v.m! * 1.0005,
        'The C and H found weigh more than the sample: check the masses of CO₂ and H₂O.',
      ),
      rel(
        'n_C = m_CO₂ ÷ 44.01',
        '{nC} = {mc} ÷ 44.01',
        ['nC', 'mc'],
        (v) => 44.01 * v.nC! - v.mc!,
        {
          nC: [(v) => v.mc! / 44.01, '{mc} ÷ 44.01', 'Each mole of CO₂ holds one mole of C.'],
          mc: [(v) => 44.01 * v.nC!, '{nC} × 44.01', 'One mole of CO₂ for each mole of C.'],
        },
      ),
      rel(
        'n_H = 2m_H₂O ÷ 18.02',
        '{nH} = 2 × {mh} ÷ 18.02',
        ['nH', 'mh'],
        (v) => 18.02 * v.nH! - 2 * v.mh!,
        {
          nH: [
            (v) => (2 * v.mh!) / 18.02,
            '2 × {mh} ÷ 18.02',
            'Each mole of H₂O holds two moles of H.',
          ],
          mh: [
            (v) => (18.02 * v.nH!) / 2,
            '{nH} × 18.02 ÷ 2',
            'Half a mole of H₂O for each mole of H.',
          ],
        },
      ),
      rel(
        'm_O = m − 12.01n_C − 1.008n_H',
        '{mO} = {m} − 12.01 × {nC} − 1.008 × {nH}',
        ['mO', 'm', 'nC', 'nH'],
        (v) => v.mO! - (v.m! - 12.01 * v.nC! - 1.008 * v.nH!),
        {
          mO: [
            // A hydrocarbon's last crumb of rounding reads as no O at all.
            (v) => {
              const o = v.m! - 12.01 * v.nC! - 1.008 * v.nH!;
              return o < 0 && o > -5e-4 * v.m! ? 0 : o;
            },
            '{m} − 12.01 × {nC} − 1.008 × {nH}',
            'Take the grams of C and of H from the sample: what is left is O.',
          ],
        },
      ),
      rel('n_O = m_O ÷ 16.00', '{nO} = {mO} ÷ 16.00', ['nO', 'mO'], (v) => 16 * v.nO! - v.mO!, {
        nO: [(v) => v.mO! / 16, '{mO} ÷ 16.00', 'Divide the grams of O by 16.00 g/mol.'],
        mO: [(v) => 16 * v.nO!, '{nO} × 16.00', 'Moles of O times 16.00 g/mol.'],
      }),
      rel(
        'r_H = n_H ÷ n_C',
        '{rH} = {nH} ÷ {nC}',
        ['rH', 'nH', 'nC'],
        (v) => v.rH! * v.nC! - v.nH!,
        {
          rH: [
            (v) => v.nH! / v.nC!,
            '{nH} ÷ {nC}',
            'Divide by the moles of C to count the H atoms for each C.',
          ],
        },
      ),
      rel(
        'r_O = n_O ÷ n_C',
        '{rO} = {nO} ÷ {nC}',
        ['rO', 'nO', 'nC'],
        (v) => v.rO! * v.nC! - v.nO!,
        {
          rO: [
            (v) => v.nO! / v.nC!,
            '{nO} ÷ {nC}',
            'Divide by the moles of C to count the O atoms for each C.',
          ],
        },
      ),
    ),
    example: (() => {
      const [m, mc, mh] = [0.25, 0.3664, 0.15];
      const nC = mc / 44.01;
      const nH = (2 * mh) / 18.02;
      const mO = m - 12.01 * nC - 1.008 * nH;
      const nO = mO / 16;
      return { m, mc, mh, nC, nH, mO, nO, rH: nH / nC, rO: nO / nC };
    })(),
    startWith: ['m', 'mc', 'mh'],
    unitSystems: ['metric'],
    representation: {
      kind: 'reaction',
      reactants: [],
      products: [],
      combustion: {
        sample: 'm',
        co2: 'mc',
        h2o: 'mh',
        carbon: 'nC',
        hydrogen: 'nH',
        oxygenMass: 'mO',
        oxygen: 'nO',
        hPerC: 'rH',
        oPerC: 'rO',
      },
    },
  },
  {
    // The molecular formula: how many empirical units make one molecule (M ÷ empirical mass).
    id: 'he.chemistry.gen-chem-1#1~molecular-formula',
    title: 'The molecular formula from the empirical formula',
    use: 'Use this for “A sugar’s empirical formula is CH₂O and its molar mass is 180 g/mol. Find its molecular formula.”',
    assumptions: [
      'The molecular formula is a whole number n of empirical units: CH₂O × 6 is C₆H₁₂O₆.',
      'A measured molar mass is rarely exact, so the ratio M ÷ empirical mass is rounded to the nearest whole number when it is within 2% of one.',
      'Empirical formula mass is the sum of its atoms’ molar masses: CH₂O is 12.01 + 2 × 1.008 + 16.00 = 30.03 g/mol.',
    ],
    variables: [
      V('e', 'M_emp', 'Empirical formula mass', {
        unit: 'g/mol',
        units: ['g/mol'],
        min: 1,
        max: 1000,
        step: 0.01,
        figures: 4,
      }),
      V('M', 'M', 'Molar mass', {
        unit: 'g/mol',
        units: ['g/mol'],
        min: 1,
        max: 1e6,
        step: 0.01,
        figures: 4,
      }),
      V('r', 'r', 'Mass ratio', { min: 0.98, max: 1000, step: 0.001, figures: 4 }),
      V('n', 'n', 'Empirical units per molecule', { min: 1, max: 1000, step: 1, integer: true }),
    ],
    ...rels(
      rule(
        'r within 2% of a whole number',
        'The mass ratio {r} is within 2% of a whole number',
        ['r'],
        (v) => Math.abs(v.r! - Math.round(v.r!)) <= 0.02 * v.r!,
        'The ratio is not near a whole number: check both molar masses, or the empirical formula.',
      ),
      rel('r = M ÷ M_emp', '{r} = {M} ÷ {e}', ['r', 'M', 'e'], (v) => v.r! * v.e! - v.M!, {
        r: [
          (v) => v.M! / v.e!,
          '{M} ÷ {e}',
          'Divide the molar mass by the empirical formula mass: how many empirical units fit in one mole of molecules.',
        ],
        M: [(v) => v.r! * v.e!, '{r} × {e}', 'The molar mass is the empirical mass taken r times.'],
        e: [(v) => v.M! / v.r!, '{M} ÷ {r}', 'Share the molar mass among the r empirical units.'],
      }),
      derive(
        'n = r rounded',
        '{n} = {r} rounded to the ones',
        'n',
        ['r'],
        (v) => Math.round(v.r!),
        '{r} rounded to the ones',
        'A molecule holds a whole number of empirical units; multiply every subscript of the empirical formula by n.',
      ),
    ),
    example: { e: 30.03, M: 180, r: 180 / 30.03, n: 6 },
    startWith: ['e', 'M'],
    unitSystems: ['metric'],
    representation: { kind: 'none' },
  },
  {
    // Solution stoichiometry: M × L → mol, the mole ratio across, then mol ÷ M → volume.
    id: 'he.chemistry.gen-chem-1#1~solution-stoich',
    title: 'Solution stoichiometry: the volume that reacts',
    use: 'Use this for “What volume of 0.100 M NaOH reacts completely with 25.00 mL of 0.150 M H₂SO₄?”',
    assumptions: [
      'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O, so the mole ratio r is 2 mol of base for each mol of acid. Read r from the coefficients of your own balanced equation.',
      'Moles of solute = molarity × volume in liters; a volume in mL is divided by 1000.',
      'The reaction goes to completion: the base added is exactly what the acid needs (the equivalence point).',
    ],
    variables: [
      V('C1', 'C₁', 'Acid concentration', {
        unit: 'M',
        units: ['M'],
        min: 0.0001,
        max: 20,
        step: 0.001,
        figures: 4,
      }),
      V('V1', 'V₁', 'Acid volume', {
        unit: 'mL',
        units: ['mL'],
        min: 0.01,
        max: 10000,
        step: 0.01,
        figures: 4,
      }),
      V('n1', 'n₁', 'Moles of acid', { unit: 'mol', min: 1e-9, max: 200, figures: 4 }),
      V('r', 'r', 'Mole ratio (base per acid)', {
        min: 0.1,
        max: 10,
        step: 0.001,
        allowed: [1, 2, 3, 0.5, 1 / 3, 1.5, 2 / 3],
      }),
      V('n2', 'n₂', 'Moles of base', { unit: 'mol', min: 1e-9, max: 2000, figures: 4 }),
      V('C2', 'C₂', 'Base concentration', {
        unit: 'M',
        units: ['M'],
        min: 0.0001,
        max: 20,
        step: 0.001,
        figures: 4,
      }),
      V('V2', 'V₂', 'Base volume', {
        unit: 'mL',
        units: ['mL'],
        min: 0.01,
        max: 1e6,
        step: 0.01,
        figures: 4,
      }),
    ],
    ...rels(
      rel(
        'n₁ = C₁V₁',
        '{n1} = {C1} × {V1} ÷ 1000',
        ['n1', 'C1', 'V1'],
        (v) => 1000 * v.n1! - v.C1! * v.V1!,
        {
          n1: [
            (v) => (v.C1! * v.V1!) / 1000,
            '{C1} × {V1} ÷ 1000',
            'Molarity times the volume in liters (mL ÷ 1000) counts the moles of acid.',
          ],
          C1: [(v) => (1000 * v.n1!) / v.V1!, '1000 × {n1} ÷ {V1}', 'Moles per liter of acid.'],
          V1: [
            (v) => (1000 * v.n1!) / v.C1!,
            '1000 × {n1} ÷ {C1}',
            'Moles over molarity gives liters; × 1000 turns them into mL.',
          ],
        },
      ),
      rel('n₂ = r·n₁', '{n2} = {r} × {n1}', ['n2', 'r', 'n1'], (v) => v.n2! - v.r! * v.n1!, {
        n2: [
          (v) => v.r! * v.n1!,
          '{r} × {n1}',
          'The mole ratio from the balanced equation carries the moles from acid to base.',
        ],
        n1: [(v) => v.n2! / v.r!, '{n2} ÷ {r}', 'Divide the moles of base by the ratio.'],
        r: [(v) => v.n2! / v.n1!, '{n2} ÷ {n1}', 'Divide the moles of base by the moles of acid.'],
      }),
      rel(
        'n₂ = C₂V₂',
        '{n2} = {C2} × {V2} ÷ 1000',
        ['n2', 'C2', 'V2'],
        (v) => 1000 * v.n2! - v.C2! * v.V2!,
        {
          V2: [
            (v) => (1000 * v.n2!) / v.C2!,
            '1000 × {n2} ÷ {C2}',
            'Moles of base over its molarity gives liters; × 1000 turns them into mL.',
          ],
          n2: [
            (v) => (v.C2! * v.V2!) / 1000,
            '{C2} × {V2} ÷ 1000',
            'Molarity times the volume in liters counts the moles of base.',
          ],
          C2: [(v) => (1000 * v.n2!) / v.V2!, '1000 × {n2} ÷ {V2}', 'Moles per liter of base.'],
        },
      ),
    ),
    example: { C1: 0.15, V1: 25, n1: 0.00375, r: 2, n2: 0.0075, C2: 0.1, V2: 75 },
    startWith: ['C1', 'V1', 'r', 'C2'],
    unitSystems: ['metric'],
    representation: {
      kind: 'moleMap',
      moles: 'n1',
      formula: 'H2SO4',
      second: { formula: 'NaOH', ratio: [1, 'r'], moles: 'n2' },
      solution: {
        first: { molarity: 'C1', volume: 'V1' },
        second: { molarity: 'C2', volume: 'V2' },
      },
    },
  },
  (() => {
    // General Chemistry I → Gases: the molar mass from a gas's density, M = dRT ÷ P.
    // A 1.00 L sample at 25 °C and 1.00 atm: n = 1.00 ÷ (0.08206 × 298.15), m = 1.31 g, so
    // M = 32.1 g/mol (O₂ is 32.00).
    const [d, t, P, vol] = [1.31, 25, 1, 1];
    const T = t + 273.15;
    const n = (P * vol) / (R_LATM * T);
    const m = d * vol;
    return {
      id: 'he.chemistry.gen-chem-1#2',
      // As the data are given (1.31 g/L): 32.1 g/mol.
      workedFigures: 3,
      use: 'Use this for “A gas has a density of 1.31 g/L at 25 °C and 1.00 atm. Find its molar mass.”',
      assumptions: [
        'The gas is ideal: low pressure and high temperature, so its particles take up no room and do not attract each other.',
        'R = 0.08206 L·atm/(mol·K), so the pressure is in atm, the volume in liters and the temperature in kelvins (°C + 273.15).',
        'Any sample gives the same molar mass. Take 1.00 L: it holds d grams, and PV = nRT counts its moles.',
      ],
      variables: [
        V('d', 'd', 'Density', {
          unit: 'g/L',
          units: ['g/L'],
          min: 1e-4,
          max: 1e4,
          step: 0.001,
          figures: 4,
        }),
        V('t', 't', 'Temperature in °C', {
          unit: '°C',
          units: ['°C'],
          min: -272.15,
          max: 4726.85,
          step: 0.01,
        }),
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 1,
          max: 5000,
          step: 0.01,
          figures: 5,
        }),
        V('P', 'P', 'Pressure', {
          unit: 'atm',
          units: ['atm'],
          min: 0.001,
          max: 1000,
          step: 0.001,
          figures: 4,
        }),
        V('V', 'V', 'Sample volume', {
          unit: 'L',
          units: ['L'],
          min: 0.001,
          max: 1e4,
          step: 0.001,
          figures: 4,
        }),
        V('n', 'n', 'Amount of gas', { unit: 'mol', min: 1e-9, max: 4e4, figures: 4 }),
        V('m', 'm', 'Sample mass', {
          unit: 'g',
          units: ['g'],
          min: 1e-7,
          max: 1e8,
          step: 0.0001,
          figures: 4,
        }),
        V('M', 'M', 'Molar mass', {
          unit: 'g/mol',
          units: ['g/mol'],
          min: 1,
          max: 1000,
          step: 0.01,
          figures: 4,
        }),
      ],
      ...rels(
        rel('T = t + 273.15', '{T} = {t} + 273.15', ['T', 't'], (v) => v.T! - (v.t! + 273.15), {
          T: [
            (v) => exact(v.t! + 273.15),
            '{t} + 273.15',
            'The gas laws use kelvins, which start 273.15 degrees below 0 °C.',
          ],
          t: [(v) => exact(v.T! - 273.15), '{T} − 273.15', 'Take 273.15 off the kelvins for °C.'],
        }),
        rel(
          'M = dRT ÷ P',
          '{M} = {d} × 0.08206 × {T} ÷ {P}',
          ['M', 'd', 'T', 'P'],
          (v) => v.M! * v.P! - v.d! * R_LATM * v.T!,
          {
            M: [
              (v) => (v.d! * R_LATM * v.T!) / v.P!,
              '{d} × 0.08206 × {T} ÷ {P}',
              'Put n = m ÷ M into PV = nRT: then M = (m ÷ V)RT ÷ P, and m ÷ V is the density.',
            ],
            d: [
              (v) => (v.M! * v.P!) / (R_LATM * v.T!),
              '{M} × {P} ÷ (0.08206 × {T})',
              'Turn M = dRT ÷ P around: d = MP ÷ (RT).',
            ],
            P: [
              (v) => (v.d! * R_LATM * v.T!) / v.M!,
              '{d} × 0.08206 × {T} ÷ {M}',
              'Turn M = dRT ÷ P around: P = dRT ÷ M.',
            ],
            T: [
              (v) => (v.M! * v.P!) / (R_LATM * v.d!),
              '{M} × {P} ÷ (0.08206 × {d})',
              'Turn M = dRT ÷ P around: T = MP ÷ (dR).',
            ],
          },
        ),
        rel(
          'PV = nRT',
          '{P} × {V} = {n} × 0.08206 × {T}',
          ['P', 'V', 'n', 'T'],
          (v) => v.P! * v.V! - v.n! * R_LATM * v.T!,
          {
            n: [
              (v) => (v.P! * v.V!) / (R_LATM * v.T!),
              '{P} × {V} ÷ (0.08206 × {T})',
              'Divide both sides by RT to count the moles in the sample.',
            ],
            V: [
              (v) => (v.n! * R_LATM * v.T!) / v.P!,
              '{n} × 0.08206 × {T} ÷ {P}',
              'Divide both sides by P; with R in L·atm/(mol·K) the volume comes out in liters.',
            ],
            P: [
              (v) => (v.n! * R_LATM * v.T!) / v.V!,
              '{n} × 0.08206 × {T} ÷ {V}',
              'Divide both sides by V; the pressure comes out in atm.',
            ],
            T: [
              (v) => (v.P! * v.V!) / (v.n! * R_LATM),
              '{P} × {V} ÷ ({n} × 0.08206)',
              'Divide both sides by nR.',
            ],
          },
        ),
        rel('d = m ÷ V', '{d} = {m} ÷ {V}', ['d', 'm', 'V'], (v) => v.d! * v.V! - v.m!, {
          m: [(v) => v.d! * v.V!, '{d} × {V}', 'Each liter of the gas weighs d grams.'],
          d: [(v) => v.m! / v.V!, '{m} ÷ {V}', 'Density is the mass of each liter.'],
          V: [(v) => v.m! / v.d!, '{m} ÷ {d}', 'Divide the mass by the grams in each liter.'],
        }),
        rel('n = m ÷ M', '{n} = {m} ÷ {M}', ['n', 'm', 'M'], (v) => v.n! * v.M! - v.m!, {
          n: [(v) => v.m! / v.M!, '{m} ÷ {M}', 'Divide the grams by the grams in each mole.'],
          m: [(v) => v.n! * v.M!, '{n} × {M}', 'Moles times the grams in each mole.'],
          M: [
            (v) => v.m! / v.n!,
            '{m} ÷ {n}',
            'The molar mass is the grams for each mole: a check on M = dRT ÷ P.',
          ],
        }),
      ),
      example: { d, t, T, P, V: vol, n, m, M: m / n },
      startWith: ['d', 't', 'P', 'V'],
      unitSystems: ['metric'],
      pictureLabels: ['t'],
      representation: {
        kind: 'gasPiston',
        law: 'ideal',
        pressure: 'P',
        volume: 'V',
        temperature: 'T',
        moles: 'n',
        R: R_LATM,
        keep: ['n', 'T'],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // Gases → van der Waals: 1.00 mol CO₂ (a = 3.59, b = 0.0427) in 0.500 L at 300 K.
    // P_id = 49.2 atm; P = 53.8 − 14.4 = 39.5 atm; Z = 0.802 (attraction wins).
    const [n, vol, T, a, b] = [1, 0.5, 300, 3.59, 0.0427];
    const Pid = (n * R_LATM * T) / vol;
    const Pf = (n * R_LATM * T) / (vol - n * b);
    const Pa = (a * n * n) / (vol * vol);
    const P = Pf - Pa;
    return {
      id: 'he.chemistry.gen-chem-1#2~real-gas',
      title: 'Real gases: the van der Waals pressure',
      // As the data are given (1.00 mol, 0.500 L, 3.59): 39.5 atm.
      workedFigures: 3,
      use: 'Use this for “Find the pressure of 1.00 mol of CO₂ in 0.500 L at 300 K with the van der Waals equation (a = 3.59 L²·atm/mol², b = 0.0427 L/mol). Compare it with the ideal pressure.”',
      assumptions: [
        'b is the room one mole of the molecules takes up itself, so they move in only V − nb. a measures their pull on each other, which takes an² ÷ V² off the push on the walls.',
        'R = 0.08206 L·atm/(mol·K), so the volume is in liters, the pressures in atm and the temperature in kelvins. Read a and b for your gas from a table.',
        'The compressibility factor Z = PV ÷ nRT is the real pressure over the ideal one: Z < 1 means attraction wins, Z > 1 means the molecules’ own volume wins.',
      ],
      variables: [
        V('n', 'n', 'Amount of gas', {
          unit: 'mol',
          units: ['mol'],
          min: 0.001,
          max: 100,
          step: 0.001,
          figures: 4,
        }),
        V('V', 'V', 'Volume', {
          unit: 'L',
          units: ['L'],
          min: 0.01,
          max: 1000,
          step: 0.001,
          figures: 4,
        }),
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 1,
          max: 5000,
          step: 0.01,
          figures: 5,
        }),
        V('a', 'a', 'Attraction constant', {
          unit: 'L²·atm/mol²',
          units: ['L²·atm/mol²'],
          min: 0,
          max: 50,
          step: 0.001,
          figures: 4,
        }),
        V('b', 'b', 'Excluded volume', {
          unit: 'L/mol',
          units: ['L/mol'],
          min: 0,
          max: 0.5,
          step: 0.0001,
          figures: 4,
        }),
        V('Pid', 'P_id', 'Ideal pressure', { unit: 'atm', min: 1e-6, max: 1e6, figures: 4 }),
        V('Pf', 'P_free', 'Pressure in the free volume', {
          unit: 'atm',
          min: 1e-6,
          max: 1e6,
          figures: 4,
        }),
        V('Pa', 'P_att', 'Pressure lost to attraction', {
          unit: 'atm',
          min: 0,
          max: 1e6,
          figures: 4,
        }),
        V('P', 'P', 'Van der Waals pressure', { unit: 'atm', min: 1e-6, max: 1e6, figures: 4 }),
        V('Z', 'Z', 'Compressibility factor', { min: 0.001, max: 100, figures: 4 }),
      ],
      ...rels(
        rel(
          'P_id = nRT ÷ V',
          '{Pid} = {n} × 0.08206 × {T} ÷ {V}',
          ['Pid', 'n', 'T', 'V'],
          (v) => v.Pid! * v.V! - v.n! * R_LATM * v.T!,
          {
            Pid: [
              (v) => (v.n! * R_LATM * v.T!) / v.V!,
              '{n} × 0.08206 × {T} ÷ {V}',
              'The ideal gas law solved for P: the pressure if the molecules had no size and no pull.',
            ],
            n: [
              (v) => (v.Pid! * v.V!) / (R_LATM * v.T!),
              '{Pid} × {V} ÷ (0.08206 × {T})',
              'Turn the ideal gas law around: n = PV ÷ RT.',
            ],
            T: [
              (v) => (v.Pid! * v.V!) / (v.n! * R_LATM),
              '{Pid} × {V} ÷ ({n} × 0.08206)',
              'Turn the ideal gas law around: T = PV ÷ nR.',
            ],
            V: [
              (v) => (v.n! * R_LATM * v.T!) / v.Pid!,
              '{n} × 0.08206 × {T} ÷ {Pid}',
              'Turn the ideal gas law around: V = nRT ÷ P.',
            ],
          },
        ),
        rule(
          'nb < V',
          '{n} × {b} < {V}',
          ['n', 'b', 'V'],
          (v) => v.n! * v.b! < v.V!,
          'The molecules’ own volume nb must be less than the container’s volume V.',
        ),
        rel(
          'P_free = nRT ÷ (V − nb)',
          '{Pf} = {n} × 0.08206 × {T} ÷ ({V} − {n} × {b})',
          ['Pf', 'n', 'T', 'V', 'b'],
          (v) => v.Pf! * (v.V! - v.n! * v.b!) - v.n! * R_LATM * v.T!,
          {
            Pf: [
              (v) =>
                v.V! > v.n! * v.b! ? (v.n! * R_LATM * v.T!) / (v.V! - v.n! * v.b!) : undefined,
              '{n} × 0.08206 × {T} ÷ ({V} − {n} × {b})',
              'The ideal gas law in the room the molecules leave free, V − nb: less room, more hits on the walls.',
            ],
            V: [
              (v) => v.n! * v.b! + (v.n! * R_LATM * v.T!) / v.Pf!,
              '{n} × {b} + {n} × 0.08206 × {T} ÷ {Pf}',
              'The free volume is nRT ÷ P_free; add back the molecules’ own volume nb.',
            ],
            b: [
              (v) => (v.V! - (v.n! * R_LATM * v.T!) / v.Pf!) / v.n!,
              '({V} − {n} × 0.08206 × {T} ÷ {Pf}) ÷ {n}',
              'Take the free volume nRT ÷ P_free from V, then share what is left among the moles.',
            ],
            T: [
              (v) => (v.Pf! * (v.V! - v.n! * v.b!)) / (v.n! * R_LATM),
              '{Pf} × ({V} − {n} × {b}) ÷ ({n} × 0.08206)',
              'Multiply by the free volume and divide by nR.',
            ],
          },
        ),
        rel(
          'P_att = an² ÷ V²',
          '{Pa} = {a} × {n}² ÷ {V}²',
          ['Pa', 'a', 'n', 'V'],
          (v) => v.Pa! * v.V! * v.V! - v.a! * v.n! * v.n!,
          {
            Pa: [
              (v) => (v.a! * v.n! * v.n!) / (v.V! * v.V!),
              '{a} × {n}² ÷ {V}²',
              'A molecule about to hit the wall is pulled back by its neighbors. Both counts grow with n ÷ V, so the loss goes as a(n ÷ V)².',
            ],
            a: [
              (v) => (v.Pa! * v.V! * v.V!) / (v.n! * v.n!),
              '{Pa} × {V}² ÷ {n}²',
              'Turn P_att = an² ÷ V² around: a = P_att × V² ÷ n².',
            ],
          },
        ),
        rel(
          'P = P_free − P_att',
          '{P} = {Pf} − {Pa}',
          ['P', 'Pf', 'Pa'],
          (v) => v.P! - (v.Pf! - v.Pa!),
          {
            P: [
              (v) => exact(v.Pf! - v.Pa!),
              '{Pf} − {Pa}',
              'The van der Waals equation: the push in the free volume, less what the attraction takes off.',
            ],
            Pf: [(v) => exact(v.P! + v.Pa!), '{P} + {Pa}', 'Add the attraction back on.'],
            Pa: [
              (v) => exact(v.Pf! - v.P!),
              '{Pf} − {P}',
              'The attraction takes off the difference.',
            ],
          },
        ),
        rel('Z = P ÷ P_id', '{Z} = {P} ÷ {Pid}', ['Z', 'P', 'Pid'], (v) => v.Z! * v.Pid! - v.P!, {
          Z: [
            (v) => v.P! / v.Pid!,
            '{P} ÷ {Pid}',
            'Z = PV ÷ nRT is the real pressure over the ideal one at the same n, V and T.',
          ],
          P: [(v) => v.Z! * v.Pid!, '{Z} × {Pid}', 'Multiply the ideal pressure by Z.'],
          Pid: [(v) => v.P! / v.Z!, '{P} ÷ {Z}', 'Divide the real pressure by Z.'],
        }),
      ),
      example: { n, V: vol, T, a, b, Pid, Pf, Pa, P, Z: P / Pid },
      startWith: ['n', 'V', 'T', 'a', 'b'],
      unitSystems: ['metric'],
      representation: {
        kind: 'gasPiston',
        law: 'ideal',
        volume: 'V',
        temperature: 'T',
        moles: 'n',
        R: R_LATM,
        real: { a: 'a', b: 'b', ideal: 'Pid', pressure: 'P', z: 'Z', gas: 'CO₂' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // Gases → kinetic-molecular theory: N₂ (28.01 g/mol) at 300 K. M = 0.02801 kg/mol;
    // u = √(3 × 8.314 × 300 ÷ 0.02801) = 516.9 m/s; KE = 1.5 × 8.314 × 300 = 3741 J/mol.
    // Helium (4.003 g/mol) at the same T: √(3 × 8.314 × 300 ÷ 0.004003) = 1367 m/s.
    const [T, M] = [300, 28.01];
    const Mk = M / 1000;
    const rms = (t: number, kg: number) => Math.sqrt((3 * R_J * t) / kg);
    return {
      id: 'he.chemistry.gen-chem-1#2~kinetic',
      title: 'Kinetic theory: rms speed and kinetic energy',
      use: 'Use this for “Find the root-mean-square speed and the average kinetic energy per mole of N₂ molecules at 300 K.”',
      assumptions: [
        'An ideal gas: the molecules are points that only bounce off each other and the walls, and their speeds follow the Maxwell distribution.',
        'R = 8.314 J/(mol·K). A joule is kg·m²/s², so the molar mass goes in kg/mol for the speed to come out in m/s.',
        'The average kinetic energy per mole, (3/2)RT, depends on T only. At the same T a lighter gas moves faster: helium is dashed beside yours.',
      ],
      variables: [
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 1,
          max: 5000,
          step: 0.01,
          figures: 4,
        }),
        V('M', 'M', 'Molar mass', {
          unit: 'g/mol',
          units: ['g/mol'],
          min: 1,
          max: 1000,
          step: 0.001,
          figures: 4,
        }),
        V('Mk', 'M_kg', 'Molar mass in kg/mol', {
          unit: 'kg/mol',
          units: ['kg/mol'],
          min: 0.001,
          max: 1,
          figures: 4,
        }),
        V('u', 'u', 'Root-mean-square speed', {
          unit: 'm/s',
          units: ['m/s'],
          min: rms(1, 1),
          max: rms(5000, 0.001),
          step: 0.1,
          figures: 4,
        }),
        V('KE', 'KE', 'Average kinetic energy per mole', {
          unit: 'J/mol',
          units: ['J/mol'],
          min: 1.5 * R_J,
          max: 1.5 * R_J * 5000,
          step: 0.1,
          figures: 4,
        }),
        V('uHe', 'u_He', 'Helium’s rms speed at the same temperature', {
          unit: 'm/s',
          units: ['m/s'],
          min: rms(1, HE_KG),
          max: rms(5000, HE_KG),
          figures: 4,
          derived: true,
        }),
      ],
      ...rels(
        rel('M_kg = M ÷ 1000', '{Mk} = {M} ÷ 1000', ['Mk', 'M'], (v) => v.Mk! * 1000 - v.M!, {
          Mk: [
            (v) => exact(v.M! / 1000),
            '{M} ÷ 1000',
            'R is in joules, and a joule is kg·m²/s², so the molar mass must be in kg/mol: divide the grams by 1000.',
          ],
          M: [(v) => exact(v.Mk! * 1000), '{Mk} × 1000', 'Back to grams per mole.'],
        }),
        rel(
          'u = √(3RT ÷ M)',
          '{u} = √(3 × 8.314 × {T} ÷ {Mk})',
          ['u', 'T', 'Mk'],
          (v) => v.u! * v.u! * v.Mk! - 3 * R_J * v.T!,
          {
            u: [
              (v) => rms(v.T!, v.Mk!),
              '√(3 × 8.314 × {T} ÷ {Mk})',
              'Set (1/2)Mu² equal to (3/2)RT and solve for u: the square root of the mean of the squared speeds.',
            ],
            T: [
              (v) => (v.u! * v.u! * v.Mk!) / (3 * R_J),
              '{u}² × {Mk} ÷ (3 × 8.314)',
              'Square both sides and solve for T: T = Mu² ÷ 3R.',
            ],
            Mk: [
              (v) => (3 * R_J * v.T!) / (v.u! * v.u!),
              '3 × 8.314 × {T} ÷ {u}²',
              'Square both sides and solve for M: M = 3RT ÷ u².',
            ],
          },
        ),
        rel(
          'KE = (3/2)RT',
          '{KE} = 3 ÷ 2 × 8.314 × {T}',
          ['KE', 'T'],
          (v) => v.KE! - 1.5 * R_J * v.T!,
          {
            KE: [
              (v) => exact(1.5 * R_J * v.T!),
              '3 ÷ 2 × 8.314 × {T}',
              'The average kinetic energy of a mole of molecules is (3/2)RT, whatever the gas.',
            ],
            T: [
              (v) => v.KE! / (1.5 * R_J),
              '{KE} ÷ (3 ÷ 2 × 8.314)',
              'Divide the energy by (3/2)R.',
            ],
          },
        ),
        derive(
          'u_He = √(3RT ÷ M_He)',
          '{uHe} = √(3 × 8.314 × {T} ÷ 0.004003)',
          'uHe',
          ['T'],
          (v) => rms(v.T!, HE_KG),
          '√(3 × 8.314 × {T} ÷ 0.004003)',
          'Helium (0.004003 kg/mol) at the same temperature has the same kinetic energy, so being lighter it moves faster (dashed).',
        ),
      ),
      example: { T, M, Mk, u: rms(T, Mk), KE: 1.5 * R_J * T, uHe: rms(T, HE_KG) },
      startWith: ['T', 'M'],
      unitSystems: ['metric'],
      representation: {
        kind: 'functionGraph',
        family: 'distribution',
        distribution: 'maxwell',
        molar: 'M',
        T: 'T',
        R: R_J,
        compare: { molar: HE_KG * 1000, gas: 'He' },
        speeds: { rms: 'u' },
        name: 'f',
        input: 'v',
        axes: { x: 'Speed v (m/s)', y: 'f(v) (10⁻³ s/m)' },
        fixed: true,
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // Gases → a gas collected over water: H₂ in 0.250 L at 25 °C, 755 torr in all, water's
    // vapor 23.8 torr. P_H₂ = 731.2 torr = 0.9621 atm; n = 0.9621 × 0.250 ÷ (0.08206 × 298.15)
    // = 9.83 × 10⁻³ mol.
    const [Ptot, Pw, vol, t] = [755, 23.8, 0.25, 25];
    const Pgas = Ptot - Pw;
    const Patm = Pgas / 760;
    const T = t + 273.15;
    return {
      id: 'he.chemistry.gen-chem-1#2~over-water',
      title: 'A gas collected over water',
      // As the data are given (0.250 L, 755 torr): 9.83 × 10⁻³ mol.
      workedFigures: 3,
      use: 'Use this for “Hydrogen is collected over water: 0.250 L at 25 °C and 755 torr in all. Water’s vapor pressure is 23.8 torr. How many moles of hydrogen were collected?”',
      assumptions: [
        'The bottle holds the gas and water vapor together. By Dalton’s law their partial pressures add to the total, which matches the room’s pressure when the water levels are even.',
        'Read water’s vapor pressure at the water’s temperature from a table: 23.8 torr at 25 °C, 17.5 torr at 20 °C, 31.8 torr at 30 °C.',
        'The gas is ideal. R = 0.08206 L·atm/(mol·K), so the pressure goes in atm (760 torr = 1 atm), the volume in liters and the temperature in kelvins.',
      ],
      variables: [
        V('Ptot', 'P_total', 'Total pressure', {
          unit: 'torr',
          units: ['torr'],
          min: 10,
          max: 7600,
          step: 0.1,
          figures: 4,
        }),
        V('Pw', 'P_water', 'Water’s vapor pressure', {
          unit: 'torr',
          units: ['torr'],
          min: 0,
          max: 760,
          step: 0.1,
          figures: 3,
        }),
        V('Pgas', 'P_gas', 'Pressure of the dry gas', {
          unit: 'torr',
          units: ['torr'],
          min: 0.001,
          max: 7600,
          step: 0.1,
          figures: 4,
        }),
        V('Patm', 'P_atm', 'Pressure of the dry gas in atm', {
          unit: 'atm',
          units: ['atm'],
          min: 0.001 / 760,
          max: 10,
          figures: 4,
        }),
        V('V', 'V', 'Volume collected', {
          unit: 'L',
          units: ['L'],
          min: 0.001,
          max: 1000,
          step: 0.001,
          figures: 4,
        }),
        V('t', 't', 'Temperature in °C', {
          unit: '°C',
          units: ['°C'],
          min: 0,
          max: 100,
          step: 0.01,
        }),
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 273.15,
          max: 373.15,
          step: 0.01,
          figures: 5,
        }),
        V('n', 'n', 'Amount of the gas', { unit: 'mol', min: 1e-12, max: 1000, figures: 4 }),
      ],
      ...rels(
        rule(
          'P_water < P_total',
          '{Pw} < {Ptot}',
          ['Pw', 'Ptot'],
          (v) => v.Pw! < v.Ptot!,
          'Water’s vapor is only part of the gas in the bottle, so its pressure must be less than the total.',
        ),
        rel(
          'P_gas = P_total − P_water',
          '{Pgas} = {Ptot} − {Pw}',
          ['Pgas', 'Ptot', 'Pw'],
          (v) => v.Pgas! - (v.Ptot! - v.Pw!),
          {
            Pgas: [
              (v) => exact(v.Ptot! - v.Pw!),
              '{Ptot} − {Pw}',
              'Dalton’s law: the total is the gas plus the water vapor, so take the vapor off.',
            ],
            Ptot: [
              (v) => exact(v.Pgas! + v.Pw!),
              '{Pgas} + {Pw}',
              'Dalton’s law: the partial pressures add to the total.',
            ],
            Pw: [
              (v) => exact(v.Ptot! - v.Pgas!),
              '{Ptot} − {Pgas}',
              'The water vapor makes up what the dry gas does not.',
            ],
          },
        ),
        rel(
          'P_atm = P_gas ÷ 760',
          '{Patm} = {Pgas} ÷ 760',
          ['Patm', 'Pgas'],
          (v) => v.Patm! * 760 - v.Pgas!,
          {
            Patm: [
              (v) => v.Pgas! / 760,
              '{Pgas} ÷ 760',
              'R is in L·atm/(mol·K), so change torr to atm: 760 torr make 1 atm.',
            ],
            Pgas: [(v) => exact(v.Patm! * 760), '{Patm} × 760', 'Back to torr: 760 in each atm.'],
          },
        ),
        rel('T = t + 273.15', '{T} = {t} + 273.15', ['T', 't'], (v) => v.T! - (v.t! + 273.15), {
          T: [
            (v) => exact(v.t! + 273.15),
            '{t} + 273.15',
            'The gas laws use kelvins, which start 273.15 degrees below 0 °C.',
          ],
          t: [(v) => exact(v.T! - 273.15), '{T} − 273.15', 'Take 273.15 off the kelvins for °C.'],
        }),
        rel(
          'PV = nRT',
          '{Patm} × {V} = {n} × 0.08206 × {T}',
          ['Patm', 'V', 'n', 'T'],
          (v) => v.Patm! * v.V! - v.n! * R_LATM * v.T!,
          {
            n: [
              (v) => (v.Patm! * v.V!) / (R_LATM * v.T!),
              '{Patm} × {V} ÷ (0.08206 × {T})',
              'Only the dry gas’s own pressure counts its moles: divide PV by RT.',
            ],
            V: [
              (v) => (v.n! * R_LATM * v.T!) / v.Patm!,
              '{n} × 0.08206 × {T} ÷ {Patm}',
              'Divide nRT by the dry gas’s pressure; the volume comes out in liters.',
            ],
            Patm: [
              (v) => (v.n! * R_LATM * v.T!) / v.V!,
              '{n} × 0.08206 × {T} ÷ {V}',
              'Divide nRT by V for the dry gas’s pressure in atm.',
            ],
            T: [
              (v) => (v.Patm! * v.V!) / (v.n! * R_LATM),
              '{Patm} × {V} ÷ ({n} × 0.08206)',
              'Divide PV by nR.',
            ],
          },
        ),
      ),
      example: {
        Ptot,
        Pw,
        Pgas,
        Patm,
        V: vol,
        t,
        T,
        n: (Patm * vol) / (R_LATM * T),
      },
      startWith: ['Ptot', 'Pw', 'V', 't'],
      unitSystems: ['metric'],
      representation: {
        kind: 'gasPiston',
        law: 'ideal',
        mixture: {
          gases: [
            { formula: 'H2', pressure: 'Pgas' },
            { formula: 'H2O', pressure: 'Pw' },
          ],
          total: 'Ptot',
        },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Gases: the volume of gas a reaction makes. 5.00 g KClO₃
    // (122.55 g/mol) → 0.04080 mol; 2KClO₃ → 2KCl + 3O₂, so × 3/2 → 0.06120 mol O₂;
    // V = 0.06120 × 0.08206 × 298.15 ÷ 1.00 = 1.50 L.
    const [m, M, r, t, P] = [5, 122.55, 1.5, 25, 1];
    const n1 = m / M;
    const n2 = r * n1;
    const T = t + 273.15;
    return {
      id: 'he.chemistry.gen-chem-1#2~gas-stoich',
      title: 'The volume of gas a reaction makes',
      // As the data are given (5.00 g, 1.00 atm): 1.50 L.
      workedFigures: 3,
      use: 'Use this for “2KClO₃ → 2KCl + 3O₂. What volume of O₂ at 25 °C and 1.00 atm does 5.00 g of KClO₃ make?”',
      assumptions: [
        'The reactant you weigh is used up completely, and every mole of it makes product by the balanced equation.',
        'The mole ratio r is the gas’s coefficient over the reactant’s: 3 mol of O₂ for each 2 mol of KClO₃ gives 3/2. Read r from your own balanced equation.',
        'The gas is ideal. R = 0.08206 L·atm/(mol·K), so the pressure goes in atm, the volume comes out in liters and the temperature is in kelvins.',
      ],
      variables: [
        V('m', 'm', 'Mass of the reactant', {
          unit: 'g',
          units: ['g'],
          min: 0.001,
          max: 10000,
          step: 0.001,
          figures: 4,
        }),
        V('M', 'M', 'Molar mass of the reactant', {
          unit: 'g/mol',
          units: ['g/mol'],
          min: 1,
          max: 1000,
          step: 0.01,
          figures: 5,
        }),
        V('n1', 'n₁', 'Moles of the reactant', { unit: 'mol', min: 1e-9, max: 10000, figures: 4 }),
        V('r', 'r', 'Mole ratio (gas per reactant)', {
          min: 0.1,
          max: 10,
          step: 0.001,
          allowed: [1, 2, 3, 0.5, 1 / 3, 1.5, 2 / 3],
        }),
        V('n2', 'n₂', 'Moles of the gas', { unit: 'mol', min: 1e-9, max: 100000, figures: 4 }),
        V('t', 't', 'Temperature in °C', {
          unit: '°C',
          units: ['°C'],
          min: -200,
          max: 1000,
          step: 0.01,
        }),
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 73.15,
          max: 1273.15,
          step: 0.01,
          figures: 5,
        }),
        V('P', 'P', 'Pressure', {
          unit: 'atm',
          units: ['atm'],
          min: 0.001,
          max: 100,
          step: 0.001,
          figures: 4,
        }),
        V('V', 'V', 'Volume of the gas', {
          unit: 'L',
          units: ['L'],
          min: 1e-6,
          max: 1e7,
          step: 0.001,
          figures: 4,
        }),
      ],
      ...rels(
        rel('n₁ = m ÷ M', '{n1} = {m} ÷ {M}', ['n1', 'm', 'M'], (v) => v.n1! * v.M! - v.m!, {
          n1: [
            (v) => v.m! / v.M!,
            '{m} ÷ {M}',
            'Grams over the molar mass counts the moles of the reactant.',
          ],
          m: [(v) => v.n1! * v.M!, '{n1} × {M}', 'Moles times the molar mass gives grams.'],
          M: [(v) => v.m! / v.n1!, '{m} ÷ {n1}', 'Grams per mole of the reactant.'],
        }),
        rel('n₂ = r·n₁', '{n2} = {r} × {n1}', ['n2', 'r', 'n1'], (v) => v.n2! - v.r! * v.n1!, {
          n2: [
            (v) => v.r! * v.n1!,
            '{r} × {n1}',
            'The mole ratio from the balanced equation carries the moles from the reactant to the gas.',
          ],
          n1: [(v) => v.n2! / v.r!, '{n2} ÷ {r}', 'Divide the moles of gas by the ratio.'],
          r: [
            (v) => v.n2! / v.n1!,
            '{n2} ÷ {n1}',
            'Divide the moles of gas by the moles of reactant.',
          ],
        }),
        rel('T = t + 273.15', '{T} = {t} + 273.15', ['T', 't'], (v) => v.T! - (v.t! + 273.15), {
          T: [
            (v) => exact(v.t! + 273.15),
            '{t} + 273.15',
            'The gas laws use kelvins, which start 273.15 degrees below 0 °C.',
          ],
          t: [(v) => exact(v.T! - 273.15), '{T} − 273.15', 'Take 273.15 off the kelvins for °C.'],
        }),
        rel(
          'PV = nRT',
          '{P} × {V} = {n2} × 0.08206 × {T}',
          ['P', 'V', 'n2', 'T'],
          (v) => v.P! * v.V! - v.n2! * R_LATM * v.T!,
          {
            V: [
              (v) => (v.n2! * R_LATM * v.T!) / v.P!,
              '{n2} × 0.08206 × {T} ÷ {P}',
              'The ideal gas law for the gas alone: V = nRT ÷ P, in liters.',
            ],
            n2: [
              (v) => (v.P! * v.V!) / (R_LATM * v.T!),
              '{P} × {V} ÷ (0.08206 × {T})',
              'Divide PV by RT for the moles of gas.',
            ],
            P: [
              (v) => (v.n2! * R_LATM * v.T!) / v.V!,
              '{n2} × 0.08206 × {T} ÷ {V}',
              'Divide nRT by V for the pressure in atm.',
            ],
            T: [
              (v) => (v.P! * v.V!) / (v.n2! * R_LATM),
              '{P} × {V} ÷ ({n2} × 0.08206)',
              'Divide PV by nR.',
            ],
          },
        ),
      ),
      example: { m, M, n1, r, n2, t, T, P, V: (n2 * R_LATM * T) / P },
      startWith: ['m', 'M', 'r', 't', 'P'],
      unitSystems: ['metric'],
      representation: {
        kind: 'moleMap',
        moles: 'n1',
        mass: 'm',
        // No formula on the reactant: its molar mass is the page's typed M.
        molarMass: 'M',
        second: { formula: 'O2', ratio: [1, 'r'], moles: 'n2' },
        gas: { temperature: 'T', pressure: 'P', volume: 'V' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Thermochemistry: ΔH per mole from a coffee-cup calorimeter.
    // 50.0 mL of 1.00 M HCl + 50.0 mL of 1.00 M NaOH (100.0 g, 0.0500 mol of water formed)
    // warm from 22.00 °C to 28.70 °C: q = 100.0 × 4.184 × 6.70 = 2803 J; ΔH = −56.1 kJ/mol.
    const [m, c, T1, T2, n] = [100, 4.184, 22, 28.7, 0.05];
    const dT = exact(T2 - T1);
    const q = m * c * dT;
    return {
      id: 'he.chemistry.gen-chem-1#3',
      // As the data are given (6.70 °C, 0.0500 mol): −56.1 kJ/mol.
      workedFigures: 3,
      use: 'Use this for “50 mL of 1.00 M HCl and 50 mL of 1.00 M NaOH are mixed in a coffee-cup calorimeter. The temperature rises from 22.00 °C to 28.70 °C. Find ΔH per mole of water formed.”',
      assumptions: [
        'The solution has water’s density (1.00 g/mL) and specific heat (4.184 J/(g·°C)), so 100 mL of it weighs 100 g.',
        'No heat goes into the cup or the air: the solution takes in all the heat the reaction gives off.',
        'The reaction’s heat is −q, so a temperature rise means ΔH < 0 (exothermic). ΔH is per mole of the reaction as written, here per mole of water formed.',
      ],
      variables: [
        V('m', 'm', 'Mass of the solution', {
          unit: 'g',
          units: ['g'],
          min: 1,
          max: 5000,
          step: 0.1,
          figures: 4,
        }),
        V('c', 'c', 'Specific heat of the solution', {
          unit: 'J/(g·°C)',
          units: ['J/(g·°C)'],
          min: 0.1,
          max: 10,
          step: 0.001,
          figures: 4,
        }),
        V('T1', 'T₁', 'Starting temperature', {
          unit: '°C',
          units: ['°C'],
          min: -20,
          max: 100,
          step: 0.01,
        }),
        V('T2', 'T₂', 'Final temperature', {
          unit: '°C',
          units: ['°C'],
          min: -20,
          max: 100,
          step: 0.01,
        }),
        V('dT', 'ΔT', 'Change in temperature', {
          unit: '°C',
          units: ['°C'],
          min: -120,
          max: 120,
          step: 0.01,
        }),
        V('q', 'q', 'Heat the solution takes in', {
          unit: 'J',
          units: ['J'],
          min: -1e7,
          max: 1e7,
          step: 0.1,
          figures: 4,
        }),
        V('n', 'n', 'Moles that react', {
          unit: 'mol',
          min: 1e-6,
          max: 100,
          step: 0.0001,
          figures: 4,
        }),
        V('dH', 'ΔH', 'Enthalpy change per mole', {
          unit: 'kJ/mol',
          units: ['kJ/mol'],
          min: -1e5,
          max: 1e5,
          step: 0.01,
          figures: 4,
        }),
      ],
      ...rels(
        rel(
          'ΔT = T₂ − T₁',
          '{dT} = {T2} − {T1}',
          ['dT', 'T2', 'T1'],
          (v) => v.dT! - (v.T2! - v.T1!),
          {
            dT: [
              (v) => exact(v.T2! - v.T1!),
              '{T2} − {T1}',
              'The change is the final temperature less the starting one: a rise is positive.',
            ],
            T2: [
              (v) => exact(v.T1! + v.dT!),
              '{T1} + {dT}',
              'Add the change to the starting temperature.',
            ],
            T1: [
              (v) => exact(v.T2! - v.dT!),
              '{T2} − {dT}',
              'Take the change off the final temperature.',
            ],
          },
        ),
        rel(
          'q = mcΔT',
          '{q} = {m} × {c} × {dT}',
          ['q', 'm', 'c', 'dT'],
          (v) => v.q! - v.m! * v.c! * v.dT!,
          {
            q: [
              (v) => v.m! * v.c! * v.dT!,
              '{m} × {c} × {dT}',
              'The solution’s heat: its mass times its specific heat times how much it warmed.',
            ],
            m: [(v) => v.q! / (v.c! * v.dT!), '{q} ÷ ({c} × {dT})', 'Divide the heat by cΔT.'],
            c: [(v) => v.q! / (v.m! * v.dT!), '{q} ÷ ({m} × {dT})', 'Divide the heat by mΔT.'],
            dT: [(v) => v.q! / (v.m! * v.c!), '{q} ÷ ({m} × {c})', 'Divide the heat by mc.'],
          },
        ),
        rel(
          'ΔH = −q ÷ (1000n)',
          '{dH} = −{q} ÷ (1000 × {n})',
          ['dH', 'q', 'n'],
          (v) => v.dH! * v.n! * 1000 + v.q!,
          {
            dH: [
              (v) => -v.q! / (1000 * v.n!),
              '−{q} ÷ (1000 × {n})',
              'The reaction gave off what the solution took in, so its heat is −q. Share it among the moles; ÷ 1000 turns J into kJ.',
            ],
            q: [
              (v) => -1000 * v.dH! * v.n!,
              '−1000 × {dH} × {n}',
              'The reaction’s heat is ΔH times the moles, in J; the solution takes in the opposite.',
            ],
            n: [
              // No heat says nothing about the moles (0 ÷ ΔH would read as none reacting).
              (v) => (v.q === 0 ? undefined : -v.q! / (1000 * v.dH!)),
              '−{q} ÷ (1000 × {dH})',
              'Divide the reaction’s heat, −q in kJ, by the heat for each mole.',
            ],
          },
        ),
      ),
      example: { m, c, T1, T2, dT, q, n, dH: -q / (1000 * n) },
      startWith: ['m', 'c', 'T1', 'T2', 'n'],
      unitSystems: ['metric'],
      representation: {
        kind: 'energyProfile',
        mode: 'calorimeter',
        mass: 'm',
        heat: 'c',
        start: 'T1',
        end: 'T2',
        change: 'dT',
        q: 'q',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Thermochemistry: ΔU and ΔH of combustion from a bomb calorimeter.
    // 0.6400 g of naphthalene (128.17 g/mol; C₁₀H₈ + 12O₂ → 10CO₂ + 4H₂O(l), Δn_g = 10 − 12 = −2)
    // warms a 10.00 kJ/°C calorimeter by 2.570 °C: q = 25.70 kJ, n = 0.004993 mol,
    // ΔU = −25.70 ÷ 0.004993 = −5147 kJ/mol; ΔH = −5147 + (−2) × 0.008314 × 298.15 = −5152 kJ/mol.
    const [m, M, Ccal, dT, dng, T] = [0.64, 128.17, 10, 2.57, -2, 298.15];
    const R_KJ = R_J / 1000; // 0.008314 kJ/(mol·K)
    const n = m / M;
    const q = Ccal * dT;
    const dU = -q / n;
    return {
      id: 'he.chemistry.gen-chem-1#3~bomb',
      title: 'ΔU and ΔH from a bomb calorimeter',
      use: 'Use this for “0.6400 g of naphthalene, C₁₀H₈ (128.17 g/mol), burns in a bomb calorimeter of 10.00 kJ/°C, and the water warms by 2.570 °C. Find ΔU and ΔH of combustion at 25 °C.”',
      assumptions: [
        'The bomb is sealed, so the volume stays constant and no work is done: the heat the calorimeter takes in is −ΔU of the burning.',
        'The calorimeter constant C_cal covers the bomb, the bucket and its water together, and no heat leaks out of the jacket.',
        'Δn_g is moles of gas made less moles of gas used, from the balanced equation with water as a liquid: C₁₀H₈ + 12O₂ → 10CO₂ + 4H₂O gives 10 − 12 = −2.',
        'R = 0.008314 kJ/(mol·K) and T is in kelvins (25 °C is 298.15 K).',
      ],
      variables: [
        V('m', 'm', 'Mass of the sample', {
          unit: 'g',
          units: ['g'],
          min: 0.0001,
          max: 100,
          step: 0.0001,
          figures: 4,
        }),
        V('M', 'M', 'Molar mass of the sample', {
          unit: 'g/mol',
          units: ['g/mol'],
          min: 1,
          max: 1000,
          step: 0.01,
          figures: 5,
        }),
        V('n', 'n', 'Moles burned', { unit: 'mol', min: 1e-9, max: 10, figures: 4 }),
        V('C', 'C_cal', 'Calorimeter constant', {
          unit: 'kJ/°C',
          units: ['kJ/°C'],
          min: 0.01,
          max: 100,
          step: 0.001,
          figures: 4,
        }),
        V('dT', 'ΔT', 'Temperature rise', {
          unit: '°C',
          units: ['°C'],
          min: 0.001,
          max: 100,
          step: 0.001,
          figures: 4,
        }),
        V('q', 'q', 'Heat the calorimeter takes in', {
          unit: 'kJ',
          units: ['kJ'],
          min: 0.0001,
          max: 10000,
          step: 0.0001,
          figures: 4,
        }),
        V('dU', 'ΔU', 'Energy change of combustion per mole', {
          unit: 'kJ/mol',
          units: ['kJ/mol'],
          min: -1e5,
          max: -0.01,
          step: 0.01,
          figures: 4,
        }),
        V('dng', 'Δn_g', 'Change in moles of gas', { min: -20, max: 20, step: 0.5 }),
        V('T', 'T', 'Temperature', {
          unit: 'K',
          units: ['K'],
          min: 200,
          max: 1000,
          step: 0.01,
          figures: 5,
        }),
        V('dH', 'ΔH', 'Enthalpy of combustion per mole', {
          unit: 'kJ/mol',
          units: ['kJ/mol'],
          min: -1e5,
          max: 1e5,
          step: 0.01,
          figures: 4,
        }),
      ],
      ...rels(
        rel('n = m ÷ M', '{n} = {m} ÷ {M}', ['n', 'm', 'M'], (v) => v.n! * v.M! - v.m!, {
          n: [
            (v) => v.m! / v.M!,
            '{m} ÷ {M}',
            'Grams over the molar mass counts the moles burned.',
          ],
          m: [(v) => v.n! * v.M!, '{n} × {M}', 'Moles times the molar mass gives grams.'],
          M: [(v) => v.m! / v.n!, '{m} ÷ {n}', 'Grams per mole of the sample.'],
        }),
        rel('q = C_cal ΔT', '{q} = {C} × {dT}', ['q', 'C', 'dT'], (v) => v.q! - v.C! * v.dT!, {
          q: [
            (v) => v.C! * v.dT!,
            '{C} × {dT}',
            'The whole calorimeter takes in C_cal kilojoules for each degree it warms.',
          ],
          C: [(v) => v.q! / v.dT!, '{q} ÷ {dT}', 'Divide the heat by the temperature rise.'],
          dT: [(v) => v.q! / v.C!, '{q} ÷ {C}', 'Divide the heat by the calorimeter constant.'],
        }),
        rel('ΔU = −q ÷ n', '{dU} = −{q} ÷ {n}', ['dU', 'q', 'n'], (v) => v.dU! * v.n! + v.q!, {
          dU: [
            (v) => -v.q! / v.n!,
            '−{q} ÷ {n}',
            'The burning sample gave off what the calorimeter took in, so its heat is −q. At constant volume that is ΔU; share it among the moles.',
          ],
          q: [
            (v) => -v.dU! * v.n!,
            '−{dU} × {n}',
            'The sample’s energy change is ΔU times the moles; the calorimeter takes in the opposite.',
          ],
          n: [
            (v) => -v.q! / v.dU!,
            '−{q} ÷ {dU}',
            'Divide the sample’s heat, −q, by the energy for each mole.',
          ],
        }),
        rel(
          'ΔH = ΔU + Δn_g RT',
          '{dH} = {dU} + {dng} × 0.008314 × {T}',
          ['dH', 'dU', 'dng', 'T'],
          (v) => v.dH! - v.dU! - v.dng! * R_KJ * v.T!,
          {
            dH: [
              (v) => v.dU! + v.dng! * R_KJ * v.T!,
              '{dU} + {dng} × 0.008314 × {T}',
              'At constant pressure the gases made or used would push on the air: add Δn_g RT, with R in kJ.',
            ],
            dU: [
              (v) => v.dH! - v.dng! * R_KJ * v.T!,
              '{dH} − {dng} × 0.008314 × {T}',
              'Take Δn_g RT off ΔH.',
            ],
          },
        ),
      ),
      example: { m, M, n, C: Ccal, dT, q, dU, dng, T, dH: dU + dng * R_KJ * T },
      startWith: ['m', 'M', 'C', 'dT', 'dng', 'T'],
      unitSystems: ['metric'],
      representation: {
        kind: 'energyProfile',
        mode: 'bomb',
        constant: 'C',
        change: 'dT',
        q: 'q',
        sample: { name: 'naphthalene', mass: 'm', moles: 'n', molar: 'M' },
        deltaU: 'dU',
        deltaH: 'dH',
        gas: 'dng',
        temperature: 'T',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Thermochemistry: ΔH estimated from average bond enthalpies.
    // CH₄ + 2O₂ → CO₂ + 2H₂O(g). Broken: 4 C–H and 2 O=O, 4 × 413 + 2 × 495 = 2642 kJ.
    // Formed: 2 C=O and 4 O–H, 2 × 799 + 4 × 463 = 3450 kJ. ΔH = 2642 − 3450 = −808 kJ/mol.
    const [ch, oo, co, oh] = [413, 495, 799, 463];
    const B = 4 * ch + 2 * oo;
    const F = 2 * co + 4 * oh;
    const bond = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, {
        unit: 'kJ/mol',
        units: ['kJ/mol'],
        min: 1,
        max: 2000,
        step: 1,
      });
    const sum = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, {
        unit: 'kJ/mol',
        units: ['kJ/mol'],
        min: 1,
        max: 20000,
        step: 1,
      });
    return {
      id: 'he.chemistry.gen-chem-1#3~bond-enthalpy',
      title: 'ΔH from bond enthalpies',
      use: 'Use this for “Estimate ΔH for CH₄ + 2O₂ → CO₂ + 2H₂O(g) from the average bond enthalpies C–H 413, O=O 495, C=O 799 and O–H 463 kJ/mol.”',
      assumptions: [
        'Bond enthalpies are averages over many molecules in the gas phase, so the answer is an estimate, often a few percent off the measured ΔH.',
        'Every substance is a gas: the water is steam. Liquid water would also give off its heat of condensation.',
        'Breaking a bond takes in its enthalpy and forming one gives the same amount back. CH₄ has 4 C–H bonds, O₂ one O=O, CO₂ two C=O and H₂O two O–H.',
      ],
      variables: [
        bond('ch', 'D(C–H)', 'Bond enthalpy of C–H'),
        bond('oo', 'D(O=O)', 'Bond enthalpy of O=O'),
        bond('co', 'D(C=O)', 'Bond enthalpy of C=O'),
        bond('oh', 'D(O–H)', 'Bond enthalpy of O–H'),
        sum('B', 'B', 'Energy taken in to break the bonds'),
        sum('F', 'F', 'Energy given off forming the bonds'),
        V('dH', 'ΔH', 'Enthalpy change of the reaction', {
          unit: 'kJ/mol',
          units: ['kJ/mol'],
          min: -20000,
          max: 20000,
          step: 1,
        }),
      ],
      ...rels(
        rel(
          'B = 4D(C–H) + 2D(O=O)',
          '{B} = 4 × {ch} + 2 × {oo}',
          ['B', 'ch', 'oo'],
          (v) => v.B! - (4 * v.ch! + 2 * v.oo!),
          {
            B: [
              (v) => 4 * v.ch! + 2 * v.oo!,
              '4 × {ch} + 2 × {oo}',
              'Break every bond in the reactants: four C–H in CH₄ and one O=O in each of the two O₂.',
            ],
            ch: [
              (v) => (v.B! - 2 * v.oo!) / 4,
              '({B} − 2 × {oo}) ÷ 4',
              'Take the two O=O bonds off and share the rest among the four C–H bonds.',
            ],
            oo: [
              (v) => (v.B! - 4 * v.ch!) / 2,
              '({B} − 4 × {ch}) ÷ 2',
              'Take the four C–H bonds off and share the rest between the two O=O bonds.',
            ],
          },
        ),
        rel(
          'F = 2D(C=O) + 4D(O–H)',
          '{F} = 2 × {co} + 4 × {oh}',
          ['F', 'co', 'oh'],
          (v) => v.F! - (2 * v.co! + 4 * v.oh!),
          {
            F: [
              (v) => 2 * v.co! + 4 * v.oh!,
              '2 × {co} + 4 × {oh}',
              'Form every bond in the products: two C=O in CO₂ and two O–H in each of the two H₂O.',
            ],
            co: [
              (v) => (v.F! - 4 * v.oh!) / 2,
              '({F} − 4 × {oh}) ÷ 2',
              'Take the four O–H bonds off and share the rest between the two C=O bonds.',
            ],
            oh: [
              (v) => (v.F! - 2 * v.co!) / 4,
              '({F} − 2 × {co}) ÷ 4',
              'Take the two C=O bonds off and share the rest among the four O–H bonds.',
            ],
          },
        ),
        rel('ΔH = B − F', '{dH} = {B} − {F}', ['dH', 'B', 'F'], (v) => v.dH! - (v.B! - v.F!), {
          dH: [
            (v) => v.B! - v.F!,
            '{B} − {F}',
            'Energy in to break bonds less energy out from forming them. More out than in means ΔH < 0.',
          ],
          B: [(v) => v.dH! + v.F!, '{dH} + {F}', 'Add the energy given off back to ΔH.'],
          F: [(v) => v.B! - v.dH!, '{B} − {dH}', 'The energy taken in less ΔH.'],
        }),
      ),
      example: { ch, oo, co, oh, B, F, dH: B - F },
      startWith: ['ch', 'oo', 'co', 'oh'],
      unitSystems: ['metric'],
      representation: {
        kind: 'energyProfile',
        mode: 'ladder',
        unit: 'kJ/mol',
        levels: [
          { name: 'CH₄ + 2O₂', value: 0 },
          { name: 'C + 4H + 4O', value: 'B' },
          { name: 'CO₂ + 2H₂O', value: 'dH' },
        ],
        steps: [
          { from: 0, to: 1, value: 'B', label: 'Bonds broken' },
          { from: 1, to: 2, label: 'Bonds formed' },
        ],
        total: { from: 0, to: 2, value: 'dH' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Bonding and molecular geometry: shapes with 5 and 6 domains.
    // XeF₄: V = 8 + 4 × 7 = 36, b = 4, each F keeps 3 lone pairs (o = 24):
    // l = (36 − 8 − 24) ÷ 2 = 2, d = 6 → sp³d², square planar, 90°.
    const [Vt, b, o] = [36, 4, 24];
    const l = (Vt - 2 * b - o) / 2;
    const d = b + l;
    const count = (id: string, symbol: string, name: string, min: number, max: number) =>
      V(id, symbol, name, { min, max, step: 1, integer: true });
    return {
      id: 'he.chemistry.gen-chem-1#4',
      use: 'Use this for “XeF₄ has 36 valence electrons. Find the lone pairs on xenon, the shape, the smallest bond angle and the hybridization.”',
      assumptions: [
        'V counts the valence electrons of every atom, plus one for each negative charge of an ion and less one for each positive charge.',
        'Each outer atom first fills its octet with lone pairs (a halogen keeps three, so o = 6 for each); the central atom takes what is left.',
        'Lone pairs take the roomiest places: equatorial in 5 domains, opposite each other in 6. The shape is named by the atoms only.',
        'The hybrid orbitals on the center equal the domains: 2 sp, 3 sp², 4 sp³, 5 sp³d, 6 sp³d².',
      ],
      variables: [
        count('Vt', 'V', 'Total valence electrons', 2, 60),
        count('b', 'b', 'Bonded atoms on the center', 2, 6),
        count('o', 'o', 'Lone electrons on the outer atoms', 0, 42),
        count('l', 'l', 'Lone pairs on the center', 0, 3),
        count('d', 'd', 'Electron domains on the center', 2, 6),
        V('theta', 'θ', 'Smallest ideal angle between domains', {
          unit: '°',
          units: ['°'],
          min: 90,
          max: 180,
          step: 0.5,
        }),
      ],
      ...rels(
        rel(
          'l = (V − 2b − o) ÷ 2',
          '{l} = ({Vt} − 2 × {b} − {o}) ÷ 2',
          ['l', 'Vt', 'b', 'o'],
          (v) => 2 * v.l! - (v.Vt! - 2 * v.b! - v.o!),
          {
            l: [
              (v) => (v.Vt! - 2 * v.b! - v.o!) / 2,
              '({Vt} − 2 × {b} − {o}) ÷ 2',
              'Take two electrons for each bond and the outer atoms’ lone electrons from V. What is left sits on the center, two to a lone pair.',
            ],
            Vt: [
              (v) => 2 * v.l! + 2 * v.b! + v.o!,
              '2 × {l} + 2 × {b} + {o}',
              'Add the center’s lone electrons, two for each bond and the outer atoms’ lone electrons.',
            ],
            o: [
              (v) => v.Vt! - 2 * v.b! - 2 * v.l!,
              '{Vt} − 2 × {b} − 2 × {l}',
              'What the bonds and the center’s lone pairs leave of V.',
            ],
          },
        ),
        rel('d = b + l', '{d} = {b} + {l}', ['d', 'b', 'l'], (v) => v.d! - v.b! - v.l!, {
          d: [
            (v) => v.b! + v.l!,
            '{b} + {l}',
            'Each bonded atom is one domain (a double bond counts once) and each lone pair is one more.',
          ],
          b: [(v) => v.d! - v.l!, '{d} − {l}', 'The domains less the lone pairs.'],
          l: [(v) => v.d! - v.b!, '{d} − {b}', 'The domains less the bonded atoms.'],
        }),
        rel(
          'θ from d',
          '{theta} = smallest angle between {d} domains',
          ['theta', 'd'],
          (v) => v.theta! - domainAngleOf(v.d!),
          {
            theta: [
              (v) => domainAngleOf(v.d!),
              'smallest angle between {d} domains',
              'Two domains sit 180° apart, three 120°, four 109.5°; with five or six the closest are 90° apart.',
            ],
          },
        ),
        {
          relation: {
            id: 'l ≤ 2 in 6 domains',
            constraint: true,
            display: '{l} is at most 2 when {d} is 6',
            vars: ['l', 'd'],
            residual: (v) => (v.d! >= 6 && v.l! > 2 ? 1 : 0),
            solve: {},
            // Three lone pairs in six domains (T-shaped, never met in class) is refused.
            message: (v) =>
              v.d! >= 6 && v.l! > 2
                ? 'Six domains hold at most two lone pairs here: square planar is the last shape.'
                : undefined,
          },
          steps: {},
        },
      ),
      example: { Vt, b, o, l, d, theta: domainAngleOf(d) },
      startWith: ['Vt', 'b', 'o'],
      unitSystems: ['metric'],
      representation: {
        kind: 'vsepr',
        mode: 'expanded',
        bonded: 'b',
        lone: 'l',
        angle: 'theta',
        // No molecule named: each shape draws its own example (XeF₄ for 4 bonded, 2 lone).
        domains: 'd',
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Bonding and molecular geometry: formal charge.
    // Nitrate, N with one double and two single bonds and no lone pairs: 5 − 0 − 8 ÷ 2 = +1.
    // (A single-bonded O: 6 − 6 − 2 ÷ 2 = −1; +1 − 1 − 1 + 0 = −1, the ion's charge.)
    const [v, N, B] = [5, 0, 8];
    const count = (id: string, symbol: string, name: string, min: number, max: number) =>
      V(id, symbol, name, { min, max, step: 1, integer: true });
    return {
      id: 'he.chemistry.gen-chem-1#4~formal-charge',
      title: 'Formal charge',
      use: 'Use this for “In one resonance form of nitrate, NO₃⁻, nitrogen has one double bond, two single bonds and no lone pairs. Find its formal charge.”',
      assumptions: [
        'An atom owns all its nonbonding electrons and half of each bonding pair. A single bond is 2 bonding electrons, a double bond 4 and a triple bond 6.',
        'The formal charges in one structure add to the ion’s charge, or to 0 for a molecule. In nitrate: +1 on N, −1 on each single-bonded O and 0 on the double-bonded O.',
        'The best structure has formal charges nearest zero, with any negative one on the more electronegative atom.',
        'Resonance forms move electrons, never atoms. Nitrate’s three forms differ only in which O holds the double bond.',
      ],
      variables: [
        count('v', 'v', 'Valence electrons of the free atom', 1, 8),
        count('N', 'N', 'Nonbonding electrons on the atom', 0, 8),
        count('B', 'B', 'Bonding electrons around the atom', 0, 12),
        V('FC', 'FC', 'Formal charge', { min: -4, max: 4, step: 1, integer: true, signed: true }),
      ],
      ...rels(
        rel(
          'FC = v − N − B ÷ 2',
          '{FC} = {v} − {N} − {B} ÷ 2',
          ['FC', 'v', 'N', 'B'],
          (x) => x.FC! - (x.v! - x.N! - x.B! / 2),
          {
            FC: [
              (x) => x.v! - x.N! - x.B! / 2,
              '{v} − {N} − {B} ÷ 2',
              'Start from the electrons the free atom brings. Take off the ones it keeps as lone pairs and half of the ones it shares.',
            ],
            v: [
              (x) => x.FC! + x.N! + x.B! / 2,
              '{FC} + {N} + {B} ÷ 2',
              'The electrons the atom owns in the structure, plus its formal charge, give what the free atom brings.',
            ],
            N: [
              (x) => x.v! - x.FC! - x.B! / 2,
              '{v} − {FC} − {B} ÷ 2',
              'Take the formal charge and half the bonding electrons off the free atom’s count.',
            ],
            B: [
              (x) => 2 * (x.v! - x.N! - x.FC!),
              '2 × ({v} − {N} − {FC})',
              'What the atom owns beyond its lone pairs is half its bonding electrons, so double it.',
            ],
          },
        ),
        rule(
          'B is even',
          '{B} is even',
          ['B'],
          (x) => x.B! % 2 === 0,
          'Bonding electrons come in pairs, two for each bond.',
        ),
      ),
      example: { v, N, B, FC: v - N - B / 2 },
      startWith: ['v', 'N', 'B'],
      representation: {
        kind: 'lewisStructure',
        mode: 'molecule',
        formula: 'NO3-',
        resonance: true,
        formal: { valence: 'v', nonbonding: 'N', bonding: 'B', charge: 'FC' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry I → Bonding and molecular geometry: lattice energy from a Born–Haber cycle.
    // NaCl: 107 + 496 + 121 − 349 + U = −411 → U = −411 − 107 − 496 − 121 + 349 = −786 kJ/mol.
    const [sub, IE, half, EA, dHf] = [107, 496, 121, -349, -411];
    const energy = (id: string, symbol: string, name: string, min: number, max: number) =>
      V(id, symbol, name, { unit: 'kJ/mol', units: ['kJ/mol'], min, max, step: 0.1 });
    return {
      id: 'he.chemistry.gen-chem-1#4~born-haber',
      title: 'Lattice energy from a Born–Haber cycle',
      use: 'Use this for “Find the lattice energy of NaCl from these values in kJ/mol: sublimation of Na 107, first ionization energy of Na 496, half the Cl–Cl bond energy 121, electron affinity of Cl −349 and ΔH°f of NaCl −411.”',
      assumptions: [
        'The salt MX is a metal M with a 1+ charge and a halogen X with a 1− charge, each from its element in its standard state. The cycle makes one mole of MX, so the diagram shows each step in kJ.',
        'Hess’s law: the path through gaseous atoms and gaseous ions has the same ΔH as forming the salt in one step.',
        'U is the energy given off when the gaseous ions come together as the solid, so it is negative. Some books quote the reverse, a positive number.',
        'An electron affinity here is the energy change when the atom takes an electron: −349 kJ/mol for Cl, energy given off.',
      ],
      variables: [
        energy('sub', 'ΔH_sub', 'Sublimation enthalpy of the metal', 1, 1000),
        energy('IE', 'IE', 'First ionization energy of the metal', 300, 1500),
        energy('half', '½D', 'Half the bond energy of X₂', 1, 500),
        energy('EA', 'EA', 'Electron affinity of X', -500, 200),
        energy('dHf', 'ΔH°f', 'Standard enthalpy of formation of the salt', -3000, 500),
        energy('U', 'U', 'Lattice energy', -5000, -100),
      ],
      ...rels(
        rel(
          'ΔH°f = ΔH_sub + IE + ½D + EA + U',
          '{dHf} = {sub} + {IE} + {half} + {EA} + {U}',
          ['dHf', 'sub', 'IE', 'half', 'EA', 'U'],
          (v) => v.dHf! - (v.sub! + v.IE! + v.half! + v.EA! + v.U!),
          {
            U: [
              (v) => v.dHf! - v.sub! - v.IE! - v.half! - v.EA!,
              '{dHf} − {sub} − {IE} − {half} − {EA}',
              'Hess’s law: the five steps add to ΔH°f, so take the other four off it. What is left is the ions coming together.',
            ],
            dHf: [
              (v) => v.sub! + v.IE! + v.half! + v.EA! + v.U!,
              '{sub} + {IE} + {half} + {EA} + {U}',
              'Add the steps of the cycle: make gaseous atoms, turn them into ions, then pack the ions into the solid.',
            ],
            sub: [
              (v) => v.dHf! - v.IE! - v.half! - v.EA! - v.U!,
              '{dHf} − {IE} − {half} − {EA} − {U}',
              'Take the other four steps off ΔH°f.',
            ],
            IE: [
              (v) => v.dHf! - v.sub! - v.half! - v.EA! - v.U!,
              '{dHf} − {sub} − {half} − {EA} − {U}',
              'Take the other four steps off ΔH°f.',
            ],
            half: [
              (v) => v.dHf! - v.sub! - v.IE! - v.EA! - v.U!,
              '{dHf} − {sub} − {IE} − {EA} − {U}',
              'Take the other four steps off ΔH°f.',
            ],
            EA: [
              (v) => v.dHf! - v.sub! - v.IE! - v.half! - v.U!,
              '{dHf} − {sub} − {IE} − {half} − {U}',
              'Take the other four steps off ΔH°f.',
            ],
          },
        ),
      ),
      example: { sub, IE, half, EA, dHf, U: dHf - sub - IE - half - EA },
      startWith: ['sub', 'IE', 'half', 'EA', 'dHf'],
      unitSystems: ['metric'],
      representation: {
        kind: 'energyProfile',
        mode: 'ladder',
        // kJ for the one mole of MX the cycle makes: kJ/mol chips overflow five columns.
        unit: 'kJ',
        levels: [
          { name: 'M(s) + ½X₂', value: 0 },
          { name: 'M(g) + X(g)' },
          { name: 'M⁺(g) + X(g)' },
          { name: 'M⁺(g) + X⁻(g)' },
          { name: 'MX(s)', value: 'dHf' },
        ],
        steps: [
          { from: 0, to: 1, label: 'Atoms' },
          { from: 1, to: 2, value: 'IE', label: 'IE' },
          { from: 2, to: 3, value: 'EA', label: 'EA' },
          { from: 3, to: 4, value: 'U', label: 'U' },
        ],
        total: { from: 0, to: 4, value: 'dHf', label: 'ΔH°f' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Kinetics: a first-order reaction, [A] after a time and t½.
    // k = 5.00 × 10⁻⁴ s⁻¹, [A]₀ = 0.200 M, t = 1000 s: kt = 0.50, [A] = 0.200 × e^(−0.50) =
    // 0.121 M, f = 0.607, t½ = 0.6931 ÷ (5.00 × 10⁻⁴) = 1386 s.
    const [k, A0, t] = [5.0e-4, 0.2, 1000];
    const conc = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 'M', units: ['M'], min: 1e-9, max: 20, step: 0.0001 });
    const time = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 's', units: ['s'], min: 1e-6, max: 1e10, step: 0.01 });
    const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
    return {
      id: 'he.chemistry.gen-chem-2#0',
      workedFigures: 3,
      use: 'Use this for “A first-order reaction has k = 5.00 × 10⁻⁴ s⁻¹. Starting at 0.200 M, find the concentration after 1000 s and the half-life.”',
      assumptions: [
        'The reaction is first order in A: rate = k[A]. So [A] falls by the same fraction in every equal stretch of time.',
        'The half-life t½ = ln 2 ÷ k does not depend on [A]₀: each half-life halves whatever is left.',
        'A straight line of ln[A] against t, with slope −k, is the test for first order.',
        'k and t use the same time unit, seconds here.',
      ],
      variables: [
        V('k', 'k', 'Rate constant', {
          unit: 's⁻¹',
          units: ['s⁻¹'],
          min: 1e-10,
          max: 1e6,
          step: 0.0001,
          scientific: true,
        }),
        conc('A0', '[A]₀', 'Starting concentration'),
        time('t', 't', 'Time'),
        conc('A', '[A]', 'Concentration at time t'),
        time('half', 't½', 'Half-life'),
        V('f', 'f', 'Fraction left', { min: 0, max: 1, step: 0.001 }),
      ],
      ...rels(
        rel(
          'ln([A]₀ ÷ [A]) = kt',
          'ln({A0} ÷ {A}) = {k} × {t}',
          ['A', 'A0', 'k', 't'],
          (v) => Math.log(v.A0! / v.A!) - v.k! * v.t!,
          {
            A: [
              (v) => v.A0! * Math.exp(-v.k! * v.t!),
              '{A0} × e^(−{k} × {t})',
              'Undo the ln: [A] is [A]₀ times e raised to −kt.',
            ],
            A0: [
              (v) => v.A! * Math.exp(v.k! * v.t!),
              '{A} × e^({k} × {t})',
              'Run the decay backward: multiply [A] by e raised to kt.',
            ],
            k: [
              (v) => pos(Math.log(v.A0! / v.A!) / v.t!),
              'ln({A0} ÷ {A}) ÷ {t}',
              'Take ln of how many times smaller [A] got, then divide by the time.',
            ],
            t: [
              (v) => pos(Math.log(v.A0! / v.A!) / v.k!),
              'ln({A0} ÷ {A}) ÷ {k}',
              'Take ln of how many times smaller [A] got, then divide by k.',
            ],
          },
        ),
        rel(
          't½ = ln 2 ÷ k',
          '{half} = ln(2) ÷ {k}',
          ['half', 'k'],
          (v) => v.half! - Math.LN2 / v.k!,
          {
            half: [
              (v) => pos(Math.LN2 / v.k!),
              'ln(2) ÷ {k}',
              'At t½, [A]₀ ÷ [A] = 2, so kt½ = ln 2. Divide ln 2 by k.',
            ],
            k: [
              (v) => pos(Math.LN2 / v.half!),
              'ln(2) ÷ {half}',
              'kt½ = ln 2, so divide ln 2 by the half-life.',
            ],
          },
        ),
        rel('f = [A] ÷ [A]₀', '{f} = {A} ÷ {A0}', ['f', 'A', 'A0'], (v) => v.f! * v.A0! - v.A!, {
          f: [
            (v) => pos(v.A! / v.A0!),
            '{A} ÷ {A0}',
            'Divide what is left by what there was at the start.',
          ],
          A: [(v) => v.f! * v.A0!, '{f} × {A0}', 'Take that fraction of [A]₀.'],
          A0: [(v) => pos(v.A! / v.f!), '{A} ÷ {f}', 'Divide what is left by the fraction left.'],
        }),
        rule(
          'kt ≤ 13',
          '{k} × {t} ≤ 13',
          ['k', 't'],
          (v) => v.k! * v.t! <= 13,
          'After kt = 13, less than 3 millionths of A is left. Pick a shorter time.',
        ),
      ),
      example: {
        k,
        A0,
        t,
        A: A0 * Math.exp(-k * t),
        half: Math.LN2 / k,
        f: Math.exp(-k * t),
      },
      startWith: ['k', 'A0', 't'],
      unitSystems: ['metric'],
      representation: {
        kind: 'chemDiagram',
        mode: 'rate',
        integrated: { order: 1, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Kinetics: a second-order reaction, [A] after a time and t½.
    // k = 0.500 M⁻¹s⁻¹, [A]₀ = 0.100 M, t = 60.0 s: 1/[A] = 1 ÷ 0.100 + 0.500 × 60.0 =
    // 10.0 + 30.0 = 40.0 M⁻¹, [A] = 0.0250 M; t½ = 1 ÷ (0.500 × 0.100) = 20.0 s.
    const [k, A0, t] = [0.5, 0.1, 60];
    const conc = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 'M', units: ['M'], min: 1e-9, max: 20, step: 0.0001 });
    const time = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 's', units: ['s'], min: 1e-6, max: 1e10, step: 0.01 });
    const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
    return {
      id: 'he.chemistry.gen-chem-2#0~second-order',
      title: 'A second-order reaction',
      workedFigures: 3,
      use: 'Use this for “A second-order reaction has k = 0.500 M⁻¹s⁻¹. Starting at 0.100 M, find the concentration after 60 s and the first half-life.”',
      assumptions: [
        'The reaction is second order in A: rate = k[A]². So it slows down much faster than a first-order reaction as A is used up.',
        'The half-life t½ = 1 ÷ (k[A]₀) depends on [A]₀: each half-life is twice as long as the one before.',
        'A straight line of 1/[A] against t, with slope +k, is the test for second order.',
        'k, [A] and t use the same units: M and seconds here.',
      ],
      variables: [
        V('k', 'k', 'Rate constant', {
          unit: 'M⁻¹s⁻¹',
          units: ['M⁻¹s⁻¹'],
          min: 1e-10,
          max: 1e10,
          step: 0.0001,
          scientific: true,
        }),
        conc('A0', '[A]₀', 'Starting concentration'),
        time('t', 't', 'Time'),
        conc('A', '[A]', 'Concentration at time t'),
        time('half', 't½', 'First half-life'),
      ],
      ...rels(
        rel(
          '1/[A] = 1/[A]₀ + kt',
          '1 ÷ {A} = 1 ÷ {A0} + {k} × {t}',
          ['A', 'A0', 'k', 't'],
          (v) => 1 / v.A! - 1 / v.A0! - v.k! * v.t!,
          {
            A: [
              (v) => pos(1 / (1 / v.A0! + v.k! * v.t!)),
              '1 ÷ (1 ÷ {A0} + {k} × {t})',
              'Add kt to 1/[A]₀ to get 1/[A], then flip it over.',
            ],
            A0: [
              (v) => pos(1 / (1 / v.A! - v.k! * v.t!)),
              '1 ÷ (1 ÷ {A} − {k} × {t})',
              'Take kt away from 1/[A] to get 1/[A]₀, then flip it over.',
            ],
            k: [
              (v) => pos((1 / v.A! - 1 / v.A0!) / v.t!),
              '(1 ÷ {A} − 1 ÷ {A0}) ÷ {t}',
              'Find how much 1/[A] rose, then divide by the time.',
            ],
            t: [
              (v) => pos((1 / v.A! - 1 / v.A0!) / v.k!),
              '(1 ÷ {A} − 1 ÷ {A0}) ÷ {k}',
              'Find how much 1/[A] rose, then divide by k.',
            ],
          },
        ),
        rel(
          't½ = 1 ÷ (k[A]₀)',
          '{half} = 1 ÷ ({k} × {A0})',
          ['half', 'k', 'A0'],
          (v) => v.half! - 1 / (v.k! * v.A0!),
          {
            half: [
              (v) => pos(1 / (v.k! * v.A0!)),
              '1 ÷ ({k} × {A0})',
              'At t½, [A] = [A]₀ ÷ 2, so 1/[A] rises by 1/[A]₀. Divide 1 by k times [A]₀.',
            ],
            k: [
              (v) => pos(1 / (v.half! * v.A0!)),
              '1 ÷ ({half} × {A0})',
              'kt½[A]₀ = 1, so divide 1 by the half-life times [A]₀.',
            ],
            A0: [
              (v) => pos(1 / (v.k! * v.half!)),
              '1 ÷ ({k} × {half})',
              'kt½[A]₀ = 1, so divide 1 by k times the half-life.',
            ],
          },
        ),
        rule(
          '0.05 ≤ kt½ ≤ 10⁹',
          '0.05 ≤ {k} × {half} ≤ 1 × 10⁹',
          ['k', 'half'],
          (v) => v.k! * v.half! >= 0.05 * (1 - 1e-9) && v.k! * v.half! <= 1e9 * (1 + 1e-9),
          'k × t½ is 1 ÷ [A]₀, so it sets [A]₀. Keep it from 0.05 to 1 × 10⁹ per M, for [A]₀ from 1 × 10⁻⁹ to 20 M.',
        ),
      ),
      example: {
        k,
        A0,
        t,
        A: 1 / (1 / A0 + k * t),
        half: 1 / (k * A0),
      },
      startWith: ['k', 'A0', 't'],
      unitSystems: ['metric'],
      representation: {
        kind: 'chemDiagram',
        mode: 'rate',
        integrated: { order: 2, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Kinetics: a zero-order reaction, [A] after a time, t½ and when it
    // runs out. k = 2.00 × 10⁻³ M/s, [A]₀ = 0.500 M, t = 100 s: [A] = 0.500 − 2.00 × 10⁻³ × 100
    // = 0.500 − 0.200 = 0.300 M; t½ = 0.500 ÷ (2 × 2.00 × 10⁻³) = 125 s; t_end = 0.500 ÷
    // (2.00 × 10⁻³) = 250 s.
    const [k, A0, t] = [2.0e-3, 0.5, 100];
    const conc = (id: string, symbol: string, name: string, min = 1e-9) =>
      V(id, symbol, name, { unit: 'M', units: ['M'], min, max: 20, step: 0.0001 });
    const time = (id: string, symbol: string, name: string, min = 1e-6) =>
      V(id, symbol, name, { unit: 's', units: ['s'], min, max: 1e10, step: 0.01 });
    const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
    return {
      id: 'he.chemistry.gen-chem-2#0~zero-order',
      title: 'A zero-order reaction',
      workedFigures: 3,
      use: 'Use this for “A zero-order reaction has k = 2.00 × 10⁻³ M/s. Starting at 0.500 M, find the concentration after 100 s, the half-life and when A runs out.”',
      assumptions: [
        'The reaction is zero order in A: rate = k, whatever [A] is, as when a catalyst surface is fully covered. So [A] falls by the same amount every second.',
        'The half-life t½ = [A]₀ ÷ (2k) depends on [A]₀, and there is no second half-life: A runs out at t_end = 2t½.',
        'The law holds only until A runs out, so t is at most [A]₀ ÷ k. A straight line of [A] against t, with slope −k, is the test for zero order.',
        'k, [A] and t use the same units: M and seconds here.',
      ],
      variables: [
        V('k', 'k', 'Rate constant', {
          unit: 'M/s',
          units: ['M/s'],
          min: 1e-10,
          max: 1e6,
          step: 0.0001,
          scientific: true,
        }),
        conc('A0', '[A]₀', 'Starting concentration'),
        time('t', 't', 'Time', 0),
        conc('A', '[A]', 'Concentration at time t', 0),
        time('half', 't½', 'Half-life'),
        time('tend', 't_end', 'Time A runs out'),
      ],
      ...rels(
        rel(
          '[A] = [A]₀ − kt',
          '{A} = {A0} − {k} × {t}',
          ['A', 'A0', 'k', 't'],
          (v) => v.A! - v.A0! + v.k! * v.t!,
          {
            A: [
              (v) => {
                const a = v.A0! - v.k! * v.t!;
                return a >= 0 ? a : undefined;
              },
              '{A0} − {k} × {t}',
              'A is used at the steady rate k, so kt is used in time t. Take that from [A]₀.',
            ],
            A0: [
              (v) => v.A! + v.k! * v.t!,
              '{A} + {k} × {t}',
              'Add back what was used, kt, to what is left.',
            ],
            k: [
              (v) => pos((v.A0! - v.A!) / v.t!),
              '({A0} − {A}) ÷ {t}',
              'Find how much [A] fell, then divide by the time.',
            ],
            t: [
              (v) => {
                const x = (v.A0! - v.A!) / v.k!;
                return x >= 0 && Number.isFinite(x) ? x : undefined;
              },
              '({A0} − {A}) ÷ {k}',
              'Find how much [A] fell, then divide by k.',
            ],
          },
        ),
        rel(
          't½ = [A]₀ ÷ (2k)',
          '{half} = {A0} ÷ (2 × {k})',
          ['half', 'A0', 'k'],
          (v) => 2 * v.half! * v.k! - v.A0!,
          {
            half: [
              (v) => pos(v.A0! / (2 * v.k!)),
              '{A0} ÷ (2 × {k})',
              'Half of [A]₀ is used at the steady rate k. Divide that half by k.',
            ],
            A0: [
              (v) => pos(2 * v.k! * v.half!),
              '2 × {k} × {half}',
              'In one half-life, k × t½ is used, and that is half of [A]₀. Double it.',
            ],
            k: [
              (v) => pos(v.A0! / (2 * v.half!)),
              '{A0} ÷ (2 × {half})',
              'Half of [A]₀ is used in one half-life. Divide it by the half-life.',
            ],
          },
        ),
        rel(
          't_end = [A]₀ ÷ k',
          '{tend} = {A0} ÷ {k}',
          ['tend', 'A0', 'k'],
          (v) => v.tend! * v.k! - v.A0!,
          {
            tend: [
              (v) => pos(v.A0! / v.k!),
              '{A0} ÷ {k}',
              'All of [A]₀ is used at the steady rate k. Divide [A]₀ by k.',
            ],
            A0: [
              (v) => pos(v.k! * v.tend!),
              '{k} × {tend}',
              'The steady rate times the time it lasts uses all of [A]₀.',
            ],
            k: [
              (v) => pos(v.A0! / v.tend!),
              '{A0} ÷ {tend}',
              'All of [A]₀ is used by t_end. Divide [A]₀ by that time.',
            ],
          },
        ),
        rule(
          'kt ≤ [A]₀',
          '{k} × {t} ≤ {A0}',
          ['k', 't', 'A0'],
          (v) => v.k! * v.t! <= v.A0! * (1 + 1e-9),
          'A has run out by then: kt can’t be more than [A]₀. Pick a time up to [A]₀ ÷ k.',
        ),
      ),
      example: {
        k,
        A0,
        t,
        A: A0 - k * t,
        half: A0 / (2 * k),
        tend: A0 / k,
      },
      startWith: ['k', 'A0', 't'],
      unitSystems: ['metric'],
      representation: {
        kind: 'chemDiagram',
        mode: 'rate',
        integrated: { order: 0, k: 'k', start: 'A0', t: 't', conc: 'A', half: 'half' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Kinetics: the order and k from two initial-rate runs. Runs 1 and 2
    // hold [B] = 0.100 M; [A] doubles, 0.100 → 0.200 M, and the rate goes 2.00 × 10⁻³ →
    // 8.00 × 10⁻³ M/s: 8.00 × 10⁻³ ÷ 2.00 × 10⁻³ = 4 = 2^m, so m = log 4 ÷ log 2 = 2. With n = 1:
    // k = 2.00 × 10⁻³ ÷ (0.100² × 0.100¹) = 2.00 × 10⁻³ ÷ 0.00100 = 2.00 (M⁻²s⁻¹).
    const [A1, A2, r1, r2, B, n] = [0.1, 0.2, 2.0e-3, 8.0e-3, 0.1, 1];
    const m = Math.log(r2 / r1) / Math.log(A2 / A1);
    const conc = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 'M', units: ['M'], min: 1e-4, max: 10, step: 0.0001 });
    const rate = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, {
        unit: 'M/s',
        units: ['M/s'],
        min: 1e-10,
        max: 10,
        step: 1e-10,
        scientific: true,
      });
    const order = (id: string, symbol: string, name: string, min: number) =>
      V(id, symbol, name, { min, max: 3, step: 0.5, figures: 3 });
    const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
    const fin = (x: number) => (Number.isFinite(x) ? x : undefined);
    return {
      id: 'he.chemistry.gen-chem-2#0~initial-rates',
      title: 'Order and rate constant from initial rates',
      workedFigures: 3,
      use: 'Use this for “With [B] held at 0.100 M, raising [A] from 0.100 M to 0.200 M raises the initial rate from 2.00 × 10⁻³ to 8.00 × 10⁻³ M/s. The reaction is first order in B. Find the order in A and k.”',
      assumptions: [
        'The rate law is rate = k[A]ᵐ[B]ⁿ. Runs 1 and 2 change only [A], so [B]ⁿ and k cancel when one rate is divided by the other.',
        'Each rate is an initial rate, measured before the concentrations have changed much.',
        'The order in B, n, comes from another pair of runs that change only [B]; type it here.',
        'k’s unit depends on the overall order m + n: M⁻¹s⁻¹ when it is 2, and M⁻²s⁻¹ when it is 3, as here with m = 2 and n = 1.',
      ],
      variables: [
        conc('A1', '[A]₁', 'Concentration of A in run 1'),
        conc('A2', '[A]₂', 'Concentration of A in run 2'),
        rate('r1', 'rate₁', 'Initial rate in run 1'),
        rate('r2', 'rate₂', 'Initial rate in run 2'),
        order('m', 'm', 'Order in A', -1),
        conc('B', '[B]', 'Concentration of B, held in both runs'),
        order('n', 'n', 'Order in B', 0),
        V('k', 'k', 'Rate constant', { min: 1e-20, max: 1e30, scientific: true }),
      ],
      ...rels(
        rule(
          '[A]₂ ≠ [A]₁',
          '{A2} ≠ {A1}',
          ['A1', 'A2'],
          (v) => Math.abs(Math.log(v.A2! / v.A1!)) > 1e-6,
          'The two runs must use different [A]; otherwise the rates can’t show the order.',
        ),
        rel(
          'rate₂ = rate₁ × ([A]₂ ÷ [A]₁)ᵐ',
          '{r2} = {r1} × ({A2} ÷ {A1})^{m}',
          ['r1', 'r2', 'A1', 'A2', 'm'],
          (v) => Math.log(v.r2! / v.r1!) - v.m! * Math.log(v.A2! / v.A1!),
          {
            m: [
              (v) => fin(Math.log(v.r2! / v.r1!) / Math.log(v.A2! / v.A1!)),
              '(log({r2}) − log({r1})) ÷ (log({A2}) − log({A1}))',
              'Divide the rates: k and [B]ⁿ cancel, leaving rate₂ ÷ rate₁ = ([A]₂ ÷ [A]₁)ᵐ. Take logs, then divide the rate change by the [A] change.',
            ],
            r2: [
              (v) => pos(v.r1! * (v.A2! / v.A1!) ** v.m!),
              '{r1} × ({A2} ÷ {A1})^{m}',
              'The rate grows by the [A] ratio raised to the order m.',
            ],
            r1: [
              (v) => pos(v.r2! / (v.A2! / v.A1!) ** v.m!),
              '{r2} × ({A1} ÷ {A2})^{m}',
              'Undo the growth: scale rate₂ by the flipped [A] ratio raised to the order m.',
            ],
          },
        ),
        rel(
          'rate₁ = k[A]₁ᵐ[B]ⁿ',
          '{r1} = {k} × ({A1})^{m} × ({B})^{n}',
          ['r1', 'k', 'A1', 'm', 'B', 'n'],
          (v) => Math.log(v.r1!) - Math.log(v.k!) - v.m! * Math.log(v.A1!) - v.n! * Math.log(v.B!),
          {
            k: [
              (v) => pos(v.r1! / (v.A1! ** v.m! * v.B! ** v.n!)),
              '{r1} ÷ (({A1})^{m} × ({B})^{n})',
              'Put run 1 into the rate law and divide its rate by the concentration terms.',
            ],
            r1: [
              (v) => pos(v.k! * v.A1! ** v.m! * v.B! ** v.n!),
              '{k} × ({A1})^{m} × ({B})^{n}',
              'Raise each concentration to its order and multiply by k.',
            ],
          },
        ),
      ),
      example: { A1, A2, r1, r2, m, B, n, k: r1 / (A1 ** m * B ** n) },
      startWith: ['A1', 'A2', 'r1', 'r2', 'B', 'n'],
      unitSystems: ['metric'],
      representation: {
        kind: 'table',
        sweep: 'A1',
        output: 'r1',
        params: ['k', 'm', 'B', 'n'],
        rows: [0.05, 0.1, 0.2, 0.4],
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Kinetics: Eₐ from k at two temperatures (Arrhenius). k doubles,
    // 1.00 × 10⁻³ → 2.00 × 10⁻³ s⁻¹, from 298.15 K to 308.15 K: 1/T₁ − 1/T₂ = 1.0885 × 10⁻⁴ K⁻¹,
    // Eₐ = 8.314 × ln 2 ÷ (1.0885 × 10⁻⁴) = 52 946 J/mol = 52.9 kJ/mol;
    // A = 1.00 × 10⁻³ × e^(52 946 ÷ (8.314 × 298.15)) = 1.00 × 10⁻³ × e^21.36 = 1.89 × 10⁶ s⁻¹.
    const [k1, T1, k2, T2] = [1.0e-3, 298.15, 2.0e-3, 308.15];
    const Ea = (R_J * Math.log(k2 / k1)) / (1 / T1 - 1 / T2) / 1000;
    const rateK = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, {
        unit: 's⁻¹',
        units: ['s⁻¹'],
        min: 1e-15,
        max: 1e15,
        step: 1e-15,
        scientific: true,
      });
    const kelvin = (id: string, symbol: string, name: string) =>
      V(id, symbol, name, { unit: 'K', units: ['K'], min: 1, max: 5000, step: 0.01 });
    const pos = (x: number) => (x > 0 && Number.isFinite(x) ? x : undefined);
    // ln(k₂ ÷ k₁) and the exponent Eₐ ÷ R × (1/T₁ − 1/T₂), Eₐ in kJ/mol.
    const lnRatio = (v: Values) => Math.log(v.k2!) - Math.log(v.k1!);
    const gap = (v: Values) => 1 / v.T1! - 1 / v.T2!;
    return {
      id: 'he.chemistry.gen-chem-2#0~arrhenius',
      title: 'Activation energy from two temperatures',
      workedFigures: 3,
      use: 'Use this for “A rate constant doubles, from 1.00 × 10⁻³ s⁻¹ at 25 °C to 2.00 × 10⁻³ s⁻¹ at 35 °C. Find the activation energy and the frequency factor A.”',
      assumptions: [
        'Eₐ and A stay the same between the two temperatures, so ln k against 1/T is a straight line with slope −Eₐ ÷ R.',
        'R = 8.314 J/(mol·K) and Eₐ is in kJ/mol, so Eₐ is multiplied by 1000 to put it in J/mol.',
        'Temperatures are in kelvins (°C + 273.15): 25 °C is 298.15 K.',
        'k₁, k₂ and A share one unit, s⁻¹ here; only the ratio k₂ ÷ k₁ sets Eₐ.',
      ],
      variables: [
        rateK('k1', 'k₁', 'Rate constant at T₁'),
        kelvin('T1', 'T₁', 'First temperature'),
        rateK('k2', 'k₂', 'Rate constant at T₂'),
        kelvin('T2', 'T₂', 'Second temperature'),
        V('Ea', 'Eₐ', 'Activation energy', {
          unit: 'kJ/mol',
          units: ['kJ/mol'],
          min: 0.1,
          max: 1000,
          step: 0.01,
        }),
        V('A', 'A', 'Frequency factor', {
          unit: 's⁻¹',
          units: ['s⁻¹'],
          min: 1e-15,
          max: 1e30,
          step: 1e-15,
          scientific: true,
        }),
      ],
      ...rels(
        rule(
          'k rises with T',
          '(ln({k2}) − ln({k1})) × ({T2} − {T1}) > 0',
          ['k1', 'k2', 'T1', 'T2'],
          (v) => lnRatio(v) * (v.T2! - v.T1!) > 0,
          'With a positive Eₐ, k is larger at the higher temperature. Make the hotter run the faster one.',
        ),
        rel(
          'ln(k₂ ÷ k₁) = (Eₐ ÷ R)(1/T₁ − 1/T₂)',
          'ln({k2}) − ln({k1}) = {Ea} × 1000 ÷ 8.314 × (1 ÷ {T1} − 1 ÷ {T2})',
          ['k1', 'k2', 'T1', 'T2', 'Ea'],
          (v) => lnRatio(v) - ((v.Ea! * 1000) / R_J) * gap(v),
          {
            Ea: [
              (v) => pos((R_J * lnRatio(v)) / gap(v) / 1000),
              '8.314 × (ln({k2}) − ln({k1})) ÷ (1000 × (1 ÷ {T1} − 1 ÷ {T2}))',
              'The rise in ln k over the change in 1/T is the slope, −Eₐ ÷ R. Multiply by R, then divide by 1000 for kJ.',
            ],
            k2: [
              (v) => pos(v.k1! * Math.exp(((v.Ea! * 1000) / R_J) * gap(v))),
              '{k1} × e^({Ea} × 1000 ÷ 8.314 × (1 ÷ {T1} − 1 ÷ {T2}))',
              'Work out how much ln k rises, raise e to it, and scale k₁ by that.',
            ],
            k1: [
              (v) => pos(v.k2! * Math.exp(((-v.Ea! * 1000) / R_J) * gap(v))),
              '{k2} × e^(−{Ea} × 1000 ÷ 8.314 × (1 ÷ {T1} − 1 ÷ {T2}))',
              'Work out how much ln k rises from T₁ to T₂, and scale k₂ back down by e raised to it.',
            ],
            T2: [
              (v) => pos(1 / (1 / v.T1! - (R_J * lnRatio(v)) / (v.Ea! * 1000))),
              '1 ÷ (1 ÷ {T1} − 8.314 × (ln({k2}) − ln({k1})) ÷ ({Ea} × 1000))',
              'R ln(k₂ ÷ k₁) ÷ Eₐ is how much 1/T falls. Take it from 1/T₁, then flip it over.',
            ],
            T1: [
              (v) => pos(1 / (1 / v.T2! + (R_J * lnRatio(v)) / (v.Ea! * 1000))),
              '1 ÷ (1 ÷ {T2} + 8.314 × (ln({k2}) − ln({k1})) ÷ ({Ea} × 1000))',
              'R ln(k₂ ÷ k₁) ÷ Eₐ is how much 1/T falls. Add it to 1/T₂, then flip it over.',
            ],
          },
        ),
        rel(
          'k₁ = A e^(−Eₐ/RT₁)',
          '{k1} = {A} × e^(−{Ea} × 1000 ÷ (8.314 × {T1}))',
          ['k1', 'A', 'Ea', 'T1'],
          (v) => Math.log(v.k1!) - Math.log(v.A!) + (v.Ea! * 1000) / (R_J * v.T1!),
          {
            A: [
              (v) => pos(v.k1! * Math.exp((v.Ea! * 1000) / (R_J * v.T1!))),
              '{k1} × e^({Ea} × 1000 ÷ (8.314 × {T1}))',
              'Only the share e^(−Eₐ/RT) of collisions has energy Eₐ. Divide k₁ by that share.',
            ],
            k1: [
              (v) => pos(v.A! * Math.exp((-v.Ea! * 1000) / (R_J * v.T1!))),
              '{A} × e^(−{Ea} × 1000 ÷ (8.314 × {T1}))',
              'Multiply the frequency factor by the share of collisions with energy Eₐ.',
            ],
          },
        ),
      ),
      example: {
        k1,
        T1,
        k2,
        T2,
        Ea,
        A: k1 * Math.exp((Ea * 1000) / (R_J * T1)),
      },
      startWith: ['k1', 'T1', 'k2', 'T2'],
      unitSystems: ['metric'],
      representation: {
        kind: 'chemDiagram',
        mode: 'rate',
        arrhenius: { k1: 'k1', T1: 'T1', k2: 'k2', T2: 'T2', Ea: 'Ea' },
      },
    } satisfies ModuleDef;
  })(),
  (() => {
    // General Chemistry II → Equilibrium: H₂ + I₂ ⇌ 2HI from K and the starting amounts.
    // K = 50.5, [H₂]₀ = [I₂]₀ = 0.100 M, [HI]₀ = 0.0500 M: (0.0500 + 2x)² = 50.5(0.100 − x)²,
    // so −46.5x² + 10.3x − 0.5025 = 0, x = 0.0725 (0.149 would leave [H₂] below 0);
    // [H₂] = [I₂] = 0.0275 M, [HI] = 0.195 M.
    const [K, h0, i0, p0] = [50.5, 0.1, 0.1, 0.05];
    /** (p₀ + 2x)² = K(h₀ − x)(i₀ − x), as ax² + bx + c = 0. */
    const quad = (v: Values) => [
      4 - v.K!,
      4 * v.p0! + v.K! * (v.h0! + v.i0!),
      v.p0! ** 2 - v.K! * v.h0! * v.i0!,
    ];
    const slack = 1e-9;
    const x =
      (-quad({ K, h0, i0, p0 })[1]! +
        Math.sqrt(quad({ K, h0, i0, p0 })[1]! ** 2 - 4 * (4 - K) * (p0 ** 2 - K * h0 * i0))) /
      (2 * (4 - K));
    const conc = (id: string, symbol: string, name: string, min: number) =>
      V(id, symbol, name, { unit: 'M', units: ['M'], min, max: 10, step: 0.0001 });
    const root = rootRule({
      id: 'x from K',
      out: 'x',
      ins: ['K', 'h0', 'i0', 'p0'],
      display: '({p0} + 2 × {x})² = {K} × ({h0} − {x}) × ({i0} − {x})',
      letter: 'x',
      coefficients: quad,
      keep: (r, v) => r <= v.h0! + slack && r <= v.i0! + slack && v.p0! + 2 * r >= -slack,
      rule: 'x must leave every concentration at least 0',
      how: 'Put the equilibrium amounts into K: ([HI]₀ + 2x)² = K([H₂]₀ − x)([I₂]₀ − x). Expand it into ax² + bx + c = 0 and use the quadratic formula.',
    });
    const r = rels(
      rel(
        'K = [HI]² ÷ ([H₂][I₂])',
        '{K} = {p}² ÷ ({h} × {i})',
        ['K', 'p', 'h', 'i'],
        (v) => v.K! * v.h! * v.i! - v.p! ** 2,
        {
          K: [
            (v) => (v.h! * v.i! > 0 ? v.p! ** 2 / (v.h! * v.i!) : undefined),
            '{p}² ÷ ({h} × {i})',
            'Products over reactants, each to the power of its coefficient, at equilibrium.',
          ],
        },
      ),
      rel('[H₂] = [H₂]₀ − x', '{h} = {h0} − {x}', ['h', 'h0', 'x'], (v) => v.h! - (v.h0! - v.x!), {
        h: [(v) => v.h0! - v.x!, '{h0} − {x}', 'One H₂ is used for each step of the reaction.'],
        h0: [(v) => v.h! + v.x!, '{h} + {x}', 'Add back the H₂ the reaction used.'],
        x: [(v) => v.h0! - v.h!, '{h0} − {h}', 'The change is how much the H₂ fell.'],
      }),
      rel('[I₂] = [I₂]₀ − x', '{i} = {i0} − {x}', ['i', 'i0', 'x'], (v) => v.i! - (v.i0! - v.x!), {
        i: [(v) => v.i0! - v.x!, '{i0} − {x}', 'One I₂ is used with each H₂.'],
        i0: [(v) => v.i! + v.x!, '{i} + {x}', 'Add back the I₂ the reaction used.'],
      }),
      rel(
        '[HI] = [HI]₀ + 2x',
        '{p} = {p0} + 2 × {x}',
        ['p', 'p0', 'x'],
        (v) => v.p! - (v.p0! + 2 * v.x!),
        {
          p: [(v) => v.p0! + 2 * v.x!, '{p0} + 2 × {x}', 'Two HI form for each H₂ used.'],
          p0: [(v) => v.p! - 2 * v.x!, '{p} − 2 × {x}', 'Take away the HI the reaction made.'],
        },
      ),
    );
    return {
      id: 'he.chemistry.gen-chem-2#1',
      workedFigures: 3,
      use: 'Use this for “K = 50.5 for H₂ + I₂ ⇌ 2HI. A flask starts with 0.100 M H₂, 0.100 M I₂ and 0.0500 M HI. Find every concentration at equilibrium.”',
      assumptions: [
        'Only the concentrations at equilibrium go into K, never the starting ones.',
        'x is how far the reaction runs forward: each step uses one H₂ and one I₂ and makes two HI. A negative x runs it backward.',
        'K = [HI]² ÷ ([H₂][I₂]) is a quadratic in x. Of its two roots, keep the one that leaves no concentration below 0.',
        'One temperature throughout, so K stays the same. Concentrations are in mol/L (M).',
      ],
      variables: [
        V('K', 'K', 'Equilibrium constant', { min: 1e-6, max: 1e6, step: 0.0001, figures: 3 }),
        conc('h0', '[H₂]₀', 'Starting H₂', 0),
        conc('i0', '[I₂]₀', 'Starting I₂', 0),
        conc('p0', '[HI]₀', 'Starting HI', 0),
        V('x', 'x', 'Change (forward)', {
          unit: 'M',
          units: ['M'],
          min: -5,
          max: 10,
          step: 0.0001,
          signed: true,
        }),
        conc('h', '[H₂]', 'H₂ at equilibrium', 1e-4),
        conc('i', '[I₂]', 'I₂ at equilibrium', 1e-4),
        conc('p', '[HI]', 'HI at equilibrium', 1e-4),
      ],
      relations: [...r.relations, ...root.relations],
      steps: { ...r.steps, ...root.steps },
      example: { K, h0, i0, p0, x, h: h0 - x, i: i0 - x, p: p0 + 2 * x },
      startWith: ['K', 'h0', 'i0', 'p0'],
      unitSystems: ['metric'],
      representation: {
        kind: 'equilibriumChart',
        species: [
          { formula: 'H₂', coef: 1, side: 'reactant', start: 'h0', eq: 'h' },
          { formula: 'I₂', coef: 1, side: 'reactant', start: 'i0', eq: 'i' },
          { formula: 'HI', coef: 2, side: 'product', start: 'p0', eq: 'p' },
        ],
        K: 'K',
      },
    } satisfies ModuleDef;
  })(),
];
