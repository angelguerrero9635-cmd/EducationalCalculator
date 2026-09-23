/**
 * The app's entire look lives in this file. To restyle the app, change values here:
 * palettes (light and dark), the font family and type scale, spacing, corner radius, and
 * chart styling. Components read these tokens and hardcode no colors, fonts or sizes.
 */
import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { prefsStore } from '@/state/prefs';

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Low-fidelity grayscale wireframe palette. */
const light = {
  background: '#FFFFFF',
  /** Secondary backgrounds: section headers, cards, pressed rows. */
  surface: '#F2F2F2',
  /** Placeholder boxes and the "not yet built" areas. */
  placeholder: '#E0E0E0',
  border: '#C7C7C7',
  text: '#111111',
  textMuted: '#6B6B6B',
  /** Primary buttons, selected chips and segments. */
  accent: '#333333',
  onAccent: '#FFFFFF',

  // Charts and diagrams (can be styled separately from the rest of the app).
  /** Main lines, shapes' outlines and labels. */
  chartInk: '#111111',
  /** Secondary lines (guides, dashed helpers) and secondary labels. */
  chartMuted: '#6B6B6B',
  /** Shape fills (rectangles, circles, bars you can drag). */
  chartFill: '#E0E0E0',
  /** Secondary fills (calculated bars, empty grid cells, table header). */
  chartSurface: '#F2F2F2',
  /** Grid lines, cell borders and axis frames. */
  chartGrid: '#C7C7C7',
  /** Highlighted data (shaded squares, the selected table row). */
  chartHighlight: '#333333',
  onChartHighlight: '#FFFFFF',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#000000',
  surface: '#1C1C1E',
  placeholder: '#2C2C2E',
  border: '#3A3A3C',
  text: '#F2F2F2',
  textMuted: '#9A9A9A',
  accent: '#D6D6D6',
  onAccent: '#000000',

  chartInk: '#F2F2F2',
  chartMuted: '#9A9A9A',
  chartFill: '#2C2C2E',
  chartSurface: '#1C1C1E',
  chartGrid: '#3A3A3C',
  chartHighlight: '#D6D6D6',
  onChartHighlight: '#000000',
};

export const palettes = { light, dark };

const getAppearance = () => prefsStore.get().appearance;

/**
 * The color scheme in effect: the Settings → Appearance choice, or the device setting for
 * "System". Read from app state (not just Appearance) so the override also works on web.
 */
export function useResolvedScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const pref = useSyncExternalStore(prefsStore.subscribe, getAppearance);
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function usePalette(): Palette {
  return useResolvedScheme() === 'dark' ? dark : light;
}

// ─── Type, spacing, shape ────────────────────────────────────────────────────

export const font = {
  /**
   * Font family for all text, charts and navigation headers. `undefined` = the system font
   * (San Francisco on iOS). Custom fonts must be loaded first (e.g. with expo-font).
   */
  family: undefined as string | undefined,
  caption: 12,
  body: 16,
  title: 22,
  headline: 28,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 6, md: 10, pill: 999 };

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
