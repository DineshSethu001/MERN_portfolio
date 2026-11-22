import { Link } from 'react-router-dom';
import { assetUrl } from '../api/client.js';

export default function ProjectCard({ project, index }) {
  const p = project;
  return (
    <article className="card hoverable project-card" style={{ animationDelay: `${index * 90}ms` }}>
      {p.coverImage && (
        <Link to={`/projects/${p.slug}`} className="project-cover" tabIndex={-1} aria-hidden="true">
          <img src={assetUrl(p.coverImage)} alt="" loading="lazy" />
        </Link>
      )}
      <div className="project-body">
        <div className="project-top">
          <span className="badge">{p.category}</span>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div>
          <h3><Link to={`/projects/${p.slug}`}>{p.title}</Link></h3>
          <p>{p.summary}</p>
        </div>
        {p.highlights?.length > 0 && (
          <ul className="bullets">
            {p.highlights.slice(0, 3).map((h) => <li key={h}>{h}</li>)}
          </ul>
        )}
        <div className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
        <div className="project-links">
          <Link to={`/projects/${p.slug}`}>Case study →</Link>
          {p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>}
          {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Live ↗</a>}
        </div>
      </div>
    </article>
  );
}
