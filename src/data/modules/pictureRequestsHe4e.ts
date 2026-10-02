/**
 * College pictures, round 4, group E (docs/RENDERINGS_HE.md). Spread into
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

const C = 'he.chemistry.';
const B = 'he.biology.';

export const HE4E_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC114',
      'normalCurve',
      'The t curve for n − 1 degrees of freedom over the dashed normal, ±t⋆ marked with the middle 95% shaded, the interval x̄ ± t⋆s ÷ √n bracketed on a value axis lined up with the t axis, and an observed t placed',
      [`${C}analytical#0`, `${C}analytical#0~t-test`],
      [
        'From C-P19. New option on normalCurve (typesHe4e.ts NormalCurveHe4e, reps/NormalCurveTHe4e.tsx, sums in reps/he4eMath.ts); the older t option (`t: { df }`) is unchanged.',
        "Fields: { kind: 'normalCurve', family: 't', df? (default bracket.n − 1), tStar? (the page's t⋆; left out, worked out from df and the level), level? (default 0.95), observed? (the page's t), bracket?: { mean, s, n, mu? (a t-test's known value), half?, lower?, upper?, axis? } }.",
        'The value axis is lined up with the t axis (x sits at t = (x − center) ÷ (s ÷ √n)), centered at x̄ for an interval or at μ for a test (x̄ then sits at the observed t, and the bracket shows whether μ is inside). A "?" draws nothing for that value (no t curve while n is "?", no bracket while x̄, s or t⋆ is). No handles.',
        "Example (main): { kind: 'normalCurve', family: 't', df: 'df', tStar: 't', bracket: { mean: 'xbar', s: 's', n: 'n', half: 'half', lower: 'lower', upper: 'upper', axis: 'Concentration (mg/L)' } }. Example (~t-test): { kind: 'normalCurve', family: 't', df: 'df', tStar: 'tc', observed: 't', bracket: { mean: 'xbar', s: 's', n: 'n', mu: 'mu' } }. A page without a df value can leave `df` out (n − 1 is used).",
        'Harness (harness/picturesHe4e.ts): ±t⋆ holds the level within 0.001 when t⋆ is worked out (a typed t⋆ is the page’s to pick; the caption writes the area it holds); half = t⋆s ÷ √n, lower and upper = x̄ ∓ half; observed t = |x̄ − μ|√n ÷ s. The demos work t⋆ out with invT(0.975, df), a phrase the harness reads.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-normalCurve-t-interval',
      'g.he-normalCurve-t-test',
      'g.he-normalCurve-t-two-readings',
    ],
  },
  {
    ...ask(
      'HC152',
      'normalCurve',
      'Response to selection: the parents’ curve with the selected tail shaded and S arrowed from the mean, and under it the offspring’s curve moved by R = h²S',
      [`${B}evolution#0~breeders`],
      [
        'From B-P18. New option on normalCurve (typesHe4e.ts ShiftHe4e, reps/NormalCurveShiftHe4e.tsx, the cut-off in reps/he4eMath.ts).',
        "Fields: { kind: 'normalCurve', mean (the parents' mean), sd (a fixed spread is fine), axis?, shift: { selected (S; negative selects the low tail), response (R), h2?, after? (the offspring's mean) } }.",
        'Two panels on one value axis: Parents (the tail whose mean is μ + S shaded, its cut-off value and share written, S arrowed from μ) and Offspring (the parents’ curve dashed behind, the curve moved by R, R arrowed from μ); μ dashed through both. A "?" S shades nothing; a "?" R draws no offspring curve. No handles (`fixed`).',
        "Example: { kind: 'normalCurve', mean: 'm0', sd: 5, axis: 'Plant height (cm)', shift: { selected: 'S', response: 'R', h2: 'h2', after: 'm1' }, fixed: true }.",
        'Harness (harness/picturesHe4e.ts): the shaded tail’s mean (an independent sum) is μ + S; R = h²S, h² in 0 to 1; the offspring’s mean is μ + R.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-normalCurve-shift', 'g.he-normalCurve-shift-down'],
  },
];
