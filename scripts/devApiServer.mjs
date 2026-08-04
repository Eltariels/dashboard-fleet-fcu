// Petit serveur de developpement local qui rejoue les fonctions serverless
// de /api sans dependre de la CLI Vercel (celle-ci reste utilisee en prod,
// via l'import GitHub -> Vercel ; ce script sert uniquement au dev local).
import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';

// *name = catch-all (0 ou plusieurs segments, capture un tableau) - reproduit
// le comportement des routes Vercel [[...name]].js utilisees en prod.
const routes = [
  { method: 'ANY', pattern: '/api/auth/:action', module: '../api/auth/[action].js' },
  { method: 'ANY', pattern: '/api/members/*id', module: '../api/members/[[...id]].js' },
  { method: 'ANY', pattern: '/api/divisions/*id', module: '../api/divisions/[[...id]].js' },
  { method: 'ANY', pattern: '/api/users/*path', module: '../api/users/[[...path]].js' },
  { method: 'GET', pattern: '/api/logs', module: '../api/logs/index.js' },
  { method: 'ANY', pattern: '/api/ships/*id', module: '../api/ships/[[...id]].js' },
];

const compiled = await Promise.all(
  routes.map(async (r) => {
    const segments = r.pattern.split('/').filter(Boolean);
    const mod = await import(r.module);
    return { ...r, segments, handler: mod.default };
  })
);

function matchRoute(method, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  for (const route of compiled) {
    if (route.method !== 'ANY' && route.method !== method) continue;
    const routeSegs = route.segments;
    const lastSeg = routeSegs[routeSegs.length - 1];

    if (lastSeg && lastSeg.startsWith('*')) {
      const prefixLen = routeSegs.length - 1;
      if (segments.length < prefixLen) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < prefixLen; i++) {
        const routeSeg = routeSegs[i];
        if (routeSeg.startsWith(':')) params[routeSeg.slice(1)] = decodeURIComponent(segments[i]);
        else if (routeSeg !== segments[i]) { ok = false; break; }
      }
      if (!ok) continue;
      params[lastSeg.slice(1)] = segments.slice(prefixLen).map(decodeURIComponent);
      return { handler: route.handler, params };
    }

    if (routeSegs.length !== segments.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < segments.length; i++) {
      const routeSeg = routeSegs[i];
      if (routeSeg.startsWith(':')) {
        params[routeSeg.slice(1)] = decodeURIComponent(segments[i]);
      } else if (routeSeg !== segments[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { handler: route.handler, params };
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const match = matchRoute(req.method, url.pathname);

  if (!match) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route API introuvable' }));
    return;
  }

  const rawBody = await readBody(req);
  let body = undefined;
  if (rawBody && req.headers['content-type']?.includes('application/json')) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = undefined;
    }
  }

  req.query = { ...Object.fromEntries(url.searchParams.entries()), ...match.params };
  req.body = body;

  const jsonRes = res;
  const originalStatus = jsonRes.status?.bind(jsonRes);
  jsonRes.status = (code) => {
    jsonRes.statusCode = code;
    return jsonRes;
  };
  jsonRes.json = (payload) => {
    jsonRes.setHeader('Content-Type', 'application/json');
    jsonRes.end(JSON.stringify(payload));
  };

  try {
    await match.handler(req, jsonRes);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Erreur serveur' }));
    }
  }
});

const port = process.env.API_DEV_PORT || 3000;
server.listen(port, () => {
  console.log(`API de dev disponible sur http://localhost:${port}/api`);
});
