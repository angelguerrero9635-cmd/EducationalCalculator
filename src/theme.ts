/**
 * The app's entire look lives in this file. To restyle the app, change values here:
 * palettes (light and dark), the font family and type scale, spacing, corner radius, and
 * chart styling. Components read these tokens and hardcode no colors, fonts or sizes.
 */
import { useSyncExternalStore } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { prefsStore } from '@/state/prefs';

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Light theme: a cool off-white page, white cards and an indigo accent. */
const light = {
  background: '#F5F6FA',
  /** Secondary backgrounds: inputs, segmented-control tracks, pressed rows. */
  surface: '#ECEEF4',
  /** Cards and boxes that sit on the page. */
  card: '#FFFFFF',
  /** The selected part of a segmented control. */
  thumb: '#FFFFFF',
  /** Placeholder boxes and the "not yet built" areas. */
  placeholder: '#E3E6EE',
  border: '#DDE1EA',
  text: '#14161F',
  textMuted: '#636A7A',
  /** Primary buttons, selected chips and segments, links, the active tab. */
  accent: '#4F46E5',
  /** A tint of the accent for soft highlights (selected rows, badges). */
  accentSoft: '#EEF0FF',
  onAccent: '#FFFFFF',
  /** The hero banner's gradient, top-left to bottom-right. */
  heroFrom: '#4F46E5',
  heroTo: '#7C3AED',
  onHero: '#FFFFFF',
  /** The dimmed page behind a menu or sheet. */
  scrim: 'rgba(0, 0, 0, 0.35)',

  // Charts and diagrams (can be styled separately from the rest of the app).
  /** Main lines, shapes' outlines and labels. */
  chartInk: '#1B1E28',
  /** Secondary lines (guides, dashed helpers) and secondary labels. */
  chartMuted: '#6B7280',
  /** Shape fills (rectangles, circles, bars you can drag). */
  chartFill: '#E4E7F0',
  /** Secondary fills (calculated bars, empty grid cells, table header). */
  chartSurface: '#F1F3F8',
  /** Grid lines, cell borders and axis frames. */
  chartGrid: '#D5D9E3',
  /** Highlighted data (solid counters, shaded squares, the selected table row). */
  chartHighlight: '#4F46E5',
  onChartHighlight: '#FFFFFF',
  /** A second color for counters and parts beside the highlight (the yellow of two-color counters). */
  chartSecond: '#F4B740',
  /** The sunlit half of a globe or moon (lighter than the night half in both themes). */
  chartDay: '#E4E7F0',
  /** The night half of a globe or moon. */
  chartNight: '#8A8E99',

  // Materials: real objects in pictures (jugs of water, coins, wood, rock) drawn in their own
  // colors, so a picture reads like the thing it shows. Shading is layered on with the sheen.
  /** Water and other clear liquids. */
  water: '#4FA3E3',
  waterDeep: '#2677BD',
  /** The lighter band at a liquid's surface. */
  waterTop: '#A9D5F6',
  /** A glass wall's tint, its outline and its shine. */
  glass: '#EEF5FB',
  glassEdge: '#8FA6BD',
  glassShine: '#FFFFFF',
  /** Thermometer liquid. */
  mercury: '#E0453A',
  /** Pennies. */
  copper: '#D08A52',
  copperDark: '#8E4F24',
  /** Nickels, dimes and quarters. */
  silver: '#DCE1E7',
  silverDark: '#8A95A2',
  /** Numbers stamped on silver coins and on pennies. */
  coinInk: '#232833',
  pennyInk: '#FFF7EE',
  /** Dollar bills: paper and ink. */
  bill: '#D5E8CB',
  billInk: '#35613A',
  /** Rulers, crates, meter sticks, the base of a balance. */
  wood: '#E8C08A',
  woodDark: '#B07F45',
  /** Metal parts: scale bodies, pans, dials. */
  metal: '#CDD3DB',
  metalDark: '#7D8795',
  /** A clock face, a dial or a card. */
  paper: '#FFFDF8',
  /** Plain cloth (an umbrella's canopy beside a colored one). */
  fabric: '#D9DCE3',
  /** Rock layers, top to bottom: sandstone, shale, limestone, siltstone, mudstone, clay. */
  rock1: '#EACB92',
  rock2: '#A7B0BA',
  rock3: '#DDD7C6',
  rock4: '#C9A57E',
  rock5: '#9C8A77',
  rock6: '#D4B7A0',
  /** Nature scenes (food web, sky, garden): the sun, the moon, animals, soil and cups. */
  sunDisk: '#F7C948',
  sunRay: '#EFA23A',
  moonLit: '#F4F0DC',
  moonDark: '#5A5F6E',
  /** Hawk feathers (back and belly), snake scales, frog skin, insect (fur is with the card icons). */
  feather: '#8C5E3C',
  featherLight: '#EADFCB',
  scales: '#8A9A48',
  frogSkin: '#5DAA4E',
  insect: '#A7C23E',
  animalEye: '#1B1E28',
  /** Garden soil, and a dark and a light cup. */
  soil: '#8B6A4E',
  soilDark: '#5E4634',
  cupDark: '#2E323C',
  cupLight: '#F6F5F0',
  /** Pattern blocks in their classroom colors: red trapezoid, blue rhombus, green triangle. */
  blockRed: '#E5484D',
  blockBlue: '#3E7BD6',
  blockGreen: '#3DA35D',
  onBlock: '#FFFFFF',
  /** Lamp light through a microscope slide: bright in both themes, as it is in life. */
  slideLight: '#FFFBEA',
  /** Plastic tools (protractors, counters' tray). */
  plastic: '#DCEBFF',
  /** Living things: cells, leaves. */
  life: '#8FCB8A',
  lifeDeep: '#4E9A4E',
  /** Animals and people in card icons: brown, dark brown, tan and grey fur, and skin. */
  fur: '#A8764A',
  furDark: '#6B4428',
  furLight: '#DDB88C',
  furGrey: '#9EA4AC',
  skin: '#E2AE86',
  /** People in the round-3 scene icons (group G): more skin tones, and the sky at dawn and dusk. */
  skinBrown: '#B67B52',
  skinDeep: '#7B4A2E',
  skyMorning: '#BFE3F7',
  skyEvening: '#F5A36A',
  /** Snow, and white fur and feathers. */
  snow: '#FAFCFF',
  /** A seal's blubber in a cut-away. */
  fat: '#F4E2B0',
  /** Tree bark. */
  bark: '#8A6F58',
  /** Pink flower petals (a rose, a bean flower), an earthworm's skin, and bright pollen. */
  petalPink: '#F08DB4',
  wormPink: '#D98A86',
  pollen: '#FFD21F',
  /** Black rubber and plastic (tires, a pan handle), and black fur and feathers. */
  rubber: '#34373E',
  /** Orange things: a wind sock, juice, a goldfish. */
  orange: '#F08A2C',
  /** A purple spinner sector or marble (beside the pattern-block red, blue and green). */
  purple: '#8E5BD0',
  /**
   * Atoms in ball-and-stick molecules, in the classroom (CPK) colors: hydrogen white, carbon
   * black, oxygen red, nitrogen blue, chlorine and fluorine green, sulfur yellow, phosphorus
   * orange, sodium and potassium violet, other metals grey, noble gases cyan, the rest pink.
   * `atomInk` and `onAtom` are the symbols printed on light and dark balls; `atomBond` the sticks.
   */
  atomH: '#F4F5F7',
  atomC: '#3A3E46',
  atomO: '#E0403A',
  atomN: '#3C64D8',
  atomHalogen: '#3DAE4A',
  atomS: '#EDC937',
  atomP: '#EE8A2E',
  atomAlkali: '#9457D0',
  atomMetal: '#A3ABB6',
  atomNoble: '#4CC3D6',
  atomOther: '#E07FBE',
  atomInk: '#1B1E28',
  onAtom: '#FFFFFF',
  atomBond: '#9AA1AC',
  /** Periodic-table families (flat fills): metals, metalloids, nonmetals, noble gases. */
  tableMetal: '#D7E4F7',
  tableMetalloid: '#DCEFD2',
  tableNonmetal: '#FCEBC4',
  tableNoble: '#E9DDF8',
  /** The visible spectrum in rainbow order (vivid in both themes, as light is). */
  spectrumRed: '#E53935',
  spectrumOrange: '#F57C00',
  spectrumYellow: '#FDD835',
  spectrumGreen: '#43A047',
  spectrumBlue: '#1E88E5',
  spectrumViolet: '#7B3FC4',
  /** A magnet's painted ends: north red, south blue. */
  poleNorth: '#D93A3A',
  poleSouth: '#2F6FD0',
  /** A lit bulb's warm glow. */
  bulbGlow: '#FFD95A',
  /** A flower's petals, and a body's organs: brain and lungs, heart, stomach, and bones. */
  petal: '#E8618C',
  organ: '#EFA3A8',
  organDeep: '#C83A44',
  stomach: '#E3B07A',
  bone: '#F3EEDF',
  /** Planets in their own colors (Earth is water and land; the moon is moonLit). */
  planetMercury: '#A9A39B',
  planetVenus: '#E8D3A2',
  planetMars: '#C8643B',
  planetJupiter: '#D8B48A',
  planetJupiterBand: '#A8754F',
  planetSaturn: '#E3CD92',
  planetUranus: '#9ED9DE',
  planetNeptune: '#4A74D9',
  /** A soft shadow under objects, and the dark and light sides of the sheen. */
  shadow: 'rgba(16, 24, 40, 0.16)',
  shade: '#0B1020',
  shine: '#FFFFFF',
  /** How strong highlights are: dark pictures take less, or dark fills turn grey. */
  sheen: 1,
  /** Edge light and edge shade for flat pieces drawn as views (cubes in a train). */
  edgeLight: 'rgba(255, 255, 255, 0.4)',
  edgeShade: 'rgba(0, 0, 0, 0.2)',
};

export type Palette = typeof light;

/** Dark theme: a deep blue-black page with slightly lighter cards and a softer indigo. */
const dark: Palette = {
  background: '#0D0F14',
  surface: '#1D2029',
  card: '#171A21',
  thumb: '#323846',
  placeholder: '#242833',
  border: '#2A2F3A',
  text: '#EEF0F6',
  textMuted: '#9AA1B2',
  accent: '#8B83FF',
  accentSoft: '#23224A',
  onAccent: '#0D0F14',
  heroFrom: '#3730A3',
  heroTo: '#6D28D9',
  onHero: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.55)',

  chartInk: '#EEF0F6',
  chartMuted: '#9AA1B2',
  chartFill: '#262A35',
  chartSurface: '#1D2029',
  chartGrid: '#343947',
  chartHighlight: '#8B83FF',
  onChartHighlight: '#0D0F14',
  chartSecond: '#B8862E',
  chartDay: '#4A5068',
  chartNight: '#0B0C10',

  water: '#3C8BD0',
  waterDeep: '#1F5E99',
  waterTop: '#6FB2EA',
  glass: '#1B2531',
  glassEdge: '#6B8199',
  glassShine: '#4A5E75',
  mercury: '#F0645A',
  copper: '#B8733F',
  copperDark: '#6E3A1A',
  silver: '#A7B0BB',
  silverDark: '#5E6874',
  coinInk: '#14171D',
  pennyInk: '#FFF1E2',
  bill: '#35503A',
  billInk: '#BFE0B4',
  wood: '#A67C4C',
  woodDark: '#6E4F2E',
  metal: '#4B5360',
  metalDark: '#2B313B',
  paper: '#20242E',
  fabric: '#4A505D',
  rock1: '#9C8453',
  rock2: '#5D6570',
  rock3: '#8A8676',
  rock4: '#7F6448',
  rock5: '#5B4E42',
  rock6: '#806856',
  sunDisk: '#E2B53E',
  sunRay: '#C98A2A',
  moonLit: '#DCD6B8',
  moonDark: '#2A2E39',
  feather: '#6E4A2F',
  featherLight: '#B9AA90',
  scales: '#66743A',
  frogSkin: '#428A38',
  insect: '#7E962E',
  animalEye: '#0B0C10',
  soil: '#6A5039',
  soilDark: '#43321F',
  cupDark: '#0F1116',
  cupLight: '#CDD0D6',
  blockRed: '#D8474C',
  blockBlue: '#3C74C8',
  blockGreen: '#3A9656',
  onBlock: '#FFFFFF',
  slideLight: '#E6E0C4',
  plastic: '#22324A',
  life: '#4F8A4B',
  lifeDeep: '#2F6230',
  fur: '#8A5E38',
  furDark: '#553520',
  furLight: '#A88762',
  furGrey: '#747A83',
  skin: '#B8835E',
  skinBrown: '#95633F',
  skinDeep: '#643C25',
  skyMorning: '#4E7390',
  skyEvening: '#A85A34',
  snow: '#CDD6E1',
  fat: '#C4AD76',
  bark: '#65503F',
  petalPink: '#C8698F',
  wormPink: '#A9625F',
  pollen: '#E9BE1C',
  rubber: '#1C1E23',
  orange: '#D2742A',
  purple: '#7A4DB8',
  atomH: '#D5D9DF',
  atomC: '#5D636E',
  atomO: '#D2463F',
  atomN: '#4A6FDA',
  atomHalogen: '#37984A',
  atomS: '#CDAE30',
  atomP: '#D2762A',
  atomAlkali: '#8150BD',
  atomMetal: '#848D99',
  atomNoble: '#3AA3B5',
  atomOther: '#C06CA3',
  atomInk: '#14171D',
  onAtom: '#FFFFFF',
  atomBond: '#7B828E',
  tableMetal: '#22324A',
  tableMetalloid: '#253A26',
  tableNonmetal: '#43381C',
  tableNoble: '#34284A',
  spectrumRed: '#DB3C3C',
  spectrumOrange: '#E57A1E',
  spectrumYellow: '#E8C93A',
  spectrumGreen: '#3F9848',
  spectrumBlue: '#2F80D2',
  spectrumViolet: '#8252C8',
  poleNorth: '#C94444',
  poleSouth: '#3A6FC0',
  bulbGlow: '#F2C94C',
  petal: '#C9507A',
  organ: '#C7838A',
  organDeep: '#B8323C',
  stomach: '#B98A5A',
  bone: '#D9D3C2',
  planetMercury: '#8A857E',
  planetVenus: '#BFAA7A',
  planetMars: '#A9532F',
  planetJupiter: '#B08E68',
  planetJupiterBand: '#83593A',
  planetSaturn: '#BBA56E',
  planetUranus: '#6FB2B8',
  planetNeptune: '#3A5FB8',
  shadow: 'rgba(0, 0, 0, 0.45)',
  shade: '#000000',
  shine: '#FFFFFF',
  sheen: 0.4,
  edgeLight: 'rgba(255, 255, 255, 0.3)',
  edgeShade: 'rgba(0, 0, 0, 0.35)',
};

/**
 * Color tones for cards that group things (grade bands, subjects, divisions): a soft
 * background and a strong foreground for the badge text. Picked by index.
 */
const tonesLight = [
  { bg: '#EEF0FF', fg: '#4338CA' }, // indigo
  { bg: '#FFF4DE', fg: '#B45309' }, // amber
  { bg: '#E3F7F3', fg: '#0F766E' }, // teal
  { bg: '#E6F4FF', fg: '#0369A1' }, // sky
  { bg: '#F3E8FF', fg: '#7E22CE' }, // violet
  { bg: '#FFE9EF', fg: '#BE123C' }, // rose
  { bg: '#E8F7E6', fg: '#15803D' }, // green
];
const tonesDark: typeof tonesLight = [
  { bg: '#23224A', fg: '#A5A0FF' },
  { bg: '#3A2A12', fg: '#FBBF24' },
  { bg: '#10302C', fg: '#5EEAD4' },
  { bg: '#0F2A3D', fg: '#7DD3FC' },
  { bg: '#2E1A45', fg: '#D8B4FE' },
  { bg: '#3B1822', fg: '#FDA4AF' },
  { bg: '#15301B', fg: '#86EFAC' },
];
export type Tone = (typeof tonesLight)[number];

export const palettes = { light, dark };

const getAppearance = () => prefsStore.get().appearance;
const noSubscribe = () => () => {};

/**
 * False while rendering on the server (web static rendering) and while the browser hydrates
 * that HTML; true once the page is live. Use it to hold back values the server can't know.
 */
export const useIsClient = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

/**
 * The color scheme in effect: the Settings → Appearance choice, or the device setting for
 * "System". Read from app state (not just Appearance) so the override also works on web.
 */
export function useResolvedScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const pref = useSyncExternalStore(prefsStore.subscribe, getAppearance, () => 'system' as const);
  const client = useIsClient();
  // Pre-rendered web pages are light; the browser's dark setting applies once the page is live,
  // so the first render matches the HTML.
  if (Platform.OS === 'web' && !client) return 'light';
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function usePalette(): Palette {
  return useResolvedScheme() === 'dark' ? dark : light;
}

/** Tone `i` (wraps around) for the current color scheme. */
export function useTone(i: number): Tone {
  const tones = useResolvedScheme() === 'dark' ? tonesDark : tonesLight;
  return tones[((i % tones.length) + tones.length) % tones.length]!;
}

/**
 * The soft shadow under cards (light mode); dark mode uses a border instead, since shadows
 * don't show on a dark page.
 */
export function useCardShadow() {
  return useResolvedScheme() === 'dark'
    ? { borderWidth: 1, borderColor: dark.border }
    : { boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 14px rgba(16, 24, 40, 0.06)' };
}

// ─── Type, spacing, shape ────────────────────────────────────────────────────

export const font = {
  /**
   * Font family for all text, charts and navigation headers. `undefined` = the system font
   * (San Francisco on iOS). Custom fonts must be loaded first (e.g. with expo-font).
   */
  family: undefined as string | undefined,
  /**
   * The system font stack on the web (the one react-native-web uses for text). Chart text is SVG,
   * which would otherwise fall back to the browser's serif default.
   */
  webSystem: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  caption: 12,
  body: 16,
  title: 22,
  headline: 28,
  /** Big page titles (the Home banner). */
  display: 32,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
/** Corner radius: small controls, inputs and buttons, cards, big banners. */
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };

// ─── Charts and diagrams ─────────────────────────────────────────────────────

export const chart = {
  /** Text sizes inside charts. */
  tiny: 10,
  small: 11,
  label: 12,
  value: 13,
  emphasis: 14,
  /** Line widths. */
  stroke: 2,
  strokeLight: 1.5,
  strokeHeavy: 3,
  /** Dash patterns for helper lines. */
  dash: '5 4',
  dashFine: '3 3',
  /** Drag handle: visible dot diameter, ring width, and touch target size. */
  handle: 20,
  handleRing: 2,
  handleTouch: 44,
  /** Charts never grow wider than this (tablets, desktop browsers). */
  maxWidth: 520,
};
