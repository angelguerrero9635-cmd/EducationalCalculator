/**
 * Grades 9–12 round 2 gallery demos (group H2G: math options (H93–H95, H97–H99); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { MATH_10_MODULES } from './math/10';
import { MATH_11_MODULES } from './math/11';
import { MATH_12_MODULES } from './math/12';
import { MATH_9_MODULES } from './math/9';
import type { ModuleDef, Representation } from './types';

const PAGES = [...MATH_9_MODULES, ...MATH_10_MODULES, ...MATH_11_MODULES, ...MATH_12_MODULES];

/**
 * A demo from the page that waits: its variables, rules, steps and example, with the picture
 * the page will pass (and any variable or example change the option allows).
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & { vars?: Record<string, Partial<VariableDef>> } = {},
): ModuleDef {
  const found = PAGES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs2g: no page ${pageId}`);
  const { vars, ...rest } = more;
  return {
    ...found,
    id,
    title,
    representation,
    ...(vars
      ? { variables: found.variables.map((v) => (vars[v.id] ? { ...v, ...vars[v.id] } : v)) }
      : {}),
    ...rest,
  };
}

// ── H93: termsChart past 30 terms, a recursive rule, a second lit term ──

const TERMS: ModuleDef[] = [
  fromPage(
    'm.9.sequences',
    'g.m9-sequences-far',
    'Arithmetic sequence: the 100th term',
    {
      kind: 'termsChart',
      type: 'arithmetic',
      first: 'a1',
      step: 'd',
      count: 'n',
      as: 'points',
      term: 'an',
      far: true,
    },
    {
      use: 'Use this for “7, 11, 15, … What is the 100th term?”',
      vars: { n: { max: 1000 } },
      example: { a1: 7, d: 4, n: 100, an: 403 },
    },
  ),
  fromPage('m.9.sequences~recursive', 'g.m9-sequences-recursive-chart', 'Recursive rule', {
    kind: 'termsChart',
    type: 'recursive',
    first: 'a1',
    step: 'k',
    plus: 'c',
    count: 'n',
    term: 'an',
  }),
  fromPage(
    'm.11.exp-log-equations~same-base',
    'g.m11-exp-log-equations-same-base-lit',
    'Powers of the same base',
    {
      kind: 'termsChart',
      type: 'geometric',
      first: 'g',
      step: 'g',
      count: 'q',
      term: 'B2',
      lit: 'p',
      litTerm: 'B1',
      powers: true,
    },
  ),
];

export const HS2G_GALLERY_MODULES: ModuleDef[] = [...TERMS];

export const HS2G_GALLERY_LAYOUTS: LayoutDef[] = [];
