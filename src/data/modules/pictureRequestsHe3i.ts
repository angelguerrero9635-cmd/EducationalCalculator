/**
 * College pictures, round 3, group I (docs/RENDERINGS_HE.md). Spread into
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

export const HE3I_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC81',
      'simpleMachine',
      'A limb as a lever: the forearm held level at the elbow, or the pelvis on one leg; bones to scale, the muscle’s pull, the loads and the joint force, and the two moments about the joint as equal bars',
      [`${B}anatomy-physiology#1`, `${E}biomechanics#1`, `${E}biomechanics#1~hip`],
      [
        'From B-P21. An option on the existing simpleMachine lever (typesHe3i.ts LimbOption, reps/SimpleMachineLimb.tsx, the sums in reps/limbMath.ts); off unless a page sets limb.',
        "Fields: the lever's own load (L in the hand, or body weight W), loadArm (d_L or d_W), effortArm (d_M or d_ab), effort (F_M or F_ab), advantage? (MA = d_M ÷ d_L), plus limb: { body: 'forearm' | 'hip', loads?: [{ force, arm, name? }] (further vertical loads: the forearm's weight W_f at d_f), share? (hip: the share of W at d_W, default 5/6), joint? (F_J), ratio? (F_J ÷ W) }. Forces in N, arms in cm or m (mixed units convert).",
        "Example (biomechanics#1): { kind: 'simpleMachine', machine: 'lever', load: 'L', loadArm: 'dL', effortArm: 'dM', effort: 'FM', limb: { body: 'forearm', loads: [{ force: 'Wf', arm: 'df', name: 'W_f' }], joint: 'FJ' } }. Example (~hip): { kind: 'simpleMachine', machine: 'lever', load: 'W', loadArm: 'dW', effortArm: 'dab', effort: 'Fab', limb: { body: 'hip', joint: 'FJ', ratio: 'ratio' } }. Example (anatomy-physiology#1): { kind: 'simpleMachine', machine: 'lever', load: 'L', loadArm: 'dL', effortArm: 'dM', effort: 'FM', advantage: 'MA', limb: { body: 'forearm' } }.",
        'Forearm: the humerus (cut short), ulna and radius painted as bone to scale from the arms, the biceps and its tendon inserting at d_M, the ball in the hand at d_L, the forearm’s centre of mass at d_f; F_M up, the loads down, F_J at the elbow (down on the forearm when positive), all on one scale (the shortest lengthened to 16 px, said in the caption); the arms dimensioned from the elbow. Hip (frontal): the pelvis, sacrum and lumbar vertebrae, the stance femur (the other faded), the abductors from the iliac wing to the greater trochanter; (5/6)W down at the midline, F_ab down at d_ab, F_J up into the socket; d_W and d_ab dimensioned. Both: two bars, the muscle’s moment and the loads’ (stacked), equal when balanced; a "?" value draws no arrow, label or bar for it; F_J is drawn only when the page names it.',
        'The harness (harness/picturesHe3i.ts limbIssues) checks Σ moments about the joint = 0 with the values (F_M d_M = Σ F d, the hip share applied), F_J = F_M − Σ F (forearm) or F_M + Σ F (hip), F_J ÷ W and MA = d_M ÷ d_L. The pages are not built yet: they pass the limb field.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-simpleMachine-limb-forearm',
      'g.he-simpleMachine-limb-forearm-level',
      'g.he-simpleMachine-limb-hip',
      'g.he-simpleMachine-limb-hip-short-arm',
    ],
  },
];
