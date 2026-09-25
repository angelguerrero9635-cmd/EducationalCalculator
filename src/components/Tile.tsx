import { createContext, useContext, useState, type ReactNode } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';

import { Text } from '@/components/Text';
import type { RouteTarget } from '@/data/selectors';
import { font, radius, space, usePalette, useTone } from '@/theme';

import { Card } from './Card';

export interface TileProps {
  title: string;
  subtitle?: string;
  /** Short text in the colored badge, e.g. "K", "5" or "Σ". */
  badge: string;
  /** Color tone index (see `useTone`). */
  tone: number;
  route?: RouteTarget;
  onPress?: () => void;
  testID?: string;
}

/** A box in a grid: a colored badge, a title and a short line under it. */
export function Tile({ title, subtitle, badge, tone, route, onPress, testID }: TileProps) {
  const c = usePalette();
  const t = useTone(tone);
  const width = useContext(TileWidth);
  return (
    <Card
      route={route}
      onPress={onPress}
      testID={testID}
      style={[styles.tile, width !== undefined && { width, flexBasis: width, flexGrow: 0 }]}
    >
      <View style={[styles.badge, { backgroundColor: t.bg }]}>
        <Text style={[styles.badgeText, { color: t.fg }]} numberOfLines={1}>
          {badge}
        </Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

/** The width each tile gets once the grid has measured itself. */
const TileWidth = createContext<DimensionValue | undefined>(undefined);

/** Narrowest a tile gets before the grid drops a column. */
const MIN_TILE = 160;
const GAP = space.md;

/**
 * Tiles in a responsive grid: two across on a phone, more on wider screens, every tile the same
 * width (a short last row stays left-aligned instead of stretching).
 */
export function TileGrid({ children }: { children: ReactNode }) {
  const [inner, setInner] = useState(0);
  const cols = Math.max(2, Math.floor((inner + GAP) / (MIN_TILE + GAP)));
  const width = inner ? (inner - GAP * (cols - 1)) / cols : undefined;
  return (
    <View style={styles.grid} onLayout={(e) => setInner(e.nativeEvent.layout.width - 2 * space.lg)}>
      <TileWidth.Provider value={width}>{children}</TileWidth.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: space.lg,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 150,
    maxWidth: '100%',
    minHeight: 124,
    gap: space.md,
    justifyContent: 'space-between',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: font.title - 2, fontWeight: '800' },
  text: { gap: 2 },
  title: { fontSize: font.body, fontWeight: '700' },
  subtitle: { fontSize: font.caption + 1, lineHeight: 17 },
});
