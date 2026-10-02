/**
 * College pictures, round 3, group A (docs/RENDERINGS_HE.md): `functionGraph` families and
 * options. HC42: `family: 'distribution'` (Maxwell's speeds, Planck's curves, the three
 * occupancies); HC45: numerical methods (`newton`, `bisect`, `steps`, `through` with the family
 * `lagrange`, and `riemann.side` 'trapezoid' or 'simpson' in typesHs3b.ts); HC92:
 * `family: 'quantizer'` (an ADC's or a DAC's staircase). Kept apart from `types.ts` and
 * `typesFunctionGraph.ts` so they gain a line each. A `NumOrVar` field is a fixed number or a
 * variable id; a string field (`vp`, `code`, `last`) is the page's own value, checked.
 */
import type { NumOrVar } from './typesGraphs';
import { fieldExprNames } from './typesHe2g';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** An interpolation node (x, y). */
export interface NodeHe3a {
  x: NumOrVar;
  y: NumOrVar;
}

/**
 * HC42: a distribution, drawn from the page's values (no constant built in that the page can't
 * pass).
 * - maxwell: f(v) = 4π(M ÷ 2πRT)^(3/2) v² e^(−Mv² ÷ 2RT) against v (m/s); `molar` M in g/mol,
 *   `T` in K, `R` (default 8.314 J/(mol·K)). v_p, ⟨v⟩ and v_rms are marked; `speeds` names the
 *   page's three (checked). `compare` draws a second gas or temperature dashed. The curve's y is
 *   f × `yScale` (default 1000: f in 10⁻³ s/m; the axis names its unit). `gas` names it.
 * - planck: E_bλ = C₁ ÷ (λ⁵(e^(C₂ ÷ λT) − 1)) against λ in μm (or nm with `unit: 'nm'`) for `T`
 *   and each of `others` (dashed); λ_max = b ÷ T marked (`wien` b, default 2898 μm·K) and the
 *   visible band tinted (0.38–0.75 μm). y is W/(m²·μm) × `yScale` (default 10⁻⁶: MW/(m²·μm)).
 *   `peak` is the page's λ_max (checked, in the axis unit).
 * - occupancy: Fermi–Dirac (solid), Bose–Einstein (dashed) and Boltzmann (dotted) against
 *   x = (E − μ) ÷ k_BT, the point at x from `energy` (E − μ, eV) and `T` (`kB`, default
 *   8.617 × 10⁻⁵ eV/K), or from `x` itself; `fd`, `be`, `mb` are the page's three (checked).
 */
export type DistributionHe3a =
  | {
      family: 'distribution';
      distribution: 'maxwell';
      molar: NumOrVar;
      T: NumOrVar;
      R?: NumOrVar;
      gas?: string;
      compare?: { molar?: NumOrVar; T?: NumOrVar; gas?: string };
      speeds?: { vp?: string; avg?: string; rms?: string };
      yScale?: number;
    }
  | {
      family: 'distribution';
      distribution: 'planck';
      T: NumOrVar;
      others?: NumOrVar[];
      wien?: NumOrVar;
      unit?: 'μm' | 'nm';
      peak?: string;
      visible?: boolean;
      yScale?: number;
    }
  | {
      family: 'distribution';
      distribution: 'occupancy';
      energy?: NumOrVar;
      T?: NumOrVar;
      kB?: NumOrVar;
      x?: NumOrVar;
      fd?: string;
      be?: string;
      mb?: string;
    };

/**
 * HC92: an ideal converter's transfer staircase, n = `bits`, LSB = `vref` ÷ 2ⁿ.
 * - adc (default): code D against V_in; `vin` is V_in, D = ⌊V_in ÷ LSB⌋ (or rounded with
 *   `rounding: 'round'`), its tread lit, 1 LSB bracketed; `code` and `back` (D × LSB) are the
 *   page's (checked).
 * - dac: V_out against the code; `code` is D typed, `back` the page's V_out (checked).
 * Up to 16 steps the whole range is drawn; past that, a zoom of 16 codes round the lit one.
 * `lsb` is the page's step (checked).
 */
export interface QuantizerHe3a {
  family: 'quantizer';
  bits: NumOrVar;
  vref: NumOrVar;
  mode?: 'adc' | 'dac';
  vin?: NumOrVar;
  code?: NumOrVar;
  back?: string;
  lsb?: string;
  rounding?: 'truncate' | 'round';
}

/** HC45: the polynomial through the nodes in `through` (Lagrange's form). */
export interface LagrangeHe3a {
  family: 'lagrange';
  through: NodeHe3a[];
}

export type FamilyHe3a = DistributionHe3a | QuantizerHe3a | LagrangeHe3a;

export function isFamilyHe3a(f: { family: string }): f is FamilyHe3a {
  return f.family === 'distribution' || f.family === 'quantizer' || f.family === 'lagrange';
}

/** The value ids a family reads to draw its curve. */
export function familyHe3aVars(f: FamilyHe3a): string[] {
  switch (f.family) {
    case 'distribution':
      if (f.distribution === 'maxwell') return ids(f.molar, f.T, f.R);
      if (f.distribution === 'planck') return ids(f.T, ...(f.others ?? []));
      return [];
    case 'quantizer':
      return ids(f.bits, f.vref);
    case 'lagrange':
      return f.through.flatMap((n) => ids(n.x, n.y));
  }
}

/** The ODE methods `steps` draws. */
export type StepMethodHe3a = 'euler' | 'heun' | 'rk4';

/** HC45: `functionGraph` options for numerical methods (each off unless set). */
export interface FunctionGraphHe3a {
  /**
   * Newton's method on f from `x0`: for each of `steps` (default 1) the tangent at (xₖ, f(xₖ))
   * down to the axis, where it gives xₖ₊₁ (ringed, numbered). `next` is the page's last iterate
   * (checked).
   */
  newton?: { x0: NumOrVar; steps?: NumOrVar; next?: string };
  /**
   * Bisection on [a, b]: `steps` (default 1) brackets, each half the last, stacked under the
   * axis with its midpoint and the sign of f there. `mid` is the page's last midpoint (checked).
   */
  bisect?: { a: NumOrVar; b: NumOrVar; steps?: NumOrVar; mid?: string };
  /**
   * An ODE solver's points over the exact curve (the family): y′ = `dy` (an expression in x, y
   * and value ids, the HC10 grammar: 'k*y'), from (`x0`, `y0`), `n` steps of `h` by Euler,
   * Heun or RK4, joined by a polyline. `last` is the page's yₙ (checked).
   */
  steps?: {
    method: StepMethodHe3a;
    dy: string;
    h: NumOrVar;
    n: NumOrVar;
    y0: NumOrVar;
    x0?: NumOrVar;
    last?: string;
  };
  /** Interpolation nodes, ringed and labelled (checked on the curve). */
  through?: NodeHe3a[];
}

/** The variable ids the families and options name (for the module tests). */
export function functionGraphHe3aVars(r: FunctionGraphHe3a & { family: string }): string[] {
  const out: string[] = [];
  if (isFamilyHe3a(r)) {
    out.push(...familyHe3aVars(r));
    if (r.family === 'distribution') {
      if (r.distribution === 'maxwell')
        out.push(
          ...ids(r.compare?.molar, r.compare?.T, r.speeds?.vp, r.speeds?.avg, r.speeds?.rms),
        );
      else if (r.distribution === 'planck') out.push(...ids(r.wien, r.peak));
      else out.push(...ids(r.energy, r.T, r.kB, r.x, r.fd, r.be, r.mb));
    }
    if (r.family === 'quantizer') out.push(...ids(r.vin, r.code, r.back, r.lsb));
  }
  const s = r.steps;
  return [
    ...out,
    ...ids(r.newton?.x0, r.newton?.steps, r.newton?.next),
    ...ids(r.bisect?.a, r.bisect?.b, r.bisect?.steps, r.bisect?.mid),
    ...ids(s?.h, s?.n, s?.y0, s?.x0, s?.last),
    ...fieldExprNames(s?.dy),
    ...(r.through ?? []).flatMap((n) => ids(n.x, n.y)),
  ];
}
