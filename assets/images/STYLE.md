# Illustration style

Every image here is original artwork drawn as SVG for this project. Photos found online may be
looked at as references (what the object looks like, its proportions, its parts), but nothing
is traced, copied or embedded. `scripts/render-illustrations.mjs` renders each SVG to WebP,
checks it, and rebuilds `manifest.json` from each topic's `meta.json`.

## Canvas

- Objects: `viewBox="0 0 800 800"`, transparent background, the object centered with about
  60 px of margin.
- Scenes and diagrams (maps, water cycle, rock layers, ramp, school bus): `viewBox="0 0 1200 800"`,
  a full background is fine.
- Hand-written, tidy SVG: no editor metadata, no comments naming people, no `<image>`, no
  links outside the file (`href="#id"` inside the file is fine). Aim for under 40 KB.
- Give ids a per-file prefix (`beaker-glass`, `penny-rim`) so files never clash when inlined.

## Look

- Friendly, flat illustration with light shading, recognizable at 120 px and clean at 1200 px.
- Outline: `stroke="#1f2937"`, width 6 at the 800 px scale (4 for fine detail), round joins and
  caps. Scale markings (ticks) 3–4.
- Flat fills plus at most one highlight and one shade shape per part; a two-stop linear or
  radial gradient is allowed for glass, metal, spheres and the sky.
- Palette (use these first):
  - ink `#1f2937`, paper `#ffffff`, light gray `#e5e7eb`, gray `#9ca3af`
  - blue `#3b82f6`, light blue `#bfdbfe`, water `#60a5fa` at 70% opacity
  - red `#ef4444`, orange `#f97316`, yellow `#facc15`, green `#22c55e`, dark green `#15803d`
  - purple `#8b5cf6`, brown `#92400e`, tan `#d6a76c`
  - copper `#c2703d`, silver `#cbd5e1` with `#94a3b8` shade
- Glass: fill `#dbeafe` at 35–45% opacity with a white highlight stripe.

## Content

- Numbers only where the real object shows them (clock face, ruler, thermometer, scales on
  containers, protractor degrees). No words, except the short inscriptions that make a coin
  a coin (set on a path) and letters that are the symbol itself (H and L on a weather map,
  N and S on a magnet, + and − on a battery).
- Science must be right: cold front blue triangles, warm front red half-circles, stationary
  front alternating, occluded purple; Moon phases in order; cell parts where they belong;
  magnet N red and S blue; series circuit is one loop.
- No real people. Coin portraits are simple stylized profiles, recognizable by pose and
  outline, not detailed likenesses. No paper money.
- Neutral scale: show objects at a natural size and angle, front or three-quarter view.
