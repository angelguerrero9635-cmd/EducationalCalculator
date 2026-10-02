/**
 * Step-text phrases for the college demos of round 3, group D, spread into PHRASES
 * (`evaluate.ts`): the Bellman–Ford minimum over three neighbours, "min(2 + 6, 7 + 3, 4 + 5)",
 * and the average waits of a schedule's check lines ("the SJF average wait of 10, 4, 2, 6",
 * "the round-robin average wait of 5, 3, 1 with quantum 2"). By the time they run, × is * and
 * − is -. Test-only.
 */
import { jobOrder } from '@/components/module/reps/scheduleMath';

/** A number as evaluate.ts writes it (its NUM, copied: evaluate.ts imports this file). */
const NUM = String.raw`\(?-?\d+(?:\.\d+…?)?(?:e[-+]?\d+)?(?: × 10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+| \* 10\*\* ?\(?-?\d+\)?)?\)?`;

export const HE3D_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  [
    new RegExp(String.raw`min\((${NUM}) \+ (${NUM}), (${NUM}) \+ (${NUM}), (${NUM}) \+ (${NUM})\)`),
    (a, b, c, d, e, f) => Math.min(a! + b!, c! + d!, e! + f!),
  ],
  [
    new RegExp(String.raw`the SJF average wait of (${NUM}), (${NUM}), (${NUM}), (${NUM})`),
    (a, b, c, d) => jobOrder([a!, b!, c!, d!], 'sjf').avgWait,
  ],
  [
    new RegExp(
      String.raw`the round-robin average wait of (${NUM}), (${NUM}), (${NUM}) with quantum (${NUM})`,
    ),
    (a, b, c, q) => jobOrder([a!, b!, c!], 'rr', q).avgWait,
  ],
];
