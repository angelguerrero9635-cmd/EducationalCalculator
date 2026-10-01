/**
 * Grades 9–12 round 2 gallery demos (group H2F: earth and space (H103); see pictureRequestsHs.ts and
 * docs/HS_NEEDS.md). Each demo shows one option or part in a page stand-in: real variables,
 * relations, steps and a use line, so `scripts/promote-demo.mjs` can copy it into a grade file.
 * Spread into gallery.ts.
 */
import type { LayoutDef } from './layouts';
import { SCIENCE_12_MODULES } from './science/12';
import type { ModuleDef } from './types';

/** A built page, for the demos that show it with other values. */
const pageOf = (id: string) => {
  const found = SCIENCE_12_MODULES.find((m) => m.id === id);
  if (!found) throw new Error(`galleryHs2f: no page ${id}`);
  return found;
};

// ── Part 1: two seismograms by magnitude (earthLayers mode `magnitude`) ──

const magnitudeHalf: ModuleDef = {
  ...pageOf('s.12.earth-interior~magnitude'),
  id: 'g.s12-earth-interior-magnitude-half',
  title: 'Half a step of magnitude',
  use: 'Use this for quakes less than one magnitude apart, such as 5.5 and 6.',
  example: { M1: 5.5, M2: 6, d: 0.5, A: 10 ** 0.5, E: 10 ** 0.75 },
};

const magnitudeFar: ModuleDef = {
  ...pageOf('s.12.earth-interior~magnitude'),
  id: 'g.s12-earth-interior-magnitude-far',
  title: 'A great quake beside a small one',
  use: 'Use this for quakes far apart on the scale, such as 3 and 8.',
  example: { M1: 3, M2: 8, d: 5, A: 1e5, E: 10 ** 7.5 },
};

// ── Part 2: magnetic stripes on the seafloor (oceanProfile mode `stripes`) ──

const spreadingFast: ModuleDef = {
  ...pageOf('s.12.earth-interior~spreading-rate'),
  id: 'g.s12-earth-interior-spreading-fast',
  title: 'A fast-spreading ridge',
  use: 'Use this for a fast ridge, where 4-million-year-old rock is 300 km out.',
  example: { x: 300, t: 4, v: 75, w: 150 },
};

const spreadingYoung: ModuleDef = {
  ...pageOf('s.12.earth-interior~spreading-rate'),
  id: 'g.s12-earth-interior-spreading-young',
  title: 'Young rock near a slow ridge',
  use: 'Use this for a slow ridge and rock under a million years old, still in today’s stripe.',
  example: { x: 9, t: 0.6, v: 15, w: 30 },
};

// ── Part 3: a stream channel (new kind `streamChannel`) ──

const dischargeCreek: ModuleDef = {
  ...pageOf('s.12.surface-processes~discharge'),
  id: 'g.s12-surface-processes-discharge-creek',
  title: 'A small, fast creek',
  use: 'Use this for a narrow creek, deep for its width and flowing fast.',
  example: { w: 2, d: 0.8, v: 1.5, A: 1.6, Q: 2.4 },
};

const dischargeRiver: ModuleDef = {
  ...pageOf('s.12.surface-processes~discharge'),
  id: 'g.s12-surface-processes-discharge-river',
  title: 'A wide, slow river',
  use: 'Use this for a big river, far wider than it is deep.',
  example: { w: 400, d: 6, v: 1.2, A: 2400, Q: 2880 },
};

// ── Part 4: a rising air parcel (atmosphereLayers mode `parcel`) ──

const cloudBaseHumid: ModuleDef = {
  ...pageOf('s.12.atmosphere-weather~cloud-base'),
  id: 'g.s12-atmosphere-weather-cloud-base-humid',
  title: 'Low clouds on a humid day',
  use: 'Use this for humid air, where the dew point is close to the temperature.',
  example: { T: 30, Td: 26, h: 0.5 },
};

const cloudBaseDry: ModuleDef = {
  ...pageOf('s.12.atmosphere-weather~cloud-base'),
  id: 'g.s12-atmosphere-weather-cloud-base-dry',
  title: 'High clouds over a desert',
  use: 'Use this for dry air, where the dew point is far below the temperature.',
  example: { T: 38, Td: 2, h: 4.5 },
};

// ── Part 5: the energy balance as a calculator (atmosphereLayers mode `balance`) ──

const SIGMA = 5.67e-8;

const energyBalanceIce: ModuleDef = {
  ...pageOf('s.12.climate-systems~energy-balance'),
  id: 'g.s12-climate-systems-energy-balance-ice',
  title: 'A snowball Earth',
  use: 'Use this for an icy Earth that reflects most of the sunlight.',
  example: { S: 1361, a: 0.6, F: (1361 * 0.4) / 4, T: ((1361 * 0.4) / 4 / SIGMA) ** 0.25 },
};

const energyBalanceMars: ModuleDef = {
  ...pageOf('s.12.climate-systems~energy-balance'),
  id: 'g.s12-climate-systems-energy-balance-mars',
  title: 'The balance on Mars',
  use: 'Use this for another planet: Mars gets 586 W/m² and reflects about 25 %.',
  example: { S: 586, a: 0.25, F: (586 * 0.75) / 4, T: ((586 * 0.75) / 4 / SIGMA) ** 0.25 },
};

// ── Part 6: a reserve drawn down (new kind `reserve`) ──

const reservesSmall: ModuleDef = {
  ...pageOf('s.12.resource-management~reserves'),
  id: 'g.s12-resource-management-reserves-field',
  title: 'A small oil field',
  use: 'Use this for a small reserve that lasts only a few years, part of a year at the end.',
  example: { Q: 2, r: 0.45, y: 2 / 0.45 },
};

const reservesLong: ModuleDef = {
  ...pageOf('s.12.resource-management~reserves'),
  id: 'g.s12-resource-management-reserves-long',
  title: 'A reserve that lasts a century',
  use: 'Use this for a large reserve used slowly, over a hundred years.',
  example: { Q: 1100, r: 8, y: 137.5 },
};

// ── Part 9: mass on the H–R diagram (hrDiagram `mass`) ──

const lifetimeDwarf: ModuleDef = {
  ...pageOf('s.12.stellar-evolution~lifetime'),
  id: 'g.s12-stellar-evolution-lifetime-dwarf',
  title: 'A red dwarf lives the longest',
  use: 'Use this for a small star, a fifth of the Sun’s mass, dim and very long-lived.',
  example: { M: 0.2, L: 0.2 ** 3.5, t: 1e10 * 0.2 ** -2.5 },
};

const lifetimeMassive: ModuleDef = {
  ...pageOf('s.12.stellar-evolution~lifetime'),
  id: 'g.s12-stellar-evolution-lifetime-massive',
  title: 'A massive star burns out fast',
  use: 'Use this for a star of 20 Suns, blue and brilliant for only a few million years.',
  example: { M: 20, L: 20 ** 3.5, t: 1e10 * 20 ** -2.5 },
};

export const HS2F_GALLERY_MODULES: ModuleDef[] = [
  lifetimeDwarf,
  lifetimeMassive,
  reservesSmall,
  reservesLong,
  energyBalanceIce,
  energyBalanceMars,
  cloudBaseHumid,
  cloudBaseDry,
  magnitudeHalf,
  magnitudeFar,
  spreadingFast,
  spreadingYoung,
  dischargeCreek,
  dischargeRiver,
];

export const HS2F_GALLERY_LAYOUTS: LayoutDef[] = [];
