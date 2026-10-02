/**
 * College pictures, round 2, group E (docs/RENDERINGS_HE.md). Spread into
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

const UP2 = 'he.physics.university-2';
const EM = 'he.physics.electromagnetism';
const EMAG = 'he.engineering.electromagnetics';

export const HE2E_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC19',
      'induction',
      'Field sources with their B lines and an Amperian loop (wire, loop, solenoid, toroid, charging plates), a coil in a uniform field, and a rod sliding on rails',
      {
        [`${UP2}#3~wire-field`]: '"source":"wire"',
        [`${UP2}#3~solenoid`]: '"source":"solenoid"',
        [`${UP2}#3~moving-rod`]: '"rails"',
        [`${EM}#1`]: '"source":"loop"',
        [`${EM}#1~ampere-wire`]: '"radius"',
        [`${EM}#1~toroid`]: '"source":"toroid"',
        [`${EM}#1~loop-torque`]: '"uniform"',
        [`${EM}#2~displacement-current`]: '"source":"plates"',
        [`${EMAG}#1`]: '"source":"wire"',
      },
      [
        'From P-P13, P-P14, EC-P31 (wire). Options on `induction` (typesHe2e.ts, drawn by reps/InductionHe2e.tsx from he2eMath.ts); a spec without them draws as before. All values SI in the page’s formula units (T, A, m, m²; show cm, mm or cm² with shownIn); μ₀ from `mu0` (default 4π × 10⁻⁷), ε₀ from `eps0` (plates, default 8.85 × 10⁻¹²). A "?" box draws nothing for its value.',
        'Fields: { kind: "induction", mode: "field", current, field?, mu0?, source: "wire", r, radius? (a thick wire: B(r) graph under it), region?: "inside" | "outside" (the page’s rule for one side; r on the other draws faded with the reason), H?, second? (I₂ at r), force? (F/L, + attract) } | { source: "loop", radius, turns?, z?, center? (B₀), uniform?: { field, angle (θ in degrees, μ to B), area, moment?, torque?, energy? } } | { source: "solenoid", turns, length, area?, perLength?, inductance?, energy? } (B lines traced from the turns: even inside; a thin solenoid drawn wider and said) | { source: "toroid", turns, r } (B = 0 outside said) | { source: "plates", radius, r, rate? (dE/dt), displacement? (I_d), eps0? } (r > R faded: the page’s rule I(r/R)² is for between the plates). Rails: { kind: "induction", rails: { B, L, v, R?, emf?, I?, F?, P?, out? } } (× into the page, • with out; I round the loop by Lenz; F against v; drag v).',
        'Harness (picturesHe2e.ts): B at r from each source’s formula (wire inside and outside, loop axis and center, solenoid μ₀nI, toroid, plates), H, F/L, μ = NIA, τ, U, n, L, U = ½LI², dE/dt, I_d; the solenoid’s lines start evenly spaced and its summed field is even across a long one; ε = BLv, I = ε/R, F = BIL drawn against v, P = Fv = I²R.',
        'Example (electromagnetics#1 main): { kind: "induction", mode: "field", source: "wire", current: "I", r: "r", field: "B", H: "H" }. UP2#3~moving-rod: { kind: "induction", rails: { B: "B", L: "L", v: "v", R: "R", emf: "e", I: "I", F: "F", P: "P" } }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-induction-wire',
      'g.he-induction-wire-pair',
      'g.he-induction-thick-wire',
      'g.he-induction-thick-wire-outside',
      'g.he-induction-loop',
      'g.he-induction-loop-far',
      'g.he-induction-loop-torque',
      'g.he-induction-solenoid',
      'g.he-induction-toroid',
      'g.he-induction-plates',
      'g.he-induction-rails',
    ],
  },
  {
    ...ask(
      'HC29',
      'charges',
      'Gauss surfaces (a charged ball, a line charge, a sheet) with E on the surface and the enclosed charge shaded; a ring or disk with dE from opposite pieces on its axis; a charge over a grounded plane and its image',
      {
        [`${UP2}#0`]: '"shape":"sphere"',
        [`${UP2}#0~line`]: '"shape":"line"',
        [`${UP2}#0~plane`]: '"shape":"plane"',
        [`${EM}#0`]: '"distribution":"ring"',
        [`${EM}#0~disk`]: '"distribution":"disk"',
        [`${EM}#0~images`]: '"distribution":"image"',
        [`${EMAG}#1~gauss-line`]: '"shape":"line"',
      },
      [
        'From P-P10, P-P24, EC-P31 (line charge). Options on `charges` (typesHe2e.ts, drawn by reps/ChargesHe2e.tsx from he2eMath.ts); a spec without them draws as before. Values SI in the page’s formula units (C, C/m, C/m², m, N/C); the constant from `k` (default 8.99 × 10⁹) or `eps0` for pages that write ε₀ (one sets the other). A "?" box draws nothing for its value.',
        'Fields: { kind: "charges", k? | eps0?, gauss: { shape: "sphere" | "line" | "plane", Q (Q, λ or σ), r?, R? (a ball or solid cylinder; the sphere adds an E(r) graph), E?, flux?, enclosed?, between? (plane: σ/ε₀ between two opposite sheets, drawn edge-on beside), region?: "inside" | "outside" (the page’s rule for one side of R; r on the other draws faded with the reason) } } | { kind: "charges", k? | eps0?, distribution: "ring" | "disk" | "image", charge (Q, σ or q), z (axial distance, or the height d), radius? (ring, disk), field? (E_z), potential? (ring V), sheet? (disk 2πkσ, dashed beside E), force?, density? (σ₀), induced? }. Drags: r on the Gaussian sphere and cylinder, z on the axis.',
        'Harness (picturesHe2e.ts): E (signed) from each surface’s rule, Q_enc and Φ = Q_enc/ε₀; E × area = Q_enc/ε₀ on the drawn surface (sphere, cylinder, pillbox); between = σ/ε₀; the ring’s V and E_z; the disk’s E_z and 2πkσ; the image is −q at −d and the field meets the plane square; F = kq²/(2d)², σ₀ = −q/(2πd²), induced −q.',
        'Example (university-2#0 main): { kind: "charges", gauss: { shape: "sphere", Q: "Q", R: "R", r: "r", E: "E", flux: "Phi", region: "outside" }, k: 8.99e9 }; inside the ball: region "inside" with enclosed. electromagnetism#0~images: { kind: "charges", distribution: "image", charge: "q", z: "d", force: "F", density: "s0", induced: "Qi", k: 8.99e9 }. Each gallery demo is a full page to copy.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-charges-gauss-sphere',
      'g.he-charges-gauss-sphere-inside',
      'g.he-charges-gauss-line',
      'g.he-charges-gauss-line-eps',
      'g.he-charges-gauss-plane',
      'g.he-charges-ring',
      'g.he-charges-disk',
      'g.he-charges-disk-near',
      'g.he-charges-image',
    ],
  },
];
