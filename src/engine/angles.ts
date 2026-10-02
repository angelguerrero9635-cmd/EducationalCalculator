/**
 * Angles (HE-E19): trig in degrees for relations, a quadrant-correct angle from (x, y) (atan2)
 * and a compass bearing, degrees–minutes–seconds and bearings as text a box shows and takes,
 * and the lines a class writes for each: "θ = tan⁻¹(6 ÷ (−8)) + 180° = 143.13°" with the
 * quadrant named, "4°30′00″ = 4 + 30 ÷ 60 + 0 ÷ 3600 = 4.5°", "45° × π ÷ 180 = 0.7854 rad",
 * "236.31° = S 56.31° W". Every line is true as printed; the harness reads each form back
 * (`harness/angles.ts`). Angle units (°, rad, grad, ′, ″, rev, mrad, μrad) are registered in
 * `units.ts` (dimension `angle`); a page's degree-and-minute values set `angleForm` on the
 * value (`VariableDef`).
 */
import { formatNumber } from './format';

/** Radians in one degree. */
export const DEG = Math.PI / 180;

// ─── Trig in degrees, for relations ─────────────────────────────────────────

export const sinD = (deg: number) => Math.sin(deg * DEG);
export const cosD = (deg: number) => Math.cos(deg * DEG);
export const tanD = (deg: number) => Math.tan(deg * DEG);
/** Inverse sine in degrees (−90° to 90°), undefined outside −1 to 1. */
export const asinD = (x: number) =>
  Math.abs(x) <= 1 + 1e-12 ? Math.asin(Math.max(-1, Math.min(1, x))) / DEG : undefined;
/** Inverse cosine in degrees (0° to 180°), undefined outside −1 to 1. */
export const acosD = (x: number) =>
  Math.abs(x) <= 1 + 1e-12 ? Math.acos(Math.max(-1, Math.min(1, x))) / DEG : undefined;
/** Inverse tangent in degrees (−90° to 90°). */
export const atanD = (x: number) => Math.atan(x) / DEG;
/**
 * Both angles with a sine (θ and 180° − θ, the second only when it differs), as a relation's
 * candidates: the solver keeps the one in range (the ambiguous case of the law of sines).
 */
export const asinBothD = (x: number) => {
  const a = asinD(x);
  return a === undefined ? undefined : Math.abs(a - 90) < 1e-12 ? [a] : [a, 180 - a];
};
/** Both angles with a cosine (±θ), as a relation's candidates. */
export const acosBothD = (x: number) => {
  const a = acosD(x);
  return a === undefined ? undefined : a === 0 ? [0] : [a, -a];
};

/** An angle in degrees in [0°, 360°) (a bearing, a full-turn angle). */
export function wrap360(deg: number): number {
  const r = ((deg % 360) + 360) % 360;
  return Math.abs(r - 360) < 1e-9 || Object.is(r, -0) ? 0 : r;
}
/** An angle in degrees in (−180°, 180°]. */
export function wrap180(deg: number): number {
  const r = wrap360(deg);
  return r > 180 ? r - 360 : r;
}

/** The angle of the point (x, y) in degrees, −180° < θ ≤ 180°; undefined at the origin. */
export const atan2D = (y: number, x: number) =>
  x === 0 && y === 0 ? undefined : Math.atan2(y, x) / DEG;
/**
 * The compass bearing (azimuth, clockwise from north, 0° ≤ θ < 360°) of a direction given by its
 * east and north parts; undefined for no direction.
 */
export const azimuthD = (east: number, north: number) =>
  east === 0 && north === 0 ? undefined : wrap360(Math.atan2(east, north) / DEG);

/** The quadrant of (x, y): 1–4, or undefined on an axis. */
export function quadrantOf(x: number, y: number): 1 | 2 | 3 | 4 | undefined {
  if (x === 0 || y === 0) return undefined;
  return x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3;
}
export const QUADRANT_NAMES = ['', 'I', 'II', 'III', 'IV'] as const;

// ─── Degrees, minutes and seconds ───────────────────────────────────────────

export interface DmsParts {
  sign: 1 | -1;
  d: number;
  m: number;
  /** Seconds, rounded to the decimals asked (0 with `minutesOnly`). */
  s: number;
}

/**
 * An angle in degrees split into whole degrees, minutes and seconds, rounded at the last part
 * shown (whole seconds, or `decimals` of them; with `minutesOnly`, minutes to `decimals`), with
 * the carry (59.9999″ is 1′ more, never 60″).
 */
export function dmsParts(deg: number, minutesOnly = false, decimals = 0): DmsParts {
  const sign = deg < 0 ? -1 : 1;
  const unit = (minutesOnly ? 60 : 3600) * 10 ** decimals;
  const total = Math.round(Math.abs(deg) * unit * (1 + 1e-12));
  const per = 10 ** decimals;
  if (minutesOnly) {
    const d = Math.floor(total / (60 * per));
    return { sign: total === 0 ? 1 : sign, d, m: (total - d * 60 * per) / per, s: 0 };
  }
  const d = Math.floor(total / (3600 * per));
  const rest = total - d * 3600 * per;
  const m = Math.floor(rest / (60 * per));
  return { sign: total === 0 ? 1 : sign, d, m, s: (rest - m * 60 * per) / per };
}

/** A part as written in an angle: two digits before its point (05′, 07.5″). */
const two = (x: number, decimals: number) => {
  const t = x.toFixed(decimals);
  return (t.split('.')[0]!.length < 2 ? '0' : '') + t;
};

/**
 * An angle in degrees, minutes and seconds as a surveyor writes it: "4°30′00″", "−0°00′05″",
 * "540°00′25″"; `form` 'dm' stops at minutes ("52°10′"). `decimals` are of the last part.
 */
export function dmsText(deg: number, form: 'dms' | 'dm' = 'dms', decimals = 0): string {
  const p = dmsParts(deg, form === 'dm', decimals);
  const head = `${p.sign < 0 ? '−' : ''}${p.d}°${two(p.m, form === 'dm' ? decimals : 0)}′`;
  return form === 'dm' ? head : `${head}${two(p.s, decimals)}″`;
}

/**
 * The shortest exact DMS text: "52°", "52°10′", "52°10′30″" (seconds to `decimals`): the angle
 * part of a bearing.
 */
export function dmsShort(deg: number, decimals = 0): string {
  const p = dmsParts(deg, false, decimals);
  const sign = p.sign < 0 ? '−' : '';
  if (p.m === 0 && p.s === 0) return `${sign}${p.d}°`;
  if (p.s === 0) return `${sign}${p.d}°${two(p.m, 0)}′`;
  return `${sign}${p.d}°${two(p.m, 0)}′${two(p.s, decimals)}″`;
}

const NUM = String.raw`\d+(?:\.\d+)?|\.\d+`;
/** Degrees, minutes and seconds as typed or printed: 34°12′30″, 34° 12' 30", 4°30′, 34.5°. */
export const DMS_TEXT = new RegExp(
  String.raw`^([-+−]?)\s*(${NUM})\s*°\s*(?:(${NUM})\s*['′]\s*)?(?:(${NUM})\s*(?:″|"|''|′′)\s*)?$`,
);

/** The angle in degrees of a typed or printed DMS text; undefined when it isn't one. */
export function parseDms(text: string): number | undefined {
  const m = DMS_TEXT.exec(text.trim());
  if (!m) return undefined;
  const [d, mi, s] = [Number(m[2]), Number(m[3] ?? 0), Number(m[4] ?? 0)];
  // (minutes and seconds under 60, and a decimal only in the last part written)
  if (mi >= 60 || s >= 60) return undefined;
  if ((m[3] !== undefined || m[4] !== undefined) && !Number.isInteger(d)) return undefined;
  if (m[4] !== undefined && m[3] !== undefined && !Number.isInteger(mi)) return undefined;
  const x = d + mi / 60 + s / 3600;
  return /[-−]/.test(m[1]!) ? -x : x;
}

// ─── Bearings ───────────────────────────────────────────────────────────────

/**
 * A quadrant bearing as surveyors write it, from an azimuth in degrees: "N 52°10′ E",
 * "S 56.31° W". The angle part is from north or south toward east or west, 0° to 90°; `angle`
 * writes it (DMS with `dmsShort`, or a decimal).
 */
export function bearingText(azimuth: number, angle: (deg: number) => string): string {
  const a = wrap360(azimuth);
  if (a <= 90) return `N ${angle(a)} E`;
  if (a <= 180) return `S ${angle(180 - a)} E`;
  if (a < 270) return `S ${angle(a - 180)} W`;
  return `N ${angle(360 - a)} W`;
}

/** An azimuth as written on a compass: three digits before its point, "052°", "236.31°". */
export function azimuthText(azimuth: number, show: (x: number) => string = decimal): string {
  const s = show(wrap360(azimuth));
  const whole = s.split('.')[0]!;
  return `${'0'.repeat(Math.max(0, 3 - whole.length))}${s}°`;
}

/** The azimuth of a typed or printed bearing ("N 52°10′ E", "s 30 w", "S 56.31° W"). */
export function parseBearing(text: string): number | undefined {
  const m = /^([NS])\s*(.+?)\s*([EW])$/i.exec(text.trim());
  if (!m) return undefined;
  const body = m[2]!.trim();
  const a = parseDms(/°/.test(body) ? body : `${body}°`);
  if (a === undefined || a < 0 || a > 90) return undefined;
  const [ns, ew] = [m[1]!.toUpperCase(), m[3]!.toUpperCase()];
  return wrap360(ns === 'N' ? (ew === 'E' ? a : 360 - a) : ew === 'E' ? 180 - a : 180 + a);
}

// ─── A value's angle display (VariableDef.angleForm) ────────────────────────

/**
 * How an angle value in degrees is shown and typed: 'dms' "4°30′00″", 'dm' "52°10′", 'bearing'
 * "N 52°10′ E" (the angle part as short DMS), 'bearing-decimal' "S 56.31° W", 'azimuth' "052°"
 * (0° to 360°). The text carries its own degree marks, so no unit follows it.
 */
export type AngleForm = 'dms' | 'dm' | 'bearing' | 'bearing-decimal' | 'azimuth';

const decimal = (x: number) => formatNumber(x);

/** An angle value as its `angleForm` shows it; `decimals` of the last part (default 0). */
export function angleFormText(deg: number, form: AngleForm, decimals?: number): string {
  switch (form) {
    case 'dms':
    case 'dm':
      return dmsText(deg, form, decimals ?? 0);
    case 'bearing':
      return bearingText(deg, (a) => dmsShort(a, decimals ?? 0));
    case 'bearing-decimal':
      return bearingText(deg, (a) =>
        decimals === undefined ? `${decimal(a)}°` : `${formatNumber(a, { decimals })}°`,
      );
    case 'azimuth':
      return azimuthText(
        deg,
        decimals === undefined ? decimal : (x) => formatNumber(x, { decimals }),
      );
  }
}

/** The angle in degrees of a typed DMS text, bearing or azimuth; undefined otherwise. */
export function parseAngle(text: string): number | undefined {
  return parseDms(text) ?? parseBearing(text);
}

// ─── Lines ──────────────────────────────────────────────────────────────────

/** How lines print their numbers (default `formatNumber`: whole, or 4 decimals). */
export interface AngleLineStyle {
  show?: (x: number) => string;
  /** The angle's name in the line (default θ). */
  name?: string;
}

/** A number after an operator: 8, (−8). */
const after = (x: number, show: (x: number) => string) => {
  const s = show(x);
  return s.startsWith('−') || s.startsWith('-') ? `(${s})` : s;
};
const showOf = (style: AngleLineStyle) => style.show ?? ((x: number) => formatNumber(x));

/**
 * The quadrant (or axis) of (x, y) and what tan⁻¹(y ÷ x) needs to give its angle: "(−8, 6) is
 * in quadrant II: add 180°". `full` angles run 0° to 360° (quadrant IV adds 360°); otherwise
 * −180° to 180° (quadrant III subtracts 180°).
 */
export function quadrantLine(
  x: number,
  y: number,
  unit: 'degrees' | 'radians' = 'degrees',
  full = false,
  show: (x: number) => string = decimal,
): string {
  const half = unit === 'degrees' ? '180°' : 'π';
  const turn = unit === 'degrees' ? '360°' : '2π';
  const pt = `(${show(x)}, ${show(y)})`;
  const q = quadrantOf(x, y);
  if (q === undefined) {
    if (x === 0) return `${pt} is on the ${y > 0 ? 'positive' : 'negative'} y-axis`;
    return `${pt} is on the ${x > 0 ? 'positive' : 'negative'} x-axis`;
  }
  const add =
    q === 1
      ? 'tan⁻¹ gives the angle as it is'
      : q === 2
        ? `add ${half}`
        : q === 3
          ? full
            ? `add ${half}`
            : `subtract ${half}`
          : full
            ? `add ${turn}`
            : 'tan⁻¹ gives the angle as it is';
  return `${pt} is in quadrant ${QUADRANT_NAMES[q]}: ${add}`;
}

/**
 * The angle of (x, y), quadrant-correct, as a class writes it: the quadrant line, then "θ =
 * tan⁻¹(6 ÷ (−8)) + 180° = −36.87° + 180° = 143.13°" (degrees) or "φ = tan⁻¹(−0.4 ÷ 0.3) =
 * −0.9273 rad" (radians). `form` 'atan2' opens with "θ = atan2(6, −8)" as the plans write it.
 * `full` gives 0° to 360° (else −180° to 180°). On an axis the angle is stated (90°, π).
 */
export function atan2Lines(
  y: number,
  x: number,
  opts: AngleLineStyle & {
    unit?: 'degrees' | 'radians';
    form?: 'tan' | 'atan2';
    full?: boolean;
  } = {},
): string[] {
  const { unit = 'degrees', form = 'tan', full = false, name = 'θ' } = opts;
  const show = showOf(opts);
  const deg = unit === 'degrees';
  const mark = (a: number) => (deg ? `${show(a)}°` : `${show(a)} rad`);
  const raw = atan2D(y, x);
  if (raw === undefined) return [`(0, 0) has no angle`];
  const angle = full ? wrap360(raw) : raw;
  const value = deg ? angle : angle * DEG;
  // (atan2 runs −180° to 180°: a full-turn angle below 0 adds its turn)
  const wrapTurn = full && raw < 0 ? (deg ? ' + 360°' : ' + 2π') : '';
  const head =
    form === 'atan2' ? `${name} = atan2(${show(y)}, ${show(x)})${wrapTurn} = ` : `${name} = `;
  const lines = [quadrantLine(x, y, unit, full, show)];
  if (x === 0 || y === 0) {
    lines.push(`${head.replace(/ = $/, '')} = ${mark(value)}`);
    return lines;
  }
  const base = `tan⁻¹(${show(y)} ÷ ${after(x, show)})`;
  const principal = Math.atan(y / x) / (deg ? DEG : 1);
  const shift = value - principal;
  const k = Math.round(shift / (deg ? 180 : Math.PI));
  if (k === 0) {
    lines.push(`${head}${base} = ${mark(value)}`);
    return lines;
  }
  const amount = deg ? `${Math.abs(k) * 180}°` : Math.abs(k) === 1 ? 'π' : `${Math.abs(k)}π`;
  const sign = k > 0 ? '+' : '−';
  const p = deg ? `${show(principal)}°` : show(principal);
  const numeric = deg ? `${Math.abs(k) * 180}°` : show(Math.abs(k) * Math.PI);
  lines.push(`${head}${base} ${sign} ${amount} = ${p} ${sign} ${numeric} = ${mark(value)}`);
  return lines;
}

/** The compass quarter a direction points to, from its east and north parts. */
export function compassQuarter(east: number, north: number): string {
  const ns = north > 0 ? 'north' : north < 0 ? 'south' : '';
  const ew = east > 0 ? 'east' : east < 0 ? 'west' : '';
  return ns && ew ? `${ns}-${ew}` : `due ${ns || ew}`;
}

/**
 * The compass bearing of a direction from its east and north parts (a course's departure and
 * latitude, a slope's downhill gradient): "(east, north) = (−0.6, −0.4) points south-west: add
 * 180°", "azimuth = tan⁻¹(−0.6 ÷ (−0.4)) + 180° = 56.31° + 180° = 236.31°", and the bearing
 * "236.31° = S 56.31° W" (`bearing`: 'decimal', 'dms' or none).
 */
export function bearingLines(
  east: number,
  north: number,
  opts: AngleLineStyle & { bearing?: 'decimal' | 'dms' | false; decimals?: number } = {},
): string[] {
  const { name = 'azimuth', bearing = 'decimal' } = opts;
  const show = showOf(opts);
  const az = azimuthD(east, north);
  if (az === undefined) return ['(0, 0) points nowhere: no bearing'];
  const pt = `(east, north) = (${show(east)}, ${show(north)})`;
  const quarter = compassQuarter(east, north);
  const lines: string[] = [];
  if (north === 0 || east === 0) {
    lines.push(`${pt} points ${quarter}`, `${name} = ${show(az)}°`);
  } else {
    const principal = atanD(east / north);
    const add = north < 0 ? 180 : east < 0 ? 360 : 0;
    lines.push(`${pt} points ${quarter}${add ? `: add ${add}°` : ''}`);
    const base = `tan⁻¹(${show(east)} ÷ ${after(north, show)})`;
    lines.push(
      add
        ? `${name} = ${base} + ${add}° = ${show(principal)}° + ${add}° = ${show(az)}°`
        : `${name} = ${base} = ${show(az)}°`,
    );
  }
  if (bearing) {
    const angle =
      bearing === 'dms'
        ? (a: number) => dmsShort(a, opts.decimals ?? 0)
        : (a: number) => `${show(a)}°`;
    lines.push(`${show(az)}° = ${bearingText(az, angle)}`);
  }
  return lines;
}

/**
 * Decimal degrees to degrees, minutes and seconds, a part a line: "0.2083 × 60 = 12.5′" (the
 * minutes from the decimal part), "0.5 × 60 = 30″", "34.2083° = 34°12′30″". Each multiplied
 * part is shown to enough figures that the next line follows from it.
 */
export function toDmsLines(deg: number, form: 'dms' | 'dm' = 'dms', decimals = 0): string[] {
  const p = dmsParts(deg, form === 'dm', decimals);
  const sign = p.sign < 0 ? '−' : '';
  const a = Math.abs(deg);
  const exactMin = (a - Math.floor(a)) * 60;
  const fig = (x: number) => String(Number(x.toPrecision(10)));
  const text = dmsText(deg, form, decimals);
  if (Number.isInteger(a)) return [`${sign}${fig(a)}° = ${text}`];
  const lines = [`${fig(a - Math.floor(a))} × 60 = ${fig(exactMin)}′`];
  if (form === 'dms' && !Number.isInteger(Number(exactMin.toFixed(9)))) {
    const sec = (exactMin - Math.floor(exactMin)) * 60;
    lines.push(`${fig(exactMin - Math.floor(exactMin))} × 60 = ${fig(sec)}″`);
  }
  lines.push(`${sign}${fig(a)}° = ${text}`);
  return lines;
}

/** Degrees, minutes and seconds to decimal degrees: "4°30′00″ = 4 + 30 ÷ 60 + 0 ÷ 3600 = 4.5°". */
export function fromDmsLine(deg: number, form: 'dms' | 'dm' = 'dms', decimals = 0): string {
  const p = dmsParts(deg, form === 'dm', decimals);
  const value = p.sign * (p.d + p.m / 60 + p.s / 3600);
  const sum = form === 'dm' ? `${p.d} + ${p.m} ÷ 60` : `${p.d} + ${p.m} ÷ 60 + ${p.s} ÷ 3600`;
  const signed = p.sign < 0 ? `−(${sum})` : sum;
  return `${dmsText(deg, form, decimals)} = ${signed} = ${String(Number(value.toPrecision(8)))}°`;
}

/** The units an angle converts between in a line. */
export type AngleUnit = '°' | 'rad' | 'grad' | 'rev' | '′' | '″';
const PER_DEGREE: Record<AngleUnit, number> = {
  '°': 1,
  rad: DEG,
  grad: 400 / 360,
  rev: 1 / 360,
  '′': 60,
  '″': 3600,
};
const glued = (u: AngleUnit) => u === '°' || u === '′' || u === '″';
/** A value with an angle unit: 45°, 0.7854 rad, 50 grad. */
export const withAngleUnit = (n: string, u: string) =>
  glued(u as AngleUnit) ? `${n}${u}` : `${n} ${u}`;

/**
 * An angle converted, as a line: "45° × π ÷ 180 = 0.7854 rad", "0.7854 rad × 180 ÷ π = 45°",
 * "50 grad × 360 ÷ 400 = 45°", "1.5° × 60 = 90′".
 */
export function angleConversionLine(
  x: number,
  from: AngleUnit,
  to: AngleUnit,
  show: (x: number) => string = decimal,
): string {
  const y = (x / PER_DEGREE[from]) * PER_DEGREE[to];
  const by =
    from === '°' && to === 'rad'
      ? '× π ÷ 180'
      : from === 'rad' && to === '°'
        ? '× 180 ÷ π'
        : from === '°' && to === 'grad'
          ? '× 400 ÷ 360'
          : from === 'grad' && to === '°'
            ? '× 360 ÷ 400'
            : from === 'rad' && to === 'grad'
              ? '× 200 ÷ π'
              : from === 'grad' && to === 'rad'
                ? '× π ÷ 200'
                : PER_DEGREE[to] >= PER_DEGREE[from]
                  ? `× ${PER_DEGREE[to] / PER_DEGREE[from]}`
                  : `÷ ${PER_DEGREE[from] / PER_DEGREE[to]}`;
  return `${withAngleUnit(show(x), from)} ${by} = ${withAngleUnit(show(y), to)}`;
}

/**
 * The rule a conversion line states between two angle units, as a class writes it: "180° = π
 * rad", "400 grad = 360°", "1° = 60′", "1 rev = 2π rad"; undefined for a pair that isn't two
 * angle units (`conversionRule` in units.ts uses it).
 */
export function angleRule(a: string, b: string): string | undefined {
  const known = (u: string): u is AngleUnit => u in PER_DEGREE;
  if (!known(a) || !known(b) || a === b) return undefined;
  const pair = (x: AngleUnit, y: AngleUnit) => (a === x && b === y) || (a === y && b === x);
  if (pair('°', 'rad')) return '180° = π rad';
  if (pair('grad', 'rad')) return 'π rad = 200 grad';
  if (pair('rev', 'rad')) return '1 rev = 2π rad';
  if (pair('grad', '°')) return '400 grad = 360°';
  // (the bigger unit first: 1° = 60′, 1 rev = 360°)
  const [big, small] = PER_DEGREE[a] < PER_DEGREE[b] ? [a, b] : [b, a];
  return `${withAngleUnit('1', big)} = ${withAngleUnit(String(PER_DEGREE[small] / PER_DEGREE[big]), small)}`;
}

/**
 * An inverse trig value with both answers where the page asks for them: "θ = sin⁻¹(0.5) = 30°,
 * or θ = 180° − 30° = 150°" (sine), "θ = ±cos⁻¹(0.5) = ±60°" (cosine); one answer for tan, or
 * when both are the same (sin⁻¹(1) = 90°).
 */
export function inverseTrigLines(
  fn: 'sin' | 'cos' | 'tan',
  x: number,
  opts: AngleLineStyle & { both?: boolean; unit?: 'degrees' | 'radians' } = {},
): string[] {
  const { name = 'θ', both = true, unit = 'degrees' } = opts;
  const show = showOf(opts);
  const deg = unit === 'degrees';
  const k = deg ? 1 : DEG;
  const mark = (a: number) => (deg ? `${show(a)}°` : `${show(a)} rad`);
  const a = fn === 'sin' ? asinD(x) : fn === 'cos' ? acosD(x) : atanD(x);
  if (a === undefined) return [`${fn}⁻¹(${show(x)}) has no angle: ${show(x)} is outside −1 to 1`];
  const first = `${name} = ${fn}⁻¹(${show(x)}) = ${mark(a * k)}`;
  if (!both || fn === 'tan') return [first];
  if (fn === 'sin') {
    if (Math.abs(a - 90) < 1e-12 || Math.abs(a + 90) < 1e-12) return [first];
    const half = deg ? '180°' : 'π';
    const shownA = deg ? `${show(a)}°` : show(a * k);
    const term = shownA.startsWith('−') ? `(${shownA})` : shownA;
    return [`${first}, or ${name} = ${half} − ${term} = ${mark((180 - a) * k)}`];
  }
  if (a === 0) return [first];
  return [`${name} = ±${fn}⁻¹(${show(x)}) = ±${mark(a * k)}`];
}
