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
  // D25: s.2.erosion-landforms~slow-it.
  cardSort(
    'g.r3f-slow-it',
    'Slowing wind and water',
    'Does it slow the wind or the water?',
    [
      ['wind', 'Slows wind', 'It stands in the wind’s way.'],
      ['water', 'Slows water', 'It holds the soil or blocks the water.'],
    ],
    [
      ['Row of trees', 'wind', 'row of trees'],
      ['Snow fence', 'wind', 'snow fence'],
      ['Sandbags along a river', 'water', 'sandbags on riverbank'],
      ['Wall of rocks', 'water', 'rock wall at shore'],
      ['Dam', 'water', 'dam'],
    ],
  ),
  // D46: s.4.natural-resources (Sunlight → the existing 'sun').
  cardSort(
    'g.r3f-energy',
    'Energy resources',
    'Will this energy source run out?',
    [
      ['renewable', 'Renewable', 'Nature makes more of it in a lifetime, or it never runs out.'],
      ['nonrenewable', 'Nonrenewable', 'Once used, it is gone for a very long time.'],
    ],
    [
      ['Sunlight', 'renewable', 'sun'],
      ['Wind', 'renewable', 'wind turbine'],
      ['Moving water', 'renewable', 'dam'],
      ['Wood', 'renewable', 'stack of logs'],
      ['Heat from inside Earth', 'renewable', 'geyser'],
      ['Coal', 'nonrenewable', 'lumps of coal'],
      ['Oil', 'nonrenewable', 'oil pump'],
      ['Natural gas', 'nonrenewable', 'gas stove flame'],
      ['Uranium', 'nonrenewable', 'nuclear power plant'],
    ],
  ),
  // D47: s.4.natural-resources~hazards.
  cardSort(
    'g.r3f-natural-hazards',
    'Protecting against natural hazards',
    'Which hazard does this protect against?',
    [
      ['flood', 'Flood', 'Keep water out, or keep homes above it.'],
      ['earthquake', 'Earthquake', 'Keep buildings and shelves from falling.'],
      ['wildfire', 'Wildfire', 'Leave nothing near homes for the fire to burn.'],
      ['hurricane', 'Hurricane', 'Hold roofs and windows against strong wind.'],
    ],
    [
      ['Levee along a river', 'flood', 'levee'],
      ['Sandbags', 'flood', 'sandbag wall'],
      ['House raised on posts', 'flood', 'house on stilts'],
      ['Braced walls', 'earthquake', 'braced walls'],
      ['Shelves bolted to the wall', 'earthquake', 'bolted shelves'],
      ['Brush cleared near houses', 'wildfire', 'cleared brush around house'],
      ['Fire break', 'wildfire', 'fire break'],
      ['Storm shutters', 'hurricane', 'storm shutters'],
      ['Roof strapped to the walls', 'hurricane', 'roof straps'],
    ],
  ),
  // D61: s.6.weather-fronts~forecast.
  cardSort(
    'g.r3f-forecast',
    'Stormy or fair?',
    'What weather is likely next?',
    [
      [
        'wet',
        'Clouds and rain likely',
        'Air is rising, so it cools and its water vapor condenses.',
      ],
      ['fair', 'Clear and dry likely', 'Air is sinking, so it warms and clouds dry up.'],
    ],
    [
      ['The barometer is falling fast', 'wet', 'barometer falling'],
      ['A low-pressure center is moving in', 'wet', 'low pressure center'],
      ['A cold front is a few hours away', 'wet', 'cold front near town'],
      ['Warm, humid air is rising up a mountainside', 'wet', 'air rising up mountain'],
      ['The barometer is rising', 'fair', 'barometer rising'],
      ['A high-pressure center is overhead', 'fair', 'high pressure center'],
      [
        'A cold front passed last night and the wind is from the northwest',
        'fair',
        'cold front past town',
      ],
      ['Dry air is sinking over the area', 'fair', 'air sinking over land'],
    ],
  ),
];
