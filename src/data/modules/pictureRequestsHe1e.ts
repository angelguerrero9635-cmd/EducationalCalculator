/**
 * College pictures, round 1, group E (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages, as `pictureRequestsHs.ts` writes them. */
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

export const HE1E_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC10',
      'functionGraph',
      'functionGraph families: expr, hill, bateman, a repeated dose, a real power, erfc',
      [
        'he.math.calc-1#4',
        'he.math.calc-2#0',
        'he.math.calc-2#0~parts-trig',
        'he.math.calc-2#4~integrate-series',
        'he.math.diff-eq#0~linear',
        'he.math.diff-eq#2',
        'he.math.diff-eq#2~inverse',
        'he.math.diff-eq#4~airy',
        'he.biology.cell-molecular#1~hill',
        'he.engineering.bioinstrumentation#0~saturation',
        'he.engineering.biotransport#3~multiple-dosing',
        'he.engineering.biotransport#3~oral',
        'he.biology.ecology#3~species-area',
        'he.engineering.materials-science#1',
      ],
      [
        'From M-P3, B-P10, B-P30, B-P36, ME-P9 (erfc). Fields (typesHe1e.ts):',
        "family 'expr' { expr, of? } — + − × ÷ ^ (or * / -), brackets, exp, ln, sin, cos, tan, sqrt, abs, u(…) (unit step), π; every other name a value id, `of` the input (default x); parsed, no eval. Example (diff-eq#2): { family: 'expr', expr: 'y0 * exp(-k * t) + A / k * (1 - exp(-k * (t - tau))) * u(t - tau)', of: 't', input: 't', at: { x: 't', y: 'y' } }.",
        "family 'hill' { K, n?, top? } — θ = top·Lⁿ ÷ (Kⁿ + Lⁿ), K ringed at half; n: 1 is the saturation curve. Example: { family: 'hill', K: 'K', n: 'nH', input: 'L', at: { x: 'L', y: 'theta' } }; saturation: { family: 'hill', K: 'Km', n: 1, top: 'imax' }.",
        "family 'bateman' { F?, D, V, ka, k } with feature: { x: tmaxId, y: CmaxId } (checked) — the oral curve, t_max and C_max marked.",
        "repeat: { every, count, avg? } on any one-dose family (an exponential or expr) — the doses summed into a sawtooth, C_ss,avg dashed (avg = the page's value, checked). Example (~multiple-dosing): { family: 'expr', expr: 'D / V * exp(-k * t)', of: 't', repeat: { every: 'tau', count: 6, avg: 'Css' } }.",
        "family 'power' { a?, exponent, h?, k? } — a real exponent from a value (z = 0.25), beside the p/q form. Example (~species-area): { family: 'power', a: 'c', exponent: 'z', input: 'A', at: { x: 'A', y: 'S' } }.",
        "family 'erfc' { Cs, C0, width } (or D and t when they share x's units; width = 2√(Dt) in x's unit, which the page works out) — the profile, C₀ dashed, the depth by `at`. Example (materials-science#1): { family: 'erfc', Cs: 'Cs', C0: 'C0', width: 'L', input: 'x', at: { x: 'x', y: 'Cx' } }.",
        'Pages pin their units (unitSystems), as `unitsOf` is not read for these families.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-expr',
      'g.he-functionGraph-expr-parts',
      'g.he-functionGraph-hill',
      'g.he-functionGraph-hill-n1',
      'g.he-functionGraph-bateman',
      'g.he-functionGraph-repeat',
      'g.he-functionGraph-power-real',
      'g.he-functionGraph-power-negative',
      'g.he-functionGraph-erfc',
    ],
  },
];
