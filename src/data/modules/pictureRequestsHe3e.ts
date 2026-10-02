/**
 * College pictures, round 3, group E (docs/RENDERINGS_HE.md). Spread into
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

export const HE3E_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC55',
      'instrumentTrace',
      'Instrument traces computed from peak lists: a ¹H NMR spectrum with n + 1 multiplets and integrals, a chromatogram with R, a rotational spectrum 2B apart; and the `ir` card',
      {
        [`${C}organic-1#4`]: 'mode nmr: the multiplets, the integral trace with H per signal',
        [`${C}organic-1#4~ir-bands`]: 'card figure ir on each sort card',
        [`${C}analytical#3`]: 'mode chromatogram: peaks, tangents, Δt, w, R',
        [`${C}physical-2#4`]: 'mode rotational: lines at 2B(J + 1), the lit J line',
      },
      [
        'From C-P5 (typesHe3e.ts, reps/InstrumentTrace.tsx, the sums in reps/instrumentTraceMath.ts; the card in layouts/irCard.tsx). Every trace is computed from its values, never traced from a real spectrum.',
        "Fields: { kind: 'instrumentTrace', mode: 'nmr', signals: [{ shift (δ, ppm), neighbors (n), integral?, count? (H, checked = H × I ÷ ΣI), atoms? (numbers in smiles) }], hydrogens? (H), smiles? (the structure drawn above, lettered a, b, c), name?, coupling? (J, Hz), field? (ν₀, MHz) } | { mode: 'chromatogram', dead (t_M), peaks: [{ time, width, name? }], resolution? (R), factors? ([k₁, k₂]), selectivity? (α), plates? (N of peak 2) } | { mode: 'rotational', constant (B, cm⁻¹), temperature? (K, default 298.15), lower? (J lit), line? (ν̃), spacing? (2B), name? }. Card: { kind: 'ir', bands: [{ at, to? (a very broad range), strength?: 'strong' | 'medium' | 'weak', shape?: 'sharp' | 'broad' }] }.",
        "Example (organic-1#4): { kind: 'instrumentTrace', mode: 'nmr', smiles: 'CC(=O)OCC', hydrogens: 'H', signals: [{ shift: 2.03, neighbors: 0, integral: 'I1', count: 'h1', atoms: [0] }, { shift: 4.12, neighbors: 3, integral: 'I2', count: 'h2', atoms: [4] }, { shift: 1.26, neighbors: 2, integral: 'I3', count: 'h3', atoms: [5] }] }. Example (analytical#3): { kind: 'instrumentTrace', mode: 'chromatogram', dead: 'tM', peaks: [{ time: 't1', width: 'w1' }, { time: 't2', width: 'w2' }], resolution: 'R', factors: ['k1', 'k2'], selectivity: 'alpha', plates: 'N' }. Example (physical-2#4): { kind: 'instrumentTrace', mode: 'rotational', constant: 'B', lower: 'J', line: 'nu' }. Card: { kind: 'ir', bands: [{ at: 2960, strength: 'medium' }, { at: 1715 }] }.",
        'The δ axis runs from 0 to a whole ppm past the highest signal (5 to 12); multiplet lines closer than 5 px are drawn 5 px apart (the caption says so). Peaks far past t_M break the time axis. A "?" draws nothing for its value.',
        'Checks (harness/picturesHe3e.ts): n + 1 lines centered on δ adding to the integral; count = H × I ÷ ΣI; atoms named exist and carry H; R, k, α and N from the formulas; each tangent triangle w wide about t; lines at 2B(J + 1), 2B apart; the lit line; ir bands inside 4000–400 cm⁻¹, 1 to 6 a card.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-instrumentTrace-nmr',
      'g.he-instrumentTrace-nmr-septet',
      'g.he-instrumentTrace-chromatogram',
      'g.he-instrumentTrace-chromatogram-overlap',
      'g.he-instrumentTrace-rotational',
      'g.he-instrumentTrace-rotational-hot',
      'g.he-instrumentTrace-ir-cards',
    ],
  },
];
