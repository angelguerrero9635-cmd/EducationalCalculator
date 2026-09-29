/**
 * Picture specs for Grades 9–12, group J (see docs/RENDERINGS_HS.md, H51–H57): chemistry's gas
 * piston, solutions in a beaker, reaction energy and the calorimeter, equilibrium, the pH scale
 * and titration, and radioactive decay. Kept apart from `types.ts` so that file's union only
 * lists them. A `NumOrVar` field is a fixed number or a variable id.
 */
import type { NumOrVar } from './typesGraphs';

// ─── H51 gasPiston ───────────────────────────────────────────────────────────

/** A gas's state: pressure, volume and temperature (kelvins), each a number or a variable. */
export interface GasState {
  pressure?: NumOrVar;
  volume?: NumOrVar;
  temperature?: NumOrVar;
}

/**
 * A glass cylinder closed by a metal piston: the gas under it as particles (their count from
 * the moles, their speed trails ∝ √T), a pressure gauge on a pipe, a volume scale up the glass
 * and a thermometer in kelvins.
 *
 * - `law` names what the page holds still: 'boyle' (T and n: P₁V₁ = P₂V₂), 'charles' (P and n:
 *   V₁/T₁ = V₂/T₂), 'gayLussac' (V and n: the piston pinned, P₁/T₁ = P₂/T₂), 'combined' (n:
 *   P₁V₁/T₁ = P₂V₂/T₂) or 'ideal' (one state: PV = nRT).
 * - A two-state law draws `before` beside the gas now; a value the law holds still can be left
 *   out of both (it is drawn the same in both and named "held").
 * - `moles` (ideal) sets the particle count: one particle per 0.1, 0.2, 0.5, 1 … mol, the key
 *   under the picture. Two-state pages draw the same 20 particles in both cylinders.
 * - `R` is the gas constant in the page's units (0.0821 L·atm/(mol·K) by default), checked.
 * - Drag the piston of the gas now to change its volume: the law's other value moves
 *   (pressure; temperature under Charles's law), `keep` pins typed values, `fixed` has no handle.
 */
export interface GasPistonSpec extends GasState {
  kind: 'gasPiston';
  law: 'boyle' | 'charles' | 'gayLussac' | 'combined' | 'ideal';
  before?: GasState;
  moles?: NumOrVar;
  R?: number;
  keep?: string[];
  fixed?: boolean;
}

export type HsjSpec = GasPistonSpec;

/** Every variable id a group J picture refers to (for the module tests). */
export function hsjSpecVars(r: HsjSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'gasPiston':
      return ids(
        r.pressure,
        r.volume,
        r.temperature,
        r.moles,
        r.before?.pressure,
        r.before?.volume,
        r.before?.temperature,
      );
  }
}
