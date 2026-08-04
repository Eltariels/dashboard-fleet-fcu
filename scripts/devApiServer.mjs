// Petit serveur de developpement local qui rejoue les fonctions serverless
// de /api sans dependre de la CLI Vercel (celle-ci reste utilisee en prod,
// via l'import GitHub -> Vercel ; ce script sert uniquement au dev local).
import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';

const routes = [
  { method: 'POST', pattern: '/api/auth/login', module: '../api/auth/login.js' },
  { method: 'POST', pattern: '/api/auth/logout', module: '../api/auth/logout.js' },
  { method: 'GET', pattern: '/api/auth/me', module: '../api/auth/me.js' },
  { method: 'POST', pattern: '/api/auth/change-password', module: '../api/auth/change-password.js' },
  { method: 'ANY', pattern: '/api/members', module: '../api/members/index.js' },
  { method: 'ANY', pattern: '/api/members/:id', module: '../api/members/[id].js' },
  { method: 'GET', pattern: '/api/divisions', module: '../api/divisions/index.js' },
  { method: 'PUT', pattern: '/api/divisions/:id', module: '../api/divisions/[id].js' },
  { method: 'ANY', pattern: '/api/users', module: '../api/users/index.js' },
  { method: 'ANY', pattern: '/api/users/:id', module: '../api/users/[id].js' },
  { method: 'POST', pattern: '/api/users/:id/reset-password', module: '../api/users/[id]/reset-password.js' },
  { method: 'GET', pattern: '/api/logs', module: '../api/logs/index.js' },
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
    if (route.segments.length !== segments.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < segments.length; i++) {
      const routeSeg = route.segments[i];
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
