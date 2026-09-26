/** a + b = c and c − b = a with K–2 step text, shared by the Kindergarten to Grade 2 files. */
import { addWork, countUpWork, subtractWork } from '../helpers';
import type { StepText } from '../types';

export function addSub(how: { c: string; a: string; b: string }) {
  const relations = [
    {
      id: 'a + b = c',
      display: '{a} + {b} = {c}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.a! + v.b! - v.c!,
      solve: {
        c: (v: Record<string, number>) => v.a! + v.b!,
        a: (v: Record<string, number>) => v.c! - v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
    {
      id: 'c − b = a',
      display: '{c} − {b} = {a}',
      vars: ['a', 'b', 'c'],
      residual: (v: Record<string, number>) => v.c! - v.b! - v.a!,
      solve: {
        a: (v: Record<string, number>) => v.c! - v.b!,
        c: (v: Record<string, number>) => v.a! + v.b!,
        b: (v: Record<string, number>) => v.c! - v.a!,
      },
    },
  ];
  const steps: Record<string, Record<string, StepText>> = {
    'a + b = c': {
      c: { expr: '{a} + {b}', how: how.c, work: addWork },
      a: { expr: '{c} − {b}', how: how.a, work: subtractWork },
      b: { expr: '{c} − {a}', how: how.b, work: countUpWork },
    },
    'c − b = a': {
      a: { expr: '{c} − {b}', how: how.a, work: subtractWork },
      c: { expr: '{a} + {b}', how: 'Put back what was taken away: add.', work: addWork },
      b: { expr: '{c} − {a}', how: how.b, work: countUpWork },
    },
  };
  return { relations, steps };
}
