/**
 * Every color lives in `src/theme.ts` (light and dark palettes), so the app restyles from one
 * file and pictures work in both themes. Components and screens hardcode none.
 */
declare const require: (name: string) => {
  readdirSync: (
    dir: string,
    opts: { withFileTypes: true },
  ) => { name: string; isDirectory: () => boolean }[];
  readFileSync: (path: string, enc: string) => string;
};
const fs = require('fs');

const files = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? e.name === '__tests__'
          ? []
          : files(`${dir}/${e.name}`)
        : /\.tsx?$/.test(e.name)
          ? [`${dir}/${e.name}`]
          : [],
    );

test('components and screens use palette colors, not literals', () => {
  const found = ['src/components', 'src/app'].flatMap(files).flatMap((path) =>
    fs
      .readFileSync(path, 'utf8')
      .split('\n')
      .map((line, i) => ({ line, at: `${path}:${i + 1}` }))
      .filter(({ line }) => !/^\s*(\/\/|\*)/.test(line))
      .filter(({ line }) => /['"`]#[0-9A-Fa-f]{3,8}['"`]|rgba?\(\s*\d/.test(line))
      .map(({ at, line }) => `${at}: ${line.trim()}`),
  );
  expect(found).toEqual([]);
});
