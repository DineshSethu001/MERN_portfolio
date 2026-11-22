import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { site } from '../../data/site.js';
import ForestBackground from '../../components/ForestBackground.jsx';
import Treeline from '../../components/Treeline.jsx';
import { ArrowLeft, Pine, Alert, Spinner, GreetingIcon } from '../../components/Icons.jsx';
import { useGreeting } from '../../hooks/useGreeting.js';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const greeting = useGreeting();

  if (!loading && user) return <Navigate to={location.state?.from || '/admin'} replace />;

  const fail = (msg) => { setError(msg); setShakeKey((k) => k + 1); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return fail('Enter a valid email address.');
    if (!password) return fail('Enter your password.');
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      fail(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <ForestBackground fireflies={26} leaves={6} />
      <main className="login">
        <div className="login-inner">
          <div className="login-copy fu">
            <Link to="/" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', minHeight: 44 }}>
              <ArrowLeft size={16} /> back to portfolio
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--moss)', border: '1px solid #2e5a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--leaf)' }}><Pine size={22} /></span>
              <span className="mono" style={{ fontWeight: 700 }}>~/{site.handle}<span className="accent">/admin</span></span>
            </div>
            <span className="greeting" style={{ alignSelf: 'flex-start' }}><GreetingIcon period={greeting.period} size={16} /> {greeting.text}</span>
            <h1 className="h1" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Welcome back to <span className="accent">the grove.</span></h1>
            <p className="lead" style={{ maxWidth: 420 }}>Sign in to publish projects, write case studies and read messages from your contact form.</p>
          </div>

          <form key={shakeKey} className={`card login-card ${shakeKey ? 'shake' : ''}`} onSubmit={submit} noValidate>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 26 }}>Admin sign in</h2>
              <span className="mono" style={{ color: 'var(--muted-2)', fontSize: 13 }}>POST /api/auth/login</span>
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} style={{ minHeight: 48 }} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input id="password" className="input" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} style={{ minHeight: 48 }} />
                <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            {error && <div className="alert alert-error" role="alert"><Alert size={16} />{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ minHeight: 50 }}>
              {busy ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
            <p className="mono" style={{ margin: 0, fontSize: 12, color: 'var(--muted-2)', borderTop: '1px dashed var(--line-2)', paddingTop: 14 }}>
              The admin account is created with <span className="accent">npm run seed</span> using ADMIN_EMAIL / ADMIN_PASSWORD from server/.env
            </p>
          </form>
        </div>
        <Treeline layers={2} baseColor="#0A1C12" />
      </main>
    </>
  );
}
