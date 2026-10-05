// Optional mock backend for the prototype. No dependencies: `npm run api`.
// Serves the same catalogue data the frontend bundles, and stores quote
// requests in server/quotes.json. Replace with the real backend later;
// the frontend only needs VITE_API_URL to point at it.
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';
import { categories } from '../src/data/categories.js';

const PORT = process.env.PORT || 4000;
const QUOTES = fileURLToPath(new URL('./quotes.json', import.meta.url));

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
  });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname.replace(/\/$/, '');
    if (req.method === 'OPTIONS') return send(res, 204, {});

    if (req.method === 'GET' && path === '/api/categories') return send(res, 200, categories);
    if (req.method === 'GET' && path === '/api/products') {
      const cat = url.searchParams.get('category');
      return send(res, 200, cat ? products.filter((p) => p.category === cat) : products);
    }
    if (req.method === 'GET' && path.startsWith('/api/products/')) {
      const product = products.find((p) => p.id === path.split('/').pop());
      return product ? send(res, 200, product) : send(res, 404, { error: 'Product not found' });
    }
    if (req.method === 'POST' && path === '/api/quotes') {
      try {
        const body = await readBody(req);
        if (!body.name || !body.email || !body.phone) return send(res, 400, { error: 'Name, email and phone are required' });
        const all = JSON.parse(await readFile(QUOTES, 'utf8').catch(() => '[]'));
        const entry = { reference: `ENQ-${Date.now().toString().slice(-6)}`, receivedAt: new Date().toISOString(), ...body };
        all.push(entry);
        await writeFile(QUOTES, JSON.stringify(all, null, 2));
        return send(res, 201, { ok: true, reference: entry.reference });
      } catch {
        return send(res, 400, { error: 'Invalid JSON body' });
      }
    }
    send(res, 404, { error: 'Not found' });
  })
  .listen(PORT, () => console.log(`Mock API on http://localhost:${PORT}/api`));
