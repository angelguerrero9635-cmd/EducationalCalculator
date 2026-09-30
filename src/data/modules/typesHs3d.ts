/**
 * Round 3 group H3D (biology, H109) types, kept apart from `types.ts` and `layouts/types.ts` so
 * those unions only list them.
 */
import type { DivisionStage } from './typesHsg';

/**
 * A `pieChart` part's stage (`stages`, one per part): the `cellDivision` card of that stage,
 * small, beside the part's name (the mitotic index: interphase and the four phases of mitosis).
 */
export type PieStage = DivisionStage;

/** One lane of a `gel` explore figure: its name over the well and its bands in base pairs. */
export interface GelFigureLane {
  label: string;
  bands: number[];
}

/** The most lanes a `gel` figure lists, and the most one scene shows (beside the ladder). */
export const GEL_FIGURE_LANES = 8;
export const GEL_SCENE_LANES = 6;

/**
 * A `gel` scene (DNA fingerprinting): `lanes` picks the lanes shown (default all, at most 6);
 * `lit` rings lanes; `compare` draws dashed lines across the gel at that lane's bands, and the
 * bands of other shown lanes at the same size are lit, the caption counting the matches per lit
 * lane. `parents: [mother, father]` with `compare` naming the child colors each child band by
 * the parent it matches (maternal red, paternal blue), and rings a band found in neither.
 */
export interface GelScene {
  lanes?: string[];
  lit?: string[];
  compare?: string;
  parents?: [string, string];
}

/** Two bands are one size when they differ by under 1%. */
export const sameBand = (a: number, b: number) => Math.abs(a - b) <= 0.01 * Math.max(a, b);

/** Round 3 group H3D's explore figures. */
export type Hs3dFigure = {
  /** Gel electrophoresis of fixed samples: fingerprints of suspects, or a family (H109). */
  kind: 'gel';
  lanes: GelFigureLane[];
  /** The ladder's sizes (default the calculator gel's); false for none. */
  ladder?: number[] | false;
};

/** The scene field each H3D explore figure reads (layouts.test). */
export const HS3D_SCENE_FIELD = { gel: 'gel' } as const satisfies Record<
  Hs3dFigure['kind'],
  string
>;
