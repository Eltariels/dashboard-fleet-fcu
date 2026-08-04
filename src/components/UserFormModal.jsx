import { useState } from 'react';

const ROLES = [
  { value: 'lecteur', label: 'Lecteur (lecture seule)' },
  { value: 'cadre', label: 'Cadre (admin membres)' },
  { value: 'super_admin', label: 'Super admin' },
];

export default function UserFormModal({ account, onSave, onClose }) {
  const [pseudo, setPseudo] = useState(account?.pseudo || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(account?.role || 'lecteur');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pseudo.trim()) {
      setError('Le pseudo est requis');
      return;
    }
    if (!account && password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (account) {
        await onSave({ pseudo: pseudo.trim(), role });
      } else {
        await onSave({ pseudo: pseudo.trim(), password, role });
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{account ? 'Modifier le compte' : 'Creer un compte'}</h2>

        <label>
          Pseudo
          <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoFocus required />
        </label>

        {!account && (
          <label>
            Mot de passe initial
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        )}

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Annuler</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}
