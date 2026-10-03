/**
 * College pictures, round 4, group M (docs/RENDERINGS_HE.md). Spread into
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

const E = 'he.engineering.';

export const HE4M_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC174',
      'soilPhases',
      'A soil’s phase diagram: one block cut into air, water and solids to scale (Vₛ = 1, V_w = Se, V_v = e), volumes on the left, weights or masses on the right',
      [`${E}soil-mechanics#0`, `${E}soil-mechanics#1~sand-cone`],
      [
        'From ACC-P16. New kind (typesHe4m.ts SoilPhasesSpec, reps/SoilPhases.tsx, sums in reps/he4mMath.ts).',
        "Fields: { kind: 'soilPhases', Gs?, w? (%), S?, e? (left out: wG_s ÷ S), gammaW? (the page's γ_w; left out, weights are written in γ_w), porosity?, dryUnitWeight?, unitWeight? (checked), volume? (the block's V; left out, Vₛ = 1 m³), mass? (a total mass: masses on the right, M_s = M ÷ (1 + w)), density?, dryDensity? (checked), volumeUnit?, weightUnit? }.",
        'The solids are painted sand, the water water, the air pale; each phase’s volume and weight led to it, totals V and W under the block, the working in the caption. A "?" draws nothing for that value (no split while e cannot be found); S above 1 draws faded with the reason. No handles.',
        "Example (main): { kind: 'soilPhases', Gs: 'Gs', w: 'w', S: 'S', e: 'e', gammaW: 9.81, porosity: 'n', dryUnitWeight: 'gd', unitWeight: 'g' }. Example (~sand-cone): { kind: 'soilPhases', Gs: 'Gs', w: 'w', e: 'e', volume: 'V', mass: 'mwet', density: 'rho', dryDensity: 'rhoD' } (the demo adds G_s and e = G_sρ_w ÷ ρ_d − 1 to split the hole's volume; a page without G_s draws the block whole).",
        'Harness (harness/picturesHe4m.ts): the drawn void ÷ solid height is e, water ÷ voids is S, Se = wG_s; n = e ÷ (1 + e), γ_d = G_sγ_w ÷ (1 + e), γ = γ_d(1 + w); ρ = M ÷ V (up to a unit change), ρ_d = ρ ÷ (1 + w).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-soilPhases-main', 'g.he-soilPhases-saturated', 'g.he-soilPhases-sand-cone'],
  },
  {
    ...ask(
      'HC175',
      'losScale',
      'Level of service by density: a bar cut into bands A–F with the letters and bounds printed, the segment’s density marked and its band outlined; above it a mile of one lane with that many cars',
      [`${E}transportation#3`],
      [
        'From ACC-P23. New kind (typesHe4m.ts LosScaleSpec, reps/LosScale.tsx, the bands in reps/he4mMath.ts).',
        "Fields: { kind: 'losScale', density (D), flow? (v_p), speed? (S), bounds? (A–E upper densities; default HCM 7th edition basic freeway 11, 18, 26, 35, 45 pc/mi/ln), unit? (default the density's unit), length? (default '1 mi') }.",
        'The bar runs from 0 past the larger of 55 and D; the letter is printed in every band, the bounds under the cuts, the density marked by a triangle and ticks with its value, its band outlined and the others paler. The lane above shows round(D) painted cars evenly spaced (at most 90; past that the caption says the lane is full). A "?" density marks nothing and draws no cars. No handles. The page’s LOS letter is the picture’s (a letter value waits on N5).',
        "Example: { kind: 'losScale', density: 'D', flow: 'vp', speed: 'S' } on a page with unitSystems ['us'] (v_p in pc/h/ln, S in mi/h, D in pc/mi/ln).",
        'Harness (harness/picturesHe4m.ts): D = v_p ÷ S; the bounds rise; the band marked holds D.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-losScale-freeway', 'g.he-losScale-breakdown'],
  },
  {
    ...ask(
      'HC180',
      'oneLine',
      'A one-line diagram (generator, transformer, line, buses as bars, a load arrow) with a fault bolt on a bus, each element written with its jX in pu; under it the reactance diagram summed to X_th, or the three sequence networks in series for a line-to-ground fault',
      [`${E}power-systems#2`, `${E}power-systems#2~slg`],
      [
        'From EC-P13. New kind (typesHe4m.ts OneLineSpec, reps/OneLine.tsx).',
        "Fields: { kind: 'oneLine', elements: [{ type: 'generator' | 'transformer' | 'line' | 'source', x? (pu), name? }], fault? ('3φ' | 'slg'), faultBus? (from 1, default the last), load? (default drawn), vf?, xth? (checked: the sum of the elements before the faulted bus), current? (checked: V_f ÷ X_th, or 3V_f ÷ (X₁ + X₂ + X₀)), sequence?: { x1, x2, x0 }, base?: { s (MVA), v (kV), iBase? (A), iKA?, mva? } (checked) }.",
        "A page that types X_th alone can pass one element { type: 'source', name: 'Grid', x: 'Xth' }. A \"?\" reactance is left unlabelled and no sum is written; a \"?\" V_f writes no current. Flat; no handles.",
        "Example (main): { kind: 'oneLine', elements: [{ type: 'generator', name: 'G', x: 'Xg' }, { type: 'transformer', name: 'T', x: 'Xt' }, { type: 'line', name: 'Line', x: 'Xl' }], fault: '3φ', vf: 'Vf', xth: 'Xth', current: 'If', base: { s: 'Sbase', v: 'Vbase', iBase: 'Ibase', iKA: 'IkA', mva: 'Sf' } }. Example (~slg): the same elements without x, fault: 'slg', current: 'Ia', sequence: { x1: 'X1', x2: 'X2', x0: 'X0' }.",
        'Harness (harness/picturesHe4m.ts): ΣX to the fault = X_th; I_f = V_f ÷ X_th (or I_a = 3V_f ÷ ΣX); I_base = S ÷ (√3V) in A, I_kA = I_f I_base ÷ 1000, fault MVA = V_f I_f S_base.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-oneLine-three-phase', 'g.he-oneLine-generator-bus', 'g.he-oneLine-slg'],
  },
  {
    ...ask(
      'HC181',
      'rfSpectrum',
      'A tone-modulated carrier: the signal in time with its dashed envelope above, and its spectrum to scale below (AM’s carrier and two sidebands of height μ ÷ 2; FM’s lines every f_m of height |J_n(β)|) with the bandwidth bracketed',
      [`${E}communication-systems#0`, `${E}communication-systems#0~fm`],
      [
        'From EC-P15. New kind (typesHe4m.ts RfSpectrumSpec, reps/RfSpectrum.tsx, Bessel lines in reps/he4mMath.ts, computed by the integral, never a table).',
        "Fields: { kind: 'rfSpectrum', mode ('am' | 'fm'), fm, fc? (left out, the axis is f − f_c), mu? (AM), deviation? (FM Δf), beta? (checked), bandwidth? (checked), carrierPower?, sidebandPower?, totalPower?, efficiency? (%; checked), unit? (default fm's unit) }.",
        'AM: the envelope 1 ± μ to scale, the carrier height 1 and each sideband μ ÷ 2 written, the sideband frequencies under them; μ above 1 draws faded (overmodulation). FM: constant envelope, the crests bunching; lines out to β + 3, |J₀| written; Carson’s band 2(Δf + f_m) bracketed. The carrier is drawn 11 cycles a message cycle (said in the caption). A "?" μ or β draws no signal or lines. No handles. A page should keep β ≤ 25 (the demo’s β has max 25).',
        "Example (main): { kind: 'rfSpectrum', mode: 'am', fc: 'fc', fm: 'fm', mu: 'mu', bandwidth: 'B', carrierPower: 'Pc', sidebandPower: 'Psb', totalPower: 'Pt', efficiency: 'eta' } (the demo marks fm, B, fc and the sideband frequencies `standalone`: the powers and the frequencies meet only in the picture). Example (~fm): { kind: 'rfSpectrum', mode: 'fm', fm: 'fm', deviation: 'df', beta: 'beta', bandwidth: 'B' }.",
        'Harness (harness/picturesHe4m.ts): AM B = 2f_m and the drawn sideband heights squared give P_sb = P_cμ² ÷ 2, P_t, η; FM β = Δf ÷ f_m, B = 2(β + 1)f_m (the bracket) and Σ J_n² = 1 over the drawn lines.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-rfSpectrum-am',
      'g.he-rfSpectrum-am-full',
      'g.he-rfSpectrum-fm',
      'g.he-rfSpectrum-fm-narrow',
    ],
  },
  {
    ...ask(
      'HC182',
      'complexPlane',
      'A digital modulation’s constellation on the I–Q plane: M points (PSK on a circle, square QAM on a grid), each labelled with its Gray-coded bits, the decision boundaries dashed',
      [`${E}communication-systems#1`],
      [
        'From EC-P16. New option on complexPlane (typesHe4m.ts ComplexPlaneHe4m, reps/ConstellationHe4m.tsx, points in reps/he4mMath.ts); without `constellation` the plane is unchanged.',
        "Fields: { kind: 'complexPlane', z: { re: 0, im: 0 } (not drawn), j?: true, constellation: { M, kind? ('psk' | 'qam'; default PSK to 8, QAM above), symbolRate?, bitRate?, rolloff?, bandwidth?, efficiency? (checked) } }.",
        'PSK: M = 2 on the real axis, otherwise offset π ÷ M (QPSK at 45°), the boundaries the rays halfway between, the spacing written. QAM: a √M × √M grid, the label the column’s Gray code then the row’s, the boundaries the lines between. Labels to 16 points; 64 and 256 draw points and thin boundaries and say so. A "?" M draws no points. No handles: M comes from its `allowed` list (2, 4, 8, 16, 64, 256).',
        "Example: { kind: 'complexPlane', z: { re: 0, im: 0 }, j: true, constellation: { M: 'M', symbolRate: 'Rs', bitRate: 'Rb', rolloff: 'alpha', bandwidth: 'B', efficiency: 'eta' } }.",
        'Harness (harness/picturesHe4m.ts): M points, all apart, each label log₂M bits and all different; every pair of nearest neighbours differs in one bit; R_b = R_s log₂M, B = R_s(1 + α), η = R_b ÷ B.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-complexPlane-constellation-qam',
      'g.he-complexPlane-constellation-psk',
      'g.he-complexPlane-constellation-256',
    ],
  },
];
