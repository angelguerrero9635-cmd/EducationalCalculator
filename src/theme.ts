import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { prefsStore } from '@/state/prefs';

/** Low-fidelity grayscale wireframe palette. */
const light = {
  background: '#FFFFFF',
  surface: '#F2F2F2',
  placeholder: '#E0E0E0',
  border: '#C7C7C7',
  text: '#111111',
  textMuted: '#6B6B6B',
  accent: '#333333',
  onAccent: '#FFFFFF',
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

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 6, md: 10, pill: 999 };
export const font = { caption: 12, body: 16, title: 22, headline: 28 };
