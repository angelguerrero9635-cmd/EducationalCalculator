/**
 * College pictures, round 4, group G (docs/RENDERINGS_HE.md): options on `atmosphereLayers`
 * (HC122 `thickness`, HC123 `adiabat` and `saturation`, HC124 parcel lapse rates, HC125 balance
 * `layer`), on `rayDiagram` (HC130 Snell `speeds`), the new kinds `gravityProfile` (HC131) and
 * `electrodeArray` (HC132), and the explore figure `circulationCells` (HC140).
 * Kept apart from `types.ts` so the union only names them.
 *
 * Every string is a variable id; a `NumOrVar` is a fixed number or one. A value is read in its
 * variable's formula unit (the unit each field names); a "?" draws nothing for that value.
 * Constants (g, R_d, κ, the lapse rates, G) come from the page, with the plan's value as the
 * default.
 */
import type { Representation } from './types';
import type { NumOrVar } from './typesGraphs';

// ─── HC122 atmosphereLayers thickness ────────────────────────────────────────

/**
 * The hypsometric equation (EG-P10): pressure on a log scale across, height up from the lower
 * level p₁. The column of dry air at mean temperature T̄ is a straight line on these axes,
 * ln p = ln p₁ − z ÷ H with the scale height H = R_d T̄ ÷ g; the levels p₁ and p₂, the bracketed
 * thickness Δz = H ln(p₁ ÷ p₂), and H marked where p has fallen to p₁ ÷ e. Without a
 * temperature the page passes H itself (p = p₀e^(−z/H)). Drag the upper level.
 */
export interface AtmosphereThicknessSpec {
  kind: 'atmosphereLayers';
  mode: 'thickness';
  /** The lower and upper pressures p₁ and p₂, hPa (p₂ < p₁). */
  lower: NumOrVar;
  upper?: NumOrVar;
  /** The layer's mean temperature T̄, K (else the page passes `scaleHeight`). */
  temperature?: NumOrVar;
  /** The thickness Δz and the scale height H, in `unit` (default m). */
  thickness?: NumOrVar;
  scaleHeight?: NumOrVar;
  unit?: 'm' | 'km';
  /** g (m/s², default 9.81) and R_d (J/(kg·K), default 287), the page's constants. */
  g?: NumOrVar;
  gasConstant?: NumOrVar;
  fixed?: boolean;
}

// ─── HC123 atmosphereLayers adiabat and saturation ───────────────────────────

/**
 * Potential temperature (EG-P11): a temperature (K, across) against log-pressure (hPa, down to
 * 1,000 at the bottom) chart with the dry adiabats T = θ(p ÷ 1,000)^κ every 10 K, labelled by θ;
 * the parcel at (T, p) and its own adiabat brought down to 1,000 hPa, where it reads θ =
 * T(1,000 ÷ p)^κ. Drag the parcel.
 */
export interface AtmosphereAdiabatSpec {
  kind: 'atmosphereLayers';
  mode: 'adiabat';
  /** The parcel's temperature T (K) and pressure p (hPa). */
  temperature: NumOrVar;
  pressure: NumOrVar;
  /** Its potential temperature θ (K), when the page works it out. */
  theta?: NumOrVar;
  /** κ = R_d ÷ c_p (default 0.286), the page's. */
  kappa?: NumOrVar;
  fixed?: boolean;
}

/**
 * Humidity (EG-P11): Tetens' saturation vapor pressure e_s(T) = a e^(bT ÷ (T + c)) from −40 to
 * 50 °C; the air's point (T, e), up to the curve for e_s at T, and across to the curve at the dew
 * point T_d, where e_s(T_d) = e; RH = e ÷ e_s, and with a pressure the mixing ratio
 * r = 622e ÷ (p − e). Drag the air's point for T and the dew point along the curve.
 */
export interface AtmosphereSaturationSpec {
  kind: 'atmosphereLayers';
  mode: 'saturation';
  /** The air's temperature T and dew point T_d, °C (T_d ≤ T). */
  temperature: NumOrVar;
  dewPoint: NumOrVar;
  /** e_s and e (hPa), RH (%), when the page works them out. */
  saturation?: NumOrVar;
  vapor?: NumOrVar;
  rh?: NumOrVar;
  /** The air's pressure p (hPa) and mixing ratio r (g/kg). */
  pressure?: NumOrVar;
  mixing?: NumOrVar;
  /** Tetens' a (hPa), b and c (°C), the page's (default 6.112, 17.67, 243.5). */
  coefficients?: [number, number, number];
  fixed?: boolean;
}

// ─── HC124 atmosphereLayers parcel lapse rates ───────────────────────────────

/**
 * The page's lapse rates on `atmosphereLayers` mode `parcel` (EG-P12): the parcel cools `dry`
 * °C per km (default 10) and its dew point `dewLapse` °C per km (default 2), so the cloud base is
 * (T − T_d) ÷ (dry − dewLapse) and its temperature T − dry × base. `baseUnit: 'm'` when the
 * page's base is in metres; `baseTemperature` names the page's temperature at the base (°C).
 */
export interface ParcelLapseFields {
  dry?: NumOrVar;
  dewLapse?: NumOrVar;
  baseUnit?: 'm' | 'km';
  baseTemperature?: NumOrVar;
}

/** A parcel with the page's lapse rates (at least one set): drawn by `AirParcel`. */
export type ParcelLapseSpec = {
  kind: 'atmosphereLayers';
  mode: 'parcel';
  temperature: NumOrVar;
  dewPoint: NumOrVar;
  /** The cloud base, in `baseUnit` (default km). */
  base?: NumOrVar;
} & ParcelLapseFields &
  ({ dry: NumOrVar } | { dewLapse: NumOrVar });

// ─── HC125 atmosphereLayers balance layer ────────────────────────────────────

/**
 * The one-layer greenhouse (EG-P13) on `atmosphereLayers` mode `balance`: one layer over the
 * ground, transparent to sunlight, absorbing a share ε of the ground's infrared and sending half
 * of it up and half back down. The bands to scale (W/m²) and a thermometer at T_s with Tₑ
 * marked: T_s = Tₑ(2 ÷ (2 − ε))^(1/4).
 */
export interface BalanceLayerSpec {
  kind: 'atmosphereLayers';
  mode: 'balance';
  /** The albedo α (0–1) and the sunlight S (W/m², default 1,361). */
  albedo: NumOrVar;
  sunlight?: NumOrVar;
  /** F = S(1 − α) ÷ 4 (W/m²) and Tₑ (K), when the page names them. */
  absorbed?: NumOrVar;
  temperature?: NumOrVar;
  /** The layer's emissivity ε (0–1) and the surface temperature T_s (K). */
  layer: { emissivity: NumOrVar; surface?: NumOrVar };
}

// ─── HC130 rayDiagram Snell speeds ───────────────────────────────────────────

/**
 * A seismic ray (EG-P21) on `rayDiagram` mode `refraction`, the media named by their speeds
 * instead of indices: sin r = (v₂ ÷ v₁) sin i, the critical angle sin⁻¹(v₁ ÷ v₂) marked when
 * v₂ > v₁, total reflection past it; wavefront ticks spaced as each speed. Drag the ray.
 */
export interface RaySpeedsSpec {
  kind: 'rayDiagram';
  mode: 'refraction';
  /** The upper and lower layers' speeds v₁ and v₂ (m/s). */
  speeds: { v1: NumOrVar; v2: NumOrVar };
  /** The incidence angle i (°) and, when the page works them out, r and i_c (°). */
  angle: NumOrVar;
  refracted?: NumOrVar;
  critical?: NumOrVar;
  /** Names of the two layers, top then bottom (default "upper layer", "lower layer"). */
  media?: [string, string];
  fixed?: boolean;
}

/** The round 4 group G options on existing kinds (drawn by `He4gView`). */
export type He4gOptionSpec =
  | AtmosphereThicknessSpec
  | AtmosphereAdiabatSpec
  | AtmosphereSaturationSpec
  | ParcelLapseSpec
  | BalanceLayerSpec
  | RaySpeedsSpec;

// ─── HC131 gravityProfile (new kind) ─────────────────────────────────────────

/**
 * Gravity over a buried sphere (EG-P22): the sphere in section to scale under its anomaly
 * profile Δg(x) = Δg_max(1 + x² ÷ z²)^(−3/2), the peak and the half-width x½ = 0.766z marked.
 * Excess mass (4 ÷ 3)πR³Δρ, Δg_max = G × mass ÷ z² × 10⁵ mGal. Drag the sphere for z.
 */
export interface GravitySphereSpec {
  kind: 'gravityProfile';
  mode: 'sphere';
  /** Radius R (m), density contrast Δρ (kg/m³, negative for a light body), depth to centre z (m). */
  radius: NumOrVar;
  contrast: NumOrVar;
  depth: NumOrVar;
  /** Excess mass (kg), peak anomaly Δg_max (mGal), half-width x½ (m), when the page names them. */
  mass?: NumOrVar;
  peak?: NumOrVar;
  halfWidth?: NumOrVar;
  /** G (N·m²/kg², default 6.674 × 10⁻¹¹), the page's. */
  G?: NumOrVar;
  fixed?: boolean;
}

/**
 * Airy isostasy (EG-P22): crust of density ρ_c floating on mantle ρ_m, normal crust T thick, a
 * mountain h high with its root r = hρ_c ÷ (ρ_m − ρ_c) down to the compensation depth; two
 * columns to it weigh the same. Heights to scale, widths not.
 */
export interface GravityAirySpec {
  kind: 'gravityProfile';
  mode: 'airy';
  /** Mountain height h and normal crust T (km); densities ρ_c and ρ_m (g/cm³). */
  height: NumOrVar;
  thickness: NumOrVar;
  crust: NumOrVar;
  mantle: NumOrVar;
  /** The root r and the crust under the peak T + h + r (km), when the page names them. */
  root?: NumOrVar;
  total?: NumOrVar;
}

export type GravityProfileSpec = GravitySphereSpec | GravityAirySpec;

// ─── HC132 electrodeArray (new kind) ─────────────────────────────────────────

/**
 * A Wenner survey (EG-P23): four electrodes `spacing` a apart, current I in at C₁ and out at C₂,
 * the current's paths and the equipotentials through the ground, V read across P₁ and P₂, the
 * ground sampled to about a ÷ 2 shaded; ρ_a = 2πaV ÷ I. Drag C₂ for a.
 */
export interface ElectrodeArraySpec {
  kind: 'electrodeArray';
  /** The spacing a (m), the voltage V (V) and the current I (A). */
  spacing: NumOrVar;
  voltage: NumOrVar;
  current: NumOrVar;
  /** R = V ÷ I (Ω) and ρ_a (Ω·m), when the page works them out. */
  resistance?: NumOrVar;
  resistivity?: NumOrVar;
  fixed?: boolean;
}

/** Every round 4 group G calculator picture. */
export type He4gSpec = He4gOptionSpec | GravityProfileSpec | ElectrodeArraySpec;

const MODES = ['thickness', 'adiabat', 'saturation'];

/** Whether a picture is one of group G's options on an existing kind. */
export function isHe4gOption(r: Representation): r is He4gOptionSpec {
  if (r.kind === 'atmosphereLayers')
    return (
      MODES.includes(r.mode) ||
      (r.mode === 'parcel' && ('dry' in r || 'dewLapse' in r)) ||
      (r.mode === 'balance' && 'layer' in r)
    );
  if (r.kind === 'rayDiagram') return 'speeds' in r;
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-G picture reads (modules.test.ts). */
export function he4gSpecVars(r: He4gSpec): string[] {
  if (r.kind === 'electrodeArray')
    return ids(r.spacing, r.voltage, r.current, r.resistance, r.resistivity);
  switch (r.mode) {
    case 'thickness':
      return ids(r.lower, r.upper, r.temperature, r.thickness, r.scaleHeight, r.g, r.gasConstant);
    case 'adiabat':
      return ids(r.temperature, r.pressure, r.theta, r.kappa);
    case 'parcel':
      return ids(r.temperature, r.dewPoint, r.base, r.dry, r.dewLapse, r.baseTemperature);
    case 'saturation':
      return ids(r.temperature, r.dewPoint, r.saturation, r.vapor, r.rh, r.pressure, r.mixing);
    case 'sphere':
      return ids(r.radius, r.contrast, r.depth, r.mass, r.peak, r.halfWidth, r.G);
    case 'airy':
      return ids(r.height, r.thickness, r.crust, r.mantle, r.root, r.total);
    case 'refraction':
      return ids(r.speeds.v1, r.speeds.v2, r.angle, r.refracted, r.critical);
    case 'balance':
      return ids(
        r.albedo,
        r.sunlight,
        r.absorbed,
        r.temperature,
        r.layer.emissivity,
        r.layer.surface,
      );
  }
}

// ─── HC140: explore figure `circulationCells` ────────────────────────────────

/** What a `circulationCells` scene lights: a cell, a surface wind, or the belts of pressure. */
export type CirculationLit =
  | 'hadley'
  | 'ferrel'
  | 'polar'
  | 'trades'
  | 'westerlies'
  | 'easterlies'
  | 'itcz'
  | 'highs'
  | 'lows';

/**
 * A `circulationCells` scene (HC140, EG-P33): Earth from the side with the Hadley, Ferrel and
 * polar cells in both hemispheres (edges at 0°, 30°, 60° and 90°), the ITCZ, the subtropical
 * highs and subpolar lows, and the surface winds (trades toward the equator, westerlies
 * poleward, polar easterlies); `lit` lights one of them and fades the rest.
 */
export interface CirculationScene {
  lit?: CirculationLit;
}

/** The round 4 group G explore figures (listed in `layouts/types.ts`). */
export type He4gFigure = { kind: 'circulationCells' };

/** The scene field each group G figure reads (for the layout tests). */
export const HE4G_SCENE_FIELD = { circulationCells: 'circulation' } as const;
