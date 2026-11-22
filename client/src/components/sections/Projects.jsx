import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client.js';
import { CATEGORIES } from '../../data/site.js';
import Reveal from '../Reveal.jsx';
import ProjectCard from '../ProjectCard.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const ctrl = new AbortController();
    api.get('/projects', { signal: ctrl.signal })
      .then((d) => { setProjects(d.data); setStatus('ready'); })
      .catch((e) => { if (e.name !== 'AbortError') { setError(e.message); setStatus('error'); } });
    return () => ctrl.abort();
  }, []);

  // Only show category filters that actually have projects.
  const filters = useMemo(() => ['All', ...CATEGORIES.filter((c) => projects.some((p) => p.category === c))], [projects]);
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="section container">
      <Reveal className="projects-head">
        <div className="section-head">
          <span className="eyebrow">03 — selected work</span>
          <h2 className="h2">Projects</h2>
          <p className="lead">Full-stack apps I've designed and shipped, served live from this site's own Express + MongoDB API.</p>
        </div>
        {filters.length > 2 && (
          <div role="group" aria-label="Filter projects" className="row-wrap" style={{ gap: 8 }}>
            {filters.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        )}
      </Reveal>

      {status === 'loading' && (
        <div className="projects-grid" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="card skeleton" />)}
        </div>
      )}
      {status === 'error' && <div className="empty">Couldn't load projects: {error}</div>}
      {status === 'ready' && shown.length === 0 && <div className="empty">No projects published yet — add some from the admin dashboard.</div>}
      {status === 'ready' && shown.length > 0 && (
        <div className="projects-grid" key={filter}>
          {shown.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
        </div>
      )}
    </section>
  );
}
