import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserFormModal from '../components/UserFormModal.jsx';
import ResetPasswordModal from '../components/ResetPasswordModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(undefined);
  const [resettingUser, setResettingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  async function reload() {
    setUsers(await api.get('/users'));
  }

  useEffect(() => {
    reload()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(payload) {
    if (editingUser) {
      await api.put(`/users/${editingUser._id}`, payload);
    } else {
      await api.post('/users', payload);
    }
    setEditingUser(undefined);
    await reload();
  }

  async function handleResetPassword(newPassword) {
    await api.post(`/users/${resettingUser._id}/reset-password`, { newPassword });
  }

  async function handleValidate(u) {
    await api.post(`/users/${u._id}/validate`);
    await reload();
  }

  async function handleDeleteConfirmed() {
    await api.del(`/users/${deletingUser._id}`);
    setDeletingUser(null);
    await reload();
  }

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Gestion des comptes</h1>
        <button onClick={() => setEditingUser(null)}>+ Creer un compte</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Pseudo</th>
            <th>Role</th>
            <th>Statut</th>
            <th>Cree le</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.pseudo}</td>
              <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
              <td>
                {u.status === 'pending' ? (
                  <span className="status-badge status-pending">En attente</span>
                ) : (
                  <span className="status-badge status-active">Actif</span>
                )}
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
              <td className="table-actions">
                {u.status === 'pending' && <button onClick={() => handleValidate(u)}>Valider</button>}
                <button onClick={() => setEditingUser(u)}>Modifier</button>
                <button onClick={() => setResettingUser(u)}>Reinit. mdp</button>
                <button
                  className="danger"
                  disabled={u._id === currentUser.id}
                  onClick={() => setDeletingUser(u)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser !== undefined && (
        <UserFormModal account={editingUser} onSave={handleSave} onClose={() => setEditingUser(undefined)} />
      )}

      {resettingUser && (
        <ResetPasswordModal account={resettingUser} onSave={handleResetPassword} onClose={() => setResettingUser(null)} />
      )}

      {deletingUser && (
        <ConfirmDialog
          title="Supprimer ce compte ?"
          message={`Le compte ${deletingUser.pseudo} sera definitivement supprime.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
