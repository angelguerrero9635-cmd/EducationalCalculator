/**
 * College pictures, round 2, group K (docs/RENDERINGS_HE.md). Spread into
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

const INTEGRATED = '"integrated"';

export const HE2K_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC34',
      'chemDiagram',
      'Rate options on chemDiagram mode rate: integrated rate laws of order 0, 1, 2 with half-lives and the straight-line plot; Arrhenius ln k against 1/T; consecutive reactions A → B → C with B’s peak',
      {
        'he.chemistry.gen-chem-2#0': INTEGRATED,
        'he.chemistry.gen-chem-2#0~second-order': INTEGRATED,
        'he.chemistry.gen-chem-2#0~zero-order': INTEGRATED,
        'he.chemistry.gen-chem-2#0~arrhenius': '"arrhenius"',
        'he.chemistry.physical-1#3': '"consecutive"',
        'he.engineering.reaction-engineering#2': '"consecutive"',
      },
      [
        'From C-P7 (chemDiagram rate options) and ACC-P32 (its `series` mode is `consecutive` here, with notation: "C").',
        'A college rate spec sets one of integrated, arrhenius, consecutive and no `times` (the Grades 9–12 secant): { kind: "chemDiagram", mode: "rate", integrated?: { order: 0 | 1 | 2, k, start, t?, conc?, half? }, arrhenius?: { k1, T1, k2, T2, Ea?, R? (default 8.314) }, consecutive?: { k1, k2, start, t?, tmax?, peak?, at?: [A, B, C], species?: [a, b, c] }, species? (integrated, default A), notation?: "bracket" | "C" }. Units come from the variables (k’s, t’s, [A]₀’s; T in K or °C; Eₐ in kJ/mol or J/mol).',
        'gen-chem-2#0 main: { integrated: { order: 1, k: "k", start: "A0", t: "t", conc: "A", half: "half" } }; ~second-order: order 2; ~zero-order: order 0 (the run-out time is dashed; the page keeps its t ≤ t_end limit); ~arrhenius: { arrhenius: { k1: "k1", T1: "T1", k2: "k2", T2: "T2", Ea: "Ea" } } (physical-1#3’s Arrhenius part uses the same); physical-1#3 main: { consecutive: { k1: "k1", k2: "k2", start: "A0", t: "t", tmax: "tmax", at: ["A", "B", "C"] } }; reaction-engineering#2 main: { notation: "C", consecutive: { k1: "k1", k2: "k2", start: "CA0", tmax: "tmax", peak: "CBmax" } }.',
        'Checks (harness/picturesHe2k.ts): [A] at t and t½ from the integrated law; half-lives evenly spaced for order 1 and doubling for order 2; order 0 t ≤ [A]₀ ÷ k; Eₐ = −R × slope; t_max and the peak from the formulas, B no higher either side of t_max; [A] + [B] + [C] = [A]₀ at every point; A, B, C at t. Off unless a page sets one of the three: the Grades 9–12 `times` secant is unchanged.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-chemDiagram-rate-first',
      'g.he-chemDiagram-rate-second',
      'g.he-chemDiagram-rate-zero',
      'g.he-chemDiagram-rate-zero-end',
      'g.he-chemDiagram-rate-arrhenius',
      'g.he-chemDiagram-rate-consecutive',
      'g.he-chemDiagram-rate-consecutive-fast',
      'g.he-chemDiagram-rate-series',
    ],
  },
  {
    ...ask(
      'HC36',
      'globe',
      'An orthographic globe with a graticule: the Sun’s rays with the noon angle and the lit part of a parallel; a great-circle route with its central angle and the rhumb line; a plate turning about its Euler pole; a dipole field’s dip; a ring of air carried poleward',
      {
        'he.geography.physical-geography#0': '"sun"',
        'he.geography.physical-geography#0~insolation': '"sun"',
        'he.geography.cartography#1~great-circle': '"route"',
        'he.earth-science.physical-geology#1': '"euler"',
        'he.earth-science.geophysics#1~paleolatitude': '"dipole"',
        'he.geography.climatology#1': '"momentum"',
      },
      [
        'From EG-P3 (new kind `globe`). Angles in degrees, north and east positive; constants from the page (R = 6,371 km and ΩR = 464.6 m/s are defaults a page can pass).',
        'Fields: { kind: "globe", mode: "sun", latitude, declination, noon?, hour? (H), day? (h) }; { mode: "route", lat1, lon1, lat2, lon2, angle? (c), km?, radius? }; { mode: "euler", omega (°/Myr), distance (Δ), speed? (mm/yr), radius? (km) }; { mode: "dipole", inclination, latitude }; { mode: "momentum", latitude, wind? (u, m/s), rim? (ΩR, m/s) }.',
        'physical-geography#0 main: { mode: "sun", latitude: "lat", declination: "dec", noon: "noon", hour: "H", day: "day" } (the demos keep φ inside the polar circles; past them the dial shows 0 or 24 h and the caption says polar night or midnight sun); ~insolation: { mode: "sun", latitude: "lat", declination: "dec", hour: "H" }; cartography#1~great-circle: { mode: "route", lat1: "lat1", lon1: "lon1", lat2: "lat2", lon2: "lon2", angle: "c", km: "d" }; physical-geology#1 main: { mode: "euler", omega: "w", distance: "D", speed: "v" }; geophysics#1~paleolatitude: { mode: "dipole", inclination: "I", latitude: "lat" }; climatology#1 main: { mode: "momentum", latitude: "lat", wind: "u", rim: "rim" }.',
        'Checks (harness/picturesHe2k.ts): noon = 90 − |φ − δ| within 0.1°; H from cos H = −tan φ tan δ and day = 2H ÷ 15, the lit share of the parallel H ÷ 180; the drawn central angle (between the places’ vectors) equals the spherical law of cosines, d = R × c; v = ωR sin Δ; tan I = 2 tan φ; u = ΩR sin²φ ÷ cos φ.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-globe-sun',
      'g.he-globe-sun-december',
      'g.he-globe-sun-arctic',
      'g.he-globe-sun-insolation',
      'g.he-globe-route',
      'g.he-globe-route-pacific',
      'g.he-globe-euler',
      'g.he-globe-euler-far',
      'g.he-globe-dipole',
      'g.he-globe-dipole-south',
      'g.he-globe-momentum',
      'g.he-globe-momentum-high',
    ],
  },
];
