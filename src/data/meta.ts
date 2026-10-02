/**
 * Page titles and descriptions (for <title>, meta description and link previews), built from
 * the taxonomy and module content so every pre-rendered page describes itself.
 */
import { getLayout, getModule, getModules, layoutSummary } from './modules';
import {
  countLabel,
  divisionLabel,
  getField,
  getTopic,
  subjectLabel,
  type ProblemType,
  type TaxonomyNode,
} from './selectors';
import {
  getNode,
  gradeLabel,
  skillsFor,
  coursesFor,
  type Course,
  type Division,
  type Grade,
  type Skill,
} from './taxonomy';

export interface Meta {
  title: string;
  description: string;
}

/** Keeps descriptions within what search results show (about 160 characters). */
const clip = (text: string, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;

/** The picture a module uses, in everyday words ("tape" → "bar model"). */
const PICTURE_NAMES: Record<string, string> = {
  tenFrame: 'ten frame',
  tape: 'bar model',
  waterfall: 'add-and-take-away chart',
  bars: 'bar graph',
  compareRows: 'counters in two rows',
  unitTiles: 'cubes and paper clips',
  cubeTrains: 'cube trains',
  pairs: 'pairs of dots',
  array: 'array of dots',
  partition: 'shape cut into equal parts',
  hops: 'number line with jumps',
  numberBond: 'number bond',
  patternBlocks: 'pattern blocks',
  lineUp: 'children in a line',
  equalGroups: 'equal groups',
  prism: 'solid shape',
  solid: 'solid shapes',
  dotSet: 'dots to count',
  tally: 'tally chart',
  coinRow: 'coins',
  partnerList: 'number partners',
  thermometers: 'thermometers',
  rockLayers: 'rock layers',
  pushes: 'pushes on a box',
  areaModel: 'area model',
  angles: 'angles',
  doubleNumberLine: 'double number line',
  coordinatePlane: 'coordinate plane',
  boxPlot: 'box plot',
  pieChart: 'pie chart',
  fractionArea: 'fraction area model',
  unitCubes: 'box of unit cubes',
  placeValueChart: 'place-value chart',
  factorTree: 'factor tree',
  factorPairs: 'factor-pair rectangles',
  shareWholes: 'shared wholes',
  protractor: 'protractor',
  wave: 'wave',
  punnettSquare: 'Punnett square',
  integerLine: 'number line with negatives',
  hanger: 'hanger diagram',
  scaleCopy: 'scaled copy on a grid',
  percentBar: 'percent bar',
  ratioTable: 'ratio table',
  zeroPairs: 'two-color counters with zero pairs',
  signTable: 'sign table',
  fractionFit: 'fraction groups',
  venn: 'Venn diagram',
  baseHeight: 'base and height',
  net: 'net',
  crossSection: 'solid cut by a plane',
  dotPlot: 'dot plot',
  sample: 'random sample of a population',
  spinner: 'spinner',
  diceGrid: 'grid of two dice',
  treeDiagram: 'tree diagram',
  marbles: 'bag of marbles',
  fieldOfView: 'microscope field of view',
  gradCylinder: 'graduated cylinder',
  grassSlope: 'soil trays on a slope',
  flashlights: 'two flashlights',
  leafCount: 'plants with their leaves counted',
  curvedSolid: 'glass cylinder, cone or sphere',
  scatter: 'scatter plot with a line of fit',
  rootSquare: 'square and its root on a number line',
  factorRows: 'rows of repeated factors',
  powerScale: 'powers-of-ten ruler',
  equationBalance: 'balance with x-blocks on both sides',
  linearFunction: 'graph of a line with its slope triangle',
  lineSystem: 'two lines and where they cross',
  functionGraph: 'graph of a function with its features marked',
  functionMachine: 'input-output machine',
  mapping: 'mapping diagram and graph',
  transformation: 'figure and its image on a grid',
  energyPyramid: 'energy pyramid',
  generations: 'population over generations',
  molecules: 'ball-and-stick molecules',
  reaction: 'particles before and after a reaction',
  heatingCurve: 'heating curve',
  periodicTable: 'periodic table',
  motionGraph: 'distance-time or speed-time graph',
  skaters: 'two skaters pushing apart',
  energyTrack: 'roller coaster or pendulum with energy bars',
  spectrum: 'electromagnetic spectrum band',
  circuit: 'circuit with bulbs, a switch and a meter',
  electromagnet: 'electromagnet with its field lines',
  orbit: 'orbit diagram with the pull of gravity',
  triangleSolver: 'triangle drawn to scale from three parts',
  markedFigure: 'geometry figure with its marks',
  circleTheorems: 'circle with its angles, chords and tangents',
  normalCurve: 'normal curve with shaded areas',
  histogram: 'histogram or probability bars',
  pascalTriangle: 'Pascal’s triangle and counting slots',
  termsChart: 'chart of a sequence’s terms and sums',
  unitCircle: 'unit circle with the angle and its point',
  algebraTiles: 'algebra tiles',
  gel: 'gel electrophoresis or PCR copies',
  alleleFrequencies: 'allele beads and genotype bars',
  immuneResponse: 'antibody levels after two exposures',
  earthLayers: 'Earth’s layers, seismic waves or an epicenter',
  oceanProfile: 'the seafloor, or the tides',
  atmosphereLayers: 'the atmosphere’s layers, or a pressure map',
  hrDiagram: 'an H–R diagram with a star plotted',
  expandingUniverse: 'galaxies as space stretches, or a Hubble plot',
  streamChannel: 'a stream channel: width, depth and the water passing each second',
  reserve: 'a reserve drawn down year by year',
  geologicClock: 'Earth’s history as one 24-hour day',
  coralSection: 'a fossil coral’s daily lines and yearly bands',
  transit: 'a planet crossing its star, and the dip in its light',
  habitableZone: 'a star’s habitable zone and a planet’s orbit',
  parallax: 'a near star’s parallax against far stars',
  fluidSystem: 'a fluid system: a tank, gauge, gate, meter, jet, pipe or plate',
  controlVolume: 'a process unit or device with its streams balanced',
  velocityProfile: 'velocity or concentration profiles across a tube, gap or film',
  bode: 'a Bode plot: gain in dB and phase over log frequency, corners, margins',
  roadCurve: 'a road: stopping distance, a horizontal curve, or a crest curve and its sight line',
  connection:
    'a steel connection: bolt holes, the net section, a bolt group, fillet welds, block shear',
  hydrograph:
    'rain and runoff: a storm split into losses and runoff, a peak flow, detention storage',
  blockDiagram: 'a control loop as blocks: setpoint, comparator, controller, process and sensor',
  potentialWell: 'a potential well with its energy levels and wavefunctions',
  phaseSpace: 'phase space: an energy curve, the state and its flow; a bead on a hoop',
  unitCell: 'a cubic unit cell, its lattice planes and Bragg reflection',
  instrumentTrace: 'an NMR spectrum, a chromatogram or a rotational spectrum from its peaks',
  aquifer:
    'a cross-section of an aquifer: wells, the water table, a piezometer or a cone of depression',
  refraction: 'a seismic or radar survey: rays through layers and the travel-time graph',
  projection: 'a world map projection: its graticule, Tissot circles and a parallel’s height',
  binaryPhase: 'a binary phase diagram with a tie line and the lever rule',
  machining: 'a turning or milling cut, or the surface a tool nose leaves',
  linkage: 'a ladder, a rolling wheel or a linkage with its instantaneous centre',
  globe:
    'a globe: the Sun’s rays, a great-circle route, a turning plate, a dipole field or a ring of air',
  stressStrain:
    'a stress–strain curve, a test piece, a tube in bending or two members sharing a load',
  stressElement: 'a stress element and Mohr’s circle, failure loci or a soil’s strength line',
  wing: 'an airfoil section against the wind, or a wing’s planform',
  duct: 'a nozzle or stream tube drawn to scale by A ÷ A∗, or a turbojet',
  supersonicFlow: 'shocks, expansion fans and Mach cones in supersonic flow',
  fieldPlot: 'a slope or vector field, a phase portrait, or two species’ isoclines',
  surfacePlot: 'a surface z = f(x, y) with traces, a tangent plane, prisms or level curves',
  solidOfRevolution: 'a region turned about an axis, with one disk, washer or shell',
  propertyDiagram: 'a T–v, P–v or T–s plane with the vapor dome, states and a cycle',
  elementChain: 'finite elements: springs or bars between nodes, loads, displacements; a mesh',
  fatigueDiagram: 'fatigue: a Goodman diagram, an S–N line on log axes, a Miner damage bar',
  shaft: 'a shaft twisting under torque: τ across its face, the angle φ, bending',
  heatExchanger: 'a heat exchanger: hot and cold temperatures along it, ΔT₁, ΔT₂ and the LMTD',
  thermalWall: 'heat through a layered wall, a pipe, a fin, a tube or a wire, or radiated away',
  timingDiagram: 'digital waveforms on one time axis with their intervals bracketed',
  graph: 'a graph with its degrees or costs and a path lit; a binary or code tree',
  scheduleChart: 'a Gantt chart of tasks or jobs with releases, deadlines and waits',
  bitFields: 'a word cut into named bit fields, or a packet’s nested headers',
  dilutionSeries: 'a row of dilution tubes, a plate of colonies or the positive tubes of a titer',
  lamina: 'a composite lamina: fibers in matrix end-on, springs along or across, the moduli',
  rocket: 'a rocket with its propellant and dry mass, v_e, Δv against the mass ratio; thrust',
  deviceCurves: 'a diode’s I–V curve or a MOSFET’s output curves, the load line and Q point',
  stemPlot: 'stems of a discrete signal: a periodic cosine, a step response, convolution, aliasing',
  matrixGrid: 'matrices in brackets',
  membrane: 'cell membrane with particles on each side',
  dnaStrand: 'DNA ladder, mRNA and amino acids',
  macromolecules: 'monomers joining into a polymer, water given off',
  cellDivision: 'chromosomes of a body cell, a gamete and a zygote',
  neuron: 'a neuron with its impulse timed along the axon',
  skeletal: 'a line-angle structure: wedges, CIP ranks, rings and π bonds, the chair',
  truss: 'a truss: member forces with T or C, a section cut, a bar element',
  soilProfile: 'soil to scale: σ, u and σ′ with depth, settlement, a footing, a pavement',
  survey: 'a traverse with latitude and departure, leveling, h, N and H',
  projectile: 'projectile path with its velocity components',
  induction: 'induction: coil and magnet, force on a wire, transformer',
  charges: 'point charges with field lines and forces',
  rayDiagram: 'ray diagram: lenses, mirrors, refraction, slits',
  heatEngine: 'heat engine between hot and cold reservoirs',
  simpleMachine: 'lever, pulleys or ramp with effort and load',
  collision: 'carts before and after a collision, with momentum arrows',
  circularMotion: 'circular motion or gravity between two masses',
  freeBody: 'free-body diagram with scaled force arrows',
  impulse: 'momentum change and the force–time rectangle',
  powerLift: 'a crate lifted in a time: work, a stopwatch and J/s',
  photoelectric: 'light on a metal plate freeing electrons',
  lightClock: 'a light clock at rest and moving: time dilation',
  torque: 'a wrench or door turned by a force at an angle: τ = rF sin θ',
  rotor: 'a hoop, disk or ball turning: I = cmr², ω and the turns',
  oscillator: 'a mass on a spring beside its x–t trace, or hung from one',
  pendulum: 'a pendulum of length L swinging: T = 2π√(L/g)',
  capacitor: 'a capacitor on a battery: ±Q, the field and ½CV²',
  section: 'a cross-section to scale: centroid, axes and its stress block',
  beam: 'a beam on supports: loads, reactions, shear and moment, the bent shape',
  conicGraph: 'circle, parabola, ellipse or hyperbola',
  polarGrid: 'polar grid with a point and a curve',
  complexPlane: 'complex number in the plane',
  vectorDiagram: 'vectors as arrows on a grid',
  unitChain: 'conversion factors, a ruler reading or a target',
  atomModel: 'Bohr model of an atom',
  orbitalDiagram: 'orbital boxes or energy levels',
  lewisStructure: 'Lewis structure or bonding diagram',
  vsepr: 'molecule shape with its bond angle',
  moleMap: 'mole map: grams, moles, particles, liters',
  gasPiston: 'gas in a cylinder under a piston',
  energyProfile: 'reaction energy diagram or calorimeter',
  equilibriumChart: 'concentrations reaching equilibrium',
  phScale: 'pH scale or titration curve',
  decayChart: 'atoms decaying and the half-life curve',
  chemDiagram: 'effusion, isotope abundance, oxidation numbers or a mass defect',
  phaseEnvelope: 'a binary’s Pxy, Txy or x–y diagram with its tie line or stages',
};
const pictureName = (kind: string) =>
  PICTURE_NAMES[kind] ?? kind.replace(/([A-Z])/g, ' $1').toLowerCase();

/** What the lesson page offers, from its module, e.g. "Interactive ten frame, …". */
function lessonSummary(id: string, early: boolean): string {
  const layout = getLayout(id);
  if (layout) return `${layoutSummary(layout)} ${layout.assumptions[0] ?? ''}`.trim();
  const modules = id.includes('~')
    ? [getModule(id)].filter((m) => !!m)
    : getModules(id).slice(0, 1);
  const main = modules[0];
  if (!main) return 'Lesson coming soon, with refresh links to earlier skills.';
  // H105: an equation-only page ('none') names no picture.
  const kinds = modules.map((m) => m.representation.kind).filter((k) => k !== 'none');
  const pictures = [...new Set(kinds.map(pictureName))];
  return (
    `Interactive ${[...pictures, early ? 'number sentences' : 'formulas'].join(', ')}, ` +
    `assumptions and step-by-step examples. ${main.assumptions[0] ?? ''}`
  ).trim();
}

export function skillMeta(skill: Skill): Meta {
  const level = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;
  const early = ['K', '1', '2'].includes(skill.grade);
  return {
    title: `${skill.title} – ${level}`,
    description: clip(`${level}: ${skill.title}. ${lessonSummary(skill.id, early)}`),
  };
}

export function problemTypeMeta(type: ProblemType): Meta {
  const { skill, topic } = type;
  if (!skill) {
    // A college topic's problem type: "Rates: Population and migration – Human Geography".
    const course = topic?.course.title ?? '';
    return {
      title: `${type.title}: ${topic?.title} – ${course}`,
      description: clip(
        `${type.title} (${topic?.title}), a topic in ${course}. ${lessonSummary(type.id, false)}`,
      ),
    };
  }
  const level = `${gradeLabel(skill.grade)} ${subjectLabel(skill.subject)}`;
  const early = ['K', '1', '2'].includes(skill.grade);
  return {
    title: `${type.title}: ${skill.title} – ${level}`,
    description: clip(`${level}: ${type.title} (${skill.title}). ${lessonSummary(type.id, early)}`),
  };
}

export function courseMeta(course: Course): Meta {
  return {
    title: `${course.title} – ${divisionLabel(course.division)} course`,
    description: clip(
      `${course.title}: ${countLabel(course.topics.length, 'topic')} — ${course.topics.join(', ')}.`,
    ),
  };
}

export function topicMeta(courseId: string, index: number): Meta | undefined {
  const topic = getTopic(courseId, index);
  if (!topic) return undefined;
  return {
    title: `${topic.title} – ${topic.course.title}`,
    description: clip(
      `${topic.title}, a topic in ${topic.course.title}. ${lessonSummary(`${courseId}#${index}`, false)}`,
    ),
  };
}

export function gradeMeta(grade: Grade): Meta {
  const math = skillsFor(grade, 'math');
  const science = skillsFor(grade, 'science');
  return {
    title: `${gradeLabel(grade)} Math and Science`,
    description: clip(
      `${gradeLabel(grade)}: ${countLabel(math.length, 'math skill')} and ` +
        `${countLabel(science.length, 'science skill')}, including ` +
        `${[...math.slice(0, 2), ...science.slice(0, 1)].map((s) => s.title).join('; ')}.`,
    ),
  };
}

export function divisionMeta(division: Division): Meta {
  return {
    title: `${divisionLabel(division)} – Higher Education`,
    description: clip(
      `University ${divisionLabel(division).toLowerCase()} courses, by field, with topics and ` +
        'worked examples.',
    ),
  };
}

export function fieldMeta(division: Division, fieldId: string): Meta | undefined {
  const field = getField(division, fieldId);
  if (!field) return undefined;
  const courses = coursesFor(division, fieldId);
  return {
    title: `${field.title} courses – ${divisionLabel(division)}`,
    description: clip(
      `${countLabel(courses.length, 'course')} in ${field.title}: ` +
        `${courses.map((c) => c.title).join(', ')}.`,
    ),
  };
}

/** Metadata for any skill or course id (used by links and the sitemap). */
export function nodeMeta(id: string): Meta | undefined {
  const node: TaxonomyNode | undefined = getNode(id);
  if (!node) return undefined;
  return 'grade' in node ? skillMeta(node) : courseMeta(node);
}
