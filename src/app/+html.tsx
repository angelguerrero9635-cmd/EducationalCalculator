import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { layout, motion, palettes, shadow } from '@/theme';

const { light, dark } = palettes;

/**
 * The web page around every pre-rendered screen (web only). Colours come from the theme, so the
 * page background, focus ring and browser chrome match the app before any script runs.
 *
 * `data-shell` rules: a view with `dataSet={{ shell: 'wide' }}` shows only at wide widths
 * (≥ layout.wide) and `'narrow'` only below, so pre-rendered pages are laid out right before
 * the page hydrates (no layout jump, no hydration mismatch).
 */
const css = `
html { color-scheme: light dark; background: ${light.background}; -webkit-text-size-adjust: 100%; }
body { background: ${light.background}; -webkit-tap-highlight-color: transparent; }
@media (prefers-color-scheme: dark) {
  html, body { background: ${dark.background}; }
}
:focus { outline: none; }
:focus-visible { outline: 2px solid ${light.focus}; outline-offset: 2px; border-radius: 6px; }
@media (prefers-color-scheme: dark) {
  :focus-visible { outline-color: ${dark.focus}; }
}
input:focus-visible, textarea:focus-visible { outline: none; }
@media (max-width: ${layout.wide - 1}px) { [data-shell="wide"] { display: none !important; } }
@media (min-width: ${layout.wide}px) { [data-shell="narrow"] { display: none !important; } }
@media (hover: hover) {
  [data-hover="card"] { transition: box-shadow ${motion.fade}ms, transform ${motion.press}ms; }
  [data-hover="card"]:hover { box-shadow: ${shadow.e2}; }
  [data-hover="row"]:hover { background-color: ${light.surface}; }
}
@media (hover: hover) and (prefers-color-scheme: dark) {
  [data-hover="row"]:hover { background-color: ${dark.surface}; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content={light.background} />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content={dark.background} />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
