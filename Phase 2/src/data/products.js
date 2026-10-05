// Demo product list: 5 Elanpro products in each of the 5 active categories.
//
// - Specifications, features and descriptions come from the Elanpro catalogue
//   (src/data/families.js), so nothing here is invented.
// - `image` is the product photo on elanpro.net where one was found; the local
//   catalogue cut-out in /public/images/products is the automatic fallback if
//   the remote photo does not load (see registerImageFallback in utils/format.js).
// - `price` is in INR. priceSource 'listed' = a price found on an Indian
//   marketplace listing; 'indicative' = a placeholder for the demo, NOT a real
//   quote. Replace every price with the client's price list before going live.
import { families } from './families.js';
import { slugify, tempClass, registerImageFallback } from '../utils/format.js';

const WEB = 'https://elanpro.net/wp-content/uploads/2025/';

// model -> { price, priceSource, web (elanpro.net photo), badge }
const PICKS = {
  // Professional Kitchen
  'EGN 1500 C4': { price: 185000, web: '07/EGN-1500-C.png' },
  'EGN 2100 C': { price: 98000, web: '07/EGN-2100-C.png' },
  'ED10': { price: 340000, web: '07/ED-10-2.png' },
  'ESH 2000': { price: 135000, web: '07/ESH-2000-5.png' },
  'RI 551 C': { price: 68795, priceSource: 'listed', web: '07/RI-551C-and-RI-551-F.png' },

  // Bar Refrigeration
  'EWG 130 D': { price: 110000, web: '07/EWG-130-D-7-Photoroom-1.png' },
  'EWG 51 D': { price: 62000 },
  'EBB 2D / 2D SS': { price: 58000, web: '07/EBB-2D-2D-SS-1.png' },
  'EGN 2100 CG': { price: 105000, web: '07/EGN-2100-CG.png' },
  'EGF 5G': { price: 48000 },

  // Retail Solution
  'ECG 1506': { price: 145000, priceSource: 'listed' },
  'EFGV 1000': { price: 165000, web: '06/EFGV-1000-2.png' },
  'EKG 650 G': { price: 52000 },
  'EF 825 G': { price: 45500, priceSource: 'listed' },
  'ECG 305': { price: 32000, category: 'retail-solution' },

  // Ice Machine
  'EIM 61 BW': { price: 72000 },
  'EIM 101': { price: 105000 },
  'EIM 201': { price: 195000 },
  'EIM 1001': { price: 650000, web: '07/EIM-1001-a-1.png' },
  'EFM 101': { price: 125000, web: '07/EFM-101-min.png' },

  // Vending Machine
  'Galaxy': { price: 325000 },
  'Nova': { price: 390000 },
  'Frozone': { price: 450000 },
  'Orion': { price: 185000, web: '06/orion-1.png' },
  'Apollo': { price: 240000 },
};

const ACTIVE = ['professional-kitchen', 'bar-refrigeration', 'retail-solution', 'ice-machine', 'vending-machine'];
const pick = (specs, re) => specs.find((s) => re.test(s.label))?.value ?? null;

export const products = families
  .filter((f) => ACTIVE.includes(f.category))
  .flatMap((f) =>
    f.models
      .filter((mdl) => PICKS[mdl.model] && (!PICKS[mdl.model].category || PICKS[mdl.model].category === f.category))
      .map((mdl) => {
        const cfg = PICKS[mdl.model];
        const specifications = [
          ...f.labels.map((label, i) => ({ label, value: mdl.values[i] })),
          ...Object.entries(f.shared || {}).map(([label, value]) => ({ label, value })),
        ];
        const local = mdl.img || f.image;
        const image = cfg.web ? registerImageFallback(WEB + cfg.web, local) : local;
        const refrigerant = pick(specifications, /refrigerant/i);
        return {
          id: slugify(mdl.model),
          model: mdl.model,
          name: mdl.name || f.name,
          familyId: f.id,
          familyName: f.name,
          category: f.category,
          subcategory: mdl.sub || f.subcategory,
          description: f.description,
          image,
          gallery: [image, ...(cfg.web ? [local] : []), ...(f.gallery || []).filter((g) => g !== local)],
          features: mdl.features || f.features,
          specifications,
          applications: mdl.applications || f.applications || [],
          badges: f.badges || [],
          temp: mdl.t || null,
          tempClass: tempClass(mdl.t),
          capacityL: mdl.cap ?? null,
          refrigerant: refrigerant ? refrigerant.split(',')[0].replace(/[-\s]/g, '').replace(/\/.*/, '') : null,
          cooling: pick(specifications, /type of cooling|cooling type|cooling mode|cooling method/i),
          price: cfg.price,
          priceSource: cfg.priceSource || 'indicative',
        };
      })
  );

export const getProduct = (id) => products.find((p) => p.id === id);
export const getByModel = (model) => products.find((p) => p.model === model);
export const byCategory = (slug) => products.filter((p) => p.category === slug);
export const byFamily = (familyId) => products.filter((p) => p.familyId === familyId);
