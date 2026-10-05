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
