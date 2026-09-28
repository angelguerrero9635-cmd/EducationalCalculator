/**
 * Find my lesson: type a homework or practice-test problem, or read one from a photo on the
 * device, and get the pages that solve it. Matching runs locally (`@/data/match`); a photo is
 * read once by the device's text recognizer and never stored or sent anywhere.
 */
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button, Card, EmptyState, Icon, ListRow, LockedState, SectionHeader } from '@/components';
import { PageMeta } from '@/components/PageMeta';
import { isLocked } from '@/config/access';
import { matchProblem, type MatchResult } from '@/data/match';
import { nodeContext } from '@/data/selectors';
import { font, radius, space, useCardShadow, usePalette } from '@/theme';

import { ocrAvailable, recognizeText } from '../../modules/vision-ocr';

/** The paywall key for this feature (see src/config/access.ts). */
export const MATCH_FEATURE = 'feature.find-my-lesson';

export default function MatchScreen() {
  const c = usePalette();
  const shadow = useCardShadow();
  const [text, setText] = useState('');
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const find = useCallback((problem: string) => {
    setError(null);
    setResults(matchProblem(problem, 3));
  }, []);

  const readPicture = useCallback(
    async (source: 'camera' | 'library') => {
      setError(null);
      setBusy(true);
      try {
        if (source === 'camera') {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted)
            throw new Error('The camera needs your permission to take the picture.');
        }
        const picked =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (picked.canceled || !picked.assets[0]) return;
        const found = (await recognizeText(picked.assets[0].uri)).trim();
        if (!found)
          throw new Error('No words were found in the picture. Try a closer, straighter photo.');
        const next = text.trim() ? `${text.trim()}\n${found}` : found;
        setText(next);
        find(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'The picture could not be read.');
      } finally {
        setBusy(false);
      }
    },
    [find, text],
  );

  if (isLocked(MATCH_FEATURE)) return <LockedState />;

  const canRead = ocrAvailable && Platform.OS !== 'web';

  return (
    <>
      <PageMeta
        title="Find my lesson"
        description="Type a homework or practice-test problem, or take a picture of it, and open the lesson that solves it."
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.lead, { color: c.text }]}>
          Type the problem the way it is written, or take a picture of it. We’ll find the lesson
          that solves it.
        </Text>
        <View style={[styles.field, { backgroundColor: c.card }, shadow]}>
          <TextInput
            testID="match-input"
            value={text}
            onChangeText={setText}
            placeholder="For example: Maya has 17 fish and Kofi has 9. How many more fish does Maya have?"
            placeholderTextColor={c.textMuted}
            multiline
            autoCorrect
            accessibilityLabel="The problem"
            style={[styles.input, { color: c.text }]}
          />
        </View>
        <View style={styles.actions}>
          <Button
            label="Find the lesson"
            onPress={text.trim() && !busy ? () => find(text) : undefined}
            testID="match-find"
          />
          {canRead ? (
            <>
              <PhotoButton
                label="Take a picture"
                onPress={() => readPicture('camera')}
                disabled={busy}
              />
              <PhotoButton
                label="Choose a picture"
                onPress={() => readPicture('library')}
                disabled={busy}
              />
            </>
          ) : null}
        </View>
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={c.accent} />
            <Text style={[styles.hint, { color: c.textMuted }]}>Reading the picture…</Text>
          </View>
        ) : null}
        {error ? <Text style={[styles.error, { color: c.blockRed }]}>{error}</Text> : null}
        {canRead ? (
          <Text style={[styles.hint, { color: c.textMuted }]}>
            Pictures are read on this device and are not saved or sent anywhere.
          </Text>
        ) : Platform.OS === 'web' ? (
          <Text style={[styles.hint, { color: c.textMuted }]}>
            On the iPhone app you can take a picture of the problem instead of typing it.
          </Text>
        ) : null}

        {results ? (
          results.length ? (
            <>
              <SectionHeader
                title={results.length > 1 ? 'Lessons that fit' : 'The lesson that fits'}
              />
              {results.map((r, i) => (
                <ListRow
                  key={r.id}
                  overline={`${i === 0 ? 'Best match · ' : ''}${nodeContext(r.skill)}${
                    r.title === r.skill.title ? '' : ` · ${r.skill.title}`
                  }`}
                  title={r.title}
                  subtitle={r.use ?? 'The main lesson for this skill'}
                  route={r.route}
                />
              ))}
              <Text style={[styles.hint, { color: c.textMuted }]}>
                Not it? Add a few more words from the problem, such as what it asks for.
              </Text>
            </>
          ) : (
            <Card style={styles.emptyCard}>
              <EmptyState
                title="No lesson found"
                message="Try typing the whole problem, including its question and its numbers."
              />
              <Button
                label="Browse all lessons"
                variant="secondary"
                onPress={() => router.push('/browse')}
              />
            </Card>
          )
        ) : null}
      </ScrollView>
    </>
  );
}

function PhotoButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.photoButton,
        { backgroundColor: c.accentSoft, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      <Icon name="camera" size={20} color={c.accent} />
      <Text style={[styles.photoLabel, { color: c.accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: space.lg, paddingBottom: space.xxl, gap: space.md },
  lead: { fontSize: font.body, lineHeight: 22 },
  field: { borderRadius: radius.lg, padding: space.md },
  input: { fontSize: font.body, minHeight: 110, textAlignVertical: 'top', lineHeight: 22 },
  actions: { gap: space.sm },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  photoLabel: { fontSize: font.body, fontWeight: '600' },
  busy: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  hint: { fontSize: font.caption, lineHeight: 18 },
  error: { fontSize: font.body },
  emptyCard: { gap: space.md },
});
