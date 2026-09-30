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
];
