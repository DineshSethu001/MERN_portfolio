import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ForestBackground from '../../components/ForestBackground.jsx';
import { Pine, Grid, Mail, Eye, Logout, Lock } from '../../components/Icons.jsx';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    api.get('/messages').then((d) => setUnread(d.unread)).catch(() => {});
  }, []);
  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  async function signOut() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <>
      <ForestBackground fireflies={20} leaves={0} />
      <div className="admin">
        <aside className="sidebar fu">
          <Link to="/admin" className="brand" style={{ padding: '0 8px', fontSize: 14 }}>
            <Pine size={22} style={{ color: 'var(--leaf)' }} /> grove<span className="accent">/admin</span>
          </Link>
          <nav className="side-nav" aria-label="Admin">
            <NavLink end to="/admin" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Grid /> Projects</NavLink>
            <NavLink to="/admin/messages" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <Mail /> Messages {unread > 0 && <span className="count" aria-label={`${unread} unread`}>{unread}</span>}
            </NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Lock /> Settings</NavLink>
            <Link to="/" className="side-link"><Eye /> View portfolio</Link>
          </nav>
          <div className="user-chip">
            <span className="avatar">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Admin</span>
              <span style={{ fontSize: 12, color: 'var(--muted-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
            </div>
            <button className="icon-btn" onClick={signOut} aria-label="Log out"><Logout /></button>
          </div>
        </aside>
        <main className="admin-main">
          <Outlet context={{ refreshUnread }} />
        </main>
      </div>
    </>
  );
}
