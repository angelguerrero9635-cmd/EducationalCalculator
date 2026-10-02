import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Text } from '@/components/Text';
import { SITE_NAME, SITE_SLOGAN } from '@/config/site';
import { layout, space, type, usePalette } from '@/theme';

/** The links at the foot of every web page. Pages that don't exist yet are left out. */
const LINKS: { label: string; path: '/paywall' | '/browse' | '/settings' }[] = [
  { label: 'Browse', path: '/browse' },
  { label: 'Plans', path: '/paywall' },
  { label: 'Settings', path: '/settings' },
];

/** The web footer: the name, the slogan and the site links (the iOS app has Settings for these). */
export function Footer() {
  const c = usePalette();
  if (Platform.OS !== 'web') return null;
  return (
    <View style={[styles.footer, { borderTopColor: c.border }]}>
      <View style={styles.inner}>
        <View style={styles.brand}>
          <Logo size={24} />
          <View>
            <Text style={[type.footnote, styles.name, { color: c.text }]}>{SITE_NAME}</Text>
            <Text style={[type.footnote, { color: c.textMuted }]}>{SITE_SLOGAN}</Text>
          </View>
        </View>
        <View style={styles.links}>
          {LINKS.map((l) => (
            <Pressable
              key={l.path}
              accessibilityRole="link"
              onPress={() => router.push(l.path)}
              hitSlop={6}
            >
              <Text style={[type.footnote, { color: c.textMuted }]}>{l.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[type.overline, styles.copy, { color: c.textMuted }]}>
          © {new Date().getFullYear()} {SITE_NAME}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignSelf: 'stretch',
    marginTop: space.xxxl,
    paddingVertical: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.content.grid,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexGrow: 1 },
  name: { fontWeight: '700' },
  links: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  copy: { fontWeight: '500' },
});
