/**
 * SI factors for the units the group I college pictures meet (HC81–HC84): the registry's units
 * (mm, cm, N, m/s, …) and the shop units it does not list (rpm, m/min, mm/rev, mm/min, μm).
 * Shared by the pictures and their harness checks.
 */
import { getUnit } from '@/engine/units';

const SHOP: Record<string, number> = {
  μm: 1e-6,
  µm: 1e-6,
  rpm: 1 / 60,
  'rev/min': 1 / 60,
  'rad/s': 1,
  'm/min': 1 / 60,
  'ft/min': 0.3048 / 60,
  'mm/min': 0.001 / 60,
  'in/min': 0.0254 / 60,
  'mm/rev': 0.001,
  'in/rev': 0.0254,
  'mm/tooth': 0.001,
  'in/tooth': 0.0254,
  'cm³/min': 1e-6 / 60,
  'mm³/min': 1e-9 / 60,
  'mm³/s': 1e-9,
  'N·cm': 0.01,
  'N·m': 1,
  'N·mm': 0.001,
  min: 60,
  s: 1,
  h: 3600,
  '°': 1,
};

/** How many SI units one of `unit` is (1 for a unit nobody knows, and for degrees). */
export function siFactor(unit: string | undefined): number {
  if (!unit) return 1;
  if (unit in SHOP) return SHOP[unit]!;
  const u = getUnit(unit);
  return u && !u.offset ? u.factor : 1;
}
