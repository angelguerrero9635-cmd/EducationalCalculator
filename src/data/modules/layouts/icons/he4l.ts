/**
 * College card icons, round 4, group L: the names; drawn in
 * components/module/layouts/icons/he4l.tsx.
 */
/** HC169: the line types of an engineering drawing (cad-graphics#0~line-types). */
export const HE4L_LINE_ICONS = [
  'visible line',
  'hidden line',
  'center line',
  'dimension line',
  'extension line',
  'circle center lines',
] as const;

/** HC170: the GD&T characteristic symbols (cad-graphics#1), drawn to the standard's shapes. */
export const HE4L_GDT_ICONS = [
  'GD&T straightness',
  'GD&T flatness',
  'GD&T circularity',
  'GD&T cylindricity',
  'GD&T perpendicularity',
  'GD&T parallelism',
  'GD&T angularity',
  'GD&T position',
  'GD&T profile of a line',
  'GD&T profile of a surface',
  'GD&T circular runout',
  'GD&T total runout',
  'GD&T concentricity',
  'GD&T symmetry',
] as const;

export const HE4L_ICONS = [...HE4L_LINE_ICONS, ...HE4L_GDT_ICONS] as const;
