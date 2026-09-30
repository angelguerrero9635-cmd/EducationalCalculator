/**
 * Picture specs for Grades 9–12, group L (earth and space H71–H80; see docs/RENDERINGS_HS.md),
 * kept apart from `types.ts` so that file's union only lists them, and the scenes of the group's
 * explore figures. A `NumOrVar` field is a fixed number or a variable id.
 */
// ── Explore figures ──

/** A `mohsScale` scene: the ten minerals, the test tools, a mineral or a range lit. */
export interface MohsScene {
  /** A hardness 1–10 whose mineral is lit. */
  lit?: number;
  /** An unknown mineral's hardness range, shaded between two hardnesses (tools sit at 2.5 …). */
  between?: [number, number];
  /** Bars to absolute hardness (talc 1 … diamond 1500) instead of the rank. */
  absolute?: boolean;
}

/** The explore figures of group L (listed in `layouts/types.ts`). */
export type HslFigure = { kind: 'mohsScale' };

/** The scene field each group L figure reads (for the layout tests). */
export const HSL_SCENE_FIELD = {
  mohsScale: 'mohs',
} as const satisfies Record<HslFigure['kind'], string>;
