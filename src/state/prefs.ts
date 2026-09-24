import { useCallback, useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import { sanitizeLevels, type LevelKey } from '@/data/selectors';
import type { UnitSystem } from '@/engine/units';

import { createPersistedStore } from './persistedStore';

export type AppearancePref = 'system' | 'light' | 'dark';

export interface Prefs {
  onboarded: boolean;
  levels: LevelKey[];
  appearance: AppearancePref;
  /** Default units for modules (each module can still switch, or mix units). */
  units: UnitSystem;
}

const DEFAULT_PREFS: Prefs = {
  onboarded: false,
  levels: [],
  appearance: 'system',
  units: 'metric',
};

function parsePrefs(raw: unknown): Prefs {
  const r = (raw ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  const appearance = r.appearance === 'light' || r.appearance === 'dark' ? r.appearance : 'system';
  const units = r.units === 'us' ? 'us' : 'metric';
  return {
    onboarded: r.onboarded === true,
    levels: sanitizeLevels(r.levels),
    appearance,
    units,
  };
}

export const prefsStore = createPersistedStore<Prefs>('prefs.v1', DEFAULT_PREFS, parsePrefs);

/** Overrides the app's color scheme (no-op where unsupported, e.g. web). */
export function applyAppearance(pref: AppearancePref) {
  try {
    Appearance.setColorScheme?.(pref === 'system' ? 'unspecified' : pref);
  } catch {
    // Unsupported platform: the app keeps following the system setting.
  }
}

const usePrefs = () =>
  useSyncExternalStore(prefsStore.subscribe, prefsStore.get, prefsStore.getInitial);

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

/** Default unit system for modules. */
export function useUnitsPref() {
  const { units } = usePrefs();
  const setUnits = useCallback(
    (next: UnitSystem) => prefsStore.set((p) => ({ ...p, units: next })),
    [],
  );
  return [units, setUnits] as const;
}
