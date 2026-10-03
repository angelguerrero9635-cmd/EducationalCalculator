/**
 * College pictures, round 3, group L (docs/RENDERINGS_HE.md): HC68 `rayDiagram` modes
 * `singleSlit`, `grating` and `thinFilm`; HC69 the new kind `phaseSpace` (an oscillator, a
 * pendulum, a bead on a spinning hoop); HC93 `wave` options `em` and `line`. Kept apart from
 * `types.ts` so the union only names them.
 *
 * Every string is a variable id; a `NumOrVar` is a fixed number or one. A value is read in its
 * variable's own unit and turned to SI from the unit's name (nm, μm, mm, cm, m; T, mT, μT, nT;
 * V/m, A/m, mA/m; W/m²; Hz to GHz; Ω, kΩ; lines/mm, lines/cm): a page may show λ in nm or μm.
 * A fixed number is in the unit each field names. Angles are in degrees. A "?" draws nothing
 * for that value. Constants (g) come from the page.
 */
import type { NumOrVar } from './typesGraphs';

// ─── HC68 rayDiagram: a single slit, a grating, a thin film ─────────────────

/**
 * - `singleSlit`: light of `wavelength` λ (nm) through a slit `width` a (mm) onto a screen
 *   `screen` L (m) away. The rays from the slit to the first dark fringes at ±θ₁
 *   (a sin θ₁ = λ), the screen's brightness (sinc²) beside it and the central band w = 2L tan θ₁
 *   bracketed, twice as wide as the side bands. Across is not to scale; along the screen the
 *   dark fringes are (at L tan θₘ). A slit no wider than λ has no dark fringe: faded, with the
 *   reason.
 * - `grating`: `lines` N per mm, d = 1 ÷ N (the page's `spacing` when known); every order to
 *   m_max = ⌊d ÷ λ⌋ drawn as a ray at its true angle (d sin θ = mλ; one exactly at sin θ = 1
 *   grazes at 90°), `order` m lit with its θ arced and written.
 *   An order past sin θ = 1 is named in the caption, never drawn.
 * - `thinFilm`: a film of index `index` n and `thickness` t (nm) in air (or on `below`, a
 *   substrate's index): the ray reflected at the top and the one reflected at the bottom, the
 *   extra path 2nt bracketed and each phase flip marked. `flips` is how many of the two
 *   reflections flip (one by default: 2nt = (m + ½)λ; both or neither: 2nt = mλ); `order` m
 *   (0–10) picks the bright λ, drawn in its color on a visible band with the other orders' λ.
 */
export type RayDiagramHe3lSpec = { kind: 'rayDiagram'; fixed?: boolean } & (
  | {
      mode: 'singleSlit';
      wavelength: NumOrVar;
      width: NumOrVar;
      screen: NumOrVar;
      /** The central band's width w (mm). */
      central?: string;
      /** The first dark fringe's angle θ₁ (°). */
      angle?: string;
    }
  | {
      mode: 'grating';
      wavelength: NumOrVar;
      lines: NumOrVar;
      /** The line spacing d (μm). */
      spacing?: string;
      /** The order lit (a whole number; its angle is arced). */
      order?: NumOrVar;
      /** The lit order's angle θ (°). */
      angle?: string;
      /** The highest order m_max. */
      highest?: string;
    }
  | {
      mode: 'thinFilm';
      index: NumOrVar;
      thickness: NumOrVar;
      order: NumOrVar;
      /** The reflected bright wavelength λ (nm). */
      wavelength?: string;
      flips?: 'one' | 'both' | 'none';
      /** The index under the film (a label; the flips say what it does). Air by default. */
      below?: NumOrVar;
    }
);

// ─── HC69 phaseSpace ─────────────────────────────────────────────────────────

/**
 * A system's state as a point in phase space, its energy curve and the flow:
 *
 * - `oscillator`: x–p axes, the ellipse H = p² ÷ 2m + ½kx² through the point (x, p) with its
 *   half-widths √(2H ÷ k) and √(2mH), two fainter ellipses for scale, and the velocity arrow
 *   (ẋ, ṗ) = (∂H/∂p, −∂H/∂x) = (p ÷ m, −kx), tangent to it, turning clockwise; the area
 *   2πH ÷ ω shaded. Drag the point (x and p).
 * - `pendulum`: θ–ω axes (θ from −180° to 180°), the libration ovals and rotation curves faint,
 *   the separatrix E_s = 2mgL dashed, and the curve of the page's energy E = ½mL²ω₀² in ink,
 *   with the point at the bottom (θ = 0, ω₀) and its arrow; ±θ_max ringed, or "goes over the
 *   top" when E > E_s.
 * - `hoop`: a bead on a hoop of `radius` R spun at `spin` ω about its vertical diameter, the bead
 *   at θ₀ from the bottom, beside U_eff(θ) ÷ mgR = 1 − cos θ − ½(ω ÷ ω_c)² sin² θ with its
 *   minimum ringed (θ₀ = 0 below ω_c = √(g ÷ R), cos θ₀ = g ÷ ω²R above it).
 */
export type PhaseSpaceSpec = { kind: 'phaseSpace'; fixed?: boolean } & (
  | {
      system: 'oscillator';
      /** kg, N/m, m, kg·m/s. */
      mass: NumOrVar;
      spring: NumOrVar;
      position: NumOrVar;
      momentum: NumOrVar;
      /** H (J), ẋ (m/s), ṗ (N), ω (rad/s), the area 𝒜 (J·s). */
      energy?: string;
      velocity?: string;
      force?: string;
      omega?: string;
      area?: string;
    }
  | {
      system: 'pendulum';
      /** kg, m, the speed at the bottom ω₀ (rad/s), g (m/s², the page's). */
      mass: NumOrVar;
      length: NumOrVar;
      speed: NumOrVar;
      g: NumOrVar;
      /** E (J), E_s (J), θ_max (°). */
      energy?: string;
      separatrix?: string;
      amplitude?: string;
    }
  | {
      system: 'hoop';
      /** R (m), ω (rad/s), g (m/s², the page's). */
      radius: NumOrVar;
      spin: NumOrVar;
      g: NumOrVar;
      /** ω_c (rad/s), θ₀ (°), the small-oscillation frequency Ω (rad/s). */
      critical?: string;
      angle?: string;
      frequency?: string;
    }
);

// ─── HC93 wave: an electromagnetic wave, a standing wave on a line ───────────

/**
 * E (vertical) and B or H (`field`, drawn level in perspective) in step along the travel
 * direction over two wavelengths, E₀ and B₀ (or H₀) marked at a crest, λ bracketed and the
 * Poynting vector S along the travel. B₀ = E₀ ÷ v (v = c in vacuum, or `speed`); H₀ = E₀ ÷ η
 * with `impedance` (η₀ = 376.7 Ω in vacuum).
 */
export interface WaveEm {
  field?: 'B' | 'H';
  /** E₀ (V/m). */
  amplitude: NumOrVar;
  /** B₀ (T) or H₀ (A/m). */
  magnetic?: NumOrVar;
  /** λ (m). */
  wavelength?: NumOrVar;
  /** The speed v (m/s) in a medium; c when absent. */
  speed?: NumOrVar;
  /** The wave impedance η (Ω). */
  impedance?: NumOrVar;
  /** The intensity I or power density S (W/m²). */
  intensity?: NumOrVar;
}

/**
 * A lossless line from a source to a resistive load, the standing-wave envelope
 * |V| = |V⁺| |1 + Γe^(−j2βd)| over 1¼ wavelengths above it (d from the load), V_max = 1 + |Γ| and
 * V_min = 1 − |Γ| (per |V⁺|) dashed with their ratio, the VSWR, and the λ/2 between maxima.
 * Γ > 0 (R_L > Z₀) puts a maximum at the load, Γ < 0 a minimum; Γ = 0 is flat (matched).
 */
export interface WaveLine {
  /** Γ (real, −1 to 1). */
  gamma: NumOrVar;
  vswr?: NumOrVar;
  /** Z₀ and R_L (Ω): labels on the line and the load. */
  impedance?: NumOrVar;
  load?: NumOrVar;
  /** The return loss (dB) and the reflected share (%), written under it. */
  returnLoss?: NumOrVar;
  share?: NumOrVar;
}

export type WaveHe3lSpec = { kind: 'wave'; fixed?: boolean } & (
  { em: WaveEm } | { line: WaveLine }
);

/** The pictures of group HE3L. */
export type He3lSpec = RayDiagramHe3lSpec | PhaseSpaceSpec | WaveHe3lSpec;

const RAY_MODES = ['singleSlit', 'grating', 'thinFilm'];

/** Whether a picture is one of group HE3L's (`phaseSpace`, the new ray modes, a college wave). */
export function isHe3lSpec(r: { kind: string }): r is He3lSpec {
  const o = r as unknown as Record<string, unknown>;
  if (r.kind === 'phaseSpace') return true;
  if (r.kind === 'rayDiagram') return RAY_MODES.includes(o.mode as string);
  if (r.kind === 'wave') return 'em' in o || 'line' in o;
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-HE3L picture reads (modules.test.ts). */
export function he3lSpecVars(r: He3lSpec): string[] {
  if (r.kind === 'rayDiagram') {
    if (r.mode === 'singleSlit') return ids(r.wavelength, r.width, r.screen, r.central, r.angle);
    if (r.mode === 'grating')
      return ids(r.wavelength, r.lines, r.spacing, r.order, r.angle, r.highest);
    return ids(r.index, r.thickness, r.order, r.wavelength, r.below);
  }
  if (r.kind === 'phaseSpace') {
    if (r.system === 'oscillator')
      return ids(
        r.mass,
        r.spring,
        r.position,
        r.momentum,
        r.energy,
        r.velocity,
        r.force,
        r.omega,
        r.area,
      );
    if (r.system === 'pendulum')
      return ids(r.mass, r.length, r.speed, r.g, r.energy, r.separatrix, r.amplitude);
    return ids(r.radius, r.spin, r.g, r.critical, r.angle, r.frequency);
  }
  if ('em' in r) {
    const e = r.em;
    return ids(e.amplitude, e.magnetic, e.wavelength, e.speed, e.impedance, e.intensity);
  }
  const l = r.line;
  return ids(l.gamma, l.vswr, l.impedance, l.load, l.returnLoss, l.share);
}
