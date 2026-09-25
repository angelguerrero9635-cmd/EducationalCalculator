import { createContext, Children, Fragment, useContext, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, space, useCardShadow, usePalette } from '@/theme';

/** True inside a Group: rows draw flat, with a line between them, instead of as cards. */
export const InGroup = createContext(false);
export const useInGroup = () => useContext(InGroup);

/** Rows in one rounded box, separated by thin lines (settings-style grouping). */
export function Group({ children }: { children: ReactNode }) {
  const c = usePalette();
  const shadow = useCardShadow();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <InGroup.Provider value>
      <View style={[styles.group, { backgroundColor: c.card }, shadow]}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={[styles.line, { backgroundColor: c.border }]} /> : null}
            {child}
          </Fragment>
        ))}
      </View>
    </InGroup.Provider>
  );
}

const styles = StyleSheet.create({
  group: { marginHorizontal: space.lg, borderRadius: radius.lg, overflow: 'hidden' },
  line: { height: StyleSheet.hairlineWidth, marginLeft: space.lg },
});
