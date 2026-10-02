/**
 * College pictures, round 3, group A (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages, as `pictureRequestsHs.ts` writes them. */
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

export const HE3A_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC42',
      'functionGraph',
      "functionGraph family 'distribution': Maxwell's speeds with vₚ, ⟨v⟩, vᵣₘₛ (a second gas or T dashed); Planck's curves with λ_max and the visible band; the Fermi–Dirac, Bose–Einstein and Boltzmann occupancies with the point at x",
      [
        'he.physics.thermal-statistical#2~speeds',
        'he.physics.thermal-statistical#3',
        'he.physics.thermal-statistical#3~photon-gas',
        'he.chemistry.gen-chem-1#2~kinetic',
        'he.engineering.heat-transfer#2~blackbody',
      ],
      [
        'From P-P28, C-P10 (speeds), ME-P14 (blackbody). Fields (DistributionHe3a, typesHe3a.ts); the window is chosen from the values unless the page sets `window`; name the axes with their units.',
        "distribution 'maxwell' { molar (g/mol), T (K), R? (default 8.314), gas?, compare?: { molar?, T?, gas? }, speeds?: { vp?, avg?, rms? }, yScale? (default 1000: f in 10⁻³ s/m) } — f(v), the three speeds dashed up to the curve and named above the peak; the page's speeds checked against √(2RT/M), √(8RT/πM), √(3RT/M) and the area against 1. Example (thermal-statistical#2~speeds): { kind: 'functionGraph', family: 'distribution', distribution: 'maxwell', molar: 'M', T: 'T', R: 'R', compare: { T: 'T2' }, speeds: { vp: 'vp', avg: 'vavg', rms: 'vrms' }, name: 'f', input: 'v', axes: { x: 'Speed v (m/s)', y: 'f(v) (10⁻³ s/m)' }, fixed: true }; gen-chem-1#2~kinetic passes speeds: { rms: 'u' } and compare: { molar: 'M2', gas: 'He' }.",
        "distribution 'planck' { T, others?: [T…] (dashed), wien? (b in μm·K, default 2898; the curve's C₂ follows it), unit?: 'μm' | 'nm', peak? (the page's λ_max in that unit), visible? (default on), yScale? (default 10⁻⁶: MW/(m²·μm), or kW/(m²·nm) on an nm axis; 1 for W/(m²·μm)) } — each curve with λ_max = b ÷ T dashed and its T named, the visible band tinted in six spectrum strips and named. Example (thermal-statistical#3~photon-gas): { family: 'distribution', distribution: 'planck', T: 'T', others: ['T2'], wien: 'b', unit: 'nm', peak: 'lmax', name: 'E', input: 'λ', axes: { x: 'Wavelength λ (nm)', y: 'E_bλ (kW/(m²·nm))' }, fixed: true }; heat-transfer#2~blackbody: unit μm, peak in μm (yScale 1 for a cool surface).",
        "distribution 'occupancy' { energy? (E − μ, eV), T?, kB? (default 8.617 × 10⁻⁵ eV/K), or x?; fd?, be?, mb? (the page's three, checked) } — Fermi–Dirac solid, Bose–Einstein dashed, Boltzmann dotted against x = (E − μ) ÷ k_BT, each named, the point at x on all three. Example (thermal-statistical#3): { family: 'distribution', distribution: 'occupancy', energy: 'dE', T: 'T', kB: 'kB', fd: 'fFD', be: 'fBE', mb: 'fMB', name: 'f', input: 'x', axes: { x: 'x = (E − μ) ÷ k_BT', y: 'Occupancy f' }, fixed: true }.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-maxwell',
      'g.he-functionGraph-maxwell-kinetic',
      'g.he-functionGraph-planck',
      'g.he-functionGraph-planck-room',
      'g.he-functionGraph-occupancy',
      'g.he-functionGraph-occupancy-near',
    ],
  },
  {
    ...ask(
      'HC45',
      'functionGraph',
      "functionGraph numerical methods: Newton's tangents, bisection's brackets, Lagrange's polynomial through ringed nodes, the trapezoid and Simpson's rule, Euler, Heun and RK4 points over the exact curve",
      [
        'he.engineering.numerical-methods#0',
        'he.engineering.numerical-methods#0~bisection',
        'he.engineering.numerical-methods#2',
        'he.engineering.numerical-methods#3',
        'he.engineering.numerical-methods#4',
      ],
      [
        'From ME-P9 (methods). Options (FunctionGraphHe3a, typesHe3a.ts), each off unless set; Newton and bisection zoom to the iterates or the bracket unless the page sets `window`.',
        "newton: { x0, steps?, next? } — for each step the tangent at (xₖ, f(xₖ)) to the axis, xₖ ringed and named where there is room (the caption lists them all); next is the page's last iterate (checked). Example (numerical-methods#0): { family: 'polynomial', coefficients: ['c3', 'c2', 'c1', 'c0'], newton: { x0: 'x0', steps: 'k', next: 'xk' }, fixed: true }.",
        "bisect: { a, b, steps?, mid? } — each bracket a row under the axis, its midpoint dotted with the sign of f there, a dashed line up to f(m); mid is the page's last midpoint (checked). Example (~bisection): { family: 'polynomial', coefficients: [1, 0, -1, -3], bisect: { a: 'a', b: 'b', steps: 'k', mid: 'mk' } }.",
        "riemann.side: 'trapezoid' | 'simpson' — trapezoids (or Simpson's parabolic panel pairs) in place of rectangles, the nodes dotted; sum is the page's T or S (checked by the H106 check through riemannOf, and independently). Example (numerical-methods#3): { family: 'power', a: 'kc', p: 'p', riemann: { n: 'n', from: 'a', to: 'b', side: 'trapezoid', sum: 'T' } }.",
        "steps: { method: 'euler' | 'heun' | 'rk4', dy, h, n, y0, x0?, last? } — dy is y′ in x, y and value ids (the HC10 grammar, x for t); the points joined over the exact curve (the family), the last named; Euler is eulerSteps (fieldPlotMath.ts). Example (numerical-methods#4): { family: 'exponential', a: 'y0', r: 'k', steps: { method: 'euler', dy: 'k*y', h: 'h', n: 'n', y0: 'y0', last: 'yE' }, input: 't', name: 'y', xMin: 0, fixed: true }; ~rk4 and ~heun pass n: 1.",
        "through: [{ x, y }…] — nodes ringed and labelled (checked on the curve); with family 'lagrange' { through } the curve is the interpolating polynomial, its expanded form in the legend. Example (numerical-methods#2): { family: 'lagrange', through: [{ x: 'x0', y: 'y0' }, { x: 'x1', y: 'y1' }, { x: 'x2', y: 'y2' }], at: { x: 'X', y: 'Y' } }.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-newton',
      'g.he-functionGraph-bisect',
      'g.he-functionGraph-interpolate',
      'g.he-functionGraph-trapezoid',
      'g.he-functionGraph-simpson',
      'g.he-functionGraph-euler',
      'g.he-functionGraph-euler-unstable',
      'g.he-functionGraph-rk4',
      'g.he-functionGraph-heun',
    ],
  },
  {
    ...ask(
      'HC92',
      'functionGraph',
      "functionGraph family 'quantizer': an ADC's or a DAC's staircase, the input's step lit, 1 LSB bracketed, zoomed to 16 codes round it past 16 steps",
      [
        'he.engineering.embedded-systems#0',
        'he.engineering.embedded-systems#0~dac',
        'he.engineering.signals-systems#4~quantization',
      ],
      [
        "From EC-P26. Fields (QuantizerHe3a, typesHe3a.ts): { family: 'quantizer', bits, vref, mode?: 'adc' | 'dac', vin? (adc), code? (adc: the page's D, checked; dac: the code typed), back? (D × LSB, checked), lsb? (checked, V), rounding?: 'truncate' | 'round' }.",
        'Up to 16 steps the whole staircase; past that a zoom of 16 codes round the lit one (the caption says so). The lit tread heavy, 1 LSB bracketed under it, the input dashed up to it and across to the axis, D (or V_out) named. A "?" input draws no lit step.',
        "Example (embedded-systems#0): { kind: 'functionGraph', family: 'quantizer', bits: 'n', vref: 'Vref', vin: 'Vin', code: 'D', back: 'Vb', name: 'D', input: 'V', axes: { x: 'Input V_in (V)', y: 'Code D' }, fixed: true }; ~dac: { mode: 'dac', bits: 'n', vref: 'Vref', code: 'D', back: 'Vo', name: 'V', input: 'D', axes: { x: 'Code D', y: 'Output V_out (V)' } }; signals-systems#4~quantization passes the range as vref.",
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-functionGraph-quantizer-adc',
      'g.he-functionGraph-quantizer-dac',
      'g.he-functionGraph-quantizer-levels',
    ],
  },
];
