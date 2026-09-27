/**
 * Layout figures fit their pages: observe figures, drawn parts figures, animal scenes and sort
 * headers, on the lesson pages and the gallery's demos (harness/layoutFigures.ts).
 */
import { LAYOUTS, type LayoutDef } from '..';
import { GALLERY_LAYOUTS } from '../gallery';
import { layoutFigureIssues } from '../harness/layoutFigures';

const ALL: LayoutDef[] = [...LAYOUTS, ...GALLERY_LAYOUTS];

it.each(ALL.map((l) => [l.id, l] as const))('layout %s: its figure fits its data', (_, l) => {
  expect(layoutFigureIssues(l)).toEqual([]);
});
