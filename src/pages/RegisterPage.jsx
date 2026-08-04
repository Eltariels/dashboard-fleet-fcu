import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function RegisterPage() {
  const { user } = useAuth();
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('La confirmation ne correspond pas au mot de passe');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/register', { pseudo, password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>FCU — Fleet</h1>
          <p className="login-subtitle">Demande envoyee</p>
          <p className="form-success">
            Ta demande de compte cadre pour <strong>{pseudo}</strong> a bien ete enregistree. Un super admin doit la
            valider avant que tu puisses te connecter.
          </p>
          <Link to="/login">Retour a la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>FCU — Fleet</h1>
        <p className="login-subtitle">Demande de compte cadre</p>

        <label>
          Pseudo
          <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoFocus required />
        </label>

        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <label>
          Confirmer le mot de passe
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Envoi...' : 'Envoyer la demande'}
        </button>

        <p className="login-footer">
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
