/**
 * Round-3 gallery demos (group E; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 *
 * Each demo is its page's own sort or sequence (bins, cards, stages) with the pictures filled in.
 */
import type { CardFigure, CardIcon, LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export const R3E_GALLERY_MODULES: ModuleDef[] = [];

const icon = (name: CardIcon): CardFigure => ({ kind: 'icon', icon: name });

/** A sort like the page's: [bin id, label, why] and [card label, bin, icon (none: no picture)]. */
const sort = (
  id: string,
  title: string,
  question: string,
  bins: [string, string, string][],
  cards: [string, string, CardIcon?][],
): LayoutDef => ({
  id,
  title,
  kind: 'sort',
  question,
  assumptions: ['Tap a card, then a group.', 'The drawings are what matter here.'],
  bins: bins.map(([bin, label, why]) => ({ id: bin, label, why })),
  cards: cards.map(([label, bin, name]) => ({
    label,
    bin,
    ...(name ? { figure: icon(name) } : {}),
  })),
});

/** A sequence like the page's: [stage label, figure]. */
const sequence = (
  id: string,
  title: string,
  question: string,
  stages: [string, CardFigure][],
): LayoutDef => ({
  id,
  title,
  kind: 'sequence',
  question,
  assumptions: ['Tap the stages in order.', 'Each picture is the same place, changing.'],
  stages: stages.map(([label, figure]) => ({ label, figure })),
});

export const R3E_GALLERY_LAYOUTS: LayoutDef[] = [
  // D22: s.2.erosion-landforms~map
  sort(
    'g.r3e-land-water',
    'Land and water on a map',
    'Is it land or water?',
    [
      ['land', 'Land', 'Mountains, hills and valleys are shapes of the land.'],
      ['water', 'Water', 'Lakes, rivers and oceans are bodies of water.'],
    ],
    [
      ['Mountain', 'land', 'mountain'],
      ['Hill', 'land', 'hill'],
      ['Valley', 'land', 'valley'],
      ['Island', 'land', 'island'],
      ['Lake', 'water', 'lake'],
      ['River', 'water', 'river'],
      ['Ocean', 'water', 'ocean'],
      ['Pond', 'water', 'pond'],
    ],
  ),
  // D23: s.2.erosion-landforms
  sort(
    'g.r3e-land-changes',
    'Fast and slow changes to the land',
    'Does it change the land fast or slowly?',
    [
      ['fast', 'Fast', 'A fast change happens in minutes or days.'],
      ['slow', 'Slow', 'A slow change takes many years.'],
    ],
    [
      ['Earthquake', 'fast', 'earthquake crack'],
      ['Volcano erupting', 'fast', 'erupting volcano'],
      ['Landslide', 'fast', 'landslide'],
      ['Flood', 'fast', 'flooded road'],
      ['River wearing a canyon', 'slow', 'river canyon'],
      ['Wind shaping a sand dune', 'slow', 'wind shaping dune'],
      ['Ice cracking a rock', 'slow', 'ice cracking rock'],
      ['Waves wearing a cliff', 'slow', 'waves at cliff'],
    ],
  ),
  // D26: s.2.water-on-earth
  sort(
    'g.r3e-water-on-earth',
    'Solid and liquid water',
    'Is the water solid or liquid?',
    [
      ['solid', 'Solid', 'Frozen water is ice or snow.'],
      ['liquid', 'Liquid', 'Liquid water flows and takes the shape of its container.'],
    ],
    [
      ['Glacier', 'solid', 'glacier'],
      ['Iceberg', 'solid', 'iceberg'],
      ['Snow on a mountain', 'solid', 'snowy mountain'],
      ['Frozen pond', 'solid', 'frozen pond'],
      ['Ocean', 'liquid', 'ocean'],
      ['River', 'liquid', 'river'],
      ['Lake', 'liquid', 'lake'],
      ['Puddle', 'liquid', 'puddle'],
    ],
  ),
  // D44: s.4.weathering~layers-order
  sequence(
    'g.r3e-layers-order',
    'How the rock layers formed',
    'Put the events in order, oldest first.',
    [
      ['Sand settles: the bottom layer forms', icon('sand layer under water')],
      ['Mud settles on top of the sand', icon('mud on sand')],
      ['Shells settle on the mud: a layer with fossils forms', icon('shell layer on mud')],
      ['The land is pushed up', icon('layers pushed up')],
      ['A river cuts down through the layers', icon('river cutting layers')],
    ],
  ),
  // D54: s.5.earth-spheres
  sort(
    'g.r3e-earth-spheres',
    'Earth’s four spheres',
    'Which sphere is it part of?',
    [
      ['geo', 'Geosphere', 'Rock, soil and the ground.'],
      ['hydro', 'Hydrosphere', 'All the water: oceans, rivers and ice.'],
      ['atmo', 'Atmosphere', 'The air around Earth.'],
      ['bio', 'Biosphere', 'Every living thing.'],
    ],
    [
      ['Mountain', 'geo', 'mountain'],
      ['Soil', 'geo', 'soil clump'],
      ['Sand', 'geo', 'sand dune'],
      ['Ocean', 'hydro', 'ocean'],
      ['River', 'hydro', 'river'],
      ['Glacier', 'hydro', 'glacier'],
      ['Wind', 'atmo', 'wind sock'],
      ['Nitrogen and oxygen in the air', 'atmo'],
      ['Tree', 'bio', 'leafy tree'],
      ['Fish', 'bio', 'fish'],
      ['Bird', 'bio', 'bird'],
    ],
  ),
  // D55: s.5.earth-spheres~rain-to-river
  sequence(
    'g.r3e-rain-to-river',
    'Water moving through the spheres',
    'Put the steps in order, starting at the ocean.',
    [
      [
        'Water evaporates from the ocean into the air: hydrosphere to atmosphere',
        icon('ocean water evaporating'),
      ],
      [
        'Clouds form and rain falls on a mountain: atmosphere to geosphere',
        icon('rain on mountain'),
      ],
      [
        'Rain soaks into the soil and roots take it in: geosphere to biosphere',
        icon('rain soaking into soil'),
      ],
      [
        'The rest runs in a river back to the sea: back to the hydrosphere',
        icon('river to the sea'),
      ],
    ],
  ),
  // D63: s.6.rock-cycle~sandstone
  sequence('g.r3e-sandstone', 'From mountain to sandstone', 'Put the steps in order.', [
    ['Granite on a mountain weathers into sand grains', icon('granite crumbling')],
    ['Rain and rivers carry the sand downhill', icon('river carrying sand')],
    ['The sand settles in layers on a lake or sea floor', icon('sand settling in lake')],
    ['New layers pile on top and squeeze the sand', icon('layers squeezing sand')],
    ['Minerals glue the grains into sandstone', { kind: 'rock', texture: 'grains' }],
  ]),
];
