import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, assetUrl } from '../api/client.js';
import { site } from '../data/site.js';
import ForestBackground from '../components/ForestBackground.jsx';
import Navbar from '../components/Navbar.jsx';
import { ArrowLeft, Spinner, Github, External } from '../components/Icons.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    api.get(`/projects/${encodeURIComponent(slug)}`)
      .then((d) => { setProject(d.data); setStatus('ready'); document.title = `${d.data.title} — ${site.name}`; })
      .catch((e) => setStatus(e.status === 404 ? 'missing' : 'error'));
    window.scrollTo(0, 0);
  }, [slug]);

  const paragraphs = (project?.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <ForestBackground fireflies={20} leaves={6} />
      <div className="page">
        <Navbar home={false} />
        <main className="container detail">
          <Link to="/#projects" className="detail-back"><ArrowLeft size={16} /> all projects</Link>

          {status === 'loading' && <div role="status"><Spinner size={28} /></div>}
          {status === 'missing' && <div className="empty">That project doesn't exist or isn't published.</div>}
          {status === 'error' && <div className="empty">Couldn't load this project. Please try again.</div>}

          {status === 'ready' && project && (
            <article>
              <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820 }}>
                <span className="badge" style={{ alignSelf: 'flex-start' }}>{project.category}</span>
                <h1 className="h1" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>{project.title}</h1>
                <p className="lead" style={{ fontSize: 19 }}>{project.summary}</p>
              </div>

              {project.coverImage && (
                <div className="detail-cover fu d2"><img src={assetUrl(project.coverImage)} alt={`${project.title} cover`} /></div>
              )}

              <div className="detail-grid fu d3" style={{ marginTop: project.coverImage ? 0 : 40 }}>
                <div className="detail-main">
                  {paragraphs.length > 0
                    ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
                    : <p style={{ color: 'var(--muted)' }}>No case study written yet.</p>}
                </div>
                <aside className="card detail-side">
                  {project.highlights?.length > 0 && (
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 10 }}>highlights</div>
                      <ul className="bullets">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
                    </div>
                  )}
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>stack</div>
                    <div className="tags">{project.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  </div>
                  {(project.sourceUrl || project.liveUrl) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {project.sourceUrl && <a className="btn btn-ghost" href={project.sourceUrl} target="_blank" rel="noreferrer"><Github /> Source code</a>}
                      {project.liveUrl && <a className="btn btn-primary" href={project.liveUrl} target="_blank" rel="noreferrer"><External /> Live / docs</a>}
                    </div>
                  )}
                </aside>
              </div>
            </article>
          )}
        </main>
      </div>
    </>
  );
}
