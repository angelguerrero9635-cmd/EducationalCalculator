/**
 * Round-3 card figures (moon, stars, map, dot plot, a cell's outlined part): every one on a
 * page or in the gallery fits what is drawn (a pin on its map, a region its map shades, a part
 * the cell has, values a tiny dot plot can show).
 */
import { LAYOUTS, type CardFigure } from '../layouts';
import { cardFigureProblems } from '../layouts/cardFigureData';
import { GALLERY_LAYOUTS } from '../gallery';

const figures: [string, CardFigure][] = [...LAYOUTS, ...GALLERY_LAYOUTS].flatMap((l) =>
  l.kind === 'sort'
    ? l.cards.flatMap((c) =>
        c.figure ? [[`${l.id}: ${c.label}`, c.figure] as [string, CardFigure]] : [],
      )
    : l.kind === 'sequence'
      ? l.stages.flatMap((s) =>
          s.figure ? [[`${l.id}: ${s.label}`, s.figure] as [string, CardFigure]] : [],
        )
      : [],
);

it('every card figure fits what is drawn', () => {
  const problems = figures.flatMap(([where, f]) =>
    cardFigureProblems(f).map((p) => `${where}: ${p}`),
  );
  expect(problems).toEqual([]);
});

it('catches figures that do not fit', () => {
  expect(cardFigureProblems({ kind: 'map', area: 'northAmerica', pin: [30, 10] })).toHaveLength(1);
  expect(cardFigureProblems({ kind: 'map', area: 'world', region: 'gulf of mexico' })).toHaveLength(
    1,
  );
  expect(cardFigureProblems({ kind: 'cell', type: 'animal', highlight: 'wall' })).toHaveLength(1);
  expect(cardFigureProblems({ kind: 'dotPlot', values: [4] })).not.toEqual([]);
});
