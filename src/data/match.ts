/**
 * Match a problem's text (typed, pasted or read from a photo on the device) to the page that
 * solves it. Everything runs locally from the pages' own words: titles, use lines, notes,
 * value names and the cards and bins of a sort. The numbers in the problem count too: a page
 * that takes decimals, fractions, percents, money or negatives, or whose ranges fit the
 * numbers, ranks higher; one whose ranges the numbers exceed ranks lower.
 */
import { SKILLS } from '@/data/taxonomy';

import { LAYOUTS, type LayoutDef } from './modules/layouts';
import { MODULES, moduleOwner } from './modules';
import type { ModuleDef } from './modules/types';
import {
  divisionLabel,
  nodeContext,
  normalize,
  pageRoute,
  topicOf,
  type RouteTarget,
} from './selectors';
import CORPUS from './matchCorpus.json';

/**
 * Word weights per skill (or course topic, `<courseId>#<i>`) from openly licensed practice
 * problems (scripts/build-match-corpus.mjs).
 */
const corpus = CORPUS as Record<string, Record<string, number>>;

/** What a page belongs to: a K–12 skill or a college course topic. */
export interface MatchOwner {
  /** The skill id or topic key (`<courseId>#<i>`). */
  id: string;
  title: string;
  /** "Grade 4 · Math", or "Science · Human Geography" for a topic. */
  context: string;
  /** The skill's strand, or the topic's course title. */
  strand: string;
  /** K–12 only: the skill's grade. */
  grade?: string;
}

export interface MatchResult {
  /** The page id: a skill's or topic's main page, or one of its problem types. */
  id: string;
  title: string;
  owner: MatchOwner;
  /** The page's "Use this for …" line, when it has one. */
  use?: string;
  route: RouteTarget;
  score: number;
}

interface Doc {
  id: string;
  owner: MatchOwner;
  title: string;
  use?: string;
  /** Term → weighted count. */
  tf: Map<string, number>;
  length: number;
  decimals: boolean;
  fractions: boolean;
  percent: boolean;
  money: boolean;
  negatives: boolean;
  /** Unit families the page's values use: 'length', 'mass', 'volume', 'time', 'temperature', 'angle'. */
  units: Set<string>;
  /** The biggest number any value accepts, when the page has values. */
  max?: number;
}

const STOP = new Set(
  (
    'a an and are as at be by for from has have how if in into is it its many more much of on ' +
    'or that the their then there these they this to was were what when which will with you ' +
    'your each some use this for find value does do did can about than not all any one two ' +
    'three four five six seven eight nine ten'
  ).split(' '),
);

/** Lowercase words, no punctuation, light stemming (cats → cat, adding → add, added → add). */
export function tokenize(text: string): string[] {
  const words = normalize(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));
  return words.map((w) => {
    if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
    else if (w.length > 5 && w.endsWith('ed')) w = w.slice(0, -2);
    else if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
    return w;
  });
}

const UNIT_FAMILY: Record<string, string> = {
  mm: 'length',
  cm: 'length',
  m: 'length',
  km: 'length',
  in: 'length',
  ft: 'length',
  yd: 'length',
  mi: 'length',
  millimeter: 'length',
  centimeter: 'length',
  meter: 'length',
  kilometer: 'length',
  inch: 'length',
  inche: 'length',
  foot: 'length',
  feet: 'length',
  yard: 'length',
  mile: 'length',
  g: 'mass',
  kg: 'mass',
  mg: 'mass',
  lb: 'mass',
  oz: 'mass',
  gram: 'mass',
  kilogram: 'mass',
  pound: 'mass',
  ounce: 'mass',
  ml: 'volume',
  l: 'volume',
  liter: 'volume',
  milliliter: 'volume',
  cup: 'volume',
  pint: 'volume',
  quart: 'volume',
  gallon: 'volume',
  s: 'time',
  min: 'time',
  h: 'time',
  hr: 'time',
  second: 'time',
  minute: 'time',
  hour: 'time',
  day: 'time',
  week: 'time',
  year: 'time',
  '°c': 'temperature',
  '°f': 'temperature',
  degree: 'angle',
  '°': 'angle',
};

/** What the problem's numbers say about the page it needs. */
export interface NumberFeatures {
  decimals: boolean;
  fractions: boolean;
  percent: boolean;
  money: boolean;
  negatives: boolean;
  units: Set<string>;
  /** The biggest plain number in the problem. */
  max?: number;
  grade?: string;
}

export function numberFeatures(text: string): NumberFeatures {
  const t = text.replace(/−/g, '-');
  const nums = [...t.matchAll(/(?<![\d.])\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g)].map((m) =>
    Number(m[0].replace(/,/g, '')),
  );
  const units = new Set<string>();
  for (const m of t.toLowerCase().matchAll(/\d\s*(°c|°f|°|[a-z]+)\b/g)) {
    const w = m[1]!.replace(/s$/, '');
    const fam = UNIT_FAMILY[w] ?? UNIT_FAMILY[m[1]!];
    if (fam) units.add(fam);
  }
  for (const w of tokenize(t)) {
    const fam = UNIT_FAMILY[w];
    if (fam && w.length > 2) units.add(fam);
  }
  const grade = /\bgrade\s+(k|\d{1,2})\b/i.exec(t)?.[1]?.toUpperCase();
  return {
    decimals: /\d\.\d/.test(t),
    fractions:
      /\d\s*\/\s*\d/.test(t) ||
      /\b(half|halves|third|fourth|quarter|fifth|sixth|eighth|tenth)s?\b/i.test(t),
    percent: /%|\bpercent\b/i.test(t),
    money: /\$|\bcents?\b|\bdollars?\b|¢/.test(t),
    negatives: /(?:^|[\s(])-\d/.test(t) || /\bnegative\b|\bbelow zero\b/i.test(t),
    units,
    max: nums.length ? Math.max(...nums) : undefined,
    grade,
  };
}

const add = (tf: Map<string, number>, text: string | undefined, weight: number) => {
  if (!text) return;
  for (const w of tokenize(text)) tf.set(w, (tf.get(w) ?? 0) + weight);
};

const unitFamilyOf = (unit?: string): string | undefined => {
  if (!unit) return undefined;
  const u = unit.toLowerCase().replace(/[²³]/g, '').replace(/\/.*$/, '');
  return UNIT_FAMILY[u];
};

function docFor(page: ModuleDef | LayoutDef, owner: MatchOwner): Doc {
  const tf = new Map<string, number>();
  const main = !page.id.includes('~');
  const title = main ? owner.title : (page.title ?? page.id);
  add(tf, owner.title, main ? 4 : 1.5);
  add(tf, page.title, 4);
  add(tf, page.use, 3);
  for (const a of page.assumptions) add(tf, a, 1);
  add(tf, owner.strand, 0.5);
  // What the owner's practice problems say, lighter on a problem type so its own words lead.
  for (const [t, w] of Object.entries(corpus[owner.id] ?? {}))
    tf.set(t, (tf.get(t) ?? 0) + w * (main ? 2 : 1));
  const doc: Doc = {
    id: page.id,
    owner,
    title,
    use: page.use,
    tf,
    length: 0,
    decimals: false,
    fractions: false,
    percent: false,
    money: false,
    negatives: false,
    units: new Set(),
  };
  if ('variables' in page) {
    const m = page;
    let max: number | undefined;
    for (const v of m.variables) {
      add(tf, v.name, 2);
      if (!v.integer && v.step !== undefined && v.step < 1) doc.decimals = true;
      if (v.unit === '%') doc.percent = true;
      if (v.unit === '$' || v.unit === '¢') doc.money = true;
      if (v.min !== undefined && v.min < 0) doc.negatives = true;
      const fam = unitFamilyOf(v.unit);
      if (fam) doc.units.add(fam);
      if (v.max !== undefined) max = Math.max(max ?? 0, v.max);
    }
    doc.max = max;
    const text = `${m.equation ?? ''} ${JSON.stringify(m.representation ?? '')}`;
    if (
      /numerator|denominator|fraction/i.test(text) ||
      m.variables.some((v) => /numerator|denominator/i.test(v.name))
    )
      doc.fractions = true;
    if (/percent/i.test(text) || m.variables.some((v) => /percent/i.test(v.name)))
      doc.percent = true;
    if (m.variables.some((v) => /dollar|cent|money|price|cost/i.test(v.name))) doc.money = true;
    if (m.unitSystems?.includes('metric') && doc.units.size === 0) doc.units.add('metric');
  } else {
    const l = page;
    if ('question' in l) add(tf, l.question, 2);
    if ('bins' in l) for (const b of l.bins) add(tf, `${b.label} ${b.why}`, 1);
    if ('cards' in l) for (const c of l.cards) add(tf, c.label, 0.5);
    if ('stages' in l) for (const s of l.stages) add(tf, s.label, 0.7);
    if ('scenes' in l) for (const s of l.scenes) add(tf, `${s.label} ${s.lines.join(' ')}`, 0.7);
    if ('columns' in l) for (const c of l.columns) add(tf, c, 0.7);
    const text = JSON.stringify(l);
    if (/fraction|halves|fourth|third|equal share/i.test(text)) doc.fractions = true;
    if (/percent/i.test(text)) doc.percent = true;
    if (/decimal/i.test(text)) doc.decimals = true;
    if (/negative/i.test(text)) doc.negatives = true;
  }
  let length = 0;
  for (const n of tf.values()) length += n;
  doc.length = length;
  return doc;
}

export interface MatchIndex {
  docs: Doc[];
  idf: Map<string, number>;
  avgLength: number;
}

const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

/** The skill or course topic a page id belongs to, if it is a lesson page. */
function ownerOf(pageId: string): MatchOwner | undefined {
  const id = moduleOwner(pageId);
  const skill = SKILL_BY_ID.get(id);
  if (skill) {
    const context = nodeContext(skill);
    return { id, title: skill.title, context, strand: skill.strand, grade: skill.grade };
  }
  const topic = topicOf(id);
  if (!topic) return undefined;
  const { course } = topic;
  return {
    id,
    title: topic.title,
    context: `${divisionLabel(course.division)} · ${course.title}`,
    strand: course.title,
  };
}

export function buildMatchIndex(): MatchIndex {
  const pages: (ModuleDef | LayoutDef)[] = [...MODULES, ...LAYOUTS].filter(
    (p) => p.id.startsWith('m.') || p.id.startsWith('s.') || p.id.startsWith('he.'),
  );
  const docs: Doc[] = [];
  for (const p of pages) {
    const owner = ownerOf(p.id);
    if (owner) docs.push(docFor(p, owner));
  }
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = new Map<string, number>();
  for (const [t, n] of df) idf.set(t, Math.log(1 + (docs.length - n + 0.5) / (n + 0.5)));
  const avgLength = docs.reduce((s, d) => s + d.length, 0) / Math.max(1, docs.length);
  return { docs, idf, avgLength };
}

let index: MatchIndex | undefined;
export const getMatchIndex = () => (index ??= buildMatchIndex());

/** BM25 over the page's weighted words, plus what the problem's numbers say. */
function score(doc: Doc, terms: Map<string, number>, f: NumberFeatures, ix: MatchIndex): number {
  const k1 = 1.2;
  const b = 0.4;
  let s = 0;
  for (const [t, qn] of terms) {
    const tf = doc.tf.get(t);
    if (!tf) continue;
    const idf = ix.idf.get(t) ?? 0;
    const norm = tf + k1 * (1 - b + (b * doc.length) / ix.avgLength);
    s += idf * ((tf * (k1 + 1)) / norm) * Math.min(2, qn);
  }
  if (s === 0) return 0;
  const bonus = (want: boolean, has: boolean, up: number, down: number) =>
    want ? (has ? up : -down) : 0;
  s += bonus(f.decimals, doc.decimals, 2, 1.5);
  s += bonus(f.fractions, doc.fractions, 2.5, 1.5);
  s += bonus(f.percent, doc.percent, 3, 1);
  s += bonus(f.money, doc.money, 2.5, 1);
  s += bonus(f.negatives, doc.negatives, 3, 2);
  for (const u of f.units) if (doc.units.has(u)) s += 1.5;
  if (f.max !== undefined && doc.max !== undefined) {
    if (f.max > doc.max * 1.05) s -= 2.5;
    else if (f.max > doc.max / 1000) s += 0.5;
  }
  if (f.grade && doc.owner.grade === f.grade) s += 3;
  return s;
}

/** The pages most likely to solve the problem, best first, at most one per skill or topic. */
/** Words for what the symbols and numbers of a bare problem say: "0.7 × 0.4" → multiply decimal. */
export function symbolWords(text: string, f: NumberFeatures): string[] {
  const t = text.replace(/\u2212/g, '-');
  const words: string[] = [];
  if (/[×x*]\s*\d|\d\s*[×x*]|\btimes\b/i.test(t)) words.push('multiply');
  if (/[÷/]\s*\d|\bdivided\b/i.test(t) && !f.fractions) words.push('divide');
  if (/\d\s*\+\s*\d|\bplus\b/.test(t)) words.push('add');
  if (/\d\s*-\s*\d|\bminus\b/.test(t)) words.push('subtract');
  if (/\^|[²³]|\bsquared\b|\bcubed\b/.test(t)) words.push('exponent');
  if (f.decimals) words.push('decimal');
  if (f.fractions) words.push('fraction');
  if (f.percent) words.push('percent');
  if (f.money) words.push('money');
  if (f.negatives) words.push('negative');
  if (/[<>]|\bgreater\b|\bless\b/.test(t)) words.push('compare');
  return words;
}

export function matchProblem(text: string, limit = 3, ix = getMatchIndex()): MatchResult[] {
  const f = numberFeatures(text);
  const terms = new Map<string, number>();
  for (const w of [...tokenize(text), ...symbolWords(text, f)])
    terms.set(w, (terms.get(w) ?? 0) + 1);
  if (terms.size === 0) return [];
  const scored = ix.docs
    .map((d) => ({ d, s: score(d, terms, f, ix) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  const out: MatchResult[] = [];
  const seen = new Set<string>();
  for (const { d, s } of scored) {
    if (seen.has(d.owner.id)) continue;
    seen.add(d.owner.id);
    out.push({
      id: d.id,
      title: d.title,
      owner: d.owner,
      use: d.use,
      route: pageRoute(d.id)!,
      score: s,
    });
    if (out.length >= limit) break;
  }
  return out;
}
