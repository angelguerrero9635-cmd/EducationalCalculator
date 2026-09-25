import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ScrollLock {
  locked: boolean;
  setLocked: (locked: boolean) => void;
}

const ScrollLockContext = createContext<ScrollLock>({ locked: false, setLocked: () => {} });

/**
 * Lets a slider or drag handle hold the page still while the finger is on it: the page's
 * ScrollView reads `locked` and stops scrolling until the drag ends.
 */
export function ScrollLockProvider({ children }: { children: (locked: boolean) => ReactNode }) {
  const [locked, setLocked] = useState(false);
  const value = useMemo(() => ({ locked, setLocked }), [locked]);
  return <ScrollLockContext.Provider value={value}>{children(locked)}</ScrollLockContext.Provider>;
}

export const useScrollLock = () => useContext(ScrollLockContext);
