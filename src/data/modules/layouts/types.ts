import type { Palette } from '@/theme';

import type { PlanetName } from '../typesPhysics8';
import type { StudyScene } from '../typesHsb';
import type { Hs2bCard } from '../typesHs2b';
import type { CellDivisionCard, EnergyScene, MacroScene } from '../typesHsg';
import type {
  CladeScene,
  CladeTrait,
  CladeTree,
  ImmuneStage,
  LoopScene,
  NitrogenProcess,
} from '../typesHsh';
import type { GalvanicScene } from '../typesHsj';
import type { CondensedCard, HydrationScene } from '../typesHs2d';
import type { SkeletalCard } from '../typesHe1c';
import type { TrussJointCard } from '../typesHe2i';
import type { IrCard } from '../typesHe3e';
import type { ProjectionCard } from '../typesHe3m';
import type { CodeTraceScene, He3dCard, He3dFigure } from '../typesHe3d';
import type { PathwayStepCard } from '../typesHe3g';
import type {
  CurrentsScene,
  GreenhouseScene,
  HslFigure,
  LandformScene,
  MohsScene,
} from '../typesHsl';
import type { GeneScene, KeyScene, KeyStep, ObserveSecond, ReplicationCard } from '../typesHs2e';
import type { Hs2fFigure, SpectraScene } from '../typesHs2f';
import type { EarthSectionScene, Hs3cFigure } from '../typesHs3c';
import type { He4dFigure, SymmetryScene } from '../typesHe4d';
import type { CodonsCard, PedigreeCard } from '../typesHe4i';
import type { GelScene, Hs3dCard, Hs3dFigure, ObserveScale, ReflexScene } from '../typesHs3d';
import type { Round3Icon } from './icons';
import type { StrobeCard } from './strobeCard';

/** A theme color by name (the palette's string entries). */
export type PaletteColor = {
  [K in keyof Palette]: Palette[K] extends string ? K : never;
}[keyof Palette];

/**
 * Module layouts other than the calculator (docs/MODULE_GUIDE.md, "Module layouts"). A
 * lesson whose idea isn't a quantity relationship gets one of these: the page keeps the
 * grade's words and the review process, but there are no values, formulas or walkthrough.
 * Everything a student reads is content here, never in a component.
 */

interface LayoutBase {
  /** Skill id, or `<skill id>~<slug>` for a problem type. */
  id: string;
  /** Name of a problem-type page. */
  title?: string;
  /** Problem types: what the page is for, in one line ("Use this for …"). */
  use?: string;
  /** "Good to know" bullets, in the grade's words. */
  assumptions: string[];
}

/** Cards to put into labelled groups by one property, with a count per group. */
export interface SortLayout extends LayoutBase {
  kind: 'sort';
  /** The question the sort answers: "Does it bend?" */
  question: string;
  bins: {
    id: string;
    label: string;
    /** One sentence about the property, shown when the group is full. */
    why: string;
    /** H104: a small drawing beside the group's name (a card figure, often an icon). */
    figure?: CardFigure;
    /**
     * H114: the group's color, a theme color name, as a picture on the page draws it (the
     * gastrula's germ layers: ectoderm `bioAmino`, mesoderm `organDeep`, endoderm `bioSugar`):
     * a stripe down the bin's side and a swatch before its name.
     */
    color?: PaletteColor;
  }[];
  cards: { label: string; bin: string; figure?: CardFigure }[];
  /** A picture above the cards, so they can be judged by looking (`layouts/offspringFigure.tsx`). */
  header?: SortHeader;
  /** H104: a sentence above the cards (what the groups have in common, or what to look for). */
  intro?: string;
  /**
   * H117: while a card is picked, its groups show as a row of buttons right under it (and a
   * hint about it shows there too), so on a phone the groups stay in reach of many cards.
   */
  pickBar?: boolean;
  /**
   * HE-E25: the cards are code (`print(x)`, `i += 1`), drawn in a code font exactly as written:
   * straight quotes kept, no subscripts drawn from an underscore (`my_list`).
   */
  code?: boolean;
}

/**
 * A sort's picture above the cards. `offspring`: the animals side by side on the ground,
 * left to right, at one scale (the young drawn smaller), each named under it.
 */
export type SortHeader = { kind: 'offspring'; animals: OffspringAnimal[] };

/** One animal in an `offspring` header. */
export interface OffspringAnimal {
  animal: 'cat' | 'deer';
  /** Its name under it: "Mother", "Kitten", "Buck". */
  label: string;
  /** A young one, drawn at about two thirds the size. */
  young?: boolean;
  /** Its fur (default: a cat orange, a deer brown). */
  fur?: 'orange' | 'gray' | 'brown';
  /** A white patch on the nose. */
  nosePatch?: boolean;
  /** White spots on the back (a fawn). */
  spots?: boolean;
  /** Antlers (a buck). */
  antlers?: boolean;
}

/** A small drawing on a sort card, so the property is seen, not remembered. */
export type CardFigure =
  /** Two lines: parallel at `angle` degrees, or crossing at that angle (90 = perpendicular). */
  | { kind: 'lines'; angle: number; parallel?: boolean }
  /** A big letter. */
  | { kind: 'letter'; text: string }
  /**
   * A shape from corners in a 0–100 box (y down), closed unless `open` (a corner, clock hands).
   * `curved` draws that side (from corner i to the next) as an arc; `marks` adds the square
   * corner marks and equal-side ticks, worked out from the corners.
   */
  | {
      kind: 'polygon';
      points: [number, number][];
      open?: boolean;
      curved?: number;
      marks?: boolean;
      /** The side (from corner i to the next) drawn thick: the base. */
      base?: number;
      /** A dashed segment [from, to] in the 0–100 box: a height (square corner at its foot). */
      dashed?: [[number, number], [number, number]];
      /** The base's line extended dotted (a height outside an obtuse triangle). */
      extend?: boolean;
    }
  | { kind: 'circle' }
  | { kind: 'heart' }
  /** A solid shape in outline. */
  | { kind: 'solid'; shape: 'sphere' | 'cube' | 'cylinder' | 'cone' | 'box' }
  /**
   * A circle, square or rectangle cut into `parts`, equal or not, with the first `shaded`
   * parts shaded. Straight cuts are strips (a square in fourths is a 2 × 2 grid); diagonal
   * cuts go corner to corner (2 or 4 parts).
   */
  | {
      kind: 'cut';
      shape: 'circle' | 'square' | 'rectangle';
      parts: number;
      equal: boolean;
      cuts?: 'straight' | 'diagonal';
      shaded?: number;
    }
  /**
   * A ribbon `length` cubes long, with cubes under it laid end to end (`cubes`), with gaps,
   * overlapping, or not lined up with the ribbon's start (`offset`).
   */
  | { kind: 'bar'; length: number; units?: 'cubes' | 'gap' | 'overlap' | 'offset' }
  /** Dots in pairs, two rows; an odd count leaves one without a partner. */
  | { kind: 'dots'; count: number }
  /** A small drawing of an everyday thing. */
  | { kind: 'icon'; icon: CardIcon }
  /** Fraction bars of the same whole, one under the other: [shaded parts, parts]. */
  | { kind: 'fractionBars'; bars: [number, number][] }
  /** A line with no arrowheads (a segment, with its endpoints), one (a ray) or two (a line); or one point. */
  | { kind: 'ray'; arrows: 0 | 1 | 2; point?: boolean }
  /** Six squares on a grid (a cube's possible net): [column, row] of each square. */
  | { kind: 'net'; cells: [number, number][] }
  /** A number line with a dot at `at` (filled when included) and an arrow left or right. */
  | { kind: 'inequality'; at: number; dir: 'left' | 'right'; closed: boolean }
  /** A small scatter plot whose dots rise, fall, scatter with no trend, or follow a curve. */
  | { kind: 'scatter'; trend: 'up' | 'down' | 'none' | 'curve' }
  /** A small cell drawing: a wall or not, a nucleus or loose DNA, chloroplasts. */
  | {
      kind: 'cell';
      type: 'plant' | 'animal' | 'bacterium';
      shape?: 'box' | 'round' | 'long' | 'branched' | 'rod';
      chloroplasts?: boolean;
      /** Draw every part and outline this one (a part the cell type has). */
      highlight?: CellPart;
    }
  /** The moon in one of its shapes (waxing lit on the right, waning on the left). */
  | { kind: 'moon'; phase: MoonPhase }
  /** A constellation: its stars, sized by brightness, joined by lines. */
  | { kind: 'stars'; constellation: Constellation }
  /**
   * A small flat map: the world (centered on the Atlantic, or on the Pacific) or North
   * America, with a named region shaded and/or a pin at [longitude, latitude] (west and south
   * negative).
   */
  | { kind: 'map'; area: MapArea; region?: MapRegion; pin?: [number, number] }
  /** A tiny flat dot plot of fixed values, the smallest and largest labelled. */
  | { kind: 'dotPlot'; values: number[] }
  /** A ball-and-stick molecule, or one atom ("H2O", "CO2", "Fe"), in the classroom colors. */
  | { kind: 'molecule'; formula: string }
  /** One stage of mitosis or meiosis, its chromosomes counted from 2n (HS group G). */
  | CellDivisionCard
  /** Geometry cards (H2B, `typesHs2b.ts`): marked triangles, construction stages, cross sections. */
  | Hs2bCard
  /** A motion diagram: dots one second apart, gaps to scale (H102, `strobeCard.ts`). */
  | StrobeCard
  /** An organic molecule's condensed formula, its functional group lit (`typesHs2d.ts`, H101). */
  | CondensedCard
  /** College HC2 (`typesHe1c.ts`): a line-angle structure, 112 × 76, a group lit. */
  | SkeletalCard
  /** College HC27 (`typesHe2i.ts`): one truss joint, its members, a load or a pin; 96 × 72. */
  | TrussJointCard
  /** College HC55 (`typesHe3e.ts`): an IR spectrum from its bands, 140 × 60. */
  | IrCard
  /** College HC78 (`typesHe3m.ts`): a map projection's outline, graticule and Tissot dots. */
  | ProjectionCard
  /** College round 3, group D (`typesHe3d.ts`): code on a code panel (HC48). */
  | He3dCard
  /** College HC57 (`typesHe3g.ts`): one step of glycolysis or the citric acid cycle, 112 × 76. */
  | PathwayStepCard
  /** College HC144 (`typesHe4i.ts`): a small pedigree in the standard symbols, 112 × 76. */
  | PedigreeCard
  /** College HC146 (`typesHe4i.ts`): a codon strip before and after a mutation, 140 × 74. */
  | CodonsCard
  /** One stage of DNA replication, old strands dark and new ones lit (H100, `typesHs2e.ts`). */
  | ReplicationCard
  /** Biology round 3 (H109, `typesHs3d.ts`): a reflex arc, one part lit. */
  | Hs3dCard
  /** A rock's outline filled with its texture. */
  | {
      kind: 'rock';
      texture:
        | 'crystals'
        | 'fine'
        | 'glassy'
        | 'holes'
        | 'grains'
        | 'pebbles'
        | 'shells'
        | 'layers'
        | 'bands';
    };

/** The everyday things a card can show. */
export type CardIcon =
  | 'sun'
  | 'moon'
  | 'feather'
  | 'leaf'
  | 'crayon'
  | 'sock'
  | 'brick'
  | 'watermelon'
  | 'backpack'
  | 'bowling ball'
  | 'paper clip'
  | 'door'
  | 'eraser'
  | 'bed'
  | 'bus'
  // Drawn in their materials (layouts/cardIcons.tsx).
  | 'thermometer'
  | 'rain gauge'
  | 'wind vane'
  | 'wind sock'
  | 'bird'
  | 'frog'
  | 'grasshopper'
  | 'turtle'
  | 'fish'
  | 'cat'
  | 'dog'
  | 'dolphin'
  | 'person'
  | 'tree frog'
  | 'warbler'
  | 'white hare'
  | 'stick insect'
  | 'thick fur'
  | 'fluffed bird'
  | 'blubber'
  | 'camel hump'
  | 'cactus stem'
  | 'rabbit'
  | 'deer'
  | 'hawk'
  | 'snake'
  | 'heron'
  | 'raccoon'
  | 'bear'
  | 'meter stick'
  | 'pencil'
  | 'workbook'
  | 'water bottle'
  | 'milk carton'
  | 'juice box'
  | 'eyedropper'
  | 'pan handle'
  | 'oven mitt'
  | 'kettle'
  // Round 3, one list per drawing group (layouts/icons/).
  | Round3Icon;

/** Stages to put in order, each with how long it takes; the total under the strip. */
export interface SequenceLayout extends LayoutBase {
  kind: 'sequence';
  /** "Put the stages in order." */
  question: string;
  /** In the right order. */
  stages: { label: string; span?: number; figure?: CardFigure }[];
  /** The unit of the spans ("days"). */
  unit?: string;
  /** Label of the sum of the spans ("Whole cycle"). */
  totalLabel?: string;
  /** The stages stack from the bottom up, in a jar (liquids by density), not left to right. */
  stack?: boolean;
  /**
   * HE-E25: the spans are signed changes (ATP per glycolysis step: −1, 0, +2), each shown with
   * its sign and the total as a net change ("Net: +2 ATP"). A sequence with no spans shows
   * none (stages in order only).
   */
  signed?: boolean;
  /** HE-E25: the stages are code (a program's lines), drawn in a code font exactly as written. */
  code?: boolean;
}

/** What an explore figure can show; a scene sets one of these. */
export type Figure =
  /** Earth and space, group HL (`typesHsl.ts`): Mohs scale, landforms, currents, greenhouse. */
  | HslFigure
  /** Earth and space round 2, group H2F (`typesHs2f.ts`): spectra side by side. */
  | Hs2fFigure
  /** Earth and space round 3, group H3C (`typesHs3c.ts`): Earth cut open, a station placed. */
  | Hs3cFigure
  /** College round 4, group D (`typesHe4d.ts`): a molecule with one symmetry element lit. */
  | He4dFigure
  /** Biology round 3, group H3D (`typesHs3d.ts`): a gel of fixed samples. */
  | Hs3dFigure
  /** College round 3, group D (`typesHe3d.ts`): a code trace (HC48). */
  | He3dFigure
  /**
   * A thing made of named parts, each with its job; a scene highlights one part. With a
   * `drawing` (`layouts/partsDrawings.tsx`), the thing is drawn, every part labeled and the
   * scene's part lit; a part is picked by tapping it. Each part's name must name a drawn part:
   * `plant` flower, leaves, stem, roots; `animal` (a bear and a turtle) eyes, ears, fur,
   * claws, shell; `body` brain, heart, lungs, stomach, bones, skin; `flower` (H109, cut in
   * half) petal, sepal, anther, filament, stigma, style, ovary, ovule (any capitals).
   */
  | {
      kind: 'parts';
      parts: { name: string; job: string }[];
      drawing?: 'plant' | 'animal' | 'body' | 'flower';
    }
  /** A ball and a box; a scene puts the ball above, below, beside, in front of or behind. */
  | { kind: 'position' }
  /** A clock face; a scene sets the time. */
  | { kind: 'clock' }
  /** Animals as dots: alone, or together in a group. */
  | { kind: 'dots' }
  /** Two bar magnets facing each other; a scene turns one round. */
  | { kind: 'magnets' }
  /** A flashlight code: a pattern of flashes. */
  | { kind: 'flashes' }
  /** A lamp, an object and an eye; a scene turns the lamp on or off and puts a hand or mirror in the way. */
  | { kind: 'lightPath' }
  /** Particles in a box; a scene packs them as a solid, liquid or gas, mixes a second kind in, or squeezes the box. */
  | { kind: 'particles' }
  /**
   * A globe with a person and a dropped ball at a spot, the pull arrow toward the center; a
   * scene can throw the ball up, or light one half from a sun and mark the time of day.
   */
  | { kind: 'earth' }
  /** A ball on the floor seen from above, a hand pushing (or a string pulling) and the path after. */
  | { kind: 'push' }
  /** One sound maker, still or shaking, with sound marks when it shakes. */
  | { kind: 'vibration' }
  /** The sky over a house from East to West: the sun on its path, or the night sky. */
  | { kind: 'sky' }
  /** A balloon, plain or rubbed, near paper bits, hair, a wall or a second balloon. */
  | { kind: 'static' }
  /** An addition or times table from 0 to 10; a scene lights rows, columns, cells or the mirror line. */
  | { kind: 'timesTable' }
  /** A plant, animal or bacterium cell with its parts labeled (Grade 6). */
  | { kind: 'cell' }
  /** A body outline with one or more systems drawn in (Grade 6). */
  | { kind: 'bodySystems' }
  /** Sea, cloud, mountain and ground, with one process of the water cycle lit (Grade 6). */
  | { kind: 'waterCycle' }
  /** Two air masses meeting at a front, or a high or low with its winds (Grade 6). */
  | { kind: 'front' }
  /** A slice through two plates at their boundary (Grade 6). */
  | { kind: 'plates' }
  /** The continents at a time in the past, with a clue that they were joined (Grade 6). */
  | { kind: 'continents' }
  /** The rock cycle: three kinds of rock and the processes between them (Grade 6). */
  | { kind: 'rockCycle' }
  /**
   * A meadow food web: the sun, grass, rabbit, grasshopper, mouse, frog, snake and hawk, each
   * arrow meaning "is eaten by" (the sun's arrow: its energy goes into the grass).
   */
  | { kind: 'foodWeb' }
  /**
   * A leaf making sugar in the light (photosynthesis) and a cell using it (respiration), each
   * with its inputs and outputs as labelled arrows and its word equation (Grade 7).
   */
  | { kind: 'leafCell' }
  /**
   * The carbon cycle: the air's carbon dioxide, a tree, an animal, the dead matter and its
   * decomposers, fossil fuels, a factory and the ocean, with the processes as arrows (Grade 7).
   */
  | {
      kind: 'carbonCycle';
      /**
       * H103: a volcanic island in the ocean over a magma chamber, its outgassing an arrow up
       * to the air (the `volcano` process). Off unless set.
       */
      volcano?: boolean;
    }
  /**
   * A family's pedigree chart in the standard symbols: squares are males, circles females,
   * filled has the trait, half-filled carries it; a line joins parents, their children hang
   * below. Generations are numbered I, II, III and people 1, 2, … in each (Grade 7).
   */
  | { kind: 'pedigree'; people: PedigreePerson[] }
  /**
   * Ball-and-stick molecules (Grade 7, `chemFigures.tsx`): one molecule big with its atoms
   * named, or several in a box packed as a solid, liquid or gas; `after` adds a second box
   * behind an arrow (a reaction or a change).
   */
  | { kind: 'molecules' }
  /** Boxes of particles as a solid, a liquid and a gas, with the changes between them as arrows. */
  | { kind: 'phases' }
  /** The periodic table with an element, a group or a period lit (Grade 8). */
  | { kind: 'periodicTable' }
  /** The planets and Earth’s moon side by side, to scale by size, beside the sun’s edge (Grade 8). */
  | { kind: 'planets' }
  /** Population → sample → a survey, an observational study or an experiment (HS group B). */
  | { kind: 'studyDesign' }
  /** Two cones tip to tip cut by a plane: a circle, ellipse, parabola or hyperbola (Grades 10–12). */
  | { kind: 'doubleCone' }
  /** Monomers joining into polymers: sugars, amino acids, nucleotides, a fat (HS group G). */
  | { kind: 'macromolecules' }
  /** A chloroplast and a mitochondrion trading glucose, O₂, CO₂ and H₂O; light in, ATP out (HS group G). */
  | { kind: 'organelleEnergy' }
  /** A cladogram with its shared derived traits marked where they appear (HS group H). */
  | { kind: 'cladogram'; tree: CladeTree; traits: CladeTrait[] }
  /** The nitrogen cycle: air, a bean plant with root nodules, lightning, the soil's forms (H40). */
  | { kind: 'nitrogenCycle' }
  /** A feedback loop: stimulus, sensor, control center, effector, response, and back (H41). */
  | { kind: 'feedbackLoop' }
  /** The immune response: antigen, helper T, B and plasma cells, antibodies, killer T, memory (H42). */
  | { kind: 'immuneStages' }
  /** A galvanic cell: two electrodes, a salt bridge and electrons along the wire (H56). */
  | { kind: 'electrochemicalCell' }
  /** A gene with its promoter and a repressor or activator switch, read into mRNA or not (H100). */
  | { kind: 'geneExpression' }
  /** A branching yes-or-no key from questions to names (H100, `typesHs2e.ts`). */
  | { kind: 'dichotomousKey'; steps: KeyStep[] };

/** How a plane cuts the double cone: level, tilted, as steep as the side, or steeper. */
export type ConeCut = 'circle' | 'ellipse' | 'parabola' | 'hyperbola';

/** One person in a `pedigree` figure. */
export interface PedigreePerson {
  id: string;
  sex: 'male' | 'female';
  /** 1 for the oldest generation; people are drawn left to right in the order listed. */
  generation: number;
  /** Shows the trait (a filled symbol). */
  trait?: boolean;
  /** Carries the allele without showing it (half-filled). */
  carrier?: boolean;
  /** Both parents' ids: the child hangs from the line joining them. */
  parents?: [string, string];
  /** A partner with no children in the chart, joined by a line. */
  partner?: string;
  /** Their alleles ("Aa"), shown when a scene turns genotypes on. */
  genotype?: string;
}

/** What goes into or comes out of photosynthesis and respiration (a `leafCell` figure). */
export type LeafCellSubstance =
  'light' | 'water' | 'carbon dioxide' | 'sugar' | 'oxygen' | 'energy';

/** The processes of a `carbonCycle` figure. */
export type CarbonProcess =
  | 'photosynthesis'
  | 'respiration'
  | 'eating'
  | 'death'
  | 'decomposition'
  | 'burning'
  | 'dissolving'
  | 'burial'
  /** Volcanoes giving off carbon dioxide (a `carbonCycle` figure with `volcano`). */
  | 'volcano';

/** A substance in a `molecules` scene: its formula ("H2O") and how many (default 1). */
export interface MoleculeItem {
  formula: string;
  count?: number;
}

/** The changes between solid, liquid and gas on a `phases` figure. */
export type PhaseChange =
  | 'melting'
  | 'freezing'
  | 'boiling'
  | 'evaporation'
  | 'condensation'
  | 'sublimation'
  | 'deposition';

/** The parts a `cell` card figure can outline. */
export type CellPart =
  'wall' | 'membrane' | 'cytoplasm' | 'nucleus' | 'chloroplasts' | 'vacuole' | 'mitochondria';

/** The constellations a `stars` card figure draws. */
export type Constellation =
  'Orion' | 'Taurus' | 'Scorpius' | 'Cygnus' | 'Big Dipper' | 'Cassiopeia';

/** The `map` card figure's views. */
export type MapArea = 'world' | 'pacific' | 'northAmerica';

/**
 * Regions a `map` card figure shades. World and Pacific maps: 'pacific ocean', 'andes',
 * 'great plains', 'central australia', 'sahara'. North America: 'northern canada', 'arctic
 * lands', 'north pacific', 'north atlantic', 'gulf of mexico', 'caribbean sea', 'northern
 * mexico', 'desert southwest'.
 */
export type MapRegion =
  | 'pacific ocean'
  | 'andes'
  | 'great plains'
  | 'central australia'
  | 'sahara'
  | 'northern canada'
  | 'arctic lands'
  | 'north pacific'
  | 'north atlantic'
  | 'gulf of mexico'
  | 'caribbean sea'
  | 'northern mexico'
  | 'desert southwest';

/** The members of the `foodWeb` figure. */
export type FoodWebMember =
  'sun' | 'grass' | 'rabbit' | 'grasshopper' | 'mouse' | 'frog' | 'snake' | 'hawk';

/** The moon's shapes through one cycle, as seen from the Northern Hemisphere. */
export type MoonPhase =
  | 'new'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full'
  | 'waning gibbous'
  | 'third quarter'
  | 'waning crescent';

export interface Scene {
  label: string;
  /** What to read about this scene, one sentence per line. */
  lines: string[];
  /** Group HL figures (`typesHsl.ts`): `mohsScale`, `landforms`, `oceanCurrents`, `greenhouse`. */
  mohs?: MohsScene;
  landform?: LandformScene;
  currents?: CurrentsScene;
  greenhouse?: GreenhouseScene;
  /** A `spectra` figure (`typesHs2f.ts`): the star's elements, one lab strip lit. */
  spectra?: SpectraScene;
  /** An `earthLayers` figure (`typesHs3c.ts`): the station's distance from the focus. */
  earthSection?: EarthSectionScene;
  /** A `symmetryElements` figure (`typesHe4d.ts`): the molecule and the element lit. */
  symmetry?: SymmetryScene;
  /** The part to highlight (a `parts` figure). */
  part?: string;
  /** More parts lit with `part`, on a drawn `parts` figure (a stamen: anther and filament). */
  alsoLit?: string[];
  /** Where the ball is (a `position` figure). */
  position?: 'above' | 'below' | 'beside' | 'in front of' | 'behind';
  /** [hour, minutes] (a `clock` figure). */
  time?: [number, number];
  /** [groups, animals in each] (a `dots` figure). */
  dots?: [number, number];
  /** A `dots` figure draws its animals as deer (the young in the middle) or penguins. */
  animal?: 'deer' | 'penguin';
  /** Which poles face each other (a `magnets` figure). */
  poles?: 'N–S' | 'N–N' | 'S–S';
  /**
   * A `magnets` figure's field (Grade 8): lines from N to S around the magnets (unless `lines`
   * is false), compass needles round them (`compasses`), or one magnet alone (`single`; the
   * scene's `poles` are then not used).
   */
  field?: { single?: boolean; lines?: boolean; compasses?: boolean };
  /** The planets ringed, each with its width in Earths (a `planets` figure). */
  planets?: { lit?: PlanetName[] };
  /** The design, how the sample is taken and the stage lit (a `studyDesign` figure). */
  study?: StudyScene;
  /** The molecule built or split (a `macromolecules` figure; `typesHsg.ts`). */
  macro?: MacroScene;
  /** The process lit (an `organelleEnergy` figure; `typesHsg.ts`). */
  energy?: EnergyScene;
  /** The trait lit and the taxa ringed (a `cladogram` figure). */
  clade?: CladeScene;
  /** The process lit (a `nitrogenCycle` figure); with none, the whole cycle. */
  nitrogen?: { process?: NitrogenProcess };
  /** The loop's steps, its sign and the step lit (a `feedbackLoop` figure). */
  loop?: LoopScene;
  /** The stage lit (an `immuneStages` figure); with none, the whole response. */
  immune?: { stage?: ImmuneStage };
  /** The conic the plane cuts (a `doubleCone` figure). */
  cone?: ConeCut;
  /** The two metals and the part lit (an `electrochemicalCell` figure). */
  galvanic?: GalvanicScene;
  /** The switch, the signal and the part lit (a `geneExpression` figure; `typesHs2e.ts`). */
  gene?: GeneScene;
  /** The name traced and the question ringed (a `dichotomousKey` figure; `typesHs2e.ts`). */
  key?: KeyScene;
  /** The lanes shown, ringed and compared (a `gel` figure; `typesHs3d.ts`, H109). */
  gel?: GelScene;
  /** The part lit and the impulse so far (a `reflexArc` figure; `typesHs3d.ts`). */
  reflex?: ReflexScene;
  /** The line lit, the variables table and the test (a `codeTrace` figure; `typesHe3d.ts`). */
  trace?: CodeTraceScene;
  /** The flashes, as "● ● ●" with "—" for a long one (a `flashes` figure). */
  flashes?: string;
  /**
   * Whether the lamp is on and what sits in the light's way (a `lightPath` figure). With a
   * `wall`, or a blocker made of a material (clear, cloudy, solid), the figure is a lamp, the
   * thing and a wall with its shadow; `height` puts the lamp low (a long shadow) or high.
   */
  light?: {
    lamp: boolean;
    blocker?: 'hand' | 'mirror' | 'clear' | 'cloudy' | 'solid';
    height?: 'low' | 'high';
    wall?: boolean;
  };
  /** How the particles are packed (a `particles` figure). */
  particles?: { state: 'solid' | 'liquid' | 'gas'; mixed?: boolean; squeezed?: boolean };
  /** Where the person stands, whether the ball is thrown, and the time of day when lit (an `earth` figure). */
  earth?: {
    spot: 'top' | 'side' | 'bottom';
    thrown?: boolean;
    sunlit?: 'morning' | 'noon' | 'evening' | 'midnight';
  };
  /** Where the push comes from, how hard, and whether it is a pull on a string (a `push` figure). */
  push?: { from: 'behind' | 'front' | 'side'; strength: 'gentle' | 'hard'; pull?: boolean };
  /** The sound maker and whether it is shaking (a `vibration` figure). */
  vibrate?: { thing: 'band' | 'drum' | 'bell' | 'voice'; shaking: boolean };
  /**
   * The sun at a spot on its path, or the night sky (a `sky` figure). At night, `phase` draws
   * the moon in that shape (waxing lit on the right, waning on the left); `rising` adds an
   * arrow along the path toward the west (the sun or moon rising in the east); `cycle` adds a
   * strip of the eight shapes under the sky with this one ringed.
   */
  sky?: {
    body: 'sun' | 'night';
    at?: 'east' | 'high' | 'west';
    phase?: MoonPhase;
    rising?: boolean;
    cycle?: boolean;
  };
  /** Whether the balloon was rubbed, and what it is near (a `static` figure). */
  charge?: { rubbed: boolean; near: 'paper' | 'hair' | 'wall' | 'balloon' };
  /** What the table shows and lights (a `timesTable` figure). Rows and columns are 0–10. */
  table?: {
    op: '×' | '+';
    rows?: number[];
    columns?: number[];
    cells?: 'even' | 'odd';
    mirror?: boolean;
    /** A turn-around pair: the cells row × column and column × row outlined (4 × 7, 7 × 4). */
    pair?: [number, number];
  };
  /** The cell and the part lit (a `cell` figure). */
  cell?: {
    type: 'plant' | 'animal' | 'bacterium';
    part?:
      | 'membrane'
      | 'cytoplasm'
      | 'nucleus'
      | 'mitochondria'
      | 'chloroplasts'
      | 'wall'
      | 'vacuole'
      | 'dna';
  };
  /** The systems drawn (a `bodySystems` figure). */
  body?: {
    systems: (
      | 'circulatory'
      | 'respiratory'
      | 'digestive'
      | 'nervous'
      | 'muscular'
      | 'skeletal'
      | 'excretory'
    )[];
  };
  /** The process lit and what drives it (a `waterCycle` figure). */
  water?: {
    process:
      | 'evaporation'
      | 'transpiration'
      | 'condensation'
      | 'precipitation'
      | 'runoff'
      | 'infiltration'
      | 'melting';
    driver?: 'sun' | 'gravity';
  };
  /** The front, or a high or low (a `front` figure). */
  front?: { type?: 'cold' | 'warm' | 'stationary'; air?: 'high' | 'low' };
  /** The boundary, with rock ages or the mantle's flow (a `plates` figure). */
  plates?: {
    boundary: 'divergent' | 'rift' | 'subduction' | 'collision' | 'transform';
    ages?: boolean;
    mantle?: boolean;
  };
  /** Millions of years ago, and the clue shown (a `continents` figure). */
  continents?: { age: 250 | 150 | 0; clue?: 'fossils' | 'rocks' | 'shapes' | 'climate' };
  /**
   * What a `foodWeb` figure shows: one food chain lit (its members in order, from the sun or
   * grass up), an animal taken away (drawn crossed out, its arrows dashed), and which members
   * then grow in number (`more`) or shrink (`fewer`), marked with an up or down arrow.
   */
  web?: {
    chain?: FoodWebMember[];
    removed?: FoodWebMember;
    more?: FoodWebMember[];
    fewer?: FoodWebMember[];
  };
  /**
   * The process a `leafCell` figure shows (the leaf, the cell, or both trading their outputs)
   * and one input or output lit.
   */
  leafCell?: { process: 'photosynthesis' | 'respiration' | 'both'; lit?: LeafCellSubstance };
  /** The process lit (a `carbonCycle` figure); with none, the whole cycle. */
  carbon?: { process?: CarbonProcess };
  /**
   * A `pedigree` figure: the people ringed (ids), whether carriers are half-filled (off, they
   * look like anyone without the trait), whether genotypes show under the symbols, and one
   * person whose genotype is a question mark.
   */
  family?: { lit?: string[]; carriers?: boolean; genotypes?: boolean; ask?: string };
  /**
   * What a `molecules` figure shows. One item with no count, state or `after`: the molecule
   * big, each element's atom named. Otherwise the items' molecules mixed in a box, packed as
   * a `state` (spread out when left out); `after` draws a second box behind an arrow. `ice`
   * (water only) sets the molecules on open hexagons, each O–H pointing at a neighbor's O
   * with the hydrogen bond dashed: 6 molecules make one ring, 10 two, 13 three.
   */
  molecules?: {
    items: MoleculeItem[];
    state?: 'solid' | 'liquid' | 'gas' | 'ice';
    after?: MoleculeItem[];
    afterState?: 'solid' | 'liquid' | 'gas' | 'ice';
    /** Round 2: ions ringed by water, turned by charge (`typesHs2d.ts`, H101). */
    hydration?: HydrationScene;
  };
  /**
   * The state lit on a `phases` figure and the change lit among its arrows (melting and
   * boiling or evaporation over the boxes, freezing and condensation under them; sublimation
   * and deposition only when lit). `formula` draws the particles as that molecule ("H2O");
   * plain balls when left out.
   */
  phase?: { state?: 'solid' | 'liquid' | 'gas'; change?: PhaseChange; formula?: string };
  /**
   * What a `periodicTable` figure lights: an element (atomic number or symbol) with its card,
   * a group, a period, and a ring around each element in `ring`; `families` fills metals,
   * metalloids, nonmetals and noble gases.
   */
  elements?: {
    element?: number | string;
    group?: number;
    period?: number;
    ring?: (number | string)[];
    families?: boolean;
  };
  /** The process lit (a `rockCycle` figure). */
  rock?: {
    process: 'melting' | 'cooling' | 'weathering' | 'deposition' | 'metamorphism' | 'uplift';
  };
}

/** An idea with no honest quantity: a picture with a few scenes to switch between. */
export interface ExploreLayout extends LayoutBase {
  kind: 'explore';
  figure: Figure;
  scenes: Scene[];
}

/** A quantity recorded over time: a table the student changes, its chart, the pattern. */
export interface ObserveLayout extends LayoutBase {
  kind: 'observe';
  /** Column headings ("Week 1", …). */
  columns: string[];
  /** What the row measures ("Rain"). */
  rowLabel: string;
  unit: string;
  max: number;
  step: number;
  /** The opening values, one per column. */
  initial: number[];
  /** The pattern in a sentence, from the current values. */
  pattern: (values: number[], second?: number[]) => string;
  /** Columns are intervals of one number line: the bars touch, with a count scale beside. */
  histogram?: boolean;
  /** A picture of the column last tapped, above the chart (`ObserveFigure`). */
  figure?: ObserveFigure;
  /** H100: a second row counted in the same columns, its bars beside the first (`typesHs2e.ts`). */
  second?: ObserveSecond & ObserveScale;
  /** H109: the lowest value (below 0 for a membrane potential); bars grow up or down from 0. */
  min?: number;
  /**
   * Dashed reference lines across a chart with a `min` (a threshold, a resting level): each
   * value is marked on a scale beside the bars, with 0, and named in a key under the chart.
   */
  guides?: { at: number; label: string }[];
}

/**
 * An observe page's picture of the column tapped last, drawn to scale from its value:
 * - `shadowStick`: a stick `stick` units tall (100 for a meter stick in cm) and its shadow as
 *   long as the value, the sun on the line from the shadow's tip over the stick's top. With
 *   `sides` (one per column) the shadow points west, east or north, the ground's ends are
 *   named, and the time is the column's; without, it is a noon shadow.
 * - `thermometer`: one thermometer from 0 to the page's `max`, filled to the value.
 * - `plantHeight`: a plant in a pot beside a centimeter ruler to `max`, as tall as the value.
 * - `ramp`: a ramp raised to `heights[i]` cm (the column's release height) and the cup slid
 *   the value along the floor, both to one scale.
 * - `flashlight`: the flashlight `distances[i]` cm from a wall and the lit circle on it as
 *   wide as the value, side on and face on.
 * - `cup`: an open cup `max` tall with the water at the value and a dashed line at the first
 *   column's level.
 */
export type ObserveFigure =
  | { kind: 'shadowStick'; stick: number; sides?: ('west' | 'east' | 'north')[] }
  | { kind: 'thermometer' }
  | { kind: 'plantHeight' }
  | { kind: 'ramp'; heights: number[] }
  | { kind: 'flashlight'; distances: number[] }
  | { kind: 'cup' };

export type LayoutDef = SortLayout | SequenceLayout | ExploreLayout | ObserveLayout;
