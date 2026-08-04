import { useEffect, useState } from 'react';
import { DIVISIONS } from '../divisions.js';
import { manufacturerLabel } from '../manufacturers.js';
import { BRANCH_ROLES } from '../roles.js';
import { api } from '../api/client.js';

function toList(str) {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MemberFormModal({ member, onSave, onClose }) {
  const [pseudo, setPseudo] = useState(member?.pseudo || '');
  const [competences, setCompetences] = useState((member?.competences || []).join(', '));
  const [vaisseaux, setVaisseaux] = useState(member?.vaisseaux || []);
  const [ships, setShips] = useState([]);
  const [roles, setRoles] = useState(member?.roles || []);
  const [commentaire, setCommentaire] = useState(member?.commentaire || '');
  const [divisionActuelle, setDivisionActuelle] = useState(member?.divisionActuelle || '');
  const [divisionSouhaitee, setDivisionSouhaitee] = useState(member?.divisionSouhaitee || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/ships').then(setShips).catch(() => setShips([]));
  }, []);

  function toggleShip(nom) {
    setVaisseaux((prev) => (prev.includes(nom) ? prev.filter((v) => v !== nom) : [...prev, nom]));
  }

  function toggleRole(code) {
    setRoles((prev) => (prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pseudo.trim()) {
      setError('Le pseudo est requis');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSave({
        pseudo: pseudo.trim(),
        competences: toList(competences),
        vaisseaux,
        roles,
        commentaire: commentaire.trim(),
        divisionActuelle: divisionActuelle || null,
        divisionSouhaitee: divisionSouhaitee || null,
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{member ? 'Modifier le membre' : 'Ajouter un membre'}</h2>

        <label>
          Pseudo
          <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoFocus required />
        </label>

        <label>
          Competences (separees par des virgules)
          <input value={competences} onChange={(e) => setCompetences(e.target.value)} placeholder="pilote, gunner, medic" />
        </label>

        <div className="ship-checklist-field">
          <span className="member-field-label">Role au sein de la branche</span>
          <div className="role-checklist">
            {BRANCH_ROLES.map((r) => (
              <label key={r.code} className="ship-checklist-row">
                <input type="checkbox" checked={roles.includes(r.code)} onChange={() => toggleRole(r.code)} />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div className="ship-checklist-field">
          <span className="member-field-label">Vaisseaux possedes</span>
          {ships.length === 0 ? (
            <p className="empty-state">Aucun vaisseau dans le catalogue pour l'instant.</p>
          ) : (
            <div className="ship-checklist">
              {ships.map((s) => (
                <label key={s._id} className="ship-checklist-row">
                  <input
                    type="checkbox"
                    checked={vaisseaux.includes(s.nom)}
                    onChange={() => toggleShip(s.nom)}
                  />
                  {s.nom} <span className="ship-checklist-manufacturer">({manufacturerLabel(s.manufacturer)})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <label>
          Commentaire
          <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={3} />
        </label>

        <div className="form-row">
          <label>
            Division actuelle
            <select value={divisionActuelle} onChange={(e) => setDivisionActuelle(e.target.value)}>
              <option value="">Aucune (Fleet classique)</option>
              {DIVISIONS.map((d) => (
                <option key={d.slug} value={d.slug}>{d.nom}</option>
              ))}
            </select>
          </label>

          <label>
            Division souhaitee
            <select value={divisionSouhaitee} onChange={(e) => setDivisionSouhaitee(e.target.value)}>
              <option value="">Aucune</option>
              {DIVISIONS.map((d) => (
                <option key={d.slug} value={d.slug}>{d.nom}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Annuler</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}
