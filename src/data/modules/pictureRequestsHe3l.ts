/**
 * College pictures, round 3, group L (docs/RENDERINGS_HE.md). Spread into
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
const E = 'he.engineering.';

export const HE3L_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC68',
      'rayDiagram',
      'Diffraction by one slit (central band bracketed), a grating’s orders as rays at their true angles, and a thin film’s two reflected rays with the path 2nt and the flips',
      [
        `${P}university-3#1~single-slit`,
        `${P}university-3#1~grating`,
        `${P}university-3#1~thin-film`,
      ],
      [
        'From P-P15. New modes on rayDiagram (typesHe3l.ts RayDiagramHe3lSpec, reps/RayHe3l.tsx, the sums in reps/he3lMath.ts); the older modes are unchanged.',
        "Fields: { kind: 'rayDiagram', mode: 'singleSlit', wavelength (λ, nm), width (a, mm), screen (L, m), central? (w, mm), angle? (θ₁, °) } · { mode: 'grating', wavelength (nm), lines (N, lines/mm), spacing? (d, μm), order? (m lit), angle? (θ of the lit order, °), highest? (m_max) } · { mode: 'thinFilm', index (n), thickness (t, nm), order (m, 0–10), wavelength? (bright λ, nm), flips?: 'one' (default, film in air: 2nt = (m + ½)λ) | 'both' | 'none' (2nt = mλ), below? (the substrate's index, a label) }.",
        'A variable is read in its own unit (nm, μm, mm, cm, m; lines/mm or lines/cm), so a page may show λ in μm; a fixed number is in the unit named.',
        "Example (~single-slit): { kind: 'rayDiagram', mode: 'singleSlit', wavelength: 'lam', width: 'a', screen: 'L', angle: 'th', central: 'w' }. Example (~grating): { kind: 'rayDiagram', mode: 'grating', wavelength: 'lam', lines: 'N', spacing: 'd', order: 'm', angle: 'th', highest: 'mmax' }. Example (~thin-film): { kind: 'rayDiagram', mode: 'thinFilm', index: 'n', thickness: 't', order: 'm', wavelength: 'lam' }.",
        'Single slit: the screen’s brightness (sinc²) as a strip and a curve, the dark fringes marked at L tan θₘ (to scale along the screen, not across), w bracketed; a ≤ λ draws faded with the reason. Grating: every order to m_max = ⌊d ÷ λ⌋ as a ray at its true angle with a spot (one exactly at sin θ = 1 grazes at 90°), the lit order thick with θ arced and written at its end; an order past sin θ = 1 is named in the caption, never drawn. Thin film: rays 1 and 2 in the bright color, the flips ringed, 2nt written, t bracketed, and the visible band with the bright λ of each order (the page’s lit). A "?" draws nothing for that value.',
        'Harness (harness/picturesHe3l.ts): θ₁ from a sin θ₁ = λ, w = 2L tan θ₁, the side band half the central band; d = 1 ÷ N, θ from the grating equation, m_max, no order past sin θ = 1; λ from 2nt.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rayDiagram-single-slit',
      'g.he-rayDiagram-single-slit-narrow',
      'g.he-rayDiagram-grating',
      'g.he-rayDiagram-grating-fine',
      'g.he-rayDiagram-thin-film',
      'g.he-rayDiagram-thin-film-coating',
    ],
  },
  {
    ...ask(
      'HC69',
      'phaseSpace',
      'Phase space: the oscillator’s energy ellipse with the point and its flow arrow (∂H/∂p, −∂H/∂x), the pendulum’s θ–ω portrait with the separatrix, and a bead on a spinning hoop beside its U_eff curve',
      [
        `${P}classical-mechanics#1`,
        `${P}classical-mechanics#1~pendulum-phase`,
        `${P}classical-mechanics#0~bead-hoop`,
      ],
      [
        'From P-P20. New kind (typesHe3l.ts PhaseSpaceSpec, reps/PhaseSpace.tsx, sums in reps/he3lMath.ts).',
        "Fields: { kind: 'phaseSpace', system: 'oscillator', mass (kg), spring (N/m), position (m), momentum (kg·m/s), energy? (H, J), velocity? (ẋ, m/s), force? (ṗ, N), omega? (ω), area? (𝒜, J·s) } · { system: 'pendulum', mass, length (m), speed (ω₀ at the bottom, rad/s), g (the page’s), energy? (E), separatrix? (E_s), amplitude? (θ_max, °) } · { system: 'hoop', radius (R, m), spin (ω, rad/s), g, critical? (ω_c), angle? (θ₀, °), frequency? (Ω) }. fixed?: no drag.",
        "Example (CM#1): { kind: 'phaseSpace', system: 'oscillator', mass: 'm', spring: 'k', position: 'x', momentum: 'p', energy: 'H', velocity: 'xd', force: 'pd', omega: 'w', area: 'A' }. Example (~pendulum-phase): { kind: 'phaseSpace', system: 'pendulum', mass: 'm', length: 'L', speed: 'w0', g: 'g', energy: 'E', separatrix: 'Es', amplitude: 'thm' }. Example (CM#0~bead-hoop): { kind: 'phaseSpace', system: 'hoop', radius: 'R', spin: 'w', g: 'g', critical: 'wc', angle: 'th0', frequency: 'Om' }.",
        'Oscillator: x–p axes, the ellipse through the point shaded (its area 𝒜), fainter ellipses at ¼ and 2 × H, the half-widths √(2H/k) and √(2mH) marked, H, ẋ, ṗ and 𝒜 in the corner, the flow arrow tangent (clockwise); drag the point to set x and p. Pendulum: θ from −180° to 180°, libration ovals and rotation curves faint, E_s dashed, the page’s curve in ink with ±θ_max ringed or "goes over the top". Hoop: the hoop painted in metal and the bead lit, θ₀ arced, beside U_eff ÷ mgR = 1 − cos θ − ½(ω ÷ ω_c)² sin² θ with its minima ringed. g is the page’s value. A "?" draws nothing for that value.',
        'Harness (harness/picturesHe3l.ts): H at the point is the drawn ellipse’s H, ẋ = ∂H/∂p, ṗ = −∂H/∂x, ω, 𝒜 = 2πH ÷ ω; E, E_s, θ_max (none marked past E_s); ω_c, θ₀ and Ω. The hoop demo writes cos θ₀ = ω_c² ÷ ω² (the same as g ÷ ω²R) and Ω = √(ω² − ω_c⁴ ÷ ω²) = ω sin θ₀ above ω_c, so every value stays tied to the inputs.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-phaseSpace-oscillator',
      'g.he-phaseSpace-oscillator-stiff',
      'g.he-phaseSpace-pendulum',
      'g.he-phaseSpace-pendulum-near-top',
      'g.he-phaseSpace-hoop',
      'g.he-phaseSpace-hoop-near-critical',
    ],
  },
  {
    ...ask(
      'HC93',
      'wave',
      'A plane wave’s E and B (or H) in step along the travel with E₀, B₀, λ and S, and the standing-wave envelope on a line from a source to its load with V_max, V_min and the VSWR',
      [`${P}electromagnetism#3`, `${E}electromagnetics#0`, `${E}electromagnetics#2`],
      [
        'From P-P25 and EC-P11. New options on wave (typesHe3l.ts WaveHe3lSpec, reps/WaveHe3l.tsx); the older wave pictures are unchanged.',
        "Fields: { kind: 'wave', em: { field?: 'B' (default) | 'H', amplitude (E₀, V/m), magnetic? (B₀ in T, mT, μT or nT; H₀ in A/m or mA/m), wavelength? (λ, any length unit), speed? (v, m/s; c when absent), impedance? (η, Ω; η₀ in vacuum), intensity? (I or S, W/m²) } } · { kind: 'wave', line: { gamma (Γ), vswr?, impedance? (Z₀, Ω), load? (R_L, Ω), returnLoss? (dB), share? (%) } }.",
        "Example (EM#3): { kind: 'wave', em: { amplitude: 'E0', magnetic: 'B0', intensity: 'I' } }. Example (electromagnetics#2): { kind: 'wave', em: { field: 'H', amplitude: 'E0', magnetic: 'H0', wavelength: 'lam', speed: 'v', impedance: 'eta', intensity: 'S' } }. Example (electromagnetics#0): { kind: 'wave', line: { gamma: 'G', vswr: 'S', impedance: 'Z0', load: 'RLd', returnLoss: 'RL', share: 'sh' } }.",
        'em: two wavelengths of E (vertical) and B or H (level, in perspective) in step, E₀ and B₀ arrows at the first crest, λ bracketed, S along the travel; B is drawn to match E (B₀ = E₀ ÷ c is far smaller), its value written. line: |V| ÷ |V⁺| over 1¼ λ back from the load (a maximum at the load when Γ > 0, a minimum when Γ < 0, flat when matched), V_max = 1 + |Γ| and V_min = 1 − |Γ| dashed, λ/2 between maxima, the source, the line (Z₀) and the load (R_L); |Γ| = 1 reads VSWR → ∞. The EM#3 demo leaves out λ and f (c = fλ is a pair of values on its own, which the module tests would split off); a page that keeps them passes wavelength.',
        'Harness (harness/picturesHe3l.ts): B₀ = E₀ ÷ v, H₀ = E₀ ÷ η, I = E₀² ÷ 2η; Γ from Z₀ and R_L, V_max ÷ V_min = VSWR, RL = −20 log|Γ|, the share Γ².',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-wave-em',
      'g.he-wave-em-dielectric',
      'g.he-wave-line',
      'g.he-wave-line-low-load',
    ],
  },
];
