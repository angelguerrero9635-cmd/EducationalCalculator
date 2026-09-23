import { useEffect, useState } from 'react';

import { applyAppearance, prefsStore } from './prefs';
import { recentsStore } from './recents';

export { useAppearancePref, useSelectedLevels, type AppearancePref } from './prefs';
export { clearRecents, useRecents, useTrackRecent } from './recents';

/** Loads persisted state once at startup; returns true when ready. */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([prefsStore.hydrate(), recentsStore.hydrate()]).then(() => {
      applyAppearance(prefsStore.get().appearance);
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}
