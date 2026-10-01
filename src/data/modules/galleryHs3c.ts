/**
 * Grades 9–12 round 3 gallery demos (group H3C: earth and space (H110); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in. Spread into
 * gallery.ts.
 */
import type { LayoutDef } from './layouts';
import { SCIENCE_12_MODULES } from './science/12';
import type { ModuleDef, Representation } from './types';

const pageOf = (id: string) => {
  const found = SCIENCE_12_MODULES.find((m) => m.id === id);
  if (!found) throw new Error(`galleryHs3c: no page ${id}`);
  return found;
};

/**
 * A demo from the page that waits: its variables, rules, steps and example, with the picture
 * the page will pass in place of its stand-in (`more` replaces other fields: a use line, the
 * example, pictureLabels).
 */
const fromPage = (
  pageId: string,
  id: string,
  title: string,
  representation: Representation,
  more: Partial<ModuleDef> = {},
): ModuleDef => ({ ...pageOf(pageId), id, title, representation, ...more });

// ── Part 1: Earth's history on a 24-hour clock (geologicClock) ──

/** The page's reference events (million years ago), as its table rows name them. */
const EARTH_EVENTS = [
  { age: 4600, name: 'Earth forms' },
  { age: 3500, name: 'First life' },
  { age: 2300, name: 'Oxygen in the air' },
  { age: 540, name: 'Animals with shells' },
  { age: 66, name: 'Dinosaurs die out' },
  { age: 0.3, name: 'Our species' },
];

const clockSpec: Representation = {
  kind: 'geologicClock',
  ago: 'A',
  time: 't',
  minutes: 'm',
  share: 'p',
  events: EARTH_EVENTS,
};

const earthDay = fromPage(
  's.12.earth-history',
  'g.s12-earth-history-clock',
  'Earth’s history as one day',
  clockSpec,
  {
    use: 'Use this for “If Earth’s history were one day, at what time did oxygen build up in the air?”',
    pictureLabels: undefined,
  },
);

const earthDayLate = fromPage(
  's.12.earth-history',
  'g.s12-earth-history-clock-late',
  'Earth’s history as one day: the last hour',
  clockSpec,
  {
    use: 'Use this for “On Earth’s one-day clock, when did the dinosaurs die out?”',
    example: { A: 66, p: (66 / 4600) * 100, m: (66 / 4600) * 1440, t: 24 - (66 / 4600) * 24 },
    pictureLabels: undefined,
  },
);

// ── Part 2: a fossil coral's daily lines and yearly bands (coralSection) ──

const coralSpec: Representation = {
  kind: 'coralSection',
  lines: 'n',
  bands: 'b',
  days: 'N',
  day: 'D',
};

const coral = fromPage(
  's.12.earth-history~day-length',
  'g.s12-earth-history-day-length-coral',
  'Day length from fossil coral',
  coralSpec,
  { pictureLabels: undefined },
);

/** One band of a much older coral: a short year, the edge of the page's range. */
const coralFew = fromPage(
  's.12.earth-history~day-length',
  'g.s12-earth-history-day-length-coral-few',
  'Day length from fossil coral: a short count',
  coralSpec,
  {
    use: 'Use this for “One yearly band of a fossil coral holds 420 daily lines. How long was a day then?”',
    example: { n: 420, b: 1, N: 420, D: 8766 / 420 },
    pictureLabels: undefined,
  },
);

// ── Part 3: a transit and its light curve (transit) ──

const transitSpec: Representation = { kind: 'transit', star: 'R', planet: 'r', depth: 'd' };

const transit = fromPage(
  's.12.exoplanets',
  'g.s12-exoplanets-transit',
  'A transit and its light curve',
  transitSpec,
  {
    use: 'Use this for “A star’s light dips by 1% as a planet crosses it. How big is the planet?”',
  },
);

/** An Earth crossing a Sun: a dip of under a hundredth of a percent, the planet a dot. */
const transitEarth = fromPage(
  's.12.exoplanets',
  'g.s12-exoplanets-transit-earth',
  'A transit: an Earth crossing a Sun',
  transitSpec,
  {
    use: 'Use this for “How much would Earth dim the Sun, seen crossing it from far away?”',
    example: { R: 1, r: 1, d: 100 / 109 ** 2 },
    startWith: ['R', 'r'],
  },
);

// ── Part 4: the habitable zone and a planet's orbit (habitableZone) ──

const zoneSpec: Representation = {
  kind: 'habitableZone',
  luminosity: 'L',
  inner: 'd1',
  outer: 'd2',
  orbit: 'a',
  temperature: 'T',
};

const zone = fromPage(
  's.12.exoplanets~habitable-zone',
  'g.s12-exoplanets-habitable-zone',
  'The habitable zone and a planet’s temperature',
  zoneSpec,
  { pictureLabels: undefined },
);

/** A bright star and a planet far out: the zone moves out as √L. */
const zoneBright = fromPage(
  's.12.exoplanets~habitable-zone',
  'g.s12-exoplanets-habitable-zone-bright',
  'The habitable zone of a bright star',
  zoneSpec,
  {
    use: 'Use this for “A star gives off 25 times the Sun’s light. Is a planet at 10 AU in its habitable zone?”',
    example: { L: 25, d1: 4.75, d2: 6.85, a: 10, T: (278 * 25 ** 0.25) / Math.sqrt(10) },
    pictureLabels: undefined,
  },
);

// ── Part 5: Kepler's third law round another star, and eccentricity to 0.97 (circularMotion) ──

const exoOrbit = fromPage(
  's.12.exoplanets~orbit',
  'g.s12-exoplanets-orbit-star-mass',
  'An exoplanet’s orbit from its period',
  {
    kind: 'circularMotion',
    mode: 'kepler',
    semiMajor: 'a',
    starMass: 'M',
    period: 'T',
  },
  { pictureLabels: undefined },
);

/** Halley's Comet: a = 17.83 AU, e = 0.967, past the page's 0.95 today. */
const HALLEY = { a: 17.83, e: 0.967 };
const keplerPage = pageOf('s.12.solar-system');
const halley = fromPage(
  's.12.solar-system',
  'g.s12-solar-system-halley',
  'Kepler’s laws: a comet’s long ellipse',
  keplerPage.representation,
  {
    use: 'Use this for “Halley’s Comet has a = 17.83 AU and e = 0.967. How close does it come to the Sun, and how long is its period?”',
    variables: keplerPage.variables.map((v) => (v.id === 'e' ? { ...v, max: 0.97 } : v)),
    example: {
      ...HALLEY,
      q: HALLEY.a * (1 - HALLEY.e),
      Q: HALLEY.a * (1 + HALLEY.e),
      T: HALLEY.a ** 1.5,
    },
  },
);

// ── Part 7: a star's parallax (parallax) ──

/** The nearest stars: Proxima Centauri's parallax is 0.768″, about 1.3 parsecs. */
const parallaxNear = fromPage(
  's.12.starlight-spectra~parallax',
  'g.s12-starlight-spectra-parallax-near',
  'Distance from parallax: the nearest star',
  { kind: 'parallax', angle: 'p', parsecs: 'd', lightYears: 'D' },
  {
    use: 'Use this for “Proxima Centauri has a parallax of 0.768″. How many light-years away is it?”',
    example: { p: 0.768, d: 1 / 0.768, D: 3.26 / 0.768 },
  },
);

export const HS3C_GALLERY_MODULES: ModuleDef[] = [
  earthDay,
  earthDayLate,
  coral,
  coralFew,
  transit,
  transitEarth,
  zone,
  zoneBright,
  exoOrbit,
  halley,
  parallaxNear,
];

// ── Part 6: Earth cut open as an explore figure, one station per scene (earthLayers) ──

const shadowZones: LayoutDef = {
  id: 'g.s12-earth-interior-shadow-zone-explore',
  title: 'The shadow zones: which waves reach a station',
  kind: 'explore',
  use: 'Use this for “Why do no S waves arrive more than 104° from an earthquake?”',
  assumptions: [
    'P waves travel through solids and liquids; S waves travel only through solids.',
    'The outer core, 2,890 km down, is liquid, and waves bend where they cross into it.',
    'Angles are measured round Earth’s center from the earthquake’s focus.',
  ],
  figure: { kind: 'earthLayers' },
  scenes: [
    {
      label: '60°',
      lines: [
        'A station 60° away gets both P and S waves, straight through the mantle.',
        'P waves arrive first because they are faster.',
      ],
      earthSection: { distance: 60 },
    },
    {
      label: '104°',
      lines: [
        'At 104° the deepest direct waves just graze the core.',
        'Farther away, no wave reaches a station straight through the mantle.',
      ],
      earthSection: { distance: 104 },
    },
    {
      label: '120°',
      lines: [
        'At 120° the station is in the P-wave shadow zone: P waves that meet the core bend away from it.',
        'No S waves arrive, since they cannot cross the liquid outer core.',
      ],
      earthSection: { distance: 120 },
    },
    {
      label: '150°',
      lines: [
        'At 150° P waves arrive again, bent through the core.',
        'Still no S waves: the liquid outer core stops them, which is how we know it is liquid.',
      ],
      earthSection: { distance: 150 },
    },
  ],
};

export const HS3C_GALLERY_LAYOUTS: LayoutDef[] = [shadowZones];
