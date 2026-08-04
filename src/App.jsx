import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import FlottePage from './pages/FlottePage.jsx';
import AdminMembersPage from './pages/AdminMembersPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminLogsPage from './pages/AdminLogsPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<FlottePage />} />
          <Route path="/vaisseaux" element={<Navigate to="/" replace />} />
          <Route
            path="/admin/membres"
            element={
              <ProtectedRoute roles={['cadre', 'super_admin']}>
                <AdminMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute roles={['cadre', 'super_admin']}>
                <AdminLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/comptes"
            element={
              <ProtectedRoute roles={['super_admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compte"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
