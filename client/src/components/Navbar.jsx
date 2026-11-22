import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../data/site.js';
import { Pine, Menu, Close } from './Icons.jsx';

const LINKS = ['stack', 'architecture', 'projects'];

export default function Navbar({ home = true }) {
  const [open, setOpen] = useState(false);
  const href = (id) => (home ? `#${id}` : `/#${id}`);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <nav className="container nav-inner" aria-label="Main">
        <Link to="/" className="brand" onClick={close}>
          <Pine size={22} style={{ color: 'var(--leaf)' }} />
          <span><span className="accent">~/</span>{site.handle}</span>
          <span className="cursor caret" />
        </Link>
        <button className="icon-btn nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <Close /> : <Menu />}
        </button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <a key={l} className="nav-link" href={href(l)} onClick={close}>{l}</a>
          ))}
          <a className="btn btn-primary btn-sm mono" href={href('contact')} onClick={close}>hire_me()</a>
        </div>
      </nav>
    </header>
  );
}
