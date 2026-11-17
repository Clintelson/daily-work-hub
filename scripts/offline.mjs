// Precache only exported application files. Task data lives exclusively in IndexedDB.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return lists.flat();
}
const files = (await walk(root)).filter(f => !f.endsWith('.map') && !f.endsWith('/sw.js'));
const hash = createHash('sha256');
for (const file of files) { hash.update(path.relative(root, file)); hash.update(await readFile(file)); }
const version = `dwh-shell-${hash.digest('hex').slice(0, 16)}`;
const urls = files.map(f => '/' + path.relative(root, f).split(path.sep).map(encodeURIComponent).join('/'));
urls.push('/');
await writeFile(path.join(root, 'sw.js'), `const CACHE=${JSON.stringify(version)};
const FILES=${JSON.stringify(urls)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('dwh-shell-') && k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => (await caches.match(url.pathname)) || (await caches.match(url.pathname + '.html')) || caches.match('/')));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname).then(hit => hit || fetch(event.request)));
  }
});
`);
console.log(`Offline shell generated: ${urls.length} application files, ${version}`);
