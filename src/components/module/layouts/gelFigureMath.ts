/** The `gel` explore figure's arithmetic (H109), shared with the harness. */
import {
  GEL_SCENE_LANES,
  type GelFigureLane,
  type GelScene,
  type Hs3dFigure,
  sameBand,
} from '@/data/modules/typesHs3d';

import { GEL_LADDER, gelWindow, type GelWindow } from '../reps/bioModel';

type GelFig = Extract<Hs3dFigure, { kind: 'gel' }>;

/** One scale for every scene: from the ladder and all the figure's lanes. */
export function gelFigureWindow(figure: GelFig): GelWindow {
  const ladder = figure.ladder === false ? [] : (figure.ladder ?? GEL_LADDER);
  return gelWindow([...ladder, ...figure.lanes.flatMap((l) => l.bands)]);
}

/** The lanes a scene shows, in the figure's order (all when it names none), at most six. */
export function gelSceneLanes(figure: GelFig, scene: GelScene): GelFigureLane[] {
  const want = scene.lanes;
  return figure.lanes.filter((l) => !want || want.includes(l.label)).slice(0, GEL_SCENE_LANES);
}

/** The parent a child's band matches: the mother first, then the father, else neither. */
export function parentOf(
  bp: number,
  mother: number[],
  father: number[],
): 'mother' | 'father' | undefined {
  if (mother.some((b) => sameBand(b, bp))) return 'mother';
  if (father.some((b) => sameBand(b, bp))) return 'father';
  return undefined;
}

/** What the scene's comparison shows, counted from the bands. */
export function gelCaption(lanes: { label: string; bands: number[] }[], scene: GelScene): string {
  const ref = lanes.find((l) => l.label === scene.compare);
  const tail = 'Shorter pieces run farther toward +.';
  if (!ref) return tail;
  const n = ref.bands.length;
  const has = (l: { bands: number[] }, bp: number) => l.bands.some((b) => sameBand(b, bp));
  if (scene.parents) {
    const [mother, father] = scene.parents;
    const mom = lanes.find((l) => l.label === mother);
    const dad = lanes.find((l) => l.label === father);
    if (!mom || !dad) return tail;
    const from = ref.bands.map((bp) => parentOf(bp, mom.bands, dad.bands));
    const m = from.filter((p) => p === 'mother').length;
    const f = from.filter((p) => p === 'father').length;
    const x = n - m - f;
    const head = `${ref.label}’s ${n} bands: ${m} match ${mother}, ${f} match ${father}`;
    return x > 0
      ? `${head}, and ${x} match neither, so ${father} is ruled out as the biological father.`
      : `${head}: every band comes from one of them, so ${father} could be the father.`;
  }
  const lines = lanes
    .filter((l) => l.label !== ref.label && (scene.lit ?? []).includes(l.label))
    .map((l) => {
      const k = ref.bands.filter((bp) => has(l, bp)).length;
      const same = k === n && l.bands.length === n;
      return same
        ? `${l.label} matches ${ref.label} in all ${n} bands.`
        : `${l.label} matches ${ref.label} in ${k} of ${n} bands.`;
    });
  return [...lines, tail].join(' ');
}
