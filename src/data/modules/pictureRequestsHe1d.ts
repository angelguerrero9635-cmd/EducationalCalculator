/**
 * College pictures, round 1, group D (docs/RENDERINGS_HE.md). Spread into
 * HE_PICTURE_REQUESTS in pictureRequestsHe.ts.
 */
import type { PictureRequest } from './pictureRequests';

/** A request with its pages, still to draw (shaped like pictureRequestsHs.ts). */
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

const EC = 'he.engineering.';

export const HE1D_REQUESTS: PictureRequest[] = [
  {
    ...ask(
      'HC4',
      'functionGraph',
      'Time responses: a first-order response or ramp, a second-order step response or free decay',
      [
        `${EC}circuits-1#4`,
        `${EC}circuits-1#4~discharge`,
        `${EC}circuits-1#4~rl`,
        `${EC}circuits-1#4~general`,
        `${EC}circuits-1#4~rlc-damping`,
        `${EC}control-systems#0`,
        `${EC}control-systems#1`,
        `${EC}control-systems#1~from-spec`,
        `${EC}control-systems#3~bandwidth`,
        `${EC}control-systems#4`,
        `${EC}control-systems#4~pi`,
        `${EC}electronics#3~integrator`,
        `${EC}signals-systems#1~exp-step`,
        `${EC}flight-mechanics#2`,
        `${EC}process-control#0`,
        `${EC}process-control#0~second-order`,
        `${EC}process-control#2~imc`,
        `${EC}process-control#2~fit`,
      ],
      [
        'From EC-P4, EC-P5, ACC-P5. `family: "response"` with one of:',
        '`transient: { initial, final, tau, time?, value?, deadTime?, rate?, points?, second? }`:',
        'x(t) = x_f + (x₀ − x_f)e^(−(t − θ)/τ), final dashed, τ…5τ under the axis, 63.2% ringed,',
        'the point at `time` dragged along the curve (`value` its page value, checked); no `tau`',
        'draws a ramp by `rate` or through (time, value) (integrator); `points: { t28, t63 }` the',
        'two-point fit; `second: { final, tau, label }` a dashed second curve (open loop).',
        '`stepResponse: { wn, zeta | alpha, gain?, mode?, overshoot?, peak?, settling?, decay?,',
        'period?, halfLife?, time?, value? }`: ±2% band, the envelope, peak at (Tₚ, 1 + OS), Tₛ,',
        'the next peak for the decay ratio, the period bracketed; ζ ≥ 1 over- or critically',
        'damped; `mode: "oscillation"` a free decay inside ±e^(−ζωₙt), t½ marked. Both take',
        '`stepInput: { size?, name? }` (the step above on its own axis) and `error` (eₛₛ bracket).',
        'Example (control#1): { kind: "functionGraph", family: "response", stepResponse: { wn:',
        '"wn", zeta: "zeta", overshoot: "os", peak: "tp", settling: "ts" }, stepInput: { size: 1 } }.',
        'Times read in the unit of the first time id; %OS checked as a percent when its unit is %.',
      ].join(' '),
    ),
    status: 'drawn',
    gallery: [
      'g.he-function-graph-rc-charge',
      'g.he-function-graph-general',
      'g.he-function-graph-fopdt-fit',
      'g.he-function-graph-integrator',
      'g.he-function-graph-p-control',
      'g.he-function-graph-second-order',
      'g.he-function-graph-decay-ratio',
      'g.he-function-graph-overdamped',
      'g.he-function-graph-phugoid',
    ],
  },
];
