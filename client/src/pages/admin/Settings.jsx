import { useState } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast, Toast } from '../../components/Toast.jsx';
import { Alert, Lock, Spinner } from '../../components/Icons.jsx';

const blank = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
    setError('');
  };

  function check() {
    const er = {};
    if (!form.currentPassword) er.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 10) er.newPassword = 'Use at least 10 characters';
    else if (form.newPassword === form.currentPassword) er.newPassword = 'New password must be different from the current one';
    if (form.confirmPassword !== form.newPassword) er.confirmPassword = "Passwords don't match";
    return er;
  }

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    const er = check();
    if (Object.keys(er).length) return setErrors(er);

    setSaving(true);
    try {
      await api.patch('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm(blank);
      setErrors({});
      showToast('Password updated');
    } catch (err) {
      setErrors(err.details || {});
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const type = showPw ? 'text' : 'password';
  const err = (k) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <>
      <header className="admin-head fu d1">
        <div>
          <span className="eyebrow">PATCH /api/auth/password</span>
          <h1>Settings</h1>
        </div>
      </header>

      <form className="card fu d2" onSubmit={submit} noValidate style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--moss)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--leaf)' }}><Lock size={20} /></span>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: 22 }}>Change password</h2>
            <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>Signed in as {user?.email}</span>
          </div>
        </div>

        <input type="email" autoComplete="username" value={user?.email || ''} readOnly hidden />

        <div className="field">
          <label htmlFor="currentPassword">Current password</label>
          <input id="currentPassword" className="input" type={type} autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} aria-invalid={!!errors.currentPassword} />
          {err('currentPassword')}
        </div>
        <div className="field">
          <label htmlFor="newPassword">New password <span className="hint">(10+ characters)</span></label>
          <input id="newPassword" className="input" type={type} autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} aria-invalid={!!errors.newPassword} />
          {err('newPassword')}
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" className="input" type={type} autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
          {err('confirmPassword')}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
          <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show passwords
        </label>

        {error && <div className="alert alert-error" role="alert"><Alert size={16} />{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><Spinner /> Saving…</> : 'Update password'}
        </button>
        <p className="mono" style={{ margin: 0, fontSize: 12, color: 'var(--muted-2)', borderTop: '1px dashed var(--line-2)', paddingTop: 14 }}>
          Forgot it? Set ADMIN_PASSWORD in server/.env and run <span className="accent">npm run seed -- --reset-password</span>
        </p>
      </form>
      <Toast toast={toast} />
    </>
  );
}
