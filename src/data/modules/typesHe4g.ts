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

/** The round 4 group G options on existing kinds (drawn by `He4gView`). */
export type He4gOptionSpec =
  AtmosphereThicknessSpec | AtmosphereAdiabatSpec | AtmosphereSaturationSpec | ParcelLapseSpec;

/** Every round 4 group G calculator picture. */
export type He4gSpec = He4gOptionSpec;

const MODES = ['thickness', 'adiabat', 'saturation'];

/** Whether a picture is one of group G's options on an existing kind. */
export function isHe4gOption(r: Representation): r is He4gOptionSpec {
  if (r.kind === 'atmosphereLayers')
    return MODES.includes(r.mode) || (r.mode === 'parcel' && ('dry' in r || 'dewLapse' in r));
  return false;
}

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** Every variable id a group-G picture reads (modules.test.ts). */
export function he4gSpecVars(r: He4gSpec): string[] {
  switch (r.mode) {
    case 'thickness':
      return ids(r.lower, r.upper, r.temperature, r.thickness, r.scaleHeight, r.g, r.gasConstant);
    case 'adiabat':
      return ids(r.temperature, r.pressure, r.theta, r.kappa);
    case 'parcel':
      return ids(r.temperature, r.dewPoint, r.base, r.dry, r.dewLapse, r.baseTemperature);
    case 'saturation':
      return ids(r.temperature, r.dewPoint, r.saturation, r.vapor, r.rh, r.pressure, r.mixing);
  }
}
