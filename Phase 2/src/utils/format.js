export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Supports both absolute URLs (Unsplash) and local image keys
export const productImage = (key) =>
  key && (key.startsWith('http://') || key.startsWith('https://'))
    ? key
    : `/images/products/${key}.webp`;

export const sceneImage = (key) =>
  key && (key.startsWith('http://') || key.startsWith('https://'))
    ? key
    : `/images/scenes/${key}.jpg`;

// Format Indian rupee
export const fmtPrice = (n) =>
  '₹' + Number(n).toLocaleString('en-IN');

// Temperature class derived from the catalogue's printed range.
export function tempClass(t) {
  if (!t) return null;
  const [min, max] = t;
  if (min >= 30) return 'Heated';
  if (min <= -40) return 'Ultra-low';
  if (min < 0 && max > 0) return 'Dual / convertible';
  if (max <= 0) return 'Freezer';
  return 'Chiller';
}

export const fmtTemp = (n) => `${n < 0 ? '−' : ''}${Math.abs(n)}°C`;

// Remote product photos can fail (offline demo, hotlink blocking). Each remote
// URL registered here falls back to a local catalogue image; the swap happens
// in one global handler installed by installImageFallback() in main.jsx.
const IMAGE_FALLBACKS = new Map();
export function registerImageFallback(url, localKey) {
  IMAGE_FALLBACKS.set(url, `/images/products/${localKey}.webp`);
  return url;
}
export function installImageFallback() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const fallback = IMAGE_FALLBACKS.get(img.getAttribute('src'));
    if (fallback) img.src = fallback;
  }, true);
}
