# Illustrations

Original artwork made for this project: 65 hand-written SVGs in eight topics (measuring,
money, classroom, rocks, life, earth-space, forces, everyday), each rendered to a WebP beside
it. Photos found online were looked at as references only; nothing is traced, copied or
embedded, so every file is the project's own. None is wired into the app yet.

- `STYLE.md`: canvas, outline, palette and content rules every drawing follows.
- `<topic>/meta.json`: title, the app picture or skill it supports (`use`), the reference
  pages looked at, and notes (what it shows, e.g. "Clock shows 3:00").
- `manifest.json`: generated; one entry per illustration with its SVG, WebP, size and meta.
- `contact-sheet.png`: every illustration labeled by slug.

To change one, edit its SVG and run
`NODE_PATH=$(npm root -g) node scripts/render-illustrations.mjs --contact`, which checks the
SVGs, re-renders the WebPs (1200 px, under 250 KB) and rebuilds the manifest and sheet.

Known simplifications: coin portraits are stylized profiles, the quarter back shows the
classic heraldic eagle, the world map, globe and U.S. outline use simplified Natural Earth coastlines (public-domain map data), and the graduated
cylinder has 2 mL ticks.
