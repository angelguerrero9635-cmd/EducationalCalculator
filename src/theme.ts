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
  background: '#F7F7FB',
  /** Secondary backgrounds: inputs, segmented-control tracks, pressed rows. */
  surface: '#EEEFF5',
  /** Cards and boxes that sit on the page. */
  card: '#FFFFFF',
  /** The selected part of a segmented control. */
  thumb: '#FFFFFF',
  /** Placeholder boxes and the "not yet built" areas. */
  placeholder: '#E3E6EE',
  border: '#E3E5EE',
  text: '#12131A',
  textMuted: '#5B6172',
  /** Primary buttons, selected chips and segments, links, the active tab. */
  accent: '#4F46E5',
  /** A tint of the accent for soft highlights (selected rows, badges). */
  accentSoft: '#EEF0FF',
  onAccent: '#FFFFFF',
  /** Menus, popovers and the plans card (above cards). */
  cardRaised: '#FFFFFF',
  /** Inputs and outlines that can take focus. */
  borderStrong: '#C9CDD9',
  /** The accent on hover (web) and press. */
  accentHover: '#4338CA',
  /** The "dollar" gold: the $ in the mark, plan badges, the K–12 plan ribbon. Never text on white. */
  gold: '#F5B82E',
  onGold: '#1F1600',
  /** The seal's carved $U: the $'s extruded side and bevel, the U's face, side and bevel. */
  goldDeep: '#B7791F',
  goldLight: '#FFE9A8',
  markFace: '#F4F5FF',
  markDeep: '#AEB2EE',
  markLight: '#FFFFFF',
  /** Status: purchase confirmed, pending, errors. */
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  /** The 2 px focus ring (keyboard focus on the web). */
  focus: '#4F46E5',
  /** Disabled buttons (with textMuted text, not a faded accent). */
  disabledBg: '#E3E5EE',
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
  /** College fields and graph marks (HC21, HC37, HC38): glyphs, Euler, tangent, ε–δ band. */
  fieldArrow: '#8C93A8',
  fieldEuler: '#B45309',
  tangentLine: '#0E7490',
  bandFill: '#0EA5E9',
  /** An upright boundary x = k on a line system (H92), beside its two lines. */
  lineUpright: '#BE185D',
  /** HC48–HC51 (group 3D): a code trace's lit line and its edge; four tasks' slices; a miss. */
  codeLit: '#FEF3C7',
  codeLitEdge: '#D97706',
  schedTask1: '#C7D2FE',
  schedTask2: '#FDE68A',
  schedTask3: '#A7F3D0',
  schedTask4: '#FBCFE8',
  schedMiss: '#B42318',
  /** The sunlit half of a globe or moon (lighter than the night half in both themes). */
  chartDay: '#E4E7F0',
  /** The night half of a globe or moon. */
  chartNight: '#8A8E99',
  /** The college globe (HC36): its sea, and the sunlit and night halves in mode `sun`. */
  globeSea: '#D3E6F4',
  globeDay: '#FBEFC4',
  globeNight: '#7E8494',

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
  /** HC27 truss (college): tension and compression members, the free body of a section. */
  trussTension: '#B91C1C',
  trussCompression: '#0F766E',
  trussFreeBody: 'rgba(79, 70, 229, 0.12)',
  /**
   * HC26 soilProfile (college): sand grains, clay and silt, gravel, groundwater; the σ, u and σ′
   * lines; the failure wedges; asphalt, crushed-stone base and a tire.
   */
  soilGrain: '#9C7A45',
  soilClayLine: '#8A5A40',
  soilSilt: '#C9B48F',
  soilGravel: '#B9B4A8',
  soilGravelStone: '#7E786C',
  soilWater: 'rgba(47, 111, 208, 0.18)',
  soilSigma: '#7C2D12',
  soilPore: '#1D4ED8',
  soilEffective: '#7C3AED',
  soilWedge: 'rgba(190, 24, 93, 0.14)',
  soilWedgeLine: '#BE185D',
  soilAsphalt: '#3F3F46',
  soilAsphaltStone: '#71717A',
  soilBase: '#BDB7AA',
  soilTire: '#27272A',
  soilTireTread: '#52525B',
  /**
   * HC32 survey (college): a rod's red blocks, the level's body, latitude and departure legs,
   * the misclosure gap, a traverse's field and the geoid.
   */
  surveyRodRed: '#DC2626',
  surveyInstrument: '#C2850C',
  surveyLat: '#0E7490',
  surveyDep: '#B45309',
  surveyGap: '#BE185D',
  surveyField: 'rgba(140, 194, 107, 0.18)',
  surveyGeoid: '#2563EB',
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
  /** College surfaces and solids (HC46, HC47, HC65): the body, its mesh, a plane, a slice. */
  surfaceFill: '#3B7DD8',
  surfaceMesh: '#1E3A5F',
  planeFill: '#7C3AED',
  sliceFill: '#D97706',
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
  /** HC17 propertyDiagram: the liquid + vapor region under water's vapor dome. */
  propDome: '#E2EBF7',
  /** HC23 thermalWall: a brick layer and its mortar, a foam layer and its cells. */
  /** HC43 gasPiston pv and real: work by and on the gas, the molecules' own volume, their pull. */
  gasPiston3gWorkBy: '#4F46E5',
  gasPiston3gWorkOn: '#C2410C',
  gasPiston3gBand: '#C9D3E6',
  gasPiston3gHatch: '#5B6B8C',
  gasPiston3gPull: '#B4462F',
  /** HC44 bomb calorimeter: the bomb's chamber and the sample pellet in its cup. */
  bomb3gChamber: '#3A3F4A',
  bomb3gSample: '#E8D9B0',
  /** HC79 membrane potential: three ions' dots, and the + and − charges along the faces. */
  membrane3gIonA: '#E0A81E',
  membrane3gIonB: '#8E5BD0',
  membrane3gIonC: '#2A9D7C',
  membrane3gPlus: '#C2410C',
  membrane3gMinus: '#2563EB',
  /** HC80 dilutionSeries: broth, the culture's tint, clumps in a positive tube, agar, colonies. */
  dilution3gBroth: '#F4EBC8',
  dilution3gCulture: '#C8A23C',
  dilution3gClump: '#7A5A1E',
  dilution3gAgar: '#E9D79A',
  dilution3gAgarEdge: '#C7B26A',
  dilution3gColony: '#FBF6E6',
  dilution3gColonyEdge: '#A88E4A',
  thermalBrick: '#B9603F',
  thermalMortar: '#E9DFCF',
  thermalFoam: '#F2E2A4',
  thermalFoamCell: '#D6BF66',
  /** HC86 lamina: carbon, glass and aramid fiber ends, the epoxy matrix around them. */
  laminaCarbon: '#34373F',
  laminaGlass: '#B9D7DF',
  laminaAramid: '#E0B437',
  laminaMatrix: '#EBC77F',
  /** HC87 rocket: the painted body and its shade, the nose and fins, propellant, an empty tank. */
  rocketBody: '#ECEEF2',
  rocketBodyDark: '#A3A9B4',
  rocketTrim: '#C4432F',
  rocketFuel: '#6FA8E0',
  rocketTank: '#2B2F37',
  /** The brick wall a ladder leans on (triangleSolver's ladder scene) and its mortar lines. */
  ladderWall: '#B5654A',
  ladderWallDark: '#8A4632',
  /** HC20 college free bodies: a hemp rope, and a road's asphalt in section. */
  fbRope: '#B08D57',
  fbRoad: '#5A5E66',
  fbRoadDark: '#3E4148',
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
  /**
   * College HC5 and HC13 (group F): a burner's flame and its core, activated sludge, a membrane
   * sheet, an organic solvent layer; a blood vessel's wall and the blood in it.
   */
  cvFlame: '#F08A24',
  cvFlameCore: '#FFD45C',
  cvSludge: '#9C7A4E',
  cvMembrane: '#3D8F7A',
  cvSolvent: '#F3E3A0',
  profileWall: '#E9A8A0',
  profileBlood: '#C9393F',
  /**
   * College round 4, group J (HC154–HC159): tissue sections (eosin pink, hematoxylin nuclei,
   * a basement membrane, cartilage matrix, bone's lamellae, plasma, muscle and its striations,
   * glia); the heart pump's blood and its pressure band; footprints and the stance leg; a
   * dashpot's oil and a spring; a diffusing solute.
   */
  he4jEosin: '#EBA7BC',
  he4jNucleus: '#5E3D8F',
  he4jMembrane: '#9C4F6E',
  he4jMatrix: '#C8D3E6',
  he4jLamella: '#C2AE7C',
  he4jPlasma: '#F7E3C6',
  he4jMuscle: '#E07A8A',
  he4jStriation: '#93324C',
  he4jGlia: '#5874B5',
  he4jBand: '#6D28D9',
  he4jWall: '#B9806F',
  /**
   * College HC24, HC30, HC31 (round 2, group H): the relative wind, lift and drag, tip vortices;
   * the gas in a duct, a hot chamber or exhaust; a shock and an expansion fan's Mach lines.
   */
  aeroWind: '#4C7FAF',
  aeroLift: '#2563EB',
  aeroDrag: '#C2410C',
  aeroVortex: '#7C3AED',
  aeroGas: '#DCEBF7',
  aeroHot: '#F08A24',
  aeroShock: '#DC2626',
  aeroFan: '#0E7490',
  /** Chemistry (HS group I): a unit struck through when it cancels in a chain. */
  unitCancel: '#D9480F',
  /** Bohr models: protons, neutrons and electrons. */
  atomProton: '#E0563F',
  atomNeutron: '#9AA3AF',
  atomElectron: '#3B82F6',
  /**
   * College round 3, group E: HC55 `instrumentTrace` (a spectrum's line, its integral trace, two
   * peaks' fills, a lit line), HC70 MO levels (bonding, antibonding, nonbonding), HC72 a
   * complex's lit ligand pair, HC74 the combustion train (furnace, flame, the two absorbers).
   */
  traceSignal: '#1F4E8C',
  traceIntegral: '#C2410C',
  traceFillA: '#BFD7F2',
  traceFillB: '#F6D2B0',
  traceLit: '#DC2626',
  moBonding: '#2563EB',
  moAntibonding: '#DC2626',
  moNonbonding: '#6B7280',
  complexLit: '#F59E0B',
  trainFurnace: '#B45309',
  trainFlame: '#F59E0B',
  trainWaterTrap: '#7FA7D9',
  trainCarbonTrap: '#E4DDC8',
  /**
   * College HC15 `potentialWell` and HC16 `unitCell` (round 2, group B): a wavefunction, its
   * |ψ|² fill, a perturbing bump, a photon; a cell's atoms (metal, cation, anion), a lattice
   * plane, X-rays and the lit touching line.
   */
  wellPsi: '#2563EB',
  wellPsiFill: '#93C5FD',
  wellBump: '#E08A1C',
  wellPhoton: '#C026D3',
  cellMetal: '#C98A4B',
  cellCation: '#8E6CCF',
  cellAnion: '#4FA35A',
  cellPlane: '#F2B134',
  cellRay: '#D9480F',
  cellTouch: '#DC2626',
  /**
   * College round 4, group D (HC109–HC115): ψ's + and − lobes, nodes, P(r) and its area; Δ and
   * P; formal charges; a cuvette's beam and solution; symmetry axes, planes and the centre;
   * a helix, a sheet and a second chain.
   */
  he4dLobePlus: '#93C5FD',
  he4dLobeMinus: '#FDBA74',
  he4dNode: '#B91C1C',
  he4dRadial: '#1D4ED8',
  he4dRadialFill: '#BFDBFE',
  he4dSplit: '#7C3AED',
  he4dPairing: '#C2410C',
  he4dChargePos: '#1D4ED8',
  he4dChargeNeg: '#B91C1C',
  he4dBeam: '#FACC15',
  he4dSolution: '#B83280',
  he4dAxis: '#DC2626',
  he4dPlane: '#60A5FA',
  he4dInversion: '#7C3AED',
  he4dHelix: '#DB2777',
  he4dSheet: '#D97706',
  he4dChainB: '#0F766E',
  /** A periodic trend's shading (darker for more) and the symbols on its darkest cells. */
  trendShade: '#0F766E',
  onTrendShade: '#FFFFFF',
  /** A bond dipole's crossed arrow. */
  dipole: '#C2410C',
  /**
   * College HC14 and HC22 (round 2, group A): three-phase phasors a, b, c, a line value and a
   * current; the R and jX legs of an impedance; root-locus branches and closed-loop poles; a Bode
   * plot's gain, phase, asymptotes, margins and closed-loop gain.
   */
  phasorA: '#C2410C',
  phasorB: '#1D4ED8',
  phasorC: '#15803D',
  phasorLine: '#7C3AED',
  phasorCurrent: '#DB2777',
  planeReal: '#0F766E',
  planeImag: '#B45309',
  planeLocus: '#2563EB',
  planeClosed: '#DC2626',
  bodeGain: '#2563EB',
  bodePhase: '#B45309',
  bodeAsymptote: '#7B8494',
  bodeMargin: '#DC2626',
  bodeClosed: '#0F766E',
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
  /** HC19, HC29: magnetic field lines; a dashed Gaussian surface; the enclosed charge's shade. */
  he2eField: '#0E8A7E',
  he2eSurface: '#B45309',
  he2eEnclosed: '#F2B8B8',
  /** HC68, HC69, HC93 (round 3, group L): a soap film, a flip mark; E and B; phase curves. */
  he3lFilm: '#CFE8F2',
  he3lFlip: '#B42318',
  he3lE: '#C2410C',
  he3lB: '#1D4ED8',
  he3lCurve: '#6D28D9',
  he3lBead: '#B45309',
  /**
   * HC99, HC101, HC103–HC105, HC118 (round 4, group C): a ringed turnaround; a force pulse and its
   * average; spacetime's light lines, primed axes and event; Compton's photons; a soil or ice slab
   * on bedrock, σ, τ and the strength s.
   */
  he4cTurn: '#BE185D',
  he4cPulse: '#2F6FD0',
  he4cAverage: '#C2410C',
  he4cLight: '#D97706',
  he4cPrime: '#0F766E',
  he4cEvent: '#BE185D',
  he4cPhoton: '#6D28D9',
  he4cScattered: '#C2410C',
  he4cSoil: '#B08A5E',
  he4cSoilDark: '#7A5A3A',
  he4cIce: '#D6ECF7',
  he4cIceDark: '#7FA9C4',
  he4cBedrock: '#9A958C',
  he4cBedrockDark: '#6E6A62',
  he4cSigma: '#1D4ED8',
  he4cTau: '#C2410C',
  he4cStrength: '#0F7A55',
  /** HC152 (round 4, group E): the offspring's curve moved by R. */
  he4eOffspring: '#0F766E',
  /** HC151: p′ after selection (its tray title, its mark and the Δp arrow). */
  he4eAfter: '#B45309',
  /** HC153: drift's expected heterozygosity (dashed) and its right-hand axis. */
  he4eDrift: '#BE185D',
  satellitePanel: '#2B4C8C',
  /**
   * College HC81–HC84 (round 3, group I): a muscle and its tendon; a binary diagram's α, β and
   * two-phase fields, its tie line and alloy line; carbide, a hot chip, cutting speed and feed;
   * an instantaneous centre, velocities, ω and a mechanism's links.
   */
  he3iMuscle: '#C8443A',
  he3iTendon: '#EADBC4',
  he3iAlpha: '#E3EDD5',
  he3iBeta: '#F6E3CF',
  he3iTwo: '#F2F3F6',
  he3iTie: '#B42318',
  he3iAlloy: '#1D4ED8',
  he3iCarbide: '#4B4F58',
  he3iCarbideLight: '#9CA3AF',
  he3iChip: '#3E6FB0',
  he3iChipHot: '#C98A2A',
  he3iSpeed: '#0F766E',
  he3iFeed: '#C2410C',
  he3iIc: '#B42318',
  he3iVelocity: '#1D4ED8',
  he3iOmega: '#7C3AED',
  he3iLink: '#7A8594',
  /** HC2 skeletal structures: a lit functional group's band; O, N, S and halogen letters. */
  skeletalLit: '#FBBF24',
  skeletalO: '#C62828',
  skeletalN: '#1D4ED8',
  skeletalS: '#A16207',
  skeletalHalogen: '#15803D',
  /**
   * HC1 beam (college): loads, reactions, the shear and moment diagrams, the bent shape;
   * concrete and its bars.
   */
  beamLoad: '#C2410C',
  beamReaction: '#1D4ED8',
  beamShear: '#0E7490',
  beamMoment: '#7C3AED',
  beamDeflect: '#BE185D',
  beamConcrete: '#CFCBC2',
  beamConcreteDark: '#8C877D',
  beamRebar: '#6B4F3A',
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
  /** HC28 stressStrain and HC33 stressElement (group J): the σ–ε curve, the true curve, the shaded
   * energy, a bone's marrow and a tendon; Mohr's circle, a failure envelope, the load point, a
   * failure plane, a soil sample. */
  stressCurve: '#1F5FBF',
  stressTrue: '#B45309',
  stressArea: 'rgba(31, 95, 191, 0.16)',
  stressMarrow: '#E8C27A',
  stressTissue: '#E3A493',
  mohrCircle: '#6D28D9',
  mohrEnvelope: '#C2410C',
  mohrLoad: '#0F766E',
  mohrPlane: '#BE185D',
  mohrSoil: '#C9AE84',
  /** HC78 projection: land shapes, their coast line, and Tissot's ellipses. */
  mapLand: '#D9CFA8',
  mapCoast: '#8C7F5A',
  tissot: '#C2410C',
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
  /**
   * College round 3, group J: a hydraulic jump's foam (HC88); the road's reaction and braking
   * strips, lane paint and a car (HC60); a fillet weld's bead (HC61); rain, initial abstraction,
   * infiltration, runoff and detention storage (HC89); a loop's disturbance and feedforward (HC90).
   */
  jumpFoam: '#F7FBFD',
  roadReaction: '#E8A33D',
  roadBraking: '#D8413A',
  roadLine: '#F4F1E6',
  carBody: '#2F6FB5',
  carGlass: '#BFD9EE',
  weldBead: '#8C7A6B',
  hydroRain: '#3A7BD5',
  hydroAbstract: '#7FAF6A',
  hydroInfil: '#B98B4E',
  hydroRunoff: '#2A8FB8',
  hydroStorage: '#F2C14E',
  blockDist: '#B5552E',
  blockFf: '#2A9D7C',
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
  background: '#0B0C10',
  surface: '#1A1C23',
  card: '#14161C',
  thumb: '#323846',
  placeholder: '#242833',
  border: '#262A34',
  text: '#ECEEF4',
  textMuted: '#A0A6B5',
  accent: '#8B83FF',
  accentSoft: '#22214A',
  onAccent: '#0B0C10',
  cardRaised: '#1C1F27',
  borderStrong: '#3A3F4C',
  accentHover: '#A39DFF',
  gold: '#E9B949',
  onGold: '#1F1600',
  goldDeep: '#8A6414',
  goldLight: '#FBE3A0',
  markFace: '#15161E',
  markDeep: '#04050A',
  markLight: '#46425F',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  focus: '#A39DFF',
  disabledBg: '#262A34',
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
  fieldArrow: '#6B7287',
  fieldEuler: '#F59E0B',
  tangentLine: '#22D3EE',
  bandFill: '#38BDF8',
  lineUpright: '#F472B6',
  codeLit: '#4A3A10',
  codeLitEdge: '#FBBF24',
  schedTask1: '#3730A3',
  schedTask2: '#78591A',
  schedTask3: '#11664F',
  schedTask4: '#7A2456',
  schedMiss: '#FF8A80',
  chartDay: '#4A5068',
  chartNight: '#0B0C10',
  globeSea: '#1F3A55',
  globeDay: '#6A5E34',
  globeNight: '#1A1D26',

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
  trussTension: '#F87171',
  trussCompression: '#2DD4BF',
  trussFreeBody: 'rgba(139, 131, 255, 0.18)',
  soilGrain: '#C8A86B',
  soilClayLine: '#C79A7C',
  soilSilt: '#7A6A50',
  soilGravel: '#6E6A62',
  soilGravelStone: '#A39E92',
  soilWater: 'rgba(91, 155, 248, 0.22)',
  soilSigma: '#FDBA74',
  soilPore: '#7BA7FF',
  soilEffective: '#C4B5FD',
  soilWedge: 'rgba(244, 114, 182, 0.2)',
  soilWedgeLine: '#F472B6',
  soilAsphalt: '#52525B',
  soilAsphaltStone: '#8B8B94',
  soilBase: '#6B665D',
  soilTire: '#3F3F46',
  soilTireTread: '#71717A',
  surveyRodRed: '#F87171',
  surveyInstrument: '#E0A93A',
  surveyLat: '#22D3EE',
  surveyDep: '#FBBF24',
  surveyGap: '#F472B6',
  surveyField: 'rgba(94, 140, 69, 0.25)',
  surveyGeoid: '#7BA7FF',
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
  surfaceFill: '#60A5FA',
  surfaceMesh: '#BFD7F5',
  planeFill: '#A78BFA',
  sliceFill: '#FBBF24',
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
  propDome: '#1C2A3D',
  gasPiston3gWorkBy: '#8B83FF',
  gasPiston3gWorkOn: '#F08A4B',
  gasPiston3gBand: '#3A4458',
  gasPiston3gHatch: '#9AA8C4',
  gasPiston3gPull: '#F08A6B',
  bomb3gChamber: '#14171D',
  bomb3gSample: '#B8A87E',
  membrane3gIonA: '#D9A43A',
  membrane3gIonB: '#A57BE0',
  membrane3gIonC: '#3DB894',
  membrane3gPlus: '#F08A4B',
  membrane3gMinus: '#6EA0F5',
  dilution3gBroth: '#4A4430',
  dilution3gCulture: '#B89238',
  dilution3gClump: '#E2C27A',
  dilution3gAgar: '#6E6135',
  dilution3gAgarEdge: '#8E7E48',
  dilution3gColony: '#F2E8C8',
  dilution3gColonyEdge: '#C9B26E',
  thermalBrick: '#9A4E33',
  thermalMortar: '#5E554A',
  thermalFoam: '#8C7C3E',
  thermalFoamCell: '#B09C52',
  laminaCarbon: '#5A5E68',
  laminaGlass: '#7FA6B0',
  laminaAramid: '#B8912A',
  laminaMatrix: '#8E6E36',
  rocketBody: '#9CA2AD',
  rocketBodyDark: '#5B616C',
  rocketTrim: '#A63A29',
  rocketFuel: '#3F73A6',
  rocketTank: '#17191E',
  ladderWall: '#8C4B37',
  ladderWallDark: '#5E3023',
  fbRope: '#9C7B4A',
  fbRoad: '#4A4E56',
  fbRoadDark: '#2E3036',
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
  cvFlame: '#F59A3C',
  cvFlameCore: '#FFE08A',
  cvSludge: '#7E6240',
  cvMembrane: '#4FB39A',
  cvSolvent: '#8C7C3A',
  profileWall: '#9E5A55',
  profileBlood: '#B83238',
  he4jEosin: '#B9768C',
  he4jNucleus: '#A88AD8',
  he4jMembrane: '#D58BA8',
  he4jMatrix: '#5F6E8C',
  he4jLamella: '#9C8D66',
  he4jPlasma: '#5C4A33',
  he4jMuscle: '#B85A6A',
  he4jStriation: '#E7A0B4',
  he4jGlia: '#9CB2E3',
  he4jBand: '#A78BFA',
  he4jWall: '#8F5E52',
  aeroWind: '#7FB0DA',
  aeroLift: '#6EA3FF',
  aeroDrag: '#FB8A4C',
  aeroVortex: '#B794F6',
  aeroGas: '#22384D',
  aeroHot: '#F59A3C',
  aeroShock: '#F87171',
  aeroFan: '#38BDF8',
  unitCancel: '#F08A4B',
  atomProton: '#D9573F',
  atomNeutron: '#7D8693',
  atomElectron: '#5B9BF8',
  traceSignal: '#7DB3F5',
  traceIntegral: '#FB923C',
  traceFillA: '#1E3A5F',
  traceFillB: '#5C3416',
  traceLit: '#F87171',
  moBonding: '#60A5FA',
  moAntibonding: '#F87171',
  moNonbonding: '#9AA1B2',
  complexLit: '#FBBF24',
  trainFurnace: '#D97706',
  trainFlame: '#FBBF24',
  trainWaterTrap: '#3B5A85',
  trainCarbonTrap: '#5A5442',
  wellPsi: '#60A5FA',
  wellPsiFill: '#1E3A8A',
  wellBump: '#F0A040',
  wellPhoton: '#E879F9',
  cellMetal: '#B9783A',
  cellCation: '#9F82E0',
  cellAnion: '#5DBB69',
  cellPlane: '#C98F22',
  cellRay: '#FB7A3C',
  cellTouch: '#F87171',
  he4dLobePlus: '#1E3A8A',
  he4dLobeMinus: '#7C2D12',
  he4dNode: '#F87171',
  he4dRadial: '#60A5FA',
  he4dRadialFill: '#1E3A5F',
  he4dSplit: '#A78BFA',
  he4dPairing: '#FB923C',
  he4dChargePos: '#93C5FD',
  he4dChargeNeg: '#FCA5A5',
  he4dBeam: '#FDE047',
  he4dSolution: '#E879C0',
  he4dAxis: '#F87171',
  he4dPlane: '#3B82F6',
  he4dInversion: '#C4B5FD',
  he4dHelix: '#F472B6',
  he4dSheet: '#FBBF24',
  he4dChainB: '#2DD4BF',
  trendShade: '#2DD4BF',
  onTrendShade: '#0D0F14',
  dipole: '#FB923C',
  phasorA: '#FB8A4C',
  phasorB: '#6EA3FF',
  phasorC: '#4ADE80',
  phasorLine: '#B794F6',
  phasorCurrent: '#F472B6',
  planeReal: '#2DD4BF',
  planeImag: '#F2B53A',
  planeLocus: '#6EA3FF',
  planeClosed: '#F87171',
  bodeGain: '#6EA3FF',
  bodePhase: '#F2B53A',
  bodeAsymptote: '#8A93A5',
  bodeMargin: '#F87171',
  bodeClosed: '#2DD4BF',
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
  /** HC19, HC29: magnetic field lines; a dashed Gaussian surface; the enclosed charge's shade. */
  he2eField: '#3CC3B4',
  he2eSurface: '#F0A04B',
  he2eEnclosed: '#6E2E2E',
  /** HC68, HC69, HC93 (round 3, group L): a soap film, a flip mark; E and B; phase curves. */
  he3lFilm: '#24414D',
  he3lFlip: '#F87171',
  he3lE: '#FB923C',
  he3lB: '#60A5FA',
  he3lCurve: '#A78BFA',
  he3lBead: '#F59E0B',
  he4cTurn: '#F472B6',
  he4cPulse: '#60A5FA',
  he4cAverage: '#FB923C',
  he4cLight: '#FBBF24',
  he4cPrime: '#2DD4BF',
  he4cEvent: '#F472B6',
  he4cPhoton: '#A78BFA',
  he4cScattered: '#FB923C',
  he4cSoil: '#8A6A47',
  he4cSoilDark: '#5C4430',
  he4cIce: '#2C4A5C',
  he4cIceDark: '#6F9AB5',
  he4cBedrock: '#5E5A54',
  he4cBedrockDark: '#403D39',
  he4cSigma: '#60A5FA',
  he4cTau: '#FB923C',
  he4cStrength: '#34D399',
  he4eOffspring: '#2DD4BF',
  he4eAfter: '#FBBF24',
  he4eDrift: '#F472B6',
  satellitePanel: '#3D5FA3',
  he3iMuscle: '#D45A50',
  he3iTendon: '#B9AC97',
  he3iAlpha: '#25331F',
  he3iBeta: '#3A2C1F',
  he3iTwo: '#1E222B',
  he3iTie: '#F87171',
  he3iAlloy: '#7BA7FF',
  he3iCarbide: '#2E3138',
  he3iCarbideLight: '#7B828E',
  he3iChip: '#6F9BD6',
  he3iChipHot: '#E0A84A',
  he3iSpeed: '#2DD4BF',
  he3iFeed: '#F59E0B',
  he3iIc: '#F87171',
  he3iVelocity: '#7BA7FF',
  he3iOmega: '#B794F6',
  he3iLink: '#8B95A5',
  skeletalLit: '#F59E0B',
  skeletalO: '#FF8A80',
  skeletalN: '#93C5FD',
  skeletalS: '#FACC15',
  skeletalHalogen: '#86EFAC',
  beamLoad: '#FB8A4C',
  beamReaction: '#6EA3FF',
  beamShear: '#22D3EE',
  beamMoment: '#B794F6',
  beamDeflect: '#F472B6',
  beamConcrete: '#67635B',
  beamConcreteDark: '#45423C',
  beamRebar: '#B08C70',
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
  stressCurve: '#6EA8FF',
  stressTrue: '#F5A54A',
  stressArea: 'rgba(110, 168, 255, 0.22)',
  stressMarrow: '#8A6F3A',
  stressTissue: '#9E6255',
  mohrCircle: '#B794F6',
  mohrEnvelope: '#FB8A4C',
  mohrLoad: '#2DD4BF',
  mohrPlane: '#F472B6',
  mohrSoil: '#7D6A4C',
  mapLand: '#5C5638',
  mapCoast: '#A39A72',
  tissot: '#F08A4B',
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
  /**
   * College round 3, group J: a hydraulic jump's foam (HC88); the road's reaction and braking
   * strips, lane paint and a car (HC60); a fillet weld's bead (HC61); rain, initial abstraction,
   * infiltration, runoff and detention storage (HC89); a loop's disturbance and feedforward (HC90).
   */
  jumpFoam: '#DCEAF2',
  roadReaction: '#E0A24A',
  roadBraking: '#E2645D',
  roadLine: '#CFCAB8',
  carBody: '#5B8FD0',
  carGlass: '#8FB3CF',
  weldBead: '#A39282',
  hydroRain: '#6FA3E8',
  hydroAbstract: '#8FC07A',
  hydroInfil: '#C9A06A',
  hydroRunoff: '#4FB0D6',
  hydroStorage: '#D9AE45',
  blockDist: '#E07A50',
  blockFf: '#45C29C',
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
  return useElevation(1);
}

/** The CSS shadows behind the elevation levels (also used by the web page's hover rules). */
export const shadow = {
  e1: '0 1px 2px rgba(16, 24, 40, 0.05)',
  e2: '0 4px 16px rgba(16, 24, 40, 0.08)',
  e3: '0 12px 32px rgba(16, 24, 40, 0.16)',
  e3Dark: '0 12px 32px rgba(0, 0, 0, 0.5)',
};

/**
 * Elevation: 1 cards, 2 hover and raised, 3 menus and sheets. Light mode uses soft shadows
 * (with a hairline border on cards); dark mode uses borders and raised surfaces.
 */
export function useElevation(level: 1 | 2 | 3) {
  const isDark = useResolvedScheme() === 'dark';
  const p = isDark ? dark : light;
  if (level === 1)
    return isDark
      ? { borderWidth: 1, borderColor: p.border }
      : { borderWidth: 1, borderColor: p.border, boxShadow: shadow.e1 };
  if (level === 2)
    return isDark
      ? { borderWidth: 1, borderColor: p.borderStrong, backgroundColor: p.cardRaised }
      : { borderWidth: 1, borderColor: p.border, boxShadow: shadow.e2 };
  return isDark
    ? { borderWidth: 1, borderColor: p.border, boxShadow: shadow.e3Dark }
    : { boxShadow: shadow.e3 };
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

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, huge: 64 };
/** Corner radius: small controls, inputs and buttons, cards, big banners. */
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

/**
 * The named type scale for the shell (screens, headers, cards): size, line height, weight and
 * letter spacing. Lessons and charts keep `font` and `chart`. `wide` sizes apply on wide web
 * screens (≥ 1024 px) through `useType()`.
 */
export type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing: number;
};
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.4 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  title3: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0 },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '400', letterSpacing: 0 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500', letterSpacing: 0 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.2 },
} satisfies Record<string, TypeStyle>;
export type TypeStep = keyof typeof type;
/** The bigger heading sizes on wide screens. */
export const typeWide: Partial<Record<TypeStep, TypeStyle>> = {
  display: { fontSize: 44, lineHeight: 50, fontWeight: '800', letterSpacing: -0.6 },
  title1: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.2 },
};

/** Screen widths: compact (phones) < 600 ≤ medium (tablets) < 1024 ≤ wide; xl from 1440. */
export const layout = {
  medium: 600,
  wide: 1024,
  xl: 1440,
  /** Page gutters by width. */
  gutter: { compact: 16, medium: 24, wide: 32 },
  /** Content widths: tile grids, reading pages (lessons, settings, legal), narrow forms. */
  content: { grid: 1120, read: 760, narrow: 560 },
  /** The desktop sidebar and top bar. */
  sidebar: 248,
  topBar: 64,
};

/** Durations (ms) and easing for the few animations the shell has. */
export const motion = {
  press: 120,
  fade: 200,
  sheet: 280,
  easeIn: 'cubic-bezier(0.2, 0, 0, 1)',
  easeOut: 'cubic-bezier(0.3, 0, 1, 1)',
  /** Cards scale to this while pressed. */
  pressScale: 0.98,
};

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
