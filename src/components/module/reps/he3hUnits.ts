/**
 * Units of the round 3 group H college pictures (HC40 `heatExchanger`, HC41 `elementChain`, HC52
 * `fatigueDiagram`, HC59 `shaft`). A spec field that is a variable is read in its own unit and
 * turned into the drawing's base unit for its kind of quantity; a fixed number is taken in the
 * base unit already. Shared by the pictures and their harness checks.
 */
import { formatNumber } from '@/engine/format';

/** The base unit each kind of quantity is drawn and checked in. */
export type He3hDim =
  | 'stress' // MPa
  | 'length' // mm
  | 'torque' // N·m
  | 'force' // N
  | 'power' // W
  | 'stiffness' // N/mm
  | 'modulus' // GPa
  | 'capacity' // W/K
  | 'area' // m²
  | 'angle' // rad
  | 'none';

const SCALE: Record<Exclude<He3hDim, 'none'>, Record<string, number>> = {
  stress: { Pa: 1e-6, kPa: 1e-3, MPa: 1, 'N/mm²': 1, GPa: 1e3, psi: 0.00689476, ksi: 6.89476 },
  length: { mm: 1, cm: 10, m: 1000, in: 25.4 },
  torque: { 'N·mm': 1e-3, 'N·m': 1, 'kN·m': 1e3, 'lb·in': 0.112985, 'lb·ft': 1.35582 },
  force: { N: 1, kN: 1e3, MN: 1e6, lbf: 4.44822, kip: 4448.22 },
  power: { W: 1, kW: 1e3, MW: 1e6, hp: 745.7 },
  stiffness: { 'N/mm': 1, 'kN/mm': 1e3, 'N/m': 1e-3, 'kN/m': 1, 'MN/m': 1e3, 'lb/in': 0.175127 },
  capacity: { 'W/K': 1, 'kW/K': 1e3 },
  angle: { rad: 1, '°': Math.PI / 180 },
  area: { 'm²': 1, 'cm²': 1e-4, 'mm²': 1e-6, 'ft²': 0.09290304 },
  modulus: { GPa: 1, MPa: 1e-3, Pa: 1e-9, ksi: 0.00689476, psi: 6.89476e-6 },
};

/** How many base units one of `unit` is (1 when the unit is not one of the dimension's). */
export const unitScale = (unit: string | undefined, dim: He3hDim) =>
  dim === 'none' || !unit ? 1 : (SCALE[dim][unit] ?? 1);

/** A number for a picture label: `n` significant figures, × 10ⁿ past a million or under 0.001. */
export const sigText = (x: number, n = 3) =>
  Number.isFinite(x)
    ? formatNumber(Number(x.toPrecision(n)), {
        scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
      })
    : '?';
