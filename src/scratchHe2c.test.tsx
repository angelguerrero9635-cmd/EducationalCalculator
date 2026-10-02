/* Scratch: render group C demos to SVG markup and check label overlaps and clipping at 358 px. Deleted after use. */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('react-native', () => {
  const React = require('react');
  const pass = (tag: string) => (p: { children?: ReactNode }) =>
    React.createElement(tag, {}, p.children);
  return {
    Platform: { OS: 'web', select: (o: Record<string, unknown>) => o.web ?? o.default },
    View: pass('div'),
    Text: (p: { children?: ReactNode }) => React.createElement('p', {}, p.children),
    Pressable: pass('div'),
    StyleSheet: { create: (s: unknown) => s, hairlineWidth: 1 },
    useColorScheme: () => 'light',
    PanResponder: { create: () => ({ panHandlers: {} }) },
    Animated: {},
  };
});
jest.mock('react-native-svg', () => {
  const React = require('react');
  const mk = (tag: string) => (p: Record<string, unknown>) => {
    const { children, ...rest } = p;
    const attrs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest))
      if (typeof v !== 'function' && typeof v !== 'object') attrs[k] = v;
    return React.createElement(tag, attrs, children as ReactNode);
  };
  return {
    __esModule: true,
    default: mk('svg'),
    G: mk('g'),
    Line: mk('line'),
    Path: mk('path'),
    Circle: mk('circle'),
    Rect: mk('rect'),
    Text: mk('text'),
    TSpan: mk('tspan'),
    Defs: mk('defs'),
    LinearGradient: mk('lineargradient'),
    RadialGradient: mk('radialgradient'),
    Stop: mk('stop'),
    Ellipse: mk('ellipse'),
    Polygon: mk('polygon'),
    ClipPath: mk('clippath'),
  };
});
jest.mock('@/state', () => ({ useUnitsPref: () => ['metric', () => undefined] }));
jest.mock('@/state/prefs', () => ({
  prefsStore: { get: () => ({ appearance: 'light' }), subscribe: () => () => undefined },
}));
jest.mock('@/components/module/pointerDrag', () => ({ RESPONDER: false, useWebPointerDrag: () => undefined }));

import { useCalculator } from '@/components/module/useCalculator';
import { RepresentationView } from '@/components/module/reps';
import { HE2C_GALLERY_MODULES } from '@/data/modules/galleryHe2c';

function Demo({ m }: { m: (typeof HE2C_GALLERY_MODULES)[number] }) {
  const calc = useCalculator(m);
  return createElement(RepresentationView, { spec: m.representation, calc });
}

const W = 358;
const unent = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'");

it('renders group C demos without overlaps', () => {
  const report: string[] = [];
  for (const m of HE2C_GALLERY_MODULES.filter((x) =>
    (process.env.IDS ?? '').split(',').some((p) => x.id.startsWith(p)),
  )) {
    const html = renderToStaticMarkup(createElement(Demo, { m }));
    const svg = /<svg width="([\d.]+)" height="([\d.]+)"/.exec(html);
    const H = svg ? Number(svg[2]) : 0;
    const boxes: { t: string; x0: number; x1: number; y0: number; y1: number; halo: boolean }[] = [];
    const seen = new Set<string>();
    for (const t of html.matchAll(/<text([^>]*)>(.*?)<\/text>/g)) {
      const attrs = t[1]!;
      const get = (k: string) => new RegExp(`${k}="([^"]*)"`).exec(attrs)?.[1];
      const text = unent(t[2]!.replace(/<[^>]+>/g, ''));
      const x = Number(get('x'));
      const y = Number(get('y'));
      const size = Number(get('fontSize') ?? 12);
      const anchor = get('textAnchor') ?? 'start';
      const key = `${x},${y},${text}`;
      const halo = !!get('stroke');
      if (seen.has(key)) continue;
      seen.add(key);
      const w = [...text].length * size * 0.56;
      const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
      boxes.push({ t: text, x0, x1: x0 + w, y0: y - size * 0.8, y1: y + size * 0.2, halo });
    }
    const issues: string[] = [];
    for (const b of boxes)
      if (b.x0 < 0 || b.x1 > W || b.y0 < 0 || b.y1 > H)
        issues.push(`clipped: "${b.t}" [${b.x0.toFixed(0)}, ${b.x1.toFixed(0)}] × [${b.y0.toFixed(0)}, ${b.y1.toFixed(0)}]`);
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i]!, boxes[j]!];
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (ox > 1 && oy > 1) issues.push(`overlap: "${a.t}" × "${b.t}" (${ox.toFixed(0)}×${oy.toFixed(0)})`);
      }
    const caption = [...html.matchAll(/<p>(.*?)<\/p>/g)].map((x) => unent(x[1]!.replace(/<[^>]+>/g, '')));
    report.push(`## ${m.id} (h ${H})`, ...issues, ...(process.env.SHOW ? boxes.map((b) => `  ${b.t} @ ${b.x0.toFixed(0)},${b.y1.toFixed(0)}`) : []), ...caption.map((c) => `  > ${c}`));
    if (process.env.DUMP) require('fs').writeFileSync(`${process.env.DUMP}/${m.id}.svg`, html.slice(html.indexOf('<svg'), html.indexOf('</svg>') + 6));
  }
  console.log(report.join('\n'));
});
