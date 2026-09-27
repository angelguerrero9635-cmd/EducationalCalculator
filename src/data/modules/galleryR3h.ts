/**
 * Round-3 gallery demos (group H; see pictureRequests.ts). Spread into gallery.ts; kept apart so
 * that file's other demos merge easily.
 */
import type { CardFigure, LayoutDef, MoonPhase } from './layouts';
import type { MapRegion } from './layouts/types';
import type { ModuleDef } from './types';

export const R3H_GALLERY_MODULES: ModuleDef[] = [];

const moon = (phase: MoonPhase): CardFigure => ({ kind: 'moon', phase });
const pin = (lon: number, lat: number, area: 'world' | 'pacific' | 'northAmerica' = 'world') =>
  ({ kind: 'map', area, pin: [lon, lat] }) as CardFigure;
const region = (r: MapRegion, area: 'world' | 'pacific' | 'northAmerica'): CardFigure => ({
  kind: 'map',
  area,
  region: r,
});
const dots = (values: number[]): CardFigure => ({ kind: 'dotPlot', values });

export const R3H_GALLERY_LAYOUTS: LayoutDef[] = [
  // D15: s.1.sky-patterns~moon
  {
    kind: 'sequence',
    id: 'g.r3h-moon',
    title: 'The moon’s shapes in order',
    assumptions: ['The moon’s shape changes in a pattern.', 'Then it shrinks back the same way.'],
    question: 'Put the shapes in order, from new moon to full moon.',
    stages: [
      { label: 'New moon', span: 1, figure: moon('new') },
      { label: 'Thin crescent', span: 6, figure: moon('waxing crescent') },
      { label: 'Half moon', span: 1, figure: moon('first quarter') },
      { label: 'Almost full', span: 6, figure: moon('waxing gibbous') },
      { label: 'Full moon', span: 1, figure: moon('full') },
    ],
    unit: 'days',
    totalLabel: 'New moon to full moon',
  },
  // D16: s.1.sky-patterns~moon-waning
  {
    kind: 'sequence',
    id: 'g.r3h-moon-waning',
    title: 'The moon shrinks back',
    assumptions: [
      'After full moon, the lit part gets smaller each night.',
      'The shapes come back in the same order, the other way round.',
    ],
    question: 'Put the shapes in order, from full moon to new moon.',
    stages: [
      { label: 'Full moon', span: 1, figure: moon('full') },
      { label: 'Almost full', span: 6, figure: moon('waning gibbous') },
      { label: 'Half moon', span: 1, figure: moon('third quarter') },
      { label: 'Thin crescent', span: 6, figure: moon('waning crescent') },
      { label: 'New moon', span: 1, figure: moon('new') },
    ],
    unit: 'days',
    totalLabel: 'Full moon to new moon',
  },
  // D56: s.5.shadows-day-night~season-stars
  {
    kind: 'sort',
    id: 'g.r3h-season-stars',
    title: 'Star patterns by season',
    assumptions: [
      'As Earth goes around the sun, the night side faces different stars.',
      'Some star patterns near the North Star are seen all year.',
    ],
    question: 'When is it seen in the evening sky?',
    bins: [
      { id: 'winter', label: 'Winter', why: 'The night side faces these stars in winter.' },
      { id: 'summer', label: 'Summer', why: 'The night side faces these stars in summer.' },
      { id: 'all', label: 'All year', why: 'They circle close to the North Star and never set.' },
    ],
    cards: (
      [
        ['Orion', 'winter'],
        ['Taurus', 'winter'],
        ['Scorpius', 'summer'],
        ['Cygnus', 'summer'],
        ['Big Dipper', 'all'],
        ['Cassiopeia', 'all'],
      ] as const
    ).map(([label, bin]) => ({ label, bin, figure: { kind: 'stars', constellation: label } })),
  },
  // D45: s.4.weathering~map-patterns
  {
    kind: 'sort',
    id: 'g.r3h-map-patterns',
    title: 'Where volcanoes and earthquakes happen',
    assumptions: [
      'Most volcanoes and earthquakes happen in lines along the edges of oceans.',
      'Those lines are where pieces of Earth’s crust meet.',
    ],
    question: 'Where is it on a map of volcanoes and earthquakes?',
    bins: [
      {
        id: 'edge',
        label: 'Along the edges of oceans',
        why: 'Many volcanoes and earthquakes, in long lines.',
      },
      { id: 'middle', label: 'Middle of a continent', why: 'Few volcanoes or earthquakes.' },
    ],
    cards: [
      {
        label: 'Volcanoes around the Pacific Ocean',
        bin: 'edge',
        figure: region('pacific ocean', 'pacific'),
      },
      { label: 'Earthquakes in Japan', bin: 'edge', figure: pin(138, 36, 'pacific') },
      { label: 'The Andes mountains', bin: 'edge', figure: region('andes', 'pacific') },
      { label: 'Volcanoes in Alaska', bin: 'edge', figure: pin(-154, 58, 'pacific') },
      { label: 'The Great Plains', bin: 'middle', figure: region('great plains', 'pacific') },
      {
        label: 'Central Australia',
        bin: 'middle',
        figure: region('central australia', 'pacific'),
      },
      { label: 'The Sahara', bin: 'middle', figure: region('sahara', 'pacific') },
    ],
  },
  // D60: s.6.weather-fronts~air-masses
  {
    kind: 'sort',
    id: 'g.r3h-air-masses',
    title: 'Where an air mass formed',
    assumptions: [
      'An air mass takes on the temperature and humidity of the land or ocean it sits over.',
      'Continental means over land (dry); maritime means over ocean (humid).',
    ],
    question: 'Which kind of air mass is it?',
    bins: [
      { id: 'cP', label: 'Continental polar (land, cold)', why: 'Forms over cold land.' },
      { id: 'mP', label: 'Maritime polar (ocean, cold)', why: 'Forms over cold ocean.' },
      { id: 'mT', label: 'Maritime tropical (ocean, warm)', why: 'Forms over warm ocean.' },
      { id: 'cT', label: 'Continental tropical (land, warm)', why: 'Forms over hot desert.' },
    ],
    cards: (
      [
        ['Air from northern Canada in winter', 'cP', 'northern canada'],
        ['Frigid, dry air from the Arctic lands', 'cP', 'arctic lands'],
        ['Air from the North Pacific near Alaska', 'mP', 'north pacific'],
        ['Cool, damp air over the North Atlantic', 'mP', 'north atlantic'],
        ['Air from the Gulf of Mexico', 'mT', 'gulf of mexico'],
        ['Warm, muggy air from the Caribbean Sea', 'mT', 'caribbean sea'],
        ['Air from the deserts of northern Mexico', 'cT', 'northern mexico'],
        ['Hot, dry air over the desert Southwest', 'cT', 'desert southwest'],
      ] as const
    ).map(([label, bin, r]) => ({ label, bin, figure: region(r, 'northAmerica') })),
  },
  // D62: s.6.plate-tectonics~boundaries
  {
    kind: 'sort',
    id: 'g.r3h-boundaries',
    title: 'What the plates are doing',
    assumptions: [
      'Plates move apart, push together or slide past each other.',
      'Each kind of boundary makes its own landforms and hazards.',
    ],
    question: 'What are the plates doing here?',
    bins: [
      { id: 'apart', label: 'Moving apart (divergent)', why: 'New crust forms in the gap.' },
      { id: 'together', label: 'Pushing together (convergent)', why: 'Crust sinks or crumples.' },
      { id: 'past', label: 'Sliding past (transform)', why: 'The plates grind sideways.' },
    ],
    cards: [
      { label: 'Mid-Atlantic Ridge', bin: 'apart', figure: pin(-42, 30) },
      { label: 'Iceland', bin: 'apart', figure: pin(-19, 65) },
      { label: 'East African Rift', bin: 'apart', figure: pin(36.5, 0) },
      { label: 'Himalayas', bin: 'together', figure: pin(84, 28.5) },
      { label: 'Andes Mountains', bin: 'together', figure: pin(-69, -20) },
      { label: 'Mariana Trench', bin: 'together', figure: pin(142.2, 11.3) },
      { label: 'Mount St. Helens', bin: 'together', figure: pin(-122.2, 46.2, 'northAmerica') },
      { label: 'San Andreas Fault', bin: 'past', figure: pin(-120.5, 35.5, 'northAmerica') },
      { label: 'North Anatolian Fault in Turkey', bin: 'past', figure: pin(35, 40.8) },
    ],
  },
  // D64: m.6.center-spread~mean-or-median
  {
    kind: 'sort',
    id: 'g.r3h-mean-median',
    title: 'Mean or median?',
    assumptions: [
      'An outlier is a value far from the rest.',
      'An outlier pulls the mean toward it; the median barely moves.',
    ],
    question: 'Which describes the center better?',
    bins: [
      { id: 'median', label: 'The median', why: 'An outlier or a long tail pulls the mean.' },
      { id: 'mean', label: 'The mean works', why: 'The data is balanced, with no outliers.' },
    ],
    cards: [
      { label: '2, 3, 3, 4, 40', bin: 'median', figure: dots([2, 3, 3, 4, 40]) },
      { label: '1, 50, 52, 53, 55', bin: 'median', figure: dots([1, 50, 52, 53, 55]) },
      {
        label: 'Homework minutes: 20, 25, 30, 25, 180',
        bin: 'median',
        figure: dots([20, 25, 30, 25, 180]),
      },
      { label: '10, 11, 12, 13, 14', bin: 'mean', figure: dots([10, 11, 12, 13, 14]) },
      {
        label: 'Heights: 150, 152, 151, 153, 149 cm',
        bin: 'mean',
        figure: dots([150, 152, 151, 153, 149]),
      },
      { label: 'Highs: 21, 22, 20, 23, 22 °C', bin: 'mean', figure: dots([21, 22, 20, 23, 22]) },
    ],
  },
  // D58: s.6.cell-organelles~plant-animal
  {
    kind: 'sort',
    id: 'g.r3h-plant-animal',
    title: 'Plant cells and animal cells',
    assumptions: [
      'Every living cell has a membrane and cytoplasm.',
      'Each card outlines the part in a plant cell, which has them all.',
    ],
    question: 'Which cells have it?',
    bins: [
      { id: 'plant', label: 'Plant cells only', why: 'Plants make their own food.' },
      { id: 'both', label: 'Plant and animal cells', why: 'Both cells have these.' },
    ],
    cards: (
      [
        ['Cell wall', 'plant', 'wall'],
        ['Chloroplasts', 'plant', 'chloroplasts'],
        ['One large central vacuole', 'plant', 'vacuole'],
        ['Nucleus', 'both', 'nucleus'],
        ['Cell membrane', 'both', 'membrane'],
        ['Cytoplasm', 'both', 'cytoplasm'],
        ['Mitochondria', 'both', 'mitochondria'],
      ] as const
    ).map(([label, bin, part]) => ({
      label,
      bin,
      figure: { kind: 'cell', type: 'plant', highlight: part },
    })),
  },
  // D58, the animal cell with the parts it has.
  {
    kind: 'sequence',
    id: 'g.r3h-animal-parts',
    title: 'An animal cell’s parts',
    assumptions: ['The animal cell drawn with each part outlined.', 'Animal cells have no wall.'],
    question: 'Put the parts in order, from the outside in.',
    stages: (
      [
        ['Cell membrane', 'membrane'],
        ['Cytoplasm', 'cytoplasm'],
        ['Mitochondria', 'mitochondria'],
        ['Nucleus', 'nucleus'],
      ] as const
    ).map(([label, part]) => ({
      label,
      figure: { kind: 'cell', type: 'animal', highlight: part },
    })),
  },
];
