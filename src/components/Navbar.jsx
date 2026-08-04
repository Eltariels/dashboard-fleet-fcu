import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
