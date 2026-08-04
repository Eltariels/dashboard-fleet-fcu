import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const canManage = user.role === 'cadre' || user.role === 'super_admin';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">FCU — Fleet</div>
      <nav className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/vaisseaux">Vaisseaux</NavLink>
        {canManage && <NavLink to="/admin/membres">Membres</NavLink>}
        {canManage && <NavLink to="/admin/logs">Logs</NavLink>}
        {user.role === 'super_admin' && <NavLink to="/admin/comptes">Comptes</NavLink>}
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
