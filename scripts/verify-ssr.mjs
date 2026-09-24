// Checks that the web export is pre-rendered: every sampled page's HTML already contains its
// title and lesson text, without running JavaScript.
//
// Serves dist/ the way Vercel does (vercel.json: cleanUrls, rewrites, 404.html), then fetches
// each sample URL like a crawler would (no JS) and checks the response.
// Run after the web build: `pnpm build:web && pnpm verify:ssr`. `pnpm verify:ssr --serve`
// serves dist/ the same way for trying the build in a browser.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const DIST = 'dist';
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

/** [url, expected status, text that must appear in the HTML]. */
const CHECKS = [
  ['/browse', 200, ['Browse | Educational Calculator', 'Kindergarten', 'Grade 12']],
  [
    '/grade/K',
    200,
    ['Kindergarten Math and Science', 'Count to 100 by ones and tens', 'Make 10 from any number'],
  ],
  [
    '/skill/m.K.make-10',
    200,
    [
      'Make 10 from any number 1–9 – Kindergarten Math | Educational Calculator',
      '<meta data-rh="true" name="description"',
      'A ten-frame has 10 boxes.',
      'Count the empty boxes in the ten-frame.',
      'Number sentences',
    ],
  ],
  [
    '/skill/m.1.add-sub-20~compare',
    200,
    ['Compare problems: Add and subtract within 20', 'Problem type · Add and subtract within 20'],
  ],
  [
    '/skill/s.K.pushes-pulls',
    200,
    ['Pushes and pulls change motion – Kindergarten Science', 'Kindergarten · Science'],
  ],
  [
    '/course/he.math.calc-1',
    200,
    ['Calculus I – Math course', 'Derivatives and differentiation rules'],
  ],
  [
    '/course/he.math.calc-1/topic/1',
    200,
    ['Derivatives and differentiation rules – Calculus I', 'Step-by-step'],
  ],
  ['/he/engineering', 200, ['Engineering – Higher Education']],
  ['/skill/does-not-exist', 404, ['Page not found']],
  ['/sitemap.xml', 200, ['<urlset', '/skill/m.K.make-10</loc>', '/course/he.math.calc-1</loc>']],
  ['/robots.txt', 200, ['Sitemap: https://educational-calculator.vercel.app/sitemap.xml']],
];
const FORBIDDEN = 'You need to enable JavaScript';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** vercel.json rewrite: "/skill/:id" → "/skill/:id.html" (params match one path segment). */
function rewrite(path) {
  for (const { source, destination } of vercel.rewrites ?? []) {
    const names = [];
    const re = new RegExp(
      '^' + source.replace(/:(\w+)/g, (_, n) => (names.push(n), '([^/]+)')) + '$',
    );
    const m = re.exec(path);
    if (m) return destination.replace(/:(\w+)/g, (_, n) => m[names.indexOf(n) + 1]);
  }
  return undefined;
}

/** Resolves a URL path to a file in dist/, as Vercel's static routing would. */
function resolve(path) {
  const file = (p) => {
    const f = normalize(join(DIST, decodeURIComponent(p)));
    return f.startsWith(DIST) && existsSync(f) && statSync(f).isFile() ? f : undefined;
  };
  return (
    file(path) ??
    (vercel.cleanUrls ? (file(`${path}.html`) ?? file(`${path}/index.html`)) : undefined) ??
    (rewrite(path) && file(rewrite(path))) ??
    (path === '/' ? file('/index.html') : undefined)
  );
}

const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  const found = resolve(path);
  const target = found ?? join(DIST, '404.html');
  res.writeHead(found ? 200 : 404, {
    'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
  });
  res.end(readFileSync(target));
});

// `--serve [port]`: just serve dist/ like Vercel (for trying the build in a browser).
const serveAt = process.argv.indexOf('--serve');
if (serveAt !== -1) {
  const port = Number(process.argv[serveAt + 1] ?? 8765);
  server.listen(port, () => console.log(`Serving dist/ like Vercel at http://localhost:${port}`));
} else {
  await check();
}

async function check() {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  let failures = 0;
  for (const [url, status, texts] of CHECKS) {
    const res = await fetch(base + url);
    const body = await res.text();
    const problems = [
      ...(res.status === status ? [] : [`status ${res.status}, expected ${status}`]),
      ...texts.filter((t) => !body.includes(t)).map((t) => `missing “${t}”`),
      ...(body.includes(FORBIDDEN) ? [`contains “${FORBIDDEN}”`] : []),
    ];
    failures += problems.length ? 1 : 0;
    console.log(
      `${problems.length ? 'FAIL' : 'ok  '} ${url}${problems.length ? ` — ${problems.join('; ')}` : ''}`,
    );
  }
  server.close();
  if (failures) {
    console.error(`\n${failures} of ${CHECKS.length} pages failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${CHECKS.length} pages are pre-rendered with their content.`);
}
