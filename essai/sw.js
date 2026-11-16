// Carbone Espaces — essai en ligne : ce qui répond à la place du serveur.
const FILES = 'cc-essai-fichiers', NO = 'réservé à la version complète de Carbone Espaces';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
const json = (v, s = 200) => new Response(JSON.stringify(v), { status: s, headers: { 'content-type': 'application/json; charset=utf-8' } });
self.addEventListener('fetch', (e) => {
  const scope = self.registration.scope, url = new URL(e.request.url);
  if (!url.href.startsWith(scope)) return;
  const rel = url.href.slice(scope.length), path = rel.split('?')[0];
  if (path === 'file') return e.respondWith((async () => { const c = await caches.open(FILES); return (await c.match(scope + 'file?p=' + encodeURIComponent(url.searchParams.get('p') ?? ''))) ?? new Response('', { status: 404 }); })());
  if (!path.startsWith('api/')) return;
  e.respondWith((async () => {
    const api = path.slice(4);
    if (api === 'types') return fetch(scope + 'data/types.json');
    if (api === 'fonts') return fetch(scope + 'data/fonts.json');
    if (api === 'edition') return fetch(scope + 'data/edition.json');
    if (api === 'state') return json({ running: false, nodes: {} });
    if (api === 'net') return json({ online: false, internet: true, freellm: false, ollama: '', mode: 'auto', version: 'essai en ligne' });
    if (api === 'upload' && e.request.method === 'POST') {
      const name = (url.searchParams.get('name') ?? 'fichier').replace(/[^\w.\- ]+/g, '_').slice(-80), p = 'essai/' + Date.now().toString(36) + '-' + name;
      const body = await e.request.blob(), c = await caches.open(FILES);
      await c.put(scope + 'file?p=' + encodeURIComponent(p), new Response(body, { headers: { 'content-type': body.type || 'application/octet-stream' } }));
      return json({ ok: true, path: p });
    }
    if (['graphs', 'files', 'plugins', 'telechargements', 'usage'].includes(api)) return json(api === 'usage' ? { ok: true } : []);
    if (api === 'graph' && e.request.method === 'POST') return json({ ok: true, copie: '' });
    return json({ ok: false, error: NO }, e.request.method === 'GET' ? 404 : 200);
  })());
});
