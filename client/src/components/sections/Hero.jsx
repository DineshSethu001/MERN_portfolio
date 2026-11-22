import { site } from '../../data/site.js';
import ApiConsole from '../ApiConsole.jsx';
import Treeline from '../Treeline.jsx';
import { ArrowRight, Github, GreetingIcon } from '../Icons.jsx';
import { useGreeting } from '../../hooks/useGreeting.js';

export default function Hero() {
  const greeting = useGreeting();
  return (
    <section id="top" className="hero">
      <div className="moon" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="row-wrap fu d1" style={{ alignItems: 'center', gap: 12 }}>
            <div className="greeting" key={greeting.text} aria-live="polite">
              <GreetingIcon period={greeting.period} size={16} />
              <span>{greeting.text}!</span>
            </div>
            <div className="status"><span className="dot pulse" />status: available for work</div>
          </div>
          <h1 className="h1 fu d2">I build the <span className="accent">full stack</span> your product is rooted in.</h1>
          <p className="hero-sub fu d3">{greeting.text} — I'm <strong>{site.name}</strong>, {site.intro} <span className="greeting-note">{greeting.note}</span></p>
          <div className="row-wrap fu d4">
            <a className="btn btn-primary" href="#projects">View my work <ArrowRight size={16} /></a>
            <a className="btn btn-ghost" href={site.github} target="_blank" rel="noreferrer"><Github /> GitHub</a>
          </div>
          <div className="tech-line fu d5">
            {site.heroTech.map((t, i) => (
              <span key={t}>{i > 0 && <span className="sep">/ </span>}{t}</span>
            ))}
          </div>
        </div>
        <div className="console-wrap fu d3">
          <ApiConsole />
        </div>
      </div>
      <Treeline />
    </section>
  );
}
