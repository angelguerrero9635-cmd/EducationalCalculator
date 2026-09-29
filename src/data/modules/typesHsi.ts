/**
 * Picture specs for Grades 9–12, group I (see docs/RENDERINGS_HS.md, H43–H50): chemistry
 * measurement, atoms, electrons, bonding, molecular shape and the mole. Kept apart from
 * `types.ts` so that file's union only lists them. A `NumOrVar` field is a fixed number or a
 * variable id. Formulas are written plainly ("H2O", "NH4+"); the pictures print subscripts.
 */
import type { NumOrVar } from './typesGraphs';

/** One conversion factor in a chain: `top` `topUnit` over `bottom` `bottomUnit` (1000 m / 1 km). */
export interface ChainFactor {
  top: NumOrVar;
  topUnit: string;
  bottom: NumOrVar;
  bottomUnit: string;
}

/**
 * Measurement pictures for chemistry (H43), by `mode`:
 *
 * - `chain`: dimensional analysis. The given quantity (`start` `unit`, or a rate `unit`/`per`)
 *   times each conversion factor as a stacked fraction, equals the `result`. Units on a top and
 *   a bottom cancel and are struck through; what is left is the answer's unit.
 * - `ruler`: a wooden ruler marked every `division` `unit`, a metal rod lying along it from `start` to
 *   `end`, and a close-up of the rod's end: the digits the marks give are certain, one more
 *   is estimated between two marks. With `start`, the rod starts past 0 and its `length` is
 *   end − start.
 * - `target`: accuracy and precision. Each trial is a dot on a target whose center is the
 *   `accepted` value; a dot sits right of center when the trial is high, left when low, each
 *   ring `ring` percent (default 1%). `mean` and `error` (percent error) are checked.
 */
export type UnitChainSpec =
  | {
      kind: 'unitChain';
      mode: 'chain';
      start: NumOrVar;
      unit: string;
      /** A rate's bottom unit (65 mi/h: unit 'mi', per 'h'). */
      per?: string;
      /** One to four factors, in the order they are multiplied. */
      factors: ChainFactor[];
      result: string;
    }
  | {
      kind: 'unitChain';
      mode: 'ruler';
      /** Where the rod starts (default 0) and ends, each read to one digit past the marks. */
      start?: NumOrVar;
      end: string;
      /** The rod's length, end − start (checked). */
      length?: string;
      /** The smallest marked division (1, 0.1 …) in `unit`. */
      division: number;
      unit: string;
      /** The ruler's length in `unit` (default: the next whole unit past the end, at least 5). */
      span?: number;
    }
  | {
      kind: 'unitChain';
      mode: 'target';
      /** Two to six trials. */
      trials: NumOrVar[];
      accepted: NumOrVar;
      unit?: string;
      mean?: string;
      error?: string;
      /** Percent of the accepted value between rings (default 1). */
      ring?: number;
    };

/**
 * A Bohr model (H44): `protons` and `neutrons` packed in the nucleus, every one drawn, and the
 * `electrons` (default: as many as protons) on shells filled from the ground-state
 * configuration (iron: 2, 8, 14, 2); the nuclide symbol ³⁵₁₇Cl⁻ beside it. Through xenon
 * (54 protons and electrons). `mass` (p + n), `charge` (p − e) and `valence` (the outer shell's
 * electrons, lit) are checked.
 */
export interface AtomModelSpec {
  kind: 'atomModel';
  protons: NumOrVar;
  neutrons?: NumOrVar;
  electrons?: NumOrVar;
  mass?: string;
  charge?: string;
  valence?: string;
}

export type HsiSpec = UnitChainSpec | AtomModelSpec;

/** Every variable id a group I spec refers to (for the module tests). */
export function hsiSpecVars(r: HsiSpec): string[] {
  const ids = (...xs: (NumOrVar | undefined)[]) =>
    xs.filter((x): x is string => typeof x === 'string');
  switch (r.kind) {
    case 'unitChain':
      if (r.mode === 'chain')
        return ids(r.start, r.result, ...r.factors.flatMap((f) => [f.top, f.bottom]));
      if (r.mode === 'ruler') return ids(r.start, r.end, r.length);
      return ids(...r.trials, r.accepted, r.mean, r.error);
    case 'atomModel':
      return ids(r.protons, r.neutrons, r.electrons, r.mass, r.charge, r.valence);
  }
}
