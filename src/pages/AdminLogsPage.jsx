import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const ACTION_LABELS = {
  LOGIN: 'Connexion',
  LOGOUT: 'Deconnexion',
  CHANGE_PASSWORD: 'Changement mot de passe',
  CREATE_MEMBER: 'Creation membre',
  UPDATE_MEMBER: 'Modification membre',
  DELETE_MEMBER: 'Suppression membre',
  CHANGE_DIVISION: 'Changement de division',
  UPDATE_DIVISION: 'Modification division',
  CREATE_USER: 'Creation compte',
  UPDATE_USER: 'Modification compte',
  CHANGE_ROLE: 'Changement de role',
  RESET_PASSWORD: 'Reinitialisation mot de passe',
  DELETE_USER: 'Suppression compte',
};

export default function AdminLogsPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/logs?page=${page}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [page]);

  if (error) return <p className="form-error">{error}</p>;
  if (!data) return <div className="page-loading">Chargement...</div>;

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="admin-page">
      <h1>Journal d'activite</h1>
      <p className="logs-subtitle">Chaque action de mutation (connexion, creation, modification, suppression...) est tracee ici.</p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Date / heure</th>
            <th>Compte</th>
            <th>Role</th>
            <th>Action</th>
            <th>Cible</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {data.logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
              <td>{log.accountPseudo}</td>
              <td><span className={`role-badge role-${log.role}`}>{log.role}</span></td>
              <td>{ACTION_LABELS[log.action] || log.action}</td>
              <td>{log.cible}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Precedent</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
      </div>
    </div>
  );
}
