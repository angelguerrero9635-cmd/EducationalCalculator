/**
 * Grades 9–12 round 4 gallery demos (H111–H114; see pictureRequestsHs.ts and docs/HS_NEEDS.md
 * P23–P26). Each demo is the page that waits, with the option it will pass. Spread into
 * gallery.ts.
 */
import { fTest } from '@/components/module/reps/fCurve';
import type { VariableDef } from '@/engine/types';

import type { LayoutDef } from './layouts';
import { SCIENCE_9_LAYOUTS } from './layouts/science9';
import { MATH_10_MODULES } from './math/10';
import { MATH_12_MODULES } from './math/12';
import { SCIENCE_11_MODULES } from './science/11';
import type { ModuleDef, Representation } from './types';

const PAGES = [...MATH_10_MODULES, ...MATH_12_MODULES, ...SCIENCE_11_MODULES];

/**
 * A demo from the page that waits, with the picture the page will pass. `vars` changes
 * variables (by id); the rest replaces the page's fields.
 */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> & { vars?: Record<string, Partial<VariableDef>> } = {},
): ModuleDef {
  const found = PAGES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs4: no page ${pageId}`);
  const { vars, ...rest } = more;
  return {
    ...found,
    id,
    title,
    representation,
    variables: found.variables.map((v) => (vars?.[v.id] ? { ...v, ...vars[v.id] } : v)),
    ...rest,
  };
}

// ── H111 (P23): rotor, the hollow ball in the compare row ──

const hollowBall = (() => {
  const [c, m, r, t] = [2 / 3, 2, 0.5, 3];
  const I = c * m * r * r;
  return fromPage(
    's.11.rotation~rotational-inertia',
    'g.s11-rotation-hollow-ball',
    'A hollow ball beside the hoop, disk and solid ball',
    {
      kind: 'rotor',
      shape: 'c',
      mass: 'm',
      radius: 'r',
      inertia: 'I',
      torque: 't',
      acceleration: 'a',
      compare: true,
      hollow: true,
    },
    {
      use: 'Use this for “A 3 N·m torque turns a 2 kg hollow ball of radius 0.5 m. What is its angular acceleration?”',
      example: { c, m, r, I, t, a: t / I },
      pictureLabels: [],
    },
  );
})();

// ── H112 (P24): normalCurve's F curve, one tail or two from the page's Hₐ value ──

const F_TAILS: Representation = {
  kind: 'normalCurve',
  f: { df1: 'd1', df2: 'd2', stat: 'F', alpha: 'a', p: 'P', tailsFrom: 'h' },
};

const twoVariances = fromPage(
  'm.12.anova~two-variances',
  'g.m12-anova-two-variances-tails-two',
  'Two variances: Hₐ picks the tails (≠, both)',
  F_TAILS,
);

const twoVariancesRight = fromPage(
  'm.12.anova~two-variances',
  'g.m12-anova-two-variances-tails-right',
  'Two variances: Hₐ picks the tails (>, the right one)',
  F_TAILS,
  {
    example: {
      s1: 6,
      s2: 4,
      n1: 16,
      n2: 16,
      d1: 15,
      d2: 15,
      F: 2.25,
      h: 1,
      P: fTest(2.25, 15, 15, 'right').p,
      a: 0.05,
    },
  },
);

// ── H113 (P25): pascalTriangle's fraction for "exactly k of r", groups up to 60 ──

const EXACTLY: Representation = {
  kind: 'pascalTriangle',
  n: 'n',
  k: 'r',
  triangle: false,
  slots: { r: 'r', choose: true, result: 't' },
  fraction: { n: 'a', k: 'k', b: 'b', r: 'r', count: 'f', chance: 'P' },
};

/** C(n, k) for the examples. */
const C = (n: number, k: number) => {
  let v = 1;
  for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i;
  return Math.round(v);
};
const exactly = (a: number, b: number, r: number, k: number) => {
  const [f, t] = [C(a, k) * C(b, r - k), C(a + b, r)];
  return { a, b, r, k, n: a + b, f, t, P: f / t };
};

const exactlyTwo = fromPage(
  'm.10.probability-rules~counting-probability',
  'g.m10-probability-rules-exactly-k',
  'Exactly k of r: two counts on top',
  EXACTLY,
  {
    use: 'Use this for “3 students are picked at random from 5 girls and 4 boys. What is the chance exactly 2 are girls?”',
    example: exactly(5, 4, 3, 2),
  },
);

const exactlySixty = fromPage(
  'm.10.probability-rules~counting-probability',
  'g.m10-probability-rules-exactly-k-sixty',
  'Exactly k of r in a group of 60',
  EXACTLY,
  {
    use: 'Use this for “10 of 60 people (30 in each class) are picked at random. What is the chance exactly 5 are from the first class?”',
    // Two classes, so the second has someone in it: with b = 0 the page's solver leaves P = 1
    // unknown (sent to the lesson chat).
    vars: { b: { min: 1 } },
    example: exactly(30, 30, 10, 5),
  },
);

export const HS4_GALLERY_MODULES: ModuleDef[] = [
  hollowBall,
  twoVariances,
  twoVariancesRight,
  exactlyTwo,
  exactlySixty,
];

// ── H114 (P26): the germ-layer bins in the gastrula card's colors ──

const GERM_COLORS = { ecto: 'bioAmino', meso: 'organDeep', endo: 'bioSugar' } as const;

const germLayers: LayoutDef = (() => {
  const page = SCIENCE_9_LAYOUTS.find((l) => l.id === 's.9.reproduction-development~germ-layers');
  if (!page || page.kind !== 'sort') throw new Error('galleryHs4: no germ-layers sort');
  return {
    ...page,
    id: 'g.s9-reproduction-development-germ-layers-colors',
    title: 'Germ layers in the gastrula’s colors',
    bins: page.bins.map((b) => ({
      ...b,
      color: GERM_COLORS[b.id as keyof typeof GERM_COLORS],
    })),
  };
})();

export const HS4_GALLERY_LAYOUTS: LayoutDef[] = [germLayers];
