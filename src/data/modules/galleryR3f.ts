/**
 * Round-3 gallery demos (group F; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is its page's own sort or sequence with the card icons on its cards (cards whose
 * drawing another group owns are left out).
 */
import type { CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

/** A sort with the page's own bins and cards: [label, bin, icon]. */
function cardSort(
  id: string,
  title: string,
  question: string,
  bins: [string, string, string][],
  cards: [string, string, CardIcon][],
): LayoutDef {
  return {
    id,
    title,
    kind: 'sort',
    question,
    assumptions: ['Tap a card, then a group.', 'The drawings are what matter here.'],
    bins: bins.map(([bin, label, why]) => ({ id: bin, label, why })),
    cards: cards.map(([label, bin, icon]) => ({ label, bin, figure: { kind: 'icon', icon } })),
  };
}

export const R3F_GALLERY_MODULES: ModuleDef[] = [];
export const R3F_GALLERY_LAYOUTS: LayoutDef[] = [
  // D08: s.K.weather-patterns~storm, the page's own stages: one house and child throughout.
  {
    id: 'g.r3f-storm',
    title: 'Getting ready for a storm',
    kind: 'sequence',
    question: 'Put the jobs in order. Tap the first one, then the next.',
    assumptions: [
      'A forecast warns that a storm is coming.',
      'Get ready before the storm, not during it.',
      'Tap the jobs in order.',
    ],
    stages: (
      [
        ['Hear the forecast', 'hearing a storm forecast'],
        ['Get ready: bring toys in, close windows', 'getting ready for a storm'],
        ['Stay inside while it storms', 'staying inside in a storm'],
        ['Go out when it has passed', 'going out after a storm'],
      ] as const
    ).map(([label, icon]) => ({ label, figure: { kind: 'icon' as const, icon } })),
  },
  // D09: s.K.weather-patterns~falls (and the shared storm cloud).
  cardSort(
    'g.r3f-falls',
    'What falls from clouds?',
    'Does it fall from clouds?',
    [
      ['falls', 'Falls from clouds', 'Water drops or ice fall down to the ground.'],
      ['not', 'Does not fall', 'It moves across the ground or stays in the air.'],
    ],
    [
      ['Rain', 'falls', 'rain cloud'],
      ['Snow', 'falls', 'snow cloud'],
      ['Hail', 'falls', 'hail cloud'],
      ['Thunderstorm', 'falls', 'storm cloud'],
      ['Wind', 'not', 'tree in wind'],
      ['Fog', 'not', 'fog over houses'],
    ],
  ),
  // D36: s.3.weather-climate~hazards.
  cardSort(
    'g.r3f-weather-hazards',
    'Designs against bad weather',
    'Which weather does it protect against?',
    [
      ['flood', 'Flood', 'It keeps water out or lifts things above it.'],
      ['wind', 'Strong wind', 'It holds things down or keeps them shut.'],
      ['lightning', 'Lightning', 'It keeps the strike away from people.'],
    ],
    [
      ['Sandbag wall', 'flood', 'sandbag wall'],
      ['House on stilts', 'flood', 'house on stilts'],
      ['Levee', 'flood', 'levee'],
      ['Storm shutters', 'wind', 'storm shutters'],
      ['Tied-down roof', 'wind', 'roof straps'],
      ['Storm shelter', 'wind', 'storm shelter door'],
      ['Lightning rod', 'lightning', 'lightning rod'],
      ['Going indoors', 'lightning', 'staying inside in a storm'],
    ],
  ),
];
