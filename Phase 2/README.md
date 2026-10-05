# Elanpro website concept (Vite + React)

A B2B product catalogue and enquiry site for Elanpro commercial refrigeration.
All products, specifications and images come from the Elanpro catalogue PDF.

## Demo product set

The site currently shows 25 Elanpro products: 5 in each of Professional Kitchen,
Bar Refrigeration, Retail Solution, Ice Machine and Vending Machine. The list and
prices live in `PICKS` in `src/data/products.js`; specifications are pulled from
`src/data/families.js` (the catalogue). Prices marked `listed` were found on an
Indian marketplace listing; all others are indicative placeholders for the demo.
Photos load from elanpro.net where available and fall back to the local catalogue
image automatically.

## Run it

Requires Node 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

The site runs on local data out of the box. To run it against an API instead:

```bash
npm run api                      # optional mock backend on http://localhost:4000/api
cp .env.example .env             # then set VITE_API_URL=http://localhost:4000/api
npm run dev
```

The mock backend (`server/index.js`, no dependencies) serves `GET /api/products`,
`GET /api/products/:id`, `GET /api/categories` and `POST /api/quotes`
(saved to `server/quotes.json`). Point `VITE_API_URL` at the real backend later;
only `src/services/api.js` talks to it.

Deploying: this is a single-page app, so the host must serve `index.html` for
unknown paths (Netlify, Vercel and `vite preview` do this by default).

## Where things live

```
public/images/products/   product cut-outs extracted from the catalogue (.webp)
public/images/scenes/     lifestyle photos from the catalogue section pages
server/index.js           optional mock API
src/
  data/
    families.js           the catalogue, one entry per specification table
    products.js           flattens families into the product list the UI uses
    categories.js         14 categories, taglines, subcategories
    offers.js             homepage carousel slides (edit to change promotions)
    industries.js         sectors and the categories that serve them
    company.js            about text, contact details, footprint, customers
  services/api.js         API layer (local data or VITE_API_URL)
  context/AppContext.jsx  catalogue, quote modal and compare state
  router/                 small history router (no dependency)
  components/             Navbar, Hero, OfferCarousel, ProductCard, FilterPanel,
                          ProductBrowser, QuoteModal, CompareTray, TempScale ...
  pages/                  Home, Products, Category, ProductDetails, Compare,
                          Solutions, About, Contact, NotFound
  styles/tokens.css       design system variables (colours, type, spacing)
```

Routes: `/`, `/products` (`?q=` for search), `/category/:slug`, `/product/:id`,
`/compare`, `/solutions`, `/about`, `/contact`.

## Common edits

- **Add or change a product:** edit its table in `src/data/families.js`.
  `labels` are the spec rows; each model's `values` line up with them.
  `t: [min, max]` (°C) drives the temperature scale and filter, `cap` (litres)
  drives the capacity filter and sort.
- **Replace an image:** drop a file into `public/images/products/` and reference
  its name (without extension) as `image` / `img`.
- **Change the carousel:** edit `src/data/offers.js`. The badge labels
  ("Featured solution" and so on) are demo labels, not real offers.
- **Rebrand:** edit `src/styles/tokens.css`.
- **Hero stops and featured tabs:** `STOPS` in `components/Hero/Hero.jsx` and
  `FEATURED` in `pages/Home/Home.jsx`.

## To confirm with Elanpro before launch

These are reproduced as printed in the catalogue and look like misprints:

- UF 24SS / UFD 24SS freezer temperature is printed as "−15°C ~ 20°C".
- ECG 105 capacity is printed as "10" litres.
- Galaxy vending machine: page 54 gives 1275 × 890 × 1940 mm, the page 55 table
  gives 1180 × 890 × 1985 mm. The site uses the table.

Images: the catalogue PDF stores product photos at about 100 ppi, so they are
soft at large sizes; original photography would improve the hero and product
pages. A few models share a series image, and the image-to-model match for the
two floor-standing water dispensers and the EIM 26 is a best guess.

The quote form is a mock submission unless `VITE_API_URL` is set.
The customer names on the home and about pages are transcribed from the
catalogue's logo pages; confirm permission to list them.
