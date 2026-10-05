// API service layer.
// With VITE_API_URL empty the app runs on the local catalogue data in src/data.
// Set VITE_API_URL (see .env.example) and every call below goes to the backend
// instead. Expected endpoints: GET /products, GET /categories, POST /quotes.
import { products as localProducts } from '../data/products.js';
import { categories as localCategories } from '../data/categories.js';

const BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
export const apiEnabled = Boolean(BASE);

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Request to ${path} failed with status ${res.status}`);
  return res.json();
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const api = {
  getProducts: () => (apiEnabled ? request('/products') : Promise.resolve(localProducts)),
  getCategories: () => (apiEnabled ? request('/categories') : Promise.resolve(localCategories)),
  async submitQuote(payload) {
    if (apiEnabled) return request('/quotes', { method: 'POST', body: JSON.stringify(payload) });
    await wait(700); // mock submission for the prototype
    return { ok: true, reference: `ENQ-${Date.now().toString().slice(-6)}` };
  },
};
