/** Compare word problems and compare-numbers pages, shared by the Grade 1 and Grade 2 files. */
import type { Values } from '@/engine/types';
import { difference, whole } from '../helpers';
import { addStrategy, countUp, subtractStrategy } from '../work';

/** Compare word problems (how many more or fewer), with a tape diagram, up to `max`. */
export function compareProblem(id: string, max: number, example: [number, number], use: string) {
  return {
    id,
    title: 'Compare problems',
    use,
    assumptions: [
      'Compare problems ask: how many more? How many fewer?',
      '“Maya has 2 more than Kofi”: Maya has the bigger amount, Kofi’s amount + 2.',
      '“More” in the question doesn’t always mean add. First find who has more.',
      '“How many more” and “how many fewer” have the same answer.',
    ],
    variables: [
      whole('B', 'B', 'Bigger amount', 0, max),
      whole('S', 'S', 'Smaller amount', 0, max),
      whole('d', 'd', 'How many more (or fewer)', 0, max),
    ],
    relations: [
      {
        id: 'd = B − S',
        display: '{d} = {B} − {S}',
        vars: ['d', 'B', 'S'],
        residual: (v: Values) => v.d! - (v.B! - v.S!),
        solve: {
          d: (v: Values) => v.B! - v.S!,
          B: (v: Values) => v.S! + v.d!,
          S: (v: Values) => v.B! - v.d!,
        },
      },
    ],
    steps: {
      'd = B − S': {
        d: {
          expr: '{B} − {S}',
          how: 'Take the smaller amount from the bigger one. Or count up from the smaller bar.',
          work: (v: Values) => countUp(v.S!, v.B!),
        },
        B: {
          expr: '{S} + {d}',
          how: 'The bigger amount is the smaller amount plus the extra.',
          work: (v: Values) => addStrategy(v.S!, v.d!),
        },
        S: {
          expr: '{B} − {d}',
          how: 'The smaller amount is the bigger amount without the extra.',
          work: (v: Values) => subtractStrategy(v.B!, v.d!),
        },
      },
    },
    example: { B: example[0], S: example[1], d: example[0] - example[1] },
    startWith: ['B', 'S'],
    representation: {
      kind: 'tape' as const,
      compare: ['B', 'S'] as [string, string],
      difference: 'd',
    },
  };
}
/** Difference of two numbers; Grade 1 counts up (1.NBT.6 doesn't subtract two-digit numbers). */
export const cmpNumbers = (grade1: boolean) =>
  difference('d', 'a', 'b', {
    diff: 'Count up from the smaller number to the greater one.',
    first: [
      'The first number is greater. Add the difference to the second number.',
      'The first number is less. Take the difference away from the second number.',
    ],
    second: [
      'The first number is greater. Take the difference away from the first number.',
      'The first number is less. Add the difference to the first number.',
    ],
    countUp: true,
    compare: true,
  });
/** Compare two numbers with >, < or = using base-ten blocks. */
export const compareNumbers = (
  id: string,
  max: number,
  steps: number[],
  example: [number, number],
  use: string,
) => ({
  id: `${id}~compare`,
  pictureLabels: ['d'],
  title: 'Compare numbers',
  use,
  assumptions: [
    max > 99
      ? 'Compare the hundreds first. If they are the same, compare the tens, then the ones.'
      : 'Compare the tens first. If they are the same, compare the ones.',
    '> means “is greater than”, < means “is less than”. The open side faces the greater number.',
  ],
  variables: [
    whole('a', 'a', 'First number', 0, max),
    whole('b', 'b', 'Second number', 0, max),
    whole('d', 'd', 'How far apart', 0, max),
  ],
  relations: [cmpNumbers(max <= 99).relation],
  steps: cmpNumbers(max <= 99).steps,
  example: { a: example[0], b: example[1], d: Math.abs(example[0] - example[1]) },
  startWith: ['a', 'b'],
  representation: {
    kind: 'baseTen' as const,
    groups: ['a', 'b'],
    compare: true,
    controls: [
      { var: 'a', steps },
      { var: 'b', steps },
    ],
  },
});
