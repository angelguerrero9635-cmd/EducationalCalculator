import { SKILLS } from '@/data/taxonomy';

import { getPage, moduleOwner } from '..';
import { GALLERY_LAYOUTS, GALLERY_MODULES } from '../gallery';
import { PICTURE_REQUESTS, type PictureRequest } from '../pictureRequests';

const GALLERY = new Set([...GALLERY_MODULES, ...GALLERY_LAYOUTS].map((g) => g.id));
const SKILL_IDS = new Set(SKILLS.map((s) => s.id));
/** The text that shows a request's picture (or its part) is on a page. */
const markOn = (r: PictureRequest, id: string) =>
  (typeof r.uses === 'object' ? r.uses[id] : r.uses) ?? `"${r.kind}"`;

/**
 * The picture tracker stays true: each request names pages of real skills, a drawn picture has
 * its gallery demos, and a placed one is on every page it names (a request in parts: each built
 * page shows its part, placed or not).
 */
describe.each(PICTURE_REQUESTS.map((r) => [r.id, r] as const))('picture request %s', (_, r) => {
  it('names real pages or planned pages of real skills', () => {
    expect(r.pages.length).toBeGreaterThan(0);
    for (const id of r.pages) {
      if (getPage(id)) continue;
      // Not built yet: fine until it is placed, as long as its skill exists.
      expect([id, r.status]).not.toEqual([id, 'placed']);
      expect([id, SKILL_IDS.has(moduleOwner(id))]).toEqual([id, true]);
    }
  });

  it('has its gallery demos once drawn (a placed picture may have retired them)', () => {
    if (r.status === 'requested') return;
    if (r.status === 'drawn') expect(r.gallery.length).toBeGreaterThan(0);
    for (const g of r.gallery) expect([g, GALLERY.has(g)]).toEqual([g, true]);
  });

  it('is on every page it names once placed', () => {
    if (r.status !== 'placed') return;
    for (const id of r.pages)
      expect([id, JSON.stringify(getPage(id)).includes(markOn(r, id))]).toEqual([id, true]);
  });

  it('has each part on its page once that page is built (parts by page)', () => {
    if (typeof r.uses !== 'object') return;
    expect(Object.keys(r.uses)).toEqual(r.pages);
    if (r.status === 'requested') return;
    for (const id of r.pages) {
      const page = getPage(id);
      if (page) expect([id, JSON.stringify(page).includes(markOn(r, id))]).toEqual([id, true]);
    }
  });
});

it('picture request ids are unique', () => {
  const ids = PICTURE_REQUESTS.map((r) => r.id);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});
