/**
 * College pictures, round 2, group B (docs/RENDERINGS_HE.md). Spread into
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

const P = 'he.physics.';
const C = 'he.chemistry.';

export const HE2B_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC15',
      'potentialWell',
      'A potential well (box, oscillator, step, barrier, bump) with its levels to scale, ψ or |ψ|² on them and the photon of a jump',
      [
        `${P}quantum#0`,
        `${P}quantum#0~spread`,
        `${P}quantum#1`,
        `${P}quantum#1~harmonic`,
        `${P}quantum#1~tunneling`,
        `${P}quantum#1~step`,
        `${P}quantum#3`,
        `${C}physical-2#1`,
        `${C}physical-2#1~oscillator`,
      ],
      [
        'From P-P19 (potentialWell) and C-P1 (orbitalDiagram mode well): one new kind serves both (typesHe2b.ts, reps/PotentialWell.tsx, the sums in reps/potentialWellMath.ts).',
        "Fields: { kind: 'potentialWell', model: 'box' | 'harmonic' | 'step' | 'barrier' | 'bump', letter?: 'n' | 'v' (n in a box, v for an oscillator by default), length? (L), mass?, force? (k), omega? (ω), lower?, upper? (levels lit with ψ and the arrow between; harmonic without upper draws lower + 1), absorb? (arrow up), square? (|ψ|²), ground? (E₁ or E₀), spacing? (ħω or hν), lowerEnergy?, upperEnergy? (any one sets every level’s label), gap? (ΔE), wavelength? (λ; worked out from ΔE in J or eV when absent), region?: { from, to } (x₁ to x₂ shaded under |ψ|²), probability? (P), mean? (⟨x⟩), spread? (Δx), energy? (E), height? (U, U₀), above? (U − E), width? (a), kappa? (κ), transmission? (T), reflection? (R), ratio? (k₁/k₂), bump? (V₀), shift? (E⁽¹⁾), more?: [ids labelled under it] }.",
        "Example (quantum#1): { kind: 'potentialWell', model: 'box', length: 'L', mass: 'm', lower: 'np', upper: 'n', lowerEnergy: 'Enp', upperEnergy: 'En', gap: 'dE', wavelength: 'lam' }. Example (physical-2#1~oscillator): { kind: 'potentialWell', model: 'harmonic', letter: 'v', lower: 0, upper: 1, absorb: true, force: 'k', ground: 'E0' }. Example (quantum#1~tunneling): { kind: 'potentialWell', model: 'barrier', mass: 'm', above: 'above', width: 'a', kappa: 'kappa', transmission: 'T' }.",
        'Draws levels to n = 8 in a box (v = 5 for an oscillator), one above the highest lit level, unlit ones dashed; nodes ringed on ψ; oscillator levels between their turning points; a level past the top is named in the caption. The step draws Re ψ shortening past the step (decaying when E < U₀); the barrier draws ψ decaying as e^(−κx) to scale, with heights to scale only when E and U are given (else the caption says so). A "?" draws no label and no arrow. Units are the page’s: energies in eV, J or kJ/mol, lengths in nm, μm or m, κ in nm⁻¹.',
        'The harness (harness/picturesHe2b.ts) checks levels ∝ n² (box) or v + ½ (oscillator) across every energy given, ψ has n − 1 or v nodes as drawn, λ = hc ÷ ΔE (0.1%, SI from the units), ΔE from the levels, P = ∫|ψ|² over the region, E⁽¹⁾ = V₀P, the step’s R, T and k₁/k₂, T = e^(−2κa) and κ = √(2m(U − E)) ÷ ħ. Demos: the nine pages plus the edges n = 6 → 1 and an oscillator at n = 4.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-potentialWell-box',
      'g.he-potentialWell-box-high',
      'g.he-potentialWell-dye',
      'g.he-potentialWell-probability',
      'g.he-potentialWell-spread',
      'g.he-potentialWell-harmonic',
      'g.he-potentialWell-harmonic-high',
      'g.he-potentialWell-oscillator',
      'g.he-potentialWell-tunneling',
      'g.he-potentialWell-step',
      'g.he-potentialWell-bump',
    ],
  },
];
