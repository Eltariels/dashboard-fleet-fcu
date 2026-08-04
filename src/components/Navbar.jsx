import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

const PENDING_CHECK_INTERVAL = 30000;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      setPendingCount(0);
      return;
    }

    let active = true;
    async function checkPending() {
      try {
        const users = await api.get('/users');
        if (active) setPendingCount(users.filter((u) => u.status === 'pending').length);
      } catch {
        // ignore, on reessaiera au prochain intervalle
      }
    }

    checkPending();
    const interval = setInterval(checkPending, PENDING_CHECK_INTERVAL);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) {
    return (
      <header className="navbar">
        <div className="navbar-brand">FCU — Fleet</div>
        <nav className="navbar-links">
          <NavLink to="/" end>Flotte FCU</NavLink>
        </nav>
        <div className="navbar-user">
          <NavLink to="/login" className="navbar-login-link">Connexion cadre</NavLink>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">FCU — Fleet</div>
      <nav className="navbar-links">
        <NavLink to="/" end>Flotte FCU</NavLink>
        <NavLink to="/admin/membres">Membres</NavLink>
        <NavLink to="/admin/logs">Logs</NavLink>
        {user.role === 'super_admin' && (
          <NavLink to="/admin/comptes">
            Comptes
            {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
          </NavLink>
        )}
        <NavLink to="/compte">Mon compte</NavLink>
      </nav>
      <div className="navbar-user">
        <span className="navbar-pseudo">{user.pseudo}</span>
        <span className={`role-badge role-${user.role}`}>{user.role}</span>
        <button onClick={handleLogout}>Deconnexion</button>
      </div>
    </header>
  );
}
