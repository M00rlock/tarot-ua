const http = require('node:http');
const { URL } = require('node:url');
require('./env');

const cards = require('./cards');
const share = require('./share');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

function jsonResponse(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(body);
}

function parseUrl(req) {
  const base = `http://${req.headers.host || 'localhost'}`;
  return new URL(req.url, base);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Некоректний JSON'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

async function router(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const url = parseUrl(req);
  const path = url.pathname;
  const method = req.method;

  try {
    // Health
    if (method === 'GET' && path === '/api/health') {
      jsonResponse(res, 200, { ok: true, service: 'tarot-api', timestamp: new Date().toISOString() });
      return;
    }

    // Tarot cards
    if (method === 'GET' && path === '/api/tarot/cards') {
      const count = Number(url.searchParams.get('count') || 78);
      const result = cards.getCards(count);
      jsonResponse(res, 200, result);
      return;
    }

    // Tarot spreads (definitions)
    if (method === 'GET' && path === '/api/tarot/spreads') {
      jsonResponse(res, 200, cards.getSpreadDefinitions());
      return;
    }

    // Tarot draw
    if (method === 'GET' && path === '/api/tarot/draw') {
      const count = Number(url.searchParams.get('count') || 3);
      const type = url.searchParams.get('type') || undefined;
      const result = await cards.drawSpread(count, type);
      jsonResponse(res, 200, result);
      return;
    }

    // Tarot interpretation
    if (method === 'POST' && path === '/api/tarot/interpretation') {
      const body = await parseBody(req);
      const result = await cards.generateInterpretation(body.spread || [], body.type, body.tone);
      jsonResponse(res, 200, result);
      return;
    }

    // Tarot card of day
    if (method === 'GET' && path === '/api/tarot/card-of-day') {
      const dateStr = url.searchParams.get('date');
      const date = dateStr ? new Date(dateStr) : new Date();
      const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
      const result = await cards.getCardOfDay(safeDate);
      jsonResponse(res, 200, result);
      return;
    }

    // Share spreads create
    if (method === 'POST' && path === '/api/share/spreads') {
      const body = await parseBody(req);
      const origin = req.headers.origin || '';
      const result = await share.create(body, origin);
      jsonResponse(res, 201, result);
      return;
    }

    // Share spreads social card SVG
    const svgMatch = path.match(/^\/api\/share\/spreads\/([A-Za-z0-9_-]+)\/social-card\.svg$/);
    if (method === 'GET' && svgMatch) {
      const spread = await share.findBySlug(svgMatch[1]);
      const svg = share.renderSocialCardSvg(spread);
      res.writeHead(200, {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      });
      res.end(svg);
      return;
    }

    // Share spreads get by slug
    const slugMatch = path.match(/^\/api\/share\/spreads\/([A-Za-z0-9_-]+)$/);
    if (method === 'GET' && slugMatch) {
      const spread = await share.findBySlug(slugMatch[1]);
      const origin = req.headers.origin || '';
      const result = share.toShareResponse(spread, origin);
      jsonResponse(res, 200, result);
      return;
    }

    // 404
    jsonResponse(res, 404, { message: 'Маршрут не знайдено' });
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 500 ? 'Внутрішня помилка сервера' : error.message;
    if (status === 500) {
      console.error('Unhandled error:', error);
    }
    jsonResponse(res, status, { message });
  }
}

const server = http.createServer(router);

server.listen(PORT, HOST, () => {
  console.log(`API server running at http://${HOST}:${PORT}`);
});
