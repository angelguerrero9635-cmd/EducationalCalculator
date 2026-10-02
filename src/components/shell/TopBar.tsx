import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Crumb } from '@/data/selectors';
import { layout, radius, space, type, usePalette } from '@/theme';

import { Breadcrumbs } from './Breadcrumbs';

/**
 * The wide-screen top bar over the content: where the page sits (breadcrumbs, or the page's
 * name on a top-level page) and a search field (Enter opens Search with the words typed).
 */
export function TopBar({ trail, title }: { trail: Crumb[]; title: string }) {
  const c = usePalette();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setQuery('');
    router.push({ pathname: '/search', params: { q } });
  };
  return (
    <View style={[styles.bar, { backgroundColor: c.background, borderBottomColor: c.border }]}>
      <View style={styles.where}>
        {trail.length > 1 ? (
          <Breadcrumbs trail={trail} />
        ) : (
          <Text style={[type.title3, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      {pathname === '/search' ? null : (
        <View style={[styles.search, { backgroundColor: c.card, borderColor: c.borderStrong }]}>
          <Icon name="search" size={18} color={c.textMuted} />
          <TextInput
            testID="topbar-search"
            accessibilityLabel="Search skills, or type a problem"
            placeholder="Search skills, or type a problem"
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            returnKeyType="search"
            style={[type.callout, styles.input, { color: c.text }]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: layout.topBar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    paddingHorizontal: space.xxl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  where: { flex: 1, minWidth: 0 },
  search: {
    width: 360,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  input: { flex: 1, height: 40, paddingVertical: 0 },
});
