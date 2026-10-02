/**
 * College pictures, round 2, group A (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const EC = 'he.engineering.';

export const HE2A_REQUESTS: PictureRequest[] = [
  {
    id: 'HC14',
    kind: 'complexPlane',
    what: 'The complex plane on electrical pages: Z = R + jX with its legs, |Z| and θ; three-phase phasors tip to tail; s-plane poles, zeros and the root locus',
    pages: [
      `${EC}circuits-2#0`,
      `${EC}circuits-2#0~phasor-form`,
      `${EC}circuits-2#0~parallel-rc`,
      `${EC}circuits-2#4`,
      `${EC}circuits-2#4~delta`,
      `${EC}control-systems#0~feedback`,
      `${EC}control-systems#1~dc-gain`,
      `${EC}control-systems#2~root-locus`,
      `${EC}signals-systems#3`,
    ],
    status: 'drawn',
    gallery: [
      'g.he-complex-plane-impedance',
      'g.he-complex-plane-impedance-capacitive',
      'g.he-complex-plane-phasor-form',
      'g.he-complex-plane-phasor-third-quadrant',
      'g.he-complex-plane-parallel-rc',
      'g.he-complex-plane-three-phase-wye',
      'g.he-complex-plane-three-phase-low-pf',
      'g.he-complex-plane-three-phase-delta',
      'g.he-complex-plane-poles-residues',
      'g.he-complex-plane-feedback',
      'g.he-complex-plane-dc-gain',
      'g.he-complex-plane-root-locus',
      'g.he-complex-plane-root-locus-edge',
    ],
    notes: [
      'From EC-P6 (HE-electrical-computer-P6). Options on `complexPlane` (types in typesHe2a.ts, drawn by ComplexPlaneHe2a.tsx whenever one is set; every existing page unchanged).',
      "Fields: j?: true (writes j); axes?: [real name, imaginary name] ('R (Ω)', 'X (Ω)'; 'σ', 'jω'); name?, unit? (z's name and unit at its tip); zMag?, zAngle? (the page's |Z| and θ, −180° to 180°, checked); reactances?: { inductive, capacitive } (jX_L up, −jX_C down, checked X = X_L − X_C); phasors?: [{ mag, angle, negate?, offset?, name ('V_an'), unit?, tail? (drawn from that phasor's tip), ends? (checked: tail + this = that tip), tone?: 'a' | 'b' | 'c' | 'line' | 'current' | 'lit', dashed? }] (a second unit is drawn to its own scale); between?: { from, to, label } (an angle arc); poles?, zeros?: [{ re, im?, neg? (re read as −value), tag?: { name, value } }]; transfer?: { gain, dc } (G(0), checked); terms?: true (x(t) from the tags); locus?: { poles, zeros?, gain (a value or [K, H]), centroid?, breakaway?, closed? } (branches, asymptotes, breakaway, closed-loop poles at the gain, checked; the dominant one drags K). In the phasor and s-plane modes `z` is not drawn: pass z: { re: 0, im: 0 }.",
      "Example (circuits-2#0): { kind: 'complexPlane', z: { re: 'R', im: 'X' }, j: true, axes: ['R (Ω)', 'X (Ω)'], name: 'Z', unit: 'Ω', zMag: 'Z', zAngle: 'theta', reactances: { inductive: 'XL', capacitive: 'XC' }, fixed: true } (the page adds a net reactance X = X_L − X_C).",
      "Example (circuits-2#4): phasors: [{ name: 'V_an', mag: 'Vph', angle: 0, unit: 'V', tone: 'a' }, { name: 'V_bn', mag: 'Vph', angle: -120, unit: 'V', tone: 'b' }, { name: 'V_cn', mag: 'Vph', angle: 120, unit: 'V', tone: 'c' }, { name: 'V_ab', mag: 'VL', angle: 30, unit: 'V', tail: 'V_bn', ends: 'V_an', tone: 'line' }, { name: 'I_a', mag: 'IL', angle: 'theta', negate: true, unit: 'A', tone: 'current' }], between: { from: 'V_an', to: 'I_a', label: 'θ' } (the page adds θ = cos⁻¹ pf).",
      "Example (control-systems#2~root-locus): { kind: 'complexPlane', z: { re: 0, im: 0 }, j: true, axes: ['σ', 'jω'], locus: { poles: [{ re: 'p1' }, { re: 'p2' }, { re: 'p3' }], gain: 'K', centroid: 'sa', breakaway: 'sb' } } (the page adds K to show the closed-loop poles). Signals#3: poles: [{ re: 'a', neg: true, tag: { name: 'A', value: 'A' } }, …], zeros: [{ re: 'c', neg: true }], terms: true.",
    ].join(' '),
  },
];
