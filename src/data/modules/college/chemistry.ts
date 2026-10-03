/**
 * College Chemistry: the calculator modules of every course whose home field is `chemistry`,
 * keyed by course topic (`<courseId>#<i>`, its problem types `<courseId>#<i>~<slug>` after it),
 * in taxonomy order. Course and topic titles come from taxonomy.ts. Layout pages are in
 * `../layouts/collegeChemistry.ts`. Rules: docs/MODULE_GUIDE.md; plan: docs/plans/he.chemistry.md.
 */
import { valueOf } from '@/engine/constants';
import { formatNumber } from '@/engine/format';

import type { ModuleDef } from '../types';

import { derive, exact, rel, rels, rule, V } from './shared';

// The constants as the steps print them (src/engine/constants.ts).
const H = valueOf('h'); // 6.626 × 10⁻³⁴ J·s
const C = valueOf('c'); // 2.998 × 10⁸ m/s
const NA = valueOf('NA'); // 6.022 × 10²³ mol⁻¹
const E_CHARGE = valueOf('e'); // 1.602 × 10⁻¹⁹ C
const RINF = valueOf('Rinf'); // 1.097 × 10⁷ m⁻¹
const R_LATM = 0.08206; // L·atm/(mol·K)

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
];
