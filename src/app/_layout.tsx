import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { useLayoutSize } from '@/components/layoutSize';
import { NavBar } from '@/components/NavBar';
import { Sidebar } from '@/components/shell/Sidebar';
import { useHydrated, useSelectedLevels } from '@/state';
import { font, usePalette, useResolvedScheme } from '@/theme';

export default function RootLayout() {
  const hydrated = useHydrated();
  const { onboarded } = useSelectedLevels();
  const scheme = useResolvedScheme();
  const c = usePalette();
  const size = useLayoutSize();

  const theme = useMemo<Theme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.accent,
        background: c.background,
        card: c.card,
        text: c.text,
        border: c.border,
      },
      // Navigation headers and tab labels use the theme font when one is set.
      fonts: font.family
        ? (Object.fromEntries(
            Object.entries(base.fonts).map(([k, v]) => [k, { ...v, fontFamily: font.family! }]),
          ) as Theme['fonts'])
        : base.fonts,
    };
  }, [scheme, c]);

  // Until saved selections load, show the pages (never a blank screen): pre-rendered web pages
  // must contain their content, and first-time visitors are sent to onboarding once we know.
  const showApp = !hydrated || onboarded;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* Wide screens: the sidebar beside every page (the web shows it by CSS, so pre-rendered
          pages have it; native shows it on wide iPads). */}
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.background }}>
        {showApp && (Platform.OS === 'web' || size === 'wide') ? <Sidebar /> : null}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ header: (props) => <NavBar {...props} /> }}>
            <Stack.Protected guard={showApp}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="grade/[grade]/index" />
              <Stack.Screen name="grade/[grade]/[strand]" />
              <Stack.Screen name="lessons/[id]" />
              <Stack.Screen name="he/index" options={{ title: 'Higher Education' }} />
              <Stack.Screen name="he/[division]/index" />
              <Stack.Screen name="he/[division]/[field]" />
              <Stack.Screen name="skill/[id]" options={{ title: 'Skill' }} />
              <Stack.Screen name="course/[id]/index" options={{ title: 'Course' }} />
              <Stack.Screen name="course/[id]/topic/[index]" options={{ title: 'Topic' }} />
              <Stack.Screen name="levels" options={{ title: 'What You Study' }} />
              <Stack.Screen name="paywall" options={{ title: 'Plans' }} />
            </Stack.Protected>
            <Stack.Protected guard={!showApp}>
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false, gestureEnabled: false }}
              />
            </Stack.Protected>
          </Stack>
        </View>
      </View>
    </ThemeProvider>
  );
}
