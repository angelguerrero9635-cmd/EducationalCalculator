/**
 * `data-*` attributes on the web (react-native-web's `dataSet`), for the CSS rules in
 * `src/app/+html.tsx`: `shell` (show only wide or narrow) and `hover` (card or row). Spread the
 * result into a View or Pressable; native ignores it.
 */
export function webData(data: Record<string, string> | undefined): object {
  return data ? { dataSet: data } : {};
}
