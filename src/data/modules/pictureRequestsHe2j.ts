/**
 * College pictures, round 2, group J (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

const ask = (
  id: string,
  kind: string,
  what: string,
  pages: string[],
  notes?: string,
): PictureRequest => ({
  id,
  what,
  kind,
  pages,
  status: 'requested',
  gallery: [],
  ...(notes ? { notes } : {}),
});

const E = 'he.engineering.';

export const HE2J_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC28',
      'stressStrain',
      'The engineering σ–ε curve (E, 0.2% offset to σ_Y, UTS, necking, fracture), the true curve dashed, resilience or toughness shaded, elastic–perfectly plastic and tissue curves; a specimen in grips; a tube’s section in bending; two members sharing one load',
      [
        `${E}mechanics-of-materials#0`,
        `${E}materials-science#3`,
        `${E}materials-science#3~resilience`,
        `${E}advanced-solid-mechanics#3`,
        `${E}biomechanics#0`,
        `${E}biomechanics#0~bone-bending`,
        `${E}biomaterials#1`,
      ],
      [
        'From HE-mechanical-P5 (`stressStrain`) and HE-biology-P23 (`tensileTest`), one kind. Spec in typesHe2j.ts (`StressStrainSpec`), the curve and the sums in reps/stressStrainMath.ts. Every field is a variable id or a fixed number; a variable is read in its own unit (MPa, GPa, kPa, psi, ksi; mm, m; N, kN; N·m; mm², mm⁴; %) and a fixed number is taken in MPa, mm, N and N·mm. A "?" value draws nothing for that value.',
        "Curve fields: `curve: 'metal' | 'epp' | 'tissue' | 'linear'` (default metal), `E`, `yield` (σ_Y, the 0.2% offset point), `uts`, `uniform` (ε at the UTS, default 0.55ε_f), `fracture` (ε_f), `fractureStress`, the point `strain` and `stress`, `true: true` (σ_T = σ(1 + ε) against ln(1 + ε), dashed, to the UTS), `area: 'resilience' | 'toughness'` with `energy` (U_r or U_T), `toe` (tissue, default 0.02; the page’s ε counts from where the straight part meets the axis), `drag` (a value proportional to the point’s strain, F, P, σ, ε or ΔL, that dragging the point scales). A metal page with a UTS but no `yield` field draws the knee as an unlabelled sketch; a full curve with σ_Y gets an inset with the 0.2% offset.",
        "Pictures beside or instead of the curve: `specimen: { F, A?, d?, L, dL, tissue? }` (the bar or tendon in grips; ΔL drawn larger when too small to see, as the caption says); `section: { shape: 'tube', ro, ri, I?, M?, stress?, solidI?, material? }` (the ring to scale, neutral axis, the C and T block, σ at the edge); `parallel: { E1, A1, E2, A2, F?, share?, stress2?, names? }` (two bonded members under one plate, each as wide as its share).",
        "Examples: MoM#0 `{ kind: 'stressStrain', curve: 'linear', E: 'E', strain: 'eps', stress: 's', drag: 'P', specimen: { F: 'P', A: 'A', d: 'd', L: 'L', dL: 'dL' } }`; materials-science#3 `{ curve: 'metal', uts: 'UTS', fracture: 'EL' }` (~true: `{ curve: 'metal', uts: 's', uniform: 'e', true: true }`); ~resilience `{ curve: 'metal', E: 'E', yield: 'sy', area: 'resilience', energy: 'Ur' }`; ASM#3 `{ curve: 'epp', E: 200000, yield: 'sy' }`; biomechanics#0 `{ curve: 'tissue', E: 'E', strain: 'eps', stress: 's', drag: 'F', specimen: { F: 'F', A: 'A', L: 'L', dL: 'dL', tissue: true } }`; ~bone-bending `{ section: { shape: 'tube', ro: 'ro', ri: 'ri', I: 'I', M: 'M', stress: 's', solidI: 'Is' } }`; biomaterials#1 `{ parallel: { E1: 'Ei', A1: 'Ai', E2: 'Eb', A2: 'Ab', F: 'F', share: 'share', stress2: 'sb' } }`. Each demo is the page it stands for (g.he-stressStrain-true also serves materials-science#3~true; -full is the edge case, a whole aluminum curve with its toughness).",
        'Checks (harness/picturesHe2j.ts): the point is on σ = Eε below yield; σ = F ÷ A, ε = ΔL ÷ L, A = πd² ÷ 4; the curve passes the 0.2% offset point at σ_Y and never rises above its UTS; U_r = σ_Y² ÷ 2E; I = π(r_o⁴ − r_i⁴) ÷ 4 with r_i < r_o, σ = Mr_o ÷ I; the share is E₁A₁ ÷ ΣEA and the two add to 1; σ₂ = F(1 − share) ÷ A₂.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-stressStrain-rod',
      'g.he-stressStrain-tensile',
      'g.he-stressStrain-true',
      'g.he-stressStrain-resilience',
      'g.he-stressStrain-full',
      'g.he-stressStrain-epp',
      'g.he-stressStrain-tendon',
      'g.he-stressStrain-bone',
      'g.he-stressStrain-implant',
    ],
  },
];
