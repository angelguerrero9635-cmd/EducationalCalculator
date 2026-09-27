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
  // D37: what each device gives out.
  withIcons('s.4.energy-conversion', 'g.r3b-energy-conversion', 'Energy in devices', {
    Flashlight: 'flashlight',
    Lamp: 'desk lamp',
    Toaster: 'toaster',
    'Hair dryer': 'hair dryer',
    'Electric kettle': 'kettle',
    Buzzer: 'buzzer',
    Speaker: 'speaker',
    Doorbell: 'doorbell',
    Fan: 'electric fan',
    'Electric car': 'electric car',
  }),
  // D38: one circuit, stage by stage.
  withIcons('s.4.energy-conversion~trace', 'g.r3b-energy-trace', 'Energy in a flashlight', {
    'The battery stores energy': 'circuit battery',
    'Electric current carries it along the wire': 'circuit wire current',
    'The thin wire in the bulb gets very hot': 'circuit hot filament',
    'The bulb gives out light and heat': 'circuit lit bulb',
  }),
  // D41: messages carried by light or by sound.
  withIcons('s.4.vision-light~signals', 'g.r3b-signals', 'Signals by light or sound', {
    'Flashlight code': 'flashing flashlight',
    Lighthouse: 'lighthouse',
    'Traffic light': 'traffic light',
    'Flag colors on a ship': 'ship with signal flags',
    'Drum beats': 'drum',
    'Ship’s horn': 'ship horn',
    'Buzzer code': 'buzzer',
    'School bell': 'school bell',
  }),
].filter((l): l is LayoutDef => l !== undefined);
