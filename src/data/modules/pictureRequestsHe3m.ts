/**
 * College pictures, round 3, group M (docs/RENDERINGS_HE.md). Spread into
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

export const HE3M_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC75',
      'aquifer',
      'A cross-section of an aquifer: two wells L apart with the water table (or a potentiometric surface over a confining clay) falling Δh, flow from high head to low and the face of area A; one piezometer with z and the pressure head stacked to h; a pumped confined aquifer with the Thiem cone of depression through two observation wells',
      {
        'he.earth-science.hydrology#2': '"section"',
        'he.earth-science.hydrology#2~head': '"head"',
        'he.earth-science.hydrology#2~thiem': '"well"',
      },
      [
        'From EG-P17 (new kind `aquifer`). Sand, clay, water and the steel casings are painted; values in the plan’s units (m, m/day, m², m³/day, days, kPa).',
        'Fields: { kind: "aquifer", mode: "section", drop (Δh), length (L), conductivity?, area?, gradient?, discharge?, flux?, porosity?, velocity?, time?, confined? }; { mode: "head", elevation (z), pressureHead? (ψ), pressure? (kPa), head? (h), weight? (γ = ρg in kN/m³, default 9.81; the page passes its own) }; { mode: "well", thickness (b), r1, r2, h1, h2, rate? (Q), conductivity? (K) }.',
        'hydrology#2 main: { mode: "section", drop: "dh", length: "L", conductivity: "K", area: "A", gradient: "i", discharge: "Q", flux: "q", porosity: "n", velocity: "v", time: "t" } (add confined: true for a confined aquifer); ~head: { mode: "head", elevation: "z", pressure: "p", pressureHead: "psi", head: "h", weight: 9.81 }; ~thiem: { mode: "well", thickness: "b", r1: "r1", r2: "r2", h1: "h1", h2: "h2", rate: "Q", conductivity: "K" }.',
        'The section stretches heights × X (1, 2 or 5 × 10ⁿ, written in the caption) so a gentle gradient shows; lengths along the ground are to scale. The well mode draws heads on a stretched band above the confining clay, solid between r₁ and r₂. The ~thiem page should keep h₂ − h₁ ≥ 0.01 m and r₂ > r₁ (as the demo’s limits do).',
        'Checks (harness/picturesHe3m.ts): i = Δh ÷ L, Q = KAi, q, v = q ÷ n, t = L ÷ v; the drawn slope i × X readable; flow from high head to low; ψ = p ÷ γ, h = z + ψ; the Thiem curve passes both observed heads and falls toward the well; Q by Thiem.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-aquifer-section',
      'g.he-aquifer-section-confined',
      'g.he-aquifer-section-steep',
      'g.he-aquifer-head',
      'g.he-aquifer-head-deep',
      'g.he-aquifer-well',
      'g.he-aquifer-well-wide',
    ],
  },
  {
    ...ask(
      'HC76',
      'refraction',
      'A seismic or radar survey in section with its travel-time graph: two layers with the direct, head-wave (i_c marked) and reflected rays and the t–x lines crossing at x_c; a reflector with the hyperbola t(x), t₀ and the moveout; ground-penetrating radar with depth beside two-way time',
      {
        'he.earth-science.geophysics#0': '"refraction"',
        'he.earth-science.geophysics#0~reflection': '"reflection"',
        'he.earth-science.geophysics#3~gpr': '"gpr"',
      },
      [
        'From EG-P20 (new kind `refraction`). Depths and offsets share one scale, so every ray angle is true; rock painted, the graph flat.',
        'Fields: { kind: "refraction", mode: "refraction", v1, v2 (m/s), crossover? (x_c, m), depth? (h), critical? (i_c, °), intercept? (tᵢ, ms) }; { mode: "reflection", depth (h), speed (v), offset (x), t0?, time?, moveout? (s) }; { mode: "gpr", permittivity (εᵣ), time (two-way, ns), speed? (m/ns), depth? (m), light? (c in m/ns, default 0.3: the page passes its own) }.',
        'geophysics#0 main: { mode: "refraction", v1: "v1", v2: "v2", crossover: "xc", depth: "h", critical: "ic", intercept: "ti" } (the page refuses v₂ ≤ v₁: no head wave; the picture fades and says why); ~reflection: { mode: "reflection", depth: "h", speed: "v", offset: "x", t0: "t0", time: "t", moveout: "dt" }; geophysics#3~gpr: { mode: "gpr", permittivity: "eps", time: "t", speed: "v", depth: "d", light: 0.3 }.',
        'Checks (harness/picturesHe3m.ts): i_c = sin⁻¹(v₁ ÷ v₂); h from x_c; the direct and head-wave lines cross at x_c; tᵢ = 2h cos i_c ÷ v₁ (ms); t₀ = 2h ÷ v, t(x) = √(x² + 4h²) ÷ v, Δt = t − t₀, never below t₀; v = c ÷ √εᵣ, d = vt ÷ 2, εᵣ ≥ 1.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-refraction',
      'g.he-refraction-small-contrast',
      'g.he-refraction-reflection',
      'g.he-refraction-reflection-far',
      'g.he-refraction-gpr',
      'g.he-refraction-gpr-wet',
    ],
  },
];
