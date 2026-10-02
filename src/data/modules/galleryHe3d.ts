/**
 * College gallery demos, round 3, group D (docs/RENDERINGS_HE.md). Each stands in for the
 * college page that waits, built from the plan's worked example. Spread into gallery.ts.
 *
 * HC48: the `codeTrace` explore figure (engineering-programming#0~trace) and `code` cards (the
 * programming sorts).
 */
import type { LayoutDef } from './layouts';
import type { ModuleDef } from './types';

// ─── HC48: engineering-programming#0~trace ────────────────────────────────────

const WHILE_M = ['x = 1;', 'n = 0;', 'while x <= 20', '    x = 2*x;', '    n = n + 1;', 'end'];
const WHILE_P = ['x = 1', 'n = 0', 'while x <= 20:', '    x = 2*x', '    n = n + 1'];

/** The table after each pass of the doubling loop: [x, n]. */
const doubling = [1, 2, 4, 8, 16, 32].map((x, n) => [x, n]);

const traceWhile: LayoutDef = {
  kind: 'explore',
  id: 'g.he-code-trace-while',
  title: 'Trace a while loop',
  use: 'Use this for “What is x after while x <= 20, x = 2*x runs from x = 1? How many passes?”',
  assumptions: [
    'The test is read before every pass; the body runs only while it holds.',
    'MATLAB ends the loop with end; Python ends it where the indent stops.',
    'Each row of the table is the values after one pass of the body.',
  ],
  figure: { kind: 'codeTrace', matlab: WHILE_M, python: WHILE_P, vars: ['x', 'n'] },
  scenes: [
    {
      label: 'Start',
      lines: ['The first two lines set x to 1 and the pass count n to 0.'],
      trace: { line: 2, rows: doubling.slice(0, 1) },
    },
    ...[1, 2, 3, 4].map((k) => ({
      label: `Pass ${k}`,
      lines: [
        `The test ${doubling[k - 1]![0]} <= 20 holds, so the body runs: x doubles to ${doubling[k]![0]} and n counts ${k}.`,
      ],
      trace: {
        line: 5,
        rows: doubling.slice(0, k + 1),
        test: { text: `${doubling[k - 1]![0]} <= 20`, holds: true },
      },
    })),
    {
      label: 'Pass 5',
      lines: ['The test 16 <= 20 still holds: x doubles to 32, past 20, and n counts 5.'],
      trace: { line: 5, rows: doubling, test: { text: '16 <= 20', holds: true } },
    },
    {
      label: 'End',
      lines: ['Now 32 <= 20 is false, so the loop ends with x = 32 after 5 passes.'],
      trace: { line: 3, rows: doubling, test: { text: '32 <= 20', holds: false } },
    },
  ],
};

// The edge: a for loop with a step, the stop left out of Python's range (1:2:10 is 1, 3, 5, 7, 9).
const FOR_M = ['S = 0;', 'for k = 1:2:10', '    S = S + k;', 'end'];
const FOR_P = ['S = 0', 'for k in range(1, 10, 2):', '    S = S + k'];
const sums = [1, 3, 5, 7, 9].reduce<(number | string)[][]>(
  (rows, k) => [...rows, [k, Number(rows[rows.length - 1]![1]) + k]],
  [['–', 0]],
);

const traceFor: LayoutDef = {
  kind: 'explore',
  id: 'g.he-code-trace-for',
  title: 'Trace a for loop with a step',
  use: 'Use this for “What does S hold after for k = 1:2:10, S = S + k?”',
  assumptions: [
    'MATLAB’s 1:2:10 counts from 1 by 2 and stops at 10 or before: 1, 3, 5, 7, 9.',
    'Python’s range(1, 10, 2) stops before 10, so it gives the same five values.',
    'Each row of the table is k and S after one pass.',
  ],
  figure: { kind: 'codeTrace', matlab: FOR_M, python: FOR_P, vars: ['k', 'S'] },
  scenes: [
    {
      label: 'Start',
      lines: ['S starts at 0 before the loop; k has no value yet.'],
      trace: { line: 1, rows: sums.slice(0, 1) },
    },
    ...[1, 2, 3, 4, 5].map((p) => ({
      label: `k = ${sums[p]![0]}`,
      lines: [
        `Pass ${p}: k takes the next value, ${sums[p]![0]}, and S becomes ${sums[p - 1]![1]} + ${sums[p]![0]} = ${sums[p]![1]}.`,
      ],
      trace: { line: 3, rows: sums.slice(0, p + 1) },
    })),
  ],
};

// ─── HC48: engineering-programming#0~syntax (code cards) ──────────────────────

const syntaxCards: LayoutDef = {
  kind: 'sort',
  id: 'g.he-code-card-syntax',
  title: 'MATLAB, Python or both',
  use: 'Use this for “Which language is A(end) written in?”',
  assumptions: [
    'MATLAB counts from 1 with ( ); Python counts from 0 with [ ].',
    'MATLAB comments start with %, Python comments with #.',
  ],
  question: 'Which language could run this line?',
  bins: [
    {
      id: 'matlab',
      label: 'MATLAB only',
      why: 'Round brackets, end, % comments and ’ transposes.',
    },
    { id: 'python', label: 'Python only', why: 'Square brackets from 0, # comments and +=.' },
    { id: 'both', label: 'Both', why: 'Plain assignments and comparisons read the same in both.' },
  ],
  cards: (
    [
      ['A(end)', 'matlab'],
      ["y = x'", 'matlab'],
      ['% note', 'matlab'],
      ['if x > 3\n    y = 1;\nend', 'matlab'],
      ['A[-1]', 'python'],
      ['x += 1', 'python'],
      ['# note', 'python'],
      ["s = 'ok'\nprint(s)", 'python'],
      ['x = 5', 'both'],
      ['a == b', 'both'],
    ] as const
  ).map(([code, bin], i) => ({
    label: `Snippet ${String.fromCharCode(65 + i)}`,
    bin,
    figure: { kind: 'code' as const, code },
  })),
};

export const HE3D_GALLERY_MODULES: ModuleDef[] = [];

export const HE3D_GALLERY_LAYOUTS: LayoutDef[] = [traceWhile, traceFor, syntaxCards];
