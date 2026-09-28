/**
 * Round-4 gallery demos (group G; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is a page its picture was drawn for, with the
 * page's own variables, relations and example, or an example at the edge of its range.
 */
import type { Values } from '@/engine/types';

import { COLLEGE_MODULES } from './college';
import type { LayoutDef } from './layouts';
import { MATH_1_MODULES } from './math/1';
import { PILOT_MODULES } from './pilots';
import { SCIENCE_3_MODULES } from './science/3';
import { SCIENCE_4_MODULES } from './science/4';
import type { ModuleDef } from './types';

const PAGES = [
  ...MATH_1_MODULES,
  ...COLLEGE_MODULES,
  ...PILOT_MODULES,
  ...SCIENCE_3_MODULES,
  ...SCIENCE_4_MODULES,
];

/** The page `pageId` as a gallery demo `id` (with another `example`, if given). */
function demo(
  pageId: string,
  id: string,
  title: string,
  extra: Partial<ModuleDef> & { example?: Values } = {},
): ModuleDef {
  const page = PAGES.find((m) => m.id === pageId);
  if (!page) throw new Error(`galleryR4g: no page ${pageId}`);
  return { ...page, id, title, ...extra };
}

export const R4G_GALLERY_MODULES: ModuleDef[] = [
  // Q20: the series circuit as a copper-wire schematic with value chips and a current arrow.
  demo('he.engineering.circuits-1#0', 'g.series-loop', 'Series circuit'),
  demo('he.engineering.circuits-1#0', 'g.series-loop-big', 'Series circuit: kilohms', {
    example: { V: 240, R1: 1000, R2: 2000, Rt: 3000, I: 0.08, V1: 80, V2: 160, P: 19.2 },
  }),
  // Q22: children pushing a crate, arrows on one scale, the extra push above.
  demo('s.3.balanced-forces', 'g.pushes', 'Pushes on a crate'),
  demo('s.3.balanced-forces', 'g.pushes-lopsided', 'Pushes: 50 N against 1 N', {
    example: { r: 50, l: 1, e: 49 },
  }),
  // Q23: a big crate, force and acceleration arrows as long as F and a.
  demo('s.8.newtons-laws', 'g.force-crate', 'Force on a crate'),
  demo('s.8.newtons-laws', 'g.force-crate-heavy', 'Force on a crate: 5,000 kg', {
    example: { m: 5000, a: 0.5, F: 2500 },
  }),
  // Q30: a flat, exact wave; across and up on one scale when there is an amplitude.
  demo('s.4.wave-patterns', 'g.wave-rope', 'Wave along a rope'),
  demo('s.4.wave-patterns', 'g.wave-rope-12', 'Wave along a rope: 12 waves', {
    example: { R: 600, n: 12, w: 50 },
  }),
  demo('s.4.wave-patterns~amplitude', 'g.wave-amplitude', 'Wave amplitude'),
  demo('s.4.wave-patterns~amplitude', 'g.wave-amplitude-tall', 'Wave amplitude: 30 cm on 10 cm', {
    example: { h: 60, a: 30, w: 10 },
  }),
  // Q38: a classroom pan balance, a pointer on a scale, and a tag under each pan.
  demo('m.1.equal-sign', 'g.pan-balance', 'Pan balance'),
  demo('m.1.equal-sign', 'g.pan-balance-full', 'Pan balance: 40 a side', {
    example: { a: 20, b: 20, c: 20, d: 20 },
  }),
  // Only the right's first number on its pan: 10 against 5, so the beam tips left.
  demo('m.1.equal-sign', 'g.pan-balance-tipped', 'Pan balance: not level', {
    representation: { kind: 'balance', left: ['a', 'b'], right: ['c'] },
  }),
];
export const R4G_GALLERY_LAYOUTS: LayoutDef[] = [];
