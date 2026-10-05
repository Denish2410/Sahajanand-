// Sign in / Create account: a brand panel on the left that says what an
// account gets you, the form on the right.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useQuery } from '../../router/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useSeo } from '../../hooks/useSeo.js';
import './Auth.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Only allow redirects back into this site
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/account');

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

function Unavailable() {
  return (
    <p className="auth__info" role="status">
      Customer accounts are not available right now. You can still browse the range and <Link to="/contact" className="auth__link">send us an enquiry</Link>.
    </p>
  );
}

export function Login() {
  const { login, user, authReady, authConfigured, resetPassword, settings } = useApp();
  const navigate = useNavigate();
  const next = safeNext(useQuery().get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  useSeo({ title: `Sign in | ${settings.storeName}`, noindex: true });

  // Already signed in (or just signed in): continue to where they were going
  useEffect(() => {
    if (authReady && user && next !== '/account') navigate(next, { replace: true });
  }, [authReady, user, next, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setError({ field: 'email', error: 'Enter your email address.' });
    if (!password) return setError({ field: 'password', error: 'Enter your password.' });
    setBusy(true); setError(null);
    const res = await login(email, password, { remember });
    setBusy(false);
    if (!res.ok) return setError(res);
    const staff = res.user.role === 'admin' || res.user.role === 'superadmin';
    navigate(staff && next === '/account' ? '/admin' : next, { replace: true });
  };

  const sendReset = async () => {
    if (!EMAIL.test(email.trim())) return setError({ field: 'email', error: 'Enter your email address above, then choose “Email me a reset link”.' });
    setBusy(true); setError(null);
    const res = await resetPassword(email);
    setBusy(false);
    if (!res.ok) return setError(res);
    setResetMsg(`If an account exists for ${email.trim()}, a password reset link is on its way. Check your inbox and spam folder.`);
  };

  if (user) {
    const staff = user.role === 'admin' || user.role === 'superadmin';
    return (
      <Shell title="You are signed in" blurb={`Signed in as ${user.name}.`} points={[]}>
        <h2>Welcome back, {user.name.split(' ')[0]}</h2>
        <div className="auth__stack">
          <Link to="/account" className="btn btn-primary btn-block">Go to your account</Link>
          {staff && <Link to="/admin" className="btn btn-ghost btn-block">Open admin panel</Link>}
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Sign in" blurb="Get access to your orders, enquiries and saved addresses."
      points={['Track orders from dispatch to delivery', 'See every quote you have requested', 'Check out faster with saved addresses']}>
      <form onSubmit={submit} noValidate className="auth__form">
        <h2>Sign in to {settings.storeName}</h2>
        {!authConfigured && <Unavailable />}
        <div className="field">
          <label htmlFor="login-id">Email</label>
          <input id="login-id" className="input" type="email" inputMode="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="username" autoFocus aria-invalid={error?.field === 'email' ? 'true' : undefined} aria-describedby="login-err" />
        </div>
        <div className="field">
          <div className="auth__row">
            <label htmlFor="login-pw">Password</label>
            <button type="button" className="auth__link" onClick={() => { setForgot((f) => !f); setResetMsg(''); }}>Forgot password?</button>
          </div>
          <Password id="login-pw" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
            invalid={error?.field === 'password'} describedBy="login-err" autoComplete="current-password" />
        </div>
        {forgot && (
          <div className="auth__info">
            {resetMsg || (
              <>
                Enter your email above and we will send you a link to choose a new password.{' '}
                <button type="button" className="auth__link" onClick={sendReset} disabled={busy}>Email me a reset link</button>
              </>
            )}
          </div>
        )}
        {error && <p className="field-error" id="login-err" role="alert">{error.error}</p>}
        <label className="auth__check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in</label>
        <button className="btn btn-primary btn-block" disabled={busy || !authConfigured}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <div className="auth__divider"><span>New to {settings.storeName}?</span></div>
      <Link to={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="btn btn-ghost btn-block">Create your account</Link>
    </Shell>
  );
}

export function Signup() {
  const { signup, user, authReady, authConfigured, settings } = useApp();
  const navigate = useNavigate();
  const next = safeNext(useQuery().get('next'));
  const [v, setV] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined, form: undefined })); };
  useSeo({ title: `Create account | ${settings.storeName}`, noindex: true });

  useEffect(() => { if (authReady && user && !busy) navigate(next, { replace: true }); }, [authReady, user, busy, next, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!v.name.trim()) er.name = 'Enter your name.';
    if (!/^[6-9]\d{9}$/.test(v.phone.replace(/\D/g, '').slice(-10)) || v.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a 10-digit Indian mobile number.';
    if (!EMAIL.test(v.email.trim())) er.email = 'Enter an email address like name@company.com.';
    if (v.password.length < 8) er.password = 'Use at least 8 characters.';
    if (v.confirm !== v.password) er.confirm = 'Passwords do not match.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const res = await signup(v);
    setBusy(false);
    if (!res.ok) return setErrors({ [res.field]: res.error });
    navigate(next, { replace: true });
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
        <h2>Create your {settings.storeName} account</h2>
        {!authConfigured && <Unavailable />}
        {field('name', 'Your name', { autoComplete: 'name', autoFocus: true, maxLength: 100 })}
        {field('phone', 'Mobile number', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '10-digit mobile number' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {field('password', 'Password', { type: 'password' })}
        {field('confirm', 'Re-enter password', { type: 'password' })}
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <button className="btn btn-primary btn-block" disabled={busy || !authConfigured}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="auth__divider"><span>Already have an account?</span></div>
      <Link to={`/login${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="btn btn-ghost btn-block">Sign in</Link>
    </Shell>
  );
}
