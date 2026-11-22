import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { site } from '../../data/site.js';
import Reveal from '../Reveal.jsx';
import Treeline from '../Treeline.jsx';
import { Lock, Spinner, Check, Alert } from '../Icons.jsx';

const EMPTY = { name: '', email: '', subject: '', body: '', website: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', message: '' });
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    setState({ status: 'sending', message: '' });
    try {
      const d = await api.post('/messages', form);
      setForm(EMPTY);
      setErrors({});
      setState({ status: 'sent', message: d.message });
    } catch (err) {
      setErrors(err.details || {});
      setState({ status: 'error', message: err.message });
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }

  const field = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={`c-${k}`}>{label}</label>
      {props.multiline ? (
        <textarea id={`c-${k}`} className="input" rows={5} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} required={props.required} maxLength={5000} />
      ) : (
        <input id={`c-${k}`} className="input" type={props.type || 'text'} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} required={props.required} autoComplete={props.autoComplete} />
      )}
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <section id="contact" className="contact">
      <div className="container contact-inner">
        <Reveal className="card contact-card">
          <div className="contact-copy">
            <span className="eyebrow">04 — POST /api/messages</span>
            <h2 className="h2">Have an API that needs building?</h2>
            <p className="lead">Open to full-time MERN stack roles and freelance projects. Tell me what you're working on — I usually reply within a day.</p>
            <div className="contact-links">
              <div className="copy-row">
                <span>{site.email}</span>
                <button type="button" className="btn btn-primary btn-sm mono" onClick={copyEmail}>{copied ? 'copied ✓' : 'copy'}</button>
              </div>
              <div className="link-grid">
                <a className="btn btn-ghost" href={site.github} target="_blank" rel="noreferrer">GitHub</a>
                <a className="btn btn-ghost" href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                {site.resume && <a className="btn btn-ghost" href={site.resume} target="_blank" rel="noreferrer">Résumé</a>}
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="form-row">
              {field('name', 'Name', { required: true, autoComplete: 'name' })}
              {field('email', 'Email', { type: 'email', required: true, autoComplete: 'email' })}
            </div>
            {field('subject', 'Subject (optional)')}
            {field('body', 'Message', { multiline: true, required: true })}
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="c-website">Website</label>
              <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>
            {state.status === 'sent' && <div className="alert alert-ok" role="status"><Check size={16} />{state.message}</div>}
            {state.status === 'error' && <div className="alert alert-error" role="alert"><Alert size={16} />{state.message}</div>}
            <button className="btn btn-primary" type="submit" disabled={state.status === 'sending'}>
              {state.status === 'sending' ? <><Spinner /> Sending…</> : 'Send message'}
            </button>
          </form>
        </Reveal>
      </div>
      <Treeline height={300} layers={2} baseColor="#0A1C12" />
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} {site.name} · built with MongoDB, Express, React &amp; Node.js</span>
          <Link to="/admin"><Lock size={14} /> admin</Link>
        </div>
      </footer>
    </section>
  );
}
