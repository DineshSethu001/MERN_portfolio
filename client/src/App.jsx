import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Messages from './pages/admin/Messages.jsx';
import Settings from './pages/admin/Settings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
