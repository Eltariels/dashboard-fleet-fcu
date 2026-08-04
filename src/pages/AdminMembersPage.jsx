import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { DIVISIONS } from '../divisions.js';
import DivisionSection from '../components/DivisionSection.jsx';
import MemberFormModal from '../components/MemberFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMember, setEditingMember] = useState(undefined); // undefined = closed, null = new
  const [deletingMember, setDeletingMember] = useState(null);

  async function reload() {
    const [m, d] = await Promise.all([api.get('/members'), api.get('/divisions')]);
    setMembers(m);
    setDivisions(d);
  }

  useEffect(() => {
    reload()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(payload) {
    if (editingMember) {
      await api.put(`/members/${editingMember._id}`, payload);
    } else {
      await api.post('/members', payload);
    }
    setEditingMember(undefined);
    await reload();
  }

  async function handleDeleteConfirmed() {
    await api.del(`/members/${deletingMember._id}`);
    setDeletingMember(null);
    await reload();
  }

  async function handleLeadershipChange(divisionId, field, memberId) {
    await api.put(`/divisions/${divisionId}`, { [field]: memberId || null });
    await reload();
  }

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (error) return <p className="form-error">{error}</p>;

  const sansDivision = members.filter((m) => !m.divisionActuelle);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Gestion des membres Fleet</h1>
        <button onClick={() => setEditingMember(null)}>+ Ajouter un membre</button>
      </div>

      <section className="leadership-panel">
        <h2>Responsables de division</h2>
        <div className="leadership-grid">
          {divisions.map((div) => (
            <div key={div._id} className="leadership-card">
              <h3>{div.nom}</h3>
              <label>
                Responsable
                <select
                  value={div.responsableMemberId?._id || ''}
                  onChange={(e) => handleLeadershipChange(div._id, 'responsableMemberId', e.target.value)}
                >
                  <option value="">—</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.pseudo}</option>
                  ))}
                </select>
              </label>
              <label>
                Second
                <select
                  value={div.secondMemberId?._id || ''}
                  onChange={(e) => handleLeadershipChange(div._id, 'secondMemberId', e.target.value)}
                >
                  <option value="">—</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.pseudo}</option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </section>

      {DIVISIONS.map((division) => (
        <DivisionSection
          key={division.slug}
          division={division}
          members={members.filter((m) => m.divisionActuelle === division.slug)}
          responsable={divisions.find((d) => d.slug === division.slug)?.responsableMemberId}
          second={divisions.find((d) => d.slug === division.slug)?.secondMemberId}
          canManage
          onEdit={setEditingMember}
          onDelete={setDeletingMember}
        />
      ))}

      <DivisionSection
        division={null}
        members={sansDivision}
        canManage
        onEdit={setEditingMember}
        onDelete={setDeletingMember}
      />

      {editingMember !== undefined && (
        <MemberFormModal member={editingMember} onSave={handleSave} onClose={() => setEditingMember(undefined)} />
      )}

      {deletingMember && (
        <ConfirmDialog
          title="Supprimer ce membre ?"
          message={`La fiche de ${deletingMember.pseudo} sera definitivement supprimee.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingMember(null)}
        />
      )}
    </div>
  );
}
