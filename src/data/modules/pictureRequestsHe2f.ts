/**
 * College pictures, round 2, group F (docs/RENDERINGS_HE.md). Spread into
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

const UP1 = 'he.physics.university-1';
const CM = 'he.physics.classical-mechanics';
const STAT = 'he.engineering.statics';
const DYN = 'he.engineering.dynamics';
const FM = 'he.engineering.flight-mechanics';
const OM = 'he.engineering.orbital-mechanics';

export const HE2F_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC20',
      'freeBody',
      'Mechanics options on `freeBody`: two blocks over a pulley, a ladder, tip or slip, a rope on a drum, a banked curve',
      {
        [`${UP1}#1`]: '"pulley"',
        [`${UP1}#1~atwood`]: '"pulley"',
        [`${UP1}#1~banked`]: '"banked"',
        [`${UP1}#4~ladder`]: '"ladder"',
        [`${CM}#0~atwood`]: '"pulleyMass"',
        [`${STAT}#4~tip`]: '"tip"',
        [`${STAT}#4~belt`]: '"drum"',
        [`${DYN}#1`]: '"pulley"',
        [`${DYN}#1~banked`]: '"banked"',
      },
      [
        'From P-P2, P-P7, P-P3 (bank), ME-P27. One renderer, reps/FreeBodyHe.tsx (types in typesHe2f.ts, arithmetic in he2fMath.ts, check in harness/picturesHe2f.ts); a `freeBody` with `support` draws as before. `g` comes from the page (a number: 9.8 on physics pages, 9.81 on engineering pages); every force is drawn on one scale from the values; a "?" input draws no arrow that needs it and the caption keeps only its formulas.',
        'Fields: `{ kind: "freeBody", g?, pulley | ladder | tip | drum | banked }`. `pulley: { layout: "table" | "atwood", m1, m2, mu?, a?, T?, T2?, pulleyMass? }` (the setup sketched above two free-body diagrams on one scale, a beside each block; with `pulleyMass` the disk is painted and T on m₁’s side, T2 on m₂’s; on a table, a ≤ 0 draws friction holding and a = 0). `ladder: { angle (°, with the floor), weight, wall?, floor?, friction?, mu? }` (lever arms about the foot dashed; drag the top for θ). `tip: { width, height (of the push), weight, mu, tip?, slip?, crateHeight? }` (the smaller push drawn, the tipping edge ringed, N where the torques balance; drag the push for h). `drum: { t1, t2, mu, wrap (°, or `radians: true`) }` (past 180° the extra turns drawn as coils, β written). `banked: { angle, radius?, speed?, mass?, normal?, mu?, net? }` (N’s parts dashed, the net force level toward the center; with `mu` the top-speed case, friction down the slope; without `mass` the forces read in mg).',
        'Harness: each block’s net force is its mass × a and T₂ − T₁ = ½Ma; the ladder’s forces and torques about the foot cancel (N_w = W ÷ (2 tan θ), f = N_w, N_f = W, μ = f ÷ N_f); P_tip = Wb ÷ (2h), P_slip = μW and the drawn push is the smaller; T₂ = T₁e^(μβ); N cos θ = mg (less the friction’s part) and N(sin θ + μ cos θ) = mv²/r.',
        'Examples: university-1#1 main: { kind: "freeBody", g: 9.8, pulley: { layout: "table", m1: "m1", m2: "m2", mu: "mu", a: "a", T: "T" } }. classical-mechanics#0~atwood: { kind: "freeBody", g: 9.8, pulley: { layout: "atwood", m1: "m1", m2: "m2", pulleyMass: "M", a: "a", T: "T1", T2: "T2" } }. university-1#4~ladder: { kind: "freeBody", ladder: { angle: "theta", weight: "W", wall: "Nw", floor: "Nf", friction: "f", mu: "mu" } }. statics#4~belt: { kind: "freeBody", drum: { t1: "T1", t2: "T2", mu: "mu", wrap: "beta" } }. dynamics#1~banked: { kind: "freeBody", g: 9.81, banked: { angle: "theta", radius: "R", speed: "vmax", mu: "mu" } }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-free-body-pulley-table',
      'g.he-free-body-pulley-hanging',
      'g.he-free-body-pulley-atwood',
      'g.he-free-body-pulley-disk',
      'g.he-free-body-pulley-flywheel',
      'g.he-free-body-ladder',
      'g.he-free-body-ladder-low',
      'g.he-free-body-tip',
      'g.he-free-body-tip-low',
      'g.he-free-body-drum',
      'g.he-free-body-drum-capstan',
      'g.he-free-body-banked',
      'g.he-free-body-banked-friction',
    ],
  },
  {
    ...ask(
      'HC25',
      'freeBody',
      'Aircraft on `freeBody`: L, W, T, D and the climb angle from the side, the bank of a level turn from the front, and the CG and neutral point on the mean chord',
      {
        [`${FM}#0`]: '"aircraft"',
        [`${FM}#0~stall`]: '"aircraft"',
        [`${FM}#0~climb`]: '"gamma"',
        [`${FM}#0~turn`]: '"front"',
        [`${FM}#1`]: '"stability"',
        [`${FM}#3`]: '"elevator"',
        [`${FM}#3~coordinated-turn`]: '"front"',
      },
      [
        'From ACC-P4. Drawn by reps/FreeBodyAircraft.tsx (types in typesHe2f.ts, arithmetic in he2fMath.ts, check in harness/picturesHe2f.ts). The airplane is painted in aluminum (fuselage, fin, wing, rear engine, windows); the forces are flat arrows. `g` comes from the page (9.81 on the flight pages); it is only needed for a turn radius or rate.',
        'Fields: `{ kind: "freeBody", g?, aircraft: { view: "side" | "front" | "stability", weight?, lift?, thrust?, drag?, gamma?, alpha?, elevator?, phi?, factor?, speed?, radius?, rate?, rateDegrees?, hac?, h?, hn?, margin? } }`. `side`: L square to the path (W cos γ when `lift` is not given), W down, T and D along the path; L and W to one scale, T and D on a second magnified by 1, 2, 5, 10 … (named on the picture); in a climb W sin γ is dashed after D so D + W sin γ lines up with T; `alpha` draws the relative wind and α, `elevator` the δe inset (its angle ×5 when under 6°). `front`: rolled φ, L (= nW) square to the wings, L cos φ and L sin φ dashed; without `weight` the forces read in W. `stability`: `hac`, `h`, `hn` as fractions of c̄, the margin bracketed, "Stable" or "Unstable" written.',
        'Harness: L = W cos γ (L = W level) and T − D = W sin γ; n = 1 ÷ cos φ, L cos φ = W, R = V² ÷ (g tan φ), ω = V ÷ R (°/s with `rateDegrees`); SM = h_n − h and the CG drawn ahead of the neutral point exactly when SM > 0.',
        'Examples: flight-mechanics#0 main: { kind: "freeBody", g: 9.81, aircraft: { view: "side", weight: "W", lift: "W", thrust: "D", drag: "D" } }. ~climb: { aircraft: { view: "side", weight: "W", thrust: "T", drag: "D", gamma: "gamma" } }. ~turn: { g: 9.81, aircraft: { view: "front", phi: "phi", factor: "n", speed: "V", radius: "R", rate: "omega" } }. #1 main: { aircraft: { view: "stability", hac: "hac", h: "h", hn: "hn", margin: "SM" } }. #3 main: { aircraft: { view: "side", alpha: "alpha", elevator: "de" } }.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-free-body-aircraft-level',
      'g.he-free-body-aircraft-stall',
      'g.he-free-body-aircraft-climb',
      'g.he-free-body-aircraft-turn',
      'g.he-free-body-aircraft-steep-turn',
      'g.he-free-body-aircraft-coordinated',
      'g.he-free-body-aircraft-stability',
      'g.he-free-body-aircraft-unstable',
      'g.he-free-body-aircraft-elevator',
    ],
  },
  {
    ...ask(
      'HC35',
      'circularMotion',
      'Orbits and path coordinates on `circularMotion`: a Hohmann transfer, vis-viva on an ellipse, two planets’ angles, n–t acceleration on a curve',
      {
        [`${CM}#2~hohmann`]: '"hohmann"',
        [`${OM}#0~vis-viva`]: '"visViva"',
        [`${OM}#2`]: '"hohmann"',
        [`${OM}#3`]: '"planets"',
        [`${OM}#3~synodic`]: '"pair"',
        [`${DYN}#0~nt`]: '"tangential"',
      },
      [
        'From P-P3 (transfer), ACC-P12, ME-P28. Drawn by reps/CircularOrbits.tsx (types in typesHe2f.ts, arithmetic in he2fMath.ts, check in harness/picturesHe2f.ts); the K–12 modes draw as before. μ (GM) comes from the page, as a number or a value, in the units of r and v (km³/s² with km and km/s); orbits are to scale, Earth painted and to scale with `bodyRadius`; the Sun and planets of an interplanetary transfer are not to scale and the picture says so.',
        'Fields: `{ kind: "circularMotion", mode: "hohmann", mu, r1, r2, a?, v1?, vp?, va?, v2?, dv1?, dv2?, vinf?, tof?, tofScale? (3600 for hours, 86,400 for days), body?: "earth" | "sun", bodyRadius?, planets?: [from, to] }` (both circles dashed, the transfer half solid from perigee over the top, the other half faint, Δv₁ (or v∞) and Δv₂ arrows on one scale, TOF at the top, r₁, r₂ and a = (r₁ + r₂) ÷ 2 under it). `{ mode: "visViva", mu, rp, ra, r, a?, v?, body?, bodyRadius? }` (the point where the distance is r, on the way out, r dashed from the focus, v along the orbit to a scale of v_p). `{ mode: "pair", t1, t2, synodic?, time?, planets? }` (radii by T^(2/3), lined up at t = 0, drawn at `time` or after S, each angle and its laps). `{ mode: "tangential", speed, rho, at, an?, accel? }` (v, a_t, a_n toward the center of curvature, a with its parallelogram; ρ drawn one length).',
        'Harness: the ellipse touches r₁ at perigee and r₂ at apogee with a = (r₁ + r₂) ÷ 2; v₁, v_p, v_a, v₂, Δv₁ (v∞), Δv₂ and TOF; r between r_p and r_a and v by vis-viva; 1 ÷ S = 1 ÷ T₁ − 1 ÷ T₂ and one lap gained over S; a_n = v² ÷ ρ, a = √(a_t² + a_n²).',
        'Examples: orbital-mechanics#2 main: { kind: "circularMotion", mode: "hohmann", mu: 398600, r1: "r1", r2: "r2", a: "a", v1: "v1", vp: "vp", va: "va", v2: "v2", dv1: "dv1", dv2: "dv2", tof: "tof", tofScale: 3600, bodyRadius: 6378 }. #3 main: { mode: "hohmann", mu: 1.32712e11, r1: "r1", r2: "r2", vinf: "vinf", tof: "tof", tofScale: 86400, body: "sun", planets: ["earth", "mars"] }. #0~vis-viva: { mode: "visViva", mu: 398600, rp: "rp", ra: "ra", r: "r", a: "a", v: "v", bodyRadius: 6378 }. #3~synodic: { mode: "pair", t1: "T1", t2: "T2", synodic: "S", planets: ["earth", "mars"] }. dynamics#0~nt: { mode: "tangential", speed: "v", rho: "rho", at: "at", an: "an", accel: "a" }. classical-mechanics#2~hohmann: as the g.he-circular-motion-hohmann-gm demo, mu: "GM".',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-circular-motion-hohmann',
      'g.he-circular-motion-hohmann-wide',
      'g.he-circular-motion-hohmann-gm',
      'g.he-circular-motion-hohmann-mars',
      'g.he-circular-motion-vis-viva',
      'g.he-circular-motion-vis-viva-apogee',
      'g.he-circular-motion-pair',
      'g.he-circular-motion-pair-jupiter',
      'g.he-circular-motion-nt',
      'g.he-circular-motion-nt-braking',
    ],
  },
];
