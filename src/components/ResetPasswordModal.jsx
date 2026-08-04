import { useState } from 'react';

export default function ResetPasswordModal({ account, onSave, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caracteres');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSave(newPassword);
      setDone(true);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card modal-small" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Reinitialiser le mot de passe</h2>
        <p>Compte : <strong>{account.pseudo}</strong></p>

        {done ? (
          <>
            <p className="form-success">
              Nouveau mot de passe defini : <strong>{newPassword}</strong>
              <br />
              Communique-le au membre maintenant, il ne sera plus jamais affiche.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Fermer</button>
            </div>
          </>
        ) : (
          <>
            <label>
              Nouveau mot de passe
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onClose}>Annuler</button>
              <button type="submit" disabled={submitting}>{submitting ? 'Envoi...' : 'Reinitialiser'}</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
