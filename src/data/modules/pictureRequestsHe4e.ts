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
  {
    ...ask(
      'HC151',
      'alleleFrequencies',
      'One generation of selection: a second tray of beads for p′ beside p’s, both on one p scale with Δp arrowed from p to p′',
      [`${B}evolution#0`],
      [
        'From B-P17. New option on alleleFrequencies (typesHe4e.ts AlleleFrequenciesHe4e, reps/AlleleFrequenciesAfterHe4e.tsx); without `after` the Hardy–Weinberg picture is unchanged.',
        "Fields: { kind: 'alleleFrequencies', p, q?, after (p′, a variable id), change? (Δp), fitness? ([w_AA, w_Aa, w_aa], written in the caption), mean? (w̄), alleles?, keep?, fixed? }.",
        'Two trays of 100 glass beads (Before: p, After: p′, counted from each) with a chevron between them; the p scale under both with p (ink) and p′ (amber) marked and Δp arrowed from p to p′ and written over it; the p handle stays on the scale. A "?" p′ leaves the second tray empty and draws no arrow. The genotype bars move to the caption’s fitness line.',
        "Example: { kind: 'alleleFrequencies', p: 'p', q: 'q', after: 'p2', change: 'dp', fitness: ['wAA', 'wAa', 'waa'], mean: 'wbar', keep: ['wAA', 'wAa', 'waa'] }.",
        'Harness (harness/picturesHe4e.ts): p′ in [0, 1]; Δp = p′ − p, so the arrow points the way its sign says; w̄ = p²w_AA + 2pqw_Aa + q²w_aa.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-alleleFrequencies-after', 'g.he-alleleFrequencies-after-against'],
  },
  {
    ...ask(
      'HC153',
      'driftPaths',
      'Genetic drift: twelve populations’ allele frequency p over the generations at Nₑ, and the expected heterozygosity H₀(1 − 1 ÷ 2Nₑ)ᵗ dashed on a second axis',
      [`${B}evolution#1`],
      [
        'From B-P19. New kind (typesHe4e.ts DriftPathsSpec, reps/DriftPaths.tsx, the Wright–Fisher draws in reps/he4eMath.ts).',
        "Fields: { kind: 'driftPaths', ne (Nₑ, 2 to 10⁶), generations (up to 1000), p0? (default the p with 2p(1 − p) = H₀, else 0.5), h0?, t? (the generation marked, default the last), ht? (H_t), kept? (H_t ÷ H₀, a share or a percent), populations? (default 12), seed? }.",
        'Each population draws its 2Nₑ gene copies from the last generation’s p (one at a time up to 400 copies, past that by the normal approximation), from fixed seeds, so the same Nₑ always draws the same paths; fixed and lost paths stay at 1 and 0 and are counted in the caption. p on the left axis, H on the right (0 to 0.5), the dashed H with its value ringed at t. A "?" Nₑ or t draws no paths and no curve. No handles.',
        "Example: { kind: 'driftPaths', ne: 'ne', generations: 't', h0: 'h0', ht: 'ht', kept: 'kept' }.",
        'Harness (harness/picturesHe4e.ts): each path starts at p₀ and stays in [0, 1] in steps of 1 ÷ 2Nₑ; H at t is H₀(1 − 1 ÷ 2Nₑ)ᵗ (an independent product) and equals H_t; the share kept is H_t ÷ H₀.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-driftPaths-decay', 'g.he-driftPaths-small'],
  },
];
