import { useEffect, useRef, useState } from 'react';
import { api, assetUrl } from '../../api/client.js';
import { CATEGORIES } from '../../data/site.js';
import { Upload, Spinner, Close } from '../../components/Icons.jsx';

const blank = { title: '', category: 'APIs', summary: '', description: '', highlights: '', tags: '', sourceUrl: '', liveUrl: '', featured: false, published: true };

const fromProject = (p) => ({
  title: p.title, category: p.category, summary: p.summary, description: p.description || '',
  highlights: (p.highlights || []).join('\n'), tags: (p.tags || []).join(', '),
  sourceUrl: p.sourceUrl || '', liveUrl: p.liveUrl || '', featured: !!p.featured, published: p.published !== false,
});

// Create / edit form. `editing` is a project or null. Calls onSaved(project, wasEditing).
export default function ProjectForm({ editing, onSaved, onCancel, onError }) {
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    setForm(editing ? fromProject(editing) : blank);
    setFile(null);
    setPreview(editing?.coverImage ? assetUrl(editing.coverImage) : '');
    setRemoveCover(false);
    setErrors({});
  }, [editing]);

  // Free object URLs we created.
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function pickFile(f) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return setErrors((e) => ({ ...e, cover: 'Use a JPG, PNG, WebP or GIF image' }));
    if (f.size > 5 * 1024 * 1024) return setErrors((e) => ({ ...e, cover: 'Image is larger than 5 MB' }));
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveCover(false);
    setErrors((e) => ({ ...e, cover: undefined }));
  }

  function clearCover() {
    setFile(null);
    setPreview('');
    setRemoveCover(!!editing?.coverImage);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function submit(e) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
    if (file) data.append('cover', file);
    if (removeCover && !file) data.append('removeCover', 'true');

    setSaving(true);
    try {
      const res = editing ? await api.putForm(`/projects/${editing._id}`, data) : await api.postForm('/projects', data);
      onSaved(res.data, !!editing);
      if (!editing) { setForm(blank); clearCover(); }
    } catch (err) {
      setErrors(err.details || {});
      onError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const tagPreview = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
  const err = (k) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <form id="project-form" className="card project-form fu d3" onSubmit={submit} noValidate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2>{editing ? 'Edit project' : 'Upload a project'}</h2>
        {editing && <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>}
      </div>

      <label
        htmlFor="cover"
        className={`drop ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
      >
        {preview && <img src={preview} alt="" />}
        <Upload size={28} style={{ color: 'var(--leaf)' }} />
        <strong style={{ fontSize: 14 }}>{file ? file.name : preview ? 'Replace cover image' : 'Upload a cover image'}</strong>
        <small>Drag &amp; drop or click · JPG, PNG, WebP · max 5 MB</small>
        <input ref={fileInput} id="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => pickFile(e.target.files?.[0])} />
      </label>
      {preview && (
        <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: -6 }} onClick={clearCover}><Close size={14} /> Remove cover</button>
      )}
      {err('cover')}

      <div className="field">
        <label htmlFor="title">Project title</label>
        <input id="title" className="input" value={form.title} onChange={set('title')} aria-invalid={!!errors.title} placeholder="e.g. Orders & Payments API" />
        {err('title')}
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" className="input" value={form.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="field">
        <span className="label">Visibility</span>
        <div className="form-row">
          <label className="check"><input type="checkbox" checked={form.published} onChange={set('published')} />Published</label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} />Featured</label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="summary">Summary <span className="hint">· shown on the card</span></label>
        <textarea id="summary" className="input" rows={2} value={form.summary} onChange={set('summary')} aria-invalid={!!errors.summary} placeholder="What problem did it solve and for whom?" maxLength={300} />
        {err('summary')}
      </div>

      <div className="field">
        <label htmlFor="highlights">Highlights <span className="hint">· one per line</span></label>
        <textarea id="highlights" className="input" rows={3} value={form.highlights} onChange={set('highlights')} aria-invalid={!!errors.highlights} placeholder={'Idempotent webhook handling\nRedis caching for hot reads'} />
        {err('highlights')}
      </div>

      <div className="field">
        <label htmlFor="tags">Tech stack <span className="hint">· comma separated</span></label>
        <input id="tags" className="input" value={form.tags} onChange={set('tags')} aria-invalid={!!errors.tags} placeholder="Node.js, Express, MongoDB" />
        {err('tags')}
        {tagPreview.length > 0 && <div className="tags">{tagPreview.map((t, i) => <span key={t + i} className="tag fu">{t}</span>)}</div>}
      </div>

      <div className="field">
        <label htmlFor="description">Case study <span className="hint">· blank line between paragraphs</span></label>
        <textarea id="description" className="input" rows={6} value={form.description} onChange={set('description')} aria-invalid={!!errors.description} placeholder={'The problem…\n\nWhat I built…\n\nWhat I learned…'} />
        {err('description')}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="sourceUrl">Source URL</label>
          <input id="sourceUrl" className="input" type="url" value={form.sourceUrl} onChange={set('sourceUrl')} aria-invalid={!!errors.sourceUrl} placeholder="https://github.com/…" />
          {err('sourceUrl')}
        </div>
        <div className="field">
          <label htmlFor="liveUrl">Live / docs URL</label>
          <input id="liveUrl" className="input" type="url" value={form.liveUrl} onChange={set('liveUrl')} aria-invalid={!!errors.liveUrl} placeholder="https://…" />
          {err('liveUrl')}
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={saving} style={{ minHeight: 50 }}>
        {saving ? <><Spinner /> Saving…</> : <><Upload /> {editing ? 'Save changes' : 'Publish project'}</>}
      </button>
    </form>
  );
}
