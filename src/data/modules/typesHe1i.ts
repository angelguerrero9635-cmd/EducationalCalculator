/**
 * Picture specs for college pictures, round 1, group I (docs/RENDERINGS_HE.md, HC8): the new
 * `phaseEnvelope` kind and the one-component `substance` option on `chemDiagram` mode `phase`.
 * Kept apart from `types.ts` so its union only names them. A `NumOrVar` field is a fixed number
 * or a variable id, in the page's own units (the spec names them).
 */
import type { NumOrVar } from './typesGraphs';

const ids = (...xs: (NumOrVar | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** log₁₀ P^sat = A − B ÷ (T + C), mmHg and °C: data of a compound, not a page value. */
export type AntoineConstants = [number, number, number];

/**
 * A binary's phase diagram (HC8; ACC-P30, C-P8), flat like a graph. The more volatile
 * component is 1 (`names[0]`); x is the liquid's mole fraction of it, y the vapor's.
 *
 * - `Pxy`: pressure against x₁ and y₁ at one temperature: the bubble curve (liquid line) over
 *   the dew curve (vapor curve), from P₂sat at x₁ = 0 to P₁sat at x₁ = 1, the region between
 *   them two-phase. The tie line joins the liquid and vapor in equilibrium: at `x` (`tie:
 *   'bubble'`, the default when `x` is passed), at `y` (`'dew'`) or at the pressure `P`
 *   (`'flash'`, with the feed `z` on it and V ÷ F = (z − x) ÷ (y − x) by the lever rule).
 *   `margules` (A) bends the curves by ln γ₁ = A x₂², ln γ₂ = A x₁² and keeps Raoult's line
 *   dashed. `T` labels the temperature (°C).
 * - `Txy`: temperature against x₁ and y₁ at the pressure `P` (mmHg), each pure liquid's vapor
 *   pressure from its Antoine constants: the dew curve over the bubble curve, a tie line at `x`
 *   (or at `y`, `tie: 'dew'`).
 * - `xy`: the vapor's y against the liquid's x: the equilibrium curve (constant `alpha`, or the
 *   straight line y = `m`x of a dilute absorber), the 45° line, x_B, x_F and x_D marked, the
 *   rectifying line (`R`, `xD`), the q-line (`q`, `xF`) and the stripping line. `steps: 'total'`
 *   draws the stairs at total reflux (both lines on the 45° line; `minStages` is Fenske's N,
 *   checked: the stairs drawn are N rounded up); `'stages'` the
 *   McCabe–Thiele stairs (`stages` and `feedStage` checked as the stairs drawn). `Rmin` dashes
 *   the line pinched at the feed. `absorber` draws a dilute absorber instead: the operating
 *   line from (x_in, y_out) with slope L ÷ G, its stairs up from the top, and `LGmin` dashed,
 *   pinched where the gas enters; `N` (Kremser) is checked against the stairs.
 */
export type PhaseEnvelopeSpec =
  | {
      kind: 'phaseEnvelope';
      mode: 'Pxy';
      /** The two components, the more volatile first (default A and B). */
      names?: [string, string];
      /** The pressure unit the page uses (default mmHg). */
      unit?: string;
      /** The temperature, for the caption (°C). */
      T?: NumOrVar;
      p1: NumOrVar;
      p2: NumOrVar;
      tie?: 'bubble' | 'dew' | 'flash';
      x?: NumOrVar;
      y?: NumOrVar;
      P?: NumOrVar;
      z?: NumOrVar;
      vf?: NumOrVar;
      /** Equilibrium ratios K₁ and K₂ of a flash, checked as P^sat ÷ P. */
      K?: [NumOrVar, NumOrVar];
      margules?: NumOrVar;
      gammas?: [NumOrVar, NumOrVar];
    }
  | {
      kind: 'phaseEnvelope';
      mode: 'Txy';
      names?: [string, string];
      antoine: [AntoineConstants, AntoineConstants];
      /** The pressure (mmHg). */
      P: NumOrVar;
      tie?: 'bubble' | 'dew';
      x?: NumOrVar;
      y?: NumOrVar;
      T?: NumOrVar;
    }
  | {
      kind: 'phaseEnvelope';
      mode: 'xy';
      names?: [string, string];
      alpha?: NumOrVar;
      m?: NumOrVar;
      xD?: NumOrVar;
      xB?: NumOrVar;
      xF?: NumOrVar;
      /** Feed condition: 1 a saturated liquid (default), 0 a saturated vapor. */
      q?: NumOrVar;
      R?: NumOrVar;
      Rmin?: NumOrVar;
      slope?: NumOrVar;
      intercept?: NumOrVar;
      steps?: 'total' | 'stages';
      stages?: NumOrVar;
      feedStage?: NumOrVar;
      minStages?: NumOrVar;
      absorber?: {
        yIn: NumOrVar;
        yOut: NumOrVar;
        xIn: NumOrVar;
        /** L ÷ G, or the absorption factor A = L ÷ (mG) instead. */
        LG?: NumOrVar;
        A?: NumOrVar;
        LGmin?: NumOrVar;
        /** Kremser's number of stages. */
        N?: NumOrVar;
      };
    };

export function phaseEnvelopeVars(r: PhaseEnvelopeSpec): string[] {
  switch (r.mode) {
    case 'Pxy':
      return ids(r.T, r.p1, r.p2, r.x, r.y, r.P, r.z, r.vf, r.margules, ...(r.K ?? [])).concat(
        ids(...(r.gammas ?? [])),
      );
    case 'Txy':
      return ids(r.P, r.x, r.y, r.T);
    case 'xy': {
      const a = r.absorber;
      return ids(
        r.alpha,
        r.m,
        r.xD,
        r.xB,
        r.xF,
        r.q,
        r.R,
        r.Rmin,
        r.slope,
        r.intercept,
        r.stages,
        r.feedStage,
        r.minStages,
      ).concat(a ? ids(a.yIn, a.yOut, a.xIn, a.LG, a.A, a.LGmin, a.N) : []);
    }
  }
}

/** Where the phase rule's point sits: a region, a line, the triple or the critical point. */
export type PhaseRuleAt =
  'triple' | 'critical' | 'vapor' | 'melting' | 'sublimation' | 'solid' | 'liquid' | 'gas';

/**
 * College option on `chemDiagram` mode `phase` (HC8; C-P8): any one-component substance,
 * pressure on a log scale against temperature (K), drawn from its values. The vapor curve runs
 * from the `triple` point to the `critical` point (each [T, P]) through every `points` pair and
 * the `normalBoiling` point (K, at `atm`, the page's 1 atm, default 1), straight in (1 ÷ T,
 * ln P) between neighbours: Clausius–Clapeyron with ΔH_vap constant on each piece, so it passes
 * each point exactly. The melting line leaves the triple point with slope `meltSlope` (pressure
 * unit per K; sketched steep and upright when absent), the solid–gas line goes through
 * `sublimation` ([T, P]; sketched with ΔH_sub = 1.15 ΔH_vap when absent, the caption says so).
 * `zoom: 'melting'` draws a window round the triple point to linear scales, so the melting
 * slope reads (a run of 1 K and its rise). `rule` marks a point and F = C − P + 2: by `at`, or
 * by its phases (3 the triple point, 2 the vapor curve, 1 the liquid), with arrows for each
 * degree of freedom; C other than 1 or F < 0 draws faded with the reason.
 */
export interface PhaseSubstance {
  name?: string;
  /** The pressure unit (default atm). */
  unit?: string;
  triple: [NumOrVar, NumOrVar];
  critical: [NumOrVar, NumOrVar];
  normalBoiling?: NumOrVar;
  atm?: number;
  meltSlope?: NumOrVar;
  sublimation?: [NumOrVar, NumOrVar];
  points?: [NumOrVar, NumOrVar][];
  zoom?: 'melting';
  rule?: {
    components?: NumOrVar;
    phases?: NumOrVar;
    freedom?: NumOrVar;
    at?: PhaseRuleAt;
  };
}

export function phaseSubstanceVars(s: PhaseSubstance | undefined): string[] {
  if (!s) return [];
  return ids(
    ...s.triple,
    ...s.critical,
    s.normalBoiling,
    s.meltSlope,
    ...(s.sublimation ?? []),
    ...(s.points ?? []).flat(),
    s.rule?.components,
    s.rule?.phases,
    s.rule?.freedom,
  );
}
