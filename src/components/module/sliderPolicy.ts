import type { ModuleDef, Representation } from '@/data/modules';

/**
 * Which pictures get sliders. A slider earns its place only where sweeping a value teaches
 * something the input boxes can't (a fraction bar filling, an area model growing, a pie
 * resizing) and the picture has no touch control of its own for that value. Pictures with
 * their own handles or taps (a draggable corner or point, a tappable cell or row) and
 * pictures of counts that students type (equal groups, hops of a word problem, a balance)
 * get the input boxes alone. A module can override
 * the kind's default with `sliders: true | false`.
 */
const SLIDER_KINDS = new Set<Representation['kind']>([
  'fractionBars',
  'fractionArea',
  'partition',
  'rectilinear',
  'areaModel',
  'pieChart',
  'unitCubes',
]);

/** Whether this module's page shows a slider row under (or beside) its picture. */
export const showsSliders = (m: ModuleDef): boolean =>
  m.sliders ?? SLIDER_KINDS.has(m.representation.kind);

/** For the docs: the reason a module shows or hides its sliders. */
export const sliderReason = (m: ModuleDef): string =>
  m.sliders !== undefined
    ? `set on the module (${m.sliders ? 'shown' : 'hidden'})`
    : SLIDER_KINDS.has(m.representation.kind)
      ? 'sweeping the value shows the picture change; no touch control of its own'
      : 'the picture has its own handles or taps, or the inputs are enough';
