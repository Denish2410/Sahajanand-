// Sign in / Create account, laid out like the big marketplaces: a brand panel
// on the left that says what an account gets you, the form on the right,
// and a single "email or mobile number" field.
import { useState } from 'react';
import { Link, useNavigate, useQuery } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { DEMO_USER, DEMO_ADMIN } from '../../services/store.js';
import './Auth.css';

function Shell({ title, blurb, points, children }) {
  return (
    <div className="auth">
      <div className="auth__card">
        <aside className="auth__side">
          <h1>{title}</h1>
          <p>{blurb}</p>
          <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
        </aside>
        <div className="auth__main">{children}</div>
      </div>
    </div>
  );
}

function Password({ id, value, onChange, invalid, describedBy, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth__pw">
      <input id={id} className="input" type={show ? 'text' : 'password'} value={value} onChange={onChange}
        aria-invalid={invalid ? 'true' : undefined} aria-describedby={describedBy} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button>
    </div>
  );
}

export function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const next = useQuery().get('next') || '/account';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [forgot, setForgot] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return setError({ field: 'identifier', error: 'Enter your email or mobile number.' });
    if (!password) return setError({ field: 'password', error: 'Enter your password.' });
    const res = login(identifier, password, { remember });
    if (!res.ok) return setError(res);
    navigate(res.user.role === 'admin' && next === '/account' ? '/admin' : next);
  };
  const fill = (c) => { setIdentifier(c.email); setPassword(c.password); setError(null); };

  if (user) {
    return (
      <Shell title="You are signed in" blurb={`Signed in as ${user.name}.`} points={[]}>
        <h2>Welcome back, {user.name.split(' ')[0]}</h2>
        <div className="auth__stack">
          <Link to="/account" className="btn btn-primary btn-block">Go to your account</Link>
          {user.role === 'admin' && <Link to="/admin" className="btn btn-ghost btn-block">Open admin panel</Link>}
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Sign in" blurb="Get access to your orders, enquiries and saved addresses."
      points={['Track orders from dispatch to delivery', 'See every quote you have requested', 'Check out faster with saved addresses']}>
      <form onSubmit={submit} noValidate className="auth__form">
        <h2>Sign in to Elanpro</h2>
        <div className="field">
          <label htmlFor="login-id">Email or mobile number</label>
          <input id="login-id" className="input" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
            autoComplete="username" autoFocus aria-invalid={error?.field === 'identifier' ? 'true' : undefined} aria-describedby="login-err" />
        </div>
        <div className="field">
          <div className="auth__row">
            <label htmlFor="login-pw">Password</label>
            <button type="button" className="auth__link" onClick={() => setForgot((f) => !f)}>Forgot password?</button>
          </div>
          <Password id="login-pw" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
            invalid={error?.field === 'password'} describedBy="login-err" autoComplete="current-password" />
        </div>
        {forgot && <p className="auth__info">Password reset by email is not connected in this prototype. An admin can set a new password for you from Admin, Customers.</p>}
        {error && <p className="field-error" id="login-err" role="alert">{error.error}</p>}
        <label className="auth__check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in</label>
        <button className="btn btn-primary btn-block">Sign in</button>
        <p className="auth__legal">By continuing, you agree to Elanpro’s conditions of use and privacy notice.</p>
      </form>

      <div className="auth__demo">
        <p><strong>Demo accounts</strong> (tap to fill)</p>
        <button type="button" onClick={() => fill(DEMO_USER)}><span>Customer</span><code>{DEMO_USER.email}</code><code>{DEMO_USER.password}</code></button>
        <button type="button" onClick={() => fill(DEMO_ADMIN)}><span>Admin</span><code>{DEMO_ADMIN.email}</code><code>{DEMO_ADMIN.password}</code></button>
      </div>

      <div className="auth__divider"><span>New to Elanpro?</span></div>
      <Link to={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="btn btn-ghost btn-block">Create your account</Link>
      <p className="auth__admin"><Link to="/admin/login">Admin sign in</Link></p>
    </Shell>
  );
}

export function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const next = useQuery().get('next') || '/account';
  const [v, setV] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!v.name.trim()) er.name = 'Enter your name.';
    if (v.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) er.email = 'Enter an email address like name@company.com.';
    if (v.password.length < 6) er.password = 'Use at least 6 characters.';
    if (v.confirm !== v.password) er.confirm = 'Passwords do not match.';
    setErrors(er);
    if (Object.keys(er).length) return;
    const res = signup(v);
    if (!res.ok) return setErrors({ [res.field]: res.error });
    navigate(next);
  };
  const field = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={`su-${k}`}>{label}</label>
      {props.type === 'password'
        ? <Password id={`su-${k}`} value={v[k]} onChange={set(k)} invalid={!!errors[k]} describedBy={`su-${k}-err`} autoComplete="new-password" />
        : <input id={`su-${k}`} className="input" value={v[k]} onChange={set(k)} aria-invalid={errors[k] ? 'true' : undefined} aria-describedby={`su-${k}-err`} {...props} />}
      {errors[k] && <p className="field-error" id={`su-${k}-err`}>{errors[k]}</p>}
    </div>
  );

  return (
    <Shell title="Create account" blurb="One account for orders, quotes and faster checkout."
      points={['Order equipment online', 'Request and track quotations', 'Save delivery addresses and GST details']}>
      <form onSubmit={submit} noValidate className="auth__form">
        <h2>Create your Elanpro account</h2>
        {field('name', 'Your name', { autoComplete: 'name', autoFocus: true })}
        {field('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '10-digit mobile number' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {field('password', 'Password', { type: 'password' })}
        {field('confirm', 'Re-enter password', { type: 'password' })}
        <button className="btn btn-primary btn-block">Create account</button>
        <p className="auth__legal">By creating an account, you agree to Elanpro’s conditions of use and privacy notice.</p>
      </form>
      <div className="auth__divider"><span>Already have an account?</span></div>
      <Link to="/login" className="btn btn-ghost btn-block">Sign in</Link>
    </Shell>
  );
}
