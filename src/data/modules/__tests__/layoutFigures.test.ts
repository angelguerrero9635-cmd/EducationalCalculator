/**
 * Every figure on a layout page fits what is drawn: observe figures, drawn parts figures,
 * animal scenes and sort headers (harness/layoutFigures.ts), and the card figures on sort
 * cards and sequence stages (a pin on its map, a part the cell has, values a tiny dot plot
 * can show; layouts/cardFigureData.ts). Lesson pages and the gallery's demos alike.
 */
import { LAYOUTS, type CardFigure, type LayoutDef } from '../layouts';
import { GALLERY_LAYOUTS } from '../gallery';
import { layoutFigureIssues } from '../harness/layoutFigures';
import { cardFigureProblems } from '../layouts/cardFigureData';

const ALL: LayoutDef[] = [...LAYOUTS, ...GALLERY_LAYOUTS];

/** The card figures of a page, each named by its card. */
const cardFigures = (l: LayoutDef): [string, CardFigure][] =>
  l.kind === 'sort'
    ? l.cards.flatMap((c) => (c.figure ? [[c.label, c.figure] as [string, CardFigure]] : []))
    : l.kind === 'sequence'
      ? l.stages.flatMap((s) => (s.figure ? [[s.label, s.figure] as [string, CardFigure]] : []))
      : [];

it.each(ALL.map((l) => [l.id, l] as const))('layout %s: its figures fit its data', (_, l) => {
  expect(layoutFigureIssues(l)).toEqual([]);
  expect(
    cardFigures(l).flatMap(([card, f]) => cardFigureProblems(f).map((p) => `${card}: ${p}`)),
  ).toEqual([]);
});

it('the card-figure check catches figures that do not fit', () => {
  expect(cardFigureProblems({ kind: 'map', area: 'northAmerica', pin: [30, 10] })).toHaveLength(1);
  expect(cardFigureProblems({ kind: 'map', area: 'world', region: 'gulf of mexico' })).toHaveLength(
    1,
  );
  expect(cardFigureProblems({ kind: 'cell', type: 'animal', highlight: 'wall' })).toHaveLength(1);
  expect(cardFigureProblems({ kind: 'dotPlot', values: [4] })).not.toEqual([]);
});
