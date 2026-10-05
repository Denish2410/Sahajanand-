import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { fmtPrice, productImage, tempClass } from '../utils/format.js';
import { Head, Pill, Drawer, Text, Num, Area, Select, Check, Pager, usePaged, exportCSV, Empty } from './ui.jsx';

const BLANK = { model: '', name: '', category: '', subcategory: '', description: '', price: 0, mrp: 0, priceSource: 'indicative', stock: 0, status: 'active', featured: false, image: '', galleryText: '', badgesText: '', featuresText: '', applicationsText: '', specifications: [{ label: '', value: '' }], tMin: '', tMax: '', capacityL: '', refrigerant: '', cooling: '' };
const lines = (t) => String(t || '').split('\n').map((s) => s.trim()).filter(Boolean);
const commas = (t) => String(t || '').split(',').map((s) => s.trim()).filter(Boolean);

const toForm = (p) => ({
  ...BLANK, ...p,
  galleryText: (p.gallery || []).join('\n'), badgesText: (p.badges || []).join(', '), featuresText: (p.features || []).join('\n'),
  applicationsText: (p.applications || []).join(', '), specifications: p.specifications?.length ? p.specifications.map((s) => ({ ...s })) : [{ label: '', value: '' }],
  tMin: p.temp ? p.temp[0] : '', tMax: p.temp ? p.temp[1] : '', capacityL: p.capacityL ?? '',
});

export default function ProductsAdmin() {
  const { db, upsert, remove, log, uniqueProductId, user } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const catName = (slug) => db.categories.find((c) => c.slug === slug)?.name || slug;
  const low = db.settings.lowStockThreshold;

  const rows = useMemo(() => {
    let r = db.products.filter((p) => (!cat || p.category === cat)
      && (!status || (status === 'low' ? p.stock <= low : status === 'featured' ? p.featured : p.status === status))
      && (!q || `${p.model} ${p.name} ${p.subcategory}`.toLowerCase().includes(q.toLowerCase())));
    const s = { newest: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''), model: (a, b) => a.model.localeCompare(b.model), priceAsc: (a, b) => a.price - b.price, priceDesc: (a, b) => b.price - a.price, stock: (a, b) => a.stock - b.stock }[sort];
    return [...r].sort(s);
  }, [db.products, q, cat, status, sort, low]);
  const pg = usePaged(rows, 10);
  const subs = db.categories.find((c) => c.slug === form?.category)?.subcategories || [];

  const save = () => {
    if (!form.model.trim() || !form.name.trim()) return setError('Model and name are required.');
    if (!form.category) return setError('Choose a category.');
    if (!(Number(form.price) > 0)) return setError('Enter a price greater than 0.');
    const isNew = !form.id;
    const id = isNew ? uniqueProductId(form.model) : form.id;
    const temp = form.tMin !== '' && form.tMax !== '' ? [Math.min(form.tMin, form.tMax), Math.max(form.tMin, form.tMax)] : null;
    const image = form.image.trim() || db.categories.find((c) => c.slug === form.category)?.image || '';
    const { galleryText, badgesText, featuresText, applicationsText, tMin, tMax, ...rest } = form;
    const product = {
      ...rest, id, model: form.model.trim(), name: form.name.trim(), image,
      gallery: [image, ...lines(galleryText).filter((g) => g !== image)], badges: commas(badgesText), features: lines(featuresText), applications: commas(applicationsText),
      specifications: form.specifications.filter((s) => s.label.trim() && s.value.trim()),
      temp, tempClass: tempClass(temp), capacityL: form.capacityL === '' ? null : Number(form.capacityL),
      price: Number(form.price), mrp: Number(form.mrp) || 0, stock: Math.max(0, Number(form.stock) || 0),
      familyId: form.familyId || `custom-${id}`, familyName: form.familyName || form.name.trim(),
      subcategory: form.subcategory || subs[0] || 'General', createdAt: form.createdAt || new Date().toISOString(),
    };
    upsert('products', product);
    log(`${isNew ? 'added' : 'updated'} product ${product.model}`, user.name);
    setForm(null); setError('');
  };
  const del = (ids) => {
    if (!window.confirm(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
    remove('products', ids); log(`deleted ${ids.length} product(s)`, user.name); setSel([]);
  };
  const bulk = (patch, label) => { sel.forEach((id) => upsert('products', { id, ...patch })); log(`${label} ${sel.length} product(s)`, user.name); setSel([]); };
  const setSpec = (i, k, v) => setForm({ ...form, specifications: form.specifications.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  const moveSpec = (i, d) => { const a = [...form.specifications]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setForm({ ...form, specifications: a }); };

  return (
    <>
      <Head title="Products" sub={`${db.products.length} products, ${db.products.filter((p) => p.status === 'draft').length} drafts, ${db.products.filter((p) => p.stock <= low).length} low or out of stock.`}>
        <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('products.csv', rows, [['Model', 'model'], ['Name', 'name'], ['Category', (p) => catName(p.category)], ['Subcategory', 'subcategory'], ['Price', 'price'], ['MRP', 'mrp'], ['Stock', 'stock'], ['Status', 'status']])}>Export CSV</button>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ ...BLANK, category: db.categories[0]?.slug || '' }); setError(''); }}>Add product</button>
      </Head>

      <div className="ad-toolbar">
        <input className="input" type="search" placeholder="Search model, name or type" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category"><option value="">All categories</option>{db.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="featured">Featured</option><option value="low">Low or out of stock</option></select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="newest">Newest first</option><option value="model">Model A to Z</option><option value="priceAsc">Price low to high</option><option value="priceDesc">Price high to low</option><option value="stock">Stock low to high</option></select>
      </div>
      {sel.length > 0 && (
        <div className="ad-bulk"><strong>{sel.length} selected</strong>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ status: 'active' }, 'activated')}>Set active</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ status: 'draft' }, 'drafted')}>Set draft</button>
          <button className="btn btn-ghost btn-sm" onClick={() => bulk({ featured: true }, 'featured')}>Feature</button>
          <button className="btn btn-ghost btn-sm ad-danger" onClick={() => del(sel)}>Delete</button>
        </div>
      )}

      {rows.length === 0 ? <Empty>No products match. Clear the search or filters, or add a product.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr>
            <th><input type="checkbox" aria-label="Select all on page" checked={pg.slice.every((p) => sel.includes(p.id))} onChange={(e) => setSel(e.target.checked ? [...new Set([...sel, ...pg.slice.map((p) => p.id)])] : sel.filter((id) => !pg.slice.some((p) => p.id === id)))} /></th>
            <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>{pg.slice.map((p) => (
            <tr key={p.id}>
              <td><input type="checkbox" aria-label={`Select ${p.model}`} checked={sel.includes(p.id)} onChange={() => setSel(sel.includes(p.id) ? sel.filter((x) => x !== p.id) : [...sel, p.id])} /></td>
              <td><div className="ad-prod"><img src={productImage(p.image)} alt="" /><div><strong>{p.model}</strong>{p.featured && <span className="pill pill--confirmed">Featured</span>}<small>{p.name}</small></div></div></td>
              <td>{catName(p.category)}<small>{p.subcategory}</small></td>
              <td className="num">{fmtPrice(p.price)}{p.mrp > p.price && <small><s>{fmtPrice(p.mrp)}</s></small>}</td>
              <td>
                <div className="ad-stock">
                  <button aria-label={`Decrease stock of ${p.model}`} onClick={() => upsert('products', { id: p.id, stock: Math.max(0, p.stock - 1) })}>−</button>
                  <span className="num">{p.stock}</span>
                  <button aria-label={`Increase stock of ${p.model}`} onClick={() => upsert('products', { id: p.id, stock: p.stock + 1 })}>+</button>
                </div>
                {p.stock === 0 ? <Pill value="Out of stock" /> : p.stock <= low ? <Pill value="Low stock" /> : null}
              </td>
              <td><button className="ad-toggle" onClick={() => upsert('products', { id: p.id, status: p.status === 'draft' ? 'active' : 'draft' })} title="Toggle active / draft"><Pill value={p.status === 'draft' ? 'Draft' : 'Active'} /></button></td>
              <td className="ad-actions">
                <button onClick={() => { setForm(toForm(p)); setError(''); }}>Edit</button>
                <button onClick={() => { const { id, ...copy } = toForm(p); setForm({ ...copy, model: `${p.model} Copy`, createdAt: '' }); setError(''); }}>Duplicate</button>
                <a href={`/product/${p.id}`} target="_blank" rel="noreferrer">View</a>
                <button className="ad-danger" onClick={() => del([p.id])}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <Pager {...pg} onPage={pg.setPage} />

      {form && (
        <Drawer wide title={form.id ? `Edit ${form.model}` : 'Add product'} onClose={() => setForm(null)}
          footer={<>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save product</button></>}>
          <h3>Basics</h3>
          <div className="ad-form">
            <Text label="Model number" f={form} set={setForm} k="model" />
            <Text label="Product name" f={form} set={setForm} k="name" />
            <Select label="Category" f={form} set={(v) => setForm({ ...v, subcategory: '' })} k="category" options={[['', 'Choose category'], ...db.categories.map((c) => [c.slug, c.name])]} />
            <Select label="Subcategory" f={form} set={setForm} k="subcategory" options={[['', subs.length ? 'Choose subcategory' : 'General'], ...subs]} />
            <Area label="Description" f={form} set={setForm} k="description" />
          </div>
          <h3>Pricing and inventory</h3>
          <div className="ad-form">
            <Num label="Price (₹)" f={form} set={setForm} k="price" min="0" />
            <Num label="MRP (₹, optional)" f={form} set={setForm} k="mrp" min="0" hint="Shown struck through in the admin list." />
            <Select label="Price type" f={form} set={setForm} k="priceSource" options={[['indicative', 'Indicative demo price'], ['listed', 'Marketplace listed price']]} />
            <Num label="Stock quantity" f={form} set={setForm} k="stock" min="0" />
            <Select label="Status" f={form} set={setForm} k="status" options={[['active', 'Active (visible on site)'], ['draft', 'Draft (hidden)']]} />
            <div className="field"><span className="ad-label">Merchandising</span><Check label="Featured product" f={form} set={setForm} k="featured" /></div>
          </div>
          <h3>Images</h3>
          <div className="ad-form">
            <Text wide label="Main image" f={form} set={setForm} k="image" hint="A full https:// image URL, or the name of a file in public/images/products (without .webp). Empty uses the category image." />
            {form.image && <div className="ad-preview ad-wide"><img src={productImage(form.image)} alt="Preview" /></div>}
            <Area label="Gallery images (one per line)" f={form} set={setForm} k="galleryText" rows={2} />
          </div>
          <h3>Technical specifications</h3>
          <div className="ad-specs">
            {form.specifications.map((s, i) => (
              <div key={i}>
                <input className="input" placeholder="Label, e.g. Capacity" aria-label={`Specification ${i + 1} label`} value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)} />
                <input className="input" placeholder="Value, e.g. 1300 L" aria-label={`Specification ${i + 1} value`} value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} />
                <button aria-label="Move up" onClick={() => moveSpec(i, -1)}>↑</button>
                <button aria-label="Move down" onClick={() => moveSpec(i, 1)}>↓</button>
                <button aria-label="Remove row" className="ad-danger" onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, j) => j !== i) })}>×</button>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, specifications: [...form.specifications, { label: '', value: '' }] })}>Add specification row</button>
          </div>
          <h3>Filters and temperature scale</h3>
          <div className="ad-form">
            <Num label="Min temperature (°C)" f={form} set={setForm} k="tMin" hint="Leave both empty if not applicable." />
            <Num label="Max temperature (°C)" f={form} set={setForm} k="tMax" />
            <Num label="Capacity (litres)" f={form} set={setForm} k="capacityL" min="0" />
            <Text label="Refrigerant" f={form} set={setForm} k="refrigerant" placeholder="e.g. R290" />
            <Text label="Cooling type" f={form} set={setForm} k="cooling" placeholder="e.g. Ventilated cooling" />
          </div>
          <h3>Content</h3>
          <div className="ad-form">
            <Area label="Key features (one per line)" f={form} set={setForm} k="featuresText" rows={5} />
            <Text wide label="Badges (comma separated)" f={form} set={setForm} k="badgesText" placeholder="SS 304, Frost Free" />
            <Text wide label="Applications (comma separated)" f={form} set={setForm} k="applicationsText" placeholder="Hotels & Restaurants, Dairy" />
          </div>
        </Drawer>
      )}
    </>
  );
}
