import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MANUFACTURERS } from '../manufacturers.js';
import ShipCard from '../components/ShipCard.jsx';
import ShipFormModal from '../components/ShipFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function ShipsPage() {
  const { user } = useAuth();
  const canManage = user.role === 'cadre' || user.role === 'super_admin';

  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(null); // null = tous les fabricants
  const [editingShip, setEditingShip] = useState(undefined);
  const [deletingShip, setDeletingShip] = useState(null);

  async function reload() {
    setShips(await api.get('/ships'));
  }

  useEffect(() => {
    reload()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(payload) {
    if (editingShip) {
      await api.put(`/ships/${editingShip._id}`, payload);
    } else {
      await api.post('/ships', payload);
    }
    setEditingShip(undefined);
    await reload();
  }

  async function handleDeleteConfirmed() {
    await api.del(`/ships/${deletingShip._id}`);
    setDeletingShip(null);
    await reload();
  }

  if (loading) return <div className="page-loading">Chargement...</div>;
  if (error) return <p className="form-error">{error}</p>;

  const visibleShips = filter ? ships.filter((s) => s.manufacturer === filter) : ships;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Vaisseaux de la Fleet</h1>
        {canManage && <button onClick={() => setEditingShip(null)}>+ Ajouter un vaisseau</button>}
      </div>

      <div className="manufacturer-filter">
        <button
          className={filter === null ? 'filter-active' : ''}
          onClick={() => setFilter(null)}
        >
          Tous les fabricants
        </button>
        {MANUFACTURERS.map((m) => (
          <button
            key={m.code}
            className={filter === m.code ? 'filter-active' : ''}
            onClick={() => setFilter(m.code)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {visibleShips.length === 0 ? (
        <p className="empty-state">Aucun vaisseau pour l'instant.</p>
      ) : (
        <div className="ship-grid">
          {visibleShips.map((ship) => (
            <ShipCard
              key={ship._id}
              ship={ship}
              canManage={canManage}
              onEdit={setEditingShip}
              onDelete={setDeletingShip}
            />
          ))}
        </div>
      )}

      {editingShip !== undefined && (
        <ShipFormModal ship={editingShip} onSave={handleSave} onClose={() => setEditingShip(undefined)} />
      )}

      {deletingShip && (
        <ConfirmDialog
          title="Retirer ce vaisseau ?"
          message={`${deletingShip.nom} sera definitivement retire du catalogue.`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingShip(null)}
        />
      )}
    </div>
  );
}
