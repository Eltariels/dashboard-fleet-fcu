import { useState } from 'react';
import { DIVISIONS } from '../divisions.js';

function toList(str) {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MemberFormModal({ member, onSave, onClose }) {
  const [pseudo, setPseudo] = useState(member?.pseudo || '');
  const [competences, setCompetences] = useState((member?.competences || []).join(', '));
  const [vaisseaux, setVaisseaux] = useState((member?.vaisseaux || []).join(', '));
  const [commentaire, setCommentaire] = useState(member?.commentaire || '');
  const [divisionActuelle, setDivisionActuelle] = useState(member?.divisionActuelle || '');
  const [divisionSouhaitee, setDivisionSouhaitee] = useState(member?.divisionSouhaitee || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        vaisseaux: toList(vaisseaux),
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

        <label>
          Vaisseaux possedes (separes par des virgules)
          <input value={vaisseaux} onChange={(e) => setVaisseaux(e.target.value)} placeholder="Constellation, Cutlass" />
        </label>

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
