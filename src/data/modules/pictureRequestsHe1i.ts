/**
 * College pictures, round 1, group I (docs/RENDERINGS_HE.md). Spread into
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

const ENVELOPE = '"phaseEnvelope"';
const SUBSTANCE = '"substance"';

export const HE1I_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC8',
      'phaseEnvelope',
      'Phase diagrams: a binary’s Pxy, Txy and x–y (McCabe–Thiele) diagrams; any one-component substance with its vapor curve by Clausius–Clapeyron and the phase rule',
      {
        'he.engineering.chemical-thermodynamics#2': ENVELOPE,
        'he.engineering.chemical-thermodynamics#2~dew': ENVELOPE,
        'he.engineering.chemical-thermodynamics#2~flash': ENVELOPE,
        'he.engineering.chemical-thermodynamics#2~margules': ENVELOPE,
        'he.engineering.separations#0': ENVELOPE,
        'he.engineering.separations#0~min-reflux': ENVELOPE,
        'he.engineering.separations#0~operating-line': ENVELOPE,
        'he.engineering.separations#0~mccabe-thiele': ENVELOPE,
        'he.engineering.separations#1': ENVELOPE,
        'he.engineering.separations#1~min-liquid': ENVELOPE,
        'he.chemistry.physical-1#1': SUBSTANCE,
        'he.chemistry.physical-1#1~raoult': ENVELOPE,
        'he.chemistry.physical-1#1~clapeyron': SUBSTANCE,
        'he.chemistry.physical-1#1~phase-rule': SUBSTANCE,
      },
      [
        'From ACC-P30 (phaseEnvelope) and C-P8 (chemDiagram phase options; its `binary` is the Pxy mode here).',
        'phaseEnvelope (new kind). Pxy: { kind: "phaseEnvelope", mode: "Pxy", names?: [light, heavy], unit? (default mmHg), T? (°C, caption), p1, p2, tie?: "bubble" | "dew" | "flash", x?, y?, P?, z?, vf?, K?: [K1, K2], margules? (A, Raoult dashed), gammas?: [g1, g2] }. Example (chemical-thermodynamics#2 main): { mode: "Pxy", names: ["benzene", "toluene"], T: "T", p1: "P1", p2: "P2", x: "x1", y: "y1", P: "P" }; ~dew adds tie: "dew"; ~flash tie: "flash", z: "z1", vf: "VF", K: ["K1", "K2"]; ~margules p1: 1021, p2: 406.7, margules: "A", x: "x1", gammas: ["g1", "g2"]; physical-1#1~raoult unit: "torr".',
        'Txy: { mode: "Txy", names?, antoine: [[A, B, C], [A, B, C]] (mmHg, °C), P, tie?, x?, y?, T? } (the bubble temperature page, type P, once N2 solves T).',
        'xy: { mode: "xy", alpha? or m?, xD?, xB?, xF?, q? (default 1), R?, Rmin?, slope?, intercept?, steps?: "total" | "stages", stages?, feedStage?, minStages?, absorber?: { yIn, yOut, xIn, LG? or A?, LGmin?, N? } }. separations#0 main: { alpha: "alpha", xD: "xD", xB: "xB", steps: "total", minStages: "Nmin" }; ~min-reflux: { alpha, xF, xD, q: 1, R, Rmin }; ~operating-line: { alpha: 2.5, R, xD, slope, intercept }; ~mccabe-thiele: { alpha, xF, q, xD, xB, R, steps: "stages", stages: "stages", feedStage: "feed" } (the count from the picture’s own stepping: distillationStairs in reps/phaseEnvelopeMath.ts, as the demo’s relation does, N7); separations#1 main: { m: "m", absorber: { yIn, yOut, xIn, A: "A", N: "N" } }; ~min-liquid: { m, absorber: { yIn, yOut, xIn, LG, A, LGmin } }.',
        'chemDiagram mode "phase" option substance: { name?, unit? (default atm), triple: [T, P], critical: [T, P], normalBoiling? (K at atm), atm? (default 1), meltSlope? (unit per K), sublimation?: [T, P], points?: [[T, P], …], zoom?: "melting", rule?: { components?, phases?, freedom?, at? } }. physical-1#1 main: { kind: "chemDiagram", mode: "phase", substance: { name: "Water", triple: [273.16, 0.00604], critical: [647.1, 217.7], meltSlope: -133, sublimation: [253.15, 0.00102], points: [["T1", "P1"], ["T2", "P2"]] } }; ~clapeyron: the same water with meltSlope: "slope", zoom: "melting"; ~phase-rule: water with normalBoiling: 373.15 and rule: { components: "C", phases: "P", freedom: "F" } (the point placed by P: 3 the triple point, 2 the vapor curve, 1 the liquid).',
        'Checks (harness/picturesHe1i.ts): bubble above dew in Pxy (dew above bubble in Txy); y₁ ≥ x₁ for the more volatile; P, y, x, K, V ÷ F and γ as drawn; the stairs drawn equal stages and the feed stage, N_min rounded up and Kremser’s N rounded up; operating lines cross on the q-line; R_min’s line passes the pinch; the vapor curve passes every point and rises; F = C − P + 2.',
      ].join(' '),
    ),
  },
];
