/**
 * Unit registry and conversions. Every unit is defined by how many of its dimension's base
 * unit (SI) one of it equals. US customary factors are the exact legal definitions
 * (e.g. 1 in = 2.54 cm, 1 lb = 0.45359237 kg).
 */

export type Dimension =
  | 'length'
  | 'area'
  | 'volume'
  | 'mass'
  | 'time'
  | 'speed'
  | 'acceleration'
  | 'force'
  | 'density'
  | 'voltage'
  | 'current'
  | 'resistance'
  | 'power';

export type UnitSystem = 'metric' | 'us';

export interface UnitDef {
  /** The symbol shown to users; also the id used in module content (e.g. "cm²"). */
  id: string;
  name: string;
  dimension: Dimension;
  /** How many base (SI) units one of this unit equals, e.g. 1 in = 0.0254 m. */
  factor: number;
  /** Which system lists it; "both" units (seconds, volts…) are shared. */
  system: UnitSystem | 'both';
  /** For metric units: the US customary unit used instead under "US customary". */
  us?: string;
  /** For US units: the metric unit used instead under "Metric". */
  metric?: string;
}

const IN = 0.0254;
const FT = 0.3048;
const YD = 0.9144;
const MI = 1609.344;
const LB = 0.45359237;
const G0 = 9.80665; // standard gravity, m/s² (defines pound-force)

/** A metric (or shared) unit, with its US customary counterpart if it has one. */
const u = (
  id: string,
  name: string,
  dimension: Dimension,
  factor: number,
  system: 'metric' | 'both',
  us?: string,
): UnitDef => ({ id, name, dimension, factor, system, us });

/** A US customary unit, with its metric counterpart. */
const usu = (
  id: string,
  name: string,
  dimension: Dimension,
  factor: number,
  metric: string,
): UnitDef => ({
  id,
  name,
  dimension,
  factor,
  system: 'us',
  metric,
});

export const UNITS: readonly UnitDef[] = [
  // Length (m)
  u('mm', 'millimeters', 'length', 0.001, 'metric', 'in'),
  u('cm', 'centimeters', 'length', 0.01, 'metric', 'in'),
  u('m', 'meters', 'length', 1, 'metric', 'ft'),
  u('km', 'kilometers', 'length', 1000, 'metric', 'mi'),
  usu('in', 'inches', 'length', IN, 'cm'),
  usu('ft', 'feet', 'length', FT, 'm'),
  usu('yd', 'yards', 'length', YD, 'm'),
  usu('mi', 'miles', 'length', MI, 'km'),
  // Area (m²)
  u('mm²', 'square millimeters', 'area', 1e-6, 'metric', 'in²'),
  u('cm²', 'square centimeters', 'area', 1e-4, 'metric', 'in²'),
  u('m²', 'square meters', 'area', 1, 'metric', 'ft²'),
  u('km²', 'square kilometers', 'area', 1e6, 'metric', 'mi²'),
  usu('in²', 'square inches', 'area', IN ** 2, 'cm²'),
  usu('ft²', 'square feet', 'area', FT ** 2, 'm²'),
  usu('yd²', 'square yards', 'area', YD ** 2, 'm²'),
  usu('mi²', 'square miles', 'area', MI ** 2, 'km²'),
  // Volume (m³)
  u('mm³', 'cubic millimeters', 'volume', 1e-9, 'metric', 'in³'),
  u('cm³', 'cubic centimeters', 'volume', 1e-6, 'metric', 'in³'),
  u('mL', 'milliliters', 'volume', 1e-6, 'metric', 'fl oz'),
  u('L', 'liters', 'volume', 1e-3, 'metric', 'gal'),
  u('m³', 'cubic meters', 'volume', 1, 'metric', 'ft³'),
  usu('in³', 'cubic inches', 'volume', IN ** 3, 'cm³'),
  u('km³', 'cubic kilometers', 'volume', 1e9, 'metric', 'mi³'),
  usu('ft³', 'cubic feet', 'volume', FT ** 3, 'm³'),
  usu('yd³', 'cubic yards', 'volume', YD ** 3, 'm³'),
  usu('mi³', 'cubic miles', 'volume', MI ** 3, 'km³'),
  usu('fl oz', 'US fluid ounces', 'volume', 29.5735295625e-6, 'mL'),
  usu('gal', 'US gallons', 'volume', 3.785411784e-3, 'L'),
  // Mass (kg)
  u('mg', 'milligrams', 'mass', 1e-6, 'both'),
  u('g', 'grams', 'mass', 1e-3, 'metric', 'oz'),
  u('kg', 'kilograms', 'mass', 1, 'metric', 'lb'),
  u('t', 'metric tons', 'mass', 1000, 'metric', 'ton'),
  usu('oz', 'ounces', 'mass', LB / 16, 'g'),
  usu('lb', 'pounds', 'mass', LB, 'kg'),
  usu('ton', 'US tons', 'mass', 2000 * LB, 't'),
  // Time (s)
  u('ms', 'milliseconds', 'time', 0.001, 'both'),
  u('s', 'seconds', 'time', 1, 'both'),
  u('min', 'minutes', 'time', 60, 'both'),
  u('h', 'hours', 'time', 3600, 'both'),
  // Speed (m/s)
  u('cm/s', 'centimeters per second', 'speed', 0.01, 'metric', 'in/s'),
  u('m/s', 'meters per second', 'speed', 1, 'metric', 'ft/s'),
  u('km/h', 'kilometers per hour', 'speed', 1000 / 3600, 'metric', 'mph'),
  usu('in/s', 'inches per second', 'speed', IN, 'cm/s'),
  usu('ft/s', 'feet per second', 'speed', FT, 'm/s'),
  usu('mph', 'miles per hour', 'speed', MI / 3600, 'km/h'),
  // Acceleration (m/s²)
  u('m/s²', 'meters per second squared', 'acceleration', 1, 'metric', 'ft/s²'),
  usu('ft/s²', 'feet per second squared', 'acceleration', FT, 'm/s²'),
  // Force (N)
  u('N', 'newtons', 'force', 1, 'metric', 'lbf'),
  u('kN', 'kilonewtons', 'force', 1000, 'metric', 'kip'),
  usu('lbf', 'pound-force', 'force', LB * G0, 'N'),
  usu('kip', 'kips (1,000 lbf)', 'force', 1000 * LB * G0, 'kN'),
  // Density (kg/m³)
  u('g/cm³', 'grams per cubic centimeter', 'density', 1000, 'metric', 'lb/ft³'),
  u('g/mL', 'grams per milliliter', 'density', 1000, 'metric', 'lb/gal'),
  u('kg/m³', 'kilograms per cubic meter', 'density', 1, 'metric', 'lb/ft³'),
  usu('lb/ft³', 'pounds per cubic foot', 'density', LB / FT ** 3, 'kg/m³'),
  usu('lb/gal', 'pounds per US gallon', 'density', LB / 3.785411784e-3, 'g/mL'),
  usu('lb/in³', 'pounds per cubic inch', 'density', LB / IN ** 3, 'g/cm³'),
  // Electrical (shared by both systems)
  u('mV', 'millivolts', 'voltage', 1e-3, 'both'),
  u('V', 'volts', 'voltage', 1, 'both'),
  u('kV', 'kilovolts', 'voltage', 1e3, 'both'),
  u('mA', 'milliamps', 'current', 1e-3, 'both'),
  u('A', 'amps', 'current', 1, 'both'),
  u('Ω', 'ohms', 'resistance', 1, 'both'),
  u('kΩ', 'kilohms', 'resistance', 1e3, 'both'),
  u('MΩ', 'megohms', 'resistance', 1e6, 'both'),
  u('mW', 'milliwatts', 'power', 1e-3, 'both'),
  u('W', 'watts', 'power', 1, 'both'),
  u('kW', 'kilowatts', 'power', 1e3, 'both'),
  u('MW', 'megawatts', 'power', 1e6, 'both'),
  usu('hp', 'horsepower (mechanical)', 'power', 550 * FT * LB * G0, 'W'),
];

const BY_ID = new Map(UNITS.map((x) => [x.id, x]));

/** The registered unit for a symbol, or undefined for fixed labels ("%", "per 1,000"). */
export const getUnit = (id: string | undefined) => (id ? BY_ID.get(id) : undefined);

/** Every unit of a dimension, in registry order (metric first). */
export const unitsOf = (dimension: Dimension) => UNITS.filter((x) => x.dimension === dimension);

/** Converts `x` from unit `from` to unit `to` (same dimension). */
export function convert(x: number, from: string, to: string): number {
  if (from === to) return x;
  const a = BY_ID.get(from);
  const b = BY_ID.get(to);
  if (!a || !b || a.dimension !== b.dimension) {
    throw new Error(`Cannot convert ${from} to ${to}`);
  }
  return (x * a.factor) / b.factor;
}

/** The unit a variable shows in a given system (its own unit if the system shares it). */
export function unitInSystem(id: string, system: UnitSystem): string {
  const unit = BY_ID.get(id);
  if (!unit) return id;
  if (system === 'us') return unit.us ?? id;
  if (unit.system === 'us') return unit.metric ?? id;
  return id;
}
