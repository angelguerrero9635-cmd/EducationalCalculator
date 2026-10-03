/**
 * Unit registry and conversions. Every unit is defined by how many of its dimension's base
 * unit (SI) one of it equals. US customary factors are the exact legal definitions
 * (e.g. 1 in = 2.54 cm, 1 lb = 0.45359237 kg).
 *
 * Temperatures come twice: a thermometer reading (`temperature`: 0 °C is 273.15 K) and a
 * difference (`temperatureDifference`: a rise of 1 °C is a rise of 1 K). A value says which it
 * is with `difference` (`VariableDef`), and `getUnit`, `convert` and `unitInSystem` take the
 * same flag, so ΔT never picks up the offset.
 */
import { angleRule } from './angles';

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
  | 'power'
  // Grades 9–12 science and college. These offer a unit menu only on a value that lists its
  // `units` (OPT_IN): the K–8 pages that write °C, J or mol as a plain label stay as they are.
  | 'temperature'
  | 'temperatureDifference'
  | 'pressure'
  | 'energy'
  | 'amount'
  | 'specificHeat'
  | 'longTime'
  | 'charge'
  | 'capacitance'
  // College (HE-E5). Mechanics and structures
  | 'moment'
  | 'forcePerLength'
  | 'secondMoment'
  | 'specificWeight'
  | 'fractureToughness'
  | 'strain'
  | 'momentOfInertia'
  | 'momentum'
  | 'angularMomentum'
  | 'angularSpeed'
  | 'frequency'
  // Thermal and fluids
  | 'specificEnergy'
  | 'thermalConductivity'
  | 'heatTransferCoefficient'
  | 'heatFlux'
  | 'temperatureGradient'
  | 'entropy'
  | 'dynamicViscosity'
  | 'diffusivity'
  | 'massFlow'
  | 'volumeFlow'
  | 'molarFlow'
  | 'acousticImpedance'
  // Electrical and computer
  | 'inductance'
  | 'magneticField'
  | 'magneticFlux'
  | 'magneticFieldStrength'
  | 'magneticMoment'
  | 'electricField'
  | 'lineCharge'
  | 'surfaceCharge'
  | 'conductance'
  | 'conductivity'
  | 'resistivity'
  | 'inductancePerLength'
  | 'capacitancePerLength'
  | 'apparentPower'
  | 'reactivePower'
  | 'level'
  | 'powerLevel'
  | 'antennaGain'
  | 'perUnit'
  | 'information'
  | 'dataRate'
  // Chemistry, biology, earth
  | 'molarity'
  | 'massConcentration'
  | 'ratio'
  | 'molarMass'
  | 'molarEnergy'
  | 'molarHeatCapacity'
  | 'firstOrderRate'
  | 'secondOrderRate'
  | 'reactionRate'
  | 'molarAbsorptivity'
  | 'wavenumber'
  | 'doseEquivalent'
  | 'absorbedDose'
  | 'activity'
  | 'specificActivity'
  | 'gravitationalParameter'
  | 'trafficFlow'
  | 'laneDensity'
  // Angles (HE-E19): degrees, radians, gradians, minutes and seconds of arc, turns
  | 'angle';

/** The dimensions every K–8 page had before the high-school and college ones. */
const CORE: ReadonlySet<Dimension> = new Set<Dimension>([
  'length',
  'area',
  'volume',
  'mass',
  'time',
  'speed',
  'acceleration',
  'force',
  'density',
  'voltage',
  'current',
  'resistance',
  'power',
]);

/**
 * Dimensions whose menu a value opts into by listing its `units`: every one but the K–8 core.
 * (A K–12 page writing Hz, N·m or kJ/mol as a plain label keeps it as a label.)
 */
export const OPT_IN: ReadonlySet<Dimension> = {
  has: (d: Dimension) => !CORE.has(d),
} as ReadonlySet<Dimension>;

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
  /**
   * Base units at this unit's zero (temperature: 0 °C is 273.15 K), so base = x × factor +
   * offset. Absolute temperatures (and dBm against dBW) convert this way; a temperature
   * difference is its own dimension with no offset (`TEMPERATURE_DIFFERENCES`).
   */
  offset?: number;
  /**
   * A college unit joining a K–8 dimension (μm, nm, days, kN·m…): offered in a menu only on a
   * value that lists it in `units`, so no K–12 page's menu changes, and a value whose own unit
   * it is gets no menu unless it lists its `units`.
   */
  listed?: boolean;
}

const IN = 0.0254;
const FT = 0.3048;
const YD = 0.9144;
const MI = 1609.344;
const LB = 0.45359237;
const G0 = 9.80665; // standard gravity, m/s² (defines pound-force)
const LBF = LB * G0;
const GAL = 3.785411784e-3;
const BTU = 1055.05585262; // International Table British thermal unit, J
const DAY = 86400;
const YEAR = 31557600; // Julian year (365.25 days), the astronomers' year
const DA = 1.6605390666e-27; // dalton (unified atomic mass unit), kg
const EV = 1.602176634e-19;

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

/** A college unit added to a K–8 dimension: in a menu only where a value lists it. */
const listed = (def: UnitDef): UnitDef => ({ ...def, listed: true });

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
  listed(u('μm', 'micrometers', 'length', 1e-6, 'both')),
  listed(u('nm', 'nanometers', 'length', 1e-9, 'both')),
  listed(u('Å', 'ångströms', 'length', 1e-10, 'both')),
  listed(u('pm', 'picometers', 'length', 1e-12, 'both')),
  // Area (m²)
  u('mm²', 'square millimeters', 'area', 1e-6, 'metric', 'in²'),
  u('cm²', 'square centimeters', 'area', 1e-4, 'metric', 'in²'),
  u('m²', 'square meters', 'area', 1, 'metric', 'ft²'),
  u('km²', 'square kilometers', 'area', 1e6, 'metric', 'mi²'),
  usu('in²', 'square inches', 'area', IN ** 2, 'cm²'),
  usu('ft²', 'square feet', 'area', FT ** 2, 'm²'),
  usu('yd²', 'square yards', 'area', YD ** 2, 'm²'),
  usu('mi²', 'square miles', 'area', MI ** 2, 'km²'),
  listed(u('μm²', 'square micrometers', 'area', 1e-12, 'both')),
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
  usu('gal', 'US gallons', 'volume', GAL, 'L'),
  listed(u('μL', 'microliters', 'volume', 1e-9, 'both')),
  // Mass (kg)
  u('mg', 'milligrams', 'mass', 1e-6, 'both'),
  u('g', 'grams', 'mass', 1e-3, 'metric', 'oz'),
  u('kg', 'kilograms', 'mass', 1, 'metric', 'lb'),
  u('t', 'metric tons', 'mass', 1000, 'metric', 'ton'),
  usu('oz', 'ounces', 'mass', LB / 16, 'g'),
  usu('lb', 'pounds', 'mass', LB, 'kg'),
  usu('ton', 'US tons', 'mass', 2000 * LB, 't'),
  listed(u('μg', 'micrograms', 'mass', 1e-9, 'both')),
  listed(u('ng', 'nanograms', 'mass', 1e-12, 'both')),
  listed(u('u', 'unified atomic mass units', 'mass', DA, 'both')),
  listed(u('Da', 'daltons', 'mass', DA, 'both')),
  listed(u('kDa', 'kilodaltons', 'mass', 1e3 * DA, 'both')),
  listed(u('MDa', 'megadaltons', 'mass', 1e6 * DA, 'both')),
  // Time (s)
  u('ms', 'milliseconds', 'time', 0.001, 'both'),
  u('s', 'seconds', 'time', 1, 'both'),
  u('min', 'minutes', 'time', 60, 'both'),
  u('h', 'hours', 'time', 3600, 'both'),
  listed(u('ns', 'nanoseconds', 'time', 1e-9, 'both')),
  listed(u('μs', 'microseconds', 'time', 1e-6, 'both')),
  listed(u('days', 'days', 'time', DAY, 'both')),
  // Speed (m/s)
  u('cm/s', 'centimeters per second', 'speed', 0.01, 'metric', 'in/s'),
  u('m/s', 'meters per second', 'speed', 1, 'metric', 'ft/s'),
  u('km/h', 'kilometers per hour', 'speed', 1000 / 3600, 'metric', 'mph'),
  usu('in/s', 'inches per second', 'speed', IN, 'cm/s'),
  usu('ft/s', 'feet per second', 'speed', FT, 'm/s'),
  usu('mph', 'miles per hour', 'speed', MI / 3600, 'km/h'),
  // Space speeds are km/s in both systems (no one writes a galaxy's speed in mi/s).
  u('km/s', 'kilometers per second', 'speed', 1000, 'both'),
  // Groundwater, rain and plates (m/day, mm/h, mm/yr)
  listed(u('m/day', 'meters per day', 'speed', 1 / DAY, 'both')),
  listed(u('mm/h', 'millimeters per hour', 'speed', 1e-3 / 3600, 'both')),
  listed(u('mm/yr', 'millimeters per year', 'speed', 1e-3 / YEAR, 'both')),
  listed(u('cm/yr', 'centimeters per year', 'speed', 1e-2 / YEAR, 'both')),
  // Acceleration (m/s²)
  u('m/s²', 'meters per second squared', 'acceleration', 1, 'metric', 'ft/s²'),
  usu('ft/s²', 'feet per second squared', 'acceleration', FT, 'm/s²'),
  // Gravity surveys (1 Gal = 1 cm/s²)
  listed(u('Gal', 'gals', 'acceleration', 0.01, 'both')),
  listed(u('mGal', 'milligals', 'acceleration', 1e-5, 'both')),
  // Force (N)
  u('N', 'newtons', 'force', 1, 'metric', 'lbf'),
  u('kN', 'kilonewtons', 'force', 1000, 'metric', 'kip'),
  usu('lbf', 'pound-force', 'force', LBF, 'N'),
  usu('kip', 'kips (1,000 lbf)', 'force', 1000 * LBF, 'kN'),
  listed(u('mN', 'millinewtons', 'force', 1e-3, 'both')),
  listed(u('MN', 'meganewtons', 'force', 1e6, 'both')),
  // Density (kg/m³)
  u('g/cm³', 'grams per cubic centimeter', 'density', 1000, 'metric', 'lb/ft³'),
  u('g/mL', 'grams per milliliter', 'density', 1000, 'metric', 'lb/gal'),
  u('kg/m³', 'kilograms per cubic meter', 'density', 1, 'metric', 'lb/ft³'),
  usu('lb/ft³', 'pounds per cubic foot', 'density', LB / FT ** 3, 'kg/m³'),
  usu('lb/gal', 'pounds per US gallon', 'density', LB / GAL, 'g/mL'),
  usu('lb/in³', 'pounds per cubic inch', 'density', LB / IN ** 3, 'g/cm³'),
  // Electrical (shared by both systems)
  u('mV', 'millivolts', 'voltage', 1e-3, 'both'),
  u('V', 'volts', 'voltage', 1, 'both'),
  u('kV', 'kilovolts', 'voltage', 1e3, 'both'),
  listed(u('μV', 'microvolts', 'voltage', 1e-6, 'both')),
  listed(u('MV', 'megavolts', 'voltage', 1e6, 'both')),
  u('mA', 'milliamps', 'current', 1e-3, 'both'),
  u('A', 'amps', 'current', 1, 'both'),
  listed(u('nA', 'nanoamps', 'current', 1e-9, 'both')),
  listed(u('μA', 'microamps', 'current', 1e-6, 'both')),
  listed(u('kA', 'kiloamps', 'current', 1e3, 'both')),
  u('Ω', 'ohms', 'resistance', 1, 'both'),
  u('kΩ', 'kilohms', 'resistance', 1e3, 'both'),
  u('MΩ', 'megohms', 'resistance', 1e6, 'both'),
  listed(u('mΩ', 'milliohms', 'resistance', 1e-3, 'both')),
  listed(u('GΩ', 'gigohms', 'resistance', 1e9, 'both')),
  u('mW', 'milliwatts', 'power', 1e-3, 'both'),
  u('W', 'watts', 'power', 1, 'both'),
  u('kW', 'kilowatts', 'power', 1e3, 'both'),
  u('MW', 'megawatts', 'power', 1e6, 'both'),
  usu('hp', 'horsepower (mechanical)', 'power', 550 * FT * LBF, 'W'),
  listed(u('μW', 'microwatts', 'power', 1e-6, 'both')),
  listed(u('GW', 'gigawatts', 'power', 1e9, 'both')),
  listed(u('TW', 'terawatts', 'power', 1e12, 'both')),
  listed(usu('Btu/h', 'Btu per hour', 'power', BTU / 3600, 'W')),
  // Temperature (K), absolute temperatures only (see `offset`; differences are below)
  u('K', 'kelvins', 'temperature', 1, 'both'),
  { ...u('°C', 'degrees Celsius', 'temperature', 1, 'both'), offset: 273.15 },
  { ...u('°F', 'degrees Fahrenheit', 'temperature', 5 / 9, 'both'), offset: (459.67 * 5) / 9 },
  listed(u('R', 'degrees Rankine', 'temperature', 5 / 9, 'both')),
  // Pressure and stress (Pa)
  u('Pa', 'pascals', 'pressure', 1, 'both'),
  u('hPa', 'hectopascals', 'pressure', 100, 'both'),
  u('kPa', 'kilopascals', 'pressure', 1000, 'both'),
  listed(u('MPa', 'megapascals', 'pressure', 1e6, 'metric', 'ksi')),
  listed(u('GPa', 'gigapascals', 'pressure', 1e9, 'metric', 'ksi')),
  listed(u('N/mm²', 'newtons per square millimeter', 'pressure', 1e6, 'metric', 'ksi')),
  listed(u('kN/m²', 'kilonewtons per square meter', 'pressure', 1e3, 'metric', 'psf')),
  listed(u('bar', 'bars', 'pressure', 1e5, 'both')),
  listed(u('mbar', 'millibars', 'pressure', 100, 'both')),
  u('atm', 'atmospheres', 'pressure', 101325, 'both'),
  u('mmHg', 'millimeters of mercury', 'pressure', 101325 / 760, 'both'),
  u('torr', 'torr', 'pressure', 101325 / 760, 'both'),
  u('psi', 'pounds per square inch', 'pressure', LBF / IN ** 2, 'both'),
  listed(usu('ksi', 'kips per square inch', 'pressure', (1000 * LBF) / IN ** 2, 'MPa')),
  listed(usu('Msi', 'million pounds per square inch', 'pressure', (1e6 * LBF) / IN ** 2, 'GPa')),
  listed(usu('psf', 'pounds per square foot', 'pressure', LBF / FT ** 2, 'kPa')),
  listed(usu('ksf', 'kips per square foot', 'pressure', (1000 * LBF) / FT ** 2, 'kPa')),
  // Energy (J)
  u('J', 'joules', 'energy', 1, 'both'),
  u('kJ', 'kilojoules', 'energy', 1000, 'both'),
  u('MJ', 'megajoules', 'energy', 1e6, 'both'),
  listed(u('GJ', 'gigajoules', 'energy', 1e9, 'both')),
  listed(u('kPa·m³', 'kilopascal cubic meters', 'energy', 1000, 'both')),
  u('cal', 'calories', 'energy', 4.184, 'both'),
  u('kcal', 'kilocalories', 'energy', 4184, 'both'),
  listed(u('Wh', 'watt-hours', 'energy', 3600, 'both')),
  u('kWh', 'kilowatt-hours', 'energy', 3.6e6, 'both'),
  u('eV', 'electronvolts', 'energy', EV, 'both'),
  listed(u('keV', 'kiloelectronvolts', 'energy', 1e3 * EV, 'both')),
  listed(u('MeV', 'megaelectronvolts', 'energy', 1e6 * EV, 'both')),
  listed(u('GeV', 'gigaelectronvolts', 'energy', 1e9 * EV, 'both')),
  listed(u('Btu', 'British thermal units', 'energy', BTU, 'both')),
  listed(u('ft·lbf', 'foot-pounds', 'energy', FT * LBF, 'both')),
  // Amount of substance (mol)
  listed(u('nmol', 'nanomoles', 'amount', 1e-9, 'both')),
  listed(u('μmol', 'micromoles', 'amount', 1e-6, 'both')),
  u('mmol', 'millimoles', 'amount', 1e-3, 'both'),
  u('mol', 'moles', 'amount', 1, 'both'),
  listed(u('kmol', 'kilomoles', 'amount', 1e3, 'both')),
  // Specific heat and specific entropy (J/(kg·K)); a change of 1 °C is a change of 1 K
  u('J/(g·°C)', 'joules per gram per degree Celsius', 'specificHeat', 1000, 'both'),
  u('J/(kg·°C)', 'joules per kilogram per degree Celsius', 'specificHeat', 1, 'both'),
  u('cal/(g·°C)', 'calories per gram per degree Celsius', 'specificHeat', 4184, 'both'),
  listed(
    u('J/(kg·K)', 'joules per kilogram per kelvin', 'specificHeat', 1, 'metric', 'Btu/(lb·°F)'),
  ),
  listed(u('J/(g·K)', 'joules per gram per kelvin', 'specificHeat', 1000, 'metric', 'Btu/(lb·°F)')),
  listed(
    u(
      'kJ/(kg·K)',
      'kilojoules per kilogram per kelvin',
      'specificHeat',
      1000,
      'metric',
      'Btu/(lb·°F)',
    ),
  ),
  listed(
    usu('Btu/(lb·°F)', 'Btu per pound per degree Fahrenheit', 'specificHeat', 4186.8, 'kJ/(kg·K)'),
  ),
  listed(
    usu('Btu/(lb·R)', 'Btu per pound per degree Rankine', 'specificHeat', 4186.8, 'kJ/(kg·K)'),
  ),
  // Long times (years), for Earth's history and a star's life; they convert to seconds too
  u('yr', 'years', 'longTime', 1, 'both'),
  u('kyr', 'thousand years', 'longTime', 1e3, 'both'),
  u('Ma', 'million years', 'longTime', 1e6, 'both'),
  listed(u('Myr', 'million years', 'longTime', 1e6, 'both')),
  u('Ga', 'billion years', 'longTime', 1e9, 'both'),
  // Electric charge (C) and capacitance (F), for the capacitor and potential pages
  u('pC', 'picocoulombs', 'charge', 1e-12, 'both'),
  u('nC', 'nanocoulombs', 'charge', 1e-9, 'both'),
  u('μC', 'microcoulombs', 'charge', 1e-6, 'both'),
  u('mC', 'millicoulombs', 'charge', 1e-3, 'both'),
  u('C', 'coulombs', 'charge', 1, 'both'),
  listed(u('mA·h', 'milliamp-hours', 'charge', 3.6, 'both')),
  u('pF', 'picofarads', 'capacitance', 1e-12, 'both'),
  u('nF', 'nanofarads', 'capacitance', 1e-9, 'both'),
  u('μF', 'microfarads', 'capacitance', 1e-6, 'both'),
  u('F', 'farads', 'capacitance', 1, 'both'),

  // ——— College (HE-E5) ———
  // Moment and torque (N·m); energy's ft·lbf is written lbf·ft for a moment
  listed(u('N·mm', 'newton-millimeters', 'moment', 1e-3, 'metric', 'lbf·in')),
  listed(u('N·m', 'newton-meters', 'moment', 1, 'metric', 'lbf·ft')),
  listed(u('kN·m', 'kilonewton-meters', 'moment', 1e3, 'metric', 'kip·ft')),
  listed(u('MN·m', 'meganewton-meters', 'moment', 1e6, 'metric', 'kip·ft')),
  listed(usu('lbf·in', 'pound-force inches', 'moment', LBF * IN, 'N·mm')),
  listed(usu('lbf·ft', 'pound-force feet', 'moment', LBF * FT, 'N·m')),
  listed(usu('kip·in', 'kip-inches', 'moment', 1000 * LBF * IN, 'kN·m')),
  listed(usu('kip·ft', 'kip-feet', 'moment', 1000 * LBF * FT, 'kN·m')),
  // Force per length: springs, line loads (N/m)
  listed(u('N/m', 'newtons per meter', 'forcePerLength', 1, 'metric', 'lbf/ft')),
  listed(u('N/mm', 'newtons per millimeter', 'forcePerLength', 1e3, 'metric', 'lbf/in')),
  listed(u('kN/m', 'kilonewtons per meter', 'forcePerLength', 1e3, 'metric', 'kip/ft')),
  listed(usu('lbf/in', 'pound-force per inch', 'forcePerLength', LBF / IN, 'N/mm')),
  listed(usu('lbf/ft', 'pound-force per foot', 'forcePerLength', LBF / FT, 'N/m')),
  listed(usu('kip/in', 'kips per inch', 'forcePerLength', (1000 * LBF) / IN, 'kN/m')),
  listed(usu('kip/ft', 'kips per foot', 'forcePerLength', (1000 * LBF) / FT, 'kN/m')),
  // Second moment of area (m⁴)
  listed(u('mm⁴', 'millimeters to the fourth', 'secondMoment', 1e-12, 'metric', 'in⁴')),
  listed(u('cm⁴', 'centimeters to the fourth', 'secondMoment', 1e-8, 'metric', 'in⁴')),
  listed(u('m⁴', 'meters to the fourth', 'secondMoment', 1, 'metric', 'ft⁴')),
  listed(usu('in⁴', 'inches to the fourth', 'secondMoment', IN ** 4, 'mm⁴')),
  listed(usu('ft⁴', 'feet to the fourth', 'secondMoment', FT ** 4, 'm⁴')),
  // Specific weight (N/m³)
  listed(u('N/m³', 'newtons per cubic meter', 'specificWeight', 1, 'metric', 'lbf/ft³')),
  listed(u('kN/m³', 'kilonewtons per cubic meter', 'specificWeight', 1e3, 'metric', 'lbf/ft³')),
  listed(usu('lbf/ft³', 'pound-force per cubic foot', 'specificWeight', LBF / FT ** 3, 'kN/m³')),
  // Fracture toughness (Pa√m)
  listed(u('MPa√m', 'megapascal root meters', 'fractureToughness', 1e6, 'metric', 'ksi√in')),
  listed(
    usu(
      'ksi√in',
      'ksi root inches',
      'fractureToughness',
      ((1000 * LBF) / IN ** 2) * Math.sqrt(IN),
      'MPa√m',
    ),
  ),
  // Strain (m/m)
  listed(u('με', 'microstrain', 'strain', 1e-6, 'both')),
  listed(u('mm/mm', 'millimeters per millimeter', 'strain', 1, 'metric', 'in/in')),
  listed(usu('in/in', 'inches per inch', 'strain', 1, 'mm/mm')),
  // Moment of inertia of a mass (kg·m²), momentum (kg·m/s), angular momentum and action (J·s)
  listed(u('kg·m²', 'kilogram square meters', 'momentOfInertia', 1, 'metric', 'lb·ft²')),
  listed(u('g·cm²', 'gram square centimeters', 'momentOfInertia', 1e-7, 'both')),
  listed(usu('lb·ft²', 'pound square feet', 'momentOfInertia', LB * FT ** 2, 'kg·m²')),
  listed(u('kg·m/s', 'kilogram meters per second', 'momentum', 1, 'both')),
  listed(u('N·s', 'newton-seconds', 'momentum', 1, 'metric', 'lbf·s')),
  listed(usu('lbf·s', 'pound-force seconds', 'momentum', LBF, 'N·s')),
  listed(u('J·s', 'joule-seconds', 'angularMomentum', 1, 'both')),
  listed(u('kg·m²/s', 'kilogram square meters per second', 'angularMomentum', 1, 'both')),
  listed(u('eV·s', 'electronvolt-seconds', 'angularMomentum', EV, 'both')),
  // Angular speed (rad/s) and frequency (Hz): 1 rev/s is 2π rad/s, never 1 Hz
  listed(u('rad/s', 'radians per second', 'angularSpeed', 1, 'both')),
  listed(u('rpm', 'revolutions per minute', 'angularSpeed', (2 * Math.PI) / 60, 'both')),
  listed(u('rev/s', 'revolutions per second', 'angularSpeed', 2 * Math.PI, 'both')),
  listed(u('°/s', 'degrees per second', 'angularSpeed', Math.PI / 180, 'both')),
  listed(u('Hz', 'hertz', 'frequency', 1, 'both')),
  listed(u('kHz', 'kilohertz', 'frequency', 1e3, 'both')),
  listed(u('MHz', 'megahertz', 'frequency', 1e6, 'both')),
  listed(u('GHz', 'gigahertz', 'frequency', 1e9, 'both')),
  listed(u('THz', 'terahertz', 'frequency', 1e12, 'both')),

  // Specific energy: enthalpy, internal energy (J/kg)
  listed(u('J/kg', 'joules per kilogram', 'specificEnergy', 1, 'metric', 'Btu/lb')),
  listed(u('kJ/kg', 'kilojoules per kilogram', 'specificEnergy', 1e3, 'metric', 'Btu/lb')),
  listed(u('MJ/kg', 'megajoules per kilogram', 'specificEnergy', 1e6, 'metric', 'Btu/lb')),
  listed(usu('Btu/lb', 'Btu per pound', 'specificEnergy', 2326, 'kJ/kg')),
  // Thermal conductivity (W/(m·K)), film coefficient (W/(m²·K)), heat flux (W/m²)
  listed(
    u('W/(m·K)', 'watts per meter per kelvin', 'thermalConductivity', 1, 'metric', 'Btu/(h·ft·°F)'),
  ),
  listed(
    usu(
      'Btu/(h·ft·°F)',
      'Btu per hour per foot per degree Fahrenheit',
      'thermalConductivity',
      BTU / 3600 / (FT * (5 / 9)),
      'W/(m·K)',
    ),
  ),
  listed(
    u(
      'W/(m²·K)',
      'watts per square meter per kelvin',
      'heatTransferCoefficient',
      1,
      'metric',
      'Btu/(h·ft²·°F)',
    ),
  ),
  listed(
    usu(
      'Btu/(h·ft²·°F)',
      'Btu per hour per square foot per degree Fahrenheit',
      'heatTransferCoefficient',
      BTU / 3600 / (FT ** 2 * (5 / 9)),
      'W/(m²·K)',
    ),
  ),
  listed(u('mW/m²', 'milliwatts per square meter', 'heatFlux', 1e-3, 'both')),
  listed(u('W/m²', 'watts per square meter', 'heatFlux', 1, 'metric', 'Btu/(h·ft²)')),
  listed(u('kW/m²', 'kilowatts per square meter', 'heatFlux', 1e3, 'metric', 'Btu/(h·ft²)')),
  listed(
    usu('Btu/(h·ft²)', 'Btu per hour per square foot', 'heatFlux', BTU / 3600 / FT ** 2, 'W/m²'),
  ),
  // Temperature gradient (K/m): a difference over a distance, so no offset
  listed(u('K/m', 'kelvins per meter', 'temperatureGradient', 1, 'both')),
  listed(u('°C/m', 'degrees Celsius per meter', 'temperatureGradient', 1, 'both')),
  listed(u('°C/km', 'degrees Celsius per kilometer', 'temperatureGradient', 1e-3, 'both')),
  listed(u('K/km', 'kelvins per kilometer', 'temperatureGradient', 1e-3, 'both')),
  // Entropy and heat capacity of a body (J/K)
  listed(u('J/K', 'joules per kelvin', 'entropy', 1, 'both')),
  listed(u('kJ/K', 'kilojoules per kelvin', 'entropy', 1e3, 'both')),
  // Viscosity (Pa·s) and diffusivity or kinematic viscosity (m²/s)
  listed(u('Pa·s', 'pascal-seconds', 'dynamicViscosity', 1, 'metric', 'lbf·s/ft²')),
  listed(u('mPa·s', 'millipascal-seconds', 'dynamicViscosity', 1e-3, 'both')),
  listed(u('cP', 'centipoise', 'dynamicViscosity', 1e-3, 'both')),
  listed(u('P', 'poise', 'dynamicViscosity', 0.1, 'both')),
  listed(
    usu(
      'lbf·s/ft²',
      'pound-force seconds per square foot',
      'dynamicViscosity',
      LBF / FT ** 2,
      'Pa·s',
    ),
  ),
  listed(u('m²/s', 'square meters per second', 'diffusivity', 1, 'metric', 'ft²/s')),
  listed(u('cm²/s', 'square centimeters per second', 'diffusivity', 1e-4, 'both')),
  listed(u('mm²/s', 'square millimeters per second', 'diffusivity', 1e-6, 'both')),
  listed(u('cSt', 'centistokes', 'diffusivity', 1e-6, 'both')),
  listed(usu('ft²/s', 'square feet per second', 'diffusivity', FT ** 2, 'm²/s')),
  // Mass, volume and molar flow (kg/s, m³/s, mol/s)
  listed(u('g/s', 'grams per second', 'massFlow', 1e-3, 'both')),
  listed(u('kg/s', 'kilograms per second', 'massFlow', 1, 'metric', 'lb/s')),
  listed(u('kg/min', 'kilograms per minute', 'massFlow', 1 / 60, 'metric', 'lb/min')),
  listed(u('kg/h', 'kilograms per hour', 'massFlow', 1 / 3600, 'metric', 'lb/h')),
  listed(u('t/h', 'metric tons per hour', 'massFlow', 1000 / 3600, 'metric', 'lb/h')),
  listed(usu('lb/s', 'pounds per second', 'massFlow', LB, 'kg/s')),
  listed(usu('lb/min', 'pounds per minute', 'massFlow', LB / 60, 'kg/min')),
  listed(usu('lb/h', 'pounds per hour', 'massFlow', LB / 3600, 'kg/h')),
  listed(u('mL/min', 'milliliters per minute', 'volumeFlow', 1e-6 / 60, 'both')),
  listed(u('mL/h', 'milliliters per hour', 'volumeFlow', 1e-6 / 3600, 'both')),
  listed(u('L/h', 'liters per hour', 'volumeFlow', 1e-3 / 3600, 'metric', 'gal/h')),
  listed(u('L/min', 'liters per minute', 'volumeFlow', 1e-3 / 60, 'metric', 'gal/min')),
  listed(u('L/s', 'liters per second', 'volumeFlow', 1e-3, 'metric', 'gal/min')),
  listed(u('m³/day', 'cubic meters per day', 'volumeFlow', 1 / DAY, 'metric', 'MGD')),
  listed(u('m³/h', 'cubic meters per hour', 'volumeFlow', 1 / 3600, 'metric', 'ft³/min')),
  listed(u('m³/s', 'cubic meters per second', 'volumeFlow', 1, 'metric', 'ft³/s')),
  listed(u('Sv', 'sverdrups (10⁶ m³/s)', 'volumeFlow', 1e6, 'both')),
  listed(usu('gal/h', 'US gallons per hour', 'volumeFlow', GAL / 3600, 'L/h')),
  listed(usu('gal/min', 'US gallons per minute', 'volumeFlow', GAL / 60, 'L/min')),
  listed(usu('MGD', 'million US gallons per day', 'volumeFlow', (1e6 * GAL) / DAY, 'm³/day')),
  listed(usu('ft³/min', 'cubic feet per minute', 'volumeFlow', FT ** 3 / 60, 'm³/h')),
  listed(usu('ft³/s', 'cubic feet per second', 'volumeFlow', FT ** 3, 'm³/s')),
  listed(u('mol/s', 'moles per second', 'molarFlow', 1, 'both')),
  listed(u('mol/h', 'moles per hour', 'molarFlow', 1 / 3600, 'both')),
  listed(u('kmol/s', 'kilomoles per second', 'molarFlow', 1e3, 'both')),
  listed(u('kmol/h', 'kilomoles per hour', 'molarFlow', 1e3 / 3600, 'metric', 'lbmol/h')),
  listed(usu('lbmol/h', 'pound-moles per hour', 'molarFlow', (1e3 * LB) / 3600, 'kmol/h')),
  // Acoustic impedance (Pa·s/m)
  listed(u('Rayl', 'rayls', 'acousticImpedance', 1, 'both')),
  listed(u('MRayl', 'megarayls', 'acousticImpedance', 1e6, 'both')),

  // Electrical and magnetic
  listed(u('nH', 'nanohenries', 'inductance', 1e-9, 'both')),
  listed(u('μH', 'microhenries', 'inductance', 1e-6, 'both')),
  listed(u('mH', 'millihenries', 'inductance', 1e-3, 'both')),
  listed(u('H', 'henries', 'inductance', 1, 'both')),
  listed(u('nT', 'nanoteslas', 'magneticField', 1e-9, 'both')),
  listed(u('μT', 'microteslas', 'magneticField', 1e-6, 'both')),
  listed(u('mT', 'milliteslas', 'magneticField', 1e-3, 'both')),
  listed(u('T', 'teslas', 'magneticField', 1, 'both')),
  listed(u('G', 'gauss', 'magneticField', 1e-4, 'both')),
  listed(u('μWb', 'microwebers', 'magneticFlux', 1e-6, 'both')),
  listed(u('mWb', 'milliwebers', 'magneticFlux', 1e-3, 'both')),
  listed(u('Wb', 'webers', 'magneticFlux', 1, 'both')),
  listed(u('A/m', 'amps per meter', 'magneticFieldStrength', 1, 'both')),
  listed(u('kA/m', 'kiloamps per meter', 'magneticFieldStrength', 1e3, 'both')),
  listed(u('A·m²', 'amp square meters', 'magneticMoment', 1, 'both')),
  listed(u('J/T', 'joules per tesla', 'magneticMoment', 1, 'both')),
  listed(u('V/m', 'volts per meter', 'electricField', 1, 'both')),
  listed(u('N/C', 'newtons per coulomb', 'electricField', 1, 'both')),
  listed(u('V/mm', 'volts per millimeter', 'electricField', 1e3, 'both')),
  listed(u('kV/m', 'kilovolts per meter', 'electricField', 1e3, 'both')),
  listed(u('kV/cm', 'kilovolts per centimeter', 'electricField', 1e5, 'both')),
  listed(u('MV/m', 'megavolts per meter', 'electricField', 1e6, 'both')),
  // Charge per length (λ), for a long line of charge (Gauss's law)
  listed(u('nC/m', 'nanocoulombs per meter', 'lineCharge', 1e-9, 'both')),
  listed(u('μC/m', 'microcoulombs per meter', 'lineCharge', 1e-6, 'both')),
  listed(u('C/m', 'coulombs per meter', 'lineCharge', 1, 'both')),
  // Charge per area (σ), for a charged sheet (Gauss's law)
  listed(u('nC/m²', 'nanocoulombs per square meter', 'surfaceCharge', 1e-9, 'both')),
  listed(u('μC/m²', 'microcoulombs per square meter', 'surfaceCharge', 1e-6, 'both')),
  listed(u('C/m²', 'coulombs per square meter', 'surfaceCharge', 1, 'both')),
  listed(u('μS', 'microsiemens', 'conductance', 1e-6, 'both')),
  listed(u('mS', 'millisiemens', 'conductance', 1e-3, 'both')),
  listed(u('S', 'siemens', 'conductance', 1, 'both')),
  listed(u('μS/cm', 'microsiemens per centimeter', 'conductivity', 1e-4, 'both')),
  listed(u('mS/cm', 'millisiemens per centimeter', 'conductivity', 0.1, 'both')),
  listed(u('S/m', 'siemens per meter', 'conductivity', 1, 'both')),
  listed(u('μΩ·cm', 'microhm-centimeters', 'resistivity', 1e-8, 'both')),
  listed(u('Ω·cm', 'ohm-centimeters', 'resistivity', 1e-2, 'both')),
  listed(u('Ω·m', 'ohm-meters', 'resistivity', 1, 'both')),
  listed(u('nH/m', 'nanohenries per meter', 'inductancePerLength', 1e-9, 'both')),
  listed(u('μH/m', 'microhenries per meter', 'inductancePerLength', 1e-6, 'both')),
  listed(u('H/m', 'henries per meter', 'inductancePerLength', 1, 'both')),
  listed(u('pF/m', 'picofarads per meter', 'capacitancePerLength', 1e-12, 'both')),
  listed(u('nF/m', 'nanofarads per meter', 'capacitancePerLength', 1e-9, 'both')),
  listed(u('F/m', 'farads per meter', 'capacitancePerLength', 1, 'both')),
  // Apparent and reactive power: not watts, so never converted to W
  listed(u('VA', 'volt-amperes', 'apparentPower', 1, 'both')),
  listed(u('kVA', 'kilovolt-amperes', 'apparentPower', 1e3, 'both')),
  listed(u('MVA', 'megavolt-amperes', 'apparentPower', 1e6, 'both')),
  listed(u('var', 'volt-amperes reactive', 'reactivePower', 1, 'both')),
  listed(u('kvar', 'kilovolt-amperes reactive', 'reactivePower', 1e3, 'both')),
  listed(u('Mvar', 'megavolt-amperes reactive', 'reactivePower', 1e6, 'both')),
  // Logarithmic: each its own dimension, never converted with watts or ratios
  listed(u('dB', 'decibels', 'level', 1, 'both')),
  listed(u('dBW', 'decibel-watts', 'powerLevel', 1, 'both')),
  listed({ ...u('dBm', 'decibel-milliwatts', 'powerLevel', 1, 'both'), offset: -30 }),
  listed(u('dBi', 'decibels over isotropic', 'antennaGain', 1, 'both')),
  listed({ ...u('dBd', 'decibels over a dipole', 'antennaGain', 1, 'both'), offset: 2.15 }),
  listed(u('pu', 'per unit', 'perUnit', 1, 'both')),
  // Information (bits): decimal prefixes for networks and disks, binary (KiB) for memory
  listed(u('bit', 'bits', 'information', 1, 'both')),
  listed(u('B', 'bytes', 'information', 8, 'both')),
  listed(u('kB', 'kilobytes', 'information', 8e3, 'both')),
  listed(u('MB', 'megabytes', 'information', 8e6, 'both')),
  listed(u('GB', 'gigabytes', 'information', 8e9, 'both')),
  listed(u('TB', 'terabytes', 'information', 8e12, 'both')),
  listed(u('KiB', 'kibibytes', 'information', 8 * 2 ** 10, 'both')),
  listed(u('MiB', 'mebibytes', 'information', 8 * 2 ** 20, 'both')),
  listed(u('GiB', 'gibibytes', 'information', 8 * 2 ** 30, 'both')),
  listed(u('TiB', 'tebibytes', 'information', 8 * 2 ** 40, 'both')),
  listed(u('b/s', 'bits per second', 'dataRate', 1, 'both')),
  listed(u('kb/s', 'kilobits per second', 'dataRate', 1e3, 'both')),
  listed(u('Mb/s', 'megabits per second', 'dataRate', 1e6, 'both')),
  listed(u('Gb/s', 'gigabits per second', 'dataRate', 1e9, 'both')),
  listed(u('B/s', 'bytes per second', 'dataRate', 8, 'both')),
  listed(u('MB/s', 'megabytes per second', 'dataRate', 8e6, 'both')),

  // Chemistry and biology. Molarity (mol/L)
  listed(u('pM', 'picomolar', 'molarity', 1e-12, 'both')),
  listed(u('nM', 'nanomolar', 'molarity', 1e-9, 'both')),
  listed(u('μM', 'micromolar', 'molarity', 1e-6, 'both')),
  listed(u('mM', 'millimolar', 'molarity', 1e-3, 'both')),
  listed(u('M', 'molar', 'molarity', 1, 'both')),
  listed(u('mol/L', 'moles per liter', 'molarity', 1, 'both')),
  listed(u('mmol/L', 'millimoles per liter', 'molarity', 1e-3, 'both')),
  listed(u('mol/m³', 'moles per cubic meter', 'molarity', 1e-3, 'both')),
  // Mass concentration (g/L): water quality, air quality, doses
  listed(u('μg/m³', 'micrograms per cubic meter', 'massConcentration', 1e-9, 'both')),
  listed(u('mg/m³', 'milligrams per cubic meter', 'massConcentration', 1e-6, 'both')),
  listed(u('ng/mL', 'nanograms per milliliter', 'massConcentration', 1e-6, 'both')),
  listed(u('μg/L', 'micrograms per liter', 'massConcentration', 1e-6, 'both')),
  listed(u('μg/mL', 'micrograms per milliliter', 'massConcentration', 1e-3, 'both')),
  listed(u('mg/L', 'milligrams per liter', 'massConcentration', 1e-3, 'both')),
  listed(u('mg/mL', 'milligrams per milliliter', 'massConcentration', 1, 'both')),
  listed(u('g/L', 'grams per liter', 'massConcentration', 1, 'both')),
  // Parts per million and billion (a fraction by count or volume)
  listed(u('ppm', 'parts per million', 'ratio', 1e-6, 'both')),
  listed(u('ppb', 'parts per billion', 'ratio', 1e-9, 'both')),
  // Molar mass (g/mol)
  listed(u('g/mol', 'grams per mole', 'molarMass', 1, 'both')),
  listed(u('kg/mol', 'kilograms per mole', 'molarMass', 1e3, 'both')),
  listed(u('kg/kmol', 'kilograms per kilomole', 'molarMass', 1, 'both')),
  // Molar energy (J/mol) and molar heat capacity or entropy (J/(mol·K))
  listed(u('J/mol', 'joules per mole', 'molarEnergy', 1, 'both')),
  listed(u('kJ/mol', 'kilojoules per mole', 'molarEnergy', 1e3, 'both')),
  listed(u('kcal/mol', 'kilocalories per mole', 'molarEnergy', 4184, 'both')),
  listed(u('J/(mol·K)', 'joules per mole per kelvin', 'molarHeatCapacity', 1, 'both')),
  listed(u('kJ/(mol·K)', 'kilojoules per mole per kelvin', 'molarHeatCapacity', 1e3, 'both')),
  listed(u('kJ/(kmol·K)', 'kilojoules per kilomole per kelvin', 'molarHeatCapacity', 1, 'both')),
  listed(u('cal/(mol·K)', 'calories per mole per kelvin', 'molarHeatCapacity', 4.184, 'both')),
  listed(
    u(
      'L·atm/(mol·K)',
      'liter-atmospheres per mole per kelvin',
      'molarHeatCapacity',
      101.325,
      'both',
    ),
  ),
  // Rate constants: first order (s⁻¹), second order (M⁻¹s⁻¹); a rate (mol/(L·s))
  listed(u('s⁻¹', 'per second', 'firstOrderRate', 1, 'both')),
  listed(u('min⁻¹', 'per minute', 'firstOrderRate', 1 / 60, 'both')),
  listed(u('h⁻¹', 'per hour', 'firstOrderRate', 1 / 3600, 'both')),
  listed(u('day⁻¹', 'per day', 'firstOrderRate', 1 / DAY, 'both')),
  listed(u('yr⁻¹', 'per year', 'firstOrderRate', 1 / YEAR, 'both')),
  listed(u('M⁻¹s⁻¹', 'per molar per second', 'secondOrderRate', 1, 'both')),
  listed(u('L/(mol·s)', 'liters per mole per second', 'secondOrderRate', 1, 'both')),
  listed(u('L/(mol·min)', 'liters per mole per minute', 'secondOrderRate', 1 / 60, 'both')),
  listed(u('mol/(L·s)', 'moles per liter per second', 'reactionRate', 1, 'both')),
  listed(u('M/s', 'molar per second', 'reactionRate', 1, 'both')),
  listed(u('mol/(L·min)', 'moles per liter per minute', 'reactionRate', 1 / 60, 'both')),
  // Molar absorptivity (L/(mol·cm)) and wavenumber (m⁻¹)
  listed(u('L/(mol·cm)', 'liters per mole per centimeter', 'molarAbsorptivity', 1, 'both')),
  listed(u('M⁻¹cm⁻¹', 'per molar per centimeter', 'molarAbsorptivity', 1, 'both')),
  listed(u('m⁻¹', 'per meter', 'wavenumber', 1, 'both')),
  listed(u('cm⁻¹', 'per centimeter (wavenumbers)', 'wavenumber', 100, 'both')),
  // Radiation: dose equivalent (mSv; "Sv" alone is the ocean's sverdrup) is not absorbed dose
  // (Gy); activity (Bq)
  listed(u('μSv', 'microsieverts', 'doseEquivalent', 1e-6, 'both')),
  listed(u('mSv', 'millisieverts', 'doseEquivalent', 1e-3, 'both')),
  listed(u('mrem', 'millirem', 'doseEquivalent', 1e-5, 'both')),
  listed(u('rem', 'rem', 'doseEquivalent', 1e-2, 'both')),
  listed(u('mGy', 'milligrays', 'absorbedDose', 1e-3, 'both')),
  listed(u('Gy', 'grays', 'absorbedDose', 1, 'both')),
  listed(u('Bq', 'becquerels', 'activity', 1, 'both')),
  listed(u('kBq', 'kilobecquerels', 'activity', 1e3, 'both')),
  listed(u('MBq', 'megabecquerels', 'activity', 1e6, 'both')),
  listed(u('GBq', 'gigabecquerels', 'activity', 1e9, 'both')),
  listed(u('dpm', 'disintegrations per minute', 'activity', 1 / 60, 'both')),
  listed(u('μCi', 'microcuries', 'activity', 3.7e4, 'both')),
  listed(u('mCi', 'millicuries', 'activity', 3.7e7, 'both')),
  listed(u('Ci', 'curies', 'activity', 3.7e10, 'both')),
  listed(u('Bq/g', 'becquerels per gram', 'specificActivity', 1, 'both')),
  listed(u('Bq/kg', 'becquerels per kilogram', 'specificActivity', 1e-3, 'both')),
  listed(u('dpm/g', 'disintegrations per minute per gram', 'specificActivity', 1 / 60, 'both')),
  // Orbits (GM, m³/s²)
  listed(u('m³/s²', 'cubic meters per second squared', 'gravitationalParameter', 1, 'both')),
  listed(u('km³/s²', 'cubic kilometers per second squared', 'gravitationalParameter', 1e9, 'both')),
  // Traffic (vehicles per hour; passenger cars per mile per lane)
  listed(u('veh/h', 'vehicles per hour', 'trafficFlow', 1, 'both')),
  listed(u('veh/min', 'vehicles per minute', 'trafficFlow', 60, 'both')),
  listed(
    u('pc/km/ln', 'passenger cars per kilometer per lane', 'laneDensity', 1, 'metric', 'pc/mi/ln'),
  ),
  listed(usu('pc/mi/ln', 'passenger cars per mile per lane', 'laneDensity', 1000 / MI, 'pc/km/ln')),
  // Angles (rad), HE-E19: listed, so the K–12 pages that write ° or rad keep it as a label; a
  // value that lists two of them gets a menu, and its steps convert ("180° = π rad").
  listed(u('°', 'degrees', 'angle', Math.PI / 180, 'both')),
  listed(u('rad', 'radians', 'angle', 1, 'both')),
  listed(u('grad', 'gradians (gons)', 'angle', Math.PI / 200, 'both')),
  listed(u('′', 'minutes of arc', 'angle', Math.PI / 10800, 'both')),
  listed(u('″', 'seconds of arc', 'angle', Math.PI / 648000, 'both')),
  listed(u('rev', 'revolutions (turns)', 'angle', 2 * Math.PI, 'both')),
  listed(u('mrad', 'milliradians', 'angle', 1e-3, 'both')),
  listed(u('μrad', 'microradians', 'angle', 1e-6, 'both')),
];

/**
 * Temperature differences (K), for a value marked `difference`: the same symbols as the
 * thermometer's, with no offset, so a rise of 10 °C is 10 K and 18 °F. Metric pages show K or
 * °C, US pages °F or R.
 */
export const TEMPERATURE_DIFFERENCES: readonly UnitDef[] = [
  listed(u('K', 'kelvins (a difference)', 'temperatureDifference', 1, 'metric', '°F')),
  listed(u('°C', 'degrees Celsius (a difference)', 'temperatureDifference', 1, 'metric', '°F')),
  listed(usu('°F', 'degrees Fahrenheit (a difference)', 'temperatureDifference', 5 / 9, '°C')),
  listed(usu('R', 'degrees Rankine (a difference)', 'temperatureDifference', 5 / 9, 'K')),
];

const BY_ID = new Map(UNITS.map((x) => [x.id, x]));
const DIFFERENCE_BY_ID = new Map(TEMPERATURE_DIFFERENCES.map((x) => [x.id, x]));

/**
 * The registered unit for a symbol, or undefined for fixed labels ("%", "per 1,000"). With
 * `difference`, a temperature unit is read as a difference (no offset).
 */
export const getUnit = (id: string | undefined, difference?: boolean) =>
  id ? (difference && DIFFERENCE_BY_ID.get(id)) || BY_ID.get(id) : undefined;

/** A value's unit, read as a difference when the value is one (`VariableDef.difference`). */
export const unitOf = (v: { unit?: string; difference?: boolean }) => getUnit(v.unit, v.difference);

/** Every unit of a dimension, in registry order (metric first). */
export const unitsOf = (dimension: Dimension) =>
  (dimension === 'temperatureDifference' ? TEMPERATURE_DIFFERENCES : UNITS).filter(
    (x) => x.dimension === dimension,
  );

/**
 * True when a unit gets a menu only where its value lists `units`: the dimensions K–8 pages
 * never converted, and the college units added to theirs (`listed`).
 */
export const menuOptIn = (unit: UnitDef) => OPT_IN.has(unit.dimension) || !!unit.listed;

/**
 * Dimensions that convert into another's base: years into seconds, for a relation that turns a
 * half-life in Myr into a rate per second.
 */
const LINKED: Partial<Record<Dimension, { to: Dimension; factor: number }>> = {
  longTime: { to: 'time', factor: YEAR },
};

/** The unit's value in its (linked) base: [dimension, base units per unit, offset]. */
const base = (unit: UnitDef): [Dimension, number] => {
  const link = LINKED[unit.dimension];
  return link ? [link.to, unit.factor * link.factor] : [unit.dimension, unit.factor];
};

/**
 * Converts `x` from unit `from` to unit `to` (same dimension, or years and seconds). With
 * `difference`, temperatures convert as differences: 10 °C → 18 °F, not 50 °F.
 */
export function convert(x: number, from: string, to: string, difference?: boolean): number {
  if (from === to) return x;
  const a = getUnit(from, difference);
  const b = getUnit(to, difference);
  if (!a || !b) throw new Error(`Cannot convert ${from} to ${to}`);
  const [da, fa] = base(a);
  const [db, fb] = base(b);
  if (da !== db) throw new Error(`Cannot convert ${from} to ${to}`);
  return (x * fa + (a.offset ?? 0) - (b.offset ?? 0)) / fb;
}

/** The unit a variable shows in a given system (its own unit if the system shares it). */
export function unitInSystem(id: string, system: UnitSystem, difference?: boolean): string {
  const unit = getUnit(id, difference);
  if (!unit) return id;
  if (system === 'us') return unit.us ?? id;
  if (unit.system === 'us') return unit.metric ?? id;
  return id;
}

/**
 * The rule a conversion line states between two units that differ by an offset as well as a
 * factor, where no "1 °C = …" holds: "K = °C + 273.15". Undefined for a factor-only pair, and
 * always for a difference (a rise of 1 °C is a rise of 1 K).
 */
export function offsetRule(
  shown: string | undefined,
  formula: string | undefined,
  difference?: boolean,
): string | undefined {
  const a = getUnit(shown, difference);
  const b = getUnit(formula, difference);
  if (!a || !b || !(a.offset || b.offset)) return undefined;
  const pair = (x: string, y: string) =>
    (shown === x && formula === y) || (shown === y && formula === x);
  if (pair('°C', '°F')) return '°F = °C × 9/5 + 32';
  if (pair('K', '°C')) return 'K = °C + 273.15';
  if (pair('K', '°F')) return 'K = (°F + 459.67) × 5/9';
  if (pair('R', '°F')) return 'R = °F + 459.67';
  if (pair('R', '°C')) return 'R = (°C + 273.15) × 9/5';
  if (pair('dBm', 'dBW')) return 'dBm = dBW + 30';
  if (pair('dBi', 'dBd')) return 'dBi = dBd + 2.15';
  return undefined;
}

/**
 * The rule a conversion line states: an offset pair's ("K = °C + 273.15"), or two angle units'
 * as a class writes it ("180° = π rad", "1° = 60′", HE-E19); undefined for any other pair (the
 * line then states "1 X = f Y").
 */
export function conversionRule(
  shown: string | undefined,
  formula: string | undefined,
  difference?: boolean,
): string | undefined {
  return (
    offsetRule(shown, formula, difference) ??
    (shown && formula ? angleRule(shown, formula) : undefined)
  );
}
