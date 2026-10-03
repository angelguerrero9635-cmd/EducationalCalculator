# One Dollar University: brand files

Original artwork drawn for this project. The owner chose concept 3, "Open book" (`concepts/`):
a round school seal with double gold rings, "ONE DOLLAR UNIVERSITY" over the top and "EDUCATION
FOR EVERYONE" under the bottom, two gold stars, an open book with gold rays rising, and the gold
$ beside the U in the middle. Nothing in it copies a real university's seal, a coin or a note.

Brief: `docs/RENDERINGS_BRAND.md`; sizes and uses: `docs/plans/site-upgrade.md`, section 5.
Contact sheet of every exported file at real size: `identity.png`.

## Status (round 1)

| Id  | What                      | Files                                                                                                                                               | Status                                                                                        |
| --- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| B1  | Seal, small seals, mono   | `mark-small.svg` / `-dark`, `mark-micro.svg` / `-dark`, `mark-small-mono.svg`, PNG renders                                                          | Drawn                                                                                         |
|     |                           | `mark.svg` / `-dark`, `mark-mono.svg` (the full seal with ring lettering)                                                                           | Drawn                                                                                         |
| B2  | Wordmark                  | `wordmark.svg` / `-dark` (Inter 700, outlined, height 24)                                                                                           | Drawn                                                                                         |
| B3  | Lockups                   | `lockup.svg` / `-dark` (horizontal), `lockup-stacked.svg` / `-dark` (with the slogan)                                                               | Drawn                                                                                         |
| B4  | App icon                  | `icon.png` 1024 (opaque), `icon-dark.png`, `icon-tinted.png`, `adaptive-foreground.png`, `adaptive-background.png`, `adaptive-monochrome.png` (432) | Drawn                                                                                         |
| B5  | Favicon                   | `public/favicon.svg` (internal `prefers-color-scheme` style), `public/favicon.ico` (16, 32, 48)                                                     | Drawn                                                                                         |
| B6  | Touch and PWA icons       | `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`                                                              | Drawn                                                                                         |
| B7  | Splash                    | `splash.png`, `splash-dark.png` (1024, transparent)                                                                                                 | Drawn                                                                                         |
| B8  | Store marketing icon      | Same file as B4                                                                                                                                     | Drawn                                                                                         |
| D1  | `src/components/Logo.tsx` | Draws the small seal from `src/components/logoArt.ts` (palette tokens only)                                                                         | Placed: small seal in headers, lockup in the sidebar and footer, stacked lockup on onboarding |

## Status (rounds 2 and 3)

Contact sheet of every image below, light and dark: `illustrations.png`.

| Id  | What                    | Files                                                                                                                                            | Status |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| B9  | OG image, default       | `public/og/default.png` (1200 × 630); source `og/default.svg`                                                                                    | Drawn  |
| B10 | OG image, K–12          | `public/og/k12.png`; source `og/k12.svg`                                                                                                         | Drawn  |
| B11 | OG image, College       | `public/og/college.png`; source `og/college.svg`                                                                                                 | Drawn  |
| B12 | Home hero               | `src/components/art/HomeHero.tsx` (`band` crops to the 3:1 strip for phones); `art/home-hero.svg`, PNGs                                          | Drawn  |
| B13 | Explore: K–12 card      | `src/components/art/ExploreK12.tsx`; `art/explore-k12.svg`, PNGs                                                                                 | Drawn  |
| B14 | Explore: College card   | `src/components/art/ExploreCollege.tsx`; `art/explore-college.svg`, PNGs                                                                         | Drawn  |
| B15 | Onboarding welcome      | `src/components/art/OnboardingWelcome.tsx`; `art/onboarding-welcome.svg`, PNGs                                                                   | Drawn  |
| B16 | Empty: no courses       | `src/components/art/EmptyShelf.tsx`; `art/empty-shelf.svg`, PNGs                                                                                 | Drawn  |
| B17 | Empty: no results       | `src/components/art/NoResults.tsx`; `art/no-results.svg`, PNGs                                                                                   | Drawn  |
| B18 | Search start            | `src/components/art/SearchStart.tsx`; `art/search-start.svg`, PNGs                                                                               | Drawn  |
| B19 | Plans header            | `src/components/art/PlansHeader.tsx`; `art/plans-header.svg`, PNGs                                                                               | Drawn  |
| B20 | Purchase success        | `src/components/art/PurchaseSuccess.tsx` (`checkProgress`, `PURCHASE_CHECK`); `art/purchase-success.svg`, `art/purchase-success-check.svg`, PNGs | Drawn  |
| B21 | Not found               | `src/components/art/NotFoundArt.tsx`; `art/not-found.svg`, PNGs                                                                                  | Drawn  |
| B22 | Locked lesson           | `src/components/art/LockedLesson.tsx`; `art/locked-lesson.svg`, PNGs                                                                             | Drawn  |
| B23 | Store screenshot frames | Waits for the finished screens                                                                                                                   | Later  |
| B24 | Error / offline         | `src/components/art/Unplugged.tsx`; `art/unplugged.svg`, PNGs                                                                                    | Drawn  |

Each illustration is drawn once in `scripts/render-art.mjs` with palette token names
(`accent`, `accentSoft`, `gold`, `goldDeep`, `onAccent`, `onGold`, `success`, `card` and the
`art*` tokens in `src/theme.ts`: ink, paper, grey, a shade, a shine and the tone colours). The
script writes the component, the light source SVG and light and dark PNG renders at 2x
(`art/<file>.png`, `art/<file>-dark.png`, transparent), the OG images and the contact sheet:
`node scripts/render-art.mjs` (`--no-png` writes only the components and SVGs). Every component
is decorative (hidden from screen readers) unless given a `label`, and takes `width`.

The OG images: the horizontal lockup (`lockup.svg`), the slogan path from `logoArt.ts`, and for
K–12 and College a line in Inter 600 outlined with fontTools (`scripts/brand-art/og-lines.json`),
on white with the objects on a lavender panel inside the 1080 × 566 safe area. Light only, opaque.

"Drawn" means the file is here; "placed" means the app uses it. The lesson chat points
`app.json` and the web head at the icon and splash files (plan item D2).

## The seal in three sizes

| Size         | Version                   | What it keeps                                         |
| ------------ | ------------------------- | ----------------------------------------------------- |
| 40 px and up | `mark` (the full seal)    | Rings, ring lettering, stars, $U, book, rays          |
| 20 to 39 px  | `mark-small`              | Disc, one thick gold ring, $U, a simplified open book |
| Under 20 px  | `mark-micro` (favicon 16) | Disc, gold ring, a larger $U with heavier strokes     |

Colours by role, the same in the files and in `Logo.tsx` (which reads the palette tokens):

| Role                              | Token         | Light     | Dark      |
| --------------------------------- | ------------- | --------- | --------- |
| Outer band                        | `accentHover` | `#4338CA` | `#A39DFF` |
| Centre disc                       | `accent`      | `#4F46E5` | `#8B83FF` |
| Rings, $, stars, rays, book cover | `gold`        | `#F5B82E` | `#E9B949` |
| U, lettering, book pages          | `onAccent`    | `#FFFFFF` | `#0B0C10` |

Mono versions use one colour with the gold and white parts knocked out (favicons, tinted icons).
Clear space around a lockup: the U's width in the mark as drawn, on every side.

## How the files are made

- The SVGs are generated by a small script from the seal's geometry. The lettering is converted
  to outlines with fontTools, glyph by glyph along the arcs, so no file needs a font.
- `node scripts/render-brand.mjs` (Playwright's Chromium) renders the PNGs and `favicon.ico`
  and redraws `identity.png`. The PNGs are written by the script's own encoder: RGB with no
  alpha channel for the opaque icons, and no metadata in any file.

## Fonts (lettering only, outlined; no font file is shipped)

- **Playfair Display** Black (the seal's $ and U, drawn as tattoo lettering: high-contrast letters, our own double bar with tapered tips, line work, a drop shadow, an engraved hatching wash, an inner highlight and a glint), SIL Open Font License 1.1, from the google/fonts repository (`ofl/playfairdisplay`).

- **Cinzel** (the ring lettering), SIL Open Font License 1.1, from the google/fonts repository
  (`ofl/cinzel`).
- **Inter** (the wordmark at weight 700, the slogan, and the OG lines at weight 600), SIL Open Font License 1.1, from the
  google/fonts repository (`ofl/inter`).

The OFL allows outlined lettering made from these fonts in a logo. The fonts themselves are not
committed.
