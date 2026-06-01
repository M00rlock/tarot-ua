import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, 'public');
const envPath = path.resolve(__dirname, '.env');
const port = parseInt(process.env.PORT || '5173', 10);
const spaPaths = ['/', '/session', '/journal', '/library', '/meaning/', '/spreads/', '/share/'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
};

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = parseEnv(envPath);

function injectEnv(html) {
  const envScript = `<script>window.ENV = ${JSON.stringify(env)};</script>`;
  return html.replace('    <script type="module">\n      window.ENV = window.ENV || {};\n    </script>', envScript);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function serveIndex(req, res) {
  const indexPath = path.join(publicDir, 'index.html');
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = injectEnv(html);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch {
    res.writeHead(500);
    res.end('Internal error');
  }
}

function isSpaRoute(url) {
  for (const spa of spaPaths) {
    if (url.startsWith(spa)) return true;
  }
  return false;
}

import http from 'node:http';

const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:3000';

function proxyApi(req, res) {
  const url = new URL(req.url, API_TARGET);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers },
  };
  delete options.headers.host;

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end('API proxy error');
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api')) {
    return proxyApi(req, res);
  }

  const filePath = path.join(publicDir, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = path.extname(url.pathname);

  if (ext && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(res, filePath);
  }
  if (isSpaRoute(url.pathname) || url.pathname === '/') {
    return serveIndex(req, res);
  }
  const altPath = path.join(publicDir, url.pathname, 'index.html');
  if (fs.existsSync(altPath)) {
    return serveFile(res, altPath);
  }
  return serveIndex(req, res);
});

server.listen(port, () => {
  console.log(`Tarot UA web server running at http://localhost:${port}`);
});
