import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFile(path.join(root, relative), 'utf8');
const config = JSON.parse(await read('src/site.json'));
const base = ('/' + (process.env.BASE_PATH || '').replace(/^\/+|\/+$/g, '')).replace(/\/$/, '');
const origin = process.env.SITE_URL || 'http://localhost:4173';
const header = await read('src/partials/header.html');
const footer = await read('src/partials/footer.html');
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'src/client'), path.join(root, 'dist/client'), { recursive: true });

// Prefix only site-local paths: external destinations, anchors and data URIs stay intact.
const localize = html => html.replace(/\b(href|src|poster|action)="\/(?!\/)([^"]*)"/g,
  (_, attr, value) => `${attr}="${base}/${value}"`).replace(/url\((["']?)\/assets\//g,`url($1${base}/assets/`);
const pageTitles = { '/': 'Premium teacup puppies in Dubai', '/puppies': 'Available puppies',
  '/happy-families': 'Happy families', '/faq': 'Questions & answers', '/contact': 'Visit & contact',
  '/how-it-works': 'How it works', '/gone-home': 'Gone home' };

for (const route of config.routes) {
  const key = route === '/' ? 'home' : route.slice(1).replaceAll('/', '__');
  const main = await read(`src/pages/${key}.html`);
  const heading = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '').trim();
  const title = pageTitles[route] || heading || 'Meet your puppy';
  const out = path.join(root, 'dist', route, 'index.html');
  await mkdir(path.dirname(out), { recursive: true });
  const document = `<!doctype html>
<html lang="en" class="${config.htmlClass.join(' ')}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title} — TeddyPups U.A.E.</title>
<meta name="description" content="Meet premium miniature and teacup puppies. Browse real photos, family stories, and the TeddyPups puppy journey.">
<meta name="theme-color" content="#fff9ed"><link rel="canonical" href="${origin}${base}${route}">
${config.styles.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')}
<link rel="stylesheet" href="/client/app.css"><script type="module" src="/client/app.js"></script>
</head><body data-base="${base}" data-route="${route}">
<a href="#main" class="skip-link">Skip to content</a>
${header}<main id="main" tabindex="-1" class="relative pt-[var(--header-h)] outline-none">${main}</main>${footer}
<div class="mobile-contact"><a href="https://wa.me/919898124987" target="_blank" rel="noopener noreferrer">WhatsApp us</a><a href="tel:+971500000000">Call</a></div>
</body></html>`;
  await writeFile(out, localize(document));
}
// CSS asset references are absolute in the templates. Make them portable to project hosting.
if (base) {
  for (const style of config.styles) {
    const file = path.join(root, 'dist', style);
    await writeFile(file, (await readFile(file, 'utf8')).replaceAll('url("/assets/', `url("${base}/assets/`));
  }
}
await writeFile(path.join(root, 'dist/.nojekyll'), '');
await writeFile(path.join(root, 'dist/404.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found — TeddyPups</title><style>body{background:#fff6e6;color:#321b11;font:20px system-ui;text-align:center;padding:15vh 20px}a{color:#9d481e}</style><h1>This pup wandered off.</h1><p>That page could not be found.</p><a href="${base}/">Back home</a></html>`);
console.log(`Built ${config.routes.length} pages in dist/ (base: ${base || '/'})`);
