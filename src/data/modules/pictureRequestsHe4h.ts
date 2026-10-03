/**
 * College pictures, round 4, group H (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/**
 * `pages` is the page list, or, for a request whose parts go on different pages (and kinds), each
 * page with the text that shows its part is there (`uses`).
 */
const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[] | Record<string, string>,
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  ...(Array.isArray(pages) ? { pages } : { pages: Object.keys(pages), uses: pages }),
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const E = 'he.earth-science.';
const GEO = 'he.geography.';

export const HE4H_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC129',
      'catchment',
      'A small drainage basin from above, to scale by its km bar, its streams running to the outlet; rain at i from a cloud band, 40 drops of which round(40C) run to the streams and the rest soak in; the outlet arrow carries Qₚ',
      [`${E}hydrology#1`],
      [
        'From EG-P18. New kind (typesHe4h.ts CatchmentSpec, reps/Catchment.tsx, geometry in reps/he4hMath.ts).',
        "Fields: { kind: 'catchment', coefficient (C, 0 to 1), intensity (i, mm/h), area (A, km²), peak? (Qₚ, m³/s) }.",
        'The outline holds A at the bar’s scale (the bar is a round length near 90 px: 50 m, 500 m, 1 km …). Runoff drops are filled with an arrow to the nearest stream; soaked drops are hollow with a chevron into the ground; a key counts both. More rain streaks for harder rain (3√i, 3 to 40). A "?" draws nothing for its value: no rain or i label, no drops, no scale bar, no Qₚ. No handles; the interim percentBar can go.',
        "Example: { kind: 'catchment', coefficient: 'C', intensity: 'i', area: 'A', peak: 'Q' }.",
        'Harness (harness/picturesHe4h.ts): Qₚ = CiA ÷ 3.6 (as m/s × m²); C in [0, 1]; the drawn share round(40C) ÷ 40 is C within half a drop; the 40 drops lie in the basin; the outline at the bar’s scale holds A.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-catchment-rational', 'g.he-catchment-paved', 'g.he-catchment-woods'],
  },
  {
    ...ask(
      'HC133',
      'contourMap',
      'A made-up hill of contours at CI (every fifth bold with its elevation), the line A–B straight up it across exactly n intervals, a 1:S scale bar in a legend box, and under the map the profile lined up with A–B: each crossing dotted, rise and run bracketed, the slope as a percent and an angle',
      [`${GEO}physical-geography#2`],
      [
        'From EG-P24. New kind (typesHe4h.ts ContourMapSpec, reps/ContourMap.tsx, geometry in reps/he4hMath.ts).',
        "Fields: { kind: 'contourMap', interval (CI, m), crossed (n, whole), mapDistance (cm), scale (the denominator), base? (A's elevation, m; default 10 × CI), rise?, ground?, gradient? (%), angle? (°) }.",
        'A sits on the contour at base, B on the one n intervals higher; contours shrink evenly toward the summit, so the profile is the straight even slope the page assumes. The scale bar is set by AB (its px per map cm) and the scale, a round length; the profile names its vertical stretch ("height × 22"). Drop lines join each crossing to its profile point (every fifth past 15). n = 0 puts A and B on the flat below the hill. A "?" draws nothing for its value: no elevations without CI, no line A–B or profile without n, no scale bar, run or slope without the map distance or scale. No handles; the interim triangleSolver can go.',
        "Example: { kind: 'contourMap', interval: 'CI', crossed: 'n', mapDistance: 'map', scale: 'denom', rise: 'rise', ground: 'ground', gradient: 'gradient', angle: 'angle' }.",
        'Harness (harness/picturesHe4h.ts): rise = n × CI; ground = map × S ÷ 100; gradient = 100 × rise ÷ ground; angle = tan⁻¹(rise ÷ ground); the line A–B meets exactly n contours after A, one interval apart, A and B on their contours; the contours shrink toward the summit.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-contourMap-profile', 'g.he-contourMap-steep'],
  },
];
