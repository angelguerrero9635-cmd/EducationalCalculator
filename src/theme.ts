/**
 * The app's entire look lives in this file. To restyle the app, change values here:
 * palettes (light and dark), the font family and type scale, spacing, corner radius, and
 * chart styling. Components read these tokens and hardcode no colors, fonts or sizes.
 */
import { useSyncExternalStore } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { prefsStore } from '@/state/prefs';

// ─── Colors ──────────────────────────────────────────────────────────────────

/** Light theme: a cool off-white page, white cards and an indigo accent. */
const light = {
  background: '#F5F6FA',
  /** Secondary backgrounds: inputs, segmented-control tracks, pressed rows. */
  surface: '#ECEEF4',
  /** Cards and boxes that sit on the page. */
  card: '#FFFFFF',
  /** The selected part of a segmented control. */
  thumb: '#FFFFFF',
  /** Placeholder boxes and the "not yet built" areas. */
  placeholder: '#E3E6EE',
  border: '#DDE1EA',
  text: '#14161F',
  textMuted: '#636A7A',
  /** Primary buttons, selected chips and segments, links, the active tab. */
  accent: '#4F46E5',
  /** A tint of the accent for soft highlights (selected rows, badges). */
  accentSoft: '#EEF0FF',
  onAccent: '#FFFFFF',
  /** The hero banner's gradient, top-left to bottom-right. */
  heroFrom: '#4F46E5',
  heroTo: '#7C3AED',
  onHero: '#FFFFFF',
  /** The dimmed page behind a menu or sheet. */
  scrim: 'rgba(0, 0, 0, 0.35)',

  // Charts and diagrams (can be styled separately from the rest of the app).
  /** Main lines, shapes' outlines and labels. */
  chartInk: '#1B1E28',
  /** Secondary lines (guides, dashed helpers) and secondary labels. */
  chartMuted: '#6B7280',
  /** Shape fills (rectangles, circles, bars you can drag). */
  chartFill: '#E4E7F0',
  /** Secondary fills (calculated bars, empty grid cells, table header). */
  chartSurface: '#F1F3F8',
  /** Grid lines, cell borders and axis frames. */
  chartGrid: '#D5D9E3',
  /** Highlighted data (solid counters, shaded squares, the selected table row). */
  chartHighlight: '#4F46E5',
  onChartHighlight: '#FFFFFF',
  /** A second color for counters and parts beside the highlight (the yellow of two-color counters). */
  chartSecond: '#F4B740',
  /** Hops that take away on a number line (Hops.tsx), beside the highlight for adding. */
  hopBack: '#C2410C',
  /** The function graph (H01): a second curve g(x) or the inverse, beside f in the highlight. */
  fnSecond: '#C2570C',
  /** Elimination's sum of two equations (H16), a third line beside the system's two. */
  lineSum: '#0F766E',
  /** College function graph regions (HC12): the part above the axis (+) and below it (−). */
  regionPlus: '#0F7A55',
  regionMinus: '#B42318',
  /** An upright boundary x = k on a line system (H92), beside its two lines. */
  lineUpright: '#BE185D',
  /** The sunlit half of a globe or moon (lighter than the night half in both themes). */
  chartDay: '#E4E7F0',
  /** The night half of a globe or moon. */
  chartNight: '#8A8E99',

  // Materials: real objects in pictures (jugs of water, coins, wood, rock) drawn in their own
  // colors, so a picture reads like the thing it shows. Shading is layered on with the sheen.
  /** Water and other clear liquids. */
  water: '#4FA3E3',
  waterDeep: '#2677BD',
  /** The lighter band at a liquid's surface. */
  waterTop: '#A9D5F6',
  /** A glass wall's tint, its outline and its shine. */
  glass: '#EEF5FB',
  glassEdge: '#8FA6BD',
  glassShine: '#FFFFFF',
  /** Thermometer liquid. */
  mercury: '#E0453A',
  /** Pennies. */
  copper: '#D08A52',
  copperDark: '#8E4F24',
  /** Nickels, dimes and quarters. */
  silver: '#DCE1E7',
  silverDark: '#8A95A2',
  /** Numbers stamped on silver coins and on pennies. */
  coinInk: '#232833',
  pennyInk: '#FFF7EE',
  /** Dollar bills: paper and ink. */
  bill: '#D5E8CB',
  billInk: '#35613A',
  /** Rulers, crates, meter sticks, the base of a balance. */
  wood: '#E8C08A',
  woodDark: '#B07F45',
  /** Metal parts: scale bodies, pans, dials. */
  metal: '#CDD3DB',
  metalDark: '#7D8795',
  /** A clock face, a dial or a card. */
  paper: '#FFFDF8',
  /** Plain cloth (an umbrella's canopy beside a colored one). */
  fabric: '#D9DCE3',
  /** Rock layers, top to bottom: sandstone, shale, limestone, siltstone, mudstone, clay. */
  rock1: '#EACB92',
  rock2: '#A7B0BA',
  rock3: '#DDD7C6',
  rock4: '#C9A57E',
  rock5: '#9C8A77',
  rock6: '#D4B7A0',
  /** Nature scenes (food web, sky, garden): the sun, the moon, animals, soil and cups. */
  sunDisk: '#F7C948',
  sunRay: '#EFA23A',
  moonLit: '#F4F0DC',
  moonDark: '#5A5F6E',
  /** Hawk feathers (back and belly), snake scales, frog skin, insect (fur is with the card icons). */
  feather: '#8C5E3C',
  featherLight: '#EADFCB',
  scales: '#8A9A48',
  frogSkin: '#5DAA4E',
  insect: '#A7C23E',
  animalEye: '#1B1E28',
  /** Garden soil, and a dark and a light cup. */
  soil: '#8B6A4E',
  soilDark: '#5E4634',
  cupDark: '#2E323C',
  cupLight: '#F6F5F0',
  /** Pattern blocks in their classroom colors: red trapezoid, blue rhombus, green triangle. */
  blockRed: '#E5484D',
  blockBlue: '#3E7BD6',
  blockGreen: '#3DA35D',
  onBlock: '#FFFFFF',
  /** Round-4 group A: a kraft cardboard box (faces, dark side, packing tape) and a red rubber ball. */
  boxKraft: '#CFA36C',
  boxKraftDark: '#A0743F',
  boxTape: '#EAD7AE',
  ballRed: '#E0453A',
  /** A green felt counting mat. */
  feltMat: '#CFE6CF',
  /** Lamp light through a microscope slide: bright in both themes, as it is in life. */
  slideLight: '#FFFBEA',
  /** Plastic tools (protractors, counters' tray). */
  plastic: '#DCEBFF',
  /** Living things: cells, leaves. */
  life: '#8FCB8A',
  lifeDeep: '#4E9A4E',
  /**
   * Biology (HS group G): sugar rings, amino acids, phosphates, glycerol and fatty acids; a
   * membrane's lipid heads and tails, its proteins and solute; red blood cells; the chloroplast
   * and mitochondrion; ATP; chromosomes by parent and the spindle; DNA and RNA bases; flower
   * colors for dominance; `bioInk` is text on these fills in both themes.
   */
  bioSugar: '#F2C94C',
  bioSugarEdge: '#A7801A',
  bioAmino: '#86BAEB',
  bioAminoEdge: '#2F6CA8',
  bioPhosphate: '#F29B4C',
  bioGlycerol: '#BFA2E6',
  bioFatty: '#EBD78E',
  bioHead: '#EC8D7C',
  bioTail: '#F3E2AA',
  bioProtein: '#7FA2E3',
  bioProteinEdge: '#3D5FA8',
  bioSolute: '#8E5BD0',
  bloodCell: '#D94A4A',
  bloodCellDeep: '#9E2626',
  bioStroma: '#D3EFC6',
  bioThylakoid: '#3F8F3F',
  bioMito: '#F2A77A',
  bioMitoMatrix: '#FCE6D3',
  bioAtp: '#F0B21C',
  bioMaternal: '#E0533F',
  bioPaternal: '#3A73D6',
  bioSpindle: '#9AA3B2',
  /** H3D (H109): a neuron's cell, its myelin sheath, and the spinal cord's gray matter. */
  neuronCell: '#E9B44C',
  neuronMyelin: '#FBF3DC',
  cordGray: '#C9B8D8',
  dnaA: '#44B552',
  dnaT: '#E8574C',
  dnaG: '#F2B233',
  dnaC: '#4A86E6',
  dnaU: '#A46AE0',
  dnaBackbone: '#A8AFBB',
  flowerRed: '#D8344A',
  flowerPink: '#F4A3BE',
  flowerWhite: '#FBFAF5',
  bioInk: '#1B1E28',
  /** Animals and people in card icons: brown, dark brown, tan and grey fur, and skin. */
  fur: '#A8764A',
  furDark: '#6B4428',
  furLight: '#DDB88C',
  furGrey: '#9EA4AC',
  skin: '#E2AE86',
  /** People in the round-3 scene icons (group G): more skin tones, and the sky at dawn and dusk. */
  skinBrown: '#B67B52',
  skinDeep: '#7B4A2E',
  skyMorning: '#BFE3F7',
  skyEvening: '#F5A36A',
  /** Snow, and white fur and feathers. */
  snow: '#FAFCFF',
  /** A seal's blubber in a cut-away. */
  fat: '#F4E2B0',
  /** Tree bark. */
  bark: '#8A6F58',
  /** Pink flower petals (a rose, a bean flower), an earthworm's skin, and bright pollen. */
  petalPink: '#F08DB4',
  wormPink: '#D98A86',
  pollen: '#FFD21F',
  /** Black rubber and plastic (tires, a pan handle), and black fur and feathers. */
  rubber: '#34373E',
  /** Orange things: a wind sock, juice, a goldfish. */
  orange: '#F08A2C',
  /** A purple spinner sector or marble (beside the pattern-block red, blue and green). */
  purple: '#8E5BD0',
  /**
   * Atoms in ball-and-stick molecules, in the classroom (CPK) colors: hydrogen white, carbon
   * black, oxygen red, nitrogen blue, chlorine and fluorine green, sulfur yellow, phosphorus
   * orange, sodium and potassium violet, other metals grey, noble gases cyan, the rest pink.
   * `atomInk` and `onAtom` are the symbols printed on light and dark balls; `atomBond` the sticks.
   */
  atomH: '#F4F5F7',
  atomC: '#3A3E46',
  atomO: '#E0403A',
  atomN: '#3C64D8',
  atomHalogen: '#3DAE4A',
  atomS: '#EDC937',
  atomP: '#EE8A2E',
  atomAlkali: '#9457D0',
  atomMetal: '#A3ABB6',
  atomNoble: '#4CC3D6',
  atomOther: '#E07FBE',
  atomInk: '#1B1E28',
  onAtom: '#FFFFFF',
  atomBond: '#9AA1AC',
  /**
   * Chemistry pictures (HS group J): gas particles, dissolved solute, the catalyst's path, a
   * foam-cup calorimeter, zinc, the blue of copper(II) and green of nickel(II) solutions, a
   * salt bridge's paste, and parent and daughter atoms in a decay grid.
   */
  gasParticle: '#3D7DD8',
  soluteParticle: '#8E44AD',
  energyCatalyst: '#0F8A5F',
  foamCup: '#F7F5EF',
  foamCupEdge: '#C4BDAC',
  zinc: '#B4BDC9',
  zincDark: '#6F7B8A',
  copperIon: '#6FB3EA',
  nickelIon: '#8CCF9A',
  saltBridge: '#F1EDE2',
  decayParent: '#2F9E6A',
  decayDaughter: '#C5CAD3',
  /** Periodic-table families (flat fills): metals, metalloids, nonmetals, noble gases. */
  tableMetal: '#D7E4F7',
  tableMetalloid: '#DCEFD2',
  tableNonmetal: '#FCEBC4',
  tableNoble: '#E9DDF8',
  /** The visible spectrum in rainbow order (vivid in both themes, as light is). */
  spectrumRed: '#E53935',
  spectrumOrange: '#F57C00',
  spectrumYellow: '#FDD835',
  spectrumGreen: '#43A047',
  spectrumBlue: '#1E88E5',
  spectrumViolet: '#7B3FC4',
  /** A magnet's painted ends: north red, south blue. */
  poleNorth: '#D93A3A',
  poleSouth: '#2F6FD0',
  /** A lit bulb's warm glow. */
  bulbGlow: '#FFD95A',
  /** Brass bells and horns, and chocolate (card icons, round 3 group B). */
  brass: '#D9A83B',
  brassDark: '#8C6420',
  chocolate: '#6B3E22',
  /** A flower's petals, and a body's organs: brain and lungs, heart, stomach, and bones. */
  petal: '#E8618C',
  organ: '#EFA3A8',
  organDeep: '#C83A44',
  stomach: '#E3B07A',
  bone: '#F3EEDF',
  /** Planets in their own colors (Earth is water and land; the moon is moonLit). */
  planetMercury: '#A9A39B',
  planetVenus: '#E8D3A2',
  planetMars: '#C8643B',
  planetJupiter: '#D8B48A',
  planetJupiterBand: '#A8754F',
  planetSaturn: '#E3CD92',
  planetUranus: '#9ED9DE',
  planetNeptune: '#4A74D9',
  /** Earth and space (HS group L), minerals: quartz, pink feldspar, mica, calcite, halite, brassy
   * pyrite, hematite and its red streak, and the Mohs minerals talc, fluorite, apatite, topaz and
   * corundum. */
  mineralQuartz: '#EEF1F6',
  mineralFeldspar: '#E9A58C',
  mineralMica: '#C9B98F',
  mineralCalcite: '#F3E6C4',
  mineralHalite: '#F4F6F8',
  mineralPyrite: '#D7B845',
  mineralPyriteDark: '#8C7424',
  mineralHematite: '#5E6168',
  mineralHematiteStreak: '#9B3B2B',
  mineralTalc: '#D7E8D2',
  mineralFluorite: '#A77BD8',
  mineralApatite: '#6FBF9A',
  mineralTopaz: '#F2C065',
  mineralCorundum: '#C8324A',
  /** Earth's interior (H72): crust, mantle, liquid outer core, solid inner core; P and S waves. */
  earthCrust: '#8B6A4E',
  earthMantle: '#E3935B',
  earthOuterCore: '#F2B84B',
  earthInnerCore: '#FBE38A',
  quakeP: '#2563EB',
  quakeS: '#C2410C',
  /** Magnetic stripes on the seafloor (H103): rock of normal and of reversed polarity. */
  magNormal: '#3E4A61',
  magReversed: '#E3E7EE',
  /** Landforms (H73): lava and its glow, basalt, ash, cinders, magma, dune sand, clay, grass. */
  landLava: '#E8612C',
  landLavaGlow: '#F9A03F',
  landBasalt: '#5B5552',
  landAsh: '#B3ADA6',
  landCinder: '#7A4234',
  landMagma: '#D9381E',
  landSand: '#E9CE8E',
  landClay: '#B98568',
  landGrass: '#8CC26B',
  /** The ocean (H75): warm and cold currents on the map, and seafloor sediment. */
  currentWarm: '#D93A3A',
  currentCold: '#2F6FD0',
  seafloor: '#9C8A77',
  /** The atmosphere (H76): its four layers as bands, the ozone layer, and highs and lows. */
  atmoTropo: '#DCEFFB',
  atmoStrato: '#E6E9FB',
  atmoMeso: '#EFE6F8',
  atmoThermo: '#FBE9E3',
  atmoOzone: '#9BD3C0',
  pressureHigh: '#1D5FD1',
  pressureLow: '#D12F2F',
  /** The greenhouse figure (H77): space, the air, and the tropical band. */
  space: '#1E2340',
  airBand: '#CFE7F7',
  zoneTropical: '#F4B860',
  /** Energy sources (H78): a solar panel's cells. */
  solarCell: '#22407A',
  /** Stars (H79–H80) by surface temperature, hot blue to cool red, and a nebula's glow. */
  starBlue: '#9DB8FF',
  starWhite: '#F2F4FF',
  starYellow: '#FFE27A',
  starOrange: '#FFB05C',
  starRed: '#F0643C',
  nebulaPink: '#E48BC0',
  nebulaBlue: '#7FB3E8',
  /** Earth and space round 3 (H110): a fossil coral's wall, its daily ridges and yearly
   * grooves; a planet's silhouette in transit; the habitable zone, too hot inside, too cold out. */
  coralFossil: '#DCCBA8',
  coralRidge: '#9A8460',
  coralGroove: '#6E5A3C',
  transitPlanet: '#15171F',
  zoneHabitable: '#5DBB6E',
  zoneHot: '#F08A5D',
  zoneCold: '#86B4E6',
  /** Grades 9–12 group D: sine and cosine legs on the unit circle, algebra tiles (positive and
   * negative), and a resultant vector. */
  unitCircleSine: '#D9480F',
  unitCircleCosine: '#0B8A6F',
  tilePositive: '#8CC8F0',
  tilePositiveEdge: '#2F79B5',
  tileNegative: '#F2A3A3',
  tileNegativeEdge: '#C23A3A',
  vectorResultant: '#0E9F6E',
  /** H98: the unit circle's two angles in turn, A then B (and a second value's line). */
  unitCircleAngleA: '#0E7490',
  unitCircleAngleB: '#C2410C',
  /** H95: the area box's like-term diagonals, one tint each. */
  areaBoxBand1: '#DCE9FB',
  areaBoxBand2: '#FCE7C8',
  areaBoxBand3: '#DDF3E4',
  areaBoxBand4: '#F3DDF0',
  areaBoxBand5: '#FFF5BF',
  areaBoxBand6: '#E3E0FA',
  /** Weather cards: a rain or snow cloud, a storm cloud, fog, a sandbag's burlap. */
  rainCloud: '#D3D9E2',
  stormCloud: '#6B7486',
  mist: '#C3CAD4',
  sandbag: '#D8BF8F',
  /** The water pie chart (round 4, group F): ice, and liquid fresh water beside the salt sea. */
  ice: '#DDF1F7',
  freshWater: '#38B2A4',
  /** H108 (round 3, group E): phase diagram regions, and a gas mixture's gases (He, O₂, N₂, …). */
  phaseSolid: '#DCEBF7',
  phaseLiquid: '#BFE0F2',
  phaseGas: '#FBF1DF',
  gasMixA: '#E0A81E',
  gasMixB: '#D8413A',
  gasMixC: '#3563C9',
  gasMixD: '#2A9D7C',
  /** The brick wall a ladder leans on (triangleSolver's ladder scene) and its mortar lines. */
  ladderWall: '#B5654A',
  ladderWallDark: '#8A4632',
  /** Statistics pictures (HS group B): a rejection region, an interval that misses the mean. */
  normalReject: '#D93B3B',
  /** Biology pictures (HS group H): an agarose gel (slab, edge, stained band, well); a limb's
   * bones by kind (upper, forearm, wrist, hand); pathogens and immune cells; lichen, moss and a
   * root nodule; the second antibody response. */
  gelSlab: '#DDE8F0',
  gelEdge: '#93A9BC',
  gelBand: '#28449C',
  gelWell: '#5B6B7C',
  limbUpper: '#E86A5C',
  limbForearm: '#F2B84B',
  limbWrist: '#6FBF73',
  limbHand: '#5B8DEF',
  virusCoat: '#C9A0DC',
  virusSpike: '#8E4FB5',
  bacteriumCell: '#9ACD6E',
  fungusCell: '#E9D8A6',
  parasiteCell: '#F0A7B8',
  immuneMacrophage: '#F2C9A0',
  immuneBCell: '#9CC8F2',
  immuneTCell: '#A8DDB5',
  antibody: '#E0A21C',
  lichen: '#B8B070',
  moss: '#6FA63A',
  rootNodule: '#E9A7A0',
  antibodySecond: '#C2570C',
  /** Card icons H2E (H100, H104): veins, kidneys, a gland, nerves; A and B antigens on red cells. */
  h2eVein: '#4C7FD9',
  h2eKidney: '#A8483E',
  h2eGland: '#E9B35A',
  h2eNerve: '#E8B923',
  h2eAntigenA: '#2E9E5B',
  h2eAntigenB: '#E08A1C',
  /** Chemistry (HS group I): a unit struck through when it cancels in a chain. */
  unitCancel: '#D9480F',
  /** Bohr models: protons, neutrons and electrons. */
  atomProton: '#E0563F',
  atomNeutron: '#9AA3AF',
  atomElectron: '#3B82F6',
  /** A periodic trend's shading (darker for more) and the symbols on its darkest cells. */
  trendShade: '#0F766E',
  onTrendShade: '#FFFFFF',
  /** A bond dipole's crossed arrow. */
  dipole: '#C2410C',
  /**
   * Physics (HS group K): force arrows by kind (weight, normal, friction, tension, applied, net);
   * the hot and cold reservoirs and work out of an engine; light rays; + and − charges and field
   * lines; a spring's steel; two carts' paint; a resistor's body; an iron core.
   */
  forceWeight: '#C2410C',
  forceNormal: '#2563EB',
  forceFriction: '#B45309',
  forceTension: '#7C3AED',
  forceApplied: '#0F766E',
  forceNet: '#DB2777',
  physHot: '#E4572E',
  physCold: '#3B82C4',
  physWork: '#2F9E44',
  physRay: '#E8A10C',
  physPlus: '#D93A3A',
  physMinus: '#2F6FD0',
  physField: '#8A93A6',
  physSpring: '#8C96A5',
  physCartA: '#3E7BD6',
  physCartB: '#E5484D',
  physResistor: '#E6D3B0',
  physIron: '#8D949E',
  satellitePanel: '#2B4C8C',
  /** HC2 skeletal structures: a lit functional group's band; O, N, S and halogen letters. */
  skeletalLit: '#FBBF24',
  skeletalO: '#C62828',
  skeletalN: '#1D4ED8',
  skeletalS: '#A16207',
  skeletalHalogen: '#15803D',
  /** H106: a town's land and its outline on a population map. */
  populationLand: '#DDEFD6',
  populationEdge: '#4F8A3C',
  /** H106: the band a measured rectangle's true edges can be in. */
  boundsBand: 'rgba(194, 87, 12, 0.18)',
  /** HC3 section: concrete and its aggregate, rebar, the C and T stress blocks, τ, A_m shaded. */
  sectionConcrete: '#CBC6BB',
  sectionConcreteDark: '#A29C90',
  sectionAggregate: '#8C8679',
  sectionRebar: '#8A6E58',
  sectionRebarDark: '#4E3C2F',
  sectionCompression: '#2F6FD0',
  sectionTension: '#D9480F',
  sectionShear: '#0F766E',
  sectionEnclosed: 'rgba(79, 70, 229, 0.14)',
  /** HC6 fluidSystem: oil, mercury, air; the grade lines; concrete; a car, a hull, ice. */
  fluidOil: '#E2A93F',
  fluidOilDeep: '#B7791F',
  fluidMercury: '#C3C9D1',
  fluidMercuryDeep: '#7F8996',
  fluidAir: '#EAF4FB',
  fluidStream: '#7FA8C9',
  fluidEgl: '#C2410C',
  fluidHgl: '#1D4ED8',
  fluidConcrete: '#CBC6BB',
  fluidConcreteDark: '#958F83',
  fluidPaint: '#D9480F',
  fluidHull: '#9F1D20',
  fluidIce: '#DDF0FA',
  /** Marks drawn on a liquid (pressure arrows, a depth line). */
  fluidMark: '#FFFFFF',
  /** A soft shadow under objects, and the dark and light sides of the sheen. */
  shadow: 'rgba(16, 24, 40, 0.16)',
  shade: '#0B1020',
  shine: '#FFFFFF',
  /** How strong highlights are: dark pictures take less, or dark fills turn grey. */
  sheen: 1,
  /** Edge light and edge shade for flat pieces drawn as views (cubes in a train). */
  edgeLight: 'rgba(255, 255, 255, 0.4)',
  edgeShade: 'rgba(0, 0, 0, 0.2)',
};

export type Palette = typeof light;

/** Dark theme: a deep blue-black page with slightly lighter cards and a softer indigo. */
const dark: Palette = {
  background: '#0D0F14',
  surface: '#1D2029',
  card: '#171A21',
  thumb: '#323846',
  placeholder: '#242833',
  border: '#2A2F3A',
  text: '#EEF0F6',
  textMuted: '#9AA1B2',
  accent: '#8B83FF',
  accentSoft: '#23224A',
  onAccent: '#0D0F14',
  heroFrom: '#3730A3',
  heroTo: '#6D28D9',
  onHero: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.55)',

  chartInk: '#EEF0F6',
  chartMuted: '#9AA1B2',
  chartFill: '#262A35',
  chartSurface: '#1D2029',
  chartGrid: '#343947',
  chartHighlight: '#8B83FF',
  onChartHighlight: '#0D0F14',
  chartSecond: '#B8862E',
  hopBack: '#F08A4B',
  fnSecond: '#F5A04A',
  lineSum: '#2DD4BF',
  regionPlus: '#34D399',
  regionMinus: '#F87171',
  lineUpright: '#F472B6',
  chartDay: '#4A5068',
  chartNight: '#0B0C10',

  water: '#3C8BD0',
  waterDeep: '#1F5E99',
  waterTop: '#6FB2EA',
  glass: '#1B2531',
  glassEdge: '#6B8199',
  glassShine: '#4A5E75',
  mercury: '#F0645A',
  copper: '#B8733F',
  copperDark: '#6E3A1A',
  silver: '#A7B0BB',
  silverDark: '#5E6874',
  coinInk: '#14171D',
  pennyInk: '#FFF1E2',
  bill: '#35503A',
  billInk: '#BFE0B4',
  wood: '#A67C4C',
  woodDark: '#6E4F2E',
  metal: '#4B5360',
  metalDark: '#2B313B',
  paper: '#20242E',
  fabric: '#4A505D',
  rock1: '#9C8453',
  rock2: '#5D6570',
  rock3: '#8A8676',
  rock4: '#7F6448',
  rock5: '#5B4E42',
  rock6: '#806856',
  sunDisk: '#E2B53E',
  sunRay: '#C98A2A',
  moonLit: '#DCD6B8',
  moonDark: '#2A2E39',
  feather: '#6E4A2F',
  featherLight: '#B9AA90',
  scales: '#66743A',
  frogSkin: '#428A38',
  insect: '#7E962E',
  animalEye: '#0B0C10',
  soil: '#6A5039',
  soilDark: '#43321F',
  cupDark: '#0F1116',
  cupLight: '#CDD0D6',
  blockRed: '#D8474C',
  blockBlue: '#3C74C8',
  blockGreen: '#3A9656',
  onBlock: '#FFFFFF',
  boxKraft: '#A67E4E',
  boxKraftDark: '#76532C',
  boxTape: '#C5AE7F',
  ballRed: '#C93C33',
  feltMat: '#2C4435',
  slideLight: '#E6E0C4',
  plastic: '#22324A',
  life: '#4F8A4B',
  lifeDeep: '#2F6230',
  bioSugar: '#D9B23A',
  bioSugarEdge: '#F2D77E',
  bioAmino: '#5C93CC',
  bioAminoEdge: '#AFD0F2',
  bioPhosphate: '#D98232',
  bioGlycerol: '#9A7BC6',
  bioFatty: '#C4AF66',
  bioHead: '#D06F60',
  bioTail: '#B3A06A',
  bioProtein: '#5F82C6',
  bioProteinEdge: '#A8C0F0',
  bioSolute: '#A77BE6',
  bloodCell: '#C23B3B',
  bloodCellDeep: '#E58080',
  bioStroma: '#35502F',
  bioThylakoid: '#63B063',
  bioMito: '#C97A50',
  bioMitoMatrix: '#553A2C',
  bioAtp: '#F2C94C',
  bioMaternal: '#EE6E5C',
  bioPaternal: '#6C9CF0',
  bioSpindle: '#6E7788',
  neuronCell: '#D6A23E',
  neuronMyelin: '#E6DCC2',
  cordGray: '#8C7BA3',
  dnaA: '#4CC05A',
  dnaT: '#EE6A60',
  dnaG: '#F5C451',
  dnaC: '#6699F0',
  dnaU: '#B283EA',
  dnaBackbone: '#6E7686',
  flowerRed: '#E0506A',
  flowerPink: '#E58AA8',
  flowerWhite: '#EDEBE4',
  bioInk: '#1B1E28',
  fur: '#8A5E38',
  furDark: '#553520',
  furLight: '#A88762',
  furGrey: '#747A83',
  skin: '#B8835E',
  skinBrown: '#95633F',
  skinDeep: '#643C25',
  skyMorning: '#4E7390',
  skyEvening: '#A85A34',
  snow: '#CDD6E1',
  fat: '#C4AD76',
  bark: '#65503F',
  petalPink: '#C8698F',
  wormPink: '#A9625F',
  pollen: '#E9BE1C',
  rubber: '#1C1E23',
  orange: '#D2742A',
  purple: '#7A4DB8',
  atomH: '#D5D9DF',
  atomC: '#5D636E',
  atomO: '#D2463F',
  atomN: '#4A6FDA',
  atomHalogen: '#37984A',
  atomS: '#CDAE30',
  atomP: '#D2762A',
  atomAlkali: '#8150BD',
  atomMetal: '#848D99',
  atomNoble: '#3AA3B5',
  atomOther: '#C06CA3',
  atomInk: '#14171D',
  onAtom: '#FFFFFF',
  atomBond: '#7B828E',
  gasParticle: '#6EA2EE',
  soluteParticle: '#B780E0',
  energyCatalyst: '#34C38F',
  foamCup: '#3A3F4B',
  foamCupEdge: '#727888',
  zinc: '#7D8795',
  zincDark: '#454D59',
  copperIon: '#2F6FA6',
  nickelIon: '#3F7F50',
  saltBridge: '#4A4E58',
  decayParent: '#3FBF84',
  decayDaughter: '#555C69',
  tableMetal: '#22324A',
  tableMetalloid: '#253A26',
  tableNonmetal: '#43381C',
  tableNoble: '#34284A',
  spectrumRed: '#DB3C3C',
  spectrumOrange: '#E57A1E',
  spectrumYellow: '#E8C93A',
  spectrumGreen: '#3F9848',
  spectrumBlue: '#2F80D2',
  spectrumViolet: '#8252C8',
  poleNorth: '#C94444',
  poleSouth: '#3A6FC0',
  bulbGlow: '#F2C94C',
  brass: '#B8892E',
  brassDark: '#6A4A18',
  chocolate: '#5E3620',
  petal: '#C9507A',
  organ: '#C7838A',
  organDeep: '#B8323C',
  stomach: '#B98A5A',
  bone: '#D9D3C2',
  planetMercury: '#8A857E',
  planetVenus: '#BFAA7A',
  planetMars: '#A9532F',
  planetJupiter: '#B08E68',
  planetJupiterBand: '#83593A',
  planetSaturn: '#BBA56E',
  planetUranus: '#6FB2B8',
  planetNeptune: '#3A5FB8',
  mineralQuartz: '#C9CED8',
  mineralFeldspar: '#B97660',
  mineralMica: '#9C8E68',
  mineralCalcite: '#C7B893',
  mineralHalite: '#D2D6DC',
  mineralPyrite: '#B89A33',
  mineralPyriteDark: '#6E5A1A',
  mineralHematite: '#4A4D55',
  mineralHematiteStreak: '#B24A38',
  mineralTalc: '#A9BFA3',
  mineralFluorite: '#8E64C2',
  mineralApatite: '#4F9C79',
  mineralTopaz: '#D2A24A',
  mineralCorundum: '#C23A50',
  earthCrust: '#6A5039',
  earthMantle: '#A8603A',
  earthOuterCore: '#B98A2E',
  earthInnerCore: '#D8BE5C',
  quakeP: '#6EA0FF',
  quakeS: '#F08A3C',
  magNormal: '#8C9AB5',
  magReversed: '#2A2F3B',
  landLava: '#D5582A',
  landLavaGlow: '#E08A34',
  landBasalt: '#45403E',
  landAsh: '#77726C',
  landCinder: '#5E3228',
  landMagma: '#B8321B',
  landSand: '#A8905C',
  landClay: '#86604B',
  landGrass: '#5E8C45',
  currentWarm: '#F0625A',
  currentCold: '#5B9BFF',
  seafloor: '#6B5D50',
  atmoTropo: '#1C3446',
  atmoStrato: '#232A48',
  atmoMeso: '#2D2442',
  atmoThermo: '#3C2A28',
  atmoOzone: '#3E7C68',
  pressureHigh: '#6EA0FF',
  pressureLow: '#FF6B6B',
  space: '#0C0F22',
  airBand: '#1E3A50',
  zoneTropical: '#B9812F',
  solarCell: '#2B4E8F',
  starBlue: '#9DB8FF',
  starWhite: '#F2F4FF',
  starYellow: '#FFE27A',
  starOrange: '#FFB05C',
  starRed: '#F0643C',
  nebulaPink: '#C66EA2',
  nebulaBlue: '#5E93CC',
  coralFossil: '#9E8D6C',
  coralRidge: '#5E4F37',
  coralGroove: '#3F3222',
  transitPlanet: '#05060A',
  zoneHabitable: '#3F9150',
  zoneHot: '#B05A36',
  zoneCold: '#4F7DB0',
  unitCircleSine: '#FF8A5C',
  unitCircleCosine: '#3CCFAE',
  tilePositive: '#2F5F86',
  tilePositiveEdge: '#8CC8F0',
  tileNegative: '#7A3434',
  tileNegativeEdge: '#F2A3A3',
  vectorResultant: '#34D399',
  unitCircleAngleA: '#38BDF8',
  unitCircleAngleB: '#FB923C',
  areaBoxBand1: '#26374F',
  areaBoxBand2: '#4A3A22',
  areaBoxBand3: '#223F2E',
  areaBoxBand4: '#472A45',
  areaBoxBand5: '#48431F',
  areaBoxBand6: '#322E55',
  rainCloud: '#687182',
  stormCloud: '#434A58',
  mist: '#5E6676',
  sandbag: '#9B8558',
  ice: '#B7D6E0',
  freshWater: '#2E9488',
  phaseSolid: '#243447',
  phaseLiquid: '#1C3A52',
  phaseGas: '#3A3222',
  gasMixA: '#E6B43A',
  gasMixB: '#E2605A',
  gasMixC: '#5B86E0',
  gasMixD: '#3DB894',
  ladderWall: '#8C4B37',
  ladderWallDark: '#5E3023',
  normalReject: '#F0716B',
  gelSlab: '#243446',
  gelEdge: '#5A7590',
  gelBand: '#9DBBFF',
  gelWell: '#0E141C',
  limbUpper: '#F07C6E',
  limbForearm: '#F2C35E',
  limbWrist: '#7FCB83',
  limbHand: '#7EA6F5',
  virusCoat: '#B98ACF',
  virusSpike: '#D3A5EE',
  bacteriumCell: '#8CBF60',
  fungusCell: '#D8C590',
  parasiteCell: '#E595A8',
  immuneMacrophage: '#D9AE85',
  immuneBCell: '#7FB1E0',
  immuneTCell: '#8CCB9C',
  antibody: '#F2B53A',
  lichen: '#A6A060',
  moss: '#78B044',
  rootNodule: '#D98F88',
  antibodySecond: '#F08A3C',
  h2eVein: '#6F9CF0',
  h2eKidney: '#C9675B',
  h2eGland: '#D9A04A',
  h2eNerve: '#F2CC4A',
  h2eAntigenA: '#4CC07A',
  h2eAntigenB: '#F2A64A',
  unitCancel: '#F08A4B',
  atomProton: '#D9573F',
  atomNeutron: '#7D8693',
  atomElectron: '#5B9BF8',
  trendShade: '#2DD4BF',
  onTrendShade: '#0D0F14',
  dipole: '#FB923C',
  forceWeight: '#FB8A4C',
  forceNormal: '#6EA3FF',
  forceFriction: '#E0A04A',
  forceTension: '#B794F6',
  forceApplied: '#2DD4BF',
  forceNet: '#F472B6',
  physHot: '#F07A55',
  physCold: '#5DA2E0',
  physWork: '#51C26A',
  physRay: '#F5C040',
  physPlus: '#EF6B6B',
  physMinus: '#5B8FE8',
  physField: '#7D879A',
  physSpring: '#9AA3B1',
  physCartA: '#4A82D8',
  physCartB: '#DD5357',
  physResistor: '#8A7A5C',
  physIron: '#626A75',
  satellitePanel: '#3D5FA3',
  skeletalLit: '#F59E0B',
  skeletalO: '#FF8A80',
  skeletalN: '#93C5FD',
  skeletalS: '#FACC15',
  skeletalHalogen: '#86EFAC',
  populationLand: '#1F3320',
  populationEdge: '#7CC46A',
  boundsBand: 'rgba(245, 160, 74, 0.22)',
  sectionConcrete: '#625E56',
  sectionConcreteDark: '#45423C',
  sectionAggregate: '#857F73',
  sectionRebar: '#A88B72',
  sectionRebarDark: '#5E4A3A',
  sectionCompression: '#5B9BF8',
  sectionTension: '#F08A4B',
  sectionShear: '#2DD4BF',
  sectionEnclosed: 'rgba(139, 131, 255, 0.2)',
  fluidOil: '#B8862F',
  fluidOilDeep: '#86601C',
  fluidMercury: '#9AA3AF',
  fluidMercuryDeep: '#5B6470',
  fluidAir: '#1A2733',
  fluidStream: '#5F8AAE',
  fluidEgl: '#F08A4B',
  fluidHgl: '#7BA7FF',
  fluidConcrete: '#77736B',
  fluidConcreteDark: '#4D4A44',
  fluidPaint: '#E8692E',
  fluidHull: '#C2484B',
  fluidIce: '#A9CCE0',
  fluidMark: '#E8F1FA',
  shadow: 'rgba(0, 0, 0, 0.45)',
  shade: '#000000',
  shine: '#FFFFFF',
  sheen: 0.4,
  edgeLight: 'rgba(255, 255, 255, 0.3)',
  edgeShade: 'rgba(0, 0, 0, 0.35)',
};

/**
 * Color tones for cards that group things (grade bands, subjects, divisions): a soft
 * background and a strong foreground for the badge text. Picked by index.
 */
const tonesLight = [
  { bg: '#EEF0FF', fg: '#4338CA' }, // indigo
  { bg: '#FFF4DE', fg: '#B45309' }, // amber
  { bg: '#E3F7F3', fg: '#0F766E' }, // teal
  { bg: '#E6F4FF', fg: '#0369A1' }, // sky
  { bg: '#F3E8FF', fg: '#7E22CE' }, // violet
  { bg: '#FFE9EF', fg: '#BE123C' }, // rose
  { bg: '#E8F7E6', fg: '#15803D' }, // green
];
const tonesDark: typeof tonesLight = [
  { bg: '#23224A', fg: '#A5A0FF' },
  { bg: '#3A2A12', fg: '#FBBF24' },
  { bg: '#10302C', fg: '#5EEAD4' },
  { bg: '#0F2A3D', fg: '#7DD3FC' },
  { bg: '#2E1A45', fg: '#D8B4FE' },
  { bg: '#3B1822', fg: '#FDA4AF' },
  { bg: '#15301B', fg: '#86EFAC' },
];
export type Tone = (typeof tonesLight)[number];

export const palettes = { light, dark };

const getAppearance = () => prefsStore.get().appearance;
const noSubscribe = () => () => {};

/**
 * False while rendering on the server (web static rendering) and while the browser hydrates
 * that HTML; true once the page is live. Use it to hold back values the server can't know.
 */
export const useIsClient = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

/**
 * The color scheme in effect: the Settings → Appearance choice, or the device setting for
 * "System". Read from app state (not just Appearance) so the override also works on web.
 */
export function useResolvedScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const pref = useSyncExternalStore(prefsStore.subscribe, getAppearance, () => 'system' as const);
  const client = useIsClient();
  // Pre-rendered web pages are light; the browser's dark setting applies once the page is live,
  // so the first render matches the HTML.
  if (Platform.OS === 'web' && !client) return 'light';
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function usePalette(): Palette {
  return useResolvedScheme() === 'dark' ? dark : light;
}

/** Tone `i` (wraps around) for the current color scheme. */
export function useTone(i: number): Tone {
  const tones = useResolvedScheme() === 'dark' ? tonesDark : tonesLight;
  return tones[((i % tones.length) + tones.length) % tones.length]!;
}

/**
 * The soft shadow under cards (light mode); dark mode uses a border instead, since shadows
 * don't show on a dark page.
 */
export function useCardShadow() {
  return useResolvedScheme() === 'dark'
    ? { borderWidth: 1, borderColor: dark.border }
    : { boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 4px 14px rgba(16, 24, 40, 0.06)' };
}

// ─── Type, spacing, shape ────────────────────────────────────────────────────

export const font = {
  /**
   * Font family for all text, charts and navigation headers. `undefined` = the system font
   * (San Francisco on iOS). Custom fonts must be loaded first (e.g. with expo-font).
   */
  family: undefined as string | undefined,
  /**
   * The system font stack on the web (the one react-native-web uses for text). Chart text is SVG,
   * which would otherwise fall back to the browser's serif default.
   */
  webSystem: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  caption: 12,
  body: 16,
  title: 22,
  headline: 28,
  /** Big page titles (the Home banner). */
  display: 32,
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
/** Corner radius: small controls, inputs and buttons, cards, big banners. */
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };

// ─── Charts and diagrams ─────────────────────────────────────────────────────

export const chart = {
  /** Text sizes inside charts. */
  tiny: 10,
  small: 11,
  label: 12,
  value: 13,
  emphasis: 14,
  /** Line widths. */
  stroke: 2,
  strokeLight: 1.5,
  strokeHeavy: 3,
  /** Dash patterns for helper lines. */
  dash: '5 4',
  dashFine: '3 3',
  /** Drag handle: visible dot diameter, ring width, and touch target size. */
  handle: 20,
  handleRing: 2,
  handleTouch: 44,
  /** Charts never grow wider than this (tablets, desktop browsers). */
  maxWidth: 520,
};
