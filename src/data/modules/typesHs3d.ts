/**
 * Round 3 group H3D (biology, H109) types, kept apart from `types.ts` and `layouts/types.ts` so
 * those unions only list them.
 */
import type { DivisionStage } from './typesHsg';

/**
 * A `pieChart` part's stage (`stages`, one per part): the `cellDivision` card of that stage,
 * small, beside the part's name (the mitotic index: interphase and the four phases of mitosis).
 */
export type PieStage = DivisionStage;

/** One lane of a `gel` explore figure: its name over the well and its bands in base pairs. */
export interface GelFigureLane {
  label: string;
  bands: number[];
}

/** The most lanes a `gel` figure lists, and the most one scene shows (beside the ladder). */
export const GEL_FIGURE_LANES = 8;
export const GEL_SCENE_LANES = 6;

/**
 * A `gel` scene (DNA fingerprinting): `lanes` picks the lanes shown (default all, at most 6);
 * `lit` rings lanes; `compare` draws dashed lines across the gel at that lane's bands, and the
 * bands of other shown lanes at the same size are lit, the caption counting the matches per lit
 * lane. `parents: [mother, father]` with `compare` naming the child colors each child band by
 * the parent it matches (maternal red, paternal blue), and rings a band found in neither.
 */
export interface GelScene {
  lanes?: string[];
  lit?: string[];
  compare?: string;
  parents?: [string, string];
}

/** Two bands are one size when they differ by under 1%. */
export const sameBand = (a: number, b: number) => Math.abs(a - b) <= 0.01 * Math.max(a, b);

/** The parts of a reflex arc, in the order an impulse reaches them. */
export const REFLEX_ORDER = [
  'receptor',
  'sensory',
  'interneuron',
  'motor',
  'effector',
  'brain',
] as const;
export type ReflexPart = (typeof REFLEX_ORDER)[number];

/**
 * A `reflexArc` scene: the part lit, and whether the impulse's arrows are drawn along the path
 * as far as it (the whole arc when none is lit).
 */
export interface ReflexScene {
  lit?: ReflexPart;
  impulse?: boolean;
}

/** Round 3 group H3D's card figures (sequence stages and sort cards). */
export type Hs3dCard =
  /** A reflex arc with one part lit (H109, 112 × 76). */
  | { kind: 'reflexArc'; lit: ReflexPart }
  /** One stage of a flowering plant's life cycle (H109, 112 × 76). */
  | { kind: 'flowerCycle'; stage: FlowerStage };

/** The stages of a flowering plant's life cycle, in order. */
export const FLOWER_STAGES = [
  'pollination',
  'pollen tube',
  'fertilization',
  'seed and fruit',
  'dispersal',
  'germination',
  'seedling',
] as const;
export type FlowerStage = (typeof FLOWER_STAGES)[number];

/** Round 3 group H3D's explore figures. */
export type Hs3dFigure =
  | {
      /** Gel electrophoresis of fixed samples: fingerprints of suspects, or a family (H109). */
      kind: 'gel';
      lanes: GelFigureLane[];
      /** The ladder's sizes (default the calculator gel's); false for none. */
      ladder?: number[] | false;
    }
  /** A reflex arc from a hand on a hot pan through the spinal cord to the biceps (H109). */
  | { kind: 'reflexArc' };

/** The scene field each H3D explore figure reads (layouts.test). */
export const HS3D_SCENE_FIELD = { gel: 'gel', reflexArc: 'reflex' } as const satisfies Record<
  Hs3dFigure['kind'],
  string
>;

// ─── Calculator pictures ────────────────────────────────────────────────────

/** Axons at this speed or faster are drawn myelinated (unmyelinated fibers run about 0.5–2 m/s). */
export const MYELIN_SPEED = 3;

/**
 * `neuron` (H109): a motor neuron with its dendrites, cell body, axon and terminals on a muscle
 * fiber; under the axon a distance scale (0 to `length`, in m) and a time scale (0 to `time`,
 * in ms) at the same quarter marks, so the impulse's place and time read together. With a speed
 * of 3 m/s or more (or `myelin: true`) the axon is wrapped in myelin and the impulse hops from
 * node to node; slower, it is bare and the impulse creeps along it. Values in the formula's
 * units (m, m/s, ms).
 */
export interface NeuronSpec {
  kind: 'neuron';
  length: string | number;
  speed: string | number;
  time?: string | number;
  myelin?: boolean;
}

export type Hs3dSpec = NeuronSpec;

/** Every variable id an H3D picture reads (for modules.test.ts). */
export function hs3dSpecVars(r: Hs3dSpec): string[] {
  return [r.length, r.speed, r.time].filter((x): x is string => typeof x === 'string');
}
