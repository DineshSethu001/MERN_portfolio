import { site } from '../../data/site.js';
import Reveal from '../Reveal.jsx';
import { Arrow28 } from '../Icons.jsx';

export function MernStrip() {
  return (
    <section className="container" style={{ paddingTop: 24, paddingBottom: 96 }}>
      <Reveal className="mern-grid">
        {site.mern.map((m) => (
          <div key={m.letter} className={`mern ${m.level !== 'core' ? 'secondary' : ''}`}>
            <div className="mern-top"><span className="big">{m.letter}</span><span className="lvl">{m.level}</span></div>
            <h3>{m.name}</h3>
            <p>{m.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function Stack() {
  return (
    <section id="stack" className="section container">
      <Reveal className="section-head">
        <span className="eyebrow">01 — toolbox</span>
        <h2 className="h2">The stack I reach for</h2>
        <p className="lead">Boring, proven tools — chosen for the problem, not the hype.</p>
      </Reveal>
      <div className="grid-auto">
        {site.stack.map((g, i) => (
          <Reveal key={g.code} delay={i * 70} className="card hoverable stack-card">
            <div className="head"><span className="code-badge">{g.code}</span>{g.title}</div>
            <div className="pills">{g.items.map((it) => <span key={it} className="pill-outline">{it}</span>)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Architecture() {
  return (
    <section id="architecture" className="section container">
      <Reveal className="section-head">
        <span className="eyebrow">02 — how I build</span>
        <h2 className="h2">Anatomy of a request</h2>
        <p className="lead">The shape most of my services take — every layer has one job, and every request is traceable from edge to database.</p>
      </Reveal>
      <Reveal className="card arch" role="img" aria-label="Request flow: React client to Nginx to Express API, which uses MongoDB, Redis and BullMQ">
        <div className="node card hoverable"><span className="kind">client</span><span className="name">React app</span><span className="note">HTTPS / WebSocket</span></div>
        <div className="arrow"><Arrow28 /></div>
        <div className="node card hoverable"><span className="kind">edge</span><span className="name">Nginx / LB</span><span className="note">TLS, rate limits</span></div>
        <div className="arrow"><Arrow28 /></div>
        <div className="node main card hoverable"><span className="kind">api</span><span className="name">Express on Node.js</span><span className="note">auth → validate → controller → service</span></div>
        <div className="arrow"><Arrow28 /></div>
        <div className="stores">
          <div className="store card hoverable"><span>MongoDB</span><span>source of truth</span></div>
          <div className="store card hoverable"><span>Redis</span><span>cache · sessions</span></div>
          <div className="store card hoverable"><span>BullMQ</span><span>background jobs</span></div>
        </div>
      </Reveal>
      <div className="grid-auto">
        {site.principles.map((p, i) => (
          <Reveal key={p.tag} delay={i * 80} className="principle">
            <span className="tag-line">// {p.tag}</span>
            <strong>{p.title}</strong>
            <span>{p.text}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
