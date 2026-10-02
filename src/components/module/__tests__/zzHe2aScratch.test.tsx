/* Scratch render check (deleted before commit). */
jest.mock('react-native', () => require('react-native-web'));
jest.mock('react-native-svg', () => {
  const React = require('react');
  const tag =
    (t: string) =>
    ({ children, ...p }: Record<string, unknown>) =>
      React.createElement(t, p, children);
  const names = ['Circle', 'G', 'Line', 'Path', 'Rect', 'Text', 'TSpan', 'Defs', 'LinearGradient', 'RadialGradient', 'Stop', 'Polygon', 'Polyline', 'Ellipse', 'ClipPath'];
  const out: Record<string, unknown> = { __esModule: true, default: tag('svg') };
  for (const n of names) out[n] = tag(n.toLowerCase());
  return out;
});

// eslint-disable-next-line
const { renderToStaticMarkup } = require('react-dom/server') as { renderToStaticMarkup: (e: unknown) => string };

import { GALLERY_MODULES } from '@/data/modules/gallery';
import { RepresentationView } from '@/components/module/reps';

const ids = (process.env.SCRATCH_IDS ?? 'g.he-complex-plane-').split(',');

test('render', () => {
  const mods = GALLERY_MODULES.filter((m) => ids.some((p: string) => m.id.startsWith(p)));
  expect(mods.length).toBeGreaterThan(0);
  for (const m of mods) {
    const calc = {
      module: m,
      values: m.example,
      status: () => 'example',
      set: () => {},
      units: {
        display: Object.fromEntries(m.variables.map((v) => [v.id, v.unit])),
        toDisplay: (_: string, x: number) => x,
        factor: () => 1,
        system: { variables: m.variables },
      },
    } as never;
    const html = renderToStaticMarkup(<RepresentationView spec={m.representation} calc={calc} />);
    const svg = /<svg[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/.exec(html);
    const [W, H] = [Number(svg?.[1]), Number(svg?.[2])];
    const rects = [...html.matchAll(/<rect x="([-\d.e]+)" y="([-\d.e]+)" width="([\d.e]+)" height="([\d.e]+)" rx="3"/g)].map((r) => ({
      l: +r[1]!, t: +r[2]!, r: +r[1]! + +r[3]!, b: +r[2]! + +r[4]!,
    }));
    const texts = [...html.matchAll(/<text[^>]*>(.*?)<\/text>/g)].map((t) => t[1]!.replace(/<[^>]+>/g, ''));
    const issues: string[] = [];
    rects.forEach((a, i) => {
      if (a.l < 0 || a.t < 0 || a.r > W || a.b > H) issues.push(`out ${texts[i] ?? ''} ${JSON.stringify(a)}`);
      rects.slice(i + 1).forEach((b) => {
        if (!(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b)) issues.push(`overlap ${JSON.stringify(a)} ${JSON.stringify(b)}`);
      });
    });
    const cap = [...html.matchAll(/<(?:div|span)[^>]*dir="auto"[^>]*>([^<]+)</g)].map((x) => x[1]).join(' | ');
    console.log(`${m.id} ${W}×${H}\n  chips: ${rects.length}\n  ${issues.join('\n  ') || 'no overlaps'}\n  texts: ${texts.join(' / ')}\n  caption: ${cap}`);
  }
});
