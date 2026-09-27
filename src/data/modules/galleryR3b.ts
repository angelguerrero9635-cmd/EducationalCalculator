/**
 * Round-3 gallery demos (group B; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily. Each demo is its page with the card pictures put on, so
 * it shows the page's own cards, bins and stages.
 */
import { getLayout, type CardIcon, type LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/**
 * A sort or sequence page with a gallery id and title, each card or stage given the icon its
 * label maps to. A page renamed or rebuilt by the lesson chat drops its demo rather than
 * breaking the app; pictureRequests.test.ts then flags the missing gallery id.
 */
function withIcons(
  page: string,
  id: string,
  title: string,
  icons: Record<string, CardIcon>,
): LayoutDef | undefined {
  const l = getLayout(page);
  const figure = (label: string) =>
    icons[label] ? { figure: { kind: 'icon' as const, icon: icons[label] } } : {};
  if (l?.kind === 'sort')
    return {
      ...l,
      id,
      title,
      use: undefined,
      cards: l.cards.map((card) => ({ ...card, ...figure(card.label) })),
    };
  if (l?.kind === 'sequence')
    return {
      ...l,
      id,
      title,
      use: undefined,
      stages: l.stages.map((stage) => ({ ...stage, ...figure(stage.label) })),
    };
  return undefined;
}

export const R3B_GALLERY_MODULES: ModuleDef[] = [];

export const R3B_GALLERY_LAYOUTS: LayoutDef[] = [
  // D19: heating and cooling, undone or not.
  withIcons('s.2.heating-cooling', 'g.r3b-heating-cooling', 'Heating and cooling', {
    'Melting ice': 'melting ice cube',
    'Freezing water': 'ice cube tray',
    'Melting a crayon': 'melted crayon',
    'Melting chocolate': 'melting chocolate bar',
    'Boiling water into steam': 'pot of boiling water',
    'Cooking an egg': 'fried egg in a pan',
    'Burning paper': 'burning paper',
    'Baking bread': 'loaf of bread',
    'Toasting bread': 'slice of toast',
  }),
  // D27: grams or kilograms (the apple is group I's drawing).
  withIcons('m.3.mass-liquid-volume~which-unit', 'g.r3b-which-unit', 'Grams or kilograms', {
    Grape: 'grape',
    Letter: 'letter in an envelope',
    Bicycle: 'bicycle',
    Watermelon: 'watermelon',
    'Bag of potatoes': 'sack of potatoes',
    Child: 'person',
  }),
].filter((l): l is LayoutDef => l !== undefined);
