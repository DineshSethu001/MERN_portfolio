import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl } from '../../api/client.js';
import { CATEGORIES } from '../../data/site.js';
import { useToast, Toast } from '../../components/Toast.jsx';
import ProjectForm from './ProjectForm.jsx';
import { Plus, Search, Star, Edit, Trash, Up, Down, Eye, Spinner, GreetingIcon } from '../../components/Icons.jsx';
import { useGreeting } from '../../hooks/useGreeting.js';

const initials = (t) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w[0] || '')).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [confirmId, setConfirmId] = useState(null);
  const [toast, showToast] = useToast();
  const greeting = useGreeting();

  const load = useCallback(async () => {
    try {
      const d = await api.get('/projects/admin/all');
      setProjects(d.data);
      setLoadError('');
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const max = Math.max(projects.length, 1);
    const count = (fn) => projects.filter(fn).length;
    return [
      { label: 'Total projects', value: projects.length },
      { label: 'Published', value: count((p) => p.published) },
      { label: 'Featured', value: count((p) => p.featured) },
      ...CATEGORIES.map((c) => ({ label: c, value: count((p) => p.category === c) })),
    ].map((s) => ({ ...s, pct: Math.round((s.value / max) * 100) }));
  }, [projects]);

  const q = query.trim().toLowerCase();
  const filtered = projects.filter((p) =>
    (cat === 'All' || p.category === cat) &&
    (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
  );
  const canReorder = cat === 'All' && !q;

  function onSaved(project, wasEditing) {
    setProjects((list) => (wasEditing ? list.map((p) => (p._id === project._id ? project : p)) : [project, ...list]));
    setEditing(null);
    showToast(wasEditing ? 'Changes saved' : 'Project published');
  }

  async function patch(p, fields, message) {
    const data = new FormData();
    Object.entries(fields).forEach(([k, v]) => data.append(k, String(v)));
    try {
      const res = await api.putForm(`/projects/${p._id}`, data);
      setProjects((list) => list.map((x) => (x._id === p._id ? res.data : x)));
      showToast(message);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function remove(p) {
    try {
      await api.del(`/projects/${p._id}`);
      setProjects((list) => list.filter((x) => x._id !== p._id));
      if (editing?._id === p._id) setEditing(null);
      showToast('Project deleted');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setConfirmId(null);
    }
  }

  async function move(index, dir) {
    const next = [...projects];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    try {
      await api.patch('/projects/reorder', { ids: next.map((p) => p._id) });
    } catch (e) {
      showToast(e.message, 'error');
      load();
    }
  }

  function startEdit(p) {
    setEditing(p);
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <header className="admin-head fu d1">
        <div>
          <span className="greeting" style={{ marginBottom: 12 }}>
            <GreetingIcon period={greeting.period} size={16} /> {greeting.text}, admin
          </span>
          <h1>Your projects</h1>
          <span className="eyebrow">GET /api/projects/admin/all</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <Plus size={16} /> New project
        </button>
      </header>

      <div className="stats fu d2">
        {stats.map((s) => (
          <div key={s.label} className="card stat">
            <span className="label">{s.label}</span>
            <span className="value">{s.value}</span>
            <div className="bar"><span style={{ width: `${s.pct}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="admin-cols">
        <ProjectForm editing={editing} onSaved={onSaved} onCancel={() => setEditing(null)} onError={(m) => showToast(m, 'error')} />

        <section className="list-col fu d4" aria-label="Projects">
          <div className="toolbar">
            <div className="search">
              <Search size={16} />
              <label htmlFor="search" className="sr-only">Search projects</label>
              <input id="search" className="input" type="search" placeholder="Search by title or tech…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div role="group" aria-label="Filter by category" className="row-wrap" style={{ gap: 6 }}>
              {['All', ...CATEGORIES].map((c) => (
                <button key={c} type="button" className="chip" style={{ padding: '0 14px', fontSize: 12 }} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading && <div className="empty"><Spinner /> Loading projects…</div>}
          {loadError && <div className="empty">Couldn't load projects: {loadError}</div>}
          {!loading && !loadError && filtered.length === 0 && (
            <div className="empty">{projects.length ? 'No projects match your search.' : 'No projects yet — upload your first one.'}</div>
          )}

          {filtered.map((p, i) => {
            const index = projects.indexOf(p);
            const confirming = confirmId === p._id;
            return (
              <article key={p._id} className={`card row ${editing?._id === p._id ? 'editing' : ''} ${p.published ? '' : 'draft'}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="thumb">{p.coverImage ? <img src={assetUrl(p.coverImage)} alt="" /> : initials(p.title)}</div>
                <div className="row-body">
                  <div className="row-title">
                    <h3>{p.title}</h3>
                    <span className="badge" style={{ fontSize: 11 }}>{p.category}</span>
                    {p.featured && <span className="badge-solid">Featured</span>}
                    {!p.published && <span className="badge" style={{ color: 'var(--muted)', borderColor: 'var(--line-2)', fontSize: 11 }}>Draft</span>}
                  </div>
                  <p>{p.summary}</p>
                  <div className="tags">{p.tags.map((t) => <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>)}</div>
                </div>
                <div className="row-actions">
                  {confirming ? (
                    <>
                      <span style={{ fontSize: 13, color: '#f4c7b8', marginRight: 4 }}>Delete for good?</span>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Keep</button>
                    </>
                  ) : (
                    <>
                      {canReorder && (
                        <>
                          <button className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><Up /></button>
                          <button className="icon-btn" onClick={() => move(index, 1)} disabled={index === projects.length - 1} aria-label="Move down"><Down /></button>
                        </>
                      )}
                      <button className="icon-btn" style={{ color: p.featured ? 'var(--amber)' : undefined }} aria-pressed={p.featured} aria-label={p.featured ? 'Remove from featured' : 'Mark as featured'}
                        onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Removed from featured' : 'Marked as featured')}>
                        <Star filled={p.featured} />
                      </button>
                      <button className="icon-btn" aria-label={p.published ? 'Unpublish (make draft)' : 'Publish'} title={p.published ? 'Unpublish' : 'Publish'}
                        style={{ color: p.published ? 'var(--leaf)' : undefined }}
                        onClick={() => patch(p, { published: !p.published }, p.published ? 'Moved to drafts' : 'Published')}>
                        <Eye />
                      </button>
                      {p.published && <Link className="icon-btn" to={`/projects/${p.slug}`} target="_blank" aria-label="Open public page">↗</Link>}
                      <button className="icon-btn" onClick={() => startEdit(p)} aria-label="Edit project"><Edit /></button>
                      <button className="icon-btn" style={{ color: '#e69a80' }} onClick={() => setConfirmId(p._id)} aria-label="Delete project"><Trash /></button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
      <Toast toast={toast} />
    </>
  );
}
