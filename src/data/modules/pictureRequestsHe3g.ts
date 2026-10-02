/**
 * College pictures, round 3, group G (docs/RENDERINGS_HE.md). Spread into
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

export const HE3G_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC43',
      'gasPiston',
      'The piston beside its P–V diagram (isothermal, adiabatic, isobaric, isochoric or a cycle, the work shaded with its sign, isotherms dashed); a van der Waals gas with its own volume, attraction and two gauges',
      [
        `${P}thermal-statistical#0`,
        `${P}thermal-statistical#0~adiabatic`,
        `${C}physical-1#0`,
        `${C}physical-1#0~adiabatic`,
        `${C}gen-chem-1#2~real-gas`,
      ],
      [
        'From P-P27 and C-P11 (pv) and C-P10 (real). Types in typesHe3g.ts, drawn by reps/GasPistonPv.tsx and reps/GasPistonReal.tsx (cylinder and gauge in reps/gasHe3gKit.tsx, sums in reps/gasPvMath.ts), routed by one line each in reps/hsjView.tsx.',
        "Fields: gasPiston (law: 'ideal') with pv: { path: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric' | 'cycle', v1, v2, p1?, p2?, t1?, t2?, moles?, R? (default 8.314 J/(mol·K); 0.08206 gives atm and L·atm), gamma? or cv? (adiabat), work?, heat?, sign?: 'by' (physics W, default) | 'on' (chemistry w), units?: { pressure, work }, corners?: [{ volume, pressure? | temperature? }] and legs? (cycle), keep?, fixed? }; or volume, temperature, moles, R? with real: { a, b, ideal? (P ideal), pressure? (P), z?, gas? }.",
        "Example (thermal-statistical#0): { kind: 'gasPiston', law: 'ideal', pv: { path: 'isothermal', v1: 'V1', v2: 'V2', t1: 'T', moles: 'n', work: 'W', heat: 'Q' } }. Example (physical-1#0~adiabatic): pv: { path: 'adiabatic', v1: 'V1', v2: 'V2', t1: 'T1', t2: 'T2', moles: 'n', cv: 'cv', work: 'w', sign: 'on' }. Example (gen-chem-1#2~real-gas): { kind: 'gasPiston', law: 'ideal', volume: 'V', temperature: 'T', moles: 'n', R: 0.08206, real: { a: 'a', b: 'b', ideal: 'Pid', pressure: 'P', z: 'Z', gas: 'CO₂' } }. The later thermal-statistical#0~cycle passes path: 'cycle' with corners and legs (demo g.he-gasPiston-pv-cycle).",
        'Volumes in L give P in kPa (kPa × L = J). A "?" draws nothing for its state; drag state 2 along the path (v2). Harness (harness/picturesHe3g.ts): shaded area = |W| to 0.1%, W as the page has it (by or on), PV = nRT at each end, P₂ and T₂ by the path, cycle corners on their legs; P ideal, the van der Waals P and Z.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-gasPiston-pv-isothermal',
      'g.he-gasPiston-pv-chemistry',
      'g.he-gasPiston-pv-compress',
      'g.he-gasPiston-pv-adiabatic',
      'g.he-gasPiston-pv-adiabatic-diatomic',
      'g.he-gasPiston-pv-isobaric',
      'g.he-gasPiston-pv-isochoric',
      'g.he-gasPiston-pv-cycle',
      'g.he-gasPiston-real-co2',
      'g.he-gasPiston-real-h2',
    ],
  },
];
