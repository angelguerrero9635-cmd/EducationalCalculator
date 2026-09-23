import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersistedStore<T> {
  get(): T;
  set(update: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
  /** Loads the saved value once; safe to call repeatedly. */
  hydrate(): Promise<void>;
}

/**
 * A tiny external store backed by AsyncStorage (on-device only; nothing leaves the phone).
 * `parse` validates whatever was stored so a stale or corrupt value never crashes the app.
 */
export function createPersistedStore<T>(
  key: string,
  initial: T,
  parse: (raw: unknown) => T,
): PersistedStore<T> {
  let value = initial;
  let dirty = false;
  let hydration: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => value,
    set(update) {
      value = typeof update === 'function' ? (update as (prev: T) => T)(value) : update;
      dirty = true;
      emit();
      AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
        // Storage failures are non-fatal: the in-memory value still works for this session.
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrate() {
      hydration ??= AsyncStorage.getItem(key)
        .then((raw) => {
          // A write that happened before hydration finished wins over the stored value.
          if (raw === null || dirty) return;
          value = parse(JSON.parse(raw));
          emit();
        })
        .catch(() => undefined);
      return hydration;
    },
  };
}
