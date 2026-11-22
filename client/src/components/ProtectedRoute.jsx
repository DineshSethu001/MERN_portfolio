import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './Icons.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-screen" role="status">
        <Spinner size={28} /> <span className="sr-only">Checking your session…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
