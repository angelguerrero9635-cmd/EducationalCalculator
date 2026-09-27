import { SKILLS } from '@/data/taxonomy';

import { getPage, moduleOwner } from '..';
import { GALLERY_LAYOUTS, GALLERY_MODULES } from '../gallery';
import { PICTURE_REQUESTS } from '../pictureRequests';

const GALLERY = new Set([...GALLERY_MODULES, ...GALLERY_LAYOUTS].map((g) => g.id));
const SKILL_IDS = new Set(SKILLS.map((s) => s.id));

/**
 * The picture tracker stays true: each request names pages of real skills, a drawn picture has
 * its gallery demos, and a placed one is on every page it names.
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

  it('has its gallery demos once drawn', () => {
    if (r.status === 'requested') return;
    expect(r.gallery.length).toBeGreaterThan(0);
    for (const g of r.gallery) expect([g, GALLERY.has(g)]).toEqual([g, true]);
  });

  it('is on every page it names once placed', () => {
    if (r.status !== 'placed') return;
    const mark = r.uses ?? `"${r.kind}"`;
    for (const id of r.pages)
      expect([id, JSON.stringify(getPage(id)).includes(mark)]).toEqual([id, true]);
  });
});

it('picture request ids are unique', () => {
  const ids = PICTURE_REQUESTS.map((r) => r.id);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});
