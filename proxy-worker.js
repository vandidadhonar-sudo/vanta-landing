const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ROUTES = {
  '/api/files':    'https://raw.githubusercontent.com/vandidadhonar-sudo/vanta-filing-bot/db/data/files.json',
  '/api/settings': 'https://raw.githubusercontent.com/vandidadhonar-sudo/vanta-filing-bot/db/data/settings.json',
  '/api/rates':    'https://call.tgju.org/ajax.json',
};

export default {
  async fetch(req) {
    const path = new URL(req.url).pathname;

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const upstream = ROUTES[path];
    if (!upstream) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    try {
      const res = await fetch(upstream, {
        headers: { 'User-Agent': 'vanta-proxy/1.0' },
        cf: { cacheTtl: 180, cacheEverything: true },
      });
      const body = await res.arrayBuffer();
      return new Response(body, {
        status: res.status,
        headers: {
          ...CORS,
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=180',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'upstream failed' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  },
};
