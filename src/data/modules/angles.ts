/**
 * Angle values and rules for pages (HE-E19): an angle in degrees with its radian (or gradian)
 * menu, a DMS or bearing value, and the rules that turn a point or a direction into its angle
 * (atan2 with the quadrant named; a compass bearing from east and north). The text and lines
 * are `engine/angles.ts`; the harness reads them back (`harness/angles.ts`).
 */
import { atan2D, atan2Lines, azimuthD, bearingLines, DEG, type AngleForm } from '@/engine/angles';
import { formatNumber } from '@/engine/format';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { StepText } from './types';
import type { RulesOf } from './written';

/**
 * An angle value. `unit` is the one its rules use ('°' or 'rad'); `units` lists the others a
 * student may show it in (['°', 'rad'], with 'grad' on surveying pages): the steps then convert
 * ("θ = 45° = 0.7854 rad   (180° = π rad)").
 */
export function angleVariable(
  id: string,
  symbol: string,
  name: string,
  opts: Partial<VariableDef> & { unit?: '°' | 'rad' } = {},
): VariableDef {
  const unit = opts.unit ?? '°';
  const [min, max] = unit === '°' ? [-360, 360] : [-2 * Math.PI, 2 * Math.PI];
  return { id, symbol, name, min, max, ...opts, unit };
}

/**
 * An angle in degrees shown and typed as DMS or a compass direction (`AngleForm`): a surveyor's
 * vertical angle "4°30′00″", a course's bearing "N 52°10′ E", an aspect "236°". A bearing or
 * azimuth runs 0° to 360°. It lists no other unit (its text carries its marks).
 */
export function angleFormVariable(
  id: string,
  symbol: string,
  name: string,
  form: AngleForm,
  extra: Partial<VariableDef> = {},
): VariableDef {
  const compass = form === 'bearing' || form === 'bearing-decimal' || form === 'azimuth';
  return {
    id,
    symbol,
    name,
    min: compass ? 0 : -360,
    max: compass ? 360 : 360,
    ...extra,
    unit: '°',
    angleForm: form,
  };
}

/** A value from a rule worked forward only, to 12 figures (never a value typed back into it). */
const forward = (vars: string[], target: string, f: (v: Values) => number | undefined) => ({
  ...Object.fromEntries(vars.map((y) => [y, () => undefined])),
  [target]: (v: Values) => {
    const y = f(v);
    return y === undefined || !Number.isFinite(y) ? undefined : Number(y.toPrecision(12));
  },
});

/**
 * The angle of the point (x, y), quadrant-correct: θ = atan2(y, x) as a relation worked forward,
 * whose step opens "θ = atan2(6, −8)" and shows the quadrant line and "θ = tan⁻¹(6 ÷ (−8)) +
 * 180° = −36.87° + 180° = 143.13°" (`atan2Lines`). `unit` is the target's ('°' or 'rad'); `full`
 * gives 0° to 360° (else −180° to 180°). A vector's direction, a phasor's angle, a phase φ.
 */
export function atan2Rule(opts: {
  target: string;
  y: string;
  x: string;
  /** The angle's symbol in the lines (θ, φ, β). */
  symbol: string;
  unit?: '°' | 'rad';
  full?: boolean;
  how?: string;
  show?: (x: number) => string;
}): RulesOf {
  const { target, y, x, symbol, unit = '°', full = false } = opts;
  const deg = unit === '°';
  const show = opts.show ?? ((n: number) => formatNumber(n));
  const angle = (v: Values) => {
    const a = atan2D(v[y]!, v[x]!);
    if (a === undefined) return undefined;
    const b = full && a < 0 ? a + 360 : a;
    return deg ? b : b * DEG;
  };
  // (a full-turn angle below 0 adds its turn: atan2(−6, 8) + 360°)
  const turn = (v: Values) =>
    full && (atan2D(v[y]!, v[x]!) ?? 0) < 0 ? (deg ? ' + 360°' : ' + 2π') : '';
  const relation: Relation = {
    id: `${symbol} = atan2(${y}, ${x})`,
    display: `{${target}} = atan2({${y}}, {${x}})`,
    vars: [target, y, x],
    residual: (v) => {
      const a = angle(v);
      if (a === undefined) return NaN;
      // (equal up to whole turns: 360° and 0° are one direction)
      const t = deg ? 360 : 2 * Math.PI;
      const d = (((v[target]! - a) % t) + t) % t;
      return Math.min(d, t - d);
    },
    solve: forward([target, y, x], target, angle),
    check: (v) => `${show(v[target]!)} = atan2(${show(v[y]!)}, ${show(v[x]!)})${turn(v)}`,
    message: (v) =>
      v[x] === 0 && v[y] === 0 ? 'The point (0, 0) has no direction, so no angle.' : undefined,
  };
  const step: StepText = {
    expr: (v) => `atan2({${y}}, {${x}})${turn(v)}`,
    how:
      opts.how ??
      'The angle from the positive x-axis: tan⁻¹ of y over x, turned into the quadrant the point is in.',
    work: (v) =>
      atan2Lines(v[y]!, v[x]!, {
        show,
        name: symbol,
        unit: deg ? 'degrees' : 'radians',
        full,
      }),
  };
  return { relations: [relation], steps: { [relation.id]: { [target]: step } } };
}

/**
 * The compass bearing of a direction from its east and north parts (a course's departure and
 * latitude, a slope's downhill gradient): azimuth = atan2(east, north), 0° to 360° clockwise
 * from north, worked forward. Its step shows which way the direction points, "azimuth =
 * tan⁻¹(−0.6 ÷ (−0.4)) + 180° = 236.31°" and the bearing "236.31° = S 56.31° W"
 * (`bearingLines`); the value shows in its own `angleForm` (`angleFormVariable`).
 */
export function bearingRule(opts: {
  target: string;
  east: string;
  north: string;
  symbol: string;
  /** How the work's last line writes the bearing (default: as decimals). */
  bearing?: 'decimal' | 'dms' | false;
  how?: string;
  show?: (x: number) => string;
}): RulesOf {
  const { target, east, north, symbol } = opts;
  const show = opts.show ?? ((n: number) => formatNumber(n));
  const azimuth = (v: Values) => azimuthD(v[east]!, v[north]!);
  const turn = (v: Values) => (Math.atan2(v[east]!, v[north]!) < 0 ? ' + 360°' : '');
  const relation: Relation = {
    id: `${symbol} = atan2(${east}, ${north})`,
    display: `{${target}} = atan2({${east}}, {${north}})`,
    vars: [target, east, north],
    residual: (v) => {
      const a = azimuth(v);
      if (a === undefined) return NaN;
      const d = (((v[target]! - a) % 360) + 360) % 360;
      return Math.min(d, 360 - d);
    },
    solve: forward([target, east, north], target, azimuth),
    check: (v) => `${show(v[target]!)}° = atan2(${show(v[east]!)}, ${show(v[north]!)})${turn(v)}`,
    message: (v) =>
      v[east] === 0 && v[north] === 0 ? 'East and north are both 0: no direction.' : undefined,
  };
  const step: StepText = {
    expr: (v) => `atan2({${east}}, {${north}})${turn(v)}`,
    how:
      opts.how ??
      'Clockwise from north: tan⁻¹ of east over north, turned into the quarter the direction points to.',
    work: (v) => bearingLines(v[east]!, v[north]!, { show, bearing: opts.bearing ?? 'decimal' }),
  };
  return { relations: [relation], steps: { [relation.id]: { [target]: step } } };
}
