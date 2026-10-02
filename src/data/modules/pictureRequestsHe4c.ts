/**
 * College pictures, round 4, group C (docs/RENDERINGS_HE.md). Spread into
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

export const HE4C_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC99',
      'motionGraph',
      'Position as a cubic in time: x–t, v–t and a–t stacked on one time axis, the point at t on each, the tangent on x–t of slope v, the turnarounds (v = 0) ringed',
      { [`${P}university-1#0~calculus`]: '"polynomial"' },
      [
        'From P-P1. New option on motionGraph (typesHe4c.ts MotionGraphHe4cSpec, reps/MotionPolynomial.tsx, sums in reps/he4cMath.ts); the other motion graphs are unchanged.',
        "Fields: { kind: 'motionGraph', polynomial: { c0 (m), c1 (m/s), c2 (m/s²), c3 (m/s³), at (t, s), position? (x), velocity? (v), acceleration? (a) }, fixed? }. Each is a variable id or a fixed number; the axis units follow c₀'s and t's units.",
        "Example (~calculus): { kind: 'motionGraph', polynomial: { c0: 'c0', c1: 'c1', c2: 'c2', c3: 'c3', at: 't', position: 'x', velocity: 'v', acceleration: 'a' } }.",
        'The window runs from t = 0 past t and the last turnaround (one more than 4t away is left out); each graph has its own range. The caption works x, v = dx/dt and a = dv/dt at t term by term and names the turnaround times. Drag the point on x–t for t. A "?" coefficient draws no curves; a "?" t draws no point or tangent.',
        'The demos add c₀ = 4 m to the plan’s x = 2t³ − 9t² + 12t (a 0 with a unit fails the module tests); the turnarounds stay at 1 s and 2 s.',
        'Harness (harness/picturesHe4c.ts): x, v and a at t by the power rule; each ringed turnaround has v = 0 within 10⁻⁶ and v changes sign there.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-motionGraph-polynomial', 'g.he-motionGraph-polynomial-long'],
  },
  {
    ...ask(
      'HC101',
      'impulse',
      'A force pulse on the F–t graph (rectangle, triangle or half a sine): its area J shaded and written, the rectangle of the same area dashed at the average force, Δt bracketed, and the ball it sends off at Δv',
      { [`${P}university-1#3~impulse-curve`]: '"shape"' },
      [
        'From P-P5. New option on impulse (typesHe4c.ts ImpulseShapeSpec, reps/ImpulseShape.tsx, sums in reps/he4cMath.ts); the momentum-arrow impulse picture is unchanged.',
        "Fields: { kind: 'impulse', shape: 'rectangle' | 'triangle' | 'halfSine', peak (F_max, N), time (Δt, s), impulse? (J, N·s), average? (F_avg, N), mass? (m, kg), change? (Δv, m/s), fixed? }.",
        "Example (~impulse-curve, the plan's triangle): { kind: 'impulse', shape: 'triangle', peak: 'F', time: 'dt', impulse: 'J', average: 'Favg', mass: 'm', change: 'dv' }. The page's relation follows the shape: J = F_max Δt, ½F_max Δt or (2 ÷ π)F_max Δt.",
        'The pulse is drawn to scale on F and t (F_max two-thirds up, Δt two-thirds across); the caption works J, the average force J ÷ Δt and Δv = J ÷ m. Drag the peak for F_max and the pulse’s end for Δt. A "?" peak or time draws no pulse.',
        'Harness (harness/picturesHe4c.ts): the drawn pulse’s area by quadrature = J (0.1%); F_avg·Δt = J; Δv = J ÷ m.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-impulse-triangle',
      'g.he-impulse-rectangle',
      'g.he-impulse-half-sine',
      'g.he-impulse-half-sine-golf',
    ],
  },
  {
    ...ask(
      'HC103',
      'pendulum',
      'A physical pendulum: a uniform wooden rod swinging on a steel pin, its center of mass marked and d bracketed, and the simple pendulum of the same period (length I ÷ (md)) dashed from the same pin',
      { [`${P}university-1#5~physical-pendulum`]: '"rod"' },
      [
        'From P-P9. New option on pendulum (typesHe4c.ts PendulumRodSpec, reps/PendulumRod.tsx, sums in reps/he4cMath.ts); the simple pendulum is unchanged.',
        "Fields: { kind: 'pendulum', rod: { length (L, m), pivot? (p, m below the top end; 0 or left out pins it at the end) }, mass (m, kg), g (m/s², the page's: 9.8 on physics pages), inertia? (I about the pin, kg·m²), distance? (d, m), period? (T, s), equivalent? (I ÷ (md), m), fixed? }.",
        "Example (~physical-pendulum, the plan's 1.0 m rod pinned at its end): { kind: 'pendulum', rod: { length: 'L', pivot: 0 }, mass: 'm', g: 9.8, inertia: 'I', distance: 'd', period: 'T', equivalent: 'Leq' }. A page with only m, I, d and T can pass its own I: the rod's length still sets the drawing (pass length as a fixed number).",
        'Drawn to scale (pin, rod, d and I ÷ (md) on one scale), swung 12° for the drawing only; the caption works d, I = mL² ÷ 12 + md² (when the page’s I is the uniform rod’s), T = 2π√(I ÷ (mgd)) and the equivalent length. A pin at the center of mass (d = 0) draws the rod faded and still, with the reason. Drag the center of mass for p (or the rod’s end for L when the pin is fixed).',
        'Harness (harness/picturesHe4c.ts): d = L ÷ 2 − p with the pin on the upper half; I = mL² ÷ 12 + md²; T = 2π√(I ÷ (mgd)); the equivalent length I ÷ (md).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-pendulum-rod', 'g.he-pendulum-rod-offset', 'g.he-pendulum-rod-near-center'],
  },
  {
    ...ask(
      'HC104',
      'spacetime',
      'A Minkowski diagram: x and ct on one scale, the light lines at 45°, the moving frame’s axes tilted by tan⁻¹β, an event read on both sets of axes with its invariant hyperbola; for velocity addition, the world lines of S′, the object and the Galilean sum',
      [`${P}university-3#2~lorentz`, `${P}university-3#2~velocity-addition`],
      [
        'From P-P16. New kind (typesHe4c.ts SpacetimeSpec, reps/Spacetime.tsx, sums in reps/he4cMath.ts; registered in types.ts, reps/index.tsx, meta.ts, modules.test.ts, harness/pictures.ts, docs/PICTURES.md).',
        "Fields: { kind: 'spacetime', mode: 'lorentz', speed (β = v ÷ c), x (m), ct (m), gamma? (γ), xPrime? (x′, m), ctPrime? (ct′, m), interval? (s², m²), fixed? } · { kind: 'spacetime', mode: 'addition', speed (v, in c), other (u′, in c), result? (u, in c), fixed? }. x and ct may be in any one length unit (the labels follow x's).",
        "Example (~lorentz): { kind: 'spacetime', mode: 'lorentz', speed: 'b', x: 'x', ct: 'ct', gamma: 'g', xPrime: 'xp', ctPrime: 'ctp', interval: 's2' }. Example (~velocity-addition): { kind: 'spacetime', mode: 'addition', speed: 'v', other: 'up', result: 'u' }.",
        'Lorentz: the window fits the origin, the event and the four points it is read at (on x, ct, x′ and ct′), on one scale; S′’s axes in their own colour with the tilt arcs; the reading lines dashed parallel to each axis; the hyperbola (ct)² − x² = s² dashed through the event; β, γ, x, ct, x′, ct′ and s² listed above in the colours of their axes. The caption works γ, x′, ct′ and s² in both frames and says timelike or spacelike. Drag the event (x and ct). Addition: a legend above; S′’s world line (its ct′ axis) with its x′ axis faint, the object’s world line at u ending in a handle (drag for u′), and v + u′ dashed, past the light line when it beats c. A "?" draws nothing for that value.',
        'Harness (harness/picturesHe4c.ts): β below 1; the drawn tilt is tan⁻¹β; γ, x′, ct′ and s²; the event read back from S′; (ct′)² − (x′)² = s²; u = (v + u′) ÷ (1 + vu′) with |u| < 1.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-spacetime-lorentz',
      'g.he-spacetime-lorentz-fast',
      'g.he-spacetime-addition',
      'g.he-spacetime-addition-near-c',
    ],
  },
  {
    ...ask(
      'HC105',
      'photoelectric',
      'Compton scattering: a photon in, the scattered photon at θ with its longer wave, the electron recoiling at φ, every arrow on one momentum scale with p = p′ + pₑ closed, and λ and λ′ as wave strips to one scale',
      { [`${P}university-3#3`]: '"compton"' },
      [
        'From P-P17. New mode on photoelectric (typesHe4c.ts PhotoelectricComptonSpec, reps/Compton.tsx, sums in reps/he4cMath.ts); the photoelectric-effect picture is unchanged.',
        "Fields: { kind: 'photoelectric', mode: 'compton', wavelength (λ, pm), angle (θ, °), shift? (Δλ, pm), scattered? (λ′, pm), energy? (E, keV), scatteredEnergy? (E′, keV), kinetic? (K, keV), electronAngle? (φ, ° below the axis), compton? (h ÷ mₑc in pm, the page's constant, default 2.426), hc? (keV·pm, default 1240), fixed? }.",
        "Example (UP3#3 main): { kind: 'photoelectric', mode: 'compton', wavelength: 'lam', angle: 'th', shift: 'dl', scattered: 'lamp', energy: 'E', scatteredEnergy: 'Ep', kinetic: 'K', compton: 2.426, hc: 1240 }.",
        'The scene: the incoming photon as a wave arriving at the electron (a lit ball), p carried on dashed past it, the scattered photon at θ (its drawn wave longer by λ′ ÷ λ) and the electron’s arrow at φ, all on one momentum scale (p ∝ 1 ÷ λ), pₑ copied dashed from p′’s tip to p’s tip; near 180° the returning photon is drawn just under the axis. Under it six waves of λ and of λ′ on one scale with the gap 6Δλ as a bar. The caption works Δλ, λ′, E, E′, K and φ. Drag the scattered photon round (0° to 180°) for θ. A "?" λ or θ draws no scattering.',
        'Harness (harness/picturesHe4c.ts): λ′ − λ = (h ÷ mₑc)(1 − cos θ); momentum closes in x and y; Δλ, λ′, E, E′, K and φ agree with the page.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-photoelectric-compton', 'g.he-photoelectric-compton-backscatter'],
  },
  {
    ...ask(
      'HC118',
      'freeBody',
      'An infinite slope in section: a slab of soil over a dashed slip surface (or a glacier’s ice on bedrock), σ, τ and the strength s on its base as arrows to one scale, FS and "slides" or "holds"; for ice the basal shear τ_b',
      {
        'he.earth-science.physical-geology#3': '"slab"',
        'he.earth-science.physical-geology#3~glacier': '"slab"',
      },
      [
        'From EG-P4. New option on freeBody (typesHe4c.ts FreeBodySlabSpec, reps/SlopeSlab.tsx, sums in reps/he4cMath.ts); the other free-body pictures and the round-2 college options are unchanged.',
        "Fields: { kind: 'freeBody', slab: { material: 'soil' | 'ice', thickness (z, the vertical depth to the slip surface, or the ice thickness H, m), angle (θ, or the ice surface slope α, °), unitWeight? (γ, kN/m³), cohesion? (c, kPa), friction? (φ, °), density? (ρ, kg/m³, ice), g? (m/s², the page's: 9.81 on earth pages; an ice slab needs it), normal? (σ, kPa), shear? (τ, or τ_b for ice, kPa), strength? (s, kPa), safety? (FS) }, fixed? }.",
        "Example (#3): { kind: 'freeBody', slab: { material: 'soil', thickness: 'z', angle: 'th', unitWeight: 'gam', cohesion: 'c', friction: 'phi', normal: 'sig', shear: 'tau', strength: 's', safety: 'FS' } }. Example (#3~glacier): { kind: 'freeBody', slab: { material: 'ice', thickness: 'H', angle: 'al', density: 'rho', g: 9.81, shear: 'tb' } }.",
        'The slope at its true angle across the whole width (an infinite slope), the slab painted in soil with grains or ice with marks, the ground under the dashed slip surface darker (soil) or bedrock with joints (ice); θ against a level line; z (or H) bracketed straight down, not to scale (said in the caption); σ pressing on the base, τ (τ_b) downslope above it and s upslope below it, on one scale; the material’s values and "FS = …: slides" or "holds" listed top right. The caption works σ, τ, s and FS (ice: ρgH sin α ÷ 1000 against about 100 kPa). Drag the slope’s foot for the angle. A "?" draws nothing for that value.',
        'Harness (harness/picturesHe4c.ts): σ = γz cos²θ, τ = γz sin θ cos θ, s = c + σ tan φ, FS = s ÷ τ, "slides" exactly when FS < 1; ice: τ_b = ρgH sin α with the page’s g.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-freeBody-slab-soil',
      'g.he-freeBody-slab-soil-slides',
      'g.he-freeBody-slab-ice',
    ],
  },
];
