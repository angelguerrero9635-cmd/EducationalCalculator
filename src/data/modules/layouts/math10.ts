/**
 * Grade 10 math layout pages (explore, sort, sequence, observe), by skill in taxonomy order.
 * The calculators are in `../math/10.ts`. Data only: no UI code.
 */
import type { CardPart } from '../typesHs2b';
import type { CardFigure, LayoutDef } from './types';

// ── Card figures: construction and proof stages, marked triangles (H96) ──

type P2 = [number, number];
const RAD = Math.PI / 180;
/** A point `r` from c at `deg` degrees (counterclockwise from right; the box's y is down). */
const polar = (c: P2, r: number, deg: number): P2 => [
  c[0] + r * Math.cos(deg * RAD),
  c[1] - r * Math.sin(deg * RAD),
];
/** A stage's figure: the construction so far, its new step lit. */
const card = (
  points: Record<string, P2>,
  parts: CardPart[],
  lit: string[],
  named: string[],
): CardFigure => ({ kind: 'construction', points, parts, lit, named });

// Perpendicular bisector of AB: equal arcs from A and B cross at P and Q.
const bis = (() => {
  const A: P2 = [20, 55];
  const B: P2 = [80, 55];
  const h = Math.sqrt(40 ** 2 - 30 ** 2);
  return {
    A,
    B,
    P: [50, 55 - h] as P2,
    Q: [50, 55 + h] as P2,
    R: polar(A, 40, 35),
    M: [50, 55] as P2,
  };
})();
const bisStage = (k: number): CardFigure => {
  const parts: CardPart[] = [{ segment: 'AB' }];
  if (k === 1) parts.push({ segment: 'AR', dashed: true, id: 'open' });
  if (k >= 2) parts.push({ compass: 'A', from: 'P', to: 'Q', id: 'arcA' });
  if (k >= 3) parts.push({ compass: 'B', from: 'Q', to: 'P', id: 'arcB' });
  if (k >= 4) parts.push({ dot: 'P', id: 'p' }, { dot: 'Q', id: 'q' });
  if (k >= 5)
    parts.push(
      { line: 'PQ', id: 'pq' },
      { right: 'BMP', id: 'right' },
      { ticks: 'AM', count: 1, id: 't1' },
      { ticks: 'MB', count: 1, id: 't2' },
    );
  const lit = [[], ['open'], ['arcA'], ['arcB'], ['p', 'q'], ['pq', 'right', 't1', 't2']][k]!;
  return card(bis, parts, lit, k >= 4 ? ['A', 'B', 'P', 'Q'] : ['A', 'B']);
};

// Angle bisector of ∠AOB: an arc from O, equal arcs from A and B crossing at P.
const ang = (() => {
  const O: P2 = [12, 84];
  const half = 27.5;
  const [r1, r2] = [40, 30];
  const c = Math.cos(half * RAD);
  const d = r1 * c + Math.sqrt((r1 * c) ** 2 - (r1 * r1 - r2 * r2));
  return {
    O,
    X: polar(O, 86, 0),
    Y: polar(O, 86, 55),
    A: polar(O, r1, 0),
    B: polar(O, r1, 55),
    P: polar(O, d, half),
  };
})();
const angStage = (k: number): CardFigure => {
  const parts: CardPart[] = [
    { ray: 'OX' },
    { ray: 'OY' },
    { compass: 'O', from: 'A', to: 'B', id: 'arcO' },
  ];
  if (k >= 2) parts.push({ compass: 'A', through: 'P', span: 44, id: 'arcA' });
  if (k >= 3)
    parts.push({ compass: 'B', through: 'P', span: 44, id: 'arcB' }, { dot: 'P', id: 'p' });
  if (k >= 4)
    parts.push(
      { ray: 'OP', id: 'op' },
      { arcs: 'AOP', count: 1, id: 'h1' },
      { arcs: 'POB', count: 1, id: 'h2' },
    );
  const lit = [[], ['arcO'], ['arcA'], ['arcB', 'p'], ['op', 'h1', 'h2']][k]!;
  return card(ang, parts, lit, k >= 3 ? ['O', 'A', 'B', 'P'] : ['O', 'A', 'B']);
};

// The center of a circle: the perpendicular bisectors of two chords cross at it.
const ctr = (() => {
  const O: P2 = [50, 50];
  const R = 36;
  const [K, L, M, N] = [150, 250, 285, 25].map((d) => polar(O, R, d)) as [P2, P2, P2, P2];
  /** The two crossings of equal arcs from a chord's ends (compass 0.6 of the chord). */
  const cross = (p: P2, q: P2): [P2, P2] => {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const m: P2 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const t = Math.sqrt((0.6 * len) ** 2 - (len / 2) ** 2);
    const n: P2 = [-(q[1] - p[1]) / len, (q[0] - p[0]) / len];
    return [
      [m[0] + n[0] * t, m[1] + n[1] * t],
      [m[0] - n[0] * t, m[1] - n[1] * t],
    ];
  };
  const [E, F] = cross(K, L);
  const [G, H] = cross(M, N);
  return { O, K, L, M, N, E, F, G, H, T: polar(O, R, 90) };
})();
const ctrStage = (k: number): CardFigure => {
  const parts: CardPart[] = [
    { circle: 'O', through: 'K' },
    { segment: 'KL', id: 'c1' },
    { segment: 'MN', id: 'c2' },
  ];
  if (k >= 2)
    parts.push(
      { compass: 'K', from: 'E', to: 'F', id: 'a1' },
      { compass: 'L', from: 'E', to: 'F', id: 'a2' },
      { compass: 'M', from: 'G', to: 'H', id: 'a3' },
      { compass: 'N', from: 'G', to: 'H', id: 'a4' },
      { line: 'EF', id: 'b1' },
      { line: 'GH', id: 'b2' },
    );
  if (k >= 3) parts.push({ dot: 'O', id: 'o' });
  if (k >= 4)
    parts.push(
      { segment: 'OK', dashed: true, id: 'r1' },
      { segment: 'OM', dashed: true, id: 'r2' },
      { segment: 'OT', dashed: true, id: 'r3' },
      { ticks: 'OK', count: 1, id: 'k1' },
      { ticks: 'OM', count: 1, id: 'k2' },
      { ticks: 'OT', count: 1, id: 'k3' },
    );
  const lit = [
    [],
    ['c1', 'c2'],
    ['a1', 'a2', 'a3', 'a4', 'b1', 'b2'],
    ['o'],
    ['r1', 'r2', 'r3', 'k1', 'k2', 'k3'],
  ][k]!;
  return card(ctr, parts, lit, k >= 3 ? ['O'] : []);
};

// Vertical angles: lines ℓ (AC) and m (BD) cross at X; angles 1, 2, 3 in a row.
const vert: Record<string, P2> = { A: [6, 68], C: [94, 32], B: [20, 12], D: [80, 88], X: [50, 50] };
const vertStage = (k: number): CardFigure => {
  const parts: CardPart[] = [
    { line: 'AC', id: 'l' },
    { line: 'BD', id: 'm' },
    { text: 'ℓ', at: 'C', id: 'l' },
    { text: 'm', at: 'D', id: 'm' },
    { text: '1', at: 'AXB', id: 'a1' },
    { text: '2', at: 'BXC', id: 'a2' },
    { text: '3', at: 'CXD', id: 'a3' },
  ];
  if (k >= 5) parts.push({ arcs: 'AXB', count: 1, id: 'a1' }, { arcs: 'CXD', count: 1, id: 'a3' });
  const lit = [[], ['l', 'm'], ['a1', 'a2', 'a3'], ['a2'], ['a1', 'a3'], ['a1', 'a3']][k]!;
  return card(vert, parts, lit, []);
};

// The triangle sum: line ℓ (DE) through B parallel to AC; ∠1 and ∠3 beside ∠B.
const tsum: Record<string, P2> = { A: [10, 86], C: [92, 86], B: [40, 26], D: [4, 26], E: [96, 26] };
const tsumStage = (k: number): CardFigure => {
  const parts: CardPart[] = [
    { segment: 'AB' },
    { segment: 'BC' },
    { segment: 'CA' },
    { line: 'DE', id: 'l' },
    { text: '1', at: 'DBA', id: 't' },
    { text: '3', at: 'CBE', id: 't' },
  ];
  if (k >= 2)
    parts.push(
      { arcs: 'BAC', count: 1, id: 'x' },
      { arcs: 'DBA', count: 1, id: 'x' },
      { arcs: 'BCA', count: 2, id: 'x' },
      { arcs: 'CBE', count: 2, id: 'x' },
    );
  if (k >= 3) parts.push({ arcs: 'ABC', count: 3, id: 'b' });
  const lit = [[], ['l'], ['x'], ['t', 'b']][k]!;
  return card(tsum, parts, lit, ['A', 'B', 'C']);
};

// M is the midpoint of PQ and of RS, so △PMR ≅ △QMS and PR ≅ QS.
const mid: Record<string, P2> = { P: [12, 20], Q: [88, 80], M: [50, 50], R: [16, 86], S: [84, 14] };
const midStage = (k: number): CardFigure => {
  const parts: CardPart[] = [];
  if (k >= 3) parts.push({ fill: 'PMR', id: 'f' }, { fill: 'QMS', id: 'f' });
  parts.push(
    { segment: 'PQ' },
    { segment: 'RS' },
    { segment: 'PR', id: 'c' },
    { segment: 'QS', id: 'c' },
    { dot: 'M', id: 'g' },
  );
  if (k >= 2)
    parts.push(
      { ticks: 'PM', count: 1, id: 'm' },
      { ticks: 'MQ', count: 1, id: 'm' },
      { ticks: 'RM', count: 2, id: 'm' },
      { ticks: 'MS', count: 2, id: 'm' },
    );
  if (k >= 3) parts.push({ arcs: 'PMR', count: 1, id: 'v' }, { arcs: 'QMS', count: 1, id: 'v' });
  if (k >= 4) parts.push({ ticks: 'PR', count: 3, id: 'c' }, { ticks: 'QS', count: 3, id: 'c' });
  const lit = [[], ['g'], ['m'], ['v', 'f'], ['c']][k]!;
  return card(mid, parts, lit, ['P', 'Q', 'M', 'R', 'S']);
};

/** A triangle by its sides BC, CA, AB. */
type Sides = [number, number, number];
/** Side BC from AB = c, CA = b and the angle A between them (law of cosines). */
const opposite = (A: number, b: number, c: number) =>
  Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * RAD));
/**
 * The two triangles SSA allows: angle A, AB = c and BC = a (shorter than c) fit two lengths of
 * CA, so two different triangles share those three parts.
 */
const ssa = (A: number, c: number, a: number): [Sides, Sides] => {
  const along = c * Math.cos(A * RAD);
  const r = Math.sqrt(a * a - (c * Math.sin(A * RAD)) ** 2);
  return [
    [a, along + r, c],
    [a, along - r, c],
  ];
};
const [ssaLong, ssaShort] = ssa(40, 5, 4);
const scaled = (t: Sides, k: number): Sides => [t[0] * k, t[1] * k, t[2] * k];
const sasFirst: Sides = [opposite(50, 6, 8), 6, 8];
/** Two copies of one triangle, the second mirrored, with the marks the card names. */
const twin = (
  t: Sides,
  marks: Omit<Extract<CardFigure, { kind: 'markedTriangles' }>, 'kind' | 'triangles'>,
): CardFigure => ({
  kind: 'markedTriangles',
  triangles: [t, t],
  mirror: true,
  ...marks,
});

// ── Constructions (G-CO.1, G-CO.12, G-CO.13) ──
const CONSTRUCTIONS: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.constructions~bisector-steps',
    title: 'Construct a perpendicular bisector',
    use: 'Use this for “What is the next step in constructing the perpendicular bisector of AB?”',
    assumptions: [
      'Only a compass and a straightedge: no ruler marks and no protractor.',
      'Every point where the arcs cross is the same distance from A and from B.',
      'The line through two such points is the perpendicular bisector.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Open the compass to more than half of AB', figure: bisStage(1) },
      { label: 'Draw an arc from A across the segment', figure: bisStage(2) },
      { label: 'Keep the same opening and draw an arc from B', figure: bisStage(3) },
      { label: 'Mark where the two arcs cross, above and below', figure: bisStage(4) },
      { label: 'Draw the line through the two crossings', figure: bisStage(5) },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.constructions~angle-bisector-steps',
    title: 'Bisect an angle',
    use: 'Use this for “Put the steps for bisecting ∠AOB with a compass in order.”',
    assumptions: [
      'The first arc makes OA = OB; the two equal arcs from A and B make AP = BP.',
      'So △AOP ≅ △BOP by SSS, and ray OP splits the angle into two equal halves.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Draw an arc from O that crosses both sides, at A and B', figure: angStage(1) },
      { label: 'From A, draw an arc inside the angle', figure: angStage(2) },
      {
        label: 'With the same opening, draw an arc from B that crosses it at P',
        figure: angStage(3),
      },
      { label: 'Draw ray OP', figure: angStage(4) },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.constructions~angle-bisector-facts',
    title: 'What the angle bisector construction guarantees',
    use: 'Use this for “After bisecting ∠AOB with a compass, which statements must be true?”',
    assumptions: [
      'The first arc from O cuts the sides at A and B; the equal arcs from A and B cross at P.',
      'Only what the equal compass openings make equal is guaranteed.',
    ],
    question: 'Is the statement always true after the construction?',
    bins: [
      {
        id: 'always',
        label: 'Always true',
        why: 'The compass openings make it so, whatever the angle.',
      },
      {
        id: 'not',
        label: 'Not always true',
        why: 'It depends on the angle or on how wide the compass was opened.',
      },
    ],
    cards: [
      { label: 'OA = OB', bin: 'always' },
      { label: 'AP = BP', bin: 'always' },
      { label: 'm∠AOP = m∠BOP', bin: 'always' },
      { label: '△AOP ≅ △BOP', bin: 'always' },
      { label: 'AB = BP', bin: 'not' },
      { label: 'OB = BP', bin: 'not' },
      { label: 'OP = AB', bin: 'not' },
      { label: '∠AOB is a right angle', bin: 'not' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.constructions~find-center',
    title: 'Find the center of a circle',
    use: 'Use this for “How can you find the center of a circle with a compass and straightedge?”',
    assumptions: [
      'The perpendicular bisector of any chord passes through the center.',
      'Two bisectors that aren’t parallel cross at exactly one point: the center.',
    ],
    question: 'Put the steps in order, first step first.',
    stages: [
      { label: 'Draw two chords that aren’t parallel', figure: ctrStage(1) },
      { label: 'Construct the perpendicular bisector of each chord', figure: ctrStage(2) },
      { label: 'Mark where the two bisectors cross: the center', figure: ctrStage(3) },
      {
        label: 'Check: the center is the same distance from every point on the circle',
        figure: ctrStage(4),
      },
    ],
  },
];

// ── Reasoning and proof (G-CO.9, G-CO.10) ──
const PROOFS: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.proofs',
    assumptions: [
      'Each line of a proof is a statement and its reason: a given, a definition, a postulate or a theorem proved before.',
      'A line can only use lines above it.',
      'Linear pairs are two angles that make a straight line: they add to 180°.',
    ],
    question: 'Put the proof that vertical angles are congruent in order.',
    stages: [
      { label: 'Lines ℓ and m cross, making ∠1, ∠2 and ∠3 in a row (Given)', figure: vertStage(1) },
      {
        label: 'm∠1 + m∠2 = 180° and m∠2 + m∠3 = 180° (Linear pairs are supplementary)',
        figure: vertStage(2),
      },
      { label: 'm∠1 + m∠2 = m∠2 + m∠3 (Substitution)', figure: vertStage(3) },
      { label: 'm∠1 = m∠3 (Subtraction Property of Equality)', figure: vertStage(4) },
      { label: '∠1 ≅ ∠3 (Definition of congruent angles)', figure: vertStage(5) },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.proofs~conditional',
    title: 'Conditional, converse, inverse, contrapositive',
    use: 'Use this for “Write the converse of ‘If two angles are vertical, then they are congruent.’ Is it true?”',
    assumptions: [
      'Converse: swap the if and the then. Inverse: say “not” to both. Contrapositive: do both.',
      'A statement and its contrapositive are true together; so are the converse and the inverse.',
      'One counterexample is enough to show a statement is false.',
    ],
    question: 'Is the statement always true, or does it have a counterexample?',
    bins: [
      { id: 'true', label: 'Always true', why: 'No example breaks it.' },
      {
        id: 'false',
        label: 'Has a counterexample',
        why: 'An example meets the if part but not the then part.',
      },
    ],
    cards: [
      { label: 'If two angles are vertical, then they are congruent', bin: 'true' },
      { label: 'If two angles are congruent, then they are vertical', bin: 'false' },
      { label: 'If two angles are not vertical, then they are not congruent', bin: 'false' },
      { label: 'If two angles are not congruent, then they are not vertical', bin: 'true' },
      { label: 'If a figure is a square, then it has four right angles', bin: 'true' },
      { label: 'If a figure has four right angles, then it is a square', bin: 'false' },
      {
        label: 'If a figure is not a square, then it doesn’t have four right angles',
        bin: 'false',
      },
      {
        label: 'If a figure doesn’t have four right angles, then it is not a square',
        bin: 'true',
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.proofs~reasoning',
    title: 'Inductive or deductive?',
    use: 'Use this for “Is this conclusion reached by inductive or deductive reasoning?”',
    assumptions: [
      'Inductive reasoning sees a pattern in examples and guesses a rule: a conjecture, not yet proved.',
      'Deductive reasoning starts from facts, definitions and rules already proved, so its conclusion must be true.',
      'A proof is deductive; one counterexample is enough to break an inductive guess.',
    ],
    question: 'Which kind of reasoning reached the conclusion?',
    bins: [
      {
        id: 'inductive',
        label: 'Inductive (a pattern)',
        why: 'It generalizes from the examples seen, so it could still fail.',
      },
      {
        id: 'deductive',
        label: 'Deductive (from facts and rules)',
        why: 'Each step follows from a fact or rule, so the conclusion must hold.',
      },
    ],
    cards: [
      {
        label:
          'The angles of the five triangles Mia measured added to 180°, so every triangle’s do',
        bin: 'inductive',
      },
      { label: '1, 4, 9, 16 are squares, so the next number in the list is 25', bin: 'inductive' },
      {
        label: 'The bus was late the last four Mondays, so it will be late next Monday',
        bin: 'inductive',
      },
      {
        label: 'Every odd number Leo tried, times itself, was odd, so every odd square is odd',
        bin: 'inductive',
      },
      {
        label: 'Vertical angles are congruent and ∠1 and ∠3 are vertical, so ∠1 ≅ ∠3',
        bin: 'deductive',
      },
      {
        label: 'A square is a rectangle and ABCD is a square, so ABCD is a rectangle',
        bin: 'deductive',
      },
      { label: '2x + 3 = 11, so 2x = 8 (take 3 from both sides) and x = 4', bin: 'deductive' },
      {
        label:
          'The angles of a triangle add to 180° and two of them are 50° and 60°, so the third is 70°',
        bin: 'deductive',
      },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.proofs~algebraic-proof',
    title: 'Reasons in an algebraic proof',
    use: 'Use this for “Solve 2(x − 3) = 14 and give a reason for each step.”',
    assumptions: [
      'Each step of solving an equation is a property of equality or of numbers.',
      'Doing the same to both sides keeps them equal.',
    ],
    question: 'Put the steps of the proof in order.',
    stages: [
      { label: '2(x − 3) = 14 (Given)' },
      { label: '2x − 6 = 14 (Distributive Property)' },
      { label: '2x = 20 (Addition Property of Equality)' },
      { label: 'x = 10 (Division Property of Equality)' },
    ],
  },
];

// ── Parallel and perpendicular lines (G-CO.9, G-GPE.5) ──
const PARALLEL_LINES: LayoutDef[] = [
  {
    kind: 'sequence',
    id: 'm.10.parallel-lines~triangle-sum-proof',
    title: 'Why a triangle’s angles add to 180°',
    use: 'Use this for “Prove that the angles of a triangle add to 180°.”',
    assumptions: [
      'Through a point not on a line there is exactly one parallel line (the Parallel Postulate).',
      'Parallel lines make alternate interior angles congruent.',
      'Angles that make a straight line add to 180°.',
    ],
    question: 'Put the proof in order.',
    stages: [
      { label: 'Draw line ℓ through B parallel to AC (Parallel Postulate)', figure: tsumStage(1) },
      { label: '∠1 ≅ ∠A and ∠3 ≅ ∠C (Alternate interior angles)', figure: tsumStage(2) },
      {
        label:
          'm∠A + m∠B + m∠C = m∠1 + m∠B + m∠3 = 180° (Substitution; ∠1, ∠B and ∠3 make a straight angle)',
        figure: tsumStage(3),
      },
    ],
  },
];

// ── Rigid motions (G-CO.2–6) ──
const RIGID_MOTIONS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.rigid-motions~which-motion',
    title: 'Which motion is the rule?',
    use: 'Use this for “Is (x, y) → (2x, 2y) a rigid motion? Which move is (x, y) → (−y, x)?”',
    assumptions: [
      'A rigid motion keeps every length and every angle.',
      'Adding to x or y slides; changing one sign, or swapping x and y, flips; (−y, x) and (−x, −y) turn.',
      'Multiplying a coordinate by a number other than 1 or −1 stretches: not rigid.',
    ],
    question: 'Which motion does the rule make?',
    bins: [
      { id: 'translate', label: 'Translation', why: 'Every point slides the same way.' },
      { id: 'reflect', label: 'Reflection', why: 'Every point flips across a line.' },
      { id: 'rotate', label: 'Rotation', why: 'Every point turns about the origin.' },
      { id: 'not', label: 'Not rigid', why: 'Lengths change, so the image isn’t congruent.' },
    ],
    cards: [
      { label: '(x, y) → (x + 4, y − 1)', bin: 'translate' },
      { label: '(x, y) → (x − 2, y)', bin: 'translate' },
      { label: '(x, y) → (x, −y)', bin: 'reflect' },
      { label: '(x, y) → (y, x)', bin: 'reflect' },
      { label: '(x, y) → (−y, x)', bin: 'rotate' },
      { label: '(x, y) → (−x, −y)', bin: 'rotate' },
      { label: '(x, y) → (2x, 2y)', bin: 'not' },
      { label: '(x, y) → (x, 3y)', bin: 'not' },
    ],
  },
];

// ── Congruent triangles (G-CO.7, G-CO.8, G-SRT.5) ──
const CONGRUENCE: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.congruence',
    assumptions: [
      'SSS, SAS, ASA and AAS each prove two triangles congruent; HL does for right triangles.',
      'In SAS and ASA the angle or side is between the other two parts.',
      'SSA and AAA don’t prove congruence: two different triangles can match those parts.',
    ],
    question: 'Which test proves △ABC ≅ △DEF?',
    bins: [
      { id: 'sss', label: 'SSS', why: 'Three pairs of sides are congruent.' },
      { id: 'sas', label: 'SAS', why: 'Two sides and the angle between them.' },
      { id: 'asa', label: 'ASA', why: 'Two angles and the side between them.' },
      { id: 'aas', label: 'AAS', why: 'Two angles and a side not between them.' },
      { id: 'hl', label: 'HL', why: 'Right triangles with the hypotenuse and a leg congruent.' },
      { id: 'none', label: 'Not enough', why: 'Two different triangles fit these parts.' },
    ],
    cards: [
      {
        label: 'AB = DE, BC = EF, CA = FD',
        bin: 'sss',
        figure: twin([6, 5, 4], { ticks: { a: 1, b: 2, c: 3 } }),
      },
      {
        label: 'AC = DF, CB = FE, BA = ED',
        bin: 'sss',
        figure: twin([5, 4, 6], { ticks: { b: 1, a: 2, c: 3 } }),
      },
      {
        label: 'AB = DE, m∠B = m∠E, BC = EF',
        bin: 'sas',
        figure: twin([6, 5, 4], { ticks: { c: 1, a: 2 }, arcs: { B: 1 } }),
      },
      {
        label: 'AC = DF, m∠C = m∠F, CB = FE',
        bin: 'sas',
        figure: twin([5, 6, 4], { ticks: { b: 1, a: 2 }, arcs: { C: 1 } }),
      },
      {
        label: 'm∠A = m∠D, AB = DE, m∠B = m∠E',
        bin: 'asa',
        figure: twin([5, 6, 4], { ticks: { c: 1 }, arcs: { A: 1, B: 2 } }),
      },
      {
        label: 'm∠B = m∠E, BC = EF, m∠C = m∠F',
        bin: 'asa',
        figure: twin([6, 4, 5], { ticks: { a: 1 }, arcs: { B: 1, C: 2 } }),
      },
      {
        label: 'm∠A = m∠D, m∠B = m∠E, BC = EF',
        bin: 'aas',
        figure: twin([5, 6, 4], { ticks: { a: 1 }, arcs: { A: 1, B: 2 } }),
      },
      {
        label: 'm∠B = m∠E, m∠C = m∠F, AB = DE',
        bin: 'aas',
        figure: twin([6, 4, 5], { ticks: { c: 1 }, arcs: { B: 1, C: 2 } }),
      },
      {
        label: 'Right angles at C and F, AB = DE, AC = DF',
        bin: 'hl',
        figure: twin([3, 4, 5], { right: ['C'], ticks: { c: 1, b: 2 } }),
      },
      {
        label: 'Right angles at B and E, AC = DF, BC = EF',
        bin: 'hl',
        figure: twin([3, 5, 4], { right: ['B'], ticks: { b: 1, a: 2 } }),
      },
      {
        label: 'AB = DE, BC = EF, m∠A = m∠D',
        bin: 'none',
        figure: {
          kind: 'markedTriangles',
          triangles: [ssaLong, ssaShort],
          ticks: { c: 1, a: 2 },
          arcs: { A: 1 },
        },
      },
      {
        label: 'All three angles equal',
        bin: 'none',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [4, 5, 6],
            [6, 7.5, 9],
          ],
          arcs: { A: 1, B: 2, C: 3 },
        },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.congruence~correspondence',
    title: '△ABC ≅ △KLM: must it be true?',
    use: 'Use this for “△ABC ≅ △KLM. Which parts must be congruent?”',
    assumptions: [
      'The order of the letters pairs the parts: A with K, B with L, C with M.',
      'A side pairs with the side whose letters sit in the same places: BC with LM.',
    ],
    question: 'Must the statement be true?',
    bins: [
      { id: 'must', label: 'Must be true', why: 'The letters sit in matching places.' },
      { id: 'not', label: 'Not always', why: 'The letters don’t match in order.' },
    ],
    cards: [
      { label: '∠B ≅ ∠L', bin: 'must' },
      { label: 'AC ≅ KM', bin: 'must' },
      { label: 'AB ≅ KL', bin: 'must' },
      { label: '∠C ≅ ∠M', bin: 'must' },
      { label: 'BC ≅ KL', bin: 'not' },
      { label: '∠A ≅ ∠M', bin: 'not' },
      { label: 'AB ≅ LM', bin: 'not' },
      { label: '∠B ≅ ∠K', bin: 'not' },
    ],
  },
  {
    kind: 'sequence',
    id: 'm.10.congruence~cpctc-proof',
    title: 'Prove two segments congruent',
    use: 'Use this for “M is the midpoint of PQ and of RS. Prove PR ≅ QS.”',
    assumptions: [
      'Given: M is the midpoint of PQ and of RS. Prove: PR ≅ QS.',
      'Prove two triangles congruent first; then their corresponding parts are congruent.',
    ],
    question: 'Put the proof in order.',
    stages: [
      { label: 'M is the midpoint of PQ and of RS (Given)', figure: midStage(1) },
      { label: 'PM ≅ QM and RM ≅ SM (Definition of midpoint)', figure: midStage(2) },
      { label: '△PMR ≅ △QMS (SAS, with vertical angles ∠PMR ≅ ∠QMS)', figure: midStage(3) },
      {
        label: 'PR ≅ QS (Corresponding parts of congruent triangles are congruent)',
        figure: midStage(4),
      },
    ],
  },
];

// ── Relationships within triangles (G-CO.10, G-C.3) ──
const TRIANGLE_RELATIONSHIPS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.triangle-relationships~which-center',
    title: 'Which center?',
    use: 'Use this for “Which point of a triangle is the same distance from all three sides?”',
    assumptions: [
      'Each center is where three special lines of the triangle meet.',
      'Medians give the centroid, angle bisectors the incenter, perpendicular bisectors the circumcenter, altitudes the orthocenter.',
    ],
    question: 'Which center is it?',
    bins: [
      { id: 'centroid', label: 'Centroid', why: 'Where the medians meet: the balance point.' },
      { id: 'incenter', label: 'Incenter', why: 'Where the angle bisectors meet.' },
      { id: 'circumcenter', label: 'Circumcenter', why: 'Where the perpendicular bisectors meet.' },
      { id: 'orthocenter', label: 'Orthocenter', why: 'Where the altitudes meet.' },
    ],
    cards: [
      { label: 'Medians meet', bin: 'centroid' },
      { label: 'Cuts each median 2:1 from the corner', bin: 'centroid' },
      { label: 'Balance point', bin: 'centroid' },
      { label: 'Angle bisectors meet', bin: 'incenter' },
      { label: 'Same distance from all three sides', bin: 'incenter' },
      { label: 'Center of the circle inside touching each side', bin: 'incenter' },
      { label: 'Perpendicular bisectors meet', bin: 'circumcenter' },
      { label: 'Same distance from all three corners', bin: 'circumcenter' },
      { label: 'Center of the circle through the corners', bin: 'circumcenter' },
      { label: 'Altitudes meet', bin: 'orthocenter' },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.triangle-relationships~angle-side-order',
    title: 'Which angle is largest?',
    use: 'Use this for “A triangle has sides 5, 7 and 9. Which angle is the largest? The smallest?”',
    assumptions: [
      'In a triangle, the largest angle is across from the longest side.',
      'The smallest angle is across from the shortest side, and the middle one across from the middle side.',
      'It works the other way too: the longest side is across from the largest angle.',
    ],
    question: 'Where does the angle rank in its triangle?',
    bins: [
      { id: 'largest', label: 'Largest angle', why: 'It is across from the longest side.' },
      { id: 'middle', label: 'Middle angle', why: 'It is across from the middle side.' },
      { id: 'smallest', label: 'Smallest angle', why: 'It is across from the shortest side.' },
    ],
    cards: [
      { label: 'Sides 5, 7 and 9: the angle across from 9', bin: 'largest' },
      { label: 'Sides 5, 7 and 9: the angle across from 7', bin: 'middle' },
      { label: 'Sides 5, 7 and 9: the angle across from 5', bin: 'smallest' },
      { label: 'Sides 4, 10 and 8: the angle across from 10', bin: 'largest' },
      { label: 'Sides 4, 10 and 8: the angle across from 8', bin: 'middle' },
      { label: 'Sides 4, 10 and 8: the angle across from 4', bin: 'smallest' },
    ],
  },
];

// ── Quadrilaterals (G-CO.11) ──
const QUADRILATERALS: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.quadrilaterals~name-it',
    title: 'Name it exactly',
    use: 'Use this for “A parallelogram has perpendicular diagonals. What is the most exact name for it?”',
    assumptions: [
      'Give the most exact name: a square is also a rectangle and a rhombus, but “square” says more.',
      'A rectangle is a parallelogram with a right angle; a rhombus is one with four equal sides.',
    ],
    question: 'What is the most exact name?',
    bins: [
      {
        id: 'parallelogram',
        label: 'Parallelogram',
        why: 'Both pairs of opposite sides parallel, nothing more.',
      },
      { id: 'rectangle', label: 'Rectangle', why: 'A parallelogram with right angles.' },
      { id: 'rhombus', label: 'Rhombus', why: 'A parallelogram with four equal sides.' },
      { id: 'square', label: 'Square', why: 'Both a rectangle and a rhombus.' },
      { id: 'trapezoid', label: 'Trapezoid', why: 'Exactly one pair of parallel sides.' },
      { id: 'kite', label: 'Kite', why: 'Two pairs of equal sides next to each other.' },
    ],
    cards: [
      { label: 'Both pairs of opposite sides parallel', bin: 'parallelogram' },
      { label: 'A parallelogram with a right angle', bin: 'rectangle' },
      { label: 'A parallelogram with equal diagonals', bin: 'rectangle' },
      { label: 'A parallelogram with perpendicular diagonals', bin: 'rhombus' },
      { label: 'A parallelogram whose diagonals bisect its angles', bin: 'rhombus' },
      { label: 'A rectangle with two equal adjacent sides', bin: 'square' },
      { label: 'A rhombus with a right angle', bin: 'square' },
      { label: 'Exactly one pair of parallel sides', bin: 'trapezoid' },
      { label: 'Two pairs of equal adjacent sides, not all four equal', bin: 'kite' },
    ],
  },
];

// ── Similarity (G-SRT.2–5) ──
const SIMILARITY: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.similarity~similar-or-not',
    title: 'Similar, and by which test?',
    use: 'Use this for “Which pairs of triangles must be similar, and why?”',
    assumptions: [
      'AA: two pairs of equal angles. SSS: all three side ratios equal.',
      'SAS: two side ratios equal and the angles between those sides equal.',
      'Anything less is not enough: the triangles might not match.',
    ],
    question: 'Must the triangles be similar? By which test?',
    bins: [
      {
        id: 'aa',
        label: 'Similar by AA',
        why: 'Two pairs of equal angles fix the third pair too.',
      },
      {
        id: 'sss',
        label: 'Similar by SSS',
        why: 'Every side of one is the same multiple of its match.',
      },
      {
        id: 'sas',
        label: 'Similar by SAS',
        why: 'Two sides in the same ratio with equal angles between them.',
      },
      {
        id: 'not',
        label: 'Not always similar',
        why: 'The facts given fit triangles of different shapes.',
      },
    ],
    cards: [
      {
        label: 'm∠A = m∠D and m∠B = m∠E',
        bin: 'aa',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [4, 5, 6],
            [6, 7.5, 9],
          ],
          arcs: { A: 1, B: 2 },
        },
      },
      {
        label: 'Two equilateral triangles',
        bin: 'aa',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [3, 3, 3],
            [5, 5, 5],
          ],
          arcs: { A: 1, B: 1, C: 1 },
        },
      },
      {
        label: 'Sides 3, 4, 6 and 4.5, 6, 9',
        bin: 'sss',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [3, 4, 6],
            [4.5, 6, 9],
          ],
          lengths: true,
        },
      },
      {
        label: 'AB/DE = AC/DF = 2 and m∠A = m∠D',
        bin: 'sas',
        figure: {
          kind: 'markedTriangles',
          triangles: [sasFirst, scaled(sasFirst, 0.5)],
          lengths: ['b', 'c'],
          arcs: { A: 1 },
        },
      },
      {
        label: 'Two isosceles triangles',
        bin: 'not',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [5, 5, 3],
            [4, 6, 6],
          ],
        },
      },
      {
        label: 'Two right triangles',
        bin: 'not',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [3, 4, 5],
            [5, 12, 13],
          ],
          right: ['C'],
        },
      },
      {
        label: 'Sides 4, 6, 8 and 6, 9, 13',
        bin: 'not',
        figure: {
          kind: 'markedTriangles',
          triangles: [
            [4, 6, 8],
            [6, 9, 13],
          ],
          lengths: true,
        },
      },
      {
        label: 'AB/DE = BC/EF and m∠A = m∠D',
        bin: 'not',
        figure: {
          kind: 'markedTriangles',
          triangles: [ssaLong, scaled(ssaShort, 1.5)],
          arcs: { A: 1 },
        },
      },
    ],
  },
];

// ── Surface area, volume and cross sections (G-GMD.4) ──
const VOLUME: LayoutDef[] = [
  {
    kind: 'sort',
    id: 'm.10.volume-derivations~cross-section-shapes',
    title: 'What shape is the cut?',
    use: 'Use this for “A plane cuts a cube through three corners. What shape is the cross section?”',
    assumptions: [
      'A cross section is the flat shape where a plane cuts a solid.',
      'Its number of sides is the number of faces the plane crosses.',
      'A curved surface cut by a plane gives a curved edge.',
    ],
    question: 'What is the most exact name for the cross section?',
    bins: [
      {
        id: 'circle',
        label: 'Circle',
        why: 'A level cut of a round solid, or any cut of a sphere.',
      },
      {
        id: 'ellipse',
        label: 'Ellipse',
        why: 'A slanted cut all the way round a cone or cylinder.',
      },
      { id: 'triangle', label: 'Triangle', why: 'The plane crosses three faces.' },
      { id: 'square', label: 'Square', why: 'A level cut of a solid with a square base.' },
      { id: 'rectangle', label: 'Rectangle', why: 'Straight down, parallel to the height.' },
      { id: 'pentagon', label: 'Pentagon', why: 'The plane crosses five faces.' },
    ],
    cards: [
      {
        label: 'Cylinder cut level',
        bin: 'circle',
        figure: { kind: 'solidCut', solid: 'cylinder', cut: 'level' },
      },
      {
        label: 'Sphere cut by any plane',
        bin: 'circle',
        figure: { kind: 'solidCut', solid: 'sphere', cut: 'slant' },
      },
      {
        label: 'Cone cut on a slant, missing the base',
        bin: 'ellipse',
        figure: { kind: 'solidCut', solid: 'cone', cut: 'slant' },
      },
      {
        label: 'Cylinder cut on a slant, missing both bases',
        bin: 'ellipse',
        figure: { kind: 'solidCut', solid: 'cylinder', cut: 'slant' },
      },
      {
        label: 'Cone cut straight down through its tip',
        bin: 'triangle',
        figure: { kind: 'solidCut', solid: 'cone', cut: 'axis' },
      },
      {
        label: 'Cube cut through the three corners next to one corner',
        bin: 'triangle',
        figure: { kind: 'solidCut', solid: 'cube', cut: 'corners' },
      },
      {
        label: 'Cube cut level',
        bin: 'square',
        figure: { kind: 'solidCut', solid: 'cube', cut: 'level' },
      },
      {
        label: 'Square pyramid cut level',
        bin: 'square',
        figure: { kind: 'solidCut', solid: 'pyramid', cut: 'level' },
      },
      {
        label: 'Cylinder cut straight down through its axis',
        bin: 'rectangle',
        figure: { kind: 'solidCut', solid: 'cylinder', cut: 'axis' },
      },
      {
        label: 'Cube cut straight down through two opposite edges',
        bin: 'rectangle',
        figure: { kind: 'solidCut', solid: 'cube', cut: 'edges' },
      },
      {
        label: 'Cube cut by a plane crossing five of its faces',
        bin: 'pentagon',
        figure: { kind: 'solidCut', solid: 'cube', cut: 'pentagon' },
      },
    ],
  },
  {
    kind: 'sort',
    id: 'm.10.volume-derivations~solids-of-revolution',
    title: 'Turn a shape: which solid?',
    use: 'Use this for “A right triangle is turned about one leg. What solid does it sweep out?”',
    assumptions: [
      'Turning a flat shape all the way round a line sweeps out a solid.',
      'The line it turns about becomes the solid’s axis.',
      'A side on the line stays put; a side parallel to it sweeps a curved surface.',
    ],
    question: 'What solid does the shape sweep out?',
    bins: [
      {
        id: 'cylinder',
        label: 'Cylinder',
        why: 'The side opposite the axis sweeps a tube of one radius.',
      },
      { id: 'cone', label: 'Cone', why: 'A slanted side meets the axis at a point: the tip.' },
      {
        id: 'sphere',
        label: 'Sphere',
        why: 'Every point of the curve is one distance from the center.',
      },
    ],
    cards: [
      { label: 'A rectangle turned about one side', bin: 'cylinder' },
      { label: 'A square turned about a side', bin: 'cylinder' },
      { label: 'A right triangle turned about a leg', bin: 'cone' },
      { label: 'An isosceles triangle turned about its line of symmetry', bin: 'cone' },
      { label: 'A semicircle turned about its diameter', bin: 'sphere' },
      { label: 'A circle turned about a diameter', bin: 'sphere' },
    ],
  },
];

export const MATH_10_LAYOUTS: LayoutDef[] = [
  ...CONSTRUCTIONS,
  ...PROOFS,
  ...PARALLEL_LINES,
  ...RIGID_MOTIONS,
  ...CONGRUENCE,
  ...TRIANGLE_RELATIONSHIPS,
  ...QUADRILATERALS,
  ...SIMILARITY,
  ...VOLUME,
];
