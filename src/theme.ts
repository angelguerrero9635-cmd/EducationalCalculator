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
  /** The sunlit half of a globe or moon (lighter than the night half in both themes). */
  chartDay: '#E4E7F0',
  /** The night half of a globe or moon. */
  chartNight: '#8A8E99',
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

  chartInk: '#EEF0F6',
  chartMuted: '#9AA1B2',
  chartFill: '#262A35',
  chartSurface: '#1D2029',
  chartGrid: '#343947',
  chartHighlight: '#8B83FF',
  onChartHighlight: '#0D0F14',
  chartDay: '#4A5068',
  chartNight: '#0B0C10',
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
