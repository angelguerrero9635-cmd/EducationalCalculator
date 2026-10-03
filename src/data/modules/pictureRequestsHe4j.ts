/**
 * College pictures, round 4, group J (docs/RENDERINGS_HE.md). Spread into
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

const B = 'he.biology.';
const E = 'he.engineering.';

export const HE4J_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC154',
      'icon',
      'Card icons, tissues: four epithelia, bone, cartilage, blood, fat, three muscles and a neuron with glia, as drawn sections',
      [`${B}anatomy-physiology#0`, `${B}anatomy-physiology#0~epithelia`],
      [
        'From B-P20. Twelve card icons (layouts/icons/he4j.ts names, components/module/layouts/icons/he4j.tsx drawings, a line in each icon index and in docs/LAYOUTS.md), each a section in a round swatch in a slide’s stains: eosin pink cytoplasm, hematoxylin purple nuclei, the basement membrane under every epithelium.',
        "Names: 'simple squamous epithelium', 'simple cuboidal epithelium', 'simple columnar epithelium' (brush border and a goblet cell), 'stratified squamous epithelium' (basal cuboidal cells to flat ones on top), 'compact bone' (an osteon: lamellae, osteocytes, the central canal), 'hyaline cartilage' (chondrocytes in lacunae, some in pairs), 'blood smear' (red cells and a neutrophil), 'adipose tissue' (fat cells, nuclei flat at the edge), 'skeletal muscle tissue' (striated, nuclei at the edge), 'cardiac muscle tissue' (branching, intercalated discs, a central nucleus), 'smooth muscle tissue' (spindles, no striations), 'neuron with glia'.",
        "A card passes { label, bin, figure: { kind: 'icon', icon: 'compact bone' } }. Main: bins epithelial, connective, muscle, nervous; skin’s surface uses 'stratified squamous epithelium'. ~epithelia: the four epithelium icons on cards by place (air sacs, kidney tubules, gut lining, skin). The gallery sorts are both pages, ready to copy.",
        'Check: the layout harness (layoutFigures.test.ts over the two gallery sorts).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: ['g.he-cardIcons-tissues', 'g.he-cardIcons-epithelia'],
  },
  {
    ...ask(
      'HC155',
      'heartPump',
      'The heart as a pump: the left ventricle filled to EDV and emptied to ESV on a mL scale, a minute of beats and the liters pumped, and a pressure gauge with MAP one third up from DBP',
      [`${B}anatomy-physiology#3`, `${B}anatomy-physiology#3~ejection`],
      [
        'From B-P22. New kind (typesHe4j.ts HeartPumpSpec, reps/HeartPump.tsx, the math in reps/he4jMath.ts).',
        "Fields, all optional (a page passes what it has): { kind: 'heartPump', edv?, esv?, sv?, ef? (a share or a percent), hr?, co?, sbp?, dbp?, map?, tpr? }. Volumes in mL, HR per minute (min⁻¹), CO in L/min, pressures in mmHg; a registered unit converts.",
        'Draws the ventricle in section (myocardium painted), its cavity a half ellipsoid on a 250 mL scale whose marks sit at their true levels, blood to ESV and the stroke volume lit up to EDV (dashed); the aorta carrying it out; a metal dial gauge 0–300 mmHg with the DBP–SBP band cut in thirds and the needle at MAP; a minute with one tick a beat (whole beats) and a bar of the liters pumped. A page with no EDV or ESV draws the cavity full and names SV. ESV above EDV draws no levels and says why. A "?" draws nothing for that value. No handles.',
        "Examples: main { kind: 'heartPump', sv: 'sv', hr: 'hr', co: 'co', sbp: 'sbp', dbp: 'dbp', map: 'map', tpr: 'tpr' }; ~ejection { kind: 'heartPump', edv: 'edv', esv: 'esv', sv: 'sv', ef: 'ef', hr: 'hr', co: 'co' }.",
        'Harness (harness/picturesHe4j.ts): SV = EDV − ESV; EF = SV ÷ EDV; CO = HR × SV; MAP = DBP + (SBP − DBP) ÷ 3 with the needle a third of the way round the band; TPR = MAP ÷ CO; each fill level’s volume (an independent sum over the cavity) is its value; a tick a beat.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-heartPump-output',
      'g.he-heartPump-exercise',
      'g.he-heartPump-ejection',
      'g.he-heartPump-failure',
    ],
  },
  {
    ...ask(
      'HC156',
      'footprints',
      'Gait: footprints to scale with the step and stride bracketed and a tick a step at the cadence, the Froude number against the walk–run line; card figure gait, a stick walker at each of six phases',
      {
        [`${E}biomechanics#2`]: '"footprints"',
        [`${E}biomechanics#2~phases`]: '"gait"',
      },
      [
        'From B-P24. New kind (typesHe4j.ts FootprintsSpec, reps/Footprints.tsx) and card figure gait (typesHe4j.ts GaitCard, layouts/gaitCard.tsx, 112 × 76, registered in layouts/types.ts and CardFigure.tsx).',
        "Main: { kind: 'footprints', step, cadence?, stride?, speed?, leg?, froude?, runSpeed?, g? (default 9.81), foot? (m, default 0.26), keep?, fixed? }; lengths in m, cadence in steps a minute, speeds in m/s. Five bare prints on a sand walkway, left and right in turn, foot and steps to one scale; the step bracketed heel to heel and the stride (2 × step) over the prints; a tick a step, labelled with its time (60 ÷ cadence s apart), and v; with leg, a bar of Fr = v² ÷ (gL) against 0.5, the run speed √(0.5gL) in the caption. Drag the second print to change the step. Example: { kind: 'footprints', step: 'step', cadence: 'cadence', stride: 'stride', speed: 'v', leg: 'leg', froude: 'fr', runSpeed: 'vrun', g: 9.81 }.",
        "~phases: a sequence whose stages carry { kind: 'gait', phase } with phase 'heelStrike', 'footFlat', 'midstance', 'heelOff', 'toeOff', 'midswing' (spans 2, 10, 20, 20, 8, 40 % of the cycle); g.he-gait-phases is the page, ready to copy.",
        'Harness: the prints alternate a step apart and the drawn stride is 2 × step; stride = 2 × step; v = step × cadence ÷ 60; Fr = v² ÷ (gL); the run speed gives Fr = 0.5 (harness/picturesHe4j.ts); gait cards come in the cycle’s order (harness/layoutFiguresHe4j.ts).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-footprints-walk',
      'g.he-footprints-run',
      'g.he-footprints-toddler',
      'g.he-gait-phases',
    ],
  },
  {
    ...ask(
      'HC157',
      'springDashpot',
      'Viscoelasticity: a spring and a dashpot in series (Maxwell, stress relaxing at a held strain) or side by side (Kelvin–Voigt, strain creeping under a held stress) beside the curve, τ and 37% or 63% marked',
      [`${E}biomechanics#3`, `${E}biomechanics#3~creep`],
      [
        'From B-P25. New kind (typesHe4j.ts SpringDashpotSpec, reps/SpringDashpot.tsx).',
        "Fields: { kind: 'springDashpot', model: 'maxwell' | 'kelvin', E, eta (η in E's unit × s: MPa, MPa·s), tau? (s), t? (s); Maxwell: strain0? (ε₀), stress0? (σ₀), stress? (σ at t); Kelvin: load? (σ), strain? (ε at t), final? (σ ÷ E); keep?, fixed? }.",
        'Draws the model in steel and oil between hatched walls in its state at t (Maxwell: the spring’s share of the held stretch e^(−t/τ), the dashpot the rest; Kelvin: both stretched to ε, the load arrow under them), beside σ₀e^(−t/τ) or (σ ÷ E)(1 − e^(−t/τ)) to scale with τ dashed to its 37% or 63% level and the point at t labelled. Drag the point to change t. A "?" E or η draws no curve.',
        "Examples: main { kind: 'springDashpot', model: 'maxwell', E: 'E', eta: 'eta', tau: 'tau', t: 't', strain0: 'e0', stress0: 's0', stress: 'sigma' }; ~creep { kind: 'springDashpot', model: 'kelvin', E: 'E', eta: 'eta', tau: 'tau', t: 't', load: 'sigma', strain: 'strain', final: 'final' }.",
        'Harness (harness/picturesHe4j.ts): τ = η ÷ E; the drawn curve at τ reads 1 ÷ e or 1 − 1 ÷ e; σ₀ = Eε₀ and σ = σ₀e^(−t/τ); final = σ ÷ E and ε = final × (1 − e^(−t/τ)).',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-springDashpot-relax',
      'g.he-springDashpot-relax-late',
      'g.he-springDashpot-creep',
      'g.he-springDashpot-creep-early',
    ],
  },
];
