import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { pushRecent, resolveItem, type ResolvedItem } from '@/data/selectors';

import { createPersistedStore } from './persistedStore';

const parseRecents = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((k): k is string => typeof k === 'string').slice(0, 10) : [];

export const recentsStore = createPersistedStore<string[]>('recents.v1', [], parseRecents);

export const addRecent = (key: string) => recentsStore.set((list) => pushRecent(list, key));
export const clearRecents = () => recentsStore.set([]);

/** Last 10 viewed skills/courses/topics, newest first; entries no longer in the taxonomy are hidden. */
export function useRecents(): ResolvedItem[] {
  const keys = useSyncExternalStore(
    recentsStore.subscribe,
    recentsStore.get,
    recentsStore.getInitial,
  );
  return useMemo(() => keys.flatMap((k) => resolveItem(k) ?? []), [keys]);
}

/** Records a view of `key` (a node id or topic key) when the screen mounts. */
export function useTrackRecent(key: string | undefined) {
  useEffect(() => {
    if (key && resolveItem(key)) addRecent(key);
  }, [key]);
}
