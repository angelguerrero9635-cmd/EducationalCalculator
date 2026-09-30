/**
 * Grade 12 science layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../science/12.ts`. Data only: no UI code.
 */
import type { LayoutDef } from './types';

export const SCIENCE_12_LAYOUTS: LayoutDef[] = [
  // ── Earthquakes, seismic waves and Earth's interior (HS-ESS2-3, HS-ESS1-5) ──
  {
    kind: 'sort',
    id: 's.12.earth-interior~wave-types',
    title: 'P, S or surface wave?',
    use: 'Use this for “Which seismic wave cannot travel through the liquid outer core?”',
    assumptions: [
      'P and S waves travel through Earth’s inside; surface waves travel along the ground.',
      'Liquids cannot be sheared, so S waves stop at the liquid outer core.',
    ],
    question: 'Which wave is it?',
    bins: [
      {
        id: 'p',
        label: 'P wave',
        why: 'The fastest wave pushes and pulls rock along its path, through solids and liquids.',
      },
      {
        id: 's',
        label: 'S wave',
        why: 'The slower wave shakes rock side to side, which only a solid can pass on.',
      },
      {
        id: 'surface',
        label: 'Surface wave',
        why: 'The slowest waves roll along the ground with the biggest motion.',
      },
    ],
    cards: [
      { label: 'Arrives first', bin: 'p' },
      { label: 'Squeezes and stretches rock along its path', bin: 'p' },
      { label: 'Crosses the liquid outer core', bin: 'p' },
      { label: 'Arrives second', bin: 's' },
      { label: 'Shakes rock across its path', bin: 's' },
      { label: 'Stopped by liquid', bin: 's' },
      { label: 'Travels along the ground and arrives last', bin: 'surface' },
      { label: 'Causes most damage to buildings', bin: 'surface' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.earth-interior~heat-sources',
    title: 'Earth’s heat or the Sun’s?',
    use: 'Use this for “Which of these is powered by Earth’s internal heat, like hot springs?”',
    assumptions: [
      'Earth’s internal heat comes from radioactive decay and heat left from its formation.',
      'The Sun’s energy drives the winds, the water cycle and the surface currents.',
    ],
    question: 'What powers it?',
    bins: [
      {
        id: 'inside',
        label: 'Earth’s internal heat',
        why: 'Heat flowing out from the hot interior melts rock and moves the mantle.',
      },
      {
        id: 'sun',
        label: 'Energy from the Sun',
        why: 'Sunlight warms the air, land and sea unevenly, which drives wind and water.',
      },
    ],
    cards: [
      { label: 'Hot springs', bin: 'inside' },
      { label: 'A geyser', bin: 'inside' },
      { label: 'Lava from a volcano', bin: 'inside' },
      { label: 'Mantle convection moving plates', bin: 'inside' },
      { label: 'Magma cooling into granite', bin: 'inside' },
      { label: 'Wind', bin: 'sun' },
      { label: 'Evaporation from the ocean', bin: 'sun' },
      { label: 'A hurricane', bin: 'sun' },
      { label: 'Surface ocean currents', bin: 'sun' },
      { label: 'A glacier melting in summer', bin: 'sun' },
    ],
  },

  // ── Geologic time and radiometric dating (HS-ESS1-5, HS-ESS1-6) ──
  {
    kind: 'sequence',
    id: 's.12.radiometric-dating~relative-order',
    title: 'Putting rock events in order',
    use: 'Use this for “A dike cuts three layers and stops at an eroded surface under a lava flow. Which happened first?”',
    assumptions: [
      'Superposition: lower layers are older unless folded or overturned.',
      'Cross-cutting: a rock is younger than what it cuts.',
      'An eroded surface is a gap in the record.',
    ],
    question:
      'A cliff has limestone at the bottom, then shale, then sandstone. A dike cuts all three and ends at an eroded surface under a lava flow. Put the events in order.',
    stages: [
      { label: 'Limestone is laid down', figure: { kind: 'rock', texture: 'shells' } },
      { label: 'Shale is laid down', figure: { kind: 'rock', texture: 'layers' } },
      { label: 'Sandstone is laid down', figure: { kind: 'rock', texture: 'grains' } },
      { label: 'Magma cuts through as a dike', figure: { kind: 'rock', texture: 'crystals' } },
      { label: 'Erosion cuts the top flat' },
      { label: 'Lava flows over the eroded surface', figure: { kind: 'rock', texture: 'fine' } },
    ],
  },
  {
    kind: 'sequence',
    id: 's.12.radiometric-dating~time-scale',
    title: 'The geologic time scale',
    use: 'Use this for “Order the eras of Earth’s history. How long was each?”',
    assumptions: [
      'The eras are named for their life: Paleozoic means old life, Mesozoic middle and Cenozoic new.',
      'The boundaries are dated from ash beds and lava flows by radiometric dating.',
    ],
    question: 'Put Earth’s history in order, from its formation to today.',
    stages: [
      {
        label: 'Precambrian: Earth forms; oxygen builds up and iron rusts into red beds',
        span: 4059,
      },
      { label: 'Paleozoic: shelled animals, fish, the first land plants', span: 289 },
      { label: 'Mesozoic: dinosaurs; ends with an asteroid impact', span: 186 },
      { label: 'Cenozoic: mammals spread; humans appear', span: 66 },
    ],
    unit: 'million years',
    totalLabel: 'Earth’s age',
  },

  // ── The ocean: seafloor, currents and ocean–atmosphere interaction (HS-ESS2-4, HS-ESS2-5) ──
  {
    kind: 'explore',
    id: 's.12.ocean-atmosphere~currents',
    title: 'Surface currents and the deep conveyor',
    use: 'Use this for “Why is the current on the west side of an ocean basin warm?” and “What drives the deep conveyor?”',
    assumptions: [
      'Winds drive the surface currents; differences in density drive the deep ones.',
      'Currents carry heat from the tropics toward the poles.',
    ],
    figure: { kind: 'oceanCurrents' },
    scenes: [
      {
        label: 'Gyres',
        lines: [
          'Trade winds and westerlies push the surface water.',
          'The Coriolis effect turns the flow into gyres, clockwise in the north and counterclockwise in the south.',
        ],
        currents: { view: 'gyres' },
      },
      {
        label: 'Warm and cold sides',
        lines: [
          'Warm water flows toward the poles on each basin’s west side, like the Gulf Stream.',
          'Cold water flows back toward the equator on the east side, like the California Current.',
        ],
        currents: { view: 'gyres' },
      },
      {
        label: 'The conveyor',
        lines: [
          'Cold, salty water sinks near Greenland and Antarctica.',
          'It creeps through the deep ocean and rises again; one loop takes about 1,000 years.',
        ],
        currents: { view: 'conveyor' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.ocean-atmosphere~density',
    title: 'Sinks or rises?',
    use: 'Use this for “Why does warm air rise at the equator?” and “Why does water sink near Greenland?”',
    assumptions: [
      'Colder and saltier water is denser; warmer and fresher water is less dense.',
      'Air works the same way: cold air sinks and warm air rises.',
    ],
    question: 'Does it sink or rise compared with what is around it?',
    bins: [
      {
        id: 'sinks',
        label: 'Sinks (denser)',
        why: 'Cold or salty fluid packs more mass into each liter, so it sinks under lighter fluid.',
      },
      {
        id: 'rises',
        label: 'Rises or stays on top (less dense)',
        why: 'Warm or fresh fluid is lighter than what is around it, so it is pushed up.',
      },
    ],
    cards: [
      { label: 'Cold, salty water near Greenland', bin: 'sinks' },
      { label: 'Seawater left saltier as sea ice forms', bin: 'sinks' },
      { label: 'Cold air over the poles', bin: 'sinks' },
      { label: 'Warm tropical surface water', bin: 'rises' },
      { label: 'Fresh river water entering the sea', bin: 'rises' },
      { label: 'Warm, moist air over the equator', bin: 'rises' },
    ],
  },

  // ── The atmosphere: structure, air pressure, wind and severe weather (HS-ESS2-4, HS-ESS3-1) ──
  {
    kind: 'sequence',
    id: 's.12.atmosphere-weather~hurricane',
    title: 'How a hurricane grows and dies',
    use: 'Use this for “Put the stages of a hurricane in order. Why does it weaken over land?”',
    assumptions: [
      'Warm ocean water is the fuel: water vapor gives off heat as it condenses in the storm.',
      'The wind speeds are sustained winds, not gusts.',
    ],
    question: 'Put the stages of a hurricane in order.',
    stages: [
      { label: 'Thunderstorms cluster over ocean water warmer than about 27 °C' },
      { label: 'Tropical depression: winds circle a low, under 63 km/h' },
      { label: 'Tropical storm: winds 63–118 km/h; it gets a name' },
      { label: 'Hurricane: winds of 119 km/h or more; an eye forms' },
      { label: 'Landfall: cut off from warm water, it weakens' },
    ],
  },
  {
    kind: 'sort',
    id: 's.12.atmosphere-weather~air-masses',
    title: 'Which air mass is it?',
    use: 'Use this for “Which air mass brings hot, humid summer weather to the southeastern United States?”',
    assumptions: [
      'An air mass takes on the temperature and moisture of the land or sea it forms over.',
      'Continental means dry, maritime means moist; polar means cold, tropical means warm.',
    ],
    question: 'Which air mass is this?',
    bins: [
      {
        id: 'cP',
        label: 'Continental polar (cP)',
        why: 'It forms over cold northern land, so it is cold and dry.',
      },
      {
        id: 'mP',
        label: 'Maritime polar (mP)',
        why: 'It forms over cold northern seas, so it is cool and damp.',
      },
      {
        id: 'mT',
        label: 'Maritime tropical (mT)',
        why: 'It forms over warm seas, so it is warm and humid.',
      },
      {
        id: 'cT',
        label: 'Continental tropical (cT)',
        why: 'It forms over hot deserts, so it is hot and dry.',
      },
    ],
    cards: [
      {
        label: 'Cold and dry, from northern Canada',
        bin: 'cP',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern canada' },
      },
      { label: 'Brings lake-effect snow', bin: 'cP' },
      {
        label: 'Cool and damp, from the North Pacific',
        bin: 'mP',
        figure: { kind: 'map', area: 'northAmerica', region: 'north pacific' },
      },
      { label: 'Brings drizzle to the Pacific Northwest', bin: 'mP' },
      {
        label: 'Warm and humid, from the Gulf of Mexico',
        bin: 'mT',
        figure: { kind: 'map', area: 'northAmerica', region: 'gulf of mexico' },
      },
      { label: 'Brings summer thunderstorms to the Southeast', bin: 'mT' },
      {
        label: 'Hot and dry, from the deserts of northern Mexico',
        bin: 'cT',
        figure: { kind: 'map', area: 'northAmerica', region: 'northern mexico' },
      },
      { label: 'Brings heat waves to the southern Plains', bin: 'cT' },
    ],
  },
];
