import { useCallback, useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import { sanitizeLevels, type LevelKey } from '@/data/selectors';

import { createPersistedStore } from './persistedStore';

export type AppearancePref = 'system' | 'light' | 'dark';

export interface Prefs {
  onboarded: boolean;
  levels: LevelKey[];
  appearance: AppearancePref;
}

const DEFAULT_PREFS: Prefs = { onboarded: false, levels: [], appearance: 'system' };

function parsePrefs(raw: unknown): Prefs {
  const r = (raw ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  const appearance = r.appearance === 'light' || r.appearance === 'dark' ? r.appearance : 'system';
  return { onboarded: r.onboarded === true, levels: sanitizeLevels(r.levels), appearance };
}

export const prefsStore = createPersistedStore<Prefs>('prefs.v1', DEFAULT_PREFS, parsePrefs);

export const applyAppearance = (pref: AppearancePref) =>
  Appearance.setColorScheme(pref === 'system' ? 'unspecified' : pref);

const usePrefs = () => useSyncExternalStore(prefsStore.subscribe, prefsStore.get);

/** Grade levels / Higher Ed fields picked in onboarding (editable in Settings). */
export function useSelectedLevels() {
  const { levels, onboarded } = usePrefs();

  const setLevels = useCallback(
    (next: LevelKey[]) => prefsStore.set((p) => ({ ...p, levels: sanitizeLevels(next) })),
    [],
  );
  const toggleLevel = useCallback(
    (key: LevelKey) =>
      prefsStore.set((p) => ({
        ...p,
        levels: sanitizeLevels(
          p.levels.includes(key) ? p.levels.filter((k) => k !== key) : [...p.levels, key],
        ),
      })),
    [],
  );
  const completeOnboarding = useCallback(
    (selected: LevelKey[]) =>
      prefsStore.set((p) => ({ ...p, onboarded: true, levels: sanitizeLevels(selected) })),
    [],
  );

  return { levels, onboarded, setLevels, toggleLevel, completeOnboarding };
}

export function useAppearancePref() {
  const { appearance } = usePrefs();
  const setAppearance = useCallback((pref: AppearancePref) => {
    prefsStore.set((p) => ({ ...p, appearance: pref }));
    applyAppearance(pref);
  }, []);
  return [appearance, setAppearance] as const;
}
