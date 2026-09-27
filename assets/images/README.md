# Reference photos and illustrations

Real photos and diagrams of the objects the app's pictures draw. None are wired into the app
yet; nothing under `src/` imports them.

- `assets/images/<topic>/<slug>.webp`: public domain or CC0 only. These may ship.
- `assets/candidates/<topic>/<slug>.webp`: CC BY or CC BY-SA. Never wire these into the app
  (they need a credits screen first).
- `manifest.json`: one entry per file with `slug`, `topic`, `file`, `width`, `height`,
  `sourcePage`, `fileUrl` (the original on the source site), `downloadedFrom` (the standard
  thumbnail actually fetched, when different), `author`, `license`, `licenseUrl`,
  `retrieved`, `ships` and `notes`. Each license was read on the source page itself.
- `contact-sheet.png`: every file, labeled by slug; `[BY]` marks a candidate.

Files are at most 1200 px on the longest side and under 250 KB, re-encoded as WebP. The
image content is otherwise unchanged (NWS asks that its products not be modified).

## Not found or skipped

- No public domain or CC0 file found (or not downloaded before Wikimedia's rate limit made
  fetching slow): pan balance, ten frame, two-color counters, snap/unit cubes, pattern
  blocks, onion and cheek cells, Moon phases, Earth from space, series circuit, magnet, ball
  on a ramp, water waves, and the everyday objects (bowling ball, crayon, sock, brick,
  watermelon, backpack, paper clip, door, eraser, bed, school bus), plus quartzite. Several
  have PD/CC0 or CC BY files identified on Wikimedia Commons in the working notes; they can
  be fetched later.
- Current coin designs missing: the Union Shield cent reverse and the forward-facing
  Jefferson nickel obverse (only CC BY-SA or none found); the files here show older designs.
- No photographs of US paper money. The US Mint site blocks scripted access (bot
  challenge), so its coin images were taken from Wikimedia Commons copies instead.
- The Smithsonian image server disallows crawlers in robots.txt, so Smithsonian Open
  Access (CC0) was not used.
