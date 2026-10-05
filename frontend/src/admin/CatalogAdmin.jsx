import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { productImage, slugify, fmtPrice } from '../utils/format.js';
import { Head, Pill, Drawer, Text, Num, Area, Select, Check, Empty } from './ui.jsx';

const SCENES = ['kitchen', 'bar', 'retail', 'beach', 'vending', 'bakery', 'parlour', 'supermarket', 'lab', 'store', 'chef'];

export function CategoriesAdmin() {
  const { db, upsert, remove, setColl, log, user } = useApp();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const count = (slug) => db.products.filter((p) => p.category === slug).length;

  const save = () => {
    if (!form.name.trim()) return setError('Enter a category name.');
    const slug = form.original || slugify(form.slug || form.name);
    if (!form.original && db.categories.some((c) => c.slug === slug)) return setError('A category with this URL name already exists.');
    const { original, subsText, ...rest } = form;
    const cat = { ...rest, slug, name: form.name.trim(), shortName: form.shortName.trim() || form.name.trim(), subcategories: subsText.split('\n').map((s) => s.trim()).filter(Boolean), scene: form.scene || 'kitchen', image: form.image || 'egn-1500' };
    upsert('categories', cat, 'slug', original);
    if (!original) setColl('categories', (list) => [...list.filter((c) => c.slug !== slug), cat]); // new categories go last
    log(`${original ? 'updated' : 'added'} category ${cat.name}`, user.name);
    setForm(null);
  };
  const move = (i, d) => setColl('categories', (list) => { const a = [...list]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const del = (c) => {
    if (count(c.slug) > 0) return window.alert(`${c.name} still has ${count(c.slug)} products. Move or delete them first.`);
    if (window.confirm(`Delete category ${c.name}?`)) { remove('categories', c.slug, 'slug'); log(`deleted category ${c.name}`, user.name); }
  };

  return (
    <>
      <Head title="Categories" sub="Order here is the order in the storefront menu and homepage.">
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ name: '', slug: '', shortName: '', tagline: '', description: '', image: '', scene: 'kitchen', featured: false, subsText: '' }); setError(''); }}>Add category</button>
      </Head>
      <div className="ad-tablewrap"><table className="ad-table">
        <thead><tr><th>Order</th><th>Category</th><th>Subcategories</th><th>Products</th><th>Homepage tile</th><th>Actions</th></tr></thead>
        <tbody>{db.categories.map((c, i) => (
          <tr key={c.slug}>
            <td className="ad-actions"><button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.name} up`}>↑</button><button onClick={() => move(i, 1)} disabled={i === db.categories.length - 1} aria-label={`Move ${c.name} down`}>↓</button></td>
            <td><div className="ad-prod"><img src={productImage(c.image)} alt="" /><div><strong>{c.name}</strong><small>/category/{c.slug}</small><small>{c.tagline}</small></div></div></td>
            <td><small>{c.subcategories.join(', ') || 'None'}</small></td>
            <td className="num">{count(c.slug)}</td>
            <td><button className="ad-toggle" onClick={() => upsert('categories', { slug: c.slug, featured: !c.featured }, 'slug')}><Pill value={c.featured ? 'Large tile' : 'Standard'} tone={c.featured ? 'active' : 'draft'} /></button></td>
            <td className="ad-actions">
              <button onClick={() => { setForm({ ...c, original: c.slug, subsText: c.subcategories.join('\n') }); setError(''); }}>Edit</button>
              <a href={`/category/${c.slug}`} target="_blank" rel="noreferrer">View</a>
              <button className="ad-danger" onClick={() => del(c)}>Delete</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {form && (
        <Drawer title={form.original ? `Edit ${form.name}` : 'Add category'} onClose={() => setForm(null)}
          footer={<>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save category</button></>}>
          <div className="ad-form">
            <Text label="Name" f={form} set={setForm} k="name" />
            <Text label="Short name (menu)" f={form} set={setForm} k="shortName" />
            {!form.original && <Text wide label="URL name" f={form} set={setForm} k="slug" hint="Leave empty to generate from the name. Cannot be changed later." />}
            <Text wide label="Tagline" f={form} set={setForm} k="tagline" />
            <Area label="Description" f={form} set={setForm} k="description" />
            <Text label="Tile image" f={form} set={setForm} k="image" hint="Image URL or local product image name." />
            <Select label="Banner photo" f={form} set={setForm} k="scene" options={SCENES} />
            <Area label="Subcategories (one per line)" f={form} set={setForm} k="subsText" rows={5} />
            <Check label="Show as a large tile on the homepage" f={form} set={setForm} k="featured" />
          </div>
        </Drawer>
      )}
    </>
  );
}

export function CouponsAdmin() {
  const { db, upsert, remove, log, user } = useApp();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const save = () => {
    const code = form.code.toUpperCase().replace(/\s/g, '');
    if (!code) return setError('Enter a coupon code.');
    if (!form.original && db.coupons.some((c) => c.code === code)) return setError('This code already exists.');
    if (!(Number(form.value) > 0)) return setError('Enter a discount value greater than 0.');
    if (form.type === 'percent' && form.value > 90) return setError('Percentage discounts are limited to 90%.');
    const { original, value, ...rest } = form;
    const coupon = { ...rest, code, discount: form.type === 'percent' ? Number(value) / 100 : Number(value), minOrder: Number(form.minOrder) || 0,
      label: form.label.trim() || (form.type === 'percent' ? `${value}% Off` : `${fmtPrice(value)} Off`), used: form.used || 0 };
    upsert('coupons', coupon, 'code', original); log(`${original ? 'updated' : 'created'} coupon ${code}`, user.name); setForm(null);
  };
  return (
    <>
      <Head title="Coupons" sub="Active, unexpired coupons appear on the homepage and can be applied in the cart.">
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ code: '', label: '', description: '', type: 'percent', value: 10, minOrder: 0, category: '', active: true, expires: '' }); setError(''); }}>Create coupon</button>
      </Head>
      {db.coupons.length === 0 ? <Empty>No coupons yet. Create one to show it on the homepage.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr><th>Code</th><th>Discount</th><th>Conditions</th><th>Expires</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{db.coupons.map((c) => {
            const expired = c.expires && c.expires < today;
            return (
              <tr key={c.code}>
                <td><strong className="num">{c.code}</strong><small>{c.description}</small></td>
                <td>{c.type === 'percent' ? `${Math.round(c.discount * 100)}%` : fmtPrice(c.discount)}</td>
                <td><small>{c.minOrder ? `Min. order ${fmtPrice(c.minOrder)}` : 'No minimum'}</small><small>{c.category ? db.categories.find((x) => x.slug === c.category)?.name || c.category : 'All categories'}</small></td>
                <td>{c.expires || 'Never'}</td>
                <td className="num">{c.used || 0}</td>
                <td><button className="ad-toggle" onClick={() => upsert('coupons', { code: c.code, active: !c.active }, 'code')}><Pill value={expired ? 'Expired' : c.active ? 'Active' : 'Off'} tone={expired ? 'cancelled' : c.active ? 'active' : 'draft'} /></button></td>
                <td className="ad-actions">
                  <button onClick={() => { setForm({ ...c, original: c.code, value: c.type === 'percent' ? Math.round(c.discount * 100) : c.discount }); setError(''); }}>Edit</button>
                  <button className="ad-danger" onClick={() => window.confirm(`Delete coupon ${c.code}?`) && (remove('coupons', c.code, 'code'), log(`deleted coupon ${c.code}`, user.name))}>Delete</button>
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
      {form && (
        <Drawer title={form.original ? `Edit ${form.code}` : 'Create coupon'} onClose={() => setForm(null)}
          footer={<>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save coupon</button></>}>
          <div className="ad-form">
            <Text label="Code" f={form} set={setForm} k="code" disabled={!!form.original} />
            <Text label="Label on card" f={form} set={setForm} k="label" placeholder="10% Off" />
            <Text wide label="Description" f={form} set={setForm} k="description" />
            <Select label="Discount type" f={form} set={setForm} k="type" options={[['percent', 'Percentage'], ['flat', 'Flat amount (₹)']]} />
            <Num label={form.type === 'percent' ? 'Percent off' : 'Amount off (₹)'} f={form} set={setForm} k="value" min="0" />
            <Num label="Minimum order (₹)" f={form} set={setForm} k="minOrder" min="0" />
            <Select label="Valid for" f={form} set={setForm} k="category" options={[['', 'All categories'], ...db.categories.map((c) => [c.slug, c.name])]} />
            <Text label="Expiry date" f={form} set={setForm} k="expires" type="date" hint="Leave empty for no expiry." />
            <Check label="Active" f={form} set={setForm} k="active" />
          </div>
        </Drawer>
      )}
    </>
  );
}

export function OffersAdmin() {
  const { db, upsert, remove, setColl, log, user } = useApp();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const move = (i, d) => setColl('offers', (list) => { const a = [...list]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const save = () => {
    if (!form.title.trim()) return setError('Enter a slide title.');
    if (!db.products.some((p) => p.model === form.productModel)) return setError('Choose the product this slide links to.');
    const { factsText, ...rest } = form;
    const offer = { ...rest, id: form.id || `offer-${Date.now().toString(36)}`, facts: factsText.split(',').map((s) => s.trim()).filter(Boolean), cta: form.cta || 'Explore product' };
    const isNew = !form.id;
    upsert('offers', offer);
    if (isNew) setColl('offers', (list) => [...list.filter((o) => o.id !== offer.id), offer]);
    log(`${isNew ? 'added' : 'updated'} banner “${offer.title}”`, user.name); setForm(null);
  };
  return (
    <>
      <Head title="Homepage banners" sub="Slides in the homepage carousel, in display order. Each slide links to one product.">
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ badge: 'Featured solution', title: '', subtitle: '', productModel: db.products[0]?.model || '', factsText: '', cta: 'Explore product', tone: 'steel', active: true }); setError(''); }}>Add slide</button>
      </Head>
      {db.offers.length === 0 ? <Empty>No slides. The carousel is hidden until you add one.</Empty> : (
        <div className="ad-tablewrap"><table className="ad-table">
          <thead><tr><th>Order</th><th>Slide</th><th>Product</th><th>Badge</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{db.offers.map((o, i) => {
            const p = db.products.find((x) => x.model === o.productModel);
            return (
              <tr key={o.id}>
                <td className="ad-actions"><button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button><button onClick={() => move(i, 1)} disabled={i === db.offers.length - 1} aria-label="Move down">↓</button></td>
                <td><strong>{o.title}</strong><small>{o.subtitle}</small></td>
                <td>{p ? <div className="ad-prod"><img src={productImage(p.image)} alt="" /><div><strong>{p.model}</strong></div></div> : <Pill value="Product missing" tone="cancelled" />}</td>
                <td>{o.badge}</td>
                <td><button className="ad-toggle" onClick={() => upsert('offers', { id: o.id, active: o.active === false })}><Pill value={o.active === false ? 'Hidden' : 'Active'} tone={o.active === false ? 'draft' : 'active'} /></button></td>
                <td className="ad-actions">
                  <button onClick={() => { setForm({ ...o, factsText: (o.facts || []).join(', ') }); setError(''); }}>Edit</button>
                  <button className="ad-danger" onClick={() => window.confirm(`Delete slide “${o.title}”?`) && (remove('offers', o.id), log(`deleted banner “${o.title}”`, user.name))}>Delete</button>
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
      {form && (
        <Drawer title={form.id ? 'Edit slide' : 'Add slide'} onClose={() => setForm(null)}
          footer={<>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={save}>Save slide</button></>}>
          <div className="ad-form">
            <Text label="Badge" f={form} set={setForm} k="badge" hint="e.g. Featured solution, New product. No fake discounts." />
            <Select label="Product" f={form} set={setForm} k="productModel" options={db.products.map((p) => [p.model, `${p.model}, ${p.name}`])} />
            <Text wide label="Title" f={form} set={setForm} k="title" />
            <Area label="Subtitle" f={form} set={setForm} k="subtitle" rows={2} />
            <Text wide label="Fact chips (comma separated)" f={form} set={setForm} k="factsText" placeholder="1300 L, 2°C to 8°C, R290" />
            <Text label="Button text" f={form} set={setForm} k="cta" />
            <Select label="Image background" f={form} set={setForm} k="tone" options={[['steel', 'Steel grey'], ['ice', 'Ice blue'], ['dark', 'Deep blue']]} />
            <Check label="Active" f={form} set={setForm} k="active" />
          </div>
        </Drawer>
      )}
    </>
  );
}
