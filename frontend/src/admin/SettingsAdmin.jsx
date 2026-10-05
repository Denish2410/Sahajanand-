import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { fmtDateTime } from '../utils/format.js';
import { Head, Text, Num, Area, Check, Pager, usePaged, download, exportCSV } from './ui.jsx';

export function SettingsAdmin() {
  const { db, setColl, updateProfile, resetDemo, importDb, log, user } = useApp();
  const [s, setS] = useState(db.settings);
  const [me, setMe] = useState({ name: user.name, phone: user.phone, current: '', next: '' });
  const [msg, setMsg] = useState('');
  const file = useRef(null);
  const flash = (m) => { setMsg(m); window.scrollTo(0, 0); };

  const saveStore = () => {
    if (!s.storeName.trim()) return flash('Store name cannot be empty.');
    if (s.gstPercent < 0 || s.gstPercent > 40) return flash('GST must be between 0 and 40%.');
    setColl('settings', { ...s, gstPercent: Number(s.gstPercent) || 0, shippingFlat: Number(s.shippingFlat) || 0, freeShippingAbove: Number(s.freeShippingAbove) || 0, lowStockThreshold: Number(s.lowStockThreshold) || 0 });
    log('updated store settings', user.name); flash('Settings saved. The storefront is updated.');
  };
  const saveMe = () => {
    if (!me.name.trim()) return flash('Name cannot be empty.');
    const patch = { name: me.name.trim(), phone: me.phone };
    if (me.next) {
      if (me.current !== user.password) return flash('Current password is incorrect.');
      if (me.next.length < 6) return flash('New password must be at least 6 characters.');
      patch.password = me.next;
    }
    updateProfile(patch); setMe({ ...me, current: '', next: '' }); flash(me.next ? 'Profile and password updated.' : 'Profile updated.');
  };
  const onImport = (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => {
      const data = JSON.parse(t);
      if (!Array.isArray(data.products) || !Array.isArray(data.users)) throw new Error('bad');
      if (!data.users.some((u) => u.id === user.id)) return flash('Import stopped: the backup does not contain your admin account.');
      importDb(data); log('imported a data backup', user.name); flash('Backup imported.');
    }).catch(() => flash('That file is not a valid Elanpro backup (.json).'));
    e.target.value = '';
  };

  return (
    <>
      <Head title="Settings" sub="Storefront content, tax and shipping, your admin account and data tools." />
      {msg && <p className="acct__msg" role="status">{msg}</p>}

      <section className="ad-card">
        <h2>Storefront</h2>
        <div className="ad-form">
          <Text label="Store name" f={s} set={setS} k="storeName" />
          <Text label="Announcement bar text" f={s} set={setS} k="announcement" hint="Shown in the dark strip above the header." />
          <Text label="Support phone" f={s} set={setS} k="supportPhone" />
          <Text label="Support email" f={s} set={setS} k="supportEmail" type="email" />
          <Text wide label="Homepage headline" f={s} set={setS} k="heroTitle" />
          <Area label="Homepage intro text" f={s} set={setS} k="heroLede" rows={2} />
        </div>
        <h2>Tax, shipping and inventory</h2>
        <div className="ad-form">
          <Num label="GST (%)" f={s} set={setS} k="gstPercent" min="0" max="40" />
          <Num label="Flat shipping charge (₹)" f={s} set={setS} k="shippingFlat" min="0" />
          <Num label="Free shipping above (₹)" f={s} set={setS} k="freeShippingAbove" min="0" />
          <Num label="Low-stock alert at or below" f={s} set={setS} k="lowStockThreshold" min="0" />
          <Check label="Maintenance mode (storefront shows a notice to customers; admins still see the site)" f={s} set={setS} k="maintenanceMode" />
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveStore}>Save settings</button>
      </section>

      <section className="ad-card">
        <h2>Your admin account</h2>
        <div className="ad-form">
          <Text label="Name" f={me} set={setMe} k="name" />
          <Text label="Mobile number" f={me} set={setMe} k="phone" />
          <div className="field"><label htmlFor="st-email">Email (sign-in ID)</label><input id="st-email" className="input" value={user.email} disabled /></div>
          <div />
          <Text label="Current password" f={me} set={setMe} k="current" type="password" autoComplete="current-password" />
          <Text label="New password" f={me} set={setMe} k="next" type="password" autoComplete="new-password" hint="Leave empty to keep your password." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveMe}>Update account</button>
      </section>

      <section className="ad-card">
        <h2>Data tools</h2>
        <p className="muted">All data in this prototype lives in this browser (localStorage). Use a backup to move it to another browser.</p>
        <div className="ad-head__actions">
          <button className="btn btn-ghost btn-sm" onClick={() => download(`elanpro-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(db, null, 2), 'application/json')}>Download backup (.json)</button>
          <button className="btn btn-ghost btn-sm" onClick={() => file.current.click()}>Import backup</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={onImport} />
          <button className="btn btn-ghost btn-sm ad-danger" onClick={() => window.confirm('Reset everything to the original demo data? All changes, orders and accounts created since will be lost.') && (resetDemo(), setS(db.settings), flash('Demo data restored. If you changed the admin password, it is back to the demo password.'))}>Reset demo data</button>
        </div>
      </section>
    </>
  );
}

export function ActivityAdmin() {
  const { db, setColl } = useApp();
  const [q, setQ] = useState('');
  const rows = db.activity.filter((a) => !q || `${a.by} ${a.action}`.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(rows, 20);
  return (
    <>
      <Head title="Activity log" sub="The last 200 changes made in the admin panel.">
        <button className="btn btn-ghost btn-sm" onClick={() => exportCSV('activity.csv', rows, [['When', (a) => fmtDateTime(a.at)], ['Who', 'by'], ['Action', 'action']])}>Export CSV</button>
        <button className="btn btn-ghost btn-sm ad-danger" onClick={() => window.confirm('Clear the activity log?') && setColl('activity', [])}>Clear log</button>
      </Head>
      <div className="ad-toolbar"><input className="input" type="search" placeholder="Search the log" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search activity" /></div>
      <section className="ad-card">
        {rows.length === 0 ? <p className="muted">Nothing logged yet. Changes you make in the panel appear here.</p> : <ul className="ad-log">{pg.slice.map((a) => <li key={a.id}><time>{fmtDateTime(a.at)}</time><span><strong>{a.by}</strong> {a.action}</span></li>)}</ul>}
      </section>
      <Pager {...pg} onPage={pg.setPage} />
    </>
  );
}
