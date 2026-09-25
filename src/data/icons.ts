/**
 * The icon on each Browse box, chosen from its title. Rules are tried in order and the first
 * match wins; a box with no match uses the icon of what it belongs to (a problem type its
 * skill's, a topic its course's, a course its field's).
 */
import type { Course, Division, Skill } from './taxonomy';

export type TopicIconName =
  // Numbers and operations
  | 'count'
  | 'tally'
  | 'plus'
  | 'minus'
  | 'steps'
  | 'book'
  | 'addsub'
  | 'times'
  | 'divide'
  | 'equals'
  | 'compare'
  | 'tenframe'
  | 'blocks'
  | 'numberline'
  | 'hops'
  | 'evenodd'
  | 'array'
  | 'fraction'
  | 'decimal'
  | 'percent'
  | 'ratio'
  | 'coin'
  | 'sqrt'
  | 'power'
  | 'xeq'
  | 'ineq'
  | 'sequence'
  | 'pi'
  | 'sigma'
  | 'integral'
  | 'infinity'
  | 'matrix'
  | 'vector'
  | 'proof'
  // Measurement
  | 'clock'
  | 'ruler'
  | 'balance'
  | 'cup'
  | 'thermometer'
  // Data and chance
  | 'bars'
  | 'lineplot'
  | 'scatter'
  | 'bell'
  | 'dice'
  // Geometry and graphs
  | 'shapes'
  | 'cube'
  | 'angle'
  | 'lines'
  | 'area'
  | 'perimeter'
  | 'coords'
  | 'curve'
  | 'linear'
  | 'parabola'
  | 'expo'
  | 'sine'
  | 'righttri'
  | 'circle'
  | 'compass'
  | 'mirror'
  | 'tangent'
  | 'polar'
  // Life, Earth and space
  | 'sun'
  | 'sprout'
  | 'leaf'
  | 'paw'
  | 'cloud'
  | 'moon'
  | 'star'
  | 'planet'
  | 'globe'
  | 'mountain'
  | 'layers'
  | 'drop'
  | 'flame'
  | 'cycle'
  | 'dna'
  | 'fossil'
  | 'cell'
  | 'heart'
  | 'people'
  | 'map'
  | 'satellite'
  // Physical science
  | 'push'
  | 'speaker'
  | 'bulb'
  | 'eye'
  | 'wave'
  | 'magnet'
  | 'bolt'
  | 'atom'
  | 'molecule'
  | 'flask'
  | 'periodic'
  | 'balloon'
  | 'speed'
  | 'rocket'
  | 'circuit'
  // Engineering and computing
  | 'gear'
  | 'bridge'
  | 'plane'
  | 'chip'
  | 'code'
  | 'network'
  | 'spring'
  | 'building'
  | 'wrench'
  | 'factory'
  | 'antenna'
  | 'road'
  | 'pencil';

/** [pattern, icon], most specific first. Matched against the lower-case title. */
const RULES: [RegExp, TopicIconName][] = [
  // ── Exact topics a general rule would get wrong ──
  [/series solution|fourier/, 'sigma'],
  [/volume, arc length/, 'integral'],
  [/parametric and polar/, 'polar'],
  [/substitution and elimination|rate law/, 'flask'],
  [/molecular orbital/, 'molecule'],
  [/molecular genetics|linkage|hooke/, 'dna'],
  [/schr[öo]dinger|interference|diffraction/, 'wave'],
  [/maxwell|magnetostatic/, 'magnet'],
  [/electrostatic/, 'circuit'],
  [/bernoulli|fluid statics|pipe (flow|network)/, 'drop'],
  [/equations of state/, 'balloon'],
  [/torque/, 'gear'],
  [/force vector/, 'push'],
  [/surface processes/, 'mountain'],
  [/stratigraph|consolidation|bearing capacity|^composites/, 'layers'],
  [/crystal|isometric|orthographic|solid modeling/, 'cube'],
  [/circulation/, 'wave'],
  [/image processing/, 'satellite'],
  [/geoprocess/, 'map'],
  [/transduction/, 'cell'],
  [/population dynamics|conservation biology/, 'leaf'],
  [/material balance/, 'factory'],
  [/capacity analysis/, 'road'],
  [/graph theory|trees and graphs/, 'network'],
  [/sorting and searching|threads|control flow/, 'code'],
  [/datapath|combinational|sequential logic|flip-flop/, 'chip'],
  [/root locus/, 'curve'],
  [/degree-of-freedom/, 'spring'],
  // ── Engineering and computing ──
  [/propulsion|rocket/, 'rocket'],
  [/aero|flight|aircraft|compressible flow/, 'plane'],
  [/orbit|gravit|planet|solar system|kepler/, 'planet'],
  [/digital logic|computer organi|architecture|embedded|electronics|computer$|vlsi/, 'chip'],
  [/network/, 'network'],
  [/programming|algorithms|data structure|operating system|software|numerical method/, 'code'],
  [/communication|antenna|signal/, 'antenna'],
  [/vibration|oscillat|spring/, 'spring'],
  [/manufactur|machining/, 'wrench'],
  [/machine design|mechanical$|control system|robot/, 'gear'],
  [/process|separation|energy balance|transport phenomena|reactor/, 'factory'],
  [/transportation|traffic|highway/, 'road'],
  [/surveying/, 'map'],
  [/concrete|steel design|building/, 'building'],
  [/structural|bridge|civil|statics|truss|beam/, 'bridge'],
  [/finite element/, 'area'],
  [/cad\b|graphics|drafting/, 'pencil'],
  [/compass/, 'compass'],
  [/unit rates/, 'ratio'],
  // ── Chemistry ──
  [/periodic/, 'periodic'],
  [/biomolecule/, 'molecule'],
  [/stellar|big bang|cosmolog|galax/, 'star'],
  [/\batoms?\b|atomic|isotope|electron config|quantum|element/, 'atom'],
  [/gas law|pressure|ideal gas/, 'balloon'],
  [
    /molecul|bond|biomolecule|organic|polymer|states of matter|phase change|particles too small/,
    'molecule',
  ],
  [
    /chemi|acid|\bph\b|solution|molarity|titration|reaction|stoichiometr|\bmole\b|molar|equilibrium|spectroscop|analytical|mixing substances|conservation of mass|thermochem/,
    'flask',
  ],
  // ── Life science ──
  [/life cycle|water cycle|rock cycle|cycling|feedback|homeostasis/, 'cycle'],
  [
    /\bdna\b|\bgenes?\b|genetic|allele|punnett|inherit|trait|mendel|replication|resemble their parents/,
    'dna',
  ],
  [
    /evolution|natural selection|speciation|adaptation|fossil|geologic time|radiometric|historical geology/,
    'fossil',
  ],
  [/cell|mitosis|meiosis|membrane|osmosis|microbio|tissue/, 'cell'],
  [
    /heart|body system|anatomy|physiolog|biomechanic|bioinstrument|biotransport|biomaterial|structures of organisms|bioengineering/,
    'heart',
  ],
  [/photosynth|\bplants?\b|seed|pollinat|sunlight to make food/, 'sprout'],
  [/biology/, 'cell'],
  [/animal|habitat|biodiversity|survive|living things/, 'paw'],
  [/food web|ecosystem|ecolog|environment|carrying capacity|resource|human impact/, 'leaf'],
  // ── Earth and space ──
  [/remote sensing|satellite/, 'satellite'],
  [/earth system|globe/, 'globe'],
  [/\bweather\b|climat|meteorolog|air mass|atmospher/, 'cloud'],
  [/ocean/, 'wave'],
  [/water|hydrolog|hydraul|fluid|hydrosphere/, 'drop'],
  [/soil|layer/, 'layers'],
  [
    /rock|landform|erosion|weathering|tecton|seismic|earth'?s interior|geolog|mineral|earth changes|geophys|earth science|hazard/,
    'mountain',
  ],
  [/map|cartograph|\bgis\b|geograph/, 'map'],
  [/moon/, 'moon'],
  [/sunlight|\bsun\b|daylight|day and night|season/, 'sun'],
  [/star\b/, 'star'],
  // ── Physics ──
  [/electromagnetic spectrum/, 'wave'],
  [/energy|power system/, 'bolt'],
  [/sound|doppler|acoustic|vibrating/, 'speaker'],
  [/lets us see|seeing|\bvision\b/, 'eye'],
  [/\blight\b|shadow|optic|lens|refract/, 'bulb'],
  [/magnet|induction/, 'magnet'],
  [/circuit|ohm|current|voltage|electric|charge/, 'circuit'],
  [/wave|spectrum/, 'wave'],
  [/heat|thermo|thermal|temperature|warm|enthalpy/, 'flame'],
  [/force|push|newton|friction|incline|tension|mechanics of materials|solid mechanics/, 'push'],
  [
    /speed|velocity|acceleration|kinematic|motion|projectile|momentum|collision|dynamics|mechanics/,
    'speed',
  ],
  [/density/, 'balance'],
  [/material/, 'cube'],
  [/physics/, 'atom'],
  // ── Math: calculus and advanced ──
  [/limit|continuity/, 'infinity'],
  [
    /derivative|differentiat|related rates|optimization|differential equation|tangent line/,
    'tangent',
  ],
  [/integra|substitution|calculus/, 'integral'],
  [/sigma|series/, 'sigma'],
  [/linear algebra|matri|eigen/, 'matrix'],
  [/vector/, 'vector'],
  [/polar|complex number|parametric/, 'polar'],
  [/discrete math|logic|proof/, 'proof'],
  [/conic|circumference|\barcs?\b|chord|sector|circles?\b|unit circle/, 'circle'],
  [/identit/, 'sine'],
  [/right[- ]triangle|pythag|special right|distance between|distance, midpoint/, 'righttri'],
  [/trig|sine|cosine|tangent|radian|identit/, 'sine'],
  [/quadratic/, 'parabola'],
  [/exponential|growth and decay|logarithm/, 'expo'],
  [/scatter|correlation|regression|lines? of fit|residual/, 'scatter'],
  [/slope|linear|y = mx|rate of change/, 'linear'],
  [/polynomials\b/, 'xeq'],
  [/function|composition|inverse|rational expression|polynomial/, 'curve'],
  // ── Math: data and chance ──
  [/tally/, 'tally'],
  [/probab|chance|combinator|binomial|expected value|sampling|random/, 'dice'],
  [
    /normal distribution|z-score|standard deviation|mean|median|hypothesis|margin of error|statistic|distribution/,
    'bell',
  ],
  [/line plot/, 'lineplot'],
  [/coordinate|quadrant|graph points/, 'coords'],
  [/\bgraphs?\b|data|chart/, 'bars'],
  // ── Math: geometry ──
  [/naming shapes/, 'shapes'],
  [/compass|construction/, 'compass'],
  [/translation|rotation|reflection|dilation|transformation/, 'mirror'],
  [/\bparallel\b|perpendicular|symmetr/, 'lines'],
  [/\bangles?\b|degree/, 'angle'],
  [/congruen|similar triangle/, 'shapes'],
  [/liquid volume/, 'cup'],
  [/volume|prism|cylinder|cone|sphere|solid|cavalieri|faces, edges/, 'cube'],
  [/area|nets\b|rows and columns of squares/, 'area'],
  [/perimeter/, 'perimeter'],
  [/shape|polygon|quadrilateral|2d figure|flat/, 'shapes'],
  [/position word|in front of/, 'people'],
  // ── Math: measurement ──
  [/percent/, 'percent'],
  [
    /money|dollar|\bcents?\b|coin|\bbills?\b|price|\btax\b|\btip\b|markup|discount|interest/,
    'coin',
  ],
  [/lengths on a number line/, 'numberline'],
  [/elapsed time|\btime\b|clock|minute|hour|a\.m\./, 'clock'],
  [/measure and draw/, 'angle'],
  [/heavier|weight|\bmass\b/, 'balance'],
  [/capacity|holds more|liquid volume/, 'cup'],
  [/length|ruler|inches|feet|centimeter|meters|convert units|measure/, 'ruler'],
  // ── Math: numbers and operations ──
  [/\bratios?\b|proportion|\brates?\b|scale drawing|similar/, 'ratio'],
  [/skip[- ]count|jumps/, 'hops'],
  [/fraction/, 'fraction'],
  [/number line|absolute value|negative|rational numbers/, 'numberline'],
  [/ten.?frame|make 10|5 and some more|take from ten/, 'tenframe'],
  [/even and odd|\beven\b|\bodd\b/, 'evenodd'],
  [/array|equal groups/, 'array'],
  [
    /fraction|halves|fourths|thirds|parts equal|parts are equal|equal parts|mixed number|denominator/,
    'fraction',
  ],
  [/decimal|tenths|hundredths/, 'decimal'],
  [/equation|expression|variable|order of operations/, 'xeq'],
  [/exponent|powers? of 10|scientific notation/, 'power'],
  [/integer/, 'numberline'],
  [/\broots?\b|radical|irrational/, 'sqrt'],
  [
    /place value|tens and ones|hundreds|expanded form|trade|teen number|round|10 or 100 more|ten less|to 1,000/,
    'blocks',
  ],
  [/sequence|pattern/, 'sequence'],
  [/factor|multiple|prime|composite|greatest common/, 'times'],
  [/multipl|product/, 'times'],
  [/divid|division|quotient/, 'divide'],
  [/equal sign|true or false/, 'equals'],
  [/inequalit/, 'ineq'],
  [/equation|expression|variable|order of operations/, 'xeq'],
  [/compar|greater|how many more|how much more|order three|which holds/, 'compare'],
  [/two-step|, then |twice/, 'steps'],
  [/word problems/, 'book'],
  [/^add (four|three|several) numbers|^add within/, 'plus'],
  [/^take away$|^subtract tens/, 'minus'],
  [
    /partner|all the ways|number bond|add|subtract|take away|sum\b|operations|word problems/,
    'addsub',
  ],
  [/sort|classify/, 'shapes'],
  [/count|how many|numbers to 120/, 'count'],
  [/mathematics/, 'pi'],
];

/** The first rule that matches, if any. */
export function iconFromTitle(title: string): TopicIconName | undefined {
  const t = title.toLowerCase();
  return RULES.find(([re]) => re.test(t))?.[1];
}

/** Each strand's icon (the grade page, and skills no rule matches). */
const STRANDS: Record<string, TopicIconName> = {
  'Counting & Cardinality': 'count',
  'Operations & Algebraic Thinking': 'addsub',
  'Number & Base Ten': 'blocks',
  Fractions: 'fraction',
  'Measurement & Data': 'ruler',
  Geometry: 'shapes',
  'Ratios & Proportions': 'ratio',
  'The Number System': 'numberline',
  'Expressions & Equations': 'xeq',
  Functions: 'curve',
  'Statistics & Probability': 'bell',
  'Algebra 1': 'xeq',
  'Algebra 2': 'curve',
  'Precalculus & Statistics': 'sine',
  'Physical Science': 'bolt',
  'Life Science': 'leaf',
  'Earth & Space Science': 'globe',
  Biology: 'cell',
  Chemistry: 'flask',
  Physics: 'atom',
};
export const strandIcon = (strand: string): TopicIconName => STRANDS[strand] ?? 'count';

const DIVISIONS: Record<Division, TopicIconName> = {
  math: 'pi',
  science: 'atom',
  engineering: 'gear',
};
export const divisionIcon = (division: Division): TopicIconName => DIVISIONS[division];

export const skillIcon = (skill: Skill): TopicIconName =>
  iconFromTitle(skill.title) ?? strandIcon(skill.strand);

export const problemTypeIcon = (title: string, skill: Skill): TopicIconName =>
  iconFromTitle(title) ?? skillIcon(skill);

export const fieldIcon = (division: Division, title: string): TopicIconName =>
  iconFromTitle(title) ?? divisionIcon(division);

export const courseIcon = (course: Course): TopicIconName =>
  iconFromTitle(course.title) ?? divisionIcon(course.division);

export const topicIcon = (topic: string, course: Course): TopicIconName =>
  iconFromTitle(topic) ?? courseIcon(course);
