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
  {
    id: 'HC22',
    kind: 'bode',
    what: 'A Bode plot: gain in dB over phase on a log-frequency axis, asymptotes dashed, corners, a marked frequency, PM and GM, an op-amp closed loop',
    pages: [
      `${EC}circuits-2#2`,
      `${EC}circuits-2#2~high-pass`,
      `${EC}circuits-2#2~band-pass`,
      `${EC}control-systems#3`,
      `${EC}control-systems#3~asymptotes`,
      `${EC}control-systems#3~gain-margin`,
      `${EC}electronics#3`,
      `${EC}electronics#3~active-lowpass`,
    ],
    status: 'drawn',
    gallery: [
      'g.he-bode-low-pass',
      'g.he-bode-low-pass-far',
      'g.he-bode-high-pass',
      'g.he-bode-band-pass',
      'g.he-bode-phase-margin',
      'g.he-bode-asymptotes',
      'g.he-bode-gain-margin',
      'g.he-bode-op-amp',
      'g.he-bode-active-low-pass',
    ],
    notes: [
      'From EC-P7 (HE-electrical-computer-P7). New kind `bode` (BodeSpec in typesHe2a.ts, drawn by Bode.tsx, math in bodeMath.ts, checked by bodeIssues in harness/picturesHe2a.ts).',
      "Fields: gain? (K, root form: K·s^(−n)·Π(s + z) ÷ Π(s + p) ÷ Π(s² + (ω₀/Q)s + ω₀²), s = jf) or dc? (the passband gain: dc·Π(1 + s/z) ÷ Π(1 + s/p); negative inverts, phase from 180°); poles?, zeros? (positive corner frequencies, in the axis's unit); pairs?: [{ freq, q? | zeta? }]; integrators? (poles at 0; −1 for a zero there, a high-pass); unit? ('Hz', 'kHz', 'rad/s'; default the `at` variable's unit); cornerNames?; at? (a marked frequency, dragged along the axis); read?: { db?, ratio?, phase?, asymptote? } (checked to 0.1 dB and 0.5°); crossover?: { freq?, margin? } (ω_c and PM, checked); margin?: { freq?, gain?, db? } (ω₁₈₀ and GM, checked); closed?: { gain, bandwidth? } (an op-amp's closed-loop gain under GBW ÷ f, checked bandwidth = K ÷ G); phase?: false (magnitude only); fixed?, keep?. Each field is a number or a variable id; corners and `at` share one unit.",
      "Example (circuits-2#2): { kind: 'bode', dc: 1, poles: ['fc'], cornerNames: ['f_c'], at: 'f', read: { ratio: 'H', db: 'G', phase: 'phi' } }. ~high-pass: { gain: 1, integrators: -1, poles: ['fc'], … }. ~band-pass: { gain: 'B', integrators: -1, pairs: [{ freq: 'f0', q: 'Q' }], at: 'f0', fixed: true }.",
      "Example (control-systems#3): { kind: 'bode', gain: 'K', integrators: 1, poles: ['a'], unit: 'rad/s', crossover: { freq: 'wc', margin: 'PM' } }. ~gain-margin: { gain: 'K', integrators: 1, poles: ['a', 'b'], unit: 'rad/s', margin: { freq: 'w180', gain: 'GM', db: 'GMdb' } } (the page takes the poles 1 and 2 as values a, b).",
      "Example (electronics#3): { kind: 'bode', gain: 'GBW', integrators: 1, unit: 'kHz', closed: { gain: 'G', bandwidth: 'f3' }, phase: false } (GBW, f₃dB and f_max in kHz). ~active-lowpass: { dc: 'A', poles: ['fc'], at: 'fc', fixed: true }.",
    ].join(' '),
  },
];
