/**
 * Grades 9–12 round 5 gallery demos (H115–H117; see pictureRequestsHs.ts and docs/HS_NEEDS.md
 * P27–P29). Each demo is the page that waits, with the option it will pass. Spread into
 * gallery.ts.
 */
import { growthLifetime } from '@/components/module/reps/reserveGrowth';

import type { LayoutDef } from './layouts';
import { SCIENCE_11_LAYOUTS } from './layouts/science11';
import { SCIENCE_11_MODULES } from './science/11';
import { SCIENCE_12_MODULES } from './science/12';
import type { ModuleDef, Representation } from './types';

const PAGES = [...SCIENCE_11_MODULES, ...SCIENCE_12_MODULES];

/** A demo from the page that waits, with the picture the page will pass. */
function fromPage(
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> = {},
): ModuleDef {
  const found = PAGES.find((m) => m.id === pageId);
  if (!found) throw new Error(`galleryHs5: no page ${pageId}`);
  return { ...found, id, title, representation, ...more };
}

// ── H115 (P27): reserve, use that grows by g% a year ──

const RESERVE_GROWTH: Representation = {
  kind: 'reserve',
  reserve: 'Q',
  rate: 'r',
  years: 'y',
  growth: 'g',
  lasts: 'T',
};

const growingUse = fromPage(
  's.12.resource-management~growing-use',
  'g.s12-resource-management-growing-use-growth',
  'A reserve as use grows: each year’s slice larger than the last',
  RESERVE_GROWTH,
);

const growingFast = (() => {
  const [Q, r, g] = [1200, 20, 5];
  return fromPage(
    's.12.resource-management~growing-use',
    'g.s12-resource-management-growing-use-fast',
    'A reserve as use grows 5% a year',
    RESERVE_GROWTH,
    {
      use: 'Use this for “1,200 tonnes are used at 20 tonnes a year, and use grows 5% a year. How many years will they last?”',
      example: { Q, r, g, k: g / 100, T: growthLifetime(Q, r, g), y: Q / r },
    },
  );
})();

// ── H116 (P28): photoelectric, a value shown as "?" draws nothing ──

const photoelectric = (() => {
  const page = PAGES.find((m) => m.id === 's.11.modern-physics~photoelectric');
  if (!page || page.representation?.kind !== 'photoelectric')
    throw new Error('galleryHs5: no photoelectric page');
  return page.representation;
})();

const photoelectricBlank = fromPage(
  's.11.modern-physics~photoelectric',
  'g.s11-modern-physics-photoelectric-blank',
  'Photoelectric effect: φ still “?” draws no φ, Kₘₐₓ or λ₀',
  // Clear φ (or λ) to see the picture leave out what is "?".
  { ...photoelectric, blank: true },
);

export const HS5_GALLERY_MODULES: ModuleDef[] = [growingUse, growingFast, photoelectricBlank];

// ── H117 (P29): sort, the groups right under the picked card ──

const motionDiagrams: LayoutDef = (() => {
  const page = SCIENCE_11_LAYOUTS.find((l) => l.id === 's.11.kinematics-1d~motion-diagrams');
  if (!page || page.kind !== 'sort') throw new Error('galleryHs5: no motion-diagrams sort');
  return {
    ...page,
    id: 'g.s11-kinematics-1d-motion-diagrams-pick-bar',
    title: 'Motion diagrams with the groups under the picked card',
    pickBar: true,
  };
})();

export const HS5_GALLERY_LAYOUTS: LayoutDef[] = [motionDiagrams];
