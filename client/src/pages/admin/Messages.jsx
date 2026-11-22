import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useToast, Toast } from '../../components/Toast.jsx';
import { Mail, Trash, Check, Spinner } from '../../components/Icons.jsx';

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function Messages() {
  const { refreshUnread } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const [toast, showToast] = useToast();

  useEffect(() => {
    api.get('/messages')
      .then((d) => setMessages(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function setRead(m, read) {
    try {
      const d = await api.patch(`/messages/${m._id}`, { read });
      setMessages((list) => list.map((x) => (x._id === m._id ? d.data : x)));
      refreshUnread();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function remove(m) {
    try {
      await api.del(`/messages/${m._id}`);
      setMessages((list) => list.filter((x) => x._id !== m._id));
      refreshUnread();
      showToast('Message deleted');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setConfirmId(null); }
  }

  const unread = messages.filter((m) => !m.read).length;
  const shown = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  return (
    <>
      <header className="admin-head fu d1">
        <div>
          <span className="eyebrow">GET /api/messages</span>
          <h1>Messages</h1>
        </div>
        <div role="group" aria-label="Filter messages" className="row-wrap" style={{ gap: 6 }}>
          <button className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All ({messages.length})</button>
          <button className="chip" aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Unread ({unread})</button>
        </div>
      </header>

      {loading && <div className="empty"><Spinner /> Loading messages…</div>}
      {error && <div className="empty">Couldn't load messages: {error}</div>}
      {!loading && !error && shown.length === 0 && (
        <div className="empty">{filter === 'unread' ? 'All caught up.' : 'No messages yet. They will appear here when someone uses your contact form.'}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map((m, i) => (
          <article key={m._id} className={`card msg ${m.read ? '' : 'unread'}`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="msg-head">
              {!m.read && <span className="dot-new" aria-label="Unread" />}
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`} className="mono" style={{ fontSize: 13 }}>{m.email}</a>
              <span className="when">{fmt(m.createdAt)}</span>
            </div>
            {m.subject && <div style={{ fontWeight: 600 }}>{m.subject}</div>}
            <p className="msg-body">{m.body}</p>
            <div className="row-wrap" style={{ gap: 8 }}>
              {confirmId === m._id ? (
                <>
                  <span style={{ fontSize: 13, color: '#f4c7b8', alignSelf: 'center' }}>Delete this message?</span>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(m)}>Delete</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Keep</button>
                </>
              ) : (
                <>
                  <a className="btn btn-primary btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'your message'))}`} onClick={() => !m.read && setRead(m, true)}><Mail size={16} /> Reply</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => setRead(m, !m.read)}><Check size={16} /> Mark {m.read ? 'unread' : 'read'}</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: '#e69a80' }} onClick={() => setConfirmId(m._id)}><Trash size={16} /> Delete</button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <Toast toast={toast} />
    </>
  );
}
